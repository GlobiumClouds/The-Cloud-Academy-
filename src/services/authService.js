/**
 * Auth API Service
 * POST /auth/login
 * POST /auth/logout
 * POST /auth/refresh
 * POST /auth/forgot-password
 * POST /auth/reset-password
 * GET  /auth/me
 */

import api from '@/lib/api';
import { dummyLogin } from '@/data/dummyData';

export const authService = {
  // Login — returns { user, access_token }.
  // Falls back to dummyLogin when the backend is not reachable.
  login: async (data) => {
    try {
      return await api.post('/auth/login', data).then((r) => r.data);
    } catch (err) {
      const status = err?.response?.status;
      // Only 401 (wrong password) and 422 (validation) are real auth errors → re-throw
      // 404 means the route/server doesn't exist → fall back to dummy
      if (status === 401 || status === 422) throw err;
      // Network / 404 / 5xx → attempt dummy login
      console.warn('[Demo Mode] Auth API unreachable — trying dummy credentials');
      return dummyLogin(data);
    }
  },

  // Logout (clears httpOnly refresh cookie on server)
  logout: () => api.post('/auth/logout').then((r) => r.data),

  // Get current user profile with permissions
  getMe: () => api.get('/auth/me').then((r) => r.data),

  // Forgot password — sends reset email
  forgotPassword: (email, schoolCode) =>
    api.post('/auth/forgot-password', { email, school_code: schoolCode }).then((r) => r.data),

  // Reset password with token from email
  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { token, new_password: newPassword }).then((r) => r.data),
};
