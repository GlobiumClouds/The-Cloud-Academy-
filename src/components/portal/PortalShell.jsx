'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import {
  GraduationCap, LayoutDashboard, Calendar, DollarSign,
  BookOpen, Bell, Clock, LogOut, Menu, X, ChevronDown, Users,
  Briefcase, FileText, ClipboardList, NotebookPen, UserCheck, BookMarked,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import usePortalStore from '@/store/portalStore';
import { getPortalTerms } from '@/constants/portalInstituteConfig';

// ─── Nav helpers ─────────────────────────────────────────────────────────────
function buildParentNav(t) {
  return [
    { label: t.nav.overview,      href: '/parent',               icon: LayoutDashboard },
    { label: t.attendanceLabel,   href: '/parent/attendance',    icon: Calendar },
    { label: t.feesLabel,         href: '/parent/fees',          icon: DollarSign },
    { label: t.resultsLabel,      href: '/parent/results',       icon: BookOpen },
    { label: t.nav.announcements, href: '/parent/announcements', icon: Bell },
  ];
}

function buildStudentNav(t) {
  return [
    { label: t.nav.overview,      href: '/student',               icon: LayoutDashboard },
    { label: t.nav.myAttend,      href: '/student/attendance',    icon: Calendar },
    { label: t.nav.exams,         href: '/student/exams',         icon: BookOpen },
    { label: t.nav.timetable,     href: '/student/timetable',     icon: Clock },
    { label: t.nav.syllabus,      href: '/student/syllabus',      icon: BookMarked },
    { label: t.nav.assignments,   href: '/student/assignments',   icon: ClipboardList },
    { label: t.nav.homework,      href: '/student/homework',      icon: NotebookPen },
    { label: t.nav.announcements, href: '/student/announcements', icon: Bell },
  ];
}

function buildTeacherNav(t) {
  return [
    { label: t.nav.overview,      href: '/teacher',               icon: LayoutDashboard },
    { label: t.nav.classes,       href: '/teacher/classes',       icon: Briefcase },
    { label: t.nav.students,      href: '/teacher/students',      icon: Users },
    { label: t.notesLabel,        href: '/teacher/notes',         icon: FileText },
    { label: t.nav.assignments,   href: '/teacher/assignments',   icon: ClipboardList },
    { label: t.nav.homework,      href: '/teacher/homework',      icon: NotebookPen },
    { label: t.nav.attendance,    href: '/teacher/attendance',    icon: UserCheck },
    { label: t.nav.announcements, href: '/teacher/announcements', icon: Bell },
  ];
}
// ─────────────────────────────────────────────────────────────────────────────

