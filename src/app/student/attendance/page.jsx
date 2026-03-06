'use client';

import { useState } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { DUMMY_STUDENT_PORTAL_USERS, DUMMY_PORTAL_ATTENDANCE } from '@/data/portalDummyData';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { Badge } from '@/components/ui/badge';

const STATUS_CLASSES = {
  present: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  absent:  'bg-red-100  text-red-700  border-red-200',
  late:    'bg-amber-100 text-amber-700 border-amber-200',
  holiday: 'bg-slate-100 text-slate-400 border-slate-200',
  weekend: 'bg-slate-50  text-slate-300 border-transparent',
};

const DAYS_SHORT = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StudentAttendancePage() {
  const { portalUser } = usePortalStore();
  const student = portalUser || DUMMY_STUDENT_PORTAL_USERS[0];
  const t = getPortalTerms(student?.institute_type);
  const studentId = student.id || 'stu-001';
  const attendance = student.attendance || DUMMY_PORTAL_ATTENDANCE[studentId];

  const total   = attendance?.total_days ?? 0;
  const present = attendance?.present ?? 0;
  const absent  = attendance?.absent ?? 0;
  const late    = attendance?.late ?? 0;
  const pct     = attendance?.percentage ?? 0;

  const stats = [
    { label: 'Total Days',  value: total,   icon: Calendar,      color: 'text-slate-700', bg: 'bg-slate-50' },
    { label: 'Present',     value: present, icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Absent',      value: absent,  icon: XCircle,       color: 'text-red-600',   bg: 'bg-red-50' },
    { label: 'Late',        value: late,    icon: Clock,         color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const pctColor = pct >= 90 ? 'text-emerald-600' : pct >= 75 ? 'text-amber-600' : 'text-red-600';
  const barColor = pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-amber-500'    : 'bg-red-500';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-emerald-600" /> My {t.attendanceLabel}
        </h1>
        <p className="text-sm text-slate-500 mt-1">February 2026 — {student.class_name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white`}>
              <Icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Percentage banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-700">Overall Attendance</span>
          <span className={`text-2xl font-extrabold ${pctColor}`}>{pct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div className={`${barColor} h-3 rounded-full transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <p className={`text-xs mt-2 font-medium ${pctColor}`}>
          {pct >= 90 ? `✓ Excellent ${t.attendanceLabel.toLowerCase()} — Keep it up!` : pct >= 75 ? `⚠ ${t.attendanceLabel} below 90% — Try to attend more.` : `✗ ${t.attendanceLabel} critically low — Please consult your ${t.teacherLabel.toLowerCase()}.`}
        </p>
      </div>

      {/* Daily calendar grid */}
      {attendance?.daily && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4">Daily Record — February 2026</h2>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-4">
            {[['present','Present'],['absent','Absent'],['late','Late'],['holiday','Holiday']].map(([k,v]) => (
              <span key={k} className={`text-xs px-2 py-0.5 rounded-md border font-medium ${STATUS_CLASSES[k]}`}>{v}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
            ))}
            {/* Feb 2026 starts on Sunday (index 6, so 6 empty cells for Mon-Sat before Feb 1) */}
            {Array.from({ length: 6 }).map((_, i) => <div key={`e-${i}`} />)}
            {attendance.daily.map((day) => (
              <div
                key={day.date}
                className={`rounded-lg border text-center p-1.5 ${STATUS_CLASSES[day.status] || STATUS_CLASSES['holiday']}`}
              >
                <p className="text-[11px] font-bold">{day.date.split('-')[2]}</p>
                <p className="text-[8px] mt-0.5 capitalize">{day.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly history */}
      {attendance?.monthly_history && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4">
            <TrendingUp className="w-4 h-4 inline mr-2 text-emerald-600" />Month-wise History
          </h2>
          <div className="space-y-3">
            {attendance.monthly_history.map((m) => {
              const mc = m.percentage >= 90 ? 'bg-emerald-500' : m.percentage >= 75 ? 'bg-amber-500' : 'bg-red-400';
              const tc = m.percentage >= 90 ? 'text-emerald-600' : m.percentage >= 75 ? 'text-amber-600' : 'text-red-600';
              return (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-20 shrink-0">{m.month}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                    <div className={`${mc} h-2.5 rounded-full`} style={{ width: `${m.percentage}%` }} />
                  </div>
                  <span className={`text-xs font-bold w-10 text-right ${tc}`}>{m.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
