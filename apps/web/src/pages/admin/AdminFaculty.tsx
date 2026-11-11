import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  Search,
  CheckCircle,
  GraduationCap,
  Building2,
  Sparkles,
} from 'lucide-react';
import api from '@yccify/api';
import { Faculty, Branch } from '@yccify/types';

export const AdminFaculty: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [department, setDepartment] = useState('Information Technology');
  const [specialization, setSpecialization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [branchId, setBranchId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [fList, bList] = await Promise.all([
        api.academic.getFaculty(),
        api.academic.getBranches(),
      ]);
      setFaculty(fList);
      setBranches(bList);
      if (bList.length > 0 && !branchId) setBranchId(bList[0].id);
    } catch (err) {
      console.error('Failed to load faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingFaculty(null);
    setName('');
    setDesignation('Assistant Professor');
    setDepartment('Information Technology');
    setSpecialization('');
    setEmail('');
    setPhone('+91 98220 ');
    setBranchId(branches[0]?.id || '');
    setAvatarUrl('');
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (fac: Faculty) => {
    setEditingFaculty(fac);
    setName(fac.name);
    setDesignation(fac.designation);
    setDepartment(fac.department);
    setSpecialization(fac.specialization || '');
    setEmail(fac.email);
    setPhone(fac.phone || '');
    setBranchId(fac.branchId || branches[0]?.id || '');
    setAvatarUrl(fac.avatarUrl || '');
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !department.trim()) {
      setError('Name, email, and department are required.');
      return;
    }

    setSaving(true);
    setError(null);

    const generatedAvatar =
      avatarUrl.trim() ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`;

    try {
      if (editingFaculty) {
        // UPDATE Operation (with safe fallback)
        let updated: Faculty;
        if (typeof (api.academic as any)?.updateFaculty === 'function') {
          updated = await (api.academic as any).updateFaculty(editingFaculty.id, {
            name: name.trim(),
            designation,
            department: department.trim(),
            specialization: specialization.trim() || undefined,
            email: email.trim(),
            phone: phone.trim() || undefined,
            branchId: branchId || undefined,
            avatarUrl: generatedAvatar,
          });
        } else {
          // Fallback direct endpoint call
          const token = api.getToken();
          const res = await fetch(`/api/database/faculty/${editingFaculty.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              name: name.trim(),
              designation,
              department: department.trim(),
              specialization: specialization.trim() || undefined,
              email: email.trim(),
              phone: phone.trim() || undefined,
              branchId: branchId || undefined,
              avatarUrl: generatedAvatar,
            }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || 'Update failed');
          updated = json.data;
        }

        setFaculty((prev) => prev.map((f) => (f.id === editingFaculty.id ? updated : f)));
        setSuccessMsg(`Faculty "${updated.name}" updated successfully!`);
      } else {
        // CREATE Operation
        let created: Faculty;
        if (typeof (api.academic as any)?.addFaculty === 'function') {
          created = await (api.academic as any).addFaculty({
            name: name.trim(),
            designation,
            department: department.trim(),
            specialization: specialization.trim() || undefined,
            email: email.trim(),
            phone: phone.trim() || undefined,
            branchId: branchId || undefined,
            avatarUrl: generatedAvatar,
          });
        } else {
          const token = api.getToken();
          const res = await fetch('/api/database/faculty', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              name: name.trim(),
              designation,
              department: department.trim(),
              specialization: specialization.trim() || undefined,
              email: email.trim(),
              phone: phone.trim() || undefined,
              branchId: branchId || undefined,
              avatarUrl: generatedAvatar,
            }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || 'Failed to add faculty');
          created = json.data;
        }

        setFaculty((prev) => [...prev, created]);
        setSuccessMsg(`Faculty "${created.name}" added successfully!`);
      }

      setShowModal(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (fac: Faculty) => {
    if (!confirm(`Are you sure you want to permanently delete faculty "${fac.name}"?`)) {
      return;
    }

    try {
      if (typeof (api.academic as any)?.deleteFaculty === 'function') {
        await (api.academic as any).deleteFaculty(fac.id);
      } else {
        const token = api.getToken();
        const res = await fetch(`/api/database/faculty/${fac.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Delete failed');
        }
      }
      setFaculty((prev) => prev.filter((f) => f.id !== fac.id));
      setSuccessMsg(`Faculty "${fac.name}" deleted.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert('Error deleting faculty: ' + err.message);
    }
  };

  // Distinct departments for filter tabs
  const departments = ['all', ...Array.from(new Set(faculty.map((f) => f.department).filter(Boolean)))];

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.specialization && f.specialization.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDept === 'all' || f.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-brand-blue flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Administrative Directory
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1.5">
            Faculty Directory Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, view, update, and manage professors, associate professors, and department lecturers.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-brand-blue/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Faculty Member</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-fade-in shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search & Department Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty name, specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-xs"
          />
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 sm:flex-wrap no-scrollbar">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                selectedDept === dept
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {dept === 'all' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading faculty members...</div>
      ) : filteredFaculty.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No faculty members found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search filter, or click "+ Add Faculty Member" to register a new professor.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-2 px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold shadow-sm"
          >
            + Add Faculty Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-4">
                {/* Avatar & Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={
                        f.avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(f.name)}`
                      }
                      alt={f.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 bg-slate-50 shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-brand-blue transition-colors">
                        {f.name}
                      </h3>
                      <p className="text-xs font-bold text-brand-blue mt-0.5">{f.designation}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{f.department}</p>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditModal(f)}
                      title="Edit Faculty"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-600 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(f)}
                      title="Delete Faculty"
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Specialization */}
                {f.specialization && (
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100/90 leading-relaxed">
                    <span className="font-bold text-slate-900">Specialization: </span>
                    {f.specialization}
                  </p>
                )}
              </div>

              {/* Contact Information & Footer */}
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${f.email}`} className="hover:text-brand-blue truncate font-medium">
                    {f.email}
                  </a>
                </div>
                {f.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`tel:${f.phone}`} className="hover:text-brand-blue font-medium">
                      {f.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE & EDIT FACULTY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
                  {editingFaculty ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingFaculty ? 'Edit Faculty Member' : 'Add Faculty Member'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingFaculty ? 'Update professor profile and contact details' : 'Register a new educator into YCCify'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Full Name & Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Malabika Adak"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              {/* Designation & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Designation *
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Head of Department">Head of Department (HOD)</option>
                    <option value="Lecturer">Lecturer / Adjunct Faculty</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Information Technology"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>

              {/* Branch Association */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Assigned Branch
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                >
                  <option value="">General / Applied Sciences</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="m.adak@ycce.edu"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98220 12345"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>

              {/* Specialization */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Specialization / Qualifications
                </label>
                <textarea
                  rows={2}
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Ph.D., M.Sc. in Mathematics, Calculus, Vector Analysis"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                />
              </div>

              {/* Avatar URL (optional) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Profile Picture URL (Optional)
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Leave empty for auto-generated avatar"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue text-slate-600"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-brand-blue/20 transition-all"
                >
                  {saving
                    ? 'Saving...'
                    : editingFaculty
                    ? 'Update Faculty Profile'
                    : 'Add Faculty Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
