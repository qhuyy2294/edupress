/**
 * AppRouter Component
 * Main routing configuration with protected routes
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from '../components/Loader';

// Import pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CourseDetailPage from '../pages/CourseDetailPage';
import AdminDashboard from '../pages/AdminDashboard';
import MyCoursesPage from '../pages/MyCoursesPage';
import ProfilePage from '../pages/ProfilePage';
import BecomeProviderPage from '../pages/BecomeProviderPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import CourseReviewPage from '../pages/CourseReviewPage';
import LessonPage from '../pages/LessonPage';
import CreateCoursePage from '../pages/CreateCoursePage';
import LessonManagementPage from '../pages/LessonManagementPage';
import CustomerManagementPage from '../pages/CustomerManagementPage';
import CourseManagementPage from '../pages/CourseManagementPage';
import NotificationsPage from '../pages/NotificationsPage';
import RevenueReportPage from '../pages/RevenueReportPage';
import DiscountManagementPage from '../pages/DiscountManagementPage';


/**
 * ProtectedRoute Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader message="Loading..." />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

/**
 * AdminRoute Component
 * Redirects if user is not admin
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loader message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return isAdmin() ? children : <Navigate to="/" />;
};

/**
 * ProviderRoute Component
 * Redirects if user is not provider
 */
const ProviderRoute = ({ children }) => {
  const { isAuthenticated, isProvider, loading } = useAuth();

  if (loading) {
    return <Loader message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return isProvider() ? children : <Navigate to="/" />;
};

/**
 * CustomerRoute Component
 * Redirects if user is not customer
 */
const CustomerRoute = ({ children }) => {
  const { isAuthenticated, isCustomer, loading } = useAuth();

  if (loading) {
    return <Loader message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return isCustomer() ? children : <Navigate to="/" />;
};

/**
 * Main AppRouter Component
 */
const AppRouter = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/course/:id" element={<CourseDetailPage />} />

            {/* Protected Routes - Admin */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <AdminRoute>
                  <CustomerManagementPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <AdminRoute>
                  <CourseManagementPage />
                </AdminRoute>
              }
            />

            {/* Protected Routes - My Courses (Provider & Customer) */}
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute>
                  <MyCoursesPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Profile (All Users) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Notifications (All Users) */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Course Review (Enrolled Students) */}
            <Route
              path="/courses/:id/review"
              element={
                <ProtectedRoute>
                  <CourseReviewPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Lesson Viewer (Enrolled Students) */}
            <Route
              path="/courses/:courseId/lessons/:lessonId"
              element={
                <ProtectedRoute>
                  <LessonPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Become Provider (Customer Only) */}
            <Route
              path="/become-provider"
              element={
                <CustomerRoute>
                  <BecomeProviderPage />
                </CustomerRoute>
              }
            />

            {/* Protected Routes - Create/Edit Course (Provider Only) */}
            <Route
              path="/course/create"
              element={
                <ProviderRoute>
                  <CreateCoursePage />
                </ProviderRoute>
              }
            />
            <Route
              path="/course/:id/edit"
              element={
                <ProviderRoute>
                  <CreateCoursePage />
                </ProviderRoute>
              }
            />
            <Route
              path="/course/:courseId/lessons"
              element={
                <ProviderRoute>
                  <LessonManagementPage />
                </ProviderRoute>
              }
            />
            <Route
              path="/provider/revenue"
              element={
                <ProviderRoute>
                  <RevenueReportPage />
                </ProviderRoute>
              }
            />
            <Route
              path="/provider/discounts"
              element={
                <ProviderRoute>
                  <DiscountManagementPage />
                </ProviderRoute>
              }
            />

            {/* Catch all - 404 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default AppRouter;
