import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { jobApi } from '../api/jobs';
import { companyApi } from '../api/companies';
import { applicationApi } from '../api/applications';
import StatusBadge from '../components/StatusBadge';
import { FullPageSpinner } from '../components/Spinner';
import type { ApplicationStatus, Job } from '../types';

export default function EmployerDashboardPage() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['myCompany'],
    queryFn: companyApi.getMine,
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['myJobs'],
    queryFn: jobApi.myJobs,
    enabled: !!company,
  });

  const { data: applications } = useQuery({
    queryKey: ['jobApplications', selectedJob],
    queryFn: () => applicationApi.jobApplications(selectedJob!),
    enabled: !!selectedJob,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      applicationApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplications', selectedJob] });
    },
  });

  const [companyForm, setCompanyForm] = useState({
    name: '',
    description: '',
    website: '',
    location: '',
  });

  const createCompanyMutation = useMutation({
    mutationFn: companyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCompany'] });
    },
  });

  if (companyLoading || jobsLoading) {
    return <FullPageSpinner />;
  }

  // No company yet — show creation form
  if (!company) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">Create your company first</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createCompanyMutation.mutate(companyForm);
            }}
            className="mt-4 space-y-4"
          >
            <input
              required
              placeholder="Company name"
              value={companyForm.name}
              onChange={(e) =>
                setCompanyForm((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <textarea
              placeholder="Description"
              value={companyForm.description}
              onChange={(e) =>
                setCompanyForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              rows={3}
            />
            <input
              placeholder="Website"
              value={companyForm.website}
              onChange={(e) =>
                setCompanyForm((f) => ({ ...f, website: e.target.value }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <input
              placeholder="Location"
              value={companyForm.location}
              onChange={(e) =>
                setCompanyForm((f) => ({ ...f, location: e.target.value }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <button
              type="submit"
              disabled={createCompanyMutation.isPending}
              className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {createCompanyMutation.isPending ? 'Creating...' : 'Create Company'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
          <p className="text-sm text-gray-500">{company.location}</p>
        </div>
        <Link
          to="/employer/jobs/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          + Post a Job
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* ── Job List ──────────────────────────── */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900">Your Jobs</h2>
          {!jobs || jobs.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">No jobs posted yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {jobs.map((job: Job) => (
                <li key={job.id}>
                  <button
                    onClick={() => setSelectedJob(job.id)}
                    className={`w-full rounded-md border p-3 text-left text-sm transition ${
                      selectedJob === job.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-xs text-gray-500">
                      {job.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Applications ─────────────────────── */}
        <div className="lg:col-span-2">
          {selectedJob ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900">
                Applications
              </h2>
              {!applications || applications.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">
                  No applications yet.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-md border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">
                          {app.candidate_name || 'Unknown'}
                        </p>
                        <StatusBadge status={app.status} />
                      </div>
                      {app.cover_letter && (
                        <p className="mt-2 text-sm text-gray-600">
                          {app.cover_letter}
                        </p>
                      )}
                      <div className="mt-3 flex gap-2">
                        {(
                          ['reviewed', 'shortlisted', 'accepted', 'rejected'] as ApplicationStatus[]
                        ).map((s) => (
                          <button
                            key={s}
                            onClick={() =>
                              statusMutation.mutate({ id: app.id, status: s })
                            }
                            disabled={app.status === s}
                            className="rounded border px-2 py-1 text-xs capitalize hover:bg-gray-50 disabled:opacity-30"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">
              Select a job to view applications.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
