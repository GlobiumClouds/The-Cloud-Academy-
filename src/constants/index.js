/**
 * The Clouds Academy — App-wide Constants
 */

// ── Permissions (mirror of backend src/config/permissions.js) ─────────────
export const PERMISSIONS = {
  // Students
  STUDENT_CREATE:         'student.create',
  STUDENT_READ:           'student.read',
  STUDENT_UPDATE:         'student.update',
  STUDENT_DELETE:         'student.delete',
  STUDENT_EXPORT:         'student.export',

  // Admissions
  ADMISSION_CREATE:       'admission.create',
  ADMISSION_READ:         'admission.read',
  ADMISSION_UPDATE:       'admission.update',
  ADMISSION_DELETE:       'admission.delete',
  ADMISSION_APPROVE:      'admission.approve',

  // Parents / Guardians
  PARENT_CREATE:          'parent.create',
  PARENT_READ:            'parent.read',
  PARENT_UPDATE:          'parent.update',
  PARENT_DELETE:          'parent.delete',

  // Teachers
  TEACHER_CREATE:         'teacher.create',
  TEACHER_READ:           'teacher.read',
  TEACHER_UPDATE:         'teacher.update',
  TEACHER_DELETE:         'teacher.delete',

  // Classes
  CLASS_CREATE:           'class.create',
  CLASS_READ:             'class.read',
  CLASS_UPDATE:           'class.update',
  CLASS_DELETE:           'class.delete',

  // Sections
  SECTION_CREATE:         'section.create',
  SECTION_READ:           'section.read',
  SECTION_UPDATE:         'section.update',
  SECTION_DELETE:         'section.delete',

  // Subjects
  SUBJECT_CREATE:         'subject.create',
  SUBJECT_READ:           'subject.read',
  SUBJECT_UPDATE:         'subject.update',
  SUBJECT_DELETE:         'subject.delete',

  // Timetable
  TIMETABLE_CREATE:       'timetable.create',
  TIMETABLE_READ:         'timetable.read',
  TIMETABLE_UPDATE:       'timetable.update',
  TIMETABLE_DELETE:       'timetable.delete',

  // Attendance
  ATTENDANCE_CREATE:      'attendance.create',
  ATTENDANCE_READ:        'attendance.read',
  ATTENDANCE_UPDATE:      'attendance.update',
  ATTENDANCE_EXPORT:      'attendance.export',

  // Fees
  FEE_CREATE:             'fee.create',
  FEE_READ:               'fee.read',
  FEE_UPDATE:             'fee.update',
  FEE_DELETE:             'fee.delete',
  FEE_COLLECT:            'fee.collect',
  FEE_REFUND:             'fee.refund',
  FEE_EXPORT:             'fee.export',

  // Fee Templates
  FEE_TEMPLATE_CREATE:    'fee_template.create',
  FEE_TEMPLATE_READ:      'fee_template.read',
  FEE_TEMPLATE_UPDATE:    'fee_template.update',
  FEE_TEMPLATE_DELETE:    'fee_template.delete',
  FEE_TEMPLATE_ASSIGN:    'fee_template.assign',

  // Exams
  EXAM_CREATE:            'exam.create',
  EXAM_READ:              'exam.read',
  EXAM_UPDATE:            'exam.update',
  EXAM_DELETE:            'exam.delete',
  EXAM_PUBLISH:           'exam.publish',

  // HR & Payroll
  PAYROLL_READ:           'payroll.read',
  PAYROLL_CREATE:         'payroll.create',
  PAYROLL_UPDATE:         'payroll.update',
  PAYROLL_DELETE:         'payroll.delete',
  PAYROLL_GENERATE:       'payroll.generate',
  PAYROLL_EXPORT:         'payroll.export',
  LEAVE_READ:             'leave.read',
  LEAVE_CREATE:           'leave.create',
  LEAVE_APPROVE:          'leave.approve',

  // Communication
  NOTICE_CREATE:          'notice.create',
  NOTICE_READ:            'notice.read',
  NOTICE_UPDATE:          'notice.update',
  NOTICE_DELETE:          'notice.delete',
  NOTIFICATION_SEND:      'notification.send',

  // Reports
  REPORT_FINANCIAL:       'report.financial',
  REPORT_ATTENDANCE:      'report.attendance',
  REPORT_STUDENT:         'report.student',
  REPORT_EXAM:            'report.exam',
  REPORT_SALARY:          'report.salary',
  REPORT_EXPORT:          'report.export',

  // Roles & Users
  ROLE_CREATE:            'role.create',
  ROLE_READ:              'role.read',
  ROLE_UPDATE:            'role.update',
  ROLE_DELETE:            'role.delete',
  ROLE_ASSIGN:            'role.assign',
  USER_CREATE:            'user.create',
  USER_READ:              'user.read',
  USER_UPDATE:            'user.update',
  USER_DELETE:            'user.delete',

  // Academic Year
  ACADEMIC_YEAR_CREATE:   'academic_year.create',
  ACADEMIC_YEAR_READ:     'academic_year.read',
  ACADEMIC_YEAR_UPDATE:   'academic_year.update',
  ACADEMIC_YEAR_DELETE:   'academic_year.delete',

  // School / Settings
  SCHOOL_UPDATE:          'school.update',
  SCHOOL_SETTINGS:        'school.settings',
  SCHOOL_ASSIGN_ROLE:     'school.assign_role',

  // Branches
  BRANCH_CREATE:          'branch.create',
  BRANCH_READ:            'branch.read',
  BRANCH_UPDATE:          'branch.update',
  BRANCH_DELETE:          'branch.delete',
};

