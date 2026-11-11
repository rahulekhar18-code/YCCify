import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, BookOpen, GraduationCap, Building2 } from 'lucide-react';
import api from '@yccify/api';
import { Faculty } from '@yccify/types';

export const FacultyDirectoryPage: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.academic
      .getFaculty()
      .then((data) => setFaculty(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredFaculty = faculty.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Connect with YCCE professors, department heads, and course instructors
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
          />
        </div>
      </div>

      {/* Faculty Cards Grid matching Mobile & Web Reference */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading faculty directory...</div>
      ) : filteredFaculty.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-brand-blue/30 transition-all flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={f.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={f.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-brand-blue transition-all"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                      {f.name}
                    </h3>
                    <p className="text-xs font-semibold text-brand-blue mt-0.5">
                      {f.designation}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {f.department}
                    </p>
                  </div>
                </div>

                {f.specialization && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <span className="font-bold text-slate-800">Specialization: </span>
                    {f.specialization}
                  </div>
                )}
              </div>

              {/* Contact Actions matching Screenshot */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`mailto:${f.email}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-50 text-brand-blue hover:bg-blue-100 text-xs font-bold transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>

                {f.phone && (
                  <a
                    href={`tel:${f.phone}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Office</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm">
          No faculty members found matching "{searchTerm}".
        </div>
      )}
    </div>
  );
};

