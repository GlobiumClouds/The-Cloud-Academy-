/**
 * The Clouds Academy — Permission Constants & Groups
 *
 * Single source of truth for ALL permission codes.
 * Format matches the DB seed file (01.roles.seed.js) exactly.
 *
 * Permissions are stored per user-type in JSONB:
 *   { instituteAdmin: [...perms], teacher: [...perms], student: [...perms], parent: [...perms] }
 */

// ─── Permission codes (match DB seed exactly) ─────────────────────────────────
export const PERM = {
  // Dashboard
  DASHBOARD_VIEW:           'dashboard.view',
  DASHBOARD_ANALYTICS:      'dashboard.analytics',

  // Students
  STUDENTS_CREATE:          'students.create',
  STUDENTS_READ:            'students.read',
  STUDENTS_UPDATE:          'students.update',
  STUDENTS_DELETE:          'students.delete',
  STUDENTS_DEACTIVATE:      'students.deactivate',
  STUDENTS_TRANSFER:        'students.transfer',
  STUDENTS_PROMOTE:         'students.promote',
  STUDENTS_EXPORT:          'students.export',

  // Teachers
  TEACHERS_CREATE:          'teachers.create',
  TEACHERS_READ:            'teachers.read',
  TEACHERS_UPDATE:          'teachers.update',
  TEACHERS_DELETE:          'teachers.delete',
  TEACHERS_DEACTIVATE:      'teachers.deactivate',

  // Parents
  PARENTS_CREATE:           'parents.create',
  PARENTS_READ:             'parents.read',
  PARENTS_UPDATE:           'parents.update',
  PARENTS_DELETE:           'parents.delete',
  PARENTS_DEACTIVATE:       'parents.deactivate',

  // Staff
  STAFF_CREATE:             'staff.create',
  STAFF_READ:               'staff.read',
  STAFF_UPDATE:             'staff.update',
  STAFF_DELETE:             'staff.delete',
  STAFF_DEACTIVATE:         'staff.deactivate',

  // Classes
  CLASSES_CREATE:           'classes.create',
  CLASSES_READ:             'classes.read',
  CLASSES_UPDATE:           'classes.update',
  CLASSES_DELETE:           'classes.delete',
  CLASSES_DEACTIVATE:       'classes.deactivate',

  // Sections
  SECTIONS_CREATE:          'sections.create',
  SECTIONS_READ:            'sections.read',
  SECTIONS_UPDATE:          'sections.update',
  SECTIONS_DELETE:          'sections.delete',
  SECTIONS_DEACTIVATE:      'sections.deactivate',

  // Subjects
  SUBJECTS_CREATE:          'subjects.create',
  SUBJECTS_READ:            'subjects.read',
  SUBJECTS_UPDATE:          'subjects.update',
  SUBJECTS_DELETE:          'subjects.delete',
  SUBJECTS_DEACTIVATE:      'subjects.deactivate',

  // Academic Years
  ACADEMIC_YEARS_CREATE:    'academic_years.create',
  ACADEMIC_YEARS_READ:      'academic_years.read',
  ACADEMIC_YEARS_UPDATE:    'academic_years.update',
  ACADEMIC_YEARS_ACTIVATE:  'academic_years.activate',

  // Admissions
  ADMISSIONS_CREATE:        'admissions.create',
  ADMISSIONS_READ:          'admissions.read',
  ADMISSIONS_UPDATE:        'admissions.update',
  ADMISSIONS_APPROVE:       'admissions.approve',

  // Timetable
  TIMETABLE_CREATE:         'timetable.create',
  TIMETABLE_READ:           'timetable.read',
  TIMETABLE_UPDATE:         'timetable.update',

  // Attendance (special action names from seed)
  ATTENDANCE_MARK:          'attendance.mark',
  ATTENDANCE_VIEW:          'attendance.view',
  ATTENDANCE_REPORT:        'attendance.report',
  ATTENDANCE_EXPORT:        'attendance.export',

  // Exams
  EXAMS_CREATE:             'exams.create',
  EXAMS_READ:               'exams.read',
  EXAMS_UPDATE:             'exams.update',
  EXAMS_DELETE:             'exams.delete',
  EXAMS_DEACTIVATE:         'exams.deactivate',

  // Exam Results (special action names from seed)
  EXAM_RESULTS_ENTER:       'exam_results.enter',
  EXAM_RESULTS_VIEW:        'exam_results.view',
  EXAM_RESULTS_PUBLISH:     'exam_results.publish',
  EXAM_RESULTS_UPDATE:      'exam_results.update',

  // Fee Templates
  FEE_TEMPLATES_CREATE:     'fee_templates.create',
  FEE_TEMPLATES_READ:       'fee_templates.read',
  FEE_TEMPLATES_UPDATE:     'fee_templates.update',
  FEE_TEMPLATES_DELETE:     'fee_templates.delete',
  FEE_TEMPLATES_DEACTIVATE: 'fee_templates.deactivate',

  // Fees & Finance (special action names from seed)
  FEES_CREATE:              'fees.create',
  FEES_READ:                'fees.read',
  FEES_COLLECT:             'fees.collect',
  FEES_UPDATE:              'fees.update',
  FEES_REPORT:              'fees.report',
  FEES_DELETE:              'fees.delete',
  FEES_DISCOUNT:            'fees.discount',
  FEES_EXPORT:              'fees.export',

  // Payroll (special action names from seed)
  PAYROLL_CREATE:           'payroll.create',
  PAYROLL_READ:             'payroll.read',
  PAYROLL_PROCESS:          'payroll.process',
  PAYROLL_REPORT:           'payroll.report',

  // Notices
  NOTICES_CREATE:           'notices.create',
  NOTICES_READ:             'notices.read',
  NOTICES_UPDATE:           'notices.update',
  NOTICES_DELETE:           'notices.delete',
  NOTICES_DEACTIVATE:       'notices.deactivate',

  // Notifications
  NOTIFICATIONS_SEND:       'notifications.send',
  NOTIFICATIONS_READ:       'notifications.read',
  NOTIFICATIONS_MANAGE:     'notifications.manage',

  // Reports
  REPORTS_STUDENT:          'reports.student',
  REPORTS_ATTENDANCE:       'reports.attendance',
  REPORTS_FEE:              'reports.fee',
  REPORTS_EXAM:             'reports.exam',
  REPORTS_ANALYTICS:        'reports.analytics',
  REPORTS_PAYROLL:          'reports.payroll',

  // Roles & Users
  ROLES_READ:               'roles.read',
  ROLES_CREATE:             'roles.create',
  ROLES_UPDATE:             'roles.update',
  ROLES_DELETE:             'roles.delete',
  ROLES_DEACTIVATE:         'roles.deactivate',
  ROLES_ASSIGN:             'roles.assign',
  USERS_CREATE:             'users.create',
  USERS_READ:               'users.read',
  USERS_UPDATE:             'users.update',
  USERS_DELETE:             'users.delete',
  USERS_DEACTIVATE:         'users.deactivate',

  // Settings & Library
  SETTINGS_VIEW:            'settings.view',
  SETTINGS_UPDATE:          'settings.update',
  LIBRARY_ACCESS:           'library.access',
};

