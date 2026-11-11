import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '@yccify/api';
import {
  LayoutDashboard,
  Layers,
  Calendar,
  BookOpen,
  Users,
  FileText,
  CheckSquare,
  Star,
  GraduationCap,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);

  useEffect(() => {
    // Fetch pending counts for sidebar notification badges
    Promise.all([
      api.admin.getApprovals().catch(() => []),
      api.reviews.getAdminReviews('pending').catch(() => []),
    ]).then(([approvals, reviews]) => {
      setPendingApprovalsCount(approvals.filter((a) => a.status === 'pending').length);
      setPendingReviewsCount(reviews.length);
    });
  }, [location.pathname]);

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Branches', path: '/admin/branches', icon: Layers },
    { name: 'Semesters', path: '/admin/semesters', icon: Calendar },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Faculty', path: '/admin/faculty', icon: Users },
    { name: 'Resources', path: '/admin/resources', icon: FileText },
    { name: 'Approvals', path: '/admin/approvals', icon: CheckSquare, badge: pendingApprovalsCount, badgeClass: 'bg-emerald-500 text-white' },
    { name: 'Reviews', path: '/admin/reviews', icon: Star, badge: pendingReviewsCount, badgeClass: 'bg-amber-400 text-black font-black' },
    { name: 'Students', path: '/admin/students', icon: GraduationCap },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* 1. Sidebar (Off-canvas drawer on mobile, fixed left sidebar on desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Admin Badge Header */}
          <div className="h-16 sm:h-20 flex items-center justify-between px-5 sm:px-6 border-b border-slate-800">
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3"
            >
              <img
                src="/assets/logo.jpg"
                alt="YCCify"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-md object-cover ring-2 ring-cyan-400/50"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-white">YCCify</span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-blue text-white">
                    Admin
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">Control Panel</span>
              </div>
            </Link>

            {/* Close button on mobile */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 sm:p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            {adminLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.badgeClass || 'bg-amber-400 text-black font-bold'}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 space-y-3">

          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt="Dean"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-blue shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate max-w-[100px]">
                  {user?.name || 'Academic Dean'}
                </span>
                <span className="text-[10px] text-cyan-400 uppercase font-semibold truncate">
                  Admin Authority
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full min-w-0">
        {/* Top Header */}
        <header className="h-16 sm:h-20 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger Button on Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors lg:hidden shrink-0"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <ShieldCheck className="w-5 h-5 text-brand-blue shrink-0 hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 truncate">
                YCCE Administrative Portal
              </h1>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0 hidden xs:inline-block">
                Live DB
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right text-xs hidden md:block">
              <div className="font-bold text-slate-800">YCCE Nagpur Main Campus</div>
              <div className="text-[11px] text-slate-400">Academic Year 2025–2026</div>
            </div>
            <img
              src="/assets/logo.jpg"
              alt="Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-slate-200"
            />
          </div>
        </header>

        {/* Page View Body */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
