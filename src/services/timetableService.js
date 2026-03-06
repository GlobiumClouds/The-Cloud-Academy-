/**
 * Timetable API Service
 * GET    /timetable               (list — filter by class, section, teacher, day)
 * POST   /timetable               (create slot)
 * PUT    /timetable/:id           (update slot)
 * DELETE /timetable/:id           (delete slot)
 * GET    /timetable/class/:classId     (class-wise view)
 * GET    /timetable/teacher/:teacherId (teacher-wise view)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_TIMETABLE, paginate } from '@/data/dummyData';

export const timetableService = {
  // filters: { class_id, section_id, teacher_id, day, page, limit }
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/timetable${buildQuery(filters)}`).then((r) => r.data),
      () => {
        let data = [...DUMMY_TIMETABLE];
        if (filters.class_id)   data = data.filter((t) => t.class_id   === filters.class_id);
        if (filters.section_id) data = data.filter((t) => t.section_id === filters.section_id);
        if (filters.teacher_id) data = data.filter((t) => t.teacher_id === filters.teacher_id);
        if (filters.day)        data = data.filter((t) => t.day        === filters.day);
        return paginate(data, filters.page, filters.limit);
      },
    ),

  getByClass: (classId, sectionId) =>
    withFallback(
      () => api.get(`/timetable/class/${classId}${sectionId ? `?section_id=${sectionId}` : ''}`).then((r) => r.data),
      () => {
        const data = DUMMY_TIMETABLE.filter(
          (t) => t.class_id === classId && (!sectionId || t.section_id === sectionId),
        );
        return { data: { rows: data, total: data.length } };
      },
    ),

  getByTeacher: (teacherId) =>
    withFallback(
      () => api.get(`/timetable/teacher/${teacherId}`).then((r) => r.data),
      () => {
        const data = DUMMY_TIMETABLE.filter((t) => t.teacher_id === teacherId);
        return { data: { rows: data, total: data.length } };
      },
    ),

  // body: { class_id, section_id, day, period, subject, teacher_id, room, start_time, end_time }
  create: (body) =>
    withFallback(
      () => api.post('/timetable', body).then((r) => r.data),
      () => ({ data: { ...body, id: `tt-${Date.now()}` } }),
    ),

  update: (id, body) =>
    withFallback(
      () => api.put(`/timetable/${id}`, body).then((r) => r.data),
      () => ({ data: { id, ...body } }),
    ),

  delete: (id) =>
    withFallback(
      () => api.delete(`/timetable/${id}`).then((r) => r.data),
      () => ({ data: { id } }),
    ),
};
