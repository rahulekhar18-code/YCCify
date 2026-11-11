import { createClient, InsForgeClient } from '@insforge/sdk';
import {
  UserProfile,
  Branch,
  Semester,
  Course,
  Faculty,
  Resource,
  ResourceFile,
  UploadApproval,
  DashboardStats,
  SearchResult,
  NotificationItem,
  UserPreferences,
  NotificationPreferences,
  AcademicHistoryRecord,
  SupportTicket,
  SupportTicketCategory,
  StudentReview,
  LandingData,
} from '@yccify/types';

// Storage key for auth token
const TOKEN_STORAGE_KEY = 'yccify_auth_token';

// Configuration defaults
const DEFAULT_INSFORGE_URL = 'https://qeu83egy.us-east.insforge.app';
const DEFAULT_INSFORGE_ANON_KEY = 'ik_7b6c456b685597bfbe0d1b28f8fcbda1';

// For local/browser development, use relative URL (Vite proxy) or port 7130
let DEFAULT_API_URL = typeof window !== 'undefined' ? '' : 'http://localhost:7130';
let INSFORGE_URL = DEFAULT_INSFORGE_URL;
let INSFORGE_ANON_KEY = DEFAULT_INSFORGE_ANON_KEY;

try {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    if (import.meta.env.VITE_API_URL !== undefined) DEFAULT_API_URL = import.meta.env.VITE_API_URL;
    // @ts-ignore
    if (import.meta.env.VITE_INSFORGE_URL) INSFORGE_URL = import.meta.env.VITE_INSFORGE_URL;
    // @ts-ignore
    if (import.meta.env.VITE_INSFORGE_ANON_KEY) INSFORGE_ANON_KEY = import.meta.env.VITE_INSFORGE_ANON_KEY;
  }
} catch (e) {}

if (typeof process !== 'undefined' && process.env) {
  if (process.env.VITE_API_URL !== undefined) DEFAULT_API_URL = process.env.VITE_API_URL;
  else if (process.env.EXPO_PUBLIC_API_URL) DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL;

  if (process.env.VITE_INSFORGE_URL) INSFORGE_URL = process.env.VITE_INSFORGE_URL;
  else if (process.env.EXPO_PUBLIC_INSFORGE_URL) INSFORGE_URL = process.env.EXPO_PUBLIC_INSFORGE_URL;
  else if (process.env.INSFORGE_URL) INSFORGE_URL = process.env.INSFORGE_URL;

  if (process.env.VITE_INSFORGE_ANON_KEY) INSFORGE_ANON_KEY = process.env.VITE_INSFORGE_ANON_KEY;
  else if (process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY) INSFORGE_ANON_KEY = process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY;
  else if (process.env.INSFORGE_ANON_KEY) INSFORGE_ANON_KEY = process.env.INSFORGE_ANON_KEY;
}

class ApiService {
  private baseUrl: string;
  private insforgeUrl: string;
  private insforgeKey: string;
  private token: string | null = null;
  public insforge: InsForgeClient;

