import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import api from '@yccify/api';
import { Branch } from '@yccify/types';

export const AdminBranches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [icon, setIcon] = useState('Layers');
  const [semestersCount, setSemestersCount] = useState(8);
  const [error, setError] = useState<string | null>(null);

  const loadBranches = async () => {
    try {
      const data = await api.academic.getBranches();
      setBranches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      setError('Please provide branch name and code.');
      return;
    }
    setError(null);
    try {
      await api.academic.addBranch({
        name,
        code,
        icon,
        semestersCount,
      });
      setShowModal(false);
      setName('');
      setCode('');
      await loadBranches();
    } catch (err: any) {
      setError(err.message || 'Failed to create branch');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to deactivate this branch?')) {
      try {
        await api.academic.deleteBranch(id);
        await loadBranches();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Branch Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure academic departments and degree specializations at YCCE
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-brand-blue/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Branch</span>
        </button>
      </div>

      {/* Branches Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading departments...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4 sm:px-6">Department Name</th>
                  <th className="p-4 sm:px-6">Code</th>
                  <th className="p-4 sm:px-6">Semesters</th>
                  <th className="p-4 sm:px-6">Courses</th>
                  <th className="p-4 sm:px-6">Status</th>
                  <th className="p-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 sm:px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold">
                          {b.code[0]}
                        </div>
                        <span>{b.name}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:px-6 font-semibold text-slate-700">{b.code}</td>
                    <td className="p-4 sm:px-6 text-slate-600">{b.semestersCount ?? 0} {(b.semestersCount ?? 0) === 1 ? 'Semester' : 'Semesters'}</td>
                    <td className="p-4 sm:px-6 text-slate-600">{b.coursesCount ?? 0} {(b.coursesCount ?? 0) === 1 ? 'Course' : 'Courses'}</td>
                    <td className="p-4 sm:px-6">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase">
                        Active
                      </span>
                    </td>
                    <td className="p-4 sm:px-6 text-right">
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Deactivate Branch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Branch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Academic Branch</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Branch Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. AIDS"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Semesters Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={semestersCount}
                    onChange={(e) => setSemestersCount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-brand-hover shadow-sm"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

