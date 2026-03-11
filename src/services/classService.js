// /**
//  * Class & Section API Service
//  *
//  * Classes:
//  * GET    /classes
//  * POST   /classes
//  * GET    /classes/:id
//  * PUT    /classes/:id
//  * DELETE /classes/:id
//  *
//  * Sections (nested):
//  * GET    /classes/:classId/sections
//  * POST   /classes/:classId/sections
//  * GET    /classes/:classId/sections/:id
//  * PUT    /classes/:classId/sections/:id
//  * DELETE /classes/:classId/sections/:id
//  */

// import api from '@/lib/api';
// import { buildQuery } from '@/lib/utils';
// import { withFallback } from '@/lib/withFallback';
// import { DUMMY_CLASSES, paginate } from '@/data/dummyData';

// export const classService = {
//   getAll: (filters = {}) =>
//     withFallback(
//       () => api.get(`/classes${buildQuery(filters)}`).then((r) => r.data),
//       () => {
//         let list = [...DUMMY_CLASSES];
//         if (filters.branch_id) list = list.filter((c) => c.branch_id === filters.branch_id);
//         return paginate(list, filters.page, filters.limit);
//       },
//     ),

//   getById: (id) => api.get(`/classes/${id}`).then((r) => r.data),

//   // body: { name, grade_level, academic_year_id, branch_id?, class_teacher_id?, fee_structure? }
//   create: (body) => api.post('/classes', body).then((r) => r.data),

//   update: (id, body) => api.put(`/classes/${id}`, body).then((r) => r.data),

//   delete: (id) => api.delete(`/classes/${id}`).then((r) => r.data),
// };

// export const sectionService = {
//   // filters: { academic_year_id?, is_active? }
//   getAll: (classId, filters = {}) =>
//     api.get(`/classes/${classId}/sections${buildQuery(filters)}`).then((r) => r.data),

//   getById: (classId, sectionId) =>
//     api.get(`/classes/${classId}/sections/${sectionId}`).then((r) => r.data),

//   // body: { academic_year_id, name, capacity, room_number?, section_teacher_id? }
//   create: (classId, body) =>
//     api.post(`/classes/${classId}/sections`, body).then((r) => r.data),

//   update: (classId, sectionId, body) =>
//     api.put(`/classes/${classId}/sections/${sectionId}`, body).then((r) => r.data),

//   delete: (classId, sectionId) =>
//     api.delete(`/classes/${classId}/sections/${sectionId}`).then((r) => r.data),
// };








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
import { DUMMY_CLASSES, DUMMY_SECTIONS, paginate } from '@/data/dummyData';

