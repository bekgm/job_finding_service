import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { FullPageSpinner } from './components/Spinner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobListPage from './pages/JobListPage';
import JobDetailPage from './pages/JobDetailPage';
import EmployerDashboardPage from './pages/EmployerDashboardPage';
import CreateJobPage from './pages/CreateJobPage';
import ProfilePage from './pages/ProfilePage';
import MyApplicationsPage from './pages/MyApplicationsPage';

function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<JobListPage />} />
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />

          {/* Authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Candidate only */}
          <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
            <Route path="/applications" element={<MyApplicationsPage />} />
          </Route>

          {/* Employer only */}
          <Route element={<ProtectedRoute allowedRoles={['employer']} />}>
            <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
            <Route path="/employer/jobs/new" element={<CreateJobPage />} />
            <Route path="/employer/jobs/:id/edit" element={<CreateJobPage />} />
          </Route>
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
