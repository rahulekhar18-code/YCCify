import React, { useState, useEffect } from 'react';
import { Users, Search, GraduationCap, Mail, ShieldCheck } from 'lucide-react';
import api from '@yccify/api';
import { UserProfile } from '@yccify/types';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin
      .getStudents()
      .then((data) => setStudents(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.branchName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Registered students and autonomous roll numbers at YCCE Nagpur
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, roll no, or branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading student directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4 sm:px-6">Student</th>
                  <th className="p-4 sm:px-6">Roll Number</th>
                  <th className="p-4 sm:px-6">Branch</th>
                  <th className="p-4 sm:px-6">Semester</th>
                  <th className="p-4 sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 sm:px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={s.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 sm:px-6 font-mono font-bold text-brand-blue">
                      {s.rollNumber || 'IT2022045'}
                    </td>
                    <td className="p-4 sm:px-6 text-slate-700 font-medium">
                      {s.branchName || 'Information Technology'}
                    </td>
                    <td className="p-4 sm:px-6 text-slate-600">Semester {s.semesterNumber || 7}</td>
                    <td className="p-4 sm:px-6">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase">
                        Enrolled
                      </span>
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

