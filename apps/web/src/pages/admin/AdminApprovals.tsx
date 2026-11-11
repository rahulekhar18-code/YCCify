import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  AlertCircle,
  FileText,
  Clock,
  MessageSquare,
  X,
} from 'lucide-react';
import api from '@yccify/api';
import { UploadApproval } from '@yccify/types';

export const AdminApprovals: React.FC = () => {
  const [approvals, setApprovals] = useState<UploadApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  // Rejection Modal
  const [rejectModalAppId, setRejectModalAppId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadApprovals = async () => {
    try {
      const data = await api.admin.getApprovals();
      setApprovals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.admin.reviewApproval(id, 'approved', 'Verified against YCCE autonomous curriculum.');
      await loadApprovals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalAppId) return;

    try {
      await api.admin.reviewApproval(
        rejectModalAppId,
        'rejected',
        rejectionReason || 'Does not adhere to syllabus standards or file formatting guidelines.'
      );
      setRejectModalAppId(null);
      setRejectionReason('');
      await loadApprovals();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = approvals.filter((a) => (filter === 'all' ? true : a.status === filter));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Upload Approvals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, preview, and verify community submissions before publishing to the course repository
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === s
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Approvals Queue */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading approvals queue...</div>
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => {
              const res = item.resource;
              return (
                <div
                  key={item.id}
                  className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-slate-50/70 -mx-4 px-4 rounded-2xl transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100 font-bold text-xs">
                      PDF
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-slate-900">{res?.title}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            item.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : item.status === 'rejected'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-700">{res?.courseName}</span>
                        <span>•</span>
                        <span className="uppercase text-brand-blue font-bold">{res?.category}</span>
                        <span>•</span>
                        <span>Submitted by {res?.uploaderName || 'Student'}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>

                      {item.remarks && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-xl mt-2 border border-slate-100">
                          Note: {item.remarks}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                    <Link
                      to={`/preview/${item.resourceId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-brand-blue hover:border-brand-blue text-xs font-bold shadow-sm transition-all"
                      title="Preview Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </Link>

                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={() => setRejectModalAppId(item.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 space-y-2">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">No {filter} items in queue</div>
            <p className="text-xs">All submitted student uploads have been processed.</p>
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectModalAppId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Provide Rejection Feedback</h3>
              <button
                onClick={() => setRejectModalAppId(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Explain why this resource cannot be published so the student contributor can revise it.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Missing Unit 6 numerical solution derivations or formatting is blurry."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectModalAppId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm"
                >
                  Submit Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

