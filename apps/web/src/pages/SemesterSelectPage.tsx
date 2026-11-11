import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Layers } from 'lucide-react';
import api from '@yccify/api';
import { Branch, Semester } from '@yccify/types';

export const SemesterSelectPage: React.FC = () => {
  const { branchCode } = useParams<{ branchCode: string }>();
  const navigate = useNavigate();

  const [branch, setBranch] = useState<Branch | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const branches = await api.academic.getBranches();
        const currentBranch = branches.find(
          (b) => b.code.toLowerCase() === branchCode?.toLowerCase()
        );
        if (currentBranch) {
          setBranch(currentBranch);
          const sems = await api.academic.getSemesters(currentBranch.id);
          setSemesters(sems);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [branchCode]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation matching Reference */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <Link to="/explore" className="hover:text-brand-blue">
            Explore
          </Link>
          <span>›</span>
          <span className="text-slate-700">{branch?.name || 'Department'}</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {branch?.name} ({branch?.code})
        </h1>
        <p className="text-sm text-slate-500 mt-1">Select a semester to view courses</p>
      </div>

      {/* Grid of Sem 1 to Sem 8 matching UI Showcase */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading semesters...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {semesters.map((sem) => {
            const isSem7 = sem.semesterNumber === 7;
            return (
              <div
                key={sem.id}
                onClick={() =>
                  navigate(`/explore/${branchCode?.toLowerCase()}/sem/${sem.semesterNumber}`)
                }
                className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSem7
                    ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/25 border-brand-blue'
                    : 'bg-white text-slate-800 border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-brand-blue/40'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isSem7 ? 'bg-white/10 text-white' : 'bg-blue-50 text-brand-blue'
                      }`}
                    >
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-xs font-extrabold ${
                        isSem7 ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      Year {Math.ceil(sem.semesterNumber / 2)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black tracking-tight">
                      Sem {sem.semesterNumber}
                    </h3>
                    <p
                      className={`text-xs mt-1 font-semibold ${
                        isSem7 ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {sem.coursesCount ?? 0} {(sem.coursesCount ?? 0) === 1 ? 'Course' : 'Courses'}
                    </p>
                  </div>
                </div>

                <div
                  className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-bold ${
                    isSem7 ? 'border-white/10 text-white' : 'border-slate-100 text-brand-blue'
                  }`}
                >
                  <span>View Courses</span>
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

