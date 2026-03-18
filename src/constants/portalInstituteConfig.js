// /**
//  * portalInstituteConfig.js
//  *
//  * Per-institute-type terminology map for the three portals
//  * (Student, Parent, Teacher).
//  *
//  * Usage:
//  *   import { getPortalTerms } from '@/constants/portalInstituteConfig';
//  *   const t = getPortalTerms(portalUser?.institute_type);
//  *   // then: t.classLabel, t.subjectLabel, t.nav.classes, …
//  */

// const CONFIG = {
//   // ── SCHOOL ───────────────────────────────────────────────
//   school: {
//     classLabel:         'Class',
//     classesLabel:       'Classes',
//     batchLabel:         'Section',
//     subjectLabel:       'Subject',
//     subjectsLabel:      'Subjects',
//     rollLabel:          'Roll No.',
//     examLabel:          'Exam',
//     examsLabel:         'Exams',
//     timetableLabel:     'Timetable',
//     syllabusLabel:      'Syllabus',
//     teacherLabel:       'Teacher',
//     instructorLabel:    'Teacher',
//     studentLabel:       'Student',
//     studentsLabel:      'Students',
//     feeLabel:           'Fee',
//     feesLabel:          'Fees',
//     assignmentLabel:    'Assignment',
//     assignmentsLabel:   'Assignments',
//     homeworkLabel:      'Homework Diary',
//     notesLabel:         'Notes',
//     marksLabel:         'Marks',
//     gradeLabel:         'Grade',
//     resultLabel:        'Result',
//     resultsLabel:       'Exam Results',
//     attendanceLabel:    'Attendance',
//     announcementsLabel: 'Announcements',
//     overviewLabel:      'Overview',
//     nav: {
//       overview:    'Overview',
//       classes:     'My Classes',
//       students:    'My Students',
//       notes:       'Notes',
//       assignments: 'Assignments',
//       homework:    'Homework & Diary',
//       attendance:  'Mark Attendance',
//       myAttend:    'My Attendance',
//       timetable:   'Timetable',
//       syllabus:    'Syllabus',
//       exams:       'My Exams',
//       fees:        'My Fees',
//       results:     'Exam Results',
//       announcements: 'Announcements',
//     },
//   },

//   // ── COACHING CENTER ───────────────────────────────────────
//   coaching: {
//     classLabel:         'Batch',
//     classesLabel:       'Batches',
//     batchLabel:         'Group',
//     subjectLabel:       'Course',
//     subjectsLabel:      'Courses',
//     rollLabel:          'Reg. No.',
//     examLabel:          'Test',
//     examsLabel:         'Tests',
//     timetableLabel:     'Schedule',
//     syllabusLabel:      'Course Outline',
//     teacherLabel:       'Instructor',
//     instructorLabel:    'Instructor',
//     studentLabel:       'Student',
//     studentsLabel:      'Students',
//     feeLabel:           'Fee',
//     feesLabel:          'Fees',
//     assignmentLabel:    'Practice Set',
//     assignmentsLabel:   'Practice Sets',
//     homeworkLabel:      'Daily Tasks',
//     notesLabel:         'Study Material',
//     marksLabel:         'Marks',
//     gradeLabel:         'Grade',
//     resultLabel:        'Result',
//     resultsLabel:       'Test Results',
//     attendanceLabel:    'Attendance',
//     announcementsLabel: 'Announcements',
//     overviewLabel:      'Overview',
//     nav: {
//       overview:    'Overview',
//       classes:     'My Batches',
//       students:    'My Students',
//       notes:       'Study Material',
//       assignments: 'Practice Sets',
//       homework:    'Daily Tasks',
//       attendance:  'Mark Attendance',
//       myAttend:    'My Attendance',
//       timetable:   'Schedule',
//       syllabus:    'Course Outline',
//       exams:       'My Tests',
//       fees:        'My Fees',
//       results:     'Test Results',
//       announcements: 'Announcements',
//     },
//   },

//   // ── ACADEMY ──────────────────────────────────────────────
//   academy: {
//     classLabel:         'Batch',
//     classesLabel:       'Batches',
//     batchLabel:         'Group',
//     subjectLabel:       'Course',
//     subjectsLabel:      'Courses',
//     rollLabel:          'Student ID',
//     examLabel:          'Assessment',
//     examsLabel:         'Assessments',
//     timetableLabel:     'Schedule',
//     syllabusLabel:      'Course Outline',
//     teacherLabel:       'Instructor',
//     instructorLabel:    'Instructor',
//     studentLabel:       'Trainee',
//     studentsLabel:      'Trainees',
//     feeLabel:           'Fee',
//     feesLabel:          'Fees',
//     assignmentLabel:    'Assignment',
//     assignmentsLabel:   'Assignments',
//     homeworkLabel:      'Practice Tasks',
//     notesLabel:         'Course Material',
//     marksLabel:         'Score',
//     gradeLabel:         'Grade',
//     resultLabel:        'Result',
//     resultsLabel:       'Assessment Results',
//     attendanceLabel:    'Attendance',
//     announcementsLabel: 'Announcements',
//     overviewLabel:      'Overview',
//     nav: {
//       overview:    'Overview',
//       classes:     'My Batches',
//       students:    'My Trainees',
//       notes:       'Course Material',
//       assignments: 'Assignments',
//       homework:    'Practice Tasks',
//       attendance:  'Mark Attendance',
//       myAttend:    'My Attendance',
//       timetable:   'Schedule',
//       syllabus:    'Course Outline',
//       exams:       'My Assessments',
//       fees:        'My Fees',
//       results:     'Assessment Results',
//       announcements: 'Announcements',
//     },
//   },

