'use client';

import { useState } from 'react';
import { NotebookPen, CalendarDays, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import {
  DUMMY_STUDENT_PORTAL_USERS,
  PORTAL_ALL_TEACHER_HW,
} from '@/data/portalDummyData';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { cn } from '@/lib/utils';

// ── Subject colours ────────────────────────────────────────────
const SUBJECT_COLORS = {
  Mathematics: { dot: 'bg-blue-500',    card: 'border-l-blue-400',   tag: 'bg-blue-50 text-blue-700'    },
  Science:     { dot: 'bg-teal-500',    card: 'border-l-teal-400',   tag: 'bg-teal-50 text-teal-700'    },
  English:     { dot: 'bg-violet-500',  card: 'border-l-violet-400', tag: 'bg-violet-50 text-violet-700' },
  Urdu:        { dot: 'bg-emerald-500', card: 'border-l-emerald-400',tag: 'bg-emerald-50 text-emerald-700' },
  Computer:    { dot: 'bg-cyan-500',    card: 'border-l-cyan-400',   tag: 'bg-cyan-50 text-cyan-700'    },
};
const subjectStyle = (s) =>
  SUBJECT_COLORS[s] || { dot: 'bg-indigo-500', card: 'border-l-indigo-400', tag: 'bg-indigo-50 text-indigo-700' };

// ── Helpers ────────────────────────────────────────────────────
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function formatShort(d) {
  return new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}
function isToday(d) {
  const today = new Date();
  const dt    = new Date(d);
  return dt.toDateString() === today.toDateString();
}
function isTomorrow(d) {
  const tom = new Date(); tom.setDate(tom.getDate() + 1);
  return new Date(d).toDateString() === tom.toDateString();
}
function dayLabel(d) {
  if (isToday(d))    return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return formatDate(d);
}

const SUBJECT_FILTERS = ['All', 'Mathematics', 'Science', 'English', 'Urdu', 'Computer'];

export default function StudentHomeworkPage() {
  const { portalUser } = usePortalStore();
  const student = portalUser || DUMMY_STUDENT_PORTAL_USERS[0];
  const t = getPortalTerms(student?.institute_type);
  const classId = student.class_id || 'class-001';

  const [subjectFilter, setSubjectFilter] = useState('All');
  const [expanded, setExpanded] = useState({});

  // Use student's own homework if populated, else search across all teacher data by class
  const allHomework =
    student.homework?.length
      ? student.homework
      : PORTAL_ALL_TEACHER_HW.filter((h) => h.class_id === classId);

  const filtered = allHomework.filter(
    (h) => subjectFilter === 'All' || h.subject === subjectFilter,
  );

  // Group by date (desc)
  const grouped = filtered.reduce((acc, hw) => {
    const key = hw.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(hw);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  const toggleExpand = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <NotebookPen className="w-6 h-6 text-emerald-600" /> {t.homeworkLabel}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{student.class_name} — Academic Year 2025–26</p>
      </div>

      {/* Summary strip */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-white/70 text-xs">Total Entries</p>
          <p className="text-3xl font-extrabold">{allHomework.length}</p>
        </div>
        <div className="text-right">
          <p className="text-white/70 text-xs">Subjects</p>
          <p className="text-3xl font-extrabold">
            {[...new Set(allHomework.map((h) => h.subject))].length}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/70 text-xs">This week</p>
          <p className="text-3xl font-extrabold">
            {allHomework.filter((h) => {
              const d   = new Date(h.date);
              const now = new Date();
              const day = now.getDay() || 7;
              const mon = new Date(now); mon.setDate(now.getDate() - day + 1);
              return d >= mon;
            }).length}
          </p>
        </div>
      </div>

      {/* Subject filter */}
      <div className="flex gap-2 flex-wrap">
        {SUBJECT_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setSubjectFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold transition-all border',
              subjectFilter === f
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Diary entries grouped by date */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <NotebookPen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No homework entries found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => {
            const entries  = grouped[date];
            const isRecent = isToday(date) || isTomorrow(date);
            return (
              <div key={date} className="space-y-2">
                {/* Date heading */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold',
                    isRecent
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600',
                  )}>
                    <CalendarDays className="w-3.5 h-3.5" />
                    {dayLabel(date)}
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium">{entries.length} item{entries.length > 1 ? 's' : ''}</span>
                </div>

                {/* Homework cards for this date */}
                <div className="space-y-2 ml-2">
                  {entries.map((hw) => {
                    const style   = subjectStyle(hw.subject);
                    const isOpen  = expanded[hw.id];
                    return (
                      <div
                        key={hw.id}
                        className={cn(
                          'bg-white rounded-xl border border-slate-200 border-l-4 shadow-sm overflow-hidden',
                          style.card,
                        )}
                      >
                        <div
                          className="flex items-start gap-3 p-3.5 cursor-pointer select-none"
                          onClick={() => toggleExpand(hw.id)}
                        >
                          {/* Subject dot */}
                          <div className="mt-0.5 flex-shrink-0">
                            <div className={cn('w-2.5 h-2.5 rounded-full mt-1', style.dot)} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', style.tag)}>
                                {hw.subject}
                              </span>
                              {hw.due_date && (
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" />
                                  Due {formatShort(hw.due_date)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-slate-800 leading-snug">{hw.title}</p>
                            {!isOpen && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{hw.description}</p>
                            )}
                          </div>

                          <div className="flex-shrink-0 text-slate-400">
                            {isOpen
                              ? <ChevronUp className="w-4 h-4" />
                              : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                        {isOpen && (
                          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                              {hw.description}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
