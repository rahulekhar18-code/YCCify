import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  X,
  Send,
} from 'lucide-react';
import api from '@yccify/api';
import { StudentReview } from '@yccify/types';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<StudentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reject Modal State
  const [rejectModalReview, setRejectModalReview] = useState<StudentReview | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await api.reviews.getAdminReviews('all');
      setReviews(data);
    } catch (err: any) {
      console.error('Failed to load admin reviews:', err);
      setActionMessage({ type: 'error', text: err.message || 'Failed to fetch reviews.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setActionLoadingId(id);
      setActionMessage(null);
      await api.reviews.approveReview(id);
      setActionMessage({ type: 'success', text: 'Review approved and published to the live landing page!' });
      await loadReviews();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to approve review.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenRejectModal = (review: StudentReview) => {
    setRejectModalReview(review);
    setRejectReason('');
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalReview) return;

    try {
      setActionLoadingId(rejectModalReview.id);
      await api.reviews.rejectReview(
        rejectModalReview.id,
        rejectReason || 'Does not adhere to community review guidelines.'
      );
      setRejectModalReview(null);
      setRejectReason('');
      setActionMessage({ type: 'success', text: 'Review rejected successfully.' });
      await loadReviews();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to reject review.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the review from "${name}"?`)) {
      return;
    }
    try {
      setActionLoadingId(id);
      await api.reviews.deleteReview(id);
      setActionMessage({ type: 'success', text: 'Review permanently deleted.' });
      await loadReviews();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to delete review.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Stats calculation
  const totalCount = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === 'pending' || (!r.isApproved && r.status !== 'rejected')).length;
  const approvedCount = reviews.filter((r) => r.isApproved || r.status === 'approved').length;
  const rejectedCount = reviews.filter((r) => r.status === 'rejected').length;

  // Filtered List
  const filteredReviews = reviews.filter((r) => {
    // Status Filter
    if (filter === 'pending') {
      if (r.status !== 'pending' && (r.isApproved || r.status === 'rejected')) return false;
    } else if (filter === 'approved') {
      if (!r.isApproved && r.status !== 'approved') return false;
    } else if (filter === 'rejected') {
      if (r.status !== 'rejected') return false;
    }

    // Rating Filter
    if (ratingFilter !== 'all' && r.rating !== ratingFilter) {
      return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.studentName.toLowerCase().includes(q);
      const matchComment = r.comment.toLowerCase().includes(q);
      const matchBranch = (r.branchName || r.branchCode || '').toLowerCase().includes(q);
      const matchBatch = (r.batchYear || '').toLowerCase().includes(q);
      const matchEmail = (r.studentEmail || '').toLowerCase().includes(q);
      return matchName || matchComment || matchBranch || matchBatch || matchEmail;
    }

    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Reviews Moderation</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Admin Verified
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review student feedback before publishing to the live YCCify homepage. Only admin-approved reviews appear in public testimonials.
          </p>
        </div>

        <button
          onClick={loadReviews}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-semibold transition-all ${actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
        >
          <div className="flex items-center gap-2.5">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="p-1 hover:bg-black/5 rounded-lg text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setFilter('all')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${filter === 'all'
              ? 'bg-blue-50/70 border-brand-blue ring-2 ring-brand-blue/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reviews</span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalCount}</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Submitted by YCCE students</p>
        </div>

        <div
          onClick={() => setFilter('pending')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${filter === 'pending'
              ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200/80 hover:border-amber-200'
            }`}
        >
          {pendingCount > 0 && (
            <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Approval</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2">{pendingCount}</div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Requires admin review</p>
        </div>

        <div
          onClick={() => setFilter('approved')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${filter === 'approved'
              ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200/80 hover:border-emerald-200'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Live & Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-2">{approvedCount}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Visible on live landing page</p>
        </div>

        <div
          onClick={() => setFilter('rejected')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${filter === 'rejected'
              ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200/80 hover:border-rose-200'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-900 mt-2">{rejectedCount}</div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">Hidden from public view</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {(
              [
                { id: 'pending', label: 'Pending Approval', count: pendingCount },
                { id: 'approved', label: 'Published & Live', count: approvedCount },
                { id: 'rejected', label: 'Rejected', count: rejectedCount },
                { id: 'all', label: 'All Reviews', count: totalCount },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${filter === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${filter === tab.id
                      ? tab.id === 'pending'
                        ? 'bg-amber-400 text-black'
                        : 'bg-slate-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Rating Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Rating:</span>
            </div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="all">All Stars (1 - 5)</option>
              <option value={5}>★ 5 Stars Only</option>
              <option value={4}>★ 4 Stars</option>
              <option value={3}>★ 3 Stars</option>
              <option value={2}>★ 2 Stars</option>
              <option value={1}>★ 1 Star</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, department, batch, or review feedback..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-brand-blue animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Loading student reviews...</p>
          <p className="text-xs text-slate-400 mt-1">Fetching latest submissions from YCCE database</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No reviews found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {filter === 'pending'
              ? 'Awesome! There are no pending reviews in the queue waiting for approval.'
              : filter === 'approved'
                ? 'No approved reviews matching the selected filters.'
                : 'No reviews found matching your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const isApproved = review.isApproved || review.status === 'approved';
            const isPending = review.status === 'pending' || (!review.isApproved && review.status !== 'rejected');
            const isRejected = review.status === 'rejected';
            const isActionBusy = actionLoadingId === review.id;

            return (
              <div
                key={review.id}
                className={`bg-white rounded-3xl border transition-all p-5 sm:p-6 shadow-xs hover:shadow-md ${isPending
                    ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/10'
                    : isRejected
                      ? 'border-rose-200 bg-rose-50/10 opacity-80'
                      : 'border-slate-200/80'
                  }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Student Details & Review */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-blue to-cyan-500 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md shadow-brand-blue/20">
                      {review.studentName ? review.studentName.charAt(0).toUpperCase() : 'S'}
                    </div>

                    <div className="space-y-2 flex-1">
                      {/* Name, Batch & Status */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{review.studentName}</span>
                        {review.studentEmail && (
                          <span className="text-[11px] font-mono text-slate-400">({review.studentEmail})</span>
                        )}
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-semibold text-slate-600">
                          {review.branchName || review.branchCode}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {review.batchYear}
                        </span>

                        {/* Status Badge */}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending Verification
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Live on Homepage
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Rejected
                          </span>
                        )}
                      </div>

                      {/* Star Rating */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200'
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-black text-amber-600">{review.rating} / 5</span>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {review.fileName && (
                          <>
                            <span className="text-slate-300 text-xs">•</span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {review.fileName}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Comment Quote */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-sans">
                        "{review.comment}"
                      </div>

                      {/* Rejection / Reviewer Notes */}
                      {isRejected && review.rejectionReason && (
                        <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5 font-medium flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Rejection Reason: {review.rejectionReason}</span>
                        </div>
                      )}

                      {review.reviewedBy && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-slate-400" />
                          <span>
                            Moderated by {review.reviewedBy} on{' '}
                            {review.reviewedAt ? new Date(review.reviewedAt).toLocaleDateString('en-IN') : 'recently'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row md:flex-col items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {/* Approve & Publish Button */}
                    {!isApproved ? (
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={isActionBusy}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isRejected ? 'Re-approve & Publish' : 'Approve & Publish'}</span>
                      </button>
                    ) : (
                      <a
                        href="/#testimonials"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all"
                      >
                        <span>View Live</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {/* Reject Button */}
                    {!isRejected && (
                      <button
                        onClick={() => handleOpenRejectModal(review)}
                        disabled={isActionBusy}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{isApproved ? 'Unpublish' : 'Reject'}</span>
                      </button>
                    )}

                    {/* Delete Permanently */}
                    <button
                      onClick={() => handleDelete(review.id, review.studentName)}
                      disabled={isActionBusy}
                      title="Permanently Delete Review"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Reject Student Review</h3>
                  <p className="text-[11px] text-slate-500">From {rejectModalReview.studentName}</p>
                </div>
              </div>
              <button
                onClick={() => setRejectModalReview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
                "{rejectModalReview.comment}"
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Reason for Rejection</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Contains offensive language, spam, or misleading information..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalReview(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm shadow-rose-600/20 cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;

