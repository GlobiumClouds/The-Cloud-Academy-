/**
 * Branch API Service
 * GET    /branches
 * POST   /branches
 * GET    /branches/:id
 * PUT    /branches/:id
 * DELETE /branches/:id
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_BRANCHES, paginate } from '@/data/dummyData';

export const branchService = {
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/branches${buildQuery(filters)}`).then((r) => r.data),
      () => {
        let list = [...DUMMY_BRANCHES];
        if (filters.school_id) list = list.filter((b) => b.school_id === filters.school_id);
        if (filters.search) {
          const q = filters.search.toLowerCase();
          list = list.filter(
            (b) =>
              b.name.toLowerCase().includes(q) ||
              (b.address && b.address.toLowerCase().includes(q)),
          );
        }
        return paginate(list, filters.page, filters.limit);
      },
    ),

  getById: (id) =>
    withFallback(
      () => api.get(`/branches/${id}`).then((r) => r.data),
      () => DUMMY_BRANCHES.find((b) => b.id === id) ?? null,
    ),

  // body: { name, address?, phone?, email?, school_id, is_active? }
  create: (body) => api.post('/branches', body).then((r) => r.data),

  update: (id, body) => api.put(`/branches/${id}`, body).then((r) => r.data),

  delete: (id) => api.delete(`/branches/${id}`).then((r) => r.data),
};
