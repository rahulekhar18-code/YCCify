import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  UploadCloud,
  Bookmark,
  Users,
  Bell,
  Star,
  Settings,
  Search,
  LogOut,
  ShieldAlert,
  BookOpen,
  FileText,
  X,
  CheckCircle,
  Menu,
} from 'lucide-react';
import api from '@yccify/api';
import { SearchResult } from '@yccify/types';

export const AppLayout: React.FC = () => {
  const { user, logout, unreadCount, notifications, markNotificationAsRead } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.search.query(searchQuery);
        setSearchResults(res);
        setShowSearchDropdown(true);
      } catch (e) {
        console.error('Search error', e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Upload', path: '/upload', icon: UploadCloud },
    { name: 'Saved', path: '/saved', icon: Bookmark },
    { name: 'Faculty', path: '/faculty', icon: Users },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Review', path: '/reviews', icon: Star },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-brand-bg dark:bg-slate-950 text-brand-dark dark:text-slate-100">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* 1. Left Sidebar (Drawer on mobile, fixed on desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Institution Header */}
          <div className="h-16 sm:h-20 flex items-center justify-between px-5 sm:px-6 border-b border-slate-100 dark:border-slate-800">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 group"
            >
              <img
                src="/assets/logo.jpg"
                alt="YCCify"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-sm group-hover:scale-105 transition-transform object-cover"
              />
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-brand-blue transition-colors">
                  YCC<span className="text-brand-blue">ify</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase -mt-0.5">
                  Academic Platform
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 sm:p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 sm:py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                        : 'text-slate-600 dark:text-slate-300 hover:text-brand-blue hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && item.badge > 0 ? (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-white text-brand-blue' : 'bg-red-500 text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Role & Logout */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 sm:py-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-all border border-purple-200"
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Open Admin Portal</span>
            </Link>
          )}

          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={user?.name || 'User'}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                  {user?.name || 'Rahul Sharma'}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold truncate">
                  {user?.branchName?.split(' ')[0] || 'IT'} • Sem {user?.semesterNumber || 7}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full min-w-0">
        {/* Top Header */}
        <header className="h-16 sm:h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Hamburger Button on Mobile */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-1 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Bar */}
          <div ref={searchRef} className="relative w-full max-w-lg min-w-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes, PYQs, courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults) setShowSearchDropdown(true);
                }}
                className="w-full pl-9 sm:pl-10 pr-9 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Search Dropdown */}
            {showSearchDropdown && searchResults && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-elevated border border-slate-100 max-h-96 overflow-y-auto p-4 z-50 space-y-4">
                {/* Courses */}
                {searchResults.courses.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Courses
                    </h4>
                    <div className="space-y-1">
                      {searchResults.courses.map((course) => (
                        <div
                          key={course.id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            navigate(`/explore/it/sem/7/course/${course.id}`);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <BookOpen className="w-4 h-4 text-brand-blue" />
                            <div>
                              <div className="text-sm font-semibold text-slate-800">
                                {course.name}
                              </div>
                              <div className="text-xs text-slate-400">
                                {course.code} • {course.facultyName}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-brand-blue font-semibold">View</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources */}
                {searchResults.resources.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Documents & Files
                    </h4>
                    <div className="space-y-1">
                      {searchResults.resources.map((res) => (
                        <div
                          key={res.id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            navigate(`/preview/${res.id}`);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            <div>
                              <div className="text-sm font-semibold text-slate-800 truncate max-w-xs">
                                {res.title}
                              </div>
                              <div className="text-xs text-slate-400 uppercase">
                                {res.category} • {res.courseName}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-emerald-600 font-semibold">Preview</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Faculty */}
                {searchResults.faculty.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Faculty Members
                    </h4>
                    <div className="space-y-1">
                      {searchResults.faculty.map((f) => (
                        <div
                          key={f.id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            navigate('/faculty');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={f.avatarUrl}
                              alt={f.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div>
                              <div className="text-sm font-semibold text-slate-800">{f.name}</div>
                              <div className="text-xs text-slate-400">{f.designation}</div>
                            </div>
                          </div>
                          <span className="text-xs text-purple-600 font-semibold">Profile</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.courses.length === 0 &&
                  searchResults.resources.length === 0 &&
                  searchResults.faculty.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-sm">
                      No academic matches found for "{searchQuery}".
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Top Right Controls */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Notification Bell with Dropdown */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 sm:p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-brand-blue transition-colors"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-elevated border border-slate-100 p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-sm font-bold text-slate-800">Notifications</span>
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifDropdown(false)}
                      className="text-xs font-semibold text-brand-blue hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${n.isRead ? 'bg-slate-50 text-slate-600' : 'bg-blue-50/70 text-slate-800 font-semibold'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-slate-900">{n.title}</span>
                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-blue shrink-0 mt-1"></span>}
                          </div>
                          <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-xs text-slate-400 py-4">No notifications yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <Link
              to="/profile"
              className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 pr-1.5 sm:pr-2 py-1.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900 truncate max-w-[120px]">
                  {user?.name || 'Rahul Sharma'}
                </div>
                <div className="text-[11px] font-semibold text-brand-blue truncate max-w-[120px]">
                  {user?.branchName || 'Information Technology'}
                </div>
              </div>
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={user?.name || 'User'}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover ring-2 ring-slate-100 shrink-0"
              />
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
