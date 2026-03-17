// frontend/src/services/studentPortal.service.js

/**
 * The Clouds Academy - Student Portal Frontend Service
 * 
 * Student ke saare API calls ek hi jagah
 */

import api from '@/lib/api';
import { withFallback } from '@/lib/withFallback';

// Dummy data for development
const DUMMY_STUDENT_DASHBOARD = {
  student: {
    id: '1',
    name: 'Ali Khan',
    registration_no: 'STU-2024-001',
    class: '10th Grade',
    section: 'A',
    roll_number: '101',
    avatar: null
  },
  today_classes: [
    {
      time: '08:00 - 08:45',
      subject: 'Mathematics',
      teacher: 'Mr. John',
      room: '101',
      status: 'upcoming'
    },
    {
      time: '08:45 - 09:30',
      subject: 'Physics',
      teacher: 'Ms. Sarah',
      room: '102',
      status: 'upcoming'
    }
  ],
  upcoming_assignments: [
    {
      id: '1',
      title: 'Algebra Exercise 5.2',
      subject: 'Mathematics',
      teacher: 'Mr. John',
      due_date: '2024-03-25',
      days_left: 2
    }
  ],
  recent_attendance: {
    percentage: 92,
    chart: {
      '20 Mar': 'present',
      '21 Mar': 'present',
      '22 Mar': 'absent'
    }
  },
  recent_results: [
    {
      exam_name: 'Mid Term 2024',
      date: '2024-03-15',
      subjects: 5,
      percentage: 85,
      obtained: 425,
      total: 500
    }
  ],
  fee_status: {
    has_due: true,
    total_due: 5000,
    due_count: 2,
    next_due_date: '2024-03-31',
    next_due_amount: 2500
  },
  notices: [
    {
      id: '1',
      title: 'Parent-Teacher Meeting',
      content: 'Annual parent-teacher meeting...',
      priority: 'high',
      date: '25 Mar 2024'
    }
  ],
  statistics: {
    attendance_percentage: 92,
    total_assignments_submitted: 15,
    total_exams_taken: 3,
    rank: 8
  },
  quick_actions: [
    { label: 'View Timetable', icon: 'Calendar', href: '/timetable' },
    { label: 'Pay Fees', icon: 'CreditCard', href: '/fees/pay', alert: true },
    { label: 'Download Results', icon: 'Download', href: '/results' },
    { label: 'Contact Teacher', icon: 'MessageCircle', href: '/messages' }
  ]
};

const DUMMY_TIMETABLE = {
  week: {
    start: '2024-03-18',
    end: '2024-03-24'
  },
  schedule: {
    monday: [
      { period: 1, start_time: '08:00', end_time: '08:45', subject: 'Mathematics', teacher: 'Mr. John', room: '101' },
      { period: 2, start_time: '08:45', end_time: '09:30', subject: 'Physics', teacher: 'Ms. Sarah', room: '102' }
    ],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: []
  }
};

const DUMMY_ATTENDANCE = {
  summary: {
    total: 45,
    present: 42,
    absent: 2,
    late: 1,
    percentage: 93
  },
  subject_wise: [
    { subject: 'Mathematics', total: 15, present: 14, percentage: 93 },
    { subject: 'Physics', total: 15, present: 13, percentage: 86 },
    { subject: 'Chemistry', total: 15, present: 15, percentage: 100 }
  ],
  records: [
    { date: '22 Mar 2024', day: 'Friday', subject: 'Mathematics', status: 'present' },
    { date: '21 Mar 2024', day: 'Thursday', subject: 'Physics', status: 'present' },
    { date: '20 Mar 2024', day: 'Wednesday', subject: 'Chemistry', status: 'absent' }
  ]
};

const DUMMY_ASSIGNMENTS = {
  data: [
    {
      id: '1',
      title: 'Algebra Exercise 5.2',
      subject: 'Mathematics',
      teacher: 'Mr. John',
      due_date: '2024-03-25',
      total_marks: 20,
      status: 'pending',
      attachments: []
    },
    {
      id: '2',
      title: 'Physics Lab Report',
      subject: 'Physics',
      teacher: 'Ms. Sarah',
      due_date: '2024-03-22',
      total_marks: 15,
      status: 'overdue',
      submission: {
        id: 's1',
        submitted_at: '2024-03-21',
        files: []
      }
    }
  ],
  pagination: {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1
  }
};

const DUMMY_RESULTS = [
  {
    exam_name: 'Mid Term 2024',
    date: '2024-03-15',
    subjects: [
      { subject: 'Mathematics', marks: 85, total: 100, grade: 'A' },
      { subject: 'Physics', marks: 78, total: 100, grade: 'B+' },
      { subject: 'Chemistry', marks: 92, total: 100, grade: 'A+' }
    ],
    percentage: 85,
    rank: 8
  }
];