// ── Nav items for School portal ───────────────────────────────────────────
// Each item optionally requires a permission code to be visible.
// `group` is used by the sidebar to render a section heading.
export const SCHOOL_NAV = [
  // ── Core ──────────────────────────────────────────────────────────────
  { label: 'Dashboard',        href: '/dashboard',       icon: 'LayoutDashboard', permission: null,                              group: null },

  // ── Admissions & Students ─────────────────────────────────────────────
  { label: 'Admissions',       href: '/admissions',      icon: 'ClipboardList',   permission: PERMISSIONS.ADMISSION_READ,        group: 'Students' },
  { label: 'Students',         href: '/students',        icon: 'Users',           permission: PERMISSIONS.STUDENT_READ,          group: 'Students' },
  { label: 'Parents',          href: '/parents',         icon: 'UserCog',         permission: PERMISSIONS.PARENT_READ,           group: 'Students' },

  // ── Staff ─────────────────────────────────────────────────────────────
  { label: 'Teachers',         href: '/teachers',        icon: 'GraduationCap',   permission: PERMISSIONS.TEACHER_READ,          group: 'Staff' },
  { label: 'Staff Attendance', href: '/staff-attendance',icon: 'CalendarCheck',   permission: PERMISSIONS.ATTENDANCE_READ,       group: 'Staff' },
  { label: 'Payroll',          href: '/payroll',         icon: 'DollarSign',      permission: PERMISSIONS.PAYROLL_READ,          group: 'Staff' },

  // ── Academics ─────────────────────────────────────────────────────────
  { label: 'Classes',          href: '/classes',         icon: 'BookOpen',        permission: PERMISSIONS.CLASS_READ,            group: 'Academics' },
  { label: 'Sections',         href: '/sections',        icon: 'Layers',          permission: PERMISSIONS.SECTION_READ,          group: 'Academics' },
  { label: 'Subjects',          href: '/subjects',        icon: 'BookMarked',      permission: PERMISSIONS.SUBJECT_READ,          group: 'Academics' },
  { label: 'Timetable',        href: '/timetable',       icon: 'CalendarDays',    permission: PERMISSIONS.TIMETABLE_READ,        group: 'Academics' },
  { label: 'Attendance',       href: '/attendance',      icon: 'CalendarCheck',   permission: PERMISSIONS.ATTENDANCE_READ,       group: 'Academics' },
  { label: 'Exams',            href: '/exams',           icon: 'FileText',        permission: PERMISSIONS.EXAM_READ,             group: 'Academics' },

  // ── Finance ───────────────────────────────────────────────────────────
  { label: 'Fees',             href: '/fees',            icon: 'CreditCard',      permission: PERMISSIONS.FEE_READ,              group: 'Finance' },
  { label: 'Fee Templates',    href: '/fee-templates',   icon: 'FileText',        permission: PERMISSIONS.FEE_TEMPLATE_READ,     group: 'Finance' },

  // ── Communication ─────────────────────────────────────────────────────
  { label: 'Notice Board',     href: '/notices',         icon: 'Bell',            permission: PERMISSIONS.NOTICE_READ,           group: 'Communication' },

  // ── Reports ───────────────────────────────────────────────────────────
  { label: 'Reports',          href: '/reports',         icon: 'BarChart2',       permission: PERMISSIONS.REPORT_STUDENT,        group: 'Reports' },

  // ── Admin ─────────────────────────────────────────────────────────────
  { label: 'Academic Years',   href: '/academic-years',  icon: 'Calendar',        permission: PERMISSIONS.ACADEMIC_YEAR_READ,    group: 'Admin' },
  { label: 'Roles',            href: '/roles',           icon: 'ShieldCheck',     permission: PERMISSIONS.ROLE_READ,             group: 'Admin' },
  { label: 'Users',            href: '/users',           icon: 'UserCog',         permission: PERMISSIONS.USER_READ,             group: 'Admin' },
  { label: 'Branches',         href: '/branches',        icon: 'GitBranch',       permission: PERMISSIONS.BRANCH_READ,           group: 'Admin', hideForRoles: ['BRANCH_ADMIN'] },
  { label: 'Settings',         href: '/settings',        icon: 'Settings',        permission: PERMISSIONS.SCHOOL_SETTINGS,       group: 'Admin' },
];

