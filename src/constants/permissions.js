// /**
//  * The Clouds Academy — Permission Constants & Groups
//  *
//  * Single source of truth for ALL permission codes.
//  * Format matches the DB seed file (01.roles.seed.js) exactly.
//  *
//  * Permissions are stored per user-type in JSONB:
//  *   { instituteAdmin: [...perms], teacher: [...perms], student: [...perms], parent: [...perms] }
//  */

// // ─── Permission codes (match DB seed exactly) ─────────────────────────────────
// export const PERM = {
//   // Dashboard
//   DASHBOARD_VIEW:           'dashboard.view',
//   DASHBOARD_ANALYTICS:      'dashboard.analytics',

//   // Students
//   STUDENTS_CREATE:          'students.create',
//   STUDENTS_READ:            'students.read',
//   STUDENTS_UPDATE:          'students.update',
//   STUDENTS_DELETE:          'students.delete',
//   STUDENTS_DEACTIVATE:      'students.deactivate',
//   STUDENTS_TRANSFER:        'students.transfer',
//   STUDENTS_PROMOTE:         'students.promote',
//   STUDENTS_EXPORT:          'students.export',

//   // Teachers
//   TEACHERS_CREATE:          'teachers.create',
//   TEACHERS_READ:            'teachers.read',
//   TEACHERS_UPDATE:          'teachers.update',
//   TEACHERS_DELETE:          'teachers.delete',
//   TEACHERS_DEACTIVATE:      'teachers.deactivate',

//   // Parents
//   PARENTS_CREATE:           'parents.create',
//   PARENTS_READ:             'parents.read',
//   PARENTS_UPDATE:           'parents.update',
//   PARENTS_DELETE:           'parents.delete',
//   PARENTS_DEACTIVATE:       'parents.deactivate',

//   // Staff
//   STAFF_CREATE:             'staff.create',
//   STAFF_READ:               'staff.read',
//   STAFF_UPDATE:             'staff.update',
//   STAFF_DELETE:             'staff.delete',
//   STAFF_DEACTIVATE:         'staff.deactivate',

//   // Classes
//   CLASSES_CREATE:           'classes.create',
//   CLASSES_READ:             'classes.read',
//   CLASSES_UPDATE:           'classes.update',
//   CLASSES_DELETE:           'classes.delete',
//   CLASSES_DEACTIVATE:       'classes.deactivate',

//   // Sections
//   SECTIONS_CREATE:          'sections.create',
//   SECTIONS_READ:            'sections.read',
//   SECTIONS_UPDATE:          'sections.update',
//   SECTIONS_DELETE:          'sections.delete',
//   SECTIONS_DEACTIVATE:      'sections.deactivate',

//   // Subjects
//   SUBJECTS_CREATE:          'subjects.create',
//   SUBJECTS_READ:            'subjects.read',
//   SUBJECTS_UPDATE:          'subjects.update',
//   SUBJECTS_DELETE:          'subjects.delete',
//   SUBJECTS_DEACTIVATE:      'subjects.deactivate',

//   // Academic Years
//   ACADEMIC_YEARS_CREATE:    'academic_years.create',
//   ACADEMIC_YEARS_READ:      'academic_years.read',
//   ACADEMIC_YEARS_UPDATE:    'academic_years.update',
//   ACADEMIC_YEARS_ACTIVATE:  'academic_years.activate',

//   // Admissions
//   ADMISSIONS_CREATE:        'admissions.create',
//   ADMISSIONS_READ:          'admissions.read',
//   ADMISSIONS_UPDATE:        'admissions.update',
//   ADMISSIONS_APPROVE:       'admissions.approve',

//   // Timetable
//   TIMETABLE_CREATE:         'timetable.create',
//   TIMETABLE_READ:           'timetable.read',
//   TIMETABLE_UPDATE:         'timetable.update',

//   // Attendance (special action names from seed)
//   ATTENDANCE_MARK:          'attendance.mark',
//   ATTENDANCE_VIEW:          'attendance.view',
//   ATTENDANCE_REPORT:        'attendance.report',
//   ATTENDANCE_EXPORT:        'attendance.export',

//   // Exams
//   EXAMS_CREATE:             'exams.create',
//   EXAMS_READ:               'exams.read',
//   EXAMS_UPDATE:             'exams.update',
//   EXAMS_DELETE:             'exams.delete',
//   EXAMS_DEACTIVATE:         'exams.deactivate',

//   // Exam Results (special action names from seed)
//   EXAM_RESULTS_ENTER:       'exam_results.enter',
//   EXAM_RESULTS_VIEW:        'exam_results.view',
//   EXAM_RESULTS_PUBLISH:     'exam_results.publish',
//   EXAM_RESULTS_UPDATE:      'exam_results.update',

//   // Fee Templates
//   FEE_TEMPLATES_CREATE:     'fee_templates.create',
//   FEE_TEMPLATES_READ:       'fee_templates.read',
//   FEE_TEMPLATES_UPDATE:     'fee_templates.update',
//   FEE_TEMPLATES_DELETE:     'fee_templates.delete',
//   FEE_TEMPLATES_DEACTIVATE: 'fee_templates.deactivate',

//   // Fees & Finance (special action names from seed)
//   FEES_CREATE:              'fees.create',
//   FEES_READ:                'fees.read',
//   FEES_COLLECT:             'fees.collect',
//   FEES_UPDATE:              'fees.update',
//   FEES_REPORT:              'fees.report',
//   FEES_DELETE:              'fees.delete',
//   FEES_DISCOUNT:            'fees.discount',
//   FEES_EXPORT:              'fees.export',

//   // Payroll (special action names from seed)
//   PAYROLL_CREATE:           'payroll.create',
//   PAYROLL_READ:             'payroll.read',
//   PAYROLL_PROCESS:          'payroll.process',
//   PAYROLL_REPORT:           'payroll.report',

//   // Notices
//   NOTICES_CREATE:           'notices.create',
//   NOTICES_READ:             'notices.read',
//   NOTICES_UPDATE:           'notices.update',
//   NOTICES_DELETE:           'notices.delete',
//   NOTICES_DEACTIVATE:       'notices.deactivate',

//   // Notifications
//   NOTIFICATIONS_SEND:       'notifications.send',
//   NOTIFICATIONS_READ:       'notifications.read',
//   NOTIFICATIONS_MANAGE:     'notifications.manage',

