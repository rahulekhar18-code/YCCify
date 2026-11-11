import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  ArrowRight,
  Shield,
  CheckCircle2,
  X,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import api from '@yccify/api';
import { Branch } from '@yccify/types';

export const RegisterPage: React.FC = () => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [prn, setPrn] = useState('');
  const [branchId, setBranchId] = useState('');
  const [semesterNumber, setSemesterNumber] = useState(7);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
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

  // Dual OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [simulatedEmailOtp, setSimulatedEmailOtp] = useState('');
  const [simulatedMobileOtp, setSimulatedMobileOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    api.academic
      .getBranches()
      .then((b) => {
        setBranches(b);
        if (b.length > 0) setBranchId(b[0].id);
      })
      .catch((err) => console.error('Failed to load branches', err));
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (!showOtpModal || cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showOtpModal, cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password || !phone.trim() || !prn.trim()) {
      setError('Please fill in all mandatory registration fields.');
      return;
    }

    const emailNormalized = email.trim().toLowerCase();
    if (!emailNormalized.endsWith('@ycce.in')) {
      setError('Only official college email ending with @ycce.in is allowed for student registration.');
      return;
    }

    const phoneNormalized = phone.replace(/\D/g, '').trim();
    if (phoneNormalized.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.initiateRegistration({
        name: name.trim(),
        email: emailNormalized,
        phone: phoneNormalized,
        prn: prn.trim().toUpperCase(),
        branchId,
        semesterNumber,
        password,
        confirmPassword,
      });

      if (res.simulatedEmailOtp) setSimulatedEmailOtp(res.simulatedEmailOtp);
      if (res.simulatedMobileOtp) setSimulatedMobileOtp(res.simulatedMobileOtp);

      setCooldown(60);
      setOtpError(null);
      setShowOtpModal(true);
    } catch (err: any) {
      setError(err.message || 'Registration request rejected.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setOtpError(null);
    try {
      const res = await api.auth.initiateRegistration({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, '').trim(),
        prn: prn.trim().toUpperCase(),
        branchId,
        semesterNumber,
        password,
        confirmPassword,
      });
      if (res.simulatedEmailOtp) setSimulatedEmailOtp(res.simulatedEmailOtp);
      if (res.simulatedMobileOtp) setSimulatedMobileOtp(res.simulatedMobileOtp);
      setCooldown(60);
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend OTP.');
    }
  };

  const handleVerifyDualOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!emailOtp.trim() || !mobileOtp.trim()) {
      setOtpError('Please enter both Email OTP and Mobile OTP.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await api.auth.verifyRegistration({
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, '').trim(),
        prn: prn.trim().toUpperCase(),
        emailOtp: emailOtp.trim(),
        mobileOtp: mobileOtp.trim(),
      });

      updateUser(res.user);
      setShowOtpModal(false);
      navigate('/dashboard');
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed. Please check the entered OTPs.');
    } finally {
      setOtpLoading(false);
    }
  };

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
          Create Student Account 🎓
        </h2>
        <p className="text-sm text-slate-500">
          Join YCCE's unified academic resource network
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-card border border-slate-200/80 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                YCCE College Email Address (@ycce.in only) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. 24071271@ycce.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 pl-1">
                Only verified <span className="font-semibold text-slate-600">@ycce.in</span> accounts are authorized
              </p>
            </div>

            {/* Registered Mobile Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Registered Mobile Number (10 Digits) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(val);
                  }}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 pl-1">
                Single-account policy: 1 mobile number can only register 1 student account
              </p>
            </div>

            {/* Student PRN / Roll Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Student PRN / College Roll Number *
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={prn}
                  onChange={(e) => setPrn(e.target.value.toUpperCase())}
                  placeholder="e.g. 24071271 or IT2022045"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 pl-1">
                Unique permanent identity assigned by YCCE Autonomous Roster
              </p>
            </div>

            {/* Branch and Semester */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Branch
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} ({b.name.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Semester
                </label>
                <select
                  value={semesterNumber}
                  onChange={(e) => setSemesterNumber(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Create Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-blue hover:bg-brand-hover text-white font-bold text-sm shadow-md shadow-brand-blue/25 transition-all flex items-center justify-center gap-2 pt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Proceed to Dual OTP Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google Sign Up Divider & Button */}
          <div className="space-y-4 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider absolute">
                or sign up with
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

          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">Already registered? </span>
            <Link to="/login" className="text-xs font-bold text-brand-blue hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* ================= DUAL OTP VERIFICATION MODAL ================= */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center border border-blue-100">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Verify Contact Details</h3>
                <p className="text-xs text-slate-500">
                  Verify both Email and Mobile OTPs to activate your account
                </p>
              </div>
            </div>

            {otpError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {(simulatedEmailOtp || simulatedMobileOtp) && (
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs space-y-1">
                <div className="font-bold text-brand-blue">Active Verification Codes:</div>
                <div className="text-slate-700">✉️ College Email OTP: <span className="font-mono font-bold text-brand-blue">{simulatedEmailOtp}</span></div>
                <div className="text-slate-700">📱 Mobile OTP: <span className="font-mono font-bold text-brand-blue">{simulatedMobileOtp}</span></div>
              </div>
            )}

            <form onSubmit={handleVerifyDualOtp} className="space-y-4">
              {/* College Email OTP */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  1. College Email OTP (@ycce.in) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit email OTP"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
              </div>

              {/* Mobile OTP */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Registered Mobile OTP (+91) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={mobileOtp}
                    onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit mobile OTP"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Did not receive code?'}
                </span>
                <button
                  type="button"
                  disabled={cooldown > 0}
                  onClick={handleResendOtp}
                  className="font-bold text-brand-blue hover:underline disabled:opacity-40 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Resend Dual OTPs
                </button>
              </div>

              <button
                type="submit"
                disabled={otpLoading || emailOtp.length !== 6 || mobileOtp.length !== 6}
                className="w-full py-3.5 rounded-xl bg-brand-blue hover:bg-brand-hover disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-brand-blue/20 transition-all flex items-center justify-center gap-2"
              >
                {otpLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Both OTPs & Activate Account</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