// ─── Institute Admin permission groups (24 groups) ────────────────────────────
export const ADMIN_PERMISSION_GROUPS = [
  {
    label: 'Dashboard',
    icon: '📊',
    perms: ['dashboard.view', 'dashboard.analytics'],
  },
  {
    label: 'Students',
    icon: '🎓',
    perms: ['students.create', 'students.read', 'students.update', 'students.delete', 'students.deactivate', 'students.transfer', 'students.promote', 'students.export'],
  },
  {
    label: 'Teachers',
    icon: '👩‍🏫',
    perms: ['teachers.create', 'teachers.read', 'teachers.update', 'teachers.delete', 'teachers.deactivate'],
  },
  {
    label: 'Parents',
    icon: '👨‍👩‍👧',
    perms: ['parents.create', 'parents.read', 'parents.update', 'parents.delete', 'parents.deactivate'],
  },
  {
    label: 'Staff',
    icon: '💼',
    perms: ['staff.create', 'staff.read', 'staff.update', 'staff.delete', 'staff.deactivate'],
  },
  {
    label: 'Classes',
    icon: '🏫',
    perms: ['classes.create', 'classes.read', 'classes.update', 'classes.delete', 'classes.deactivate'],
  },
  {
    label: 'Sections',
    icon: '📋',
    perms: ['sections.create', 'sections.read', 'sections.update', 'sections.delete', 'sections.deactivate'],
  },
  {
    label: 'Subjects',
    icon: '📗',
    perms: ['subjects.create', 'subjects.read', 'subjects.update', 'subjects.delete', 'subjects.deactivate'],
  },
  {
    label: 'Timetable',
    icon: '🗓',
    perms: ['timetable.create', 'timetable.read', 'timetable.update'],
  },
  {
    label: 'Academic Years',
    icon: '📅',
    perms: ['academic_years.create', 'academic_years.read', 'academic_years.update', 'academic_years.activate'],
  },
  {
    label: 'Admissions',
    icon: '📝',
    perms: ['admissions.create', 'admissions.read', 'admissions.update', 'admissions.approve'],
  },
  {
    label: 'Attendance',
    icon: '✅',
    perms: ['attendance.mark', 'attendance.view', 'attendance.report', 'attendance.export'],
  },
  {
    label: 'Exams',
    icon: '🧪',
    perms: ['exams.create', 'exams.read', 'exams.update', 'exams.delete', 'exams.deactivate'],
  },
  {
    label: 'Exam Results',
    icon: '📈',
    perms: ['exam_results.enter', 'exam_results.view', 'exam_results.publish', 'exam_results.update'],
  },
  {
    label: 'Fee Templates',
    icon: '🧾',
    perms: ['fee_templates.create', 'fee_templates.read', 'fee_templates.update', 'fee_templates.delete', 'fee_templates.deactivate'],
  },
  {
    label: 'Fees & Finance',
    icon: '💰',
    perms: ['fees.create', 'fees.read', 'fees.collect', 'fees.update', 'fees.report', 'fees.delete', 'fees.discount', 'fees.export'],
  },
  {
    label: 'Payroll',
    icon: '💵',
    perms: ['payroll.create', 'payroll.read', 'payroll.process', 'payroll.report'],
  },
  {
    label: 'Notices',
    icon: '📣',
    perms: ['notices.create', 'notices.read', 'notices.update', 'notices.delete', 'notices.deactivate'],
  },
  {
    label: 'Notifications',
    icon: '🔔',
    perms: ['notifications.send', 'notifications.read', 'notifications.manage'],
  },
  {
    label: 'Reports',
    icon: '📊',
    perms: ['reports.student', 'reports.attendance', 'reports.fee', 'reports.exam', 'reports.analytics', 'reports.payroll'],
  },
  {
    label: 'Roles',
    icon: '🛡',
    perms: ['roles.create', 'roles.read', 'roles.update', 'roles.delete', 'roles.deactivate', 'roles.assign'],
  },
  {
    label: 'Branches',
    icon: '🛡',
    perms: ['branches.create', 'branches.read', 'branches.update', 'branches.delete', 'branches.deactivate', 'branches.assign_role'],
  },
  {
    label: 'Users',
    icon: '👥',
    perms: ['users.create', 'users.read', 'users.update', 'users.delete', 'users.deactivate'],
  },
  {
    label: 'Settings',
    icon: '⚙',
    perms: ['settings.view', 'settings.update'],
  },
  {
    label: 'Library',
    icon: '📖',
    perms: ['library.access'],
  },
];