//   // Reports
//   REPORTS_STUDENT:          'reports.student',
//   REPORTS_ATTENDANCE:       'reports.attendance',
//   REPORTS_FEE:              'reports.fee',
//   REPORTS_EXAM:             'reports.exam',
//   REPORTS_ANALYTICS:        'reports.analytics',
//   REPORTS_PAYROLL:          'reports.payroll',

//   // Roles & Users
//   ROLES_READ:               'roles.read',
//   ROLES_CREATE:             'roles.create',
//   ROLES_UPDATE:             'roles.update',
//   ROLES_DELETE:             'roles.delete',
//   ROLES_DEACTIVATE:         'roles.deactivate',
//   ROLES_ASSIGN:             'roles.assign',
//   USERS_CREATE:             'users.create',
//   USERS_READ:               'users.read',
//   USERS_UPDATE:             'users.update',
//   USERS_DELETE:             'users.delete',
//   USERS_DEACTIVATE:         'users.deactivate',

//   // Settings & Library
//   SETTINGS_VIEW:            'settings.view',
//   SETTINGS_UPDATE:          'settings.update',
//   LIBRARY_ACCESS:           'library.access',
// };

// // ─── Institute Admin permission groups (24 groups) ────────────────────────────
// export const ADMIN_PERMISSION_GROUPS = [
//   {
//     label: 'Dashboard',
//     icon: '📊',
//     perms: ['dashboard.view', 'dashboard.analytics'],
//   },
//   {
//     label: 'Students',
//     icon: '🎓',
//     perms: ['students.create', 'students.read', 'students.update', 'students.delete', 'students.deactivate', 'students.transfer', 'students.promote', 'students.export'],
//   },
//   {
//     label: 'Teachers',
//     icon: '👩‍🏫',
//     perms: ['teachers.create', 'teachers.read', 'teachers.update', 'teachers.delete', 'teachers.deactivate'],
//   },
//   {
//     label: 'Parents',
//     icon: '👨‍👩‍👧',
//     perms: ['parents.create', 'parents.read', 'parents.update', 'parents.delete', 'parents.deactivate'],
//   },
//   {
//     label: 'Staff',
//     icon: '💼',
//     perms: ['staff.create', 'staff.read', 'staff.update', 'staff.delete', 'staff.deactivate'],
//   },
//   {
//     label: 'Classes',
//     icon: '🏫',
//     perms: ['classes.create', 'classes.read', 'classes.update', 'classes.delete', 'classes.deactivate'],
//   },
//   {
//     label: 'Sections',
//     icon: '📋',
//     perms: ['sections.create', 'sections.read', 'sections.update', 'sections.delete', 'sections.deactivate'],
//   },
//   {
//     label: 'Subjects',
//     icon: '📗',
//     perms: ['subjects.create', 'subjects.read', 'subjects.update', 'subjects.delete', 'subjects.deactivate'],
//   },
//   {
//     label: 'Timetable',
//     icon: '🗓',
//     perms: ['timetable.create', 'timetable.read', 'timetable.update'],
//   },
//   {
//     label: 'Academic Years',
//     icon: '📅',
//     perms: ['academic_years.create', 'academic_years.read', 'academic_years.update', 'academic_years.activate'],
//   },
//   {
//     label: 'Admissions',
//     icon: '📝',
//     perms: ['admissions.create', 'admissions.read', 'admissions.update', 'admissions.approve'],
//   },
//   {
//     label: 'Attendance',
//     icon: '✅',
//     perms: ['attendance.mark', 'attendance.view', 'attendance.report', 'attendance.export'],
//   },
//   {
//     label: 'Exams',
//     icon: '🧪',
//     perms: ['exams.create', 'exams.read', 'exams.update', 'exams.delete', 'exams.deactivate'],
//   },
//   {
//     label: 'Exam Results',
//     icon: '📈',
//     perms: ['exam_results.enter', 'exam_results.view', 'exam_results.publish', 'exam_results.update'],
//   },
//   {
//     label: 'Fee Templates',
//     icon: '🧾',
//     perms: ['fee_templates.create', 'fee_templates.read', 'fee_templates.update', 'fee_templates.delete', 'fee_templates.deactivate'],
//   },
//   {
//     label: 'Fees & Finance',
//     icon: '💰',
//     perms: ['fees.create', 'fees.read', 'fees.collect', 'fees.update', 'fees.report', 'fees.delete', 'fees.discount', 'fees.export'],
//   },
//   {
//     label: 'Payroll',
//     icon: '💵',
//     perms: ['payroll.create', 'payroll.read', 'payroll.process', 'payroll.report'],
//   },
//   {
//     label: 'Notices',
//     icon: '📣',
//     perms: ['notices.create', 'notices.read', 'notices.update', 'notices.delete', 'notices.deactivate'],
//   },
//   {
//     label: 'Notifications',
//     icon: '🔔',
//     perms: ['notifications.send', 'notifications.read', 'notifications.manage'],
//   },
//   {
//     label: 'Reports',
//     icon: '📊',
//     perms: ['reports.student', 'reports.attendance', 'reports.fee', 'reports.exam', 'reports.analytics', 'reports.payroll'],
//   },
//   {
//     label: 'Roles',
//     icon: '🛡',
//     perms: ['roles.create', 'roles.read', 'roles.update', 'roles.delete', 'roles.deactivate', 'roles.assign'],
//   },
//   {
//     label: 'Branches',
//     icon: '🛡',
//     perms: ['branches.create', 'branches.read', 'branches.update', 'branches.delete', 'branches.deactivate', 'branches.assign_role'],
//   },
//   {
//     label: 'Users',
//     icon: '👥',
//     perms: ['users.create', 'users.read', 'users.update', 'users.delete', 'users.deactivate'],
//   },
//   {
//     label: 'Settings',
//     icon: '⚙',
//     perms: ['settings.view', 'settings.update'],
//   },
//   {
//     label: 'Library',
//     icon: '📖',
//     perms: ['library.access'],
//   },
// ];

