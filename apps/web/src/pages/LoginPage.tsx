import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, User, Phone, CheckCircle, X, KeyRound } from 'lucide-react';
import api from '@yccify/api';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const res = await api.auth.signInWithGoogle();
      if (res.url) {
        window.location.assign(res.url);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google Sign-In.');
      setGoogleLoading(false);
    }
  };

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handleRoleToggle = (selectedRole: 'student' | 'admin') => {
    setRole(selectedRole);
    setError(null);
    setIdentifier('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please provide your college email address or 10-digit mobile number.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(identifier.trim().toLowerCase(), password, role);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your email/mobile and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    const emailTrimmed = forgotEmail.trim().toLowerCase();
    const phoneTrimmed = forgotPhone.replace(/\D/g, '').trim();

    if (!emailTrimmed.endsWith('@ycce.in') && !emailTrimmed.endsWith('@ycce.edu')) {
      setForgotError('Please enter a valid college email ending with @ycce.in');
      return;
    }

    if (phoneTrimmed.length !== 10) {
      setForgotError('Please enter your 10-digit registered mobile number.');
      return;
    }

    if (forgotNewPass.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }

    if (forgotNewPass !== forgotConfirmPass) {
      setForgotError('New passwords do not match. Please verify.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.auth.resetPassword({
        email: emailTrimmed,
        phone: phoneTrimmed,
        newPassword: forgotNewPass,
      });
      setForgotSuccess(res.message || 'Password reset successfully! You can now sign in.');
      setIdentifier(emailTrimmed);
      setPassword(forgotNewPass);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess(null);
      }, 2000);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password. Please check your details.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Determine icon based on input content
  const isPhoneInput = /^\d+$/.test(identifier);
  const InputIcon = isPhoneInput ? Phone : Mail;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <img
            src="/assets/logo.jpg"
            alt="YCCify"
            className="w-14 h-14 rounded-2xl shadow-md group-hover:scale-105 transition-transform object-cover mx-auto"
          />
        </Link>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome Back 👋
        </h2>
        <p className="text-sm text-slate-500">Sign in to continue to YCCify</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-card border border-slate-200/80 space-y-6">
          {/* Student vs Admin Role Pill Switcher */}
          <div className="p-1 rounded-2xl bg-slate-100 flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleRoleToggle('student')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                role === 'student'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleToggle('admin')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                role === 'admin'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Mobile Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {role === 'admin' ? 'Admin Email' : 'Email or Mobile Number'}
              </label>
              <div className="relative">
                <InputIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={role === 'admin' ? 'admin@ycce.edu' : '24071271@ycce.in or 10-digit mobile'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                  inputMode={isPhoneInput ? 'numeric' : 'text'}
                />
              </div>
              {role === 'student' && (
                <p className="text-[11px] text-slate-400 pl-1">
                  Login with your college email (<span className="font-semibold text-slate-600">@ycce.in</span>) or 10-digit mobile
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotError(null);
                    setForgotSuccess(null);
                    setForgotEmail(identifier.includes('@') ? identifier.trim().toLowerCase() : '');
                    setForgotPhone(/^\d{10}$/.test(identifier.trim()) ? identifier.trim() : '');
                    setForgotNewPass('');
                    setForgotConfirmPass('');
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-semibold text-brand-blue hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                role === 'admin'
                  ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                  : 'bg-brand-blue hover:bg-brand-hover shadow-brand-blue/25'
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Sign In as {role === 'admin' ? 'Admin' : 'Student'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google Sign In Divider & Button */}
          {role === 'student' && (
            <div className="space-y-4 pt-1">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider absolute">
                  or continue with
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full py-3 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {googleLoading ? (
                  <span className="w-4 h-4 border-2 border-slate-300 border-t-brand-blue rounded-full animate-spin"></span>
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google (@ycce.in)</span>
              </button>
            </div>
          )}

          {/* Sign Up Link */}
          <div className="text-center pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">Don't have an account? </span>
            <Link to="/register" className="text-xs font-bold text-brand-blue hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center border border-blue-100">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Reset Password</h3>
                <p className="text-xs text-slate-500">Verify your college account to set a new password</p>
              </div>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  College Email (@ycce.in) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. 24071271@ycce.in"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Registered Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={forgotNewPass}
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={forgotConfirmPass}
                    onChange={(e) => setForgotConfirmPass(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-brand-blue/20 transition-all flex items-center gap-1.5"
                >
                  {forgotLoading ? 'Updating...' : 'Set New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