// ─── Teacher permission groups (11 groups) ────────────────────────────────────
export const TEACHER_PERMISSION_GROUPS = [
  {
    label: 'Dashboard',
    icon: '📊',
    perms: ['dashboard.view'],
  },
  {
    label: 'Students',
    icon: '🎓',
    perms: ['students.read'],
  },
  {
    label: 'Classes',
    icon: '🏫',
    perms: ['classes.read', 'sections.read', 'subjects.read'],
  },
  {
    label: 'Timetable',
    icon: '🗓',
    perms: ['timetable.read', 'timetable.create', 'timetable.update'],
  },
  {
    label: 'Admissions',
    icon: '📝',
    perms: ['admissions.read'],
  },
  {
    label: 'Attendance',
    icon: '✅',
    perms: ['attendance.mark', 'attendance.view', 'attendance.report'],
  },
  {
    label: 'Exams',
    icon: '🧪',
    perms: ['exams.create', 'exams.read', 'exams.update'],
  },
  {
    label: 'Exam Results',
    icon: '📈',
    perms: ['exam_results.enter', 'exam_results.view', 'exam_results.publish', 'exam_results.update'],
  },
  {
    label: 'Notices',
    icon: '📣',
    perms: ['notices.create', 'notices.read', 'notices.update'],
  },
  {
    label: 'Notifications',
    icon: '🔔',
    perms: ['notifications.read'],
  },
  {
    label: 'Library',
    icon: '📖',
    perms: ['library.access'],
  },
];

