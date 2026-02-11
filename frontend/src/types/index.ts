/**
 * Shared TypeScript types matching backend schemas.
 */

export type UserRole = 'candidate' | 'employer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

// ── Company ─────────────────────────────────────
export interface Company {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  location: string | null;
  owner_id: string;
  created_at: string;
}

export interface CompanyCreate {
  name: string;
  description?: string;
  website?: string;
  location?: string;
}

// ── Job ─────────────────────────────────────────
export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship';

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string | null;
  is_remote: boolean;
  job_type: JobType;
  salary_min: number | null;
  salary_max: number | null;
  is_active: boolean;
  company_id: string;
  created_at: string;
}

export interface JobDetail extends Job {
  company: Company;
}

export interface JobCreate {
  title: string;
  description: string;
  location?: string;
  is_remote?: boolean;
  job_type?: JobType;
  salary_min?: number;
  salary_max?: number;
}

export interface JobFilter {
  search?: string;
  is_remote?: boolean;
  job_type?: JobType;
  salary_min?: number;
  salary_max?: number;
}

// ── Application ─────────────────────────────────
export type ApplicationStatus =
  | 'pending'
  | 'reviewed'
  | 'shortlisted'
  | 'rejected'
  | 'accepted';

export interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  resume_path: string | null;
  created_at: string;
  candidate_name?: string;
  job_title?: string;
}

// ── Pagination ──────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
