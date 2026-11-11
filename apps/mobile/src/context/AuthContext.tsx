import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import { UserProfile, NotificationItem } from '@yccify/types';
import api from '@yccify/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (emailOrPhone: string, password?: string, role?: 'student' | 'admin') => Promise<void>;
  register: (data: any) => Promise<void>;
  updateUser: (data: Partial<UserProfile> | UserProfile) => void;
  logout: () => Promise<void>;
  notifications: NotificationItem[];
  unreadCount: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // Attempt to load current user
    api.auth
      .getCurrentUser()
      .then((u) => {
        if (u) {
          setUser(u);
          api.notifications.getNotifications().then(setNotifications).catch(() => { });
        }
      })
      .finally(() => setLoading(false));

    // Handle OAuth Deep Links (e.g., yccify://auth/callback?insforge_code=...)
    const handleDeepLink = async (url: string | null) => {
      if (!url) return;
      const codeMatch = url.match(/[?&](?:insforge_code|code)=([^&#]*)/);
      const code = codeMatch ? decodeURIComponent(codeMatch[1]) : undefined;

      if (!code && !url.includes('auth/callback')) return;

      setLoading(true);
      try {
        if (code) {
          await api.insforge.auth.exchangeOAuthCode(code).catch(() => {});
        }

        const { data: authData, error: userError } = await api.insforge.auth.getCurrentUser();
        if (userError || !authData?.user) {
          throw new Error(userError?.message || 'Failed to retrieve Google user.');
        }

        const googleUser = authData.user;
        const userEmail = (googleUser.email || '').trim().toLowerCase();
        const isDesignatedAdmin =
          userEmail === 'rahulekhar18@gmail.com' || userEmail === 'admin@ycce.edu';

        if (!isDesignatedAdmin && !userEmail.endsWith('@ycce.in')) {
          await api.insforge.auth.signOut().catch(() => {});
          Alert.alert(
            'Access Denied',
            `Only official college email addresses ending with @ycce.in are permitted. You signed in with ${userEmail}.`
          );
          return;
        }

        const res = await api.auth.syncGoogleSession({
          email: userEmail,
          name: googleUser.profile?.name || (googleUser as any).name,
          avatarUrl: googleUser.profile?.avatar_url || (googleUser as any).avatar_url,
        });

        setUser(res.user);
        const notifs = await api.notifications.getNotifications().catch(() => []);
        setNotifications(notifs);
      } catch (err: any) {
        console.error('Mobile Google OAuth Error:', err);
        Alert.alert('Google Sign-In Error', err.message || 'Failed to complete Google authentication.');
      } finally {
        setLoading(false);
      }
    };

    const sub = Linking.addEventListener('url', (event) => handleDeepLink(event.url));
    Linking.getInitialURL().then(handleDeepLink);

    return () => {
      sub.remove();
    };
  }, []);

  const login = async (emailOrPhone: string, password = 'password123', role?: 'student' | 'admin') => {
    setLoading(true);
    try {
      const trimmed = emailOrPhone.trim();
      const isEmail = trimmed.includes('@');
      const isPhone = /^\d{10}$/.test(trimmed);
      const res = await api.auth.signIn({
        email: isEmail ? trimmed : undefined,
        phone: isPhone ? trimmed : undefined,
        rollNumber: !isEmail && !isPhone ? trimmed : undefined,
        password,
        role,
      });
      setUser(res.user);
      const notifs = await api.notifications.getNotifications();
      setNotifications(notifs);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.auth.signUp(data);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (data: Partial<UserProfile> | UserProfile) => {
    setUser((prev) => (prev ? { ...prev, ...data } : (data as UserProfile)));
  };

  const logout = async () => {
    try {
      await api.auth.signOut();
      setUser(null);
      setNotifications([]);
    } catch (e) { }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateUser,
        logout,
        notifications,
        unreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

