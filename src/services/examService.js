// // /**
// //  * Exam API Service
// //  * GET    /exams
// //  * POST   /exams
// //  * GET    /exams/:id
// //  * PUT    /exams/:id
// //  * PATCH  /exams/:id/publish
// //  * DELETE /exams/:id
// //  * POST   /exams/:id/results           (enter/bulk update results)
// //  * GET    /exams/:id/results           (get results for an exam)
// //  */

// // import api from '@/lib/api';
// // import { buildQuery } from '@/lib/utils';
// // import { withFallback } from '@/lib/withFallback';
// // import { DUMMY_EXAMS, paginate } from '@/data/dummyData';

// // export const examService = {
// //   getAll: (filters = {}) =>
// //     withFallback(
// //       () => api.get(`/exams${buildQuery(filters)}`).then((r) => r.data),
// //       () => paginate(DUMMY_EXAMS, filters.page, filters.limit),
// //     ),

// //   getById: (id) => api.get(`/exams/${id}`).then((r) => r.data),

// //   // body: { name, type, class_id, academic_year_id, start_date, end_date,
// //   //         total_marks, pass_percentage, branch_id? }
// //   create: (body) => api.post('/exams', body).then((r) => r.data),

// //   update: (id, body) => api.put(`/exams/${id}`, body).then((r) => r.data),

// //   publish: (id) => api.patch(`/exams/${id}/publish`).then((r) => r.data),

// //   delete: (id) => api.delete(`/exams/${id}`).then((r) => r.data),

// //   // Results
// //   getResults: (examId, filters = {}) =>
// //     api.get(`/exams/${examId}/results${buildQuery(filters)}`).then((r) => r.data),

// //   // results: [{ student_id, subject_id, marks_obtained, is_absent?, remarks? }]
// //   enterResults: (examId, results) =>
// //     api.post(`/exams/${examId}/results`, { results }).then((r) => r.data),
// // };






// // src/services/examService.js

// /**
//  * Exam API Service - Simple & Complete
//  */

// import api from '@/lib/api';
// import { buildQuery } from '@/lib/utils';

// export const examService = {
//   /**
//    * Get all exams with filters
//    */
//   getAll: async (filters = {}) => {
//     try {
//       const queryString = buildQuery(filters);
//       const response = await api.get(`/exams${queryString}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching exams:', error);
//       throw error;
//     }
//   },

//   /**
//    * Get exam by ID
//    */
//   getById: async (id) => {
//     try {
//       const response = await api.get(`/exams/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching exam:', error);
//       throw error;
//     }
//   },

//   /**
//    * Get exam options for dropdown
//    */
//   getOptions: async (params = {}) => {
//     try {
//       const queryString = buildQuery(params);
//       const response = await api.get(`/exams/options${queryString}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching exam options:', error);
//       throw error;
//     }
//   },

//   /**
//    * Create new exam
//    */
//   create: async (data) => {
//     try {
//       const response = await api.post('/exams', data);
//       return response.data;
//     } catch (error) {
//       console.error('Error creating exam:', error);
//       throw error;
//     }
//   },

//   /**
//    * Update exam
//    */
//   update: async (id, data) => {
//     try {
//       const response = await api.put(`/exams/${id}`, data);
//       return response.data;
//     } catch (error) {
//       console.error('Error updating exam:', error);
//       throw error;
//     }
//   },

//   /**
//    * Delete exam
//    */
//   delete: async (id) => {
//     try {
//       const response = await api.delete(`/exams/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error deleting exam:', error);
//       throw error;
//     }
//   },

//   /**
//    * Update exam status
//    */
//   updateStatus: async (id, status) => {
//     try {
//       const response = await api.patch(`/exams/${id}/status`, { status });
//       return response.data;
//     } catch (error) {
//       console.error('Error updating exam status:', error);
//       throw error;
//     }
//   },

//   /**
//    * Publish exam
//    */
//   publish: async (id) => {
//     try {
//       const response = await api.post(`/exams/${id}/publish`);
//       return response.data;
//     } catch (error) {
//       console.error('Error publishing exam:', error);
//       throw error;
//     }
//   },

//   /**
//    * Get exam results
//    */
//   getResults: async (examId, filters = {}) => {
//     try {
//       const queryString = buildQuery(filters);
//       const response = await api.get(`/exams/${examId}/results${queryString}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching exam results:', error);
//       throw error;
//     }
//   },

//   /**
//    * Add/update exam results
//    */
//   addResults: async (examId, results) => {
//     try {
//       const response = await api.post(`/exams/${examId}/results`, { results });
//       return response.data;
//     } catch (error) {
//       console.error('Error adding exam results:', error);
//       throw error;
//     }
//   },

//   /**
//    * Bulk upload results via file
//    */
//   bulkUploadResults: async (examId, file) => {
//     try {
//       const formData = new FormData();
//       formData.append('file', file);
      
//       const response = await api.post(`/exams/${examId}/results/bulk`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error bulk uploading results:', error);
//       throw error;
//     }
//   },

