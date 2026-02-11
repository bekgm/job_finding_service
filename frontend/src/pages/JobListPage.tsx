import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { jobApi } from '../api/jobs';
import type { JobFilter, JobType } from '../types';

const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
};

export default function JobListPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<JobFilter>({});
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobs', page, filters],
    queryFn: () => jobApi.list({ ...filters, page, size: 12 }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setFilters((f) => ({ ...f, search: searchInput || undefined }));
  };

  const updateFilter = (key: keyof JobFilter, value: any) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value || undefined }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>

      {/* ── Filters ─────────────────────────────── */}
      <div className="mt-6 rounded-lg bg-white p-4 shadow">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Search
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filters.is_remote === true}
              onChange={(e) =>
                updateFilter('is_remote', e.target.checked ? true : undefined)
              }
              className="rounded border-gray-300"
            />
            Remote only
          </label>

          <select
            value={filters.job_type || ''}
            onChange={(e) => updateFilter('job_type', e.target.value || undefined)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="">All types</option>
            {Object.entries(JOB_TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min salary"
            value={filters.salary_min ?? ''}
            onChange={(e) =>
              updateFilter('salary_min', e.target.value ? +e.target.value : undefined)
            }
            className="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
          <input
            type="number"
            placeholder="Max salary"
            value={filters.salary_max ?? ''}
            onChange={(e) =>
              updateFilter('salary_max', e.target.value ? +e.target.value : undefined)
            }
            className="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* ── Loading / Error ─────────────────────── */}
      {isLoading && (
        <p className="mt-8 text-center text-gray-500">Loading jobs...</p>
      )}
      {isError && (
        <p className="mt-8 text-center text-red-500">Failed to load jobs.</p>
      )}

      {/* ── Job Cards ──────────────────────────── */}
      {data && (
        <>
          {data.items.length === 0 ? (
            <p className="mt-8 text-center text-gray-500">No jobs found.</p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="rounded-lg bg-white p-5 shadow transition hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {job.title}
                  </h3>
                  <p className="mt-1 text-sm text-indigo-600">
                    {job.company.name}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {job.is_remote && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                        Remote
                      </span>
                    )}
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                      {JOB_TYPE_LABELS[job.job_type]}
                    </span>
                    {job.location && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                        {job.location}
                      </span>
                    )}
                  </div>
                  {(job.salary_min || job.salary_max) && (
                    <p className="mt-2 text-sm text-gray-500">
                      {job.salary_min ? `$${job.salary_min.toLocaleString()}` : ''}
                      {job.salary_min && job.salary_max ? ' – ' : ''}
                      {job.salary_max ? `$${job.salary_max.toLocaleString()}` : ''}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* ── Pagination ──────────────────────── */}
          {data.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {data.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
