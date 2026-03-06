/**
 * Fee Template API Service
 * GET    /fee-templates              (list)
 * POST   /fee-templates              (create)
 * GET    /fee-templates/:id          (single)
 * PUT    /fee-templates/:id          (update)
 * DELETE /fee-templates/:id          (delete)
 * POST   /fee-templates/:id/assign   (assign template to class / student)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_FEE_TEMPLATES, paginate } from '@/data/dummyData';

export const feeTemplateService = {
  // filters: { page, limit }
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/fee-templates${buildQuery(filters)}`).then((r) => r.data),
      () => paginate(DUMMY_FEE_TEMPLATES, filters.page, filters.limit),
    ),

  getById: (id) =>
    withFallback(
      () => api.get(`/fee-templates/${id}`).then((r) => r.data),
      () => ({ data: DUMMY_FEE_TEMPLATES.find((t) => t.id === id) ?? null }),
    ),

  // body: { name, description, applicable_classes, components[], late_fine_per_day, due_day }
  create: (body) =>
    withFallback(
      () => api.post('/fee-templates', body).then((r) => r.data),
      () => ({
        data: {
          ...body,
          id: `ft-${Date.now()}`,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      }),
    ),

  update: (id, body) =>
    withFallback(
      () => api.put(`/fee-templates/${id}`, body).then((r) => r.data),
      () => ({ data: { id, ...body } }),
    ),

  delete: (id) =>
    withFallback(
      () => api.delete(`/fee-templates/${id}`).then((r) => r.data),
      () => ({ data: { id } }),
    ),

  // body: { class_ids?: string[], student_ids?: string[] }
  assign: (id, body) =>
    withFallback(
      () => api.post(`/fee-templates/${id}/assign`, body).then((r) => r.data),
      () => ({ data: { id, assigned: true } }),
    ),
};
