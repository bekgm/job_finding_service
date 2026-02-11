import api from '../lib/axios';
import type { Application, ApplicationStatus } from '../types';

export const applicationApi = {
  apply: (jobId: string, formData: FormData) =>
    api
      .post<Application>(`/applications/jobs/${jobId}/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  myApplications: () =>
    api.get<Application[]>('/applications/me').then((r) => r.data),

  jobApplications: (jobId: string) =>
    api.get<Application[]>(`/applications/jobs/${jobId}`).then((r) => r.data),

  updateStatus: (applicationId: string, status: ApplicationStatus) =>
    api
      .patch<Application>(`/applications/${applicationId}/status`, { status })
      .then((r) => r.data),
};