export default function PortalShell({ children, type }) {
  const pathname = usePathname();
  const router = useRouter();
  const { portalUser, clearPortal, getInstituteType } = usePortalStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const instituteType = getInstituteType ? getInstituteType() : (portalUser?.institute_type || 'school');
  const t = getPortalTerms(instituteType);

  const isParent  = type === 'PARENT';
  const isTeacher = type === 'TEACHER';

  const navItems = isParent ? buildParentNav(t) : isTeacher ? buildTeacherNav(t) : buildStudentNav(t);

  const themeClasses = isParent
    ? { accent: 'indigo', activeBg: 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600', sidebarHeader: 'bg-gradient-to-b from-indigo-700 to-indigo-800', badge: 'bg-indigo-100 text-indigo-700' }
    : isTeacher
    ? { accent: 'blue',   activeBg: 'bg-blue-50 text-blue-700 border-l-2 border-blue-600',       sidebarHeader: 'bg-gradient-to-b from-blue-700 to-sky-800',    badge: 'bg-blue-100 text-blue-700' }
    : { accent: 'emerald', activeBg: 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-600', sidebarHeader: 'bg-gradient-to-b from-emerald-700 to-emerald-800', badge: 'bg-emerald-100 text-emerald-700' };

  const displayName = isTeacher
    ? (portalUser ? `${portalUser.first_name} ${portalUser.last_name}` : t.teacherLabel)
    : isParent
    ? (portalUser?.name || 'Parent')
    : (portalUser ? `${portalUser.first_name} ${portalUser.last_name}` : t.studentLabel);

  const displaySub = isTeacher
    ? (portalUser?.designation || t.teacherLabel)
    : isParent
    ? (portalUser?.relation ? `${portalUser.relation} · ${portalUser?.children?.length || 0} child(ren)` : 'Parent Account')
    : (portalUser?.class_name || t.studentLabel);

  const portalLabel = isTeacher
    ? `${t.teacherLabel} Portal`
    : isParent
    ? 'Parent Portal'
    : `${t.studentLabel} Portal`;

  const handleLogout = () => {
    clearPortal();
    Cookies.remove('portal_token');
    Cookies.remove('portal_type');
    toast.success('Logged out successfully');
    router.replace('/portal-login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className={`${themeClasses.sidebarHeader} px-5 py-5`}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">The Clouds Academy</p>
            <p className="text-[10px] text-white/60">{portalLabel}</p>
          </div>
        </div>
        {/* User info */}
        <div className="bg-white/10 rounded-xl px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full ${isTeacher ? 'bg-blue-400' : isParent ? 'bg-indigo-400' : 'bg-emerald-400'} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {displayName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-white/60 truncate">{displaySub}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? themeClasses.activeBg
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? '' : 'opacity-70'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 bg-white border-r border-slate-200 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 w-60 bg-white flex flex-col h-full shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-slate-900">
                {navItems.find((n) => n.href === pathname)?.label || t.overviewLabel}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                {portalLabel} · The Clouds Academy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${themeClasses.badge}`}>
              {isTeacher ? `👨‍🏫 ${t.teacherLabel}` : isParent ? '👨‍👩‍👧 Parent' : `🎓 ${t.studentLabel}`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600 hover:bg-red-50 gap-1.5 text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
//   { label: 'Overview',       href: '/parent',               icon: LayoutDashboard },
//   { label: 'Attendance',     href: '/parent/attendance',    icon: Calendar },
//   { label: 'Fee Record',     href: '/parent/fees',          icon: DollarSign },
//   { label: 'Exam Results',   href: '/parent/results',       icon: BookOpen },
//   { label: 'Announcements',  href: '/parent/announcements', icon: Bell },
// ];

// const STUDENT_NAV = [
//   { label: 'Overview',       href: '/student',               icon: LayoutDashboard },
//   { label: 'My Attendance',  href: '/student/attendance',    icon: Calendar },
//   // { label: 'My Fees',        href: '/student/fees',          icon: DollarSign },
//   { label: 'My Exams',       href: '/student/exams',         icon: BookOpen },
//   { label: 'Timetable',      href: '/student/timetable',     icon: Clock },
//   { label: 'Syllabus',       href: '/student/syllabus',      icon: BookMarked },
//   { label: 'Assignments',    href: '/student/assignments',   icon: ClipboardList },
//   { label: 'Homework Diary', href: '/student/homework',      icon: NotebookPen },
//   { label: 'Announcements',  href: '/student/announcements', icon: Bell },
// ];

// const TEACHER_NAV = [
//   { label: 'Overview',         href: '/teacher',               icon: LayoutDashboard },
//   { label: 'My Classes',       href: '/teacher/classes',       icon: Briefcase },
//   { label: 'My Students',      href: '/teacher/students',      icon: Users },
//   { label: 'Notes',            href: '/teacher/notes',         icon: FileText },
//   { label: 'Assignments',      href: '/teacher/assignments',   icon: ClipboardList },
//   { label: 'Homework & Diary', href: '/teacher/homework',      icon: NotebookPen },
//   { label: 'Mark Attendance',  href: '/teacher/attendance',    icon: UserCheck },
//   { label: 'Announcements',    href: '/teacher/announcements', icon: Bell },
// ];

// export default function PortalShell({ children, type }) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { portalUser, clearPortal } = usePortalStore();
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const navItems = type === 'PARENT' ? PARENT_NAV : type === 'TEACHER' ? TEACHER_NAV : STUDENT_NAV;
//   const isParent  = type === 'PARENT';
//   const isTeacher = type === 'TEACHER';

//   const themeClasses = isParent
//     ? { accent: 'indigo', activeBg: 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600', sidebarHeader: 'bg-gradient-to-b from-indigo-700 to-indigo-800', badge: 'bg-indigo-100 text-indigo-700' }
//     : isTeacher
//     ? { accent: 'blue',   activeBg: 'bg-blue-50 text-blue-700 border-l-2 border-blue-600',       sidebarHeader: 'bg-gradient-to-b from-blue-700 to-sky-800',    badge: 'bg-blue-100 text-blue-700' }
//     : { accent: 'emerald', activeBg: 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-600', sidebarHeader: 'bg-gradient-to-b from-emerald-700 to-emerald-800', badge: 'bg-emerald-100 text-emerald-700' };

//   const displayName = isTeacher
//     ? (portalUser ? `${portalUser.first_name} ${portalUser.last_name}` : 'Teacher')
//     : isParent
//     ? (portalUser?.name || 'Parent')
//     : (portalUser ? `${portalUser.first_name} ${portalUser.last_name}` : 'Student');

//   const displaySub = isTeacher
//     ? (portalUser?.designation || 'Teacher')
//     : isParent
//     ? (portalUser?.relation ? `${portalUser.relation} · ${portalUser?.children?.length || 0} child(ren)` : 'Parent Account')
//     : (portalUser?.class_name || 'Student');

//   const handleLogout = () => {
//     clearPortal();
//     Cookies.remove('portal_token');
//     Cookies.remove('portal_type');
//     toast.success('Logged out successfully');
//     router.replace('/portal-login');
//   };

//   const SidebarContent = () => (
//     <div className="flex flex-col h-full">
//       {/* Sidebar header */}
//       <div className={`${themeClasses.sidebarHeader} px-5 py-5`}>
//         <div className="flex items-center gap-2.5 mb-4">
//           <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
//             <GraduationCap className="w-4 h-4 text-white" />
//           </div>
//           <div>
//             <p className="text-xs font-bold text-white leading-tight">The Clouds Academy</p>
//             <p className="text-[10px] text-white/60">
//               {isTeacher ? 'Teacher Portal' : isParent ? 'Parent Portal' : 'Student Portal'}
//             </p>
//           </div>
//         </div>
//         {/* User info */}
//         <div className="bg-white/10 rounded-xl px-3 py-3">
//           <div className="flex items-center gap-2.5">
//             <div className={`w-8 h-8 rounded-full ${isTeacher ? 'bg-blue-400' : isParent ? 'bg-indigo-400' : 'bg-emerald-400'} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
//               {displayName[0]}
//             </div>
//             <div className="min-w-0">
//               <p className="text-xs font-semibold text-white truncate">{displayName}</p>
//               <p className="text-[10px] text-white/60 truncate">{displaySub}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
//         {navItems.map((item) => {
//           const Icon = item.icon;
//           const isActive = pathname === item.href;
//           return (
//             <Link
//               key={item.href}
//               href={item.href}
//               onClick={() => setSidebarOpen(false)}
//               className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
//                 isActive
//                   ? themeClasses.activeBg
//                   : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
//               }`}
//             >
//               <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? '' : 'opacity-70'}`} />
//               {item.label}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* Footer */}
//       <div className="px-3 py-4 border-t border-slate-100">
//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
//         >
//           <LogOut className="w-4 h-4" />
//           Sign Out
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex h-screen overflow-hidden bg-slate-50">
//       {/* Desktop Sidebar */}
//       <aside className="hidden md:flex md:flex-col w-60 bg-white border-r border-slate-200 flex-shrink-0">
//         <SidebarContent />
//       </aside>

//       {/* Mobile Sidebar overlay */}
//       {sidebarOpen && (
//         <div className="md:hidden fixed inset-0 z-50 flex">
//           <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
//           <aside className="relative z-10 w-60 bg-white flex flex-col h-full shadow-xl">
//             <SidebarContent />
//           </aside>
//         </div>
//       )}

//       {/* Main content */}
//       <div className="flex flex-col flex-1 overflow-hidden">
//         {/* Top navbar */}
//         <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between flex-shrink-0">
//           <div className="flex items-center gap-3">
//             <button
//               className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
//               onClick={() => setSidebarOpen(true)}
//             >
//               <Menu className="w-5 h-5" />
//             </button>
//             <div>
//               <h1 className="text-sm font-bold text-slate-900">
//                 {navItems.find((n) => n.href === pathname)?.label || 'Portal'}
//               </h1>
//               <p className="text-xs text-slate-400 hidden sm:block">
//                 {isTeacher ? 'Teacher Portal' : isParent ? 'Parent Portal' : 'Student Portal'} · The Clouds Academy
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <span className={`hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${themeClasses.badge}`}>
//               {isTeacher ? '👨‍🏫 Teacher' : isParent ? '👨‍👩‍👧 Parent' : '🎓 Student'}
//             </span>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={handleLogout}
//               className="text-slate-500 hover:text-red-600 hover:bg-red-50 gap-1.5 text-xs"
//             >
//               <LogOut className="w-3.5 h-3.5" />
//               <span className="hidden sm:inline">Logout</span>
//             </Button>
//           </div>
//         </header>

//         {/* Page content */}
//         <main className="flex-1 overflow-auto p-4 sm:p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }
