/**
 * Academic Year API Service
 * GET    /academic-years
 * POST   /academic-years
 * GET    /academic-years/:id
 * PUT    /academic-years/:id
 * PATCH  /academic-years/:id/set-current
 * DELETE /academic-years/:id
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_ACADEMIC_YEARS, paginate } from '@/data/dummyData';

export const academicYearService = {
  // List all academic years
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/academic-years${buildQuery(filters)}`).then((r) => r.data),
      () => ({ data: DUMMY_ACADEMIC_YEARS }),
    ),

  // Get one by ID
  getById: (id) => api.get(`/academic-years/${id}`).then((r) => r.data),

  // Create
  // body: { name, start_date, end_date, is_current?, description? }
  create: (body) => api.post('/academic-years', body).then((r) => r.data),

  // Update
  update: (id, body) => api.put(`/academic-years/${id}`, body).then((r) => r.data),

  // Mark as current (demotes all others automatically)
  setCurrent: (id) => api.patch(`/academic-years/${id}/set-current`).then((r) => r.data),

  // Soft delete
  delete: (id) => api.delete(`/academic-years/${id}`).then((r) => r.data),
};
