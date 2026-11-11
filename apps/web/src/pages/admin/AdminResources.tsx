import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Trash2, Eye, Download, Search, CheckCircle } from 'lucide-react';
import api from '@yccify/api';
import { Resource } from '@yccify/types';

export const AdminResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadResources = async () => {
    try {
      const data = await api.resources.getResources({ status: 'all' });
      setResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Permanently delete this resource and its physical files?')) {
      try {
        await api.resources.deleteResource(id);
        await loadResources();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filtered = resources.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.uploaderName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resource Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and moderate all lecture notes, PYQs, and assignments across YCCE departments
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resource title or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <Link
            to="/admin/semesters"
            className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold whitespace-nowrap shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>+ Upload to Semester</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading resources...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4 sm:px-6">Resource Title</th>
                  <th className="p-4 sm:px-6">Course</th>
                  <th className="p-4 sm:px-6">Category</th>
                  <th className="p-4 sm:px-6">Uploader</th>
                  <th className="p-4 sm:px-6">Status</th>
                  <th className="p-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 sm:px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="line-clamp-1">{r.title}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:px-6 text-slate-700 font-medium">{r.courseName}</td>
                    <td className="p-4 sm:px-6 uppercase font-bold text-brand-blue">{r.category}</td>
                    <td className="p-4 sm:px-6 text-slate-600">{r.uploaderName || 'Student'}</td>
                    <td className="p-4 sm:px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          r.approvalStatus === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : r.approvalStatus === 'rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {r.approvalStatus}
                      </span>
                    </td>
                    <td className="p-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/preview/${r.id}`}
                          className="p-1.5 text-slate-400 hover:text-brand-blue rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

