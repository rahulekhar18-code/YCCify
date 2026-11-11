import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, NotificationItem } from '@yccify/types';
import api from '@yccify/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (emailOrPhone: string, password?: string, role?: 'student' | 'admin') => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    branchId?: string;
    semesterNumber?: number;
    role?: 'student' | 'admin';
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationAsRead: (id: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchCurrentUser = async () => {
    try {
      const currentUser = await api.auth.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        try {
          const notifs = await api.notifications.getNotifications();
          setNotifications(notifs);
        } catch (e) {
          // Ignore notif fetch error
        }
      }
    } catch (err) {
      console.error('Failed to get current user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (emailOrPhone: string, password = 'password123', role?: 'student' | 'admin') => {
    setLoading(true);
    try {
      // Determine if input is email, 10-digit mobile number, or legacy roll number
      const isEmail = emailOrPhone.includes('@');
      const isPhone = /^\d{10}$/.test(emailOrPhone.trim());
      const res = await api.auth.signIn({
        email: isEmail ? emailOrPhone : undefined,
        phone: isPhone ? emailOrPhone.trim() : undefined,
        rollNumber: (!isEmail && !isPhone) ? emailOrPhone : undefined,
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

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    branchId?: string;
    semesterNumber?: number;
    role?: 'student' | 'admin';
  }) => {
    setLoading(true);
    try {
      const res = await api.auth.signUp(data);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.auth.signOut();
      setUser(null);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    const updated = await api.auth.updateProfile(updates);
    setUser(updated);
  };

  const markNotificationAsRead = async (id: string) => {
    await api.notifications.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        notifications,
        unreadCount,
        markNotificationAsRead,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

