/**
 * Parent / Guardian API Service
 * GET    /parents        (list)
 * POST   /parents        (create)
 * GET    /parents/:id    (single)
 * PUT    /parents/:id    (update)
 * DELETE /parents/:id    (delete)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_PARENTS, paginate } from '@/data/dummyData';

export const parentService = {
  // List — filters: { search, page, limit }
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/parents${buildQuery(filters)}`).then((r) => r.data),
      () => {
        let data = [...DUMMY_PARENTS];
        if (filters.search) {
          const q = filters.search.toLowerCase();
          data = data.filter(
            (p) =>
              p.first_name.toLowerCase().includes(q) ||
              p.last_name.toLowerCase().includes(q) ||
              p.phone.includes(q),
          );
        }
        return paginate(data, filters.page, filters.limit);
      },
    ),

  getById: (id) =>
    withFallback(
      () => api.get(`/parents/${id}`).then((r) => r.data),
      () => ({ data: DUMMY_PARENTS.find((p) => p.id === id) ?? null }),
    ),

  create: (body) =>
    withFallback(
      () => api.post('/parents', body).then((r) => r.data),
      () => ({
        data: {
          ...body,
          id: `par-${Date.now()}`,
          children: body.children ?? [],
          is_active: true,
          created_at: new Date().toISOString(),
        },
      }),
    ),

  update: (id, body) =>
    withFallback(
      () => api.put(`/parents/${id}`, body).then((r) => r.data),
      () => ({ data: { id, ...body } }),
    ),

  delete: (id) =>
    withFallback(
      () => api.delete(`/parents/${id}`).then((r) => r.data),
      () => ({ data: { id } }),
    ),
};
