import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Layers,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Eye,
} from 'lucide-react';
import api from '@yccify/api';
import { DashboardStats, UploadApproval } from '@yccify/types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [approvals, setApprovals] = useState<UploadApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [s, appList] = await Promise.all([
        api.admin.getStats(),
        api.admin.getApprovals(),
      ]);
      setStats(s);
      setApprovals(appList.filter((a) => a.status === 'pending'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.admin.reviewApproval(id, status, status === 'approved' ? 'Verified against YCCE syllabus' : 'Incomplete documentation');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Yeshwantrao Chavan College of Engineering – Platform Overview & Approvals
        </p>
      </div>

      {/* Top 4 Stats Cards matching Screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Students</span>
            <Users className="w-5 h-5 text-brand-blue" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats?.totalStudents?.toLocaleString() || '10,240'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active Enrollments</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Branches</span>
            <Layers className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats?.totalBranches ?? 0}
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-2">
            Active Engineering Departments
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Courses</span>
            <BookOpen className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats?.totalCourses ?? 0}
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-2">
            Active Department Subjects
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Resources</span>
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats?.totalResources?.toLocaleString() ?? 0}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-brand-blue font-semibold mt-2">
            <span>Verified Lecture Files</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Uploads Chart (Left) + Pending Approvals (Right) matching UI reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Resource Uploads Chart Card matching Desktop Reference */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Resource Uploads (Last 7 Days)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily contributions across all college departments</p>
            </div>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-brand-blue">
              +18.4% this week
            </span>
          </div>

          {/* Clean High-Fidelity SVG Line Chart matching screenshot */}
          <div className="h-64 w-full pt-4">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#155EEF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#155EEF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="#E2E8F0" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="10" y="24" fill="#94A3B8" fontSize="10">200</text>
              <text x="10" y="74" fill="#94A3B8" fontSize="10">150</text>
              <text x="10" y="124" fill="#94A3B8" fontSize="10">100</text>
              <text x="15" y="174" fill="#94A3B8" fontSize="10">50</text>

              {/* Area fill */}
              <path
                d="M 50 160 Q 120 145 190 120 T 330 65 T 470 30 L 470 170 L 50 170 Z"
                fill="url(#chartGradient)"
              />

              {/* Line */}
              <path
                d="M 50 160 Q 120 145 190 120 T 330 65 T 470 30"
                fill="none"
                stroke="#155EEF"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="50" cy="160" r="4.5" fill="#155EEF" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="120" cy="145" r="4.5" fill="#155EEF" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="190" cy="120" r="4.5" fill="#155EEF" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="260" cy="95" r="4.5" fill="#155EEF" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="330" cy="65" r="4.5" fill="#155EEF" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="400" cy="45" r="4.5" fill="#155EEF" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="470" cy="30" r="5.5" fill="#155EEF" stroke="#FFFFFF" strokeWidth="2.5" />

              {/* X Axis Day Labels */}
              <text x="40" y="190" fill="#94A3B8" fontSize="10">Mon</text>
              <text x="110" y="190" fill="#94A3B8" fontSize="10">Tue</text>
              <text x="180" y="190" fill="#94A3B8" fontSize="10">Wed</text>
              <text x="250" y="190" fill="#94A3B8" fontSize="10">Thu</text>
              <text x="320" y="190" fill="#94A3B8" fontSize="10">Fri</text>
              <text x="390" y="190" fill="#94A3B8" fontSize="10">Sat</text>
              <text x="460" y="190" fill="#94A3B8" fontSize="10">Sun</text>
            </svg>
          </div>
        </div>

        {/* Pending Approvals List matching Screenshot */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Pending Approvals</h3>
              <span className="text-xs text-amber-600 font-bold">
                {approvals.length} Submissions Awaiting Sign-off
              </span>
            </div>
            <Link
              to="/admin/approvals"
              className="text-xs font-bold text-brand-blue hover:underline"
            >
              Full Queue →
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading queue...</div>
          ) : approvals.length > 0 ? (
            <div className="space-y-3">
              {approvals.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-slate-900 line-clamp-1">
                        {app.resource?.title || 'Lecture Notes Submission'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {app.resource?.courseName || 'IT Department'} • {app.resource?.category?.toUpperCase()}
                      </div>
                    </div>

                    <Link
                      to={`/preview/${app.resourceId}`}
                      className="p-1.5 text-slate-400 hover:text-brand-blue"
                      title="Preview Document"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug">
                    {app.remarks || 'Contributed by student for academic review.'}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleReview(app.id, 'approved')}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReview(app.id, 'rejected')}
                      className="py-1.5 px-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="text-xs font-bold text-slate-700">All Clear!</div>
              <p className="text-[11px]">No pending uploads in the approval queue.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

