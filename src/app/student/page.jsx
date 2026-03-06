'use client';

import Link from 'next/link';
import {
  Calendar, DollarSign, BookOpen, Clock, Bell,
  TrendingUp, Award, CheckCircle, AlertCircle, GraduationCap,
  ClipboardList, NotebookPen, BookMarked,
} from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { DUMMY_STUDENT_PORTAL_USERS } from '@/data/portalDummyData';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { Badge } from '@/components/ui/badge';

export default function StudentOverview() {
  const { portalUser } = usePortalStore();
  const student = portalUser || DUMMY_STUDENT_PORTAL_USERS[0];
  const t = getPortalTerms(student?.institute_type);

  const attendance = student.attendance;
  const fees = student.fees || [];
  const results = student.results || [];
  const pendingFees = fees.filter((f) => f.status !== 'paid');
  const latestResult = results[0];

  const QUICK_LINKS = [
    { label: t.nav.myAttend,    href: '/student/attendance',   icon: Calendar,      color: 'indigo', bg: 'bg-indigo-50', ic: 'text-indigo-600',  value: `${attendance?.percentage ?? '--'}%` },
    { label: t.feesLabel,       href: '/student/fees',         icon: DollarSign,    color: 'emerald',bg: 'bg-emerald-50',ic: 'text-emerald-600', value: pendingFees.length > 0 ? `${pendingFees.length} pending` : 'All clear' },
    { label: t.nav.exams,       href: '/student/exams',        icon: BookOpen,      color: 'violet', bg: 'bg-violet-50', ic: 'text-violet-600',  value: latestResult ? `${latestResult.percentage}%` : 'No results' },
    { label: t.nav.timetable,   href: '/student/timetable',    icon: Clock,         color: 'cyan',   bg: 'bg-cyan-50',   ic: 'text-cyan-600',    value: student.class_name || '--' },
    { label: t.nav.syllabus,    href: '/student/syllabus',     icon: BookMarked,    color: 'teal',   bg: 'bg-teal-50',   ic: 'text-teal-600',    value: `View ${t.syllabusLabel}` },
    { label: t.nav.assignments, href: '/student/assignments',  icon: ClipboardList, color: 'amber',  bg: 'bg-amber-50',  ic: 'text-amber-600',   value: `${(student.assignments ?? []).length || 4} assigned` },
    { label: t.nav.homework,    href: '/student/homework',     icon: NotebookPen,   color: 'rose',   bg: 'bg-rose-50',   ic: 'text-rose-600',    value: 'View diary' },
    { label: t.nav.announcements,href: '/student/announcements',icon: Bell,         color: 'slate',  bg: 'bg-slate-100', ic: 'text-slate-600',   value: '6 notices' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10">
          <GraduationCap className="w-32 h-32" />
        </div>
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0">
            {student.first_name[0]}
          </div>
          <div>
            <p className="text-white/70 text-xs mb-1">Welcome back,</p>
            <h1 className="text-2xl font-extrabold">{student.first_name} {student.last_name}</h1>
            <div className="flex flex-wrap gap-3 mt-2">
              <Badge className="bg-white/20 text-white border-0 text-xs">
                {student.class_name}
              </Badge>
              <Badge className="bg-white/20 text-white border-0 text-xs">
                {t.rollLabel} {student.roll_number}
              </Badge>
              <Badge className="bg-white/20 text-white border-0 text-xs">
                {student.branch}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">This Month&apos;s Attendance</p>
          <p className={`text-2xl font-extrabold ${attendance?.percentage >= 90 ? 'text-emerald-600' : attendance?.percentage >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
            {attendance?.percentage ?? '--'}%
          </p>
          <p className="text-xs text-slate-400 mt-1">{attendance?.present ?? '--'} present of {attendance?.total_days ?? '--'} days</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Latest Result</p>
          <p className="text-2xl font-extrabold text-violet-600">
            {latestResult ? `${latestResult.percentage}%` : 'N/A'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {latestResult ? `Rank #${latestResult.position} · Grade ${latestResult.grade}` : 'No published results'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-500 mb-1">Fee Status</p>
          <p className={`text-2xl font-extrabold ${pendingFees.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {pendingFees.length > 0 ? `${pendingFees.length} Pending` : 'All Paid'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {pendingFees.length > 0 ? 'Please clear outstanding dues' : 'No outstanding dues'}
          </p>
        </div>
      </div>

      {/* Quick navigation cards */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_LINKS.map((ql) => {
            const Icon = ql.icon;
            return (
              <Link
                key={ql.href}
                href={ql.href}
                className="bg-white rounded-xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${ql.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${ql.ic}`} />
                </div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{ql.label}</p>
                <p className={`text-sm font-semibold mt-0.5 ${ql.ic}`}>{ql.value}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Attendance trend mini */}
      {attendance?.monthly_history && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4">Attendance Trend (Last 6 Months)</h2>
          <div className="flex items-end gap-2 h-20">
            {attendance.monthly_history.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-sm transition-all ${m.percentage >= 90 ? 'bg-emerald-500' : m.percentage >= 75 ? 'bg-amber-500' : 'bg-red-400'}`}
                  style={{ height: `${m.percentage}%` }}
                />
                <span className="text-[9px] text-slate-400">{m.month.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student info card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-base font-bold text-slate-800 mb-4">My Information</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: 'Full Name',       value: `${student.first_name} ${student.last_name}` },
            { label: 'Roll Number',     value: student.roll_number },
            { label: 'Class',           value: student.class_name },
            { label: 'Campus',          value: student.branch },
            { label: 'Date of Birth',   value: student.date_of_birth },
            { label: 'Guardian',        value: student.guardian_name },
            { label: 'Guardian Phone',  value: student.guardian_phone },
            { label: 'Email',           value: student.email },
          ].map((info) => (
            <div key={info.label} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{info.label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{info.value || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
