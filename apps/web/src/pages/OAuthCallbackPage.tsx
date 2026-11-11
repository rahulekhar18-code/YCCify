import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '@yccify/api';
import { AlertCircle, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

export const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invalidEmail, setInvalidEmail] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const urlError = searchParams.get('error') || searchParams.get('insforge_error');
      if (urlError) {
        setError(`Google Authentication Error: ${urlError}`);
        setLoading(false);
        return;
      }

      const code = searchParams.get('insforge_code') || searchParams.get('code');

      try {
        // Exchange code if present
        if (code) {
          const { error: exchangeError } = await api.insforge.auth.exchangeOAuthCode(code);
          if (exchangeError) {
            console.warn('Manual exchange warning (may already be auto-exchanged):', exchangeError.message);
          }
        }

        // Fetch current user from InsForge session
        const { data: authData, error: userError } = await api.insforge.auth.getCurrentUser();
        if (userError || !authData?.user) {
          throw new Error(userError?.message || 'Failed to retrieve authenticated user profile from Google session.');
        }

        const googleUser = authData.user;
        const userEmail = (googleUser.email || '').trim().toLowerCase();

        // Check if designated administrator
        const isDesignatedAdmin =
          userEmail === 'rahulekhar18@gmail.com' || userEmail === 'admin@ycce.edu';

        // College domain restriction: Allow student access only when email ends with @ycce.in
        if (!isDesignatedAdmin && !userEmail.endsWith('@ycce.in')) {
          await api.insforge.auth.signOut();
          setInvalidEmail(userEmail);
          setLoading(false);
          return;
        }

        // Sync with YCCify backend & prevent duplicate profiles
        const res = await api.auth.syncGoogleSession({
          email: userEmail,
          name: googleUser.profile?.name || (googleUser as any).name,
          avatarUrl: googleUser.profile?.avatar_url || (googleUser as any).avatar_url,
        });

        updateUser(res.user);

        if (res.user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (err: any) {
        console.error('OAuth Callback Processing Error:', err);
        setError(err.message || 'An unexpected error occurred while completing Google Sign-In.');
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, updateUser]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-card border border-slate-200 text-center space-y-6">
          <Link to="/" className="inline-block">
            <img
              src="/assets/logo.jpg"
              alt="YCCify"
              className="w-14 h-14 rounded-2xl shadow-md mx-auto object-cover"
            />
          </Link>

          {loading && (
            <div className="space-y-4 py-6">
              <div className="w-10 h-10 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mx-auto"></div>
              <h2 className="text-lg font-bold text-slate-800">Verifying Google Account...</h2>
              <p className="text-xs text-slate-400">
                Authorizing your college session with YCCE credentials
              </p>
            </div>
          )}

          {invalidEmail && (
            <div className="space-y-4 py-2 text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h2 className="text-base font-black text-slate-900">Access Restricted</h2>
                <p className="text-xs text-slate-500 mt-1">Official College Domain Required</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-800 space-y-2">
                <p>
                  Only verified institutional email accounts ending with{' '}
                  <span className="font-bold">@ycce.in</span> are authorized to access student services.
                </p>
                <p className="text-slate-600">
                  Signed in with: <span className="font-mono font-bold text-slate-800">{invalidEmail}</span>
                </p>
              </div>

              <Link
                to="/login"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In with @ycce.in</span>
              </Link>
            </div>
          )}

          {error && !invalidEmail && (
            <div className="space-y-4 py-2 text-left">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h2 className="text-base font-black text-slate-900">Authentication Failed</h2>
                <p className="text-xs text-slate-500 mt-1">Could not complete Google Sign-In</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-200 text-xs text-red-700">
                {error}
              </div>

              <Link
                to="/login"
                className="w-full py-3 rounded-xl bg-brand-blue hover:bg-brand-hover text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default OAuthCallbackPage;
