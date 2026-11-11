import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit, AlertCircle, X, Search } from 'lucide-react';
import api from '@yccify/api';
import { Course, Branch, Faculty } from '@yccify/types';

export const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [branchId, setBranchId] = useState('');
  const [semesterNumber, setSemesterNumber] = useState(7);
  const [credits, setCredits] = useState(4);
  const [facultyId, setFacultyId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadAll = async () => {
    try {
      const [cList, bList, fList] = await Promise.all([
        api.academic.getCourses(),
        api.academic.getBranches(),
        api.academic.getFaculty(),
      ]);
      setCourses(cList);
      setBranches(bList);
      setFaculty(fList);
      if (bList.length > 0 && !branchId) setBranchId(bList[0].id);
      if (fList.length > 0 && !facultyId) setFacultyId(fList[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !branchId) {
      setError('Course name, code and branch are required.');
      return;
    }

    try {
      // Find semester ID
      const sems = await api.academic.getSemesters(branchId);
      const targetSem = sems.find((s) => s.semesterNumber === Number(semesterNumber));
      const semId = targetSem ? targetSem.id : `s-it-${semesterNumber}`;

      await api.academic.addCourse({
        name,
        code,
        branchId,
        semesterId: semId,
        credits,
        facultyId: facultyId || undefined,
        description,
      });

      setShowModal(false);
      setName('');
      setCode('');
      setDescription('');
      await loadAll();
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deactivate this course?')) {
      try {
        await api.academic.deleteCourse(id);
        await loadAll();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filtered = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.facultyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Course Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Curriculum, credit structure, and faculty assignments across YCCE engineering degrees
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-brand-blue/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search course code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <span className="text-xs text-slate-400 font-bold">{filtered.length} Courses Listed</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading courses...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4 sm:px-6">Course Name</th>
                  <th className="p-4 sm:px-6">Code</th>
                  <th className="p-4 sm:px-6">Credits</th>
                  <th className="p-4 sm:px-6">Assigned Faculty</th>
                  <th className="p-4 sm:px-6">Resources</th>
                  <th className="p-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 sm:px-6 font-bold text-slate-900">{c.name}</td>
                    <td className="p-4 sm:px-6 font-bold text-brand-blue">{c.code}</td>
                    <td className="p-4 sm:px-6 text-slate-600">{c.credits} Credits</td>
                    <td className="p-4 sm:px-6 font-medium text-slate-700">
                      {c.facultyName || 'Department Faculty'}
                    </td>
                    <td className="p-4 sm:px-6 text-slate-500">
                      {c.resourceCount?.total ?? 0} {(c.resourceCount?.total ?? 0) === 1 ? 'File' : 'Files'}
                    </td>
                    <td className="p-4 sm:px-6 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Deactivate Course"
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

      {/* Add Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Academic Course</h3>
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
                  Course Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Distributed Database Systems"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. IT706"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Credits</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Branch</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Semester</label>
                  <select
                    value={semesterNumber}
                    onChange={(e) => setSemesterNumber(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Assign Faculty Instructor
                </label>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.designation} • {f.department})
                    </option>
                  ))}
                </select>
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
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