export const classService = {
  /**
   * Get all classes
   * @param {Object} params - Query parameters
   * @param {string} params.institute_id - Institute ID
   * @param {string} params.academic_year_id - Academic Year ID
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {string} params.status - Filter by status (active/inactive)
   */
  getAll: async (params = {}) => {
    try {
      const queryString = buildQuery(params);
      const response = await api.get(`/classes${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },

  /**
   * Get class by ID
   * @param {string} id - Class ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/classes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching class:', error);
      const classItem = DUMMY_CLASSES.find(c => c.id === id);
      if (!classItem) throw new Error('Class not found');
      return { data: classItem };
    }
  },

  /**
   * Create new class with sections and courses
   * @param {Object} data - Class data
   * @param {string} data.name - Class name
   * @param {string} data.description - Description
   * @param {string} data.academic_year_id - Academic Year ID
   * @param {string} data.class_teacher_id - Class teacher ID
   * @param {Array} data.sections - Sections array
   * @param {Array} data.courses - Courses array
   */
  create: async (data) => {
    try {
      const formData = new FormData();
      
      // Basic info
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('academic_year_id', data.academic_year_id);
      if (data.class_teacher_id) formData.append('class_teacher_id', data.class_teacher_id);
      
      // Sections as JSON
      if (data.sections && data.sections.length > 0) {
        formData.append('sections', JSON.stringify(data.sections));
      }
      
      // Courses with materials
      if (data.courses && data.courses.length > 0) {
        // Append each new PDF file with a name encoding course/material index
        data.courses.forEach((course, courseIndex) => {
          (course.materials || []).forEach((material, materialIndex) => {
            // material.file is a File object (set via Controller)
            const file = material.file instanceof File ? material.file : null;
            if (file) {
              formData.append(
                'materials',
                file,
                `course_${courseIndex}_material_${materialIndex}_${file.name}`
              );
            }
          });
        });

        // Remove files before stringifying; map code -> course_code for backend
        const coursesForJson = data.courses.map(course => ({
          id: course.id,
          name: course.name,
          course_code: course.code ?? course.course_code ?? '',
          description: course.description ?? '',
          active: course.active,
          materials: (course.materials || []).map(m => ({
            name: m.name,
            description: m.description,
            active: m.active,
            // pass existing url so backend keeps it when no new file uploaded
            pdf_url: m.file instanceof File ? undefined : (m.pdf_url || undefined),
          }))
        }));

        formData.append('courses', JSON.stringify(coursesForJson));
      }

      const response = await api.post('/classes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  },

  /**
   * Update class
   * @param {string} id - Class ID
   * @param {Object} data - Update data
   */
  update: async (id, data) => {
    try {
      const formData = new FormData();
      
      // Basic info
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      if (data.academic_year_id) formData.append('academic_year_id', data.academic_year_id);
      if (data.class_teacher_id) formData.append('class_teacher_id', data.class_teacher_id);
      formData.append('is_active', data.active ? 'true' : 'false');
      
      // Sections as JSON
      if (data.sections) {
        formData.append('sections', JSON.stringify(data.sections));
      }
      
      // Courses with materials
      if (data.courses) {
        // Append each new/replaced PDF file with a name encoding course/material index
        data.courses.forEach((course, courseIndex) => {
          (course.materials || []).forEach((material, materialIndex) => {
            const file = material.file instanceof File ? material.file : null;
            if (file) {
              formData.append(
                'materials',
                file,
                `course_${courseIndex}_material_${materialIndex}_${file.name}`
              );
            }
          });
        });

        // Remove files before stringifying; map code -> course_code for backend
        const coursesForJson = data.courses.map(course => ({
          id: course.id,
          name: course.name,
          course_code: course.code ?? course.course_code ?? '',
          description: course.description ?? '',
          active: course.active,
          materials: (course.materials || []).map(m => ({
            id: m.id,
            name: m.name,
            description: m.description,
            active: m.active,
            // pass existing url so backend keeps it; if new file uploaded, backend will overwrite
            pdf_url: m.file instanceof File ? undefined : (m.pdf_url || undefined),
          }))
        }));

        formData.append('courses', JSON.stringify(coursesForJson));
      }

      const response = await api.put(`/classes/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  },

  /**
   * Delete class
   * @param {string} id - Class ID
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/classes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  },

  /**
   * Toggle class status
   * @param {string} id - Class ID
   * @param {boolean} isActive - Active status
   */
  toggleStatus: async (id, isActive) => {
    try {
      const response = await api.put(`/classes/${id}`, { is_active: isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling class status:', error);
      throw error;
    }
  },

  /**
   * Get class options for dropdown
   * @param {string} instituteId - Institute ID
   * @param {string} academicYearId - Academic Year ID
   */
  getOptions: async (instituteId, academicYearId) => {
    try {
      const response = await api.get('/classes/options', {
        params: { institute_id: instituteId, academic_year_id: academicYearId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching class options:', error);
      return {
        data: DUMMY_CLASSES.map(c => ({
          value: c.id,
          label: c.name
        }))
      };
    }
  }
};

export const sectionService = {
  /**
   * Get all sections for a class
   * @param {string} classId - Class ID
   * @param {Object} params - Query parameters
   */
  getAll: async (classId, params = {}) => {
    try {
      const queryString = buildQuery(params);
      const response = await api.get(`/classes/${classId}/sections${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sections:', error);
      const sections = DUMMY_SECTIONS.filter(s => s.class_id === classId);
      return { data: sections };
    }
  },

  /**
   * Get section by ID
   * @param {string} classId - Class ID
   * @param {string} sectionId - Section ID
   */
  getById: async (classId, sectionId) => {
    try {
      const response = await api.get(`/classes/${classId}/sections/${sectionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching section:', error);
      const section = DUMMY_SECTIONS.find(s => s.id === sectionId);
      if (!section) throw new Error('Section not found');
      return { data: section };
    }
  },

  /**
   * Create section
   * @param {string} classId - Class ID
   * @param {Object} data - Section data
   */
  create: async (classId, data) => {
    try {
      const response = await api.post(`/classes/${classId}/sections`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating section:', error);
      throw error;
    }
  },

  /**
   * Update section
   * @param {string} classId - Class ID
   * @param {string} sectionId - Section ID
   * @param {Object} data - Update data
   */
  update: async (classId, sectionId, data) => {
    try {
      const response = await api.put(`/classes/${classId}/sections/${sectionId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating section:', error);
      throw error;
    }
  },

  /**
   * Delete section
   * @param {string} classId - Class ID
   * @param {string} sectionId - Section ID
   */
  delete: async (classId, sectionId) => {
    try {
      const response = await api.delete(`/classes/${classId}/sections/${sectionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting section:', error);
      throw error;
    }
  },

  /**
   * Toggle section status
   * @param {string} classId - Class ID
   * @param {string} sectionId - Section ID
   * @param {boolean} isActive - Active status
   */
  toggleStatus: async (classId, sectionId, isActive) => {
    try {
      const response = await api.patch(`/classes/${classId}/sections/${sectionId}/toggle-status`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling section status:', error);
      throw error;
    }
  }
};