const DUMMY_FEES = {
  summary: {
    total_due: 5000,
    total_paid: 15000,
    pending_vouchers: 2,
    overdue_vouchers: 0,
    paid_vouchers: 3,
    next_due_date: '2024-03-31',
    next_due_amount: 2500
  },
  vouchers: [
    {
      id: '1',
      title: 'Tuition Fee - March 2024',
      amount: 2500,
      due_date: '2024-03-31',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Tuition Fee - February 2024',
      amount: 2500,
      due_date: '2024-02-29',
      status: 'paid',
      paid_date: '2024-02-15'
    }
  ]
};

export const studentPortalService = {
  // ─────────────────────────────────────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────
  getDashboard: () =>
    withFallback(
      () => api.get('/portal/student/dashboard').then(r => r.data),
      () => ({ data: DUMMY_STUDENT_DASHBOARD })
    ),

  // ─────────────────────────────────────────────────────────────────────────
  // PROFILE
  // ─────────────────────────────────────────────────────────────────────────
  getProfile: () =>
    withFallback(
      () => api.get('/portal/student/profile').then(r => r.data),
      () => ({ data: DUMMY_STUDENT_DASHBOARD.student })
    ),

  updateProfile: (data) =>
    api.put('/portal/student/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // ─────────────────────────────────────────────────────────────────────────
  // CLASSES & TIMETABLE
  // ─────────────────────────────────────────────────────────────────────────
  getMyClasses: () =>
    withFallback(
      () => api.get('/portal/student/classes').then(r => r.data),
      () => ({ data: DUMMY_STUDENT_DASHBOARD.my_classes || [] })
    ),

  getMyTimetable: (week = null) =>
    withFallback(
      () => api.get('/portal/student/timetable', { params: { week } }).then(r => r.data),
      () => ({ data: DUMMY_TIMETABLE })
    ),

  getTodayClasses: () =>
    withFallback(
      () => api.get('/portal/student/today-classes').then(r => r.data),
      () => ({ data: DUMMY_STUDENT_DASHBOARD.today_classes })
    ),

  // ─────────────────────────────────────────────────────────────────────────
  // ATTENDANCE
  // ─────────────────────────────────────────────────────────────────────────
  getAttendance: (filters = {}) =>
    withFallback(
      () => api.get('/portal/student/attendance', { params: filters }).then(r => r.data),
      () => ({ data: DUMMY_ATTENDANCE })
    ),

  // ─────────────────────────────────────────────────────────────────────────
  // ASSIGNMENTS
  // ─────────────────────────────────────────────────────────────────────────
  getAssignments: (filters = {}, page = 1, limit = 10) =>
    withFallback(
      () => api.get('/portal/student/assignments', { 
        params: { ...filters, page, limit } 
      }).then(r => r.data),
      () => ({ data: DUMMY_ASSIGNMENTS })
    ),

  getUpcomingAssignments: (limit = 5) =>
    withFallback(
      () => api.get('/portal/student/assignments/upcoming', { params: { limit } }).then(r => r.data),
      () => ({ data: DUMMY_STUDENT_DASHBOARD.upcoming_assignments })
    ),

  submitAssignment: (assignmentId, formData) =>
    api.post(`/portal/student/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // ─────────────────────────────────────────────────────────────────────────
  // RESULTS
  // ─────────────────────────────────────────────────────────────────────────
  getResults: (filters = {}) =>
    withFallback(
      () => api.get('/portal/student/results', { params: filters }).then(r => r.data),
      () => ({ data: DUMMY_RESULTS })
    ),

  getRecentResults: (limit = 3) =>
    withFallback(
      () => api.get('/portal/student/results/recent', { params: { limit } }).then(r => r.data),
      () => ({ data: DUMMY_STUDENT_DASHBOARD.recent_results })
    ),

  // ─────────────────────────────────────────────────────────────────────────
  // FEES
  // ─────────────────────────────────────────────────────────────────────────
  getFees: (filters = {}) =>
    withFallback(
      () => api.get('/portal/student/fees', { params: filters }).then(r => r.data),
      () => ({ data: DUMMY_FEES })
    ),

  getFeeSummary: () =>
    withFallback(
      () => api.get('/portal/student/fees/summary').then(r => r.data),
      () => ({ data: DUMMY_STUDENT_DASHBOARD.fee_status })
    ),

  // ─────────────────────────────────────────────────────────────────────────
  // NOTICES
  // ─────────────────────────────────────────────────────────────────────────
  getNotices: (filters = {}, page = 1, limit = 10) =>
    withFallback(
      () => api.get('/portal/student/notices', { 
        params: { ...filters, page, limit } 
      }).then(r => r.data),
      () => ({ 
        data: { 
          data: DUMMY_STUDENT_DASHBOARD.notices,
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 }
        } 
      })
    ),

  getRecentNotices: (limit = 5) =>
    withFallback(
      () => api.get('/portal/student/notices/recent', { params: { limit } }).then(r => r.data),
      () => ({ data: DUMMY_STUDENT_DASHBOARD.notices })
    ),

  // ─────────────────────────────────────────────────────────────────────────
  // LIBRARY
  // ─────────────────────────────────────────────────────────────────────────
  getLibraryData: () =>
    withFallback(
      () => api.get('/portal/student/library').then(r => r.data),
      () => ({ 
        data: {
          issued_books: [],
          available_books: [],
          history: []
        } 
      })
    )
};