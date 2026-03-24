/**
 * Student Service — All Routes Integrated
 *
 * Routes (Base: /api/v1/students):
 *   GET    /students              → getAll()
 *   POST   /students              → create()
 *   GET    /students/roles        → getRoles()
 *   GET    /students/:id          → getById()
 *   PUT    /students/:id          → update()
 *   DELETE /students/:id          → delete()
 *   PATCH  /students/:id/toggle-status → toggleStatus()
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Normalize filters per institute type
// School:     class_id, section_id
// Coaching:   course_id, batch_id
// Academy:    program_id, batch_id
// College:    department_id, program_id, semester_id
// University: faculty_id, department_id, program_id, semester_id
// ─────────────────────────────────────────────────────────────────────────────
function normalizeFilters(filters = {}, type = 'school') {
  const base = {
    page:      filters.page  ?? 1,
    limit:     filters.limit ?? 20,
    search:    filters.search    || undefined,
    is_active: filters.is_active !== '' ? filters.is_active : undefined,
    branch_id: filters.branch_id || undefined,
  };

  switch (type) {
    case 'coaching':
      return { ...base, course_id: filters.course_id || filters.class_id, batch_id: filters.batch_id || filters.section_id };
    case 'academy':
      return { ...base, program_id: filters.program_id || filters.class_id, batch_id: filters.batch_id || filters.section_id };
    case 'college':
      return { ...base, department_id: filters.department_id || filters.class_id, program_id: filters.program_id, semester_id: filters.semester_id || filters.section_id };
    case 'university':
      return { ...base, faculty_id: filters.faculty_id, department_id: filters.department_id || filters.class_id, program_id: filters.program_id, semester_id: filters.semester_id };
    default: // school
      return { ...base, class_id: filters.class_id || undefined, section_id: filters.section_id || undefined, academic_year_id: filters.academic_year_id || undefined };
  }
}

export const studentService = {
  /**
   * GET /api/v1/students
   * Saray students list karo (type-aware filters ke sath)
   */
  getAll: (filters = {}, instituteType = 'school') => {
    const params = normalizeFilters(filters, instituteType);
    return api.get(`/students${buildQuery(params)}`).then((r) => r.data);
  },

  /**
   * GET /api/v1/students/roles
   * Student roles dropdown ke liye
   */
  getRoles: () => api.get('/students/roles').then((r) => r.data),

  /**
   * GET /api/v1/students/:id
   * Ek student ki poori details
   */
  getById: (id) => api.get(`/students/${id}`).then((r) => r.data),

  /**
   * POST /api/v1/students
   * Naya student banao
   */
  create: (body) => api.post('/students', body).then((r) => r.data),

  /**
   * PUT /api/v1/students/:id
   * Student update karo
   */
  update: (id, body) => api.put(`/students/${id}`, body).then((r) => r.data),

  /**
   * PATCH /api/v1/students/:id/toggle-status
   * Active ↔ Inactive toggle karo
   */
  toggleStatus: (id) => api.patch(`/students/${id}/toggle-status`).then((r) => r.data),

  /**
   * DELETE /api/v1/students/:id
   * Student ko DB se completely delete karo
   */
  delete: (id) => api.delete(`/students/${id}`).then((r) => r.data),

  /** Photo upload */
  uploadPhoto: (id, formData) =>
    api.post(`/students/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  // ── Type-aware shortcuts ─────────────────────────────────────────────────
  getByPrimaryUnit: (id, type = 'school') => {
    const key = type === 'school' ? 'class_id' : type === 'coaching' ? 'course_id' : 'program_id';
    return studentService.getAll({ [key]: id }, type);
  },

  getByGroupingUnit: (id, type = 'school') => {
    const key = type === 'school' ? 'section_id' : (type === 'coaching' || type === 'academy') ? 'batch_id' : 'semester_id';
    return studentService.getAll({ [key]: id }, type);
  },
};
