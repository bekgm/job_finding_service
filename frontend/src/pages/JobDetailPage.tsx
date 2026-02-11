import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApi } from '../api/jobs';
import { applicationApi } from '../api/applications';
import { useAuthStore } from '../stores/authStore';

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState('');

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getById(id!),
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: (formData: FormData) => applicationApi.apply(id!, formData),
    onSuccess: () => {
      setApplied(true);
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
    },
    onError: (err: any) => {
      setApplyError(err.response?.data?.detail || 'Failed to apply');
    },
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError('');
    const formData = new FormData();
    if (coverLetter) formData.append('cover_letter', coverLetter);
    if (resume) formData.append('resume', resume);
    applyMutation.mutate(formData);
  };

  if (isLoading) {
    return <p className="py-20 text-center text-gray-500">Loading...</p>;
  }
  if (isError || !job) {
    return <p className="py-20 text-center text-red-500">Job not found.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/jobs" className="text-sm text-indigo-600 hover:underline">
        &larr; Back to jobs
      </Link>

      <div className="mt-4 rounded-lg bg-white p-6 shadow">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="mt-1 text-indigo-600">{job.company.name}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {job.is_remote && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                Remote
              </span>
            )}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
              {JOB_TYPE_LABELS[job.job_type]}
            </span>
          </div>
        </div>

        {job.location && (
          <p className="mt-2 text-sm text-gray-500">📍 {job.location}</p>
        )}
        {(job.salary_min || job.salary_max) && (
          <p className="mt-1 text-sm text-gray-500">
            💰{' '}
            {job.salary_min ? `$${job.salary_min.toLocaleString()}` : ''}
            {job.salary_min && job.salary_max ? ' – ' : ''}
            {job.salary_max ? `$${job.salary_max.toLocaleString()}` : ''}
          </p>
        )}

        <hr className="my-4" />
        <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
          {job.description}
        </div>
      </div>

      {/* ── Apply Form (Candidate only) ─────────── */}
      {isAuthenticated && user?.role === 'candidate' && (
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          {applied ? (
            <div className="rounded bg-green-50 p-4 text-green-700">
              Application submitted successfully!
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Apply for this position
              </h2>

              {applyError && (
                <div className="rounded bg-red-50 p-3 text-sm text-red-600">
                  {applyError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cover Letter (optional)
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Resume (PDF, max 5MB)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResume(e.target.files?.[0] ?? null)}
                  className="mt-1 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={applyMutation.isPending}
                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      )}

      {!isAuthenticated && (
        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-center">
          <Link to="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>{' '}
          to apply for this job
        </div>
      )}
    </div>
  );
}
