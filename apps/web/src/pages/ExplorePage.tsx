import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Code, Radio, Settings, Building, ArrowRight, Layers, GraduationCap } from 'lucide-react';
import api from '@yccify/api';
import { Branch } from '@yccify/types';

export const ExplorePage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.academic
      .getBranches()
      .then((b) => setBranches(b))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getBranchIcon = (code: string) => {
    switch (code) {
      case 'IT':
        return Cpu;
      case 'CSE':
        return Code;
      case 'ETC':
        return Radio;
      case 'ME':
        return Settings;
      case 'CE':
        return Building;
      default:
        return Layers;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <Link to="/dashboard" className="hover:text-brand-blue">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-700">Explore Departments</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Select Branch</h1>
        <p className="text-sm text-slate-500 mt-1">
          Choose your engineering department to explore academic semesters and courses
        </p>
      </div>

      {/* Branches List matching Mobile & Web UI Showcase */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading branches...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((b) => {
            const Icon = getBranchIcon(b.code);
            return (
              <div
                key={b.id}
                onClick={() => navigate(`/explore/${b.code.toLowerCase()}`)}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-brand-blue transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {b.code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                      {b.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {b.code} • {b.semestersCount ?? 0} {(b.semestersCount ?? 0) === 1 ? 'Semester' : 'Semesters'} • {b.coursesCount ?? 0} {(b.coursesCount ?? 0) === 1 ? 'Course' : 'Courses'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-blue group-hover:text-brand-hover">
                  <span>Explore Department</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

