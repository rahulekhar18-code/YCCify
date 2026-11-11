import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  User,
  GraduationCap,
  Shield,
  Bell,
  Sun,
  Moon,
  Laptop,
  HelpCircle,
  Check,
  AlertCircle,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
  ExternalLink,
  Send,
  MessageSquare,
  Info,
  Smartphone,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronUp,
  Star,
  CheckCircle2,
  Clock,
  LogOut,
  Camera,
} from 'lucide-react';
import api from '@yccify/api';
import {
  Branch,
  NotificationPreferences,
  AcademicHistoryRecord,
  SupportTicket,
  SupportTicketCategory,
} from '@yccify/types';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Active Section
  const [activeTab, setActiveTab] = useState<
    'profile' | 'academic' | 'security' | 'notifications' | 'appearance' | 'support'
  >('profile');

  // Branches
  const [branches, setBranches] = useState<Branch[]>([]);

  // Global Toasts / Feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // -------------------------------------------------------------
  // 1. Profile State
  // -------------------------------------------------------------
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Mobile Change Modal / Verification
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [newMobile, setNewMobile] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [otpStep, setOtpStep] = useState<'input' | 'verify'>('input');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSentMsg, setOtpSentMsg] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');

  // -------------------------------------------------------------
  // 2. Academic State
  // -------------------------------------------------------------
  const [selectedBranchId, setSelectedBranchId] = useState(user?.branchId || '');
  const [selectedSemester, setSelectedSemester] = useState(user?.semesterNumber || 7);
  const [branchReason, setBranchReason] = useState('');
  const [academicLoading, setAcademicLoading] = useState(false);
  const [academicHistory, setAcademicHistory] = useState<AcademicHistoryRecord[]>([]);

  // -------------------------------------------------------------
  // 3. Security State
  // -------------------------------------------------------------
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // -------------------------------------------------------------
  // 4. Notification Preferences State
  // -------------------------------------------------------------
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>({
    userId: user?.id || '',
    notesUploaded: true,
    pyqsAvailable: true,
    facultyAnnouncements: true,
    assignmentUpdates: true,
    academicNotices: true,
    communityReplies: true,
    resourceReplies: true,
    channelInApp: true,
    channelPush: true,
    channelEmail: false,
  });
  const [notifLoading, setNotifLoading] = useState(false);

  // -------------------------------------------------------------
  // 5. Help & Support State
  // -------------------------------------------------------------
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketCategory, setTicketCategory] = useState<SupportTicketCategory>('Notes & PYQs');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('General Usability');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // -------------------------------------------------------------
  // Initial Data Fetching
  // -------------------------------------------------------------
  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatarUrl || '');
      setSelectedBranchId(user.branchId || '');
      setSelectedSemester(user.semesterNumber || 7);
    }

    // Load branches
    api.academic.getBranches().then(setBranches).catch(console.error);

    // Load notification preferences
    api.settings
      .getNotificationPreferences()
      .then(setNotifPrefs)
      .catch((err) => console.log('Loaded default notif prefs', err));

    // Load academic history
    api.settings
      .getAcademicHistory()
      .then(setAcademicHistory)
      .catch(console.error);

    // Load support tickets
    api.support
      .getTickets()
      .then(setTickets)
      .catch(console.error);
  }, [user]);

  // -------------------------------------------------------------
  // Profile Handlers
  // -------------------------------------------------------------
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Full Name cannot be empty.');
      return;
    }

    setProfileLoading(true);
    try {
      await api.settings.updateProfile({ name: name.trim(), avatarUrl });
      updateUser({ name: name.trim(), avatarUrl });
      showToast('success', 'Profile information updated successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleRequestMobileOtp = async () => {
    const cleanNum = newMobile.replace(/\D/g, '').trim();
    if (cleanNum.length !== 10) {
      showToast('error', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await api.settings.requestMobileOtp(cleanNum);
      setOtpSentMsg(res.message);
      if (res.simulatedOtp) {
        setSimulatedOtp(res.simulatedOtp);
      }
      setOtpStep('verify');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    if (!mobileOtp.trim()) {
      showToast('error', 'Please enter the 6-digit OTP.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await api.settings.verifyMobileOtp(newMobile, mobileOtp.trim());
      updateUser({ phone: res.user.phone });
      showToast('success', 'Mobile number verified and updated successfully!');
      setShowMobileModal(false);
      setNewMobile('');
      setMobileOtp('');
      setOtpStep('input');
    } catch (err: any) {
      showToast('error', err.message || 'Invalid or expired OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Avatar presets
  const avatarPresets = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Rahul')}`,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
  ];

  // -------------------------------------------------------------
  // Academic Handlers
  // -------------------------------------------------------------
  const handleSaveAcademic = async (e: React.FormEvent) => {
    e.preventDefault();
    setAcademicLoading(true);

    try {
      const isBranchChanged = selectedBranchId !== user?.branchId;
      const res = await api.settings.updateAcademic({
        semesterNumber: selectedSemester,
        branchId: isBranchChanged ? selectedBranchId : undefined,
        reason: branchReason.trim() || undefined,
      });

      if (res.requiresApproval) {
        showToast(
          'success',
          'Branch transfer request submitted! Awaiting administrator approval per YCCE regulations.'
        );
      } else {
        showToast('success', res.message || 'Academic information updated successfully!');
        if (res.user) {
          updateUser({ semesterNumber: res.user.semesterNumber });
        }
      }

      // Refresh academic history
      const hist = await api.settings.getAcademicHistory();
      setAcademicHistory(hist);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update academic information.');
    } finally {
      setAcademicLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Security Handlers
  // -------------------------------------------------------------
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score, text: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, text: 'Moderate', color: 'bg-amber-500' };
    return { score, text: 'Strong', color: 'bg-emerald-500' };
  };

  const passStrength = calculatePasswordStrength(newPassword);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('error', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await api.settings.changePassword(currentPassword, newPassword);
      showToast('success', res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (window.confirm('Are you sure you want to log out from all other active devices?')) {
      try {
        const res = await api.settings.logoutAllDevices();
        showToast('success', res.message);
      } catch (err: any) {
        showToast('error', err.message || 'Failed to logout devices.');
      }
    }
  };

  // -------------------------------------------------------------
  // Notification Preferences Handlers
  // -------------------------------------------------------------
  const handleToggleNotif = async (key: keyof NotificationPreferences) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    setNotifLoading(true);
    try {
      await api.settings.updateNotificationPreferences(updated);
      showToast('success', 'Notification preferences saved.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save preferences.');
    } finally {
      setNotifLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Help & Support Handlers
  // -------------------------------------------------------------
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      showToast('error', 'Subject and detailed description are required.');
      return;
    }

    setTicketLoading(true);
    try {
      const newT = await api.support.createTicket({
        category: ticketCategory,
        subject: ticketSubject.trim(),
        description: ticketDescription.trim(),
      });
      setTickets([newT, ...tickets]);
      setTicketSubject('');
      setTicketDescription('');
      showToast(
        'success',
        'Support ticket created! YCCify Admin (Rahul Ekhar) has received your request.'
      );
    } catch (err: any) {
      showToast('error', err.message || 'Failed to submit support ticket.');
    } finally {
      setTicketLoading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      showToast('error', 'Please provide your feedback comments.');
      return;
    }

    setFeedbackLoading(true);
    try {
      const res = await api.support.submitFeedback({
        rating: feedbackRating,
        category: feedbackCategory,
        feedback: feedbackText.trim(),
      });
      showToast('success', res.message);
      setFeedbackText('');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const faqs = [
    {
      q: 'How do I reset my password?',
      a: 'You can change your password anytime in the "Security & Password" section of Settings. If you forgot your password, click "Forgot Password?" on the login page to initiate a secure reset.',
    },
    {
      q: 'How do I change my registered mobile number?',
      a: 'In "Profile Settings", click the "Change Number" button beside your mobile number. A 6-digit OTP will be dispatched to verify your new mobile number before updating.',
    },
    {
      q: 'How do I update my semester or branch?',
      a: 'Navigate to "Academic Information". You can select your new semester (Sem 1 to 8) to promote your account. Note that changing branches requires approval from the institute administrator.',
    },
    {
      q: 'How do I upload notes and PYQs for my courses?',
      a: 'Click on the "Upload" tab in the left sidebar navigation. Select your course, upload files (PDFs up to 50MB), add descriptive titles, and submit them for faculty/peer approval.',
    },
    {
      q: 'How do I report incorrect resources or errors?',
      a: 'Go to the "Help & Support" section below and click "Report a Problem". Select "Notes & PYQs" as the category and provide the course name and details of the incorrect file.',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-elevated border text-sm font-semibold transition-all animate-in slide-in-from-bottom-5 ${toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/80 dark:text-red-200 dark:border-red-800'
            }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Settings Center ⚙️
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your YCCify student identity, academic credentials, security and preferences
        </p>
      </div>

      {/* Main Settings Container: Side Nav + Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* 1. Left-Side Navigation Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-1">
          {[
            { id: 'profile', label: 'Profile Settings', icon: User },
            { id: 'academic', label: 'Academic Information', icon: GraduationCap },
            { id: 'security', label: 'Security & Password', icon: Shield },
            { id: 'notifications', label: 'Notification Preferences', icon: Bell },
            { id: 'appearance', label: 'Appearance', icon: Sun },
            { id: 'support', label: 'Help & Support', icon: HelpCircle },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${isActive
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 px-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Signed in as
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {user?.name || 'Rahul Sharma'}
            </div>
            <div className="text-[11px] text-slate-400 truncate">{user?.email || 'student@ycce.in'}</div>
          </div>
        </div>

        {/* 2. Content Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: PROFILE SETTINGS */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-8 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Profile Settings</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Update your public student profile and identity
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-brand-blue dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-900">
                  Verified Student
                </span>
              </div>

              {/* Profile Photo Management */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Profile Photo
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group">
                    <img
                      src={avatarUrl || user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul'}
                      alt={name}
                      className="w-24 h-24 rounded-3xl object-cover ring-4 ring-blue-50 dark:ring-blue-950 shadow-md bg-slate-100"
                    />
                    <div className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Choose an avatar preset or paste an image URL:
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                      {avatarPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(preset)}
                          className={`w-9 h-9 rounded-xl border-2 transition-transform hover:scale-105 overflow-hidden ${avatarUrl === preset
                              ? 'border-brand-blue ring-2 ring-brand-blue/30'
                              : 'border-slate-200 dark:border-slate-700'
                            }`}
                        >
                          <img src={preset} alt={`preset-${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Or enter custom image URL"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                    />
                  </div>
                </div>

                {/* College Email (Read-Only) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      College Email Address
                    </label>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Verified Authorized YCCE Email
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={user?.email || '24071271@ycce.in'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    College email address is permanent and cannot be modified after registration.
                  </p>
                </div>

                {/* PRN / Roll Number (Read-Only) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Student PRN / Roll Number
                    </label>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Unique Roster Identity
                    </span>
                  </div>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={user?.rollNumber || 'IT2022045'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    PRN is locked to your student record to enforce single-account security.
                  </p>
                </div>

                {/* Mobile Number with OTP Action */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Registered Mobile Number
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setNewMobile('');
                        setMobileOtp('');
                        setOtpStep('input');
                        setShowMobileModal(true);
                      }}
                      className="text-xs font-bold text-brand-blue dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Change Number
                    </button>
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={user?.phone ? `+91 ${user.phone}` : 'Not registered'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 cursor-not-allowed font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Changes to your mobile number require two-factor OTP verification.
                  </p>
                </div>

                {/* Save and Cancel Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setName(user?.name || '');
                      setAvatarUrl(user?.avatarUrl || '');
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-brand-blue/20 transition-all flex items-center gap-2"
                  >
                    {profileLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ACADEMIC INFORMATION */}
          {/* ========================================================================= */}
          {activeTab === 'academic' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-8 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Academic Information</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage current branch, semester enrollment, and view progression history
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-900">
                  Session 2025-26
                </span>
              </div>

              <form onSubmit={handleSaveAcademic} className="space-y-5">
                {/* Department / Branch */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Branch / Department
                    </label>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                      * Branch changes require Admin Approval
                    </span>
                  </div>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* If branch changed, show justification note */}
                {selectedBranchId !== user?.branchId && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-2">
                    <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Departmental Transfer Request Notice</span>
                    </div>
                    <p className="text-amber-700 dark:text-amber-300">
                      Per YCCE academic guidelines, branch transfers require approval from the academic dean. Please state your reason below:
                    </p>
                    <input
                      type="text"
                      value={branchReason}
                      onChange={(e) => setBranchReason(e.target.value)}
                      placeholder="e.g. Approved branch transfer order no. YCCE/2026/04"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                )}

                {/* Semester & Academic Year Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Semester */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Current Semester
                    </label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Academic Year */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value="2025–2026 (Autonomous)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* PRN Display */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Assigned PRN Number (Read-Only)
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={user?.rollNumber || 'IT2022045'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>

                {/* Save and Cancel Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBranchId(user?.branchId || '');
                      setSelectedSemester(user?.semesterNumber || 7);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={academicLoading}
                    className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-brand-blue/20 transition-all flex items-center gap-2"
                  >
                    {academicLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Update Academic Information</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Academic History Log */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-blue" />
                    <span>Academic Progression History</span>
                  </h3>
                  <span className="text-xs text-slate-400">Preserved in database</span>
                </div>

                {academicHistory.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 text-center">
                    No previous semester progressions recorded. Initial enrollment set to Semester {user?.semesterNumber || 7}.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {academicHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            Semester {item.previousSemester} → Semester {item.newSemester}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {item.changeReason || 'Semester progression'} • {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${item.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                        >
                          {item.status === 'approved' ? 'Active' : 'Pending Approval'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SECURITY & PASSWORD */}
          {/* ========================================================================= */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-8 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Security & Password</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage your credentials, sessions, and multi-factor account status
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-900">
                  Account Secure
                </span>
              </div>

              {/* Account Security Verification Status Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-brand-blue" />
                      <span>Email Verification</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-purple-600" />
                      <span>Mobile Number Verification</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.phone ? `+91 ${user.phone}` : 'Verified via OTP'}
                  </p>
                </div>
              </div>

              {/* Change Password Form */}
              <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-brand-blue" />
                  <span>Change Password</span>
                </h3>

                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Current Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Password Strength:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{passStrength.text}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passStrength.color}`}
                          style={{ width: `${(passStrength.score / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={passLoading}
                    className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-brand-blue/20 transition-all flex items-center gap-2"
                  >
                    {passLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Shield className="w-3.5 h-3.5" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Session Management */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-brand-blue" />
                  <span>Session Management</span>
                </h3>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span>Current Device (This Browser)</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Active Now
                      </span>
                    </div>
                    <div className="text-slate-400 mt-0.5">
                      Chrome on Windows • IP verified • Session active
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleLogoutAll}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Logout Other Devices
                    </button>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: NOTIFICATION PREFERENCES */}
          {/* ========================================================================= */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-8 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Notification Preferences</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Customize which academic events and channels notify you
                  </p>
                </div>
                {notifLoading && (
                  <span className="text-xs text-brand-blue font-semibold animate-pulse">Saving...</span>
                )}
              </div>

              {/* Notification Categories */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Notification Categories</h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    {
                      key: 'notesUploaded' as const,
                      title: 'New Notes Uploaded',
                      desc: 'Notify when faculty or students upload notes in your enrolled branch courses',
                    },
                    {
                      key: 'pyqsAvailable' as const,
                      title: 'New PYQs Available',
                      desc: 'Instant alert when previous year exam papers are cataloged',
                    },
                    {
                      key: 'facultyAnnouncements' as const,
                      title: 'Faculty Announcements',
                      desc: 'Direct departmental notices from YCCE course instructors',
                    },
                    {
                      key: 'assignmentUpdates' as const,
                      title: 'Assignment Updates',
                      desc: 'Due dates, submission sheets, and lab manual updates',
                    },
                    {
                      key: 'academicNotices' as const,
                      title: 'Important Academic Notices',
                      desc: 'Autonomous session updates, exam schedules, and circulars',
                    },
                    {
                      key: 'communityReplies' as const,
                      title: 'Community Replies',
                      desc: 'When peers comment or reply to discussions on notes',
                    },
                    {
                      key: 'resourceReplies' as const,
                      title: 'Replies to Uploaded Resources',
                      desc: 'Questions or upvotes on resources you contributed to YCCify',
                    },
                  ].map((item) => (
                    <div key={item.key} className="py-3.5 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleNotif(item.key)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notifPrefs[item.key] ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifPrefs[item.key] ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification Delivery Channels */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delivery Channels</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'channelInApp' as const, title: 'In-App Alerts', desc: 'Bell icon dropdown' },
                    { key: 'channelPush' as const, title: 'Push Notifications', desc: 'Browser & mobile push' },
                    { key: 'channelEmail' as const, title: 'Email Digests', desc: 'To @ycce.in inbox' },
                  ].map((chan) => (
                    <div
                      key={chan.key}
                      onClick={() => handleToggleNotif(chan.key)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${notifPrefs[chan.key]
                          ? 'border-brand-blue bg-blue-50/50 dark:bg-blue-950/40 text-brand-blue'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{chan.title}</span>
                        {notifPrefs[chan.key] && <Check className="w-4 h-4 text-brand-blue" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{chan.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: APPEARANCE */}
          {/* ========================================================================= */}
          {activeTab === 'appearance' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-8 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Appearance & Theme</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Customize your visual reading and study theme
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-brand-blue dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-900 capitalize">
                  Current: {theme}
                </span>
              </div>

              {/* Theme Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Light Mode */}
                <div
                  onClick={() => setTheme('light')}
                  className={`p-5 rounded-3xl border-2 cursor-pointer transition-all space-y-3 ${theme === 'light'
                      ? 'border-brand-blue bg-blue-50/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Light Mode</div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Classic YCCify blue and white academic design
                    </p>
                  </div>
                  <div className="pt-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${theme === 'light'
                          ? 'bg-brand-blue text-white'
                          : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      {theme === 'light' ? 'Active Theme' : 'Select Light'}
                    </span>
                  </div>
                </div>

                {/* Dark Mode */}
                <div
                  onClick={() => setTheme('dark')}
                  className={`p-5 rounded-3xl border-2 cursor-pointer transition-all space-y-3 ${theme === 'dark'
                      ? 'border-brand-blue bg-slate-800 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-indigo-400 flex items-center justify-center">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      High-contrast dark slate palette for late night study sessions
                    </p>
                  </div>
                  <div className="pt-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${theme === 'dark'
                          ? 'bg-brand-blue text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                    >
                      {theme === 'dark' ? 'Active Theme' : 'Select Dark'}
                    </span>
                  </div>
                </div>

                {/* System Default */}
                <div
                  onClick={() => setTheme('system')}
                  className={`p-5 rounded-3xl border-2 cursor-pointer transition-all space-y-3 ${theme === 'system'
                      ? 'border-brand-blue bg-blue-50/40 dark:bg-slate-800 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">System Default</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Automatically syncs with your operating system preferences
                    </p>
                  </div>
                  <div className="pt-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${theme === 'system'
                          ? 'bg-brand-blue text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                    >
                      {theme === 'system' ? 'Active Theme' : 'Select System'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: HELP & SUPPORT */}
          {/* ========================================================================= */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Administrator Contact Card */}
              <div className="bg-gradient-hero-card rounded-3xl p-6 sm:p-8 text-white shadow-elevated space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">
                      Official Institutional Administrator
                    </span>
                    <h2 className="text-2xl font-black">Rahul Ekhar</h2>
                    <p className="text-xs text-slate-300">
                      YCCify Administrator • Yeshwantrao Chavan College of Engineering, Nagpur
                    </p>
                  </div>

                  <a
                    href="mailto:rahulekhar18@gmail.com?subject=YCCify%20Student%20Support%20Request"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-blue hover:bg-brand-hover text-white text-xs font-bold transition-all shadow-md shrink-0 w-fit"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Contact Administrator</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-700/60 flex-wrap">
                  <span>✉️ rahulekhar18@gmail.com</span>
                  <span>•</span>
                  <span>📍 YCCE Campus, Wanadongri, Nagpur</span>
                  <span>•</span>
                  <span>⏱️ Response window: within 24 business hours</span>
                </div>
              </div>

              {/* Report a Problem Form */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Report a Problem</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Submit a support ticket directly to Rahul Ekhar for resolution
                  </p>
                </div>

                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Issue Category *
                      </label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      >
                        <option value="Login & Account">Login & Account</option>
                        <option value="Profile Problems">Profile Problems</option>
                        <option value="Notes & PYQs">Notes & PYQs</option>
                        <option value="Upload Problems">Upload Problems</option>
                        <option value="Notifications">Notifications</option>
                        <option value="Other Technical Issues">Other Technical Issues</option>
                      </select>
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Subject *
                      </label>
                      <input
                        type="text"
                        required
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="Brief summary of the issue"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Detailed Description *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      placeholder="Please explain what happened, steps to reproduce, or the course/file name..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <button
                      type="submit"
                      disabled={ticketLoading}
                      className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-brand-blue/20 transition-all flex items-center gap-2"
                    >
                      {ticketLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Ticket</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Submitted Tickets Log */}
                {tickets.length > 0 && (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Your Submitted Tickets ({tickets.length})
                    </h4>
                    <div className="space-y-2">
                      {tickets.map((t) => (
                        <div
                          key={t.id}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{t.subject}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {t.category} • {new Date(t.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${t.status === 'resolved'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-blue-50 text-brand-blue dark:bg-blue-950/60 dark:text-blue-300'
                              }`}
                          >
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions & Feedback Form */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Suggestions & Feedback</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Help us make YCCify better for every student at YCCE
                  </p>
                </div>

                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  {/* Rating Stars */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Your Rating
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${feedbackRating >= star
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 dark:text-slate-700'
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Feedback & Suggestions *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="What features or academic resources would you love to see next?"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={feedbackLoading}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-md transition-all flex items-center gap-2"
                    >
                      {feedbackLoading ? (
                        <span className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Submit Feedback</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Frequently Asked Questions */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Frequently Asked Questions</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Quick solutions to common questions about YCCify
                  </p>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="py-3">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between text-left gap-4"
                      >
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{faq.q}</span>
                        {openFaq === idx ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>
                      {openFaq === idx && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 pl-1 leading-relaxed">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* App Information */}
              <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="space-y-0.5 text-center sm:text-left">
                  <div className="font-black text-slate-900 dark:text-white">YCCify Academic Platform</div>
                  <div className="text-slate-500 dark:text-slate-400">
                    Version 1.0.0 (Production Build) • Everything Your Academics Need
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Yeshwantrao Chavan College of Engineering (Autonomous), Nagpur
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                  Build 2026.11
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE NUMBER OTP VERIFICATION MODAL */}
      {/* ========================================================================= */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-5">
            <button
              onClick={() => setShowMobileModal(false)}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-brand-blue flex items-center justify-center border border-blue-100 dark:border-blue-900">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Verify Mobile Number</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {otpStep === 'input'
                    ? 'Enter new 10-digit mobile number'
                    : 'Enter the 6-digit verification OTP'}
                </p>
              </div>
            </div>

            {otpStep === 'input' ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    New Mobile Number (10 Digits) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      maxLength={10}
                      value={newMobile}
                      onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Must be unique and not currently registered with another college student account.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={otpLoading || newMobile.length !== 10}
                  onClick={handleRequestMobileOtp}
                  className="w-full py-3 rounded-xl bg-brand-blue hover:bg-brand-hover disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {otpLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span>Send Verification OTP</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs text-brand-blue dark:text-blue-300">
                  {otpSentMsg || `OTP sent to +91-${newMobile}`}
                  {simulatedOtp && (
                    <span className="block mt-1 font-bold text-emerald-600 dark:text-emerald-400">
                      [Demo/Test OTP: {simulatedOtp}]
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Enter 6-Digit OTP *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={mobileOtp}
                    onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className="w-full px-4 py-3 text-center tracking-widest text-lg font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setOtpStep('input')}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={otpLoading || mobileOtp.length !== 6}
                    onClick={handleVerifyMobileOtp}
                    className="flex-1 py-3 rounded-xl bg-brand-blue hover:bg-brand-hover disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {otpLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <span>Verify & Save</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default SettingsPage;