// ─── Student permission groups (10 groups) ────────────────────────────────────
export const STUDENT_PERMISSION_GROUPS = [
  {
    label: 'Dashboard',
    icon: '📊',
    perms: ['dashboard.view'],
  },
  {
    label: 'Attendance',
    icon: '✅',
    perms: ['attendance.view'],
  },
  {
    label: 'Exam Results',
    icon: '📈',
    perms: ['exam_results.view'],
  },
  {
    label: 'Fees',
    icon: '💰',
    perms: ['fees.read'],
  },
  {
    label: 'Timetable',
    icon: '🗓',
    perms: ['timetable.read'],
  },
  {
    label: 'Admissions',
    icon: '📝',
    perms: ['admissions.read'],
  },
  {
    label: 'Notices',
    icon: '📣',
    perms: ['notices.read'],
  },
  {
    label: 'Notifications',
    icon: '🔔',
    perms: ['notifications.read'],
  },
  {
    label: 'Reports',
    icon: '📊',
    perms: ['reports.attendance'],
  },
  {
    label: 'Library',
    icon: '📖',
    perms: ['library.access'],
  },
];

// ─── Parent permission groups (7 groups) ─────────────────────────────────────
export const PARENT_PERMISSION_GROUPS = [
  {
    label: 'Dashboard',
    icon: '📊',
    perms: ['dashboard.view'],
  },
  {
    label: 'Attendance',
    icon: '✅',
    perms: ['attendance.view'],
  },
  {
    label: 'Exam Results',
    icon: '📈',
    perms: ['exam_results.view'],
  },
  {
    label: 'Fees',
    icon: '💰',
    perms: ['fees.read', 'fees.collect'],
  },
  {
    label: 'Notices',
    icon: '📣',
    perms: ['notices.read'],
  },
  {
    label: 'Notifications',
    icon: '🔔',
    perms: ['notifications.read'],
  },
  {
    label: 'Reports',
    icon: '📊',
    perms: ['reports.student', 'reports.exam', 'reports.attendance'],
  },
];

// ─── Flat arrays per user type ────────────────────────────────────────────────
export const ALL_ADMIN_PERMISSIONS   = ADMIN_PERMISSION_GROUPS.flatMap((g) => g.perms);
export const ALL_TEACHER_PERMISSIONS = TEACHER_PERMISSION_GROUPS.flatMap((g) => g.perms);
export const ALL_STUDENT_PERMISSIONS = STUDENT_PERMISSION_GROUPS.flatMap((g) => g.perms);
export const ALL_PARENT_PERMISSIONS  = PARENT_PERMISSION_GROUPS.flatMap((g) => g.perms);

// ─── Backward-compat aliases ──────────────────────────────────────────────────
export const PERMISSION_GROUPS = ADMIN_PERMISSION_GROUPS;
export const ALL_PERMISSIONS   = ALL_ADMIN_PERMISSIONS;
export const PERMISSIONS       = PERM;

/** 'students.create' => 'Create' */
export const permLabel = (code) => {
  if (!code) return '';
  const action = code.split('.').pop() ?? code;
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

/** 'students.create' => 'Students: Create' */
export const permFullLabel = (code) => {
  if (!code) return '';
  const [mod, ...rest] = code.split('.');
  const m = mod.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const a = rest.join('.').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return m + ': ' + a;
};