// // ─── Teacher permission groups (11 groups) ────────────────────────────────────
// export const TEACHER_PERMISSION_GROUPS = [
//   {
//     label: 'Dashboard',
//     icon: '📊',
//     perms: ['dashboard.view'],
//   },
//   {
//     label: 'Students',
//     icon: '🎓',
//     perms: ['students.read'],
//   },
//   {
//     label: 'Classes',
//     icon: '🏫',
//     perms: ['classes.read', 'sections.read', 'subjects.read'],
//   },
//   {
//     label: 'Timetable',
//     icon: '🗓',
//     perms: ['timetable.read', 'timetable.create', 'timetable.update'],
//   },
//   {
//     label: 'Admissions',
//     icon: '📝',
//     perms: ['admissions.read'],
//   },
//   {
//     label: 'Attendance',
//     icon: '✅',
//     perms: ['attendance.mark', 'attendance.view', 'attendance.report'],
//   },
//   {
//     label: 'Exams',
//     icon: '🧪',
//     perms: ['exams.create', 'exams.read', 'exams.update'],
//   },
//   {
//     label: 'Exam Results',
//     icon: '📈',
//     perms: ['exam_results.enter', 'exam_results.view', 'exam_results.publish', 'exam_results.update'],
//   },
//   {
//     label: 'Notices',
//     icon: '📣',
//     perms: ['notices.create', 'notices.read', 'notices.update'],
//   },
//   {
//     label: 'Notifications',
//     icon: '🔔',
//     perms: ['notifications.read'],
//   },
//   {
//     label: 'Library',
//     icon: '📖',
//     perms: ['library.access'],
//   },
// ];

// // ─── Student permission groups (10 groups) ────────────────────────────────────
// export const STUDENT_PERMISSION_GROUPS = [
//   {
//     label: 'Dashboard',
//     icon: '📊',
//     perms: ['dashboard.view'],
//   },
//   {
//     label: 'Attendance',
//     icon: '✅',
//     perms: ['attendance.view'],
//   },
//   {
//     label: 'Exam Results',
//     icon: '📈',
//     perms: ['exam_results.view'],
//   },
//   {
//     label: 'Fees',
//     icon: '💰',
//     perms: ['fees.read'],
//   },
//   {
//     label: 'Timetable',
//     icon: '🗓',
//     perms: ['timetable.read'],
//   },
//   {
//     label: 'Admissions',
//     icon: '📝',
//     perms: ['admissions.read'],
//   },
//   {
//     label: 'Notices',
//     icon: '📣',
//     perms: ['notices.read'],
//   },
//   {
//     label: 'Notifications',
//     icon: '🔔',
//     perms: ['notifications.read'],
//   },
//   {
//     label: 'Reports',
//     icon: '📊',
//     perms: ['reports.attendance'],
//   },
//   {
//     label: 'Library',
//     icon: '📖',
//     perms: ['library.access'],
//   },
// ];

// // ─── Parent permission groups (7 groups) ─────────────────────────────────────
// export const PARENT_PERMISSION_GROUPS = [
//   {
//     label: 'Dashboard',
//     icon: '📊',
//     perms: ['dashboard.view'],
//   },
//   {
//     label: 'Attendance',
//     icon: '✅',
//     perms: ['attendance.view'],
//   },
//   {
//     label: 'Exam Results',
//     icon: '📈',
//     perms: ['exam_results.view'],
//   },
//   {
//     label: 'Fees',
//     icon: '💰',
//     perms: ['fees.read', 'fees.collect'],
//   },
//   {
//     label: 'Notices',
//     icon: '📣',
//     perms: ['notices.read'],
//   },
//   {
//     label: 'Notifications',
//     icon: '🔔',
//     perms: ['notifications.read'],
//   },
//   {
//     label: 'Reports',
//     icon: '📊',
//     perms: ['reports.student', 'reports.exam', 'reports.attendance'],
//   },
// ];

// // ─── Flat arrays per user type ────────────────────────────────────────────────
// export const ALL_ADMIN_PERMISSIONS   = ADMIN_PERMISSION_GROUPS.flatMap((g) => g.perms);
// export const ALL_TEACHER_PERMISSIONS = TEACHER_PERMISSION_GROUPS.flatMap((g) => g.perms);
// export const ALL_STUDENT_PERMISSIONS = STUDENT_PERMISSION_GROUPS.flatMap((g) => g.perms);
// export const ALL_PARENT_PERMISSIONS  = PARENT_PERMISSION_GROUPS.flatMap((g) => g.perms);

// // ─── Backward-compat aliases ──────────────────────────────────────────────────
// export const PERMISSION_GROUPS = ADMIN_PERMISSION_GROUPS;
// export const ALL_PERMISSIONS   = ALL_ADMIN_PERMISSIONS;
// export const PERMISSIONS       = PERM;

// /** 'students.create' => 'Create' */
// export const permLabel = (code) => {
//   if (!code) return '';
//   const action = code.split('.').pop() ?? code;
//   return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// };

// /** 'students.create' => 'Students: Create' */
// export const permFullLabel = (code) => {
//   if (!code) return '';
//   const [mod, ...rest] = code.split('.');
//   const m = mod.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
//   const a = rest.join('.').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
//   return m + ': ' + a;
// };







/**
 * COMPLETE PERMISSIONS CONSTANTS
 * The Clouds Academy
 * 
 * Single source of truth for ALL permissions across all user types:
 * - instituteAdmin (Master/Platform level)
 * - teacher (Portal level)
 * - student (Portal level)
 * - parent (Portal level)
 * 
 * Format matches DB seed and API requirements.
 */

