/**
 * Teacher API Service
 * GET    /teachers
 * POST   /teachers
 * GET    /teachers/:id
 * PUT    /teachers/:id
 * DELETE /teachers/:id
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_TEACHERS, paginate } from '@/data/dummyData';

export const teacherService = {
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/teachers${buildQuery(filters)}`).then((r) => r.data),
      () => {
        let list = [...DUMMY_TEACHERS];
        if (filters.branch_id) list = list.filter((t) => t.branch_id === filters.branch_id);
        if (filters.search) {
          const q = filters.search.toLowerCase();
          list = list.filter(
            (t) =>
              t.first_name.toLowerCase().includes(q) ||
              t.last_name.toLowerCase().includes(q) ||
              t.employee_id?.toLowerCase().includes(q),
          );
        }
        return paginate(list, filters.page, filters.limit);
      },
    ),

  getById: (id) => api.get(`/teachers/${id}`).then((r) => r.data),

  // body: { first_name, last_name, email, phone, employee_id?, qualification?,
  //         specialization?, joining_date?, salary?, branch_id?, user_id? }
  create: (body) => api.post('/teachers', body).then((r) => r.data),

  update: (id, body) => api.put(`/teachers/${id}`, body).then((r) => r.data),

  delete: (id) => api.delete(`/teachers/${id}`).then((r) => r.data),

  uploadPhoto: (id, formData) =>
    api
      .post(`/teachers/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),
};