//   /**
//    * Update single result
//    */
//   updateResult: async (resultId, data) => {
//     try {
//       const response = await api.put(`/exams/results/${resultId}`, data);
//       return response.data;
//     } catch (error) {
//       console.error('Error updating result:', error);
//       throw error;
//     }
//   },

//   /**
//    * Delete single result
//    */
//   deleteResult: async (resultId) => {
//     try {
//       const response = await api.delete(`/exams/results/${resultId}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error deleting result:', error);
//       throw error;
//     }
//   },

//   /**
//    * Publish results
//    */
//   publishResults: async (examId, publishDate) => {
//     try {
//       const response = await api.post(`/exams/${examId}/publish-results`, { publish_date: publishDate });
//       return response.data;
//     } catch (error) {
//       console.error('Error publishing results:', error);
//       throw error;
//     }
//   },

//   /**
//    * Get exam analytics
//    */
//   getAnalytics: async (examId) => {
//     try {
//       const response = await api.get(`/exams/${examId}/analytics`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching exam analytics:', error);
//       throw error;
//     }
//   },

//   /**
//    * Generate grade sheet
//    */
//   getGradeSheet: async (examId, studentId) => {
//     try {
//       const queryString = studentId ? `?student_id=${studentId}` : '';
//       const response = await api.get(`/exams/${examId}/grade-sheet${queryString}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error generating grade sheet:', error);
//       throw error;
//     }
//   },

//   /**
//    * Download exam results as CSV
//    */
//   downloadResults: async (examId) => {
//     try {
//       const response = await api.get(`/exams/${examId}/download-results`, {
//         responseType: 'blob'
//       });
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `exam_${examId}_results.csv`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
      
//       return true;
//     } catch (error) {
//       console.error('Error downloading results:', error);
//       throw error;
//     }
//   },

//   /**
//    * Get exam attendance (optional)
//    */
//   getAttendance: async (examId) => {
//     try {
//       const response = await api.get(`/exams/${examId}/attendance`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching exam attendance:', error);
//       throw error;
//     }
//   },

//   /**
//    * Mark exam attendance (optional)
//    */
//   markAttendance: async (examId, attendance) => {
//     try {
//       const response = await api.post(`/exams/${examId}/attendance`, { attendance });
//       return response.data;
//     } catch (error) {
//       console.error('Error marking exam attendance:', error);
//       throw error;
//     }
//   },

//   /**
//    * Student views
//    */
//   getMyExams: async () => {
//     try {
//       const response = await api.get('/exams/my-exams');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching my exams:', error);
//       throw error;
//     }
//   },

//   getMyResults: async () => {
//     try {
//       const response = await api.get('/exams/my-results');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching my results:', error);
//       throw error;
//     }
//   }
// };









// frontend/src/services/examService.js

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

export const examService = {
  // Exam CRUD
  getAll: async (params = {}) => {
    const response = await api.get('/exams', { params });
    // Backend wraps response: { success, message, data, pagination, ... }
    return response.data.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/exams/${id}`);
    // Backend wraps: { success, message, data: { exam with subject_schedules }, timestamp }
    // Extract the exam object from nested data property
    return response.data.data || response.data;
  },

  create: async (data) => {
    const response = await api.post('/exams', data);
    return response.data.data || response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/exams/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/exams/${id}`);
    return response.data.data || response.data;
  },

  publish: async (id) => {
    const response = await api.post(`/exams/${id}/publish`);
    return response.data.data || response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/exams/${id}/status`, { status });
    return response.data.data || response.data;
  },

  // Results Management
  getResults: async (examId, params = {}) => {
    const response = await api.get(`/exams/${examId}/results`, { params });
    // This endpoint returns: { success, message, data: [...students], pagination, summary }
    // Keep the wrapper structure as client expects it
    return response.data;
  },

  addResults: async (examId, results) => {
    const response = await api.post(`/exams/${examId}/results`, { results });
    return response.data;
  },

  updateResult: async (resultId, data) => {
    const response = await api.put(`/exams/results/${resultId}`, data);
    return response.data;
  },

  deleteResult: async (resultId) => {
    const response = await api.delete(`/exams/results/${resultId}`);
    return response.data;
  },

  publishResults: async (examId, publishDate) => {
    const response = await api.post(`/exams/${examId}/publish-results`, { publish_date: publishDate });
    return response.data;
  },

  downloadResults: async (examId) => {
    const response = await api.get(`/exams/${examId}/download-results`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `exam_${examId}_results.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Analytics
  getAnalytics: async (examId) => {
    const response = await api.get(`/exams/${examId}/analytics`);
    return response.data;
  },

  generateGradeSheet: async (examId, studentId) => {
    const response = await api.get(`/exams/${examId}/grade-sheet`, {
      params: { student_id: studentId }
    });
    return response.data;
  },

  // Student Views
  getMyExams: async () => {
    const response = await api.get('/exams/my-exams');
    return response.data;
  },

  getMyResults: async () => {
    const response = await api.get('/exams/my-results');
    return response.data;
  },

  // Options/Dropdown
  getOptions: async (params = {}) => {
    const response = await api.get('/exams/options', { params });
    return response.data;
  }
};

export default examService;