import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            JobBoard
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/jobs" className="text-gray-700 hover:text-indigo-600">
              Jobs
            </Link>

            {isAuthenticated && user ? (
              <>
                {user.role === 'employer' && (
                  <Link
                    to="/employer/dashboard"
                    className="text-gray-700 hover:text-indigo-600"
                  >
                    Dashboard
                  </Link>
                )}
                {user.role === 'candidate' && (
                  <Link
                    to="/applications"
                    className="text-gray-700 hover:text-indigo-600"
                  >
                    My Applications
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="rounded-md bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-md border border-indigo-600 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