// ─────────────────────────────────────────────────────────────────────────────
// BASE PERMISSION CODES (Matches DB seed)
// ─────────────────────────────────────────────────────────────────────────────
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

  // Classes / Courses / Programs (context-aware)
  CLASSES_CREATE:           'classes.create',
  CLASSES_READ:             'classes.read',
  CLASSES_UPDATE:           'classes.update',
  CLASSES_DELETE:           'classes.delete',
  CLASSES_DEACTIVATE:       'classes.deactivate',

  // Sections / Batches / Groups
  SECTIONS_CREATE:          'sections.create',
  SECTIONS_READ:            'sections.read',
  SECTIONS_UPDATE:          'sections.update',
  SECTIONS_DELETE:          'sections.delete',
  SECTIONS_DEACTIVATE:      'sections.deactivate',

  // Subjects / Courses / Modules
  SUBJECTS_CREATE:          'subjects.create',
  SUBJECTS_READ:            'subjects.read',
  SUBJECTS_UPDATE:          'subjects.update',
  SUBJECTS_DELETE:          'subjects.delete',
  SUBJECTS_DEACTIVATE:      'subjects.deactivate',

  // Academic Years / Sessions / Cycles
  ACADEMIC_YEARS_CREATE:    'academic_years.create',
  ACADEMIC_YEARS_READ:      'academic_years.read',
  ACADEMIC_YEARS_UPDATE:    'academic_years.update',
  ACADEMIC_YEARS_ACTIVATE:  'academic_years.activate',

  // Admissions / Enrollments / Registrations
  ADMISSIONS_CREATE:        'admissions.create',
  ADMISSIONS_READ:          'admissions.read',
  ADMISSIONS_UPDATE:        'admissions.update',
  ADMISSIONS_APPROVE:       'admissions.approve',

  // Timetable / Schedule
  TIMETABLE_CREATE:         'timetable.create',
  TIMETABLE_READ:           'timetable.read',
  TIMETABLE_UPDATE:         'timetable.update',

  // Attendance
  ATTENDANCE_MARK:          'attendance.mark',
  ATTENDANCE_VIEW:          'attendance.view',
  ATTENDANCE_REPORT:        'attendance.report',
  ATTENDANCE_EXPORT:        'attendance.export',
  
  // Staff Attendance
  STAFF_ATTENDANCE_MARK:    'staff_attendance.mark',
  STAFF_ATTENDANCE_VIEW:    'staff_attendance.view',
  STAFF_ATTENDANCE_REPORT:  'staff_attendance.report',

  // Exams / Tests / Assessments
  EXAMS_CREATE:             'exams.create',
  EXAMS_READ:               'exams.read',
  EXAMS_UPDATE:             'exams.update',
  EXAMS_DELETE:             'exams.delete',
  EXAMS_DEACTIVATE:         'exams.deactivate',

  // Exam Results
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

  // Fees & Finance
  FEES_CREATE:              'fees.create',
  FEES_READ:                'fees.read',
  FEES_COLLECT:             'fees.collect',
  FEES_UPDATE:              'fees.update',
  FEES_REPORT:              'fees.report',
  FEES_DELETE:              'fees.delete',
  FEES_DISCOUNT:            'fees.discount',
  FEES_EXPORT:              'fees.export',

  // Payroll
  PAYROLL_CREATE:           'payroll.create',
  PAYROLL_READ:             'payroll.read',
  PAYROLL_PROCESS:          'payroll.process',
  PAYROLL_REPORT:           'payroll.report',

  // Notices / Announcements
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

  // Roles & Permissions
  ROLES_READ:               'roles.read',
  ROLES_CREATE:             'roles.create',
  ROLES_UPDATE:             'roles.update',
  ROLES_DELETE:             'roles.delete',
  ROLES_DEACTIVATE:         'roles.deactivate',
  ROLES_ASSIGN:             'roles.assign',

  // Users
  USERS_CREATE:             'users.create',
  USERS_READ:               'users.read',
  USERS_UPDATE:             'users.update',
  USERS_DELETE:             'users.delete',
  USERS_DEACTIVATE:         'users.deactivate',

  // Branches / Campuses
  BRANCHES_CREATE:          'branches.create',
  BRANCHES_READ:            'branches.read',
  BRANCHES_UPDATE:          'branches.update',
  BRANCHES_DELETE:          'branches.delete',
  BRANCHES_DEACTIVATE:      'branches.deactivate',
  BRANCHES_ASSIGN_ROLE:     'branches.assign_role',

  // Settings
  SETTINGS_VIEW:            'settings.view',
  SETTINGS_UPDATE:          'settings.update',

  // Library
  LIBRARY_ACCESS:           'library.access',
  LIBRARY_BOOKS_READ:       'library.books.read',
  LIBRARY_BOOKS_ISSUE:      'library.books.issue',
  
  // Courses / Programs (for coaching/academy)
  COURSES_CREATE:           'courses.create',
  COURSES_READ:             'courses.read',
  COURSES_UPDATE:           'courses.update',
  COURSES_DELETE:           'courses.delete',
  
  // Batches
  BATCHES_CREATE:           'batches.create',
  BATCHES_READ:             'batches.read',
  BATCHES_UPDATE:           'batches.update',
  BATCHES_DELETE:           'batches.delete',
  
  // Programs (for college/university)
  PROGRAMS_CREATE:          'programs.create',
  PROGRAMS_READ:            'programs.read',
  PROGRAMS_UPDATE:          'programs.update',
  PROGRAMS_DELETE:          'programs.delete',
  
  // Semesters
  SEMESTERS_CREATE:         'semesters.create',
  SEMESTERS_READ:           'semesters.read',
  SEMESTERS_UPDATE:         'semesters.update',
  SEMESTERS_ACTIVATE:       'semesters.activate',
  
  // Departments
  DEPARTMENTS_CREATE:       'departments.create',
  DEPARTMENTS_READ:         'departments.read',
  DEPARTMENTS_UPDATE:       'departments.update',
  DEPARTMENTS_DELETE:       'departments.delete',
  
  // Research (university specific)
  RESEARCH_READ:            'research.read',
  RESEARCH_SUBMIT:          'research.submit',
  RESEARCH_APPROVE:         'research.approve',
};

