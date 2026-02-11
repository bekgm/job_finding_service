/**
 * Auth API functions — used by React Query hooks.
 */

import api from '../lib/axios';
import type { LoginPayload, RegisterPayload, TokenResponse, User } from '../types';

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<User>('/auth/register', data).then((r) => r.data),

  login: (data: LoginPayload) =>
    api.post<TokenResponse>('/auth/login', data).then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<TokenResponse>('/auth/refresh', { refresh_token: refreshToken }).then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),
};