//   // ── COLLEGE ──────────────────────────────────────────────
//   college: {
//     classLabel:         'Class',
//     classesLabel:       'Classes',
//     batchLabel:         'Section',
//     subjectLabel:       'Subject',
//     subjectsLabel:      'Subjects',
//     rollLabel:          'Roll No.',
//     examLabel:          'Exam',
//     examsLabel:         'Exams',
//     timetableLabel:     'Timetable',
//     syllabusLabel:      'Syllabus',
//     teacherLabel:       'Lecturer',
//     instructorLabel:    'Lecturer',
//     studentLabel:       'Student',
//     studentsLabel:      'Students',
//     feeLabel:           'Fee',
//     feesLabel:          'Fees',
//     assignmentLabel:    'Assignment',
//     assignmentsLabel:   'Assignments',
//     homeworkLabel:      'Tasks & Diary',
//     notesLabel:         'Lecture Notes',
//     marksLabel:         'Marks',
//     gradeLabel:         'Grade',
//     resultLabel:        'Result',
//     resultsLabel:       'Exam Results',
//     attendanceLabel:    'Attendance',
//     announcementsLabel: 'Announcements',
//     overviewLabel:      'Overview',
//     nav: {
//       overview:    'Overview',
//       classes:     'My Classes',
//       students:    'My Students',
//       notes:       'Lecture Notes',
//       assignments: 'Assignments',
//       homework:    'Tasks & Diary',
//       attendance:  'Mark Attendance',
//       myAttend:    'My Attendance',
//       timetable:   'Timetable',
//       syllabus:    'Syllabus',
//       exams:       'My Exams',
//       fees:        'My Fees',
//       results:     'Exam Results',
//       announcements: 'Announcements',
//     },
//   },

//   // ── UNIVERSITY ───────────────────────────────────────────
//   university: {
//     classLabel:         'Program',
//     classesLabel:       'Courses',
//     batchLabel:         'Section',
//     subjectLabel:       'Course',
//     subjectsLabel:      'Courses',
//     rollLabel:          'Student ID',
//     examLabel:          'Exam',
//     examsLabel:         'Exams',
//     timetableLabel:     'Schedule',
//     syllabusLabel:      'Course Outline',
//     teacherLabel:       'Professor',
//     instructorLabel:    'Professor',
//     studentLabel:       'Student',
//     studentsLabel:      'Students',
//     feeLabel:           'Tuition Fee',
//     feesLabel:          'Tuition Fees',
//     assignmentLabel:    'Assignment',
//     assignmentsLabel:   'Assignments',
//     homeworkLabel:      'Tasks',
//     notesLabel:         'Lecture Notes',
//     marksLabel:         'Marks',
//     gradeLabel:         'GPA',
//     resultLabel:        'Result',
//     resultsLabel:       'Academic Results',
//     attendanceLabel:    'Attendance',
//     announcementsLabel: 'Announcements',
//     overviewLabel:      'Dashboard',
//     nav: {
//       overview:    'Dashboard',
//       classes:     'My Courses',
//       students:    'My Students',
//       notes:       'Lecture Notes',
//       assignments: 'Assignments',
//       homework:    'Tasks',
//       attendance:  'Mark Attendance',
//       myAttend:    'My Attendance',
//       timetable:   'Schedule',
//       syllabus:    'Course Outline',
//       exams:       'My Exams',
//       fees:        'My Fees',
//       results:     'Academic Results',
//       announcements: 'Notices',
//     },
//   },
// };

// /**
//  * Returns the terminology config for a given institute type.
//  * Falls back to 'school' if no match found.
//  *
//  * @param {string} instituteType  'school' | 'coaching' | 'academy' | 'college' | 'university'
//  */
// export function getPortalTerms(instituteType) {
//   return CONFIG[instituteType] || CONFIG.school;
// }

// export default CONFIG;










// src/constants/portalInstituteConfig.js
/**
 * portalInstituteConfig.js
 *
 * Complete per-institute-type terminology map for all three portals
 * (Student, Parent, Teacher).
 *
 * Includes all possible terms needed across the entire application.
 *
 * Usage:
 *   import { getPortalTerms } from '@/constants/portalInstituteConfig';
 *   const t = getPortalTerms(instituteType, userType);
 */