// ─────────────────────────────────────────────────────────────────────────────
// INSTITUTE ADMIN PERMISSION GROUPS (Master/Platform Level)
// Sirf instituteAdmin ke liye
// ─────────────────────────────────────────────────────────────────────────────
export const ADMIN_PERMISSION_GROUPS = [
  {
    label: 'Dashboard',
    icon: '📊',
    perms: [PERM.DASHBOARD_VIEW, PERM.DASHBOARD_ANALYTICS],
  },
  {
    label: 'Students',
    icon: '🎓',
    perms: [
      PERM.STUDENTS_CREATE, PERM.STUDENTS_READ, PERM.STUDENTS_UPDATE,
      PERM.STUDENTS_DELETE, PERM.STUDENTS_DEACTIVATE, PERM.STUDENTS_TRANSFER,
      PERM.STUDENTS_PROMOTE, PERM.STUDENTS_EXPORT
    ],
  },
  {
    label: 'Teachers',
    icon: '👩‍🏫',
    perms: [
      PERM.TEACHERS_CREATE, PERM.TEACHERS_READ, PERM.TEACHERS_UPDATE,
      PERM.TEACHERS_DELETE, PERM.TEACHERS_DEACTIVATE
    ],
  },
  {
    label: 'Parents',
    icon: '👨‍👩‍👧',
    perms: [
      PERM.PARENTS_CREATE, PERM.PARENTS_READ, PERM.PARENTS_UPDATE,
      PERM.PARENTS_DELETE, PERM.PARENTS_DEACTIVATE
    ],
  },
  {
    label: 'Staff',
    icon: '💼',
    perms: [
      PERM.STAFF_CREATE, PERM.STAFF_READ, PERM.STAFF_UPDATE,
      PERM.STAFF_DELETE, PERM.STAFF_DEACTIVATE
    ],
  },
  {
    label: 'Classes',
    icon: '🏫',
    perms: [
      PERM.CLASSES_CREATE, PERM.CLASSES_READ, PERM.CLASSES_UPDATE,
      PERM.CLASSES_DELETE, PERM.CLASSES_DEACTIVATE
    ],
  },
  {
    label: 'Sections',
    icon: '📋',
    perms: [
      PERM.SECTIONS_CREATE, PERM.SECTIONS_READ, PERM.SECTIONS_UPDATE,
      PERM.SECTIONS_DELETE, PERM.SECTIONS_DEACTIVATE
    ],
  },
  {
    label: 'Subjects',
    icon: '📗',
    perms: [
      PERM.SUBJECTS_CREATE, PERM.SUBJECTS_READ, PERM.SUBJECTS_UPDATE,
      PERM.SUBJECTS_DELETE, PERM.SUBJECTS_DEACTIVATE
    ],
  },
  {
    label: 'Courses (Coaching)',
    icon: '📚',
    perms: [
      PERM.COURSES_CREATE, PERM.COURSES_READ, PERM.COURSES_UPDATE,
      PERM.COURSES_DELETE
    ],
  },
  {
    label: 'Batches',
    icon: '👥',
    perms: [
      PERM.BATCHES_CREATE, PERM.BATCHES_READ, PERM.BATCHES_UPDATE,
      PERM.BATCHES_DELETE
    ],
  },
  {
    label: 'Programs',
    icon: '🎯',
    perms: [
      PERM.PROGRAMS_CREATE, PERM.PROGRAMS_READ, PERM.PROGRAMS_UPDATE,
      PERM.PROGRAMS_DELETE
    ],
  },
  {
    label: 'Semesters',
    icon: '📅',
    perms: [
      PERM.SEMESTERS_CREATE, PERM.SEMESTERS_READ, PERM.SEMESTERS_UPDATE,
      PERM.SEMESTERS_ACTIVATE
    ],
  },
  {
    label: 'Departments',
    icon: '🏛️',
    perms: [
      PERM.DEPARTMENTS_CREATE, PERM.DEPARTMENTS_READ, PERM.DEPARTMENTS_UPDATE,
      PERM.DEPARTMENTS_DELETE
    ],
  },
  {
    label: 'Timetable',
    icon: '🗓',
    perms: [PERM.TIMETABLE_CREATE, PERM.TIMETABLE_READ, PERM.TIMETABLE_UPDATE],
  },
  {
    label: 'Academic Years',
    icon: '📅',
    perms: [
      PERM.ACADEMIC_YEARS_CREATE, PERM.ACADEMIC_YEARS_READ,
      PERM.ACADEMIC_YEARS_UPDATE, PERM.ACADEMIC_YEARS_ACTIVATE
    ],
  },
  {
    label: 'Admissions',
    icon: '📝',
    perms: [
      PERM.ADMISSIONS_CREATE, PERM.ADMISSIONS_READ,
      PERM.ADMISSIONS_UPDATE, PERM.ADMISSIONS_APPROVE
    ],
  },
  {
    label: 'Attendance',
    icon: '✅',
    perms: [
      PERM.ATTENDANCE_MARK, PERM.ATTENDANCE_VIEW,
      PERM.ATTENDANCE_REPORT, PERM.ATTENDANCE_EXPORT
    ],
  },
  {
    label: 'Staff Attendance',
    icon: '👤',
    perms: [
      PERM.STAFF_ATTENDANCE_MARK, PERM.STAFF_ATTENDANCE_VIEW,
      PERM.STAFF_ATTENDANCE_REPORT
    ],
  },
  {
    label: 'Exams',
    icon: '🧪',
    perms: [
      PERM.EXAMS_CREATE, PERM.EXAMS_READ, PERM.EXAMS_UPDATE,
      PERM.EXAMS_DELETE, PERM.EXAMS_DEACTIVATE
    ],
  },
  {
    label: 'Exam Results',
    icon: '📈',
    perms: [
      PERM.EXAM_RESULTS_ENTER, PERM.EXAM_RESULTS_VIEW,
      PERM.EXAM_RESULTS_PUBLISH, PERM.EXAM_RESULTS_UPDATE
    ],
  },
  {
    label: 'Fee Templates',
    icon: '🧾',
    perms: [
      PERM.FEE_TEMPLATES_CREATE, PERM.FEE_TEMPLATES_READ,
      PERM.FEE_TEMPLATES_UPDATE, PERM.FEE_TEMPLATES_DELETE,
      PERM.FEE_TEMPLATES_DEACTIVATE
    ],
  },
  {
    label: 'Fees & Finance',
    icon: '💰',
    perms: [
      PERM.FEES_CREATE, PERM.FEES_READ, PERM.FEES_COLLECT,
      PERM.FEES_UPDATE, PERM.FEES_REPORT, PERM.FEES_DELETE,
      PERM.FEES_DISCOUNT, PERM.FEES_EXPORT
    ],
  },
  {
    label: 'Payroll',
    icon: '💵',
    perms: [
      PERM.PAYROLL_CREATE, PERM.PAYROLL_READ,
      PERM.PAYROLL_PROCESS, PERM.PAYROLL_REPORT
    ],
  },
  {
    label: 'Notices',
    icon: '📣',
    perms: [
      PERM.NOTICES_CREATE, PERM.NOTICES_READ, PERM.NOTICES_UPDATE,
      PERM.NOTICES_DELETE, PERM.NOTICES_DEACTIVATE
    ],
  },
  {
    label: 'Notifications',
    icon: '🔔',
    perms: [
      PERM.NOTIFICATIONS_SEND, PERM.NOTIFICATIONS_READ,
      PERM.NOTIFICATIONS_MANAGE
    ],
  },
  {
    label: 'Reports',
    icon: '📊',
    perms: [
      PERM.REPORTS_STUDENT, PERM.REPORTS_ATTENDANCE, PERM.REPORTS_FEE,
      PERM.REPORTS_EXAM, PERM.REPORTS_ANALYTICS, PERM.REPORTS_PAYROLL
    ],
  },
  {
    label: 'Roles',
    icon: '🛡',
    perms: [
      PERM.ROLES_CREATE, PERM.ROLES_READ, PERM.ROLES_UPDATE,
      PERM.ROLES_DELETE, PERM.ROLES_DEACTIVATE, PERM.ROLES_ASSIGN
    ],
  },
  {
    label: 'Branches',
    icon: '🏢',
    perms: [
      PERM.BRANCHES_CREATE, PERM.BRANCHES_READ, PERM.BRANCHES_UPDATE,
      PERM.BRANCHES_DELETE, PERM.BRANCHES_DEACTIVATE, PERM.BRANCHES_ASSIGN_ROLE
    ],
  },
  {
    label: 'Users',
    icon: '👥',
    perms: [
      PERM.USERS_CREATE, PERM.USERS_READ, PERM.USERS_UPDATE,
      PERM.USERS_DELETE, PERM.USERS_DEACTIVATE
    ],
  },
  {
    label: 'Research (Univ)',
    icon: '🔬',
    perms: [
      PERM.RESEARCH_READ, PERM.RESEARCH_SUBMIT, PERM.RESEARCH_APPROVE
    ],
  },
  {
    label: 'Settings',
    icon: '⚙',
    perms: [PERM.SETTINGS_VIEW, PERM.SETTINGS_UPDATE],
  },
  {
    label: 'Library',
    icon: '📖',
    perms: [PERM.LIBRARY_ACCESS, PERM.LIBRARY_BOOKS_READ, PERM.LIBRARY_BOOKS_ISSUE],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER PERMISSION GROUPS (Portal Level)
// Jo teacher ko chahiye portal mein
// ─────────────────────────────────────────────────────────────────────────────
export const TEACHER_PERMISSION_GROUPS = [
  {
    label: 'Dashboard',
    icon: '📊',
    perms: [PERM.DASHBOARD_VIEW],
  },
  {
    label: 'My Students',
    icon: '🎓',
    perms: [PERM.STUDENTS_READ],
  },
  {
    label: 'Classes & Subjects',
    icon: '🏫',
    perms: [PERM.CLASSES_READ, PERM.SECTIONS_READ, PERM.SUBJECTS_READ],
  },
  {
    label: 'Timetable',
    icon: '🗓',
    perms: [PERM.TIMETABLE_READ, PERM.TIMETABLE_UPDATE],
  },
  {
    label: 'Attendance',
    icon: '✅',
    perms: [PERM.ATTENDANCE_MARK, PERM.ATTENDANCE_VIEW, PERM.ATTENDANCE_REPORT],
  },
  {
    label: 'Exams',
    icon: '🧪',
    perms: [PERM.EXAMS_READ, PERM.EXAMS_UPDATE],
  },
  {
    label: 'Exam Results',
    icon: '📈',
    perms: [PERM.EXAM_RESULTS_ENTER, PERM.EXAM_RESULTS_VIEW, PERM.EXAM_RESULTS_UPDATE],
  },
  {
    label: 'Notices',
    icon: '📣',
    perms: [PERM.NOTICES_READ, PERM.NOTICES_CREATE],
  },
  {
    label: 'Notifications',
    icon: '🔔',
    perms: [PERM.NOTIFICATIONS_READ],
  },
  {
    label: 'Reports',
    icon: '📊',
    perms: [PERM.REPORTS_STUDENT, PERM.REPORTS_ATTENDANCE, PERM.REPORTS_EXAM],
  },
  {
    label: 'Library',
    icon: '📖',
    perms: [PERM.LIBRARY_ACCESS],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT PERMISSION GROUPS (Portal Level)
// Jo student ko chahiye portal mein
// ─────────────────────────────────────────────────────────────────────────────
export const STUDENT_PERMISSION_GROUPS = [
  {
    label: 'Dashboard',
    icon: '📊',
    perms: [PERM.DASHBOARD_VIEW],
  },
  {
    label: 'My Attendance',
    icon: '✅',
    perms: [PERM.ATTENDANCE_VIEW],
  },
  {
    label: 'My Results',
    icon: '📈',
    perms: [PERM.EXAM_RESULTS_VIEW],
  },
  {
    label: 'My Fees',
    icon: '💰',
    perms: [PERM.FEES_READ],
  },
  {
    label: 'My Timetable',
    icon: '🗓',
    perms: [PERM.TIMETABLE_READ],
  },
  {
    label: 'Notices',
    icon: '📣',
    perms: [PERM.NOTICES_READ],
  },
  {
    label: 'Notifications',
    icon: '🔔',
    perms: [PERM.NOTIFICATIONS_READ],
  },
  {
    label: 'My Reports',
    icon: '📊',
    perms: [PERM.REPORTS_ATTENDANCE],
  },
  {
    label: 'Library',
    icon: '📖',
    perms: [PERM.LIBRARY_ACCESS],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PARENT PERMISSION GROUPS (Portal Level)
// Jo parent ko chahiye portal mein
// ─────────────────────────────────────────────────────────────────────────────
export const PARENT_PERMISSION_GROUPS = [
  {
    label: 'Dashboard',
    icon: '📊',
    perms: [PERM.DASHBOARD_VIEW],
  },
  {
    label: 'Ward Attendance',
    icon: '✅',
    perms: [PERM.ATTENDANCE_VIEW],
  },
  {
    label: 'Ward Results',
    icon: '📈',
    perms: [PERM.EXAM_RESULTS_VIEW],
  },
  {
    label: 'Ward Fees',
    icon: '💰',
    perms: [PERM.FEES_READ, PERM.FEES_COLLECT],
  },
  {
    label: 'Ward Timetable',
    icon: '🗓',
    perms: [PERM.TIMETABLE_READ],
  },
  {
    label: 'Notices',
    icon: '📣',
    perms: [PERM.NOTICES_READ],
  },
  {
    label: 'Notifications',
    icon: '🔔',
    perms: [PERM.NOTIFICATIONS_READ],
  },
  {
    label: 'Ward Reports',
    icon: '📊',
    perms: [PERM.REPORTS_STUDENT, PERM.REPORTS_ATTENDANCE, PERM.REPORTS_EXAM],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TUITION CENTER / COACHING SPECIFIC GROUPS
// Ye alag se add kiye hain agar specifically coaching ke liye chahiye
// ─────────────────────────────────────────────────────────────────────────────
export const COACHING_PERMISSION_GROUPS = [
  {
    label: 'Courses',
    icon: '📚',
    perms: [PERM.COURSES_CREATE, PERM.COURSES_READ, PERM.COURSES_UPDATE, PERM.COURSES_DELETE],
  },
  {
    label: 'Batches',
    icon: '👥',
    perms: [PERM.BATCHES_CREATE, PERM.BATCHES_READ, PERM.BATCHES_UPDATE, PERM.BATCHES_DELETE],
  },
  {
    label: 'Enrollments',
    icon: '📝',
    perms: [PERM.ADMISSIONS_CREATE, PERM.ADMISSIONS_READ, PERM.ADMISSIONS_UPDATE, PERM.ADMISSIONS_APPROVE],
  },
  {
    label: 'Session Schedule',
    icon: '🗓',
    perms: [PERM.TIMETABLE_CREATE, PERM.TIMETABLE_READ, PERM.TIMETABLE_UPDATE],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FLAT ARRAYS (For "Full Access" feature)
// Har user type ke liye saari permissions ka flat array
// ─────────────────────────────────────────────────────────────────────────────
export const ALL_ADMIN_PERMISSIONS = [
  // Dashboard
  PERM.DASHBOARD_VIEW, PERM.DASHBOARD_ANALYTICS,
  
  // Students
  PERM.STUDENTS_CREATE, PERM.STUDENTS_READ, PERM.STUDENTS_UPDATE,
  PERM.STUDENTS_DELETE, PERM.STUDENTS_DEACTIVATE, PERM.STUDENTS_TRANSFER,
  PERM.STUDENTS_PROMOTE, PERM.STUDENTS_EXPORT,
  
  // Teachers
  PERM.TEACHERS_CREATE, PERM.TEACHERS_READ, PERM.TEACHERS_UPDATE,
  PERM.TEACHERS_DELETE, PERM.TEACHERS_DEACTIVATE,
  
  // Parents
  PERM.PARENTS_CREATE, PERM.PARENTS_READ, PERM.PARENTS_UPDATE,
  PERM.PARENTS_DELETE, PERM.PARENTS_DEACTIVATE,
  
  // Staff
  PERM.STAFF_CREATE, PERM.STAFF_READ, PERM.STAFF_UPDATE,
  PERM.STAFF_DELETE, PERM.STAFF_DEACTIVATE,
  
  // Classes
  PERM.CLASSES_CREATE, PERM.CLASSES_READ, PERM.CLASSES_UPDATE,
  PERM.CLASSES_DELETE, PERM.CLASSES_DEACTIVATE,
  
  // Sections
  PERM.SECTIONS_CREATE, PERM.SECTIONS_READ, PERM.SECTIONS_UPDATE,
  PERM.SECTIONS_DELETE, PERM.SECTIONS_DEACTIVATE,
  
  // Subjects
  PERM.SUBJECTS_CREATE, PERM.SUBJECTS_READ, PERM.SUBJECTS_UPDATE,
  PERM.SUBJECTS_DELETE, PERM.SUBJECTS_DEACTIVATE,
  
  // Courses (Coaching)
  PERM.COURSES_CREATE, PERM.COURSES_READ, PERM.COURSES_UPDATE, PERM.COURSES_DELETE,
  
  // Batches
  PERM.BATCHES_CREATE, PERM.BATCHES_READ, PERM.BATCHES_UPDATE, PERM.BATCHES_DELETE,
  
  // Programs (College/Univ)
  PERM.PROGRAMS_CREATE, PERM.PROGRAMS_READ, PERM.PROGRAMS_UPDATE, PERM.PROGRAMS_DELETE,
  
  // Semesters
  PERM.SEMESTERS_CREATE, PERM.SEMESTERS_READ, PERM.SEMESTERS_UPDATE, PERM.SEMESTERS_ACTIVATE,
  
  // Departments
  PERM.DEPARTMENTS_CREATE, PERM.DEPARTMENTS_READ, PERM.DEPARTMENTS_UPDATE, PERM.DEPARTMENTS_DELETE,
  
  // Academic Years
  PERM.ACADEMIC_YEARS_CREATE, PERM.ACADEMIC_YEARS_READ,
  PERM.ACADEMIC_YEARS_UPDATE, PERM.ACADEMIC_YEARS_ACTIVATE,
  
  // Timetable
  PERM.TIMETABLE_CREATE, PERM.TIMETABLE_READ, PERM.TIMETABLE_UPDATE,
  
  // Admissions
  PERM.ADMISSIONS_CREATE, PERM.ADMISSIONS_READ,
  PERM.ADMISSIONS_UPDATE, PERM.ADMISSIONS_APPROVE,
  
  // Attendance
  PERM.ATTENDANCE_MARK, PERM.ATTENDANCE_VIEW,
  PERM.ATTENDANCE_REPORT, PERM.ATTENDANCE_EXPORT,
  
  // Staff Attendance
  PERM.STAFF_ATTENDANCE_MARK, PERM.STAFF_ATTENDANCE_VIEW, PERM.STAFF_ATTENDANCE_REPORT,
  
  // Exams
  PERM.EXAMS_CREATE, PERM.EXAMS_READ, PERM.EXAMS_UPDATE,
  PERM.EXAMS_DELETE, PERM.EXAMS_DEACTIVATE,
  
  // Exam Results
  PERM.EXAM_RESULTS_ENTER, PERM.EXAM_RESULTS_VIEW,
  PERM.EXAM_RESULTS_PUBLISH, PERM.EXAM_RESULTS_UPDATE,
  
  // Fee Templates
  PERM.FEE_TEMPLATES_CREATE, PERM.FEE_TEMPLATES_READ,
  PERM.FEE_TEMPLATES_UPDATE, PERM.FEE_TEMPLATES_DELETE,
  PERM.FEE_TEMPLATES_DEACTIVATE,
  
  // Fees
  PERM.FEES_CREATE, PERM.FEES_READ, PERM.FEES_COLLECT,
  PERM.FEES_UPDATE, PERM.FEES_REPORT, PERM.FEES_DELETE,
  PERM.FEES_DISCOUNT, PERM.FEES_EXPORT,
  
  // Payroll
  PERM.PAYROLL_CREATE, PERM.PAYROLL_READ,
  PERM.PAYROLL_PROCESS, PERM.PAYROLL_REPORT,
  
  // Notices
  PERM.NOTICES_CREATE, PERM.NOTICES_READ, PERM.NOTICES_UPDATE,
  PERM.NOTICES_DELETE, PERM.NOTICES_DEACTIVATE,
  
  // Notifications
  PERM.NOTIFICATIONS_SEND, PERM.NOTIFICATIONS_READ, PERM.NOTIFICATIONS_MANAGE,
  
  // Reports
  PERM.REPORTS_STUDENT, PERM.REPORTS_ATTENDANCE, PERM.REPORTS_FEE,
  PERM.REPORTS_EXAM, PERM.REPORTS_ANALYTICS, PERM.REPORTS_PAYROLL,
  
  // Roles
  PERM.ROLES_CREATE, PERM.ROLES_READ, PERM.ROLES_UPDATE,
  PERM.ROLES_DELETE, PERM.ROLES_DEACTIVATE, PERM.ROLES_ASSIGN,
  
  // Branches
  PERM.BRANCHES_CREATE, PERM.BRANCHES_READ, PERM.BRANCHES_UPDATE,
  PERM.BRANCHES_DELETE, PERM.BRANCHES_DEACTIVATE, PERM.BRANCHES_ASSIGN_ROLE,
  
  // Users
  PERM.USERS_CREATE, PERM.USERS_READ, PERM.USERS_UPDATE,
  PERM.USERS_DELETE, PERM.USERS_DEACTIVATE,
  
  // Research
  PERM.RESEARCH_READ, PERM.RESEARCH_SUBMIT, PERM.RESEARCH_APPROVE,
  
  // Settings
  PERM.SETTINGS_VIEW, PERM.SETTINGS_UPDATE,
  
  // Library
  PERM.LIBRARY_ACCESS, PERM.LIBRARY_BOOKS_READ, PERM.LIBRARY_BOOKS_ISSUE,
];

export const ALL_TEACHER_PERMISSIONS = TEACHER_PERMISSION_GROUPS.flatMap(g => g.perms);
export const ALL_STUDENT_PERMISSIONS = STUDENT_PERMISSION_GROUPS.flatMap(g => g.perms);
export const ALL_PARENT_PERMISSIONS = PARENT_PERMISSION_GROUPS.flatMap(g => g.perms);
export const ALL_COACHING_PERMISSIONS = COACHING_PERMISSION_GROUPS.flatMap(g => g.perms);

// ─────────────────────────────────────────────────────────────────────────────
// BACKWARD COMPATIBILITY ALIASES
// ─────────────────────────────────────────────────────────────────────────────
export const PERMISSION_GROUPS = ADMIN_PERMISSION_GROUPS;
export const ALL_PERMISSIONS = ALL_ADMIN_PERMISSIONS;
export const PERMISSIONS = PERM;

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

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

/** Parse permissions JSONB into user-type objects */
export const parsePermissions = (permissions) => {
  if (!permissions) return { instituteAdmin: [], teacher: [], student: [], parent: [] };
  if (Array.isArray(permissions)) {
    return { instituteAdmin: permissions, teacher: [], student: [], parent: [] };
  }
  return {
    instituteAdmin: permissions.instituteAdmin ?? [],
    teacher: permissions.teacher ?? [],
    student: permissions.student ?? [],
    parent: permissions.parent ?? [],
  };
};

/** Check if permissions include 'ALL' (full access) */
export const isFullAccess = (perms) => Array.isArray(perms) && perms.includes('ALL');

/** Get permission group by user type */
export const getPermissionGroupsByType = (type) => {
  switch(type) {
    case 'instituteAdmin': return ADMIN_PERMISSION_GROUPS;
    case 'teacher': return TEACHER_PERMISSION_GROUPS;
    case 'student': return STUDENT_PERMISSION_GROUPS;
    case 'parent': return PARENT_PERMISSION_GROUPS;
    case 'coaching': return COACHING_PERMISSION_GROUPS;
    default: return ADMIN_PERMISSION_GROUPS;
  }
};

/** Get all permissions by user type */
export const getAllPermissionsByType = (type) => {
  switch(type) {
    case 'instituteAdmin': return ALL_ADMIN_PERMISSIONS;
    case 'teacher': return ALL_TEACHER_PERMISSIONS;
    case 'student': return ALL_STUDENT_PERMISSIONS;
    case 'parent': return ALL_PARENT_PERMISSIONS;
    case 'coaching': return ALL_COACHING_PERMISSIONS;
    default: return ALL_ADMIN_PERMISSIONS;
  }
};

// Export all as default object as well
export default {
  PERM,
  ADMIN_PERMISSION_GROUPS,
  TEACHER_PERMISSION_GROUPS,
  STUDENT_PERMISSION_GROUPS,
  PARENT_PERMISSION_GROUPS,
  COACHING_PERMISSION_GROUPS,
  ALL_ADMIN_PERMISSIONS,
  ALL_TEACHER_PERMISSIONS,
  ALL_STUDENT_PERMISSIONS,
  ALL_PARENT_PERMISSIONS,
  ALL_COACHING_PERMISSIONS,
  PERMISSION_GROUPS,
  ALL_PERMISSIONS,
  PERMISSIONS,
  permLabel,
  permFullLabel,
  parsePermissions,
  isFullAccess,
  getPermissionGroupsByType,
  getAllPermissionsByType,
};