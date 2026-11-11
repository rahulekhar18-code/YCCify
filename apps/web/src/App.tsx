import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';

// Student Pages
import { StudentDashboard } from './pages/StudentDashboard';
import { ExplorePage } from './pages/ExplorePage';
import { SemesterSelectPage } from './pages/SemesterSelectPage';
import { CourseListPage } from './pages/CourseListPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { PdfViewerPage } from './pages/PdfViewerPage';
import { UploadPage } from './pages/UploadPage';
import { SavedResourcesPage } from './pages/SavedResourcesPage';
import { FacultyDirectoryPage } from './pages/FacultyDirectoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { StudentReviewsPage } from './pages/StudentReviewsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBranches } from './pages/admin/AdminBranches';
import { AdminSemesters } from './pages/admin/AdminSemesters';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminFaculty } from './pages/admin/AdminFaculty';
import { AdminResources } from './pages/admin/AdminResources';
import { AdminApprovals } from './pages/admin/AdminApprovals';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminReports, AdminSettings } from './pages/admin/AdminReportsAndSettings';

// Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-dark">
        <div className="w-8 h-8 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-dark">
        <div className="w-8 h-8 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<OAuthCallbackPage />} />

            {/* Student Protected Hierarchy */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/explore/:branchCode" element={<SemesterSelectPage />} />
              <Route path="/explore/:branchCode/sem/:semNum" element={<CourseListPage />} />
              <Route
                path="/explore/:branchCode/sem/:semNum/course/:courseId"
                element={<CourseDetailsPage />}
              />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/saved" element={<SavedResourcesPage />} />
              <Route path="/faculty" element={<FacultyDirectoryPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/reviews" element={<StudentReviewsPage />} />
              <Route path="/profile" element={<SettingsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

          {/* Dedicated PDF Viewer View */}
          <Route
            path="/preview/:resourceId"
            element={
              <ProtectedRoute>
                <PdfViewerPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Hierarchy */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="branches" element={<AdminBranches />} />
            <Route path="semesters" element={<AdminSemesters />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="faculty" element={<AdminFaculty />} />
            <Route path="resources" element={<AdminResources />} />
            <Route path="approvals" element={<AdminApprovals />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

