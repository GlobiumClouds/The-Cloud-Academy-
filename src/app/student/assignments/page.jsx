'use client';

import { useState } from 'react';
import {
  ClipboardList, Clock, CheckCircle2, BookMarked,
  Upload, ChevronDown, ChevronUp, CalendarDays,
} from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import {
  DUMMY_STUDENT_PORTAL_USERS,
  PORTAL_ALL_TEACHER_ASSIGNMENTS,
} from '@/data/portalDummyData';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Subject colour map ─────────────────────────────────────────
const SUBJECT_COLORS = {
  Mathematics: 'bg-blue-50 border-blue-200 text-blue-700',
  Science:     'bg-teal-50 border-teal-200 text-teal-700',
  English:     'bg-violet-50 border-violet-200 text-violet-700',
  Urdu:        'bg-emerald-50 border-emerald-200 text-emerald-700',
  Computer:    'bg-cyan-50 border-cyan-200 text-cyan-700',
};
const subjectColor = (s) => SUBJECT_COLORS[s] || 'bg-indigo-50 border-indigo-200 text-indigo-700';

// ── Status config ──────────────────────────────────────────────
const STATUS_CONFIG = {
  active:    { label: 'Pending',   color: 'bg-amber-100 text-amber-700',   icon: Clock },
  submitted: { label: 'Submitted', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  graded:    { label: 'Graded',    color: 'bg-blue-100 text-blue-700',     icon: BookMarked },
};

const STATUS_FILTERS = [
  { value: '',         label: 'All' },
  { value: 'active',   label: 'Pending' },
  { value: 'submitted',label: 'Submitted' },
  { value: 'graded',   label: 'Graded' },
];

// ── Due date helper ────────────────────────────────────────────
function dueBadge(due) {
  if (!due) return null;
  const diff = Math.ceil((new Date(due) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return <span className="text-xs font-medium text-red-500">Overdue</span>;
  if (diff === 0) return <span className="text-xs font-medium text-orange-500">Due today</span>;
  if (diff <= 2)  return <span className="text-xs font-medium text-amber-500">Due in {diff} day{diff > 1 ? 's' : ''}</span>;
  return <span className="text-xs text-slate-400">Due {new Date(due).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</span>;
}

export default function StudentAssignmentsPage() {
  const { portalUser } = usePortalStore();
  const student  = portalUser || DUMMY_STUDENT_PORTAL_USERS[0];
  const t = getPortalTerms(student?.institute_type);
  const classId  = student.class_id || 'class-001';

  // local submitted state (key = assignment id)
  const [submitted, setSubmitted] = useState({});
  const [expanded,  setExpanded]  = useState({});
  const [filter,    setFilter]    = useState('');

  // Use student's own assignments if populated, else fall back to combined teacher data filtered by class
  const baseAssignments =
    student.assignments?.length
      ? student.assignments
      : PORTAL_ALL_TEACHER_ASSIGNMENTS.filter((a) => a.class_id === classId);

  const assignments = baseAssignments
    .map((a) => ({ ...a, status: submitted[a.id] ? 'submitted' : a.status }))
    .filter((a) => !filter || a.status === filter || (filter === 'active' && a.status === 'active'));

  const handleSubmit = (id) => {
    setSubmitted((prev) => ({ ...prev, [id]: true }));
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const counts = {
    active:    baseAssignments.filter((a) => !submitted[a.id] && a.status === 'active').length,
    submitted: baseAssignments.filter((a) =>  submitted[a.id] || a.status === 'submitted').length,
    graded:    baseAssignments.filter((a) =>  a.status === 'graded').length,
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-emerald-600" /> My {t.assignmentsLabel}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{student.class_name} — Academic Year 2025–26</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending',   count: counts.active,    color: 'border-amber-300 bg-amber-50',    text: 'text-amber-700' },
          { label: 'Submitted', count: counts.submitted,  color: 'border-emerald-300 bg-emerald-50', text: 'text-emerald-700' },
          { label: 'Graded',    count: counts.graded,     color: 'border-blue-300 bg-blue-50',      text: 'text-blue-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border-2 ${s.color} p-3 text-center`}>
            <p className={`text-2xl font-extrabold ${s.text}`}>{s.count}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-semibold transition-all border',
              filter === f.value
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Assignment list */}
      <div className="space-y-3">
        {assignments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No assignments found</p>
          </div>
        ) : (
          assignments.map((asgn) => {
            const cfg   = STATUS_CONFIG[asgn.status] || STATUS_CONFIG.active;
            const StatusIcon = cfg.icon;
            const isOpen = expanded[asgn.id];
            const isActive = asgn.status === 'active';

            return (
              <div
                key={asgn.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Card header */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', subjectColor(asgn.subject))}>
                          {asgn.subject}
                        </span>
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1', cfg.color)}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-sm leading-snug">{asgn.title}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {asgn.class_name} &nbsp;·&nbsp;
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          Assigned {new Date(asgn.assigned_on).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                        </span>
                        &nbsp;·&nbsp; {asgn.total_marks} marks
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {dueBadge(asgn.due_date)}
                      <button
                        onClick={() => toggleExpand(asgn.id)}
                        className="text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable detail + submit */}
                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 space-y-4">
                    <p className="text-sm text-slate-700 leading-relaxed">{asgn.description}</p>
                    {isActive && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* File upload (UI only) */}
                        <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-3 px-4 cursor-pointer text-sm text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-all">
                          <Upload className="w-4 h-4" />
                          Attach file (optional)
                          <input type="file" className="hidden" />
                        </label>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleSubmit(asgn.id)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          Mark as Submitted
                        </Button>
                      </div>
                    )}
                    {asgn.status === 'graded' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Grade Received</p>
                        <p className="text-2xl font-extrabold text-blue-700">{asgn.total_marks}/{asgn.total_marks}</p>
                      </div>
                    )}
                    {(asgn.status === 'submitted' || submitted[asgn.id]) && (
                      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2.5">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <p className="text-sm font-semibold">Assignment submitted — awaiting teacher review</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
