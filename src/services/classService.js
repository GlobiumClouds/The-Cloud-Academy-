/**
 * Class & Section API Service
 *
 * Classes:
 * GET    /classes
 * POST   /classes
 * GET    /classes/:id
 * PUT    /classes/:id
 * DELETE /classes/:id
 *
 * Sections (nested):
 * GET    /classes/:classId/sections
 * POST   /classes/:classId/sections
 * GET    /classes/:classId/sections/:id
 * PUT    /classes/:classId/sections/:id
 * DELETE /classes/:classId/sections/:id
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_CLASSES, paginate } from '@/data/dummyData';

export const classService = {
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/classes${buildQuery(filters)}`).then((r) => r.data),
      () => {
        let list = [...DUMMY_CLASSES];
        if (filters.branch_id) list = list.filter((c) => c.branch_id === filters.branch_id);
        return paginate(list, filters.page, filters.limit);
      },
    ),

  getById: (id) => api.get(`/classes/${id}`).then((r) => r.data),

  // body: { name, grade_level, academic_year_id, branch_id?, class_teacher_id?, fee_structure? }
  create: (body) => api.post('/classes', body).then((r) => r.data),

  update: (id, body) => api.put(`/classes/${id}`, body).then((r) => r.data),

  delete: (id) => api.delete(`/classes/${id}`).then((r) => r.data),
};

export const sectionService = {
  // filters: { academic_year_id?, is_active? }
  getAll: (classId, filters = {}) =>
    api.get(`/classes/${classId}/sections${buildQuery(filters)}`).then((r) => r.data),

  getById: (classId, sectionId) =>
    api.get(`/classes/${classId}/sections/${sectionId}`).then((r) => r.data),

  // body: { academic_year_id, name, capacity, room_number?, section_teacher_id? }
  create: (classId, body) =>
    api.post(`/classes/${classId}/sections`, body).then((r) => r.data),

  update: (classId, sectionId, body) =>
    api.put(`/classes/${classId}/sections/${sectionId}`, body).then((r) => r.data),

  delete: (classId, sectionId) =>
    api.delete(`/classes/${classId}/sections/${sectionId}`).then((r) => r.data),
};
