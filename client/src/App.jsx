import { Routes, Route } from 'react-router-dom';

// Public
import LandingPage from './pages/LandingPage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import TutorProfilePage from './pages/TutorProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// New Features
import AIAssistantPage from './pages/AIAssistantPage';
import StudyRoomsPage from './pages/StudyRoomsPage';
import ResourceHubPage from './pages/ResourceHubPage';
import QuizPage from './pages/QuizPage';
import ThemeCustomizerPage from './pages/ThemeCustomizerPage';

// Student
import StudentDashboard from './pages/StudentDashboard';
import StudentBookingsPage from './pages/StudentBookingsPage';
import FavoritesPage from './pages/FavoritesPage';
import StudentPaymentsPage from './pages/StudentPaymentsPage';
import StudentSettingsPage from './pages/StudentSettingsPage';
import BookingPage from './pages/BookingPage';

// Tutor
import TutorDashboard from './pages/TutorDashboard';
import TutorProfileManagementPage from './pages/TutorProfileManagementPage';
import TutorSchedulePage from './pages/TutorSchedulePage';
import TutorBookingsRequestsPage from './pages/TutorBookingsRequestsPage';
import TutorEarningsPage from './pages/TutorEarningsPage';
import TutorSettingsPage from './pages/TutorSettingsPage';

// Shared
import ChatPage from './pages/ChatPage';
import LiveClassroomPage from './pages/LiveClassroomPage';

// Admin
import AdminDashboard from './pages/AdminDashboard';
import AdminVerifyPage from './pages/AdminVerifyPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSubjectsPage from './pages/AdminSubjectsPage';
import AdminPaymentsPage from './pages/AdminPaymentsPage';
import AdminDisputesPage from './pages/AdminDisputesPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

import { useEffect } from 'react';
import useAuthStore from './store/authStore';

export default function App() {
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/tutors/:id" element={<TutorProfilePage />} />

      {/* New Feature Pages */}
      <Route path="/ai-assistant" element={<AIAssistantPage />} />
      <Route path="/study-rooms" element={<StudyRoomsPage />} />
      <Route path="/resources" element={<ResourceHubPage />} />
      <Route path="/quizzes" element={<QuizPage />} />
      <Route path="/themes" element={<ThemeCustomizerPage />} />

      {/* Student */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/bookings" element={<StudentBookingsPage />} />
      <Route path="/student/favorites" element={<FavoritesPage />} />
      <Route path="/student/payments" element={<StudentPaymentsPage />} />
      <Route path="/student/settings" element={<StudentSettingsPage />} />
      <Route path="/booking/:tutorId" element={<BookingPage />} />

      {/* Tutor */}
      <Route path="/tutor/dashboard" element={<TutorDashboard />} />
      <Route path="/tutor/profile" element={<TutorProfileManagementPage />} />
      <Route path="/tutor/schedule" element={<TutorSchedulePage />} />
      <Route path="/tutor/bookings" element={<TutorBookingsRequestsPage />} />
      <Route path="/tutor/earnings" element={<TutorEarningsPage />} />
      <Route path="/tutor/settings" element={<TutorSettingsPage />} />

      {/* Shared */}
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/classroom/:bookingId" element={<LiveClassroomPage />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/verify" element={<AdminVerifyPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/subjects" element={<AdminSubjectsPage />} />
      <Route path="/admin/payments" element={<AdminPaymentsPage />} />
      <Route path="/admin/disputes" element={<AdminDisputesPage />} />
      <Route path="/admin/settings" element={<AdminSettingsPage />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