  constructor() {
    this.baseUrl = DEFAULT_API_URL;
    this.insforgeUrl = INSFORGE_URL;
    this.insforgeKey = INSFORGE_ANON_KEY;
    
    // Initialize official InsForge SDK client
    this.insforge = createClient({
      baseUrl: this.insforgeUrl,
      anonKey: this.insforgeKey,
    });

    // Attempt to load token from localStorage if available
    const storage = typeof globalThis !== 'undefined' ? (globalThis as any).localStorage : null;
    if (storage) {
      this.token = storage.getItem(TOKEN_STORAGE_KEY);
    }
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setToken(token: string | null) {
    this.token = token;
    const storage = typeof globalThis !== 'undefined' ? (globalThis as any).localStorage : null;
    if (storage) {
      if (token) {
        storage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        storage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
    // Update InsForge client with access token
    this.insforge = createClient({
      baseUrl: this.insforgeUrl,
      anonKey: this.insforgeKey,
      accessToken: token || undefined,
    });
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : (this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const text = await response.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Server returned non-JSON response (${response.status}): ${text.slice(0, 120)}`);
    }

    if (!response.ok) {
      throw new Error(json.error || `Request failed with status ${response.status}`);
    }

    return (json.data !== undefined ? json.data : json) as T;
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  public auth = {
    signInWithGoogle: async (redirectTo?: string): Promise<{ url?: string; error?: any }> => {
      const redirect = redirectTo || (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '');
      const res = await this.insforge.auth.signInWithOAuth('google', {
        redirectTo: redirect,
        additionalParams: { prompt: 'select_account' },
        skipBrowserRedirect: false,
      });
      return { url: res.data?.url, error: res.error };
    },

    syncGoogleSession: async (data: {
      email: string;
      name?: string;
      avatarUrl?: string;
      insforgeToken?: string;
    }): Promise<{ user: UserProfile; session: { accessToken: string } }> => {
      const res = await this.request<{ user: UserProfile; session: { accessToken: string } }>(
        '/api/auth/google-session',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      this.setToken(res.session.accessToken);
      return res;
    },

    initiateRegistration: async (params: {
      name: string;
      email: string;
      phone: string;
      prn: string;
      branchId?: string;
      semesterNumber?: number;
      password: string;
      confirmPassword: string;
    }): Promise<{ success: boolean; message: string; simulatedEmailOtp?: string; simulatedMobileOtp?: string }> => {
      return this.request<{ success: boolean; message: string; simulatedEmailOtp?: string; simulatedMobileOtp?: string }>(
        '/api/auth/register-initiate',
        {
          method: 'POST',
          body: JSON.stringify(params),
        }
      );
    },

    verifyRegistration: async (params: {
      email: string;
      phone: string;
      prn: string;
      emailOtp: string;
      mobileOtp: string;
    }): Promise<{ user: UserProfile; session: { accessToken: string } }> => {
      const data = await this.request<{ user: UserProfile; session: { accessToken: string } }>(
        '/api/auth/register-verify',
        {
          method: 'POST',
          body: JSON.stringify(params),
        }
      );
      this.setToken(data.session.accessToken);
      return data;
    },

    signUp: async (params: {
      email: string;
      password: string;
      name: string;
      phone?: string;        // 10-digit mobile number (unique)
      rollNumber?: string;
      branchId?: string;
      semesterNumber?: number;
      role?: 'student' | 'admin';
    }): Promise<{ user: UserProfile; session: { accessToken: string } }> => {
      const data = await this.request<{ user: UserProfile; session: { accessToken: string } }>(
        '/api/auth/sign-up',
        {
          method: 'POST',
          body: JSON.stringify(params),
        }
      );
      this.setToken(data.session.accessToken);
      return data;
    },

    signIn: async (params: {
      email?: string;
      phone?: string;        // 10-digit mobile number login
      rollNumber?: string;   // kept for backward compat
      password?: string;
      role?: 'student' | 'admin';
    }): Promise<{ user: UserProfile; session: { accessToken: string } }> => {
      const data = await this.request<{ user: UserProfile; session: { accessToken: string } }>(
        '/api/auth/sign-in',
        {
          method: 'POST',
          body: JSON.stringify(params),
        }
      );
      this.setToken(data.session.accessToken);
      return data;
    },

    getCurrentUser: async (): Promise<UserProfile | null> => {
      try {
        const data = await this.request<{ user: UserProfile }>('/api/auth/current-user');
        return data.user;
      } catch (err) {
        return null;
      }
    },

    signOut: async (): Promise<void> => {
      try {
        await this.request('/api/auth/sign-out', { method: 'POST' });
      } finally {
        this.setToken(null);
      }
    },

    resetPassword: async (params: {
      email: string;
      phone: string;
      newPassword: string;
    }): Promise<{ success: boolean; message: string }> => {
      return this.request<{ success: boolean; message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },

    updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
      const data = await this.request<{ user: UserProfile }>('/api/auth/profile', {
        method: 'POST',
        body: JSON.stringify(updates),
      });
      return data.user;
    },
  };

  // ============================================================================
  // ACADEMICS (Branches, Semesters, Courses, Faculty)
  // ============================================================================
  public academic = {
    getBranches: async (): Promise<Branch[]> => {
      return this.request<Branch[]>('/api/database/branches');
    },

    addBranch: async (branch: { name: string; code: string; icon?: string; semestersCount?: number }): Promise<Branch> => {
      return this.request<Branch>('/api/database/branches', {
        method: 'POST',
        body: JSON.stringify(branch),
      });
    },

    updateBranch: async (id: string, updates: Partial<Branch>): Promise<Branch> => {
      return this.request<Branch>(`/api/database/branches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    deleteBranch: async (id: string): Promise<void> => {
      await this.request(`/api/database/branches/${id}`, { method: 'DELETE' });
    },

    getSemesters: async (branchId?: string): Promise<Semester[]> => {
      const query = branchId ? `?branchId=${encodeURIComponent(branchId)}` : '';
      return this.request<Semester[]>(`/api/database/semesters${query}`);
    },

    addSemester: async (sem: { branchId: string; semesterNumber: number; academicYear?: string }): Promise<Semester> => {
      return this.request<Semester>('/api/database/semesters', {
        method: 'POST',
        body: JSON.stringify(sem),
      });
    },

    getCourses: async (filters?: { branchId?: string; semesterId?: string; semesterNumber?: number }): Promise<Course[]> => {
      const params = new URLSearchParams();
      if (filters?.branchId) params.append('branchId', filters.branchId);
      if (filters?.semesterId) params.append('semesterId', filters.semesterId);
      if (filters?.semesterNumber) params.append('semesterNumber', String(filters.semesterNumber));
      const query = params.toString() ? `?${params.toString()}` : '';
      return this.request<Course[]>(`/api/database/courses${query}`);
    },

    getCourseById: async (id: string): Promise<Course> => {
      return this.request<Course>(`/api/database/courses/${id}`);
    },

    addCourse: async (course: {
      semesterId: string;
      branchId: string;
      name: string;
      code: string;
      credits?: number;
      description?: string;
      icon?: string;
      facultyId?: string;
    }): Promise<Course> => {
      return this.request<Course>('/api/database/courses', {
        method: 'POST',
        body: JSON.stringify(course),
      });
    },

    updateCourse: async (id: string, updates: Partial<Course>): Promise<Course> => {
      return this.request<Course>(`/api/database/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    deleteCourse: async (id: string): Promise<void> => {
      await this.request(`/api/database/courses/${id}`, { method: 'DELETE' });
    },

    getFaculty: async (branchId?: string): Promise<Faculty[]> => {
      const query = branchId ? `?branchId=${encodeURIComponent(branchId)}` : '';
      return this.request<Faculty[]>(`/api/database/faculty${query}`);
    },

    addFaculty: async (fac: {
      name: string;
      designation: string;
      department: string;
      specialization?: string;
      email: string;
      phone?: string;
      branchId?: string;
      avatarUrl?: string;
    }): Promise<Faculty> => {
      return this.request<Faculty>('/api/database/faculty', {
        method: 'POST',
        body: JSON.stringify(fac),
      });
    },

    updateFaculty: async (id: string, updates: Partial<Faculty>): Promise<Faculty> => {
      return this.request<Faculty>(`/api/database/faculty/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    deleteFaculty: async (id: string): Promise<void> => {
      await this.request(`/api/database/faculty/${id}`, { method: 'DELETE' });
    },
  };

  // ============================================================================
  // RESOURCES & STORAGE
  // ============================================================================
  public resources = {
    getResources: async (filters?: {
      courseId?: string;
      category?: string;
      status?: 'approved' | 'pending' | 'rejected' | 'all';
      search?: string;
    }): Promise<Resource[]> => {
      const params = new URLSearchParams();
      if (filters?.courseId) params.append('courseId', filters.courseId);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      const query = params.toString() ? `?${params.toString()}` : '';
      return this.request<Resource[]>(`/api/database/resources${query}`);
    },

    getResourceById: async (id: string): Promise<Resource> => {
      return this.request<Resource>(`/api/database/resources/${id}`);
    },

    createResource: async (params: {
      courseId: string;
      category: 'notes' | 'pyqs' | 'practicals' | 'assignments';
      title: string;
      description?: string;
      unitTopic?: string;
      academicYear?: string;
      files: Array<{
        fileName: string;
        fileUrl: string;
        storagePath: string;
        fileSizeBytes: number;
        mimeType: string;
        pageCount?: number;
      }>;
    }): Promise<Resource> => {
      return this.request<Resource>('/api/database/resources', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },

    createResourcesBatch: async (items: Array<{
      courseId: string;
      category: 'notes' | 'pyqs' | 'practicals' | 'assignments';
      title: string;
      description?: string;
      unitTopic?: string;
      academicYear?: string;
      files: Array<{
        fileName: string;
        fileUrl: string;
        storagePath: string;
        fileSizeBytes: number;
        mimeType: string;
        pageCount?: number;
      }>;
    }>): Promise<Resource[]> => {
      return this.request<Resource[]>('/api/database/resources', {
        method: 'POST',
        body: JSON.stringify(items),
      });
    },

    deleteResource: async (id: string): Promise<void> => {
      await this.request(`/api/database/resources/${id}`, { method: 'DELETE' });
    },

    recordView: async (id: string): Promise<void> => {
      await this.request(`/api/database/resources/${id}/view`, { method: 'POST' });
    },

    recordDownload: async (id: string): Promise<void> => {
      await this.request(`/api/database/resources/${id}/download`, { method: 'POST' });
    },
  };

  public storage = {
    uploadFiles: async (files: File[] | any[]): Promise<ResourceFile[]> => {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }

      const headers: Record<string, string> = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const res = await fetch(`${this.baseUrl}/api/storage/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json.error || 'File upload failed');
      return json.data;
    },

    getFileUrl: (pathOrUrl: string, download = false): string => {
      if (pathOrUrl.startsWith('http')) return pathOrUrl;
      const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
      const url = `${this.baseUrl}${cleanPath}`;
      return download ? `${url}?download=true` : url;
    },
  };

  // ============================================================================
  // BOOKMARKS
  // ============================================================================
  public bookmarks = {
    getBookmarks: async (): Promise<Resource[]> => {
      return this.request<Resource[]>('/api/database/bookmarks');
    },

    toggleBookmark: async (resourceId: string): Promise<{ isBookmarked: boolean }> => {
      return this.request<{ isBookmarked: boolean }>('/api/database/bookmarks', {
        method: 'POST',
        body: JSON.stringify({ resourceId }),
      });
    },
  };

  // ============================================================================
  // ADMIN & APPROVALS
  // ============================================================================
  public admin = {
    getApprovals: async (): Promise<UploadApproval[]> => {
      return this.request<UploadApproval[]>('/api/database/approvals');
    },

    reviewApproval: async (
      approvalId: string,
      status: 'approved' | 'rejected',
      remarks?: string
    ): Promise<UploadApproval> => {
      return this.request<UploadApproval>(`/api/database/approvals/${approvalId}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, remarks }),
      });
    },

    getStudents: async (): Promise<UserProfile[]> => {
      return this.request<UserProfile[]>('/api/database/students');
    },

    getStats: async (): Promise<DashboardStats> => {
      return this.request<DashboardStats>('/api/database/stats');
    },
  };

  // ============================================================================
  // GLOBAL SEARCH & NOTIFICATIONS
  // ============================================================================
  public search = {
    query: async (q: string): Promise<SearchResult> => {
      return this.request<SearchResult>(`/api/database/search?q=${encodeURIComponent(q)}`);
    },
  };

  public notifications = {
    getNotifications: async (): Promise<NotificationItem[]> => {
      return this.request<NotificationItem[]>('/api/database/notifications');
    },

    markAsRead: async (id: string): Promise<void> => {
      await this.request(`/api/database/notifications/${id}/read`, { method: 'POST' });
    },
  };

  // ============================================================================
  // SETTINGS & STUDENT CENTER
  // ============================================================================
  public settings = {
    updateProfile: async (data: { name?: string; avatarUrl?: string }): Promise<{ user: UserProfile }> => {
      const res = await this.request<{ data: { user: UserProfile } }>('/api/settings/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.data;
    },

    requestMobileOtp: async (newMobile: string): Promise<{ success: boolean; message: string; simulatedOtp?: string }> => {
      return this.request<{ success: boolean; message: string; simulatedOtp?: string }>('/api/settings/mobile/request-otp', {
        method: 'POST',
        body: JSON.stringify({ newMobile }),
      });
    },

    verifyMobileOtp: async (newMobile: string, otp: string): Promise<{ success: boolean; message: string; user: UserProfile }> => {
      const res = await this.request<{ success: boolean; message: string; data: { user: UserProfile } }>('/api/settings/mobile/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ newMobile, otp }),
      });
      return { success: res.success, message: res.message, user: res.data.user };
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
      return this.request<{ success: boolean; message: string }>('/api/settings/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },

    updateAcademic: async (data: { semesterNumber?: number; branchId?: string; reason?: string }): Promise<{ success: boolean; requiresApproval?: boolean; message: string; user?: UserProfile }> => {
      const res = await this.request<{ success: boolean; requiresApproval?: boolean; message: string; data?: { user: UserProfile } }>('/api/settings/academic', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return { success: res.success, requiresApproval: res.requiresApproval, message: res.message, user: res.data?.user };
    },

    getAcademicHistory: async (): Promise<AcademicHistoryRecord[]> => {
      const res = await this.request<{ data: AcademicHistoryRecord[] }>('/api/settings/academic/history');
      return res.data;
    },

    getPreferences: async (): Promise<UserPreferences> => {
      const res = await this.request<{ data: UserPreferences }>('/api/settings/preferences');
      return res.data;
    },

    updatePreferences: async (data: Partial<UserPreferences>): Promise<UserPreferences> => {
      const res = await this.request<{ data: UserPreferences }>('/api/settings/preferences', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.data;
    },

    getNotificationPreferences: async (): Promise<NotificationPreferences> => {
      const res = await this.request<{ data: NotificationPreferences }>('/api/settings/notifications');
      return res.data;
    },

    updateNotificationPreferences: async (data: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
      const res = await this.request<{ data: NotificationPreferences }>('/api/settings/notifications', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.data;
    },

    logoutAllDevices: async (): Promise<{ success: boolean; message: string }> => {
      return this.request<{ success: boolean; message: string }>('/api/settings/logout-all', {
        method: 'POST',
      });
    },
  };

  // ============================================================================
  // HELP & SUPPORT
  // ============================================================================
  public support = {
    getTickets: async (): Promise<SupportTicket[]> => {
      const res = await this.request<{ data: SupportTicket[] }>('/api/support/tickets');
      return res.data;
    },

    createTicket: async (data: { category: SupportTicketCategory; subject: string; description: string; screenshotUrl?: string }): Promise<SupportTicket> => {
      const res = await this.request<{ success: boolean; data: SupportTicket }>('/api/support/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.data;
    },

    submitFeedback: async (data: { rating: number; category?: string; feedback: string }): Promise<{ success: boolean; message: string }> => {
      return this.request<{ success: boolean; message: string }>('/api/support/feedback', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  };

  // ============================================================================
  // PUBLIC LANDING & REVIEWS
  // ============================================================================
  public landing = {
    getData: async (): Promise<LandingData> => {
      const res = await this.request<{ data: LandingData }>('/api/public/landing-data');
      return (res as any).data || res;
    },
  };

  public reviews = {
    getReviews: async (): Promise<StudentReview[]> => {
      const res = await this.request<{ data: StudentReview[] }>('/api/public/reviews');
      return (res as any).data || res;
    },

    getMyReviews: async (): Promise<StudentReview[]> => {
      const res = await this.request<{ data: StudentReview[] }>('/api/student/my-reviews');
      return (res as any).data || res;
    },

    submitReview: async (data: {
      studentName: string;
      studentEmail?: string;
      branchCode?: string;
      branchName?: string;
      batchYear?: string;
      semesterNumber?: number;
      rating: number;
      comment: string;
    }): Promise<{ success: boolean; data: StudentReview }> => {
      return this.request<{ success: boolean; data: StudentReview }>('/api/public/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getAdminReviews: async (status?: 'pending' | 'approved' | 'rejected' | 'all'): Promise<StudentReview[]> => {
      const query = status && status !== 'all' ? `?status=${status}` : '';
      const res = await this.request<{ data: StudentReview[] }>(`/api/admin/reviews${query}`);
      return (res as any).data || res;
    },

    approveReview: async (id: string): Promise<{ success: boolean; data: StudentReview }> => {
      return this.request<{ success: boolean; data: StudentReview }>(`/api/admin/reviews/${id}/approve`, {
        method: 'POST',
      });
    },

    rejectReview: async (id: string, reason?: string): Promise<{ success: boolean; data: StudentReview }> => {
      return this.request<{ success: boolean; data: StudentReview }>(`/api/admin/reviews/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },

    deleteReview: async (id: string): Promise<{ success: boolean; message: string }> => {
      return this.request<{ success: boolean; message: string }>(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      });
    },
  };
}

export const api = new ApiService();
export default api;
