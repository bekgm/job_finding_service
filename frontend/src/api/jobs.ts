import api from '../lib/axios';
import type {
  Job,
  JobCreate,
  JobDetail,
  JobFilter,
  PaginatedResponse,
} from '../types';

export const jobApi = {
  list: (params: JobFilter & { page?: number; size?: number }) =>
    api
      .get<PaginatedResponse<JobDetail>>('/jobs', { params })
      .then((r) => r.data),

  getById: (id: string) =>
    api.get<JobDetail>(`/jobs/${id}`).then((r) => r.data),

  create: (data: JobCreate) =>
    api.post<Job>('/jobs', data).then((r) => r.data),

  update: (id: string, data: Partial<JobCreate> & { is_active?: boolean }) =>
    api.patch<Job>(`/jobs/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/jobs/${id}`),

  myJobs: () =>
    api.get<Job[]>('/jobs/employer/my-jobs').then((r) => r.data),
};
