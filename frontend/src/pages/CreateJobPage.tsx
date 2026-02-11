import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApi } from '../api/jobs';
import type { JobCreate } from '../types';

const INITIAL: JobCreate = {
  title: '',
  description: '',
  location: '',
  is_remote: false,
  job_type: 'full_time',
  salary_min: undefined,
  salary_max: undefined,
};

export default function CreateJobPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<JobCreate>(INITIAL);
  const [error, setError] = useState('');

  // Load existing job data when editing
  const { data: existingJob } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingJob) {
      setForm({
        title: existingJob.title,
        description: existingJob.description,
        location: existingJob.location ?? '',
        is_remote: existingJob.is_remote,
        job_type: existingJob.job_type,
        salary_min: existingJob.salary_min ?? undefined,
        salary_max: existingJob.salary_max ?? undefined,
      });
    }
  }, [existingJob]);

  const mutation = useMutation({
    mutationFn: (data: JobCreate) =>
      isEdit ? jobApi.update(id!, data) : jobApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myJobs'] });
      navigate('/employer/dashboard');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to save job');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate(form);
  };

  const update = (field: string, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">
        {isEdit ? 'Edit Job' : 'Post a New Job'}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5 rounded-lg bg-white p-6 shadow"
      >
        {error && (
          <div className="rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Job Title
          </label>
          <input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            required
            rows={6}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Job Type
            </label>
            <select
              value={form.job_type}
              onChange={(e) => update('job_type', e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.is_remote}
            onChange={(e) => update('is_remote', e.target.checked)}
            className="rounded border-gray-300"
          />
          Remote position
        </label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Salary Min ($)
            </label>
            <input
              type="number"
              value={form.salary_min ?? ''}
              onChange={(e) =>
                update('salary_min', e.target.value ? +e.target.value : undefined)
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Salary Max ($)
            </label>
            <input
              type="number"
              value={form.salary_max ?? ''}
              onChange={(e) =>
                update('salary_max', e.target.value ? +e.target.value : undefined)
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {mutation.isPending
              ? 'Saving...'
              : isEdit
                ? 'Update Job'
                : 'Create Job'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/employer/dashboard')}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
