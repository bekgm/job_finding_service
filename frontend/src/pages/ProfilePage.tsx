import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { applicationApi } from '../api/applications';
import type { ApplicationStatus } from '../types';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-indigo-100 text-indigo-800',
  rejected: 'bg-red-100 text-red-800',
  accepted: 'bg-green-100 text-green-800',
};

export default function ProfilePage() {
  const { user } = useAuthStore();

  const { data: applications } = useQuery({
    queryKey: ['myApplications'],
    queryFn: applicationApi.myApplications,
    enabled: user?.role === 'candidate',
  });

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
      <div className="mt-6 rounded-lg bg-white p-6 shadow">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="text-lg text-gray-900">{user.full_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="text-lg text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Role</dt>
            <dd className="text-lg capitalize text-gray-900">{user.role}</dd>
          </div>
        </dl>
      </div>

      {/* ── Candidate: My Applications ─────────── */}
      {user.role === 'candidate' && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">
            My Applications
          </h2>
          {!applications || applications.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">
              You haven't applied to any jobs yet.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {app.job_title || 'Job'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Applied{' '}
                      {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                      STATUS_COLORS[app.status]
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
