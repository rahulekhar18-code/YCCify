import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  GraduationCap,
  Building2,
  Calendar,
  Layers,
  UploadCloud,
  Bookmark,
  ShieldCheck,
  Save,
  CheckCircle,
} from 'lucide-react';
import api from '@yccify/api';
import { Resource } from '@yccify/types';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [userUploads, setUserUploads] = useState<Resource[]>([]);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');

      // Load user uploads and bookmark count
      Promise.all([
        api.resources.getResources({ status: 'all' }),
        api.bookmarks.getBookmarks(),
      ]).then(([allRes, bmList]) => {
        const myUploads = allRes.filter((r) => r.uploaderId === user.id);
        setUserUploads(myUploads);
        setBookmarksCount(bmList.length);
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser({ name, phone });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your YCCE academic credentials and view your contributions
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-100">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={user?.name || 'User'}
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-blue-50 shadow-md"
          />

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {user?.name || 'Rahul Sharma'}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-bold border border-blue-100 w-fit mx-auto sm:mx-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="capitalize">{user?.role || 'Student'} Access</span>
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-500">
              {user?.collegeName || 'Yeshwantrao Chavan College of Engineering (YCCE), Nagpur'}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-400 font-semibold flex-wrap">
              <span>{user?.branchName || 'Information Technology'}</span>
              <span>•</span>
              <span>Semester {user?.semesterNumber || 7}</span>
              {user?.phone && (
                <>
                  <span>•</span>
                  <span>📱 {user.phone}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100/80 text-center">
            <div className="text-2xl font-black text-brand-blue">{userUploads.length}</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">Resources Uploaded</div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100/80 text-center">
            <div className="text-2xl font-black text-amber-600">{bookmarksCount}</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">Saved Bookmarks</div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>

        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Profile settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mobile Number
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Email Address (Fixed by Institute)
            </label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-brand-blue/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </form>
      </div>

      {/* Upload History List */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Your Upload History</h3>

        {userUploads.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {userUploads.map((up) => (
              <div key={up.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{up.title}</div>
                  <div className="text-slate-400 mt-0.5">
                    {up.courseName} • {up.category.toUpperCase()} • {new Date(up.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                    up.approvalStatus === 'approved'
                      ? 'bg-emerald-50 text-emerald-700'
                      : up.approvalStatus === 'rejected'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {up.approvalStatus}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            You haven't uploaded any resources yet.
          </p>
        )}
      </div>
    </div>
  );
};

