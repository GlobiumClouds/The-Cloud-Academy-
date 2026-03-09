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

/**
 * Normalize backend camelCase login payload → frontend snake_case shape.
 * Backend returns: { accessToken, user: { firstName, lastName, userType, schoolId, ... } }
 * Frontend expects: { access_token, user: { first_name, last_name, role_code, user_type, school_id, ... } }
 */
function normalizeLoginResponse(payload) {
  const { accessToken, user } = payload;
  return {
    access_token: accessToken,
    user: {
      id:          user.id,
      first_name:  user.firstName  ?? user.first_name,
      last_name:   user.lastName   ?? user.last_name,
      email:       user.email,
      // role_code comes from role.code (e.g. 'MASTER_ADMIN'); fall back to userType
      role_code:   user.role?.code ?? user.userType ?? user.role_code,
      user_type:   user.userType   ?? user.user_type,
      school_id:   user.schoolId   ?? user.school_id   ?? null,
      role:        user.role       ?? null,
      permissions: user.permissions ?? [],
      avatar_url:  user.avatarUrl  ?? user.avatar_url  ?? null,
      institute:   user.institute  ?? user.school     ?? null,
      // convenience top-level field used by middleware cookie + login redirect
      institute_type:
        user.institute?.institute_type ??
        user.school?.institute_type    ??
        user.institute_type            ??
        null,
    },
  };
}

export const authService = {
  // Login — returns { user, access_token } from REAL backend only. No dummy fallback.
  login: async (data) => {
    console.group('%c[Auth] Login attempt', 'color: #6366f1; font-weight: bold');
    console.log('→ Endpoint:', '/auth/login');
    console.log('→ Email:', data.email);
    try {
      const r = await api.post('/auth/login', data);
      console.log('→ Raw response:', r.data);

      // Backend wraps in { success, message, data: { accessToken, user }, timestamp }
      const payload = r.data?.data ?? r.data;
      console.log('→ Unwrapped payload:', payload);

      const result = normalizeLoginResponse(payload);
      console.log('→ Normalized user:', result.user);
      console.log('→ Permissions count:', result.user.permissions?.length ?? 0);
      console.log('→ Permissions:', result.user.permissions);
      console.groupEnd();
      return result;
    } catch (err) {
      const status = err?.response?.status;
      const msg    = err?.response?.data?.message ?? err?.message ?? 'Unknown error';
      console.error('→ Login FAILED — status:', status, '| message:', msg);
      console.error('→ Full error response:', err?.response?.data);
      console.groupEnd();
      // Always re-throw — never silently fall back to dummy data
      throw err;
    }
  },

  // Logout (clears httpOnly refresh cookie on server)
  logout: () => api.post('/auth/logout').then((r) => r.data),

  // Get current user profile with permissions
  getMe: () => api.get('/auth/me').then((r) => r.data?.data ?? r.data),

  // Forgot password — sends reset email
  forgotPassword: (email, schoolCode) =>
    api.post('/auth/forgot-password', { email, school_code: schoolCode }).then((r) => r.data),

  // Reset password with token from email
  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { token, password: newPassword }).then((r) => r.data),
};
