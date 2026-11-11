export type UserRole = 'student' | 'faculty' | 'admin';

export interface College {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  collegeId: string;
  name: string;
  code: string;
  icon?: string;
  semestersCount: number;
  coursesCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Semester {
  id: string;
  branchId: string;
  semesterNumber: number;
  academicYear?: string;
  coursesCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Faculty {
  id: string;
  collegeId: string;
  branchId?: string;
  name: string;
  designation: string;
  department: string;
  specialization?: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  assignedCourses?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  semesterId: string;
  branchId: string;
  name: string;
  code: string;
  credits: number;
  description?: string;
  icon?: string;
  facultyName?: string;
  facultyId?: string;
  faculty?: Faculty[];
  resourceCount?: {
    notes: number;
    pyqs: number;
    practicals: number;
    assignments: number;
    total: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ResourceCategory = 'notes' | 'pyqs' | 'practicals' | 'assignments';

export interface ResourceFile {
  id: string;
  resourceId: string;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  fileSizeBytes: number;
  mimeType: string;
  pageCount?: number;
  createdAt: string;
}

export interface Resource {
  id: string;
  courseId: string;
  courseName?: string;
  courseCode?: string;
  branchName?: string;
  branchCode?: string;
  semesterNumber?: number;
  category: ResourceCategory;
  title: string;
  description?: string;
  unitTopic?: string;
  academicYear?: string;
  uploaderId?: string;
  uploaderName?: string;
  uploaderRole?: UserRole;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  downloadsCount: number;
  viewsCount: number;
  isBookmarked?: boolean;
  files: ResourceFile[];
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  resourceId: string;
  resource?: Resource;
  createdAt: string;
}

export interface UploadApproval {
  id: string;
  resourceId: string;
  resource?: Resource;
  reviewedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  password?: string;     // Stored user password for credential authentication
  name: string;
  phone?: string;        // 10-digit mobile number (unique identifier alongside email)
  rollNumber?: string;   // kept for backward compat only, not shown in UI
  collegeId?: string;
  collegeName?: string;
  branchId?: string;
  branchName?: string;
  semesterId?: string;
  semesterNumber?: number;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: UserProfile;
  token: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalBranches: number;
  totalCourses: number;
  totalResources: number;
  pendingApprovals: number;
  categoryCounts: {
    notes: number;
    pyqs: number;
    practicals: number;
    assignments: number;
  };
  recentUploads: Resource[];
  popularResources: Resource[];
}

export interface SearchResult {
  branches: Branch[];
  courses: Course[];
  resources: Resource[];
  faculty: Faculty[];
}

export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserPreferences {
  id?: string;
  userId: string;
  theme: ThemePreference;
  updatedAt?: string;
}

export interface NotificationPreferences {
  id?: string;
  userId: string;
  notesUploaded: boolean;
  pyqsAvailable: boolean;
  facultyAnnouncements: boolean;
  assignmentUpdates: boolean;
  academicNotices: boolean;
  communityReplies: boolean;
  resourceReplies: boolean;
  channelInApp: boolean;
  channelPush: boolean;
  channelEmail: boolean;
  updatedAt?: string;
}

export interface AcademicHistoryRecord {
  id: string;
  userId: string;
  previousSemester: number;
  newSemester: number;
  previousBranchId?: string;
  newBranchId?: string;
  previousBranchName?: string;
  newBranchName?: string;
  academicYear: string;
  changeReason?: string;
  status: 'approved' | 'pending_approval' | 'rejected';
  createdAt: string;
}

export type SupportTicketCategory =
  | 'Login & Account'
  | 'Profile Problems'
  | 'Notes & PYQs'
  | 'Upload Problems'
  | 'Notifications'
  | 'Other Technical Issues';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: SupportTicketCategory;
  subject: string;
  description: string;
  screenshotUrl?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminNotes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentReview {
  id: string;
  studentName: string;
  studentEmail?: string;
  branchCode: string;
  branchName: string;
  batchYear: string;
  semesterNumber?: number;
  rating: number;
  comment: string;
  fileName?: string;
  createdAt: string;
  isApproved: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  avatarSeed?: string;
}

export interface LandingData {
  stats: {
    totalBranches: number;
    totalSemesters: number;
    totalCourses: number;
    totalResources: number;
    totalStudents: number;
    totalViews: number;
    activeStudying: number;
    categoryCounts: {
      notes: number;
      pyqs: number;
      practicals: number;
      assignments: number;
    };
  };
  recentUploads: Array<{
    id: string;
    title: string;
    courseName?: string;
    branchCode?: string;
    semesterNumber?: number;
    category: string;
    fileSizeBytes: number;
    createdAt: string;
  }>;
  folderTree: {
    branchCode: string;
    branchName: string;
    semesters: Array<{
      semesterNumber: number;
      courseName: string;
      files: Array<{
        id: string;
        title: string;
        fileSizeBytes: number;
        category: string;
        isLocked?: boolean;
      }>;
    }>;
  };
  reviews: StudentReview[];
  recentActivity: Array<{
    id: string;
    text: string;
    badge: string;
    timeAgo: string;
    type: 'unlock' | 'credit' | 'upload' | 'view';
  }>;
}



