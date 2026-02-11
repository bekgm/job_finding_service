import api from '../lib/axios';
import type { Company, CompanyCreate } from '../types';

export const companyApi = {
  create: (data: CompanyCreate) =>
    api.post<Company>('/companies', data).then((r) => r.data),

  getMine: () =>
    api.get<Company>('/companies/me').then((r) => r.data),

  update: (data: Partial<CompanyCreate>) =>
    api.patch<Company>('/companies/me', data).then((r) => r.data),

  getById: (id: string) =>
    api.get<Company>(`/companies/${id}`).then((r) => r.data),
};
