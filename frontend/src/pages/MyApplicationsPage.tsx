import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { applicationApi } from '../api/applications';
import StatusBadge from '../components/StatusBadge';
import { FullPageSpinner } from '../components/Spinner';

export default function MyApplicationsPage() {
  const {
    data: applications,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['myApplications'],
    queryFn: applicationApi.myApplications,
  });

  if (isLoading) return <FullPageSpinner />;
  if (isError)
    return (
      <p className="py-20 text-center text-red-500">
        Failed to load applications.
      </p>
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>

      {!applications || applications.length === 0 ? (
        <div className="mt-6 rounded-lg bg-white p-8 text-center shadow">
          <p className="text-gray-500">You haven't applied to any jobs yet.</p>
          <Link
            to="/jobs"
            className="mt-3 inline-block text-indigo-600 hover:underline"
          >
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div>
                <Link
                  to={`/jobs/${app.job_id}`}
                  className="font-medium text-gray-900 hover:text-indigo-600"
                >
                  {app.job_title || 'Job'}
                </Link>
                <p className="text-xs text-gray-500">
                  Applied {new Date(app.created_at).toLocaleDateString()}
                </p>
                {app.cover_letter && (
                  <p className="mt-1 line-clamp-1 text-sm text-gray-600">
                    {app.cover_letter}
                  </p>
                )}
              </div>
              <StatusBadge status={app.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
