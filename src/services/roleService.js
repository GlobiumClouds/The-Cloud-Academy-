/**
 * Role API Service  (Dynamic Role System)
 * GET    /roles
 * POST   /roles
 * GET    /roles/:id
 * PUT    /roles/:id
 * DELETE /roles/:id
 * GET    /roles/permissions          (all available permission codes grouped)
 * POST   /roles/:id/permissions      (set permissions for a role)
 * POST   /roles/:id/assign           (assign role to users)
 */

import api from '@/lib/api';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_ROLES, ALL_PERMISSIONS } from '@/data/dummyData';

export const roleService = {
  getAll: () =>
    withFallback(
      () => api.get('/roles').then((r) => r.data),
      () => ({ data: DUMMY_ROLES }),
    ),

  getById: (id) => api.get(`/roles/${id}`).then((r) => r.data),

  // body: { name, code, description? }
  create: (body) =>
    withFallback(
      () => api.post('/roles', body).then((r) => r.data),
      () => ({ data: { ...body, id: `role-${Date.now()}`, is_system: false, permissions: body.permissions ?? [] } }),
    ),

  update: (id, body) =>
    withFallback(
      () => api.put(`/roles/${id}`, body).then((r) => r.data),
      () => ({ data: { id, ...body } }),
    ),

  delete: (id) =>
    withFallback(
      () => api.delete(`/roles/${id}`).then((r) => r.data),
      () => ({ data: { id } }),
    ),

  // Get ALL available system permissions (for the permission selector UI)
  getAllPermissions: () => api.get('/roles/permissions').then((r) => r.data),

  // Replace the full permission set for a role
  // permissionIds: string[] (UUIDs)
  setPermissions: (roleId, permissionIds) =>
    api.post(`/roles/${roleId}/permissions`, { permission_ids: permissionIds }).then((r) => r.data),

  // Assign a role to one or more users
  // body: { user_ids: [...], role_id }
  assignToUsers: (roleId, userIds) =>
    api.post(`/roles/${roleId}/assign`, { user_ids: userIds }).then((r) => r.data),
};