// ── Gender options ────────────────────────────────────────────────────────
export const GENDER_OPTIONS = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other' },
];

// ── Attendance status options ─────────────────────────────────────────────
export const ATTENDANCE_STATUS = [
  { value: 'present', label: 'Present', color: 'green' },
  { value: 'absent',  label: 'Absent',  color: 'red' },
  { value: 'late',    label: 'Late',    color: 'yellow' },
  { value: 'leave',   label: 'Leave',   color: 'blue' },
  { value: 'holiday', label: 'Holiday', color: 'purple' },
];

// ── Fee voucher status ────────────────────────────────────────────────────
export const FEE_STATUS = [
  { value: 'pending',   label: 'Pending',   color: 'yellow' },
  { value: 'paid',      label: 'Paid',      color: 'green' },
  { value: 'overdue',   label: 'Overdue',   color: 'red' },
  { value: 'partial',   label: 'Partial',   color: 'blue' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
];

// ── Payment methods ───────────────────────────────────────────────────────
export const PAYMENT_METHODS = [
  { value: 'cash',          label: 'Cash' },
  { value: 'cheque',        label: 'Cheque' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'jazzcash',      label: 'JazzCash' },
  { value: 'easypaisa',     label: 'EasyPaisa' },
  { value: 'stripe',        label: 'Card (Stripe)' },
  { value: 'other',         label: 'Other' },
];

// ── Exam types ────────────────────────────────────────────────────────────
export const EXAM_TYPES = [
  { value: 'mid_term',   label: 'Mid Term' },
  { value: 'final',      label: 'Final' },
  { value: 'unit_test',  label: 'Unit Test' },
  { value: 'monthly',    label: 'Monthly' },
  { value: 'other',      label: 'Other' },
];

// ── Months ────────────────────────────────────────────────────────────────
export const MONTHS = [
  { value: 1,  label: 'January' },
  { value: 2,  label: 'February' },
  { value: 3,  label: 'March' },
  { value: 4,  label: 'April' },
  { value: 5,  label: 'May' },
  { value: 6,  label: 'June' },
  { value: 7,  label: 'July' },
  { value: 8,  label: 'August' },
  { value: 9,  label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

// ── Week days ─────────────────────────────────────────────────────────────
export const WEEK_DAYS = [
  { value: 'monday',    label: 'Monday' },
  { value: 'tuesday',   label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday',  label: 'Thursday' },
  { value: 'friday',    label: 'Friday' },
  { value: 'saturday',  label: 'Saturday' },
  { value: 'sunday',    label: 'Sunday' },
];

// ── Admission status ──────────────────────────────────────────────────────
export const ADMISSION_STATUS = [
  { value: 'pending',   label: 'Pending',   color: 'yellow' },
  { value: 'approved',  label: 'Approved',  color: 'green'  },
  { value: 'rejected',  label: 'Rejected',  color: 'red'    },
  { value: 'waitlist',  label: 'Waitlist',  color: 'blue'   },
];

// ── Leave types ───────────────────────────────────────────────────────────
export const LEAVE_TYPES = [
  { value: 'sick',        label: 'Sick Leave'       },
  { value: 'casual',      label: 'Casual Leave'     },
  { value: 'annual',      label: 'Annual Leave'     },
  { value: 'maternity',   label: 'Maternity Leave'  },
  { value: 'paternity',   label: 'Paternity Leave'  },
  { value: 'unpaid',      label: 'Unpaid Leave'     },
  { value: 'other',       label: 'Other'            },
];

// ── Leave status ─────────────────────────────────────────────────────────
export const LEAVE_STATUS = [
  { value: 'pending',   label: 'Pending',   color: 'yellow' },
  { value: 'approved',  label: 'Approved',  color: 'green'  },
  { value: 'rejected',  label: 'Rejected',  color: 'red'    },
  { value: 'cancelled', label: 'Cancelled', color: 'gray'   },
];

// ── Payroll status ────────────────────────────────────────────────────────
export const PAYROLL_STATUS = [
  { value: 'draft',     label: 'Draft',     color: 'gray'   },
  { value: 'generated', label: 'Generated', color: 'yellow' },
  { value: 'paid',      label: 'Paid',      color: 'green'  },
  { value: 'cancelled', label: 'Cancelled', color: 'red'    },
];

// ── Fee template fee types ────────────────────────────────────────────────
export const FEE_COMPONENT_TYPES = [
  { value: 'tuition',      label: 'Tuition Fee'     },
  { value: 'admission',    label: 'Admission Fee'   },
  { value: 'transport',    label: 'Transport Fee'   },
  { value: 'lab',          label: 'Lab Fee'         },
  { value: 'library',      label: 'Library Fee'     },
  { value: 'sports',       label: 'Sports Fee'      },
  { value: 'examination',  label: 'Examination Fee' },
  { value: 'late_fine',    label: 'Late Fine'       },
  { value: 'other',        label: 'Other'           },
];

// ── Notice audience ───────────────────────────────────────────────────────
export const NOTICE_AUDIENCE = [
  { value: 'all',       label: 'Everyone'        },
  { value: 'students',  label: 'Students Only'   },
  { value: 'teachers',  label: 'Teachers Only'   },
  { value: 'parents',   label: 'Parents Only'    },
  { value: 'staff',     label: 'Staff Only'      },
];

// ── Notice priority ───────────────────────────────────────────────────────
export const NOTICE_PRIORITY = [
  { value: 'low',      label: 'Low'      },
  { value: 'medium',   label: 'Medium'   },
  { value: 'high',     label: 'High'     },
  { value: 'urgent',   label: 'Urgent'   },
];

// ── Timetable periods (default school timing) ─────────────────────────────
export const DEFAULT_PERIODS = [
  { period: 1, start: '08:00', end: '08:40' },
  { period: 2, start: '08:40', end: '09:20' },
  { period: 3, start: '09:20', end: '10:00' },
  { period: 4, start: '10:30', end: '11:10' },  // after 30-min break
  { period: 5, start: '11:10', end: '11:50' },
  { period: 6, start: '11:50', end: '12:30' },
  { period: 7, start: '13:30', end: '14:10' },  // after lunch
  { period: 8, start: '14:10', end: '14:50' },
];

// ── Report types ──────────────────────────────────────────────────────────
export const REPORT_TYPES = [
  { value: 'student',    label: 'Student Report',    icon: 'Users'       },
  { value: 'fee',        label: 'Fee Report',         icon: 'CreditCard'  },
  { value: 'attendance', label: 'Attendance Report',  icon: 'CalendarCheck'},
  { value: 'salary',     label: 'Salary Report',      icon: 'DollarSign'  },
  { value: 'exam',       label: 'Exam Report',         icon: 'FileText'    },
];

// ── Salary grade levels ───────────────────────────────────────────────────
export const SALARY_GRADES = [
  { value: 'G1', label: 'Grade 1 — Junior Staff'     },
  { value: 'G2', label: 'Grade 2 — Mid-Level Staff'  },
  { value: 'G3', label: 'Grade 3 — Senior Staff'     },
  { value: 'G4', label: 'Grade 4 — Management'       },
  { value: 'G5', label: 'Grade 5 — Administration'   },
];

// ── Relationship options (parent/guardian) ────────────────────────────────
export const RELATIONSHIP_OPTIONS = [
  { value: 'father',    label: 'Father'    },
  { value: 'mother',    label: 'Mother'    },
  { value: 'guardian',  label: 'Guardian'  },
  { value: 'sibling',   label: 'Sibling'   },
  { value: 'other',     label: 'Other'     },
];
