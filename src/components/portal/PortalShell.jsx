//src/components/portal/PortalShell.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import {
  GraduationCap, LayoutDashboard, Calendar, DollarSign,
  BookOpen, Bell, Clock, LogOut, Menu, Users,
  Briefcase, FileText, ClipboardList, NotebookPen, UserCheck, BookMarked,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import usePortalStore from '@/store/portalStore';
import useAuthStore from '@/store/authStore'; // To clear auth
import { getPortalTerms } from '@/constants/portalInstituteConfig';

// ─── Nav helpers with permission checks ────────────────────────────────────
function buildParentNav(t) {
  return [
    { label: t.nav.overview,      href: '/parent',               icon: LayoutDashboard, permission: 'dashboard.view' },
    { label: t.attendanceLabel,   href: '/parent/attendance',    icon: Calendar,        permission: 'attendance.view' },
    { label: t.feesLabel,         href: '/parent/fees',          icon: DollarSign,      permission: 'fees.view' },
    { label: t.resultsLabel,      href: '/parent/results',       icon: BookOpen,        permission: 'results.view' },
    { label: t.nav.announcements, href: '/parent/announcements', icon: Bell,            permission: 'announcements.view' },
  ];
}

function buildStudentNav(t) {
  return [
    { label: t.nav.overview,      href: '/student',               icon: LayoutDashboard, permission: 'dashboard.view.self' },
    { label: t.nav.myAttend,      href: '/student/attendance',    icon: Calendar,        permission: 'attendance.view.self' },
    { label: t.nav.exams,         href: '/student/exams',         icon: BookOpen,        permission: 'results.view.self' },
    { label: t.nav.timetable,     href: '/student/timetable',     icon: Clock,           permission: 'timetable.view.self' },
    { label: t.nav.syllabus,      href: '/student/syllabus',      icon: BookMarked,      permission: 'syllabus.view' },
    { label: t.nav.assignments,   href: '/student/assignments',   icon: ClipboardList,   permission: 'assignments.view' },
    { label: t.nav.homework,      href: '/student/homework',      icon: NotebookPen,     permission: 'homework.view' },
    { label: t.nav.announcements, href: '/student/announcements', icon: Bell,            permission: 'announcements.view' },
  ];
}

function buildTeacherNav(t) {
  return [
    { label: t.nav.overview,      href: '/teacher',               icon: LayoutDashboard, permission: 'dashboard.view' },
    { label: t.nav.classes,       href: '/teacher/classes',       icon: Briefcase,       permission: 'classes.read' },
    { label: t.nav.students,      href: '/teacher/students',      icon: Users,           permission: 'students.read' },
    { label: t.nav.timetable,     href: '/teacher/timetable',     icon: Clock,           permission: 'timetable.view' },
    { label: t.notesLabel,        href: '/teacher/notes',         icon: FileText,        permission: 'notes.create' },
    { label: t.nav.assignments,   href: '/teacher/assignments',   icon: ClipboardList,   permission: 'assignments.create' },
    { label: t.nav.homework,      href: '/teacher/homework',      icon: NotebookPen,     permission: 'homework.create' },
    { label: t.nav.attendance,    href: '/teacher/attendance',    icon: UserCheck,       permission: 'attendance.mark' },
    { label: t.nav.announcements, href: '/teacher/announcements', icon: Bell,            permission: 'announcements.create' },
  ];
}
// ─────────────────────────────────────────────────────────────────────────────

export default function PortalShell({ children, type }) {
  const pathname = usePathname();
  const router = useRouter();
  const { portalUser, clearPortal, getInstituteType, canDo } = usePortalStore();
  const logout = useAuthStore((s) => s.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const user = portalUser;

  useEffect(() => {
    // Check if persist hydration already completed (synchronous case)
    if (usePortalStore.persist?.hasHydrated?.()) {
      setHydrated(true);
      return;
    }
    // Otherwise wait for the onRehydrateStorage callback
    const unsub = usePortalStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return () => unsub?.();
  }, []);

  // Redirect if not logged in (only after hydration)
  useEffect(() => {
    if (hydrated && !portalUser) {
      router.replace('/portal-login');
    }
  }, [portalUser, hydrated, router]);

  if (!hydrated || !portalUser) {
    return null;
  }

  const instituteType = getInstituteType();
  const t = getPortalTerms(instituteType);

  const isParent  = type === 'PARENT';
  const isTeacher = type === 'TEACHER';

  // Build and filter nav items by permissions
  const allNavItems = isParent ? buildParentNav(t) : isTeacher ? buildTeacherNav(t) : buildStudentNav(t);
  const navItems = allNavItems.filter(item => canDo(item.permission));

  const themeClasses = isParent
    ? { accent: 'indigo', activeBg: 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600', sidebarHeader: 'bg-gradient-to-b from-indigo-700 to-indigo-800', badge: 'bg-indigo-100 text-indigo-700' }
    : isTeacher
    ? { accent: 'blue',   activeBg: 'bg-blue-50 text-blue-700 border-l-2 border-blue-600',       sidebarHeader: 'bg-gradient-to-b from-blue-700 to-sky-800',    badge: 'bg-blue-100 text-blue-700' }
    : { accent: 'emerald', activeBg: 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-600', sidebarHeader: 'bg-gradient-to-b from-emerald-700 to-emerald-800', badge: 'bg-emerald-100 text-emerald-700' };

  const displayName = isTeacher
    ? `${portalUser.first_name || ''} ${portalUser.last_name || ''}`.trim() || t.teacherLabel
    : isParent
    ? portalUser?.name || 'Parent'
    : `${portalUser.first_name || ''} ${portalUser.last_name || ''}`.trim() || t.studentLabel;

  const displaySub = isTeacher
    ? (portalUser?.details?.designation || portalUser?.staff_type || t.teacherLabel)
    : isParent
    ? (portalUser?.details?.relation ? `${portalUser.details.relation} · ${portalUser?.children?.length || 0} child(ren)` : 'Parent Account')
    : (portalUser?.details?.class_name || portalUser?.class_name || t.studentLabel);

  const portalLabel = isTeacher
    ? `${t.teacherLabel} Portal`
    : isParent
    ? 'Parent Portal'
    : `${t.studentLabel} Portal`;

  const handleLogout = () => {
    clearPortal();
    logout(); // Clear auth store
    Cookies.remove('portal_token');
    Cookies.remove('portal_type');
    Cookies.remove('access_token');
    Cookies.remove('user_type');
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
            <p className="text-xs font-bold text-white leading-tight">{user.institute.name || 'The Clouds Academy'}</p>
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
        {navItems.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-4">No menu items available</p>
        ) : (
          navItems.map((item) => {
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
          })
        )}
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
                {portalLabel} · {user.institute.name || 'The Clouds Academy'}
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