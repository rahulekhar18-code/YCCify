import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Brain,
  Cloud,
  Infinity as InfinityIcon,
  ShieldCheck,
  Briefcase,
  BookOpen,
  ArrowRight,
  Search,
  Users,
} from 'lucide-react';
import api from '@yccify/api';
import { Course } from '@yccify/types';

export const CourseListPage: React.FC = () => {
  const { branchCode, semNum } = useParams<{ branchCode: string; semNum: string }>();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const branches = await api.academic.getBranches();
        const branch = branches.find((b) => b.code.toLowerCase() === branchCode?.toLowerCase());
        if (branch) {
          const list = await api.academic.getCourses({
            branchId: branch.id,
            semesterNumber: Number(semNum),
          });
          setCourses(list);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [branchCode, semNum]);

  const getCourseIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('machine') || n.includes('intelligence')) return Brain;
    if (n.includes('cloud')) return Cloud;
    if (n.includes('devops')) return InfinityIcon;
    if (n.includes('security')) return ShieldCheck;
    if (n.includes('project') || n.includes('management')) return Briefcase;
    return BookOpen;
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.facultyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation matching Reference */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <Link to="/explore" className="hover:text-brand-blue">
            Explore
          </Link>
          <span>›</span>
          <Link to={`/explore/${branchCode?.toLowerCase()}`} className="hover:text-brand-blue">
            {branchCode?.toUpperCase()} Department
          </Link>
          <span>›</span>
          <span className="text-slate-700">Semester {semNum}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Semester {semNum} – Courses
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {courses.length} Courses Available for {branchCode?.toUpperCase()}
            </p>
          </div>

          {/* Search bar inside course page */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search course or professor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            />
          </div>
        </div>
      </div>

      {/* Course Cards List matching Desktop Reference */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading courses...</div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCourses.map((c) => {
            const Icon = getCourseIcon(c.name);
            return (
              <div
                key={c.id}
                onClick={() =>
                  navigate(
                    `/explore/${branchCode?.toLowerCase()}/sem/${semNum}/course/${c.id}`
                  )
                }
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-brand-blue/40 transition-all cursor-pointer group flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-blue transition-colors line-clamp-1">
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                      <span className="font-bold text-slate-700">{c.code}</span>
                      <span>•</span>
                      <span>{c.facultyName || 'Department Faculty'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                    {c.resourceCount?.total ?? 0} {(c.resourceCount?.total ?? 0) === 1 ? 'File' : 'Files'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 group-hover:bg-brand-blue group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm">
          No courses found matching "{searchTerm}".
        </div>
      )}
    </div>
  );
};

