import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  HelpCircle,
  FlaskConical,
  BookCheck,
  Download,
  Eye,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Building2,
} from 'lucide-react';
import api from '@yccify/api';
import { DashboardStats, Resource } from '@yccify/types';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsData, resData] = await Promise.all([
          api.admin.getStats(),
          api.resources.getResources({ status: 'approved' }),
        ]);
        setStats(statsData);
        setRecentResources(resData.slice(0, 6));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const handleToggleBookmark = async (resourceId: string) => {
    try {
      const res = await api.bookmarks.toggleBookmark(resourceId);
      setRecentResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, isBookmarked: res.isBookmarked } : r))
      );
    } catch (err) {
      console.error('Bookmark toggle failed', err);
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      await api.resources.recordDownload(resource.id);
      const file = resource.files[0];
      if (file) {
        const url = api.storage.getFileUrl(file.fileUrl, true);
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Download error', err);
    }
  };

  const categoryCards = [
    {
      name: 'Notes',
      count: stats?.categoryCounts?.notes ?? 0,
      icon: FileText,
      color: 'bg-blue-50 text-brand-blue border-blue-200',
      category: 'notes',
    },
    {
      name: 'PYQs',
      count: stats?.categoryCounts?.pyqs ?? 0,
      icon: HelpCircle,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      category: 'pyqs',
    },
    {
      name: 'Practicals',
      count: stats?.categoryCounts?.practicals ?? 0,
      icon: FlaskConical,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      category: 'practicals',
    },
    {
      name: 'Assignments',
      count: stats?.categoryCounts?.assignments ?? 0,
      icon: BookCheck,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      category: 'assignments',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Welcome Banner matching Desktop Screenshot */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-8 sm:p-10 shadow-elevated border border-slate-800">
        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-brand-blue/20 to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-cyan-300 text-xs font-bold border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>YCCE Autonomous Academic Session 2025–26</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Hi, {user?.name?.split(' ')[0] || 'Rahul'} 👋
            </h1>

            <p className="text-slate-300 text-sm sm:text-base font-medium max-w-xl">
              B.Tech {user?.branchName || 'Information Technology'} – Semester{' '}
              {user?.semesterNumber || 7}{user?.phone ? ` • 📱 ${user.phone}` : ''}
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-brand-blue/30 transition-all"
              >
                <span>Browse IT Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
              >
                <span>Upload New Resource</span>
              </Link>
            </div>
          </div>

          {/* College Illustration Emblem */}
          <div className="hidden lg:flex items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
            <Building2 className="w-24 h-24 text-cyan-400 opacity-90" />
          </div>
        </div>
      </div>

      {/* 2. Four Resource Category Cards matching UI Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Academic Categories</h2>
          <span className="text-xs text-slate-400 font-semibold">Semester 7 Verified Files</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => navigate(`/explore/it/sem/7`)}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-brand-blue/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${cat.color} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-brand-blue transition-colors">
                    →
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {cat.count}
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                  {cat.name} Files
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Recently Uploaded Resources matching UI reference */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Recently Uploaded
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest notes and past papers added by faculty & students
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-brand-blue hover:text-brand-hover hover:underline"
          >
            View All Resources →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <span className="inline-block w-6 h-6 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin mb-2"></span>
            <div>Loading verified academic files...</div>
          </div>
        ) : recentResources.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentResources.map((res) => {
              const file = res.files[0];
              const sizeMb = file ? (file.fileSizeBytes / (1024 * 1024)).toFixed(1) : '2.4';

              return (
                <div
                  key={res.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 -mx-4 px-4 rounded-2xl transition-colors"
                >
                  {/* File Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100 font-bold text-xs uppercase">
                      PDF
                    </div>

                    <div>
                      <Link
                        to={`/preview/${res.id}`}
                        className="text-sm font-bold text-slate-900 hover:text-brand-blue transition-colors line-clamp-1"
                      >
                        {res.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                        <span className="font-semibold text-slate-600">{res.courseName}</span>
                        <span>•</span>
                        <span>
                          {res.branchCode || 'IT'} Sem {res.semesterNumber || 7}
                        </span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-brand-blue font-bold text-[10px] uppercase">
                          {res.category}
                        </span>
                        <span>•</span>
                        <span>{sizeMb} MB</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleBookmark(res.id)}
                      title={res.isBookmarked ? 'Remove Bookmark' : 'Bookmark File'}
                      className={`p-2 rounded-xl border transition-colors ${
                        res.isBookmarked
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                      }`}
                    >
                      {res.isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 fill-amber-500" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    <Link
                      to={`/preview/${res.id}`}
                      className="p-2 rounded-xl bg-white text-slate-600 border border-slate-200 hover:text-brand-blue hover:bg-slate-50 transition-colors"
                      title="Preview PDF"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDownload(res)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm">
            No resources uploaded yet. Be the first to contribute!
          </div>
        )}
      </div>
    </div>
  );
};

