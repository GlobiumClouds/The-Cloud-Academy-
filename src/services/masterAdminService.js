/**
 * Master Admin API Service
 * All calls require MASTER_ADMIN role (verified by backend).
 *
 * GET    /master-admin/stats
 * GET    /master-admin/schools
 * POST   /master-admin/schools
 * GET    /master-admin/schools/:id
 * PUT    /master-admin/schools/:id
 * PATCH  /master-admin/schools/:id/status
 * DELETE /master-admin/schools/:id
 *
 * GET    /master-admin/subscriptions
 * POST   /master-admin/subscriptions
 * GET    /master-admin/subscriptions/:id
 * PUT    /master-admin/subscriptions/:id
 * PATCH  /master-admin/subscriptions/:id/cancel
 *
 * GET    /master-admin/users
 * GET    /master-admin/users/:id
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import {
  DUMMY_MA_STATS, DUMMY_MA_SCHOOLS, DUMMY_MA_SUBSCRIPTIONS,
  DUMMY_MA_USERS, DUMMY_MA_SUBSCRIPTION_TEMPLATES, paginate,
} from '@/data/dummyData';

export const masterAdminService = {
  // ─── Stats ────────────────────────────────────────────────
  getStats: () =>
    withFallback(
      () => api.get('/master-admin/stats').then((r) => r.data?.data ?? r.data),
      () => DUMMY_MA_STATS,
    ),

  // ─── Lookup tables (for dropdowns) ───────────────────────
  getInstituteTypes: () =>
    api.get('/master-admin/institute-types').then((r) => r.data),

  getPlatformRoles: () =>
    api.get('/master-admin/platform-roles').then((r) => r.data),

  // ─── Institutes (formerly Schools) ───────────────────────
  getSchools: (filters = {}) =>
    api.get(`/master-admin/institutes${buildQuery(filters)}`).then((r) => r.data),

  getSchoolById: (id) =>
    api.get(`/master-admin/institutes/${id}`).then((r) => r.data),

  createSchool: (body) =>
    api.post('/master-admin/institutes', body).then((r) => r.data),

  updateSchool: (id, body) =>
    api.put(`/master-admin/institutes/${id}`, body).then((r) => r.data),

  toggleSchoolStatus: (id, is_active) =>
    api.patch(`/master-admin/institutes/${id}/status`, { is_active }).then((r) => r.data),

  updateInstituteSubscriptionStatus: (id, subscription_status) =>
    api.patch(`/master-admin/institutes/${id}/subscription-status`, { subscription_status }).then((r) => r.data),

  deleteSchool: (id) =>
    api.delete(`/master-admin/institutes/${id}`).then((r) => r.data),

  // ─── Subscriptions ────────────────────────────────────────
  // filters: { school_id?, status? }
  getSubscriptions: (filters = {}) =>
    withFallback(
      () => api.get(`/master-admin/subscriptions${buildQuery(filters)}`).then((r) => r.data),
      () => paginate(DUMMY_MA_SUBSCRIPTIONS, filters.page, filters.limit),
    ),

  getSubscriptionById: (id) =>
    api.get(`/master-admin/subscriptions/${id}`).then((r) => r.data),

  // body: { school_id, plan, start_date, end_date, amount? }
  createSubscription: (body) =>
    api.post('/master-admin/subscriptions', body).then((r) => r.data),

  updateSubscription: (id, body) =>
    api.put(`/master-admin/subscriptions/${id}`, body).then((r) => r.data),

  cancelSubscription: (id) =>
    api.patch(`/master-admin/subscriptions/${id}/cancel`).then((r) => r.data),

  // ─── Users ────────────────────────────────────────────────
  getUsers: (filters = {}) =>
    withFallback(
      () => api.get(`/master-admin/users${buildQuery(filters)}`).then((r) => r.data),
      () => paginate(DUMMY_MA_USERS, filters.page, filters.limit),
    ),

  getUserById: (id) =>
    api.get(`/master-admin/users/${id}`).then((r) => r.data),

  // ─── Subscription Plans (new /subscription-plans API) ────────────
  getSubscriptionTemplates: (filters = {}) =>
    api.get(`/subscription-plans${buildQuery(filters)}`).then((r) => r.data),

  getSubscriptionTemplateById: (id) =>
    api.get(`/subscription-plans/${id}`).then((r) => r.data),

  createSubscriptionTemplate: (body) =>
    api.post('/subscription-plans', body).then((r) => r.data),

  updateSubscriptionTemplate: (id, body) =>
    api.put(`/subscription-plans/${id}`, body).then((r) => r.data),

  deleteSubscriptionTemplate: (id) =>
    api.delete(`/subscription-plans/${id}`).then((r) => r.data),

  toggleSubscriptionPublish: (id) =>
    api.patch(`/subscription-plans/${id}/toggle-publish`).then((r) => r.data),

  toggleSubscriptionPopular: (id) =>
    api.patch(`/subscription-plans/${id}/toggle-popular`).then((r) => r.data),

  toggleSubscriptionActive: (id) =>
    api.patch(`/subscription-plans/${id}/toggle-active`).then((r) => r.data),
};