const CONFIG = {
  // ── SCHOOL ───────────────────────────────────────────────
  school: {
    // Institute identifiers
    instituteType: 'school',
    instituteLabel: 'School',
    
    // Academic terms
    classLabel: 'Class',
    classesLabel: 'Classes',
    batchLabel: 'Section',
    batchesLabel: 'Sections',
    subjectLabel: 'Subject',
    subjectsLabel: 'Subjects',
    subjectTeacher: 'Subject Teacher',
    classTeacher: 'Class Teacher',
    
    // Student related
    studentLabel: 'Student',
    studentsLabel: 'Students',
    rollLabel: 'Roll No.',
    enrollmentLabel: 'Enrollment No.',
    admissionLabel: 'Admission',
    admissionsLabel: 'Admissions',
    
    // Teacher related
    teacherLabel: 'Teacher',
    teachersLabel: 'Teachers',
    instructorLabel: 'Teacher',
    
    // Parent related
    parentLabel: 'Parent',
    parentsLabel: 'Parents',
    guardianLabel: 'Guardian',
    childrenLabel: 'Children',
    
    // Academic structure
    academicYear: 'Academic Year',
    termLabel: 'Term',
    semesterLabel: 'Term',
    sessionLabel: 'Session',
    
    // Exams & Assessment
    examLabel: 'Exam',
    examsLabel: 'Exams',
    testLabel: 'Test',
    assessmentLabel: 'Assessment',
    gradeLabel: 'Grade',
    marksLabel: 'Marks',
    resultLabel: 'Result',
    resultsLabel: 'Exam Results',
    reportCard: 'Report Card',
    
    // Timetable
    timetableLabel: 'Timetable',
    scheduleLabel: 'Schedule',
    periodLabel: 'Period',
    
    // Syllabus
    syllabusLabel: 'Syllabus',
    curriculumLabel: 'Curriculum',
    lessonPlan: 'Lesson Plan',
    
    // Homework & Assignments
    homeworkLabel: 'Homework',
    assignmentLabel: 'Assignment',
    assignmentsLabel: 'Assignments',
    submissionLabel: 'Submission',
    dueDateLabel: 'Due Date',
    
    // Study Material
    notesLabel: 'Notes',
    studyMaterial: 'Study Material',
    resourcesLabel: 'Resources',
    
    // Attendance
    attendanceLabel: 'Attendance',
    presentLabel: 'Present',
    absentLabel: 'Absent',
    lateLabel: 'Late',
    leaveLabel: 'Leave',
    
    // Fees & Finance
    feeLabel: 'Fee',
    feesLabel: 'Fees',
    feeStructure: 'Fee Structure',
    feeVoucher: 'Fee Voucher',
    feeReceipt: 'Fee Receipt',
    dueDate: 'Due Date',
    fineLabel: 'Late Fine',
    discountLabel: 'Scholarship/Discount',
    
    // Communication
    announcementLabel: 'Announcement',
    noticeLabel: 'Notice',
    circularLabel: 'Circular',
    messageLabel: 'Message',
    notificationLabel: 'Notification',
    
    // Library
    libraryLabel: 'Library',
    bookLabel: 'Book',
    issueLabel: 'Issue',
    returnLabel: 'Return',
    fineLabel_library: 'Fine',
    
    // Transport
    transportLabel: 'Transport',
    routeLabel: 'Route',
    vehicleLabel: 'Vehicle',
    stopLabel: 'Stop',
    
    // Hostel
    hostelLabel: 'Hostel',
    roomLabel: 'Room',
    messLabel: 'Mess',
    
    // Events
    eventLabel: 'Event',
    holidayLabel: 'Holiday',
    celebrationLabel: 'Celebration',
    
    // Reports
    reportLabel: 'Report',
    analyticsLabel: 'Analytics',
    progressReport: 'Progress Report',
    
    // Navigation - Parent
    nav: {
      overview: 'Overview',
      myChildren: 'My Children',
      attendance: 'Attendance',
      results: 'Exam Results',
      fees: 'Fees',
      timetable: 'Timetable',
      homework: 'Homework',
      assignments: 'Assignments',
      studyMaterial: 'Study Material',
      announcements: 'Announcements',
      communication: 'Communication',
      meetings: 'Parent-Teacher Meetings',
      library: 'Library',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      feedback: 'Feedback',
    },
    
    // Navigation - Student
    nav: {
      overview: 'Overview',
      myAttendance: 'My Attendance',
      myResults: 'My Results',
      myFees: 'My Fees',
      myTimetable: 'My Timetable',
      myClasses: 'My Classes',
      homework: 'Homework',
      assignments: 'Assignments',
      studyMaterial: 'Study Material',
      syllabus: 'Syllabus',
      exams: 'Exams',
      announcements: 'Announcements',
      library: 'Library',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      achievements: 'Achievements',
      clubs: 'Clubs & Societies',
      sports: 'Sports',
    },
    
    // Navigation - Teacher
    nav: {
      overview: 'Dashboard',
      myClasses: 'My Classes',
      myStudents: 'My Students',
      myTimetable: 'My Timetable',
      attendance: 'Mark Attendance',
      selfAttendance: 'My Attendance',
      homework: 'Create Homework',
      assignments: 'Create Assignments',
      studyMaterial: 'Upload Material',
      notes: 'Manage Notes',
      syllabus: 'Manage Syllabus',
      exams: 'Manage Exams',
      examResults: 'Enter Results',
      announcements: 'Post Announcements',
      communication: 'Communicate',
      meetings: 'Schedule Meetings',
      reports: 'Reports',
      library: 'Library Access',
      transport: 'Transport Info',
      hostel: 'Hostel Info',
      calendar: 'Calendar',
      profile: 'Profile',
      leave: 'Leave Application',
      training: 'Training',
      achievements: 'Achievements',
      gradebook: 'Gradebook',
      lessonPlans: 'Lesson Plans',
    },
    
    // Common phrases
    common: {
      viewAll: 'View All',
      addNew: 'Add New',
      edit: 'Edit',
      delete: 'Delete',
      download: 'Download',
      upload: 'Upload',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      print: 'Print',
      share: 'Share',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      loading: 'Loading...',
      noData: 'No data found',
      error: 'Error occurred',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
    },
    
    // Status messages
    status: {
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
      upcoming: 'Upcoming',
      ongoing: 'Ongoing',
      cancelled: 'Cancelled',
    },
  },

  // ── COACHING CENTER ───────────────────────────────────────
  coaching: {
    instituteType: 'coaching',
    instituteLabel: 'Coaching Center',
    
    // Academic terms
    classLabel: 'Batch',
    classesLabel: 'Batches',
    batchLabel: 'Group',
    batchesLabel: 'Groups',
    subjectLabel: 'Course',
    subjectsLabel: 'Courses',
    subjectTeacher: 'Course Instructor',
    classTeacher: 'Batch Mentor',
    
    // Student related
    studentLabel: 'Student',
    studentsLabel: 'Students',
    rollLabel: 'Reg. No.',
    enrollmentLabel: 'Registration No.',
    admissionLabel: 'Enrollment',
    admissionsLabel: 'Enrollments',
    
    // Teacher related
    teacherLabel: 'Instructor',
    teachersLabel: 'Instructors',
    instructorLabel: 'Instructor',
    
    // Parent related
    parentLabel: 'Parent',
    parentsLabel: 'Parents',
    guardianLabel: 'Guardian',
    childrenLabel: 'Wards',
    
    // Academic structure
    academicYear: 'Session',
    termLabel: 'Term',
    semesterLabel: 'Term',
    sessionLabel: 'Batch Session',
    
    // Exams & Assessment
    examLabel: 'Test',
    examsLabel: 'Tests',
    testLabel: 'Practice Test',
    assessmentLabel: 'Assessment',
    gradeLabel: 'Score',
    marksLabel: 'Marks',
    resultLabel: 'Result',
    resultsLabel: 'Test Results',
    reportCard: 'Progress Card',
    
    // Timetable
    timetableLabel: 'Schedule',
    scheduleLabel: 'Class Schedule',
    periodLabel: 'Session',
    
    // Syllabus
    syllabusLabel: 'Course Outline',
    curriculumLabel: 'Curriculum',
    lessonPlan: 'Lecture Plan',
    
    // Homework & Assignments
    homeworkLabel: 'Daily Practice',
    assignmentLabel: 'Practice Set',
    assignmentsLabel: 'Practice Sets',
    submissionLabel: 'Submission',
    dueDateLabel: 'Due Date',
    
    // Study Material
    notesLabel: 'Study Material',
    studyMaterial: 'Course Material',
    resourcesLabel: 'Resources',
    
    // Attendance
    attendanceLabel: 'Attendance',
    presentLabel: 'Present',
    absentLabel: 'Absent',
    lateLabel: 'Late',
    leaveLabel: 'Leave',
    
    // Fees & Finance
    feeLabel: 'Fee',
    feesLabel: 'Fees',
    feeStructure: 'Fee Structure',
    feeVoucher: 'Fee Voucher',
    feeReceipt: 'Fee Receipt',
    dueDate: 'Due Date',
    fineLabel: 'Late Fine',
    discountLabel: 'Scholarship',
    
    // Communication
    announcementLabel: 'Announcement',
    noticeLabel: 'Notice',
    circularLabel: 'Circular',
    messageLabel: 'Message',
    notificationLabel: 'Notification',
    
    // Library
    libraryLabel: 'Resource Center',
    bookLabel: 'Book',
    issueLabel: 'Issue',
    returnLabel: 'Return',
    fineLabel_library: 'Fine',
    
    // Transport
    transportLabel: 'Transport',
    routeLabel: 'Route',
    vehicleLabel: 'Vehicle',
    stopLabel: 'Stop',
    
    // Hostel
    hostelLabel: 'Hostel',
    roomLabel: 'Room',
    messLabel: 'Mess',
    
    // Events
    eventLabel: 'Event',
    holidayLabel: 'Holiday',
    celebrationLabel: 'Celebration',
    
    // Reports
    reportLabel: 'Report',
    analyticsLabel: 'Analytics',
    progressReport: 'Progress Report',
    
    // Navigation - Parent
    nav: {
      overview: 'Overview',
      myChildren: 'My Children',
      attendance: 'Attendance',
      results: 'Test Results',
      fees: 'Fees',
      timetable: 'Schedule',
      homework: 'Daily Practice',
      assignments: 'Practice Sets',
      studyMaterial: 'Study Material',
      announcements: 'Announcements',
      communication: 'Communication',
      meetings: 'Parent Meetings',
      library: 'Resource Center',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      feedback: 'Feedback',
    },
    
    // Navigation - Student
    nav: {
      overview: 'Overview',
      myAttendance: 'My Attendance',
      myResults: 'My Results',
      myFees: 'My Fees',
      myTimetable: 'My Schedule',
      myClasses: 'My Batches',
      homework: 'Daily Practice',
      assignments: 'Practice Sets',
      studyMaterial: 'Study Material',
      syllabus: 'Course Outline',
      exams: 'Tests',
      announcements: 'Announcements',
      library: 'Resource Center',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      achievements: 'Achievements',
      clubs: 'Activities',
      sports: 'Sports',
    },
    
    // Navigation - Teacher
    nav: {
      overview: 'Dashboard',
      myClasses: 'My Batches',
      myStudents: 'My Students',
      myTimetable: 'My Schedule',
      attendance: 'Mark Attendance',
      selfAttendance: 'My Attendance',
      homework: 'Create Practice',
      assignments: 'Create Sets',
      studyMaterial: 'Upload Material',
      syllabus: 'Manage Course',
      exams: 'Manage Tests',
      examResults: 'Enter Results',
      announcements: 'Post Announcements',
      communication: 'Communicate',
      meetings: 'Schedule Meetings',
      reports: 'Reports',
      library: 'Resource Center',
      transport: 'Transport Info',
      hostel: 'Hostel Info',
      calendar: 'Calendar',
      profile: 'Profile',
      leave: 'Leave Application',
      training: 'Training',
      achievements: 'Achievements',
      gradebook: 'Gradebook',
      lessonPlans: 'Lecture Plans',
    },
    
    // Common phrases (same as school)
    common: {
      viewAll: 'View All',
      addNew: 'Add New',
      edit: 'Edit',
      delete: 'Delete',
      download: 'Download',
      upload: 'Upload',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      print: 'Print',
      share: 'Share',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      loading: 'Loading...',
      noData: 'No data found',
      error: 'Error occurred',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
    },
    
    // Status messages (same as school)
    status: {
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
      upcoming: 'Upcoming',
      ongoing: 'Ongoing',
      cancelled: 'Cancelled',
    },
  },

  // ── ACADEMY ──────────────────────────────────────────────
  academy: {
    instituteType: 'academy',
    instituteLabel: 'Academy',
    
    // Academic terms
    classLabel: 'Batch',
    classesLabel: 'Batches',
    batchLabel: 'Group',
    batchesLabel: 'Groups',
    subjectLabel: 'Course',
    subjectsLabel: 'Courses',
    subjectTeacher: 'Course Instructor',
    classTeacher: 'Batch Coordinator',
    
    // Student related
    studentLabel: 'Trainee',
    studentsLabel: 'Trainees',
    rollLabel: 'Trainee ID',
    enrollmentLabel: 'Registration No.',
    admissionLabel: 'Enrollment',
    admissionsLabel: 'Enrollments',
    
    // Teacher related
    teacherLabel: 'Trainer',
    teachersLabel: 'Trainers',
    instructorLabel: 'Trainer',
    
    // Parent related
    parentLabel: 'Parent',
    parentsLabel: 'Parents',
    guardianLabel: 'Guardian',
    childrenLabel: 'Wards',
    
    // Academic structure
    academicYear: 'Training Year',
    termLabel: 'Module',
    semesterLabel: 'Module',
    sessionLabel: 'Training Session',
    
    // Exams & Assessment
    examLabel: 'Assessment',
    examsLabel: 'Assessments',
    testLabel: 'Quiz',
    assessmentLabel: 'Evaluation',
    gradeLabel: 'Score',
    marksLabel: 'Marks',
    resultLabel: 'Result',
    resultsLabel: 'Assessment Results',
    reportCard: 'Performance Report',
    
    // Timetable
    timetableLabel: 'Schedule',
    scheduleLabel: 'Training Schedule',
    periodLabel: 'Session',
    
    // Syllabus
    syllabusLabel: 'Course Outline',
    curriculumLabel: 'Curriculum',
    lessonPlan: 'Module Plan',
    
    // Homework & Assignments
    homeworkLabel: 'Practice Tasks',
    assignmentLabel: 'Assignment',
    assignmentsLabel: 'Assignments',
    submissionLabel: 'Submission',
    dueDateLabel: 'Due Date',
    
    // Study Material
    notesLabel: 'Course Material',
    studyMaterial: 'Training Material',
    resourcesLabel: 'Resources',
    
    // Attendance
    attendanceLabel: 'Attendance',
    presentLabel: 'Present',
    absentLabel: 'Absent',
    lateLabel: 'Late',
    leaveLabel: 'Leave',
    
    // Fees & Finance
    feeLabel: 'Fee',
    feesLabel: 'Fees',
    feeStructure: 'Fee Structure',
    feeVoucher: 'Fee Voucher',
    feeReceipt: 'Fee Receipt',
    dueDate: 'Due Date',
    fineLabel: 'Late Fine',
    discountLabel: 'Scholarship',
    
    // Communication
    announcementLabel: 'Announcement',
    noticeLabel: 'Notice',
    circularLabel: 'Circular',
    messageLabel: 'Message',
    notificationLabel: 'Notification',
    
    // Library
    libraryLabel: 'Resource Center',
    bookLabel: 'Book',
    issueLabel: 'Issue',
    returnLabel: 'Return',
    fineLabel_library: 'Fine',
    
    // Transport
    transportLabel: 'Transport',
    routeLabel: 'Route',
    vehicleLabel: 'Vehicle',
    stopLabel: 'Stop',
    
    // Hostel
    hostelLabel: 'Hostel',
    roomLabel: 'Room',
    messLabel: 'Mess',
    
    // Events
    eventLabel: 'Event',
    holidayLabel: 'Holiday',
    celebrationLabel: 'Celebration',
    
    // Reports
    reportLabel: 'Report',
    analyticsLabel: 'Analytics',
    progressReport: 'Progress Report',
    
    // Navigation - Parent
    nav: {
      overview: 'Overview',
      myChildren: 'My Children',
      attendance: 'Attendance',
      results: 'Assessment Results',
      fees: 'Fees',
      timetable: 'Schedule',
      homework: 'Practice Tasks',
      assignments: 'Assignments',
      studyMaterial: 'Training Material',
      announcements: 'Announcements',
      communication: 'Communication',
      meetings: 'Parent Meetings',
      library: 'Resource Center',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      feedback: 'Feedback',
    },
    
    // Navigation - Student
    nav: {
      overview: 'Overview',
      myAttendance: 'My Attendance',
      myResults: 'My Results',
      myFees: 'My Fees',
      myTimetable: 'My Schedule',
      myClasses: 'My Batches',
      homework: 'Practice Tasks',
      assignments: 'Assignments',
      studyMaterial: 'Training Material',
      syllabus: 'Course Outline',
      exams: 'Assessments',
      announcements: 'Announcements',
      library: 'Resource Center',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      achievements: 'Achievements',
      clubs: 'Activities',
      sports: 'Sports',
    },
    
    // Navigation - Teacher
    nav: {
      overview: 'Dashboard',
      myClasses: 'My Batches',
      myStudents: 'My Trainees',
      myTimetable: 'My Schedule',
      attendance: 'Mark Attendance',
      selfAttendance: 'My Attendance',
      homework: 'Create Tasks',
      assignments: 'Create Assignments',
      studyMaterial: 'Upload Material',
      syllabus: 'Manage Course',
      exams: 'Manage Assessments',
      examResults: 'Enter Results',
      announcements: 'Post Announcements',
      communication: 'Communicate',
      meetings: 'Schedule Meetings',
      reports: 'Reports',
      library: 'Resource Center',
      transport: 'Transport Info',
      hostel: 'Hostel Info',
      calendar: 'Calendar',
      profile: 'Profile',
      leave: 'Leave Application',
      training: 'Training',
      achievements: 'Achievements',
      gradebook: 'Gradebook',
      lessonPlans: 'Module Plans',
    },
    
    // Common phrases
    common: { /* same as school */ },
    status: { /* same as school */ },
  },

  // ── COLLEGE ──────────────────────────────────────────────
  college: {
    instituteType: 'college',
    instituteLabel: 'College',
    
    // Academic terms
    classLabel: 'Class',
    classesLabel: 'Classes',
    batchLabel: 'Section',
    batchesLabel: 'Sections',
    subjectLabel: 'Subject',
    subjectsLabel: 'Subjects',
    subjectTeacher: 'Lecturer',
    classTeacher: 'Class Advisor',
    
    // Student related
    studentLabel: 'Student',
    studentsLabel: 'Students',
    rollLabel: 'Roll No.',
    enrollmentLabel: 'College ID',
    admissionLabel: 'Admission',
    admissionsLabel: 'Admissions',
    
    // Teacher related
    teacherLabel: 'Lecturer',
    teachersLabel: 'Lecturers',
    instructorLabel: 'Lecturer',
    
    // Parent related
    parentLabel: 'Parent',
    parentsLabel: 'Parents',
    guardianLabel: 'Guardian',
    childrenLabel: 'Children',
    
    // Academic structure
    academicYear: 'Academic Year',
    termLabel: 'Semester',
    semesterLabel: 'Semester',
    sessionLabel: 'Session',
    
    // Exams & Assessment
    examLabel: 'Exam',
    examsLabel: 'Exams',
    testLabel: 'Test',
    assessmentLabel: 'Assessment',
    gradeLabel: 'Grade',
    marksLabel: 'Marks',
    resultLabel: 'Result',
    resultsLabel: 'Exam Results',
    reportCard: 'Transcript',
    
    // Timetable
    timetableLabel: 'Timetable',
    scheduleLabel: 'Class Schedule',
    periodLabel: 'Period',
    
    // Syllabus
    syllabusLabel: 'Syllabus',
    curriculumLabel: 'Curriculum',
    lessonPlan: 'Lecture Plan',
    
    // Homework & Assignments
    homeworkLabel: 'Homework',
    assignmentLabel: 'Assignment',
    assignmentsLabel: 'Assignments',
    submissionLabel: 'Submission',
    dueDateLabel: 'Due Date',
    
    // Study Material
    notesLabel: 'Lecture Notes',
    studyMaterial: 'Study Material',
    resourcesLabel: 'Resources',
    
    // Attendance
    attendanceLabel: 'Attendance',
    presentLabel: 'Present',
    absentLabel: 'Absent',
    lateLabel: 'Late',
    leaveLabel: 'Leave',
    
    // Fees & Finance
    feeLabel: 'Fee',
    feesLabel: 'Fees',
    feeStructure: 'Fee Structure',
    feeVoucher: 'Fee Voucher',
    feeReceipt: 'Fee Receipt',
    dueDate: 'Due Date',
    fineLabel: 'Late Fine',
    discountLabel: 'Scholarship',
    
    // Communication
    announcementLabel: 'Announcement',
    noticeLabel: 'Notice',
    circularLabel: 'Circular',
    messageLabel: 'Message',
    notificationLabel: 'Notification',
    
    // Library
    libraryLabel: 'Library',
    bookLabel: 'Book',
    issueLabel: 'Issue',
    returnLabel: 'Return',
    fineLabel_library: 'Fine',
    
    // Transport
    transportLabel: 'Transport',
    routeLabel: 'Route',
    vehicleLabel: 'Vehicle',
    stopLabel: 'Stop',
    
    // Hostel
    hostelLabel: 'Hostel',
    roomLabel: 'Room',
    messLabel: 'Mess',
    
    // Events
    eventLabel: 'Event',
    holidayLabel: 'Holiday',
    celebrationLabel: 'Celebration',
    
    // Reports
    reportLabel: 'Report',
    analyticsLabel: 'Analytics',
    progressReport: 'Progress Report',
    
    // Navigation - Parent
    nav: { /* same as school but with college terms */ },
    nav: {
      overview: 'Overview',
      myChildren: 'My Children',
      attendance: 'Attendance',
      results: 'Exam Results',
      fees: 'Fees',
      timetable: 'Timetable',
      homework: 'Homework',
      assignments: 'Assignments',
      studyMaterial: 'Study Material',
      announcements: 'Announcements',
      communication: 'Communication',
      meetings: 'Parent Meetings',
      library: 'Library',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      feedback: 'Feedback',
    },
    
    // Navigation - Student
    nav: {
      overview: 'Overview',
      myAttendance: 'My Attendance',
      myResults: 'My Results',
      myFees: 'My Fees',
      myTimetable: 'My Timetable',
      myClasses: 'My Classes',
      homework: 'Homework',
      assignments: 'Assignments',
      studyMaterial: 'Study Material',
      syllabus: 'Syllabus',
      exams: 'Exams',
      announcements: 'Announcements',
      library: 'Library',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      achievements: 'Achievements',
      clubs: 'Clubs & Societies',
      sports: 'Sports',
    },
    
    // Navigation - Teacher
    nav: {
      overview: 'Dashboard',
      myClasses: 'My Classes',
      myStudents: 'My Students',
      myTimetable: 'My Timetable',
      attendance: 'Mark Attendance',
      selfAttendance: 'My Attendance',
      homework: 'Create Homework',
      assignments: 'Create Assignments',
      studyMaterial: 'Upload Notes',
      syllabus: 'Manage Syllabus',
      exams: 'Manage Exams',
      examResults: 'Enter Results',
      announcements: 'Post Announcements',
      communication: 'Communicate',
      meetings: 'Schedule Meetings',
      reports: 'Reports',
      library: 'Library',
      transport: 'Transport Info',
      hostel: 'Hostel Info',
      calendar: 'Calendar',
      profile: 'Profile',
      leave: 'Leave Application',
      training: 'Training',
      achievements: 'Achievements',
      gradebook: 'Gradebook',
      lessonPlans: 'Lesson Plans',
    },
    
    // Common phrases
    common: { /* same as school */ },
    status: { /* same as school */ },
  },

  // ── UNIVERSITY ───────────────────────────────────────────
  university: {
    instituteType: 'university',
    instituteLabel: 'University',
    
    // Academic terms
    classLabel: 'Program',
    classesLabel: 'Courses',
    batchLabel: 'Section',
    batchesLabel: 'Sections',
    subjectLabel: 'Course',
    subjectsLabel: 'Courses',
    subjectTeacher: 'Professor',
    classTeacher: 'Faculty Advisor',
    
    // Student related
    studentLabel: 'Student',
    studentsLabel: 'Students',
    rollLabel: 'Reg. No.',
    enrollmentLabel: 'Enrollment ID',
    admissionLabel: 'Admission',
    admissionsLabel: 'Admissions',
    
    // Teacher related
    teacherLabel: 'Professor',
    teachersLabel: 'Faculty',
    instructorLabel: 'Professor',
    
    // Parent related
    parentLabel: 'Parent',
    parentsLabel: 'Parents',
    guardianLabel: 'Guardian',
    childrenLabel: 'Children',
    
    // Academic structure
    academicYear: 'Academic Year',
    termLabel: 'Semester',
    semesterLabel: 'Semester',
    sessionLabel: 'Session',
    
    // Exams & Assessment
    examLabel: 'Exam',
    examsLabel: 'Exams',
    testLabel: 'Test',
    assessmentLabel: 'Assessment',
    gradeLabel: 'GPA',
    marksLabel: 'Marks',
    resultLabel: 'Result',
    resultsLabel: 'Academic Results',
    reportCard: 'Transcript',
    
    // Timetable
    timetableLabel: 'Schedule',
    scheduleLabel: 'Course Schedule',
    periodLabel: 'Lecture',
    
    // Syllabus
    syllabusLabel: 'Course Outline',
    curriculumLabel: 'Curriculum',
    lessonPlan: 'Lecture Plan',
    
    // Homework & Assignments
    homeworkLabel: 'Tasks',
    assignmentLabel: 'Assignment',
    assignmentsLabel: 'Assignments',
    submissionLabel: 'Submission',
    dueDateLabel: 'Due Date',
    
    // Study Material
    notesLabel: 'Lecture Notes',
    studyMaterial: 'Course Material',
    resourcesLabel: 'Resources',
    
    // Attendance
    attendanceLabel: 'Attendance',
    presentLabel: 'Present',
    absentLabel: 'Absent',
    lateLabel: 'Late',
    leaveLabel: 'Leave',
    
    // Fees & Finance
    feeLabel: 'Tuition Fee',
    feesLabel: 'Tuition Fees',
    feeStructure: 'Fee Structure',
    feeVoucher: 'Fee Voucher',
    feeReceipt: 'Fee Receipt',
    dueDate: 'Due Date',
    fineLabel: 'Late Fine',
    discountLabel: 'Scholarship',
    
    // Communication
    announcementLabel: 'Announcement',
    noticeLabel: 'Notice',
    circularLabel: 'Circular',
    messageLabel: 'Message',
    notificationLabel: 'Notification',
    
    // Library
    libraryLabel: 'Library',
    bookLabel: 'Book',
    issueLabel: 'Issue',
    returnLabel: 'Return',
    fineLabel_library: 'Fine',
    
    // Transport
    transportLabel: 'Transport',
    routeLabel: 'Route',
    vehicleLabel: 'Vehicle',
    stopLabel: 'Stop',
    
    // Hostel
    hostelLabel: 'Hostel',
    roomLabel: 'Room',
    messLabel: 'Mess',
    
    // Events
    eventLabel: 'Event',
    holidayLabel: 'Holiday',
    celebrationLabel: 'Celebration',
    
    // Reports
    reportLabel: 'Report',
    analyticsLabel: 'Analytics',
    progressReport: 'Progress Report',
    
    // Research
    researchLabel: 'Research',
    thesisLabel: 'Thesis',
    publicationLabel: 'Publication',
    
    // Navigation - Parent
    nav: {
      overview: 'Overview',
      myChildren: 'My Children',
      attendance: 'Attendance',
      results: 'Academic Results',
      fees: 'Tuition Fees',
      timetable: 'Schedule',
      homework: 'Tasks',
      assignments: 'Assignments',
      studyMaterial: 'Course Material',
      announcements: 'Announcements',
      communication: 'Communication',
      meetings: 'Faculty Meetings',
      library: 'Library',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      feedback: 'Feedback',
    },
    
    // Navigation - Student
    nav: {
      overview: 'Dashboard',
      myAttendance: 'My Attendance',
      myResults: 'My Results',
      myFees: 'My Fees',
      myTimetable: 'My Schedule',
      myClasses: 'My Courses',
      homework: 'Tasks',
      assignments: 'Assignments',
      studyMaterial: 'Course Material',
      syllabus: 'Course Outline',
      exams: 'Exams',
      announcements: 'Announcements',
      library: 'Library',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      achievements: 'Achievements',
      clubs: 'Societies',
      sports: 'Sports',
      research: 'Research',
      thesis: 'Thesis',
    },
    
    // Navigation - Teacher
    nav: {
      overview: 'Dashboard',
      myClasses: 'My Courses',
      myStudents: 'My Students',
      myTimetable: 'My Schedule',
      attendance: 'Mark Attendance',
      selfAttendance: 'My Attendance',
      homework: 'Create Tasks',
      assignments: 'Create Assignments',
      studyMaterial: 'Upload Material',
      syllabus: 'Manage Course',
      exams: 'Manage Exams',
      examResults: 'Enter Results',
      announcements: 'Post Announcements',
      communication: 'Communicate',
      meetings: 'Schedule Meetings',
      reports: 'Reports',
      research: 'Research',
      publications: 'Publications',
      library: 'Library',
      transport: 'Transport Info',
      hostel: 'Hostel Info',
      calendar: 'Calendar',
      profile: 'Profile',
      leave: 'Leave Application',
      training: 'Training',
      achievements: 'Achievements',
      gradebook: 'Gradebook',
      lessonPlans: 'Lecture Plans',
    },
    
    // Common phrases
    common: { /* same as school */ },
    status: { /* same as school */ },
  },
};

// Default config fallback
CONFIG.default = CONFIG.school;

/**
 * Returns the terminology config for a given institute type and user type.
 * Falls back to 'school' if no match found.
 * 
 * @param {string} instituteType - 'school' | 'coaching' | 'academy' | 'college' | 'university'
 * @param {string} userType - 'STUDENT' | 'PARENT' | 'TEACHER' (optional, for role-specific terms)
 */
export function getPortalTerms(instituteType, userType = null) {
  const baseConfig = CONFIG[instituteType] || CONFIG.school;
  
  // If userType is provided, we could return role-specific overrides here
  // For now, return the base config
  
  return baseConfig;
}

/**
 * Get institute-specific label for a generic term
 * @param {string} instituteType 
 * @param {string} term - e.g., 'class', 'teacher', 'exam'
 */
export function getTerm(instituteType, term) {
  const config = CONFIG[instituteType] || CONFIG.school;
  return config[term] || config[`${term}Label`] || term;
}

/**
 * Get navigation items for specific user type and institute
 */
export function getNavItems(instituteType, userType) {
  const config = CONFIG[instituteType] || CONFIG.school;
  return config.nav || {};
}

export default CONFIG;