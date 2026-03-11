'use client';

import { useState } from 'react';
import {
  BookMarked, User, FileText, ChevronDown, ChevronUp,
  BookOpen, Download, ExternalLink,
} from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { DUMMY_STUDENT_PORTAL_USERS } from '@/data/portalDummyData';
import { DUMMY_SUBJECTS } from '@/data/dummyData';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { cn } from '@/lib/utils';

// ── Subject colours ────────────────────────────────────────────
const PALETTE = [
  { bg: 'bg-blue-50',    border: 'border-blue-200',   icon: 'bg-blue-500',    tag: 'bg-blue-100 text-blue-700',    heading: 'text-blue-700'    },
  { bg: 'bg-violet-50',  border: 'border-violet-200', icon: 'bg-violet-500',  tag: 'bg-violet-100 text-violet-700',heading: 'text-violet-700'  },
  { bg: 'bg-emerald-50', border: 'border-emerald-200',icon: 'bg-emerald-500', tag: 'bg-emerald-100 text-emerald-700',heading: 'text-emerald-700'},
  { bg: 'bg-teal-50',    border: 'border-teal-200',   icon: 'bg-teal-500',    tag: 'bg-teal-100 text-teal-700',    heading: 'text-teal-700'    },
  { bg: 'bg-amber-50',   border: 'border-amber-200',  icon: 'bg-amber-500',   tag: 'bg-amber-100 text-amber-700',  heading: 'text-amber-700'   },
  { bg: 'bg-rose-50',    border: 'border-rose-200',   icon: 'bg-rose-500',    tag: 'bg-rose-100 text-rose-700',    heading: 'text-rose-700'    },
  { bg: 'bg-cyan-50',    border: 'border-cyan-200',   icon: 'bg-cyan-500',    tag: 'bg-cyan-100 text-cyan-700',    heading: 'text-cyan-700'    },
  { bg: 'bg-indigo-50',  border: 'border-indigo-200', icon: 'bg-indigo-500',  tag: 'bg-indigo-100 text-indigo-700',heading: 'text-indigo-700'  },
];

export default function StudentSyllabusPage() {
  const { portalUser } = usePortalStore();
  const student  = portalUser || DUMMY_STUDENT_PORTAL_USERS[0];
  const t = getPortalTerms(student?.institute_type);
  const classId  = student.class_id || 'class-001';

  const subjects = student.syllabus?.length
    ? student.syllabus
    : DUMMY_SUBJECTS.filter((s) => s.class_id === classId && s.is_active !== false);

  const [expanded, setExpanded] = useState({});
  const [search,   setSearch]   = useState('');

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const filtered = subjects.filter(
    (s) => !search || s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <BookMarked className="w-6 h-6 text-emerald-600" /> My {t.syllabusLabel}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{student.class_name} — Academic Year 2025–26</p>
      </div>

      {/* Summary banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-white/70 text-xs mb-0.5">Total {t.subjectsLabel}</p>
          <p className="text-4xl font-extrabold">{subjects.length}</p>
        </div>
        <div className="text-right">
          <p className="text-white/70 text-xs mb-0.5">{t.classLabel}</p>
          <p className="text-lg font-bold">{student.class_name}</p>
        </div>
        <div className="w-full sm:w-auto">
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subjects…"
              className="w-full sm:w-52 pl-9 pr-3 py-2 rounded-xl bg-white/20 placeholder-white/60 text-white text-sm outline-none focus:bg-white/30 transition"
            />
          </div>
        </div>
      </div>

      {/* Subject cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No subjects found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((subject, idx) => {
            const pal    = PALETTE[idx % PALETTE.length];
            const isOpen = expanded[subject.id];
            const initials = subject.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
            const chapters = subject.syllabus_type === 'text' && subject.syllabus_content
              ? subject.syllabus_content.split('\n').filter(Boolean)
              : [];

            return (
              <div
                key={subject.id}
                className={cn('rounded-2xl border-2 overflow-hidden transition-all', pal.bg, pal.border)}
              >
                {/* Card header — always visible */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer select-none"
                  onClick={() => toggle(subject.id)}
                >
                  {/* Subject icon avatar */}
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0', pal.icon)}>
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className={cn('font-extrabold text-slate-900 text-sm')}>{subject.name}</p>
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full font-mono', pal.tag)}>
                        {subject.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{subject.description}</p>
                    {/* Teacher */}
                    {subject.teacher && (
                      <div className="flex items-center gap-1 mt-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-[11px] text-slate-500">
                          {subject.teacher.first_name} {subject.teacher.last_name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {chapters.length > 0 && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        {chapters.length} chapter{chapters.length > 1 ? 's' : ''}
                      </span>
                    )}
                    <span className={cn('text-slate-500 transition-transform', isOpen && 'rotate-180')}>
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Expandable syllabus */}
                {isOpen && (
                  <div className="border-t border-slate-200 bg-white px-5 py-4 space-y-4">
                    {/* Description */}
                    <p className="text-sm text-slate-600">{subject.description}</p>

                    {/* Chapters list */}
                    {chapters.length > 0 && (
                      <div>
                        <p className={cn('text-xs font-bold uppercase tracking-wider mb-3', pal.heading)}>
                          Syllabus Outline
                        </p>
                        <div className="space-y-2">
                          {chapters.map((chapter, ci) => (
                            <div
                              key={ci}
                              className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                            >
                              <div className={cn('flex-shrink-0 w-5 h-5 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center mt-0.5', pal.icon)}>
                                {ci + 1}
                              </div>
                              <p className="text-sm text-slate-700 font-medium leading-snug">{chapter}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PDF link */}
                    {subject.syllabus_file_url && (
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                        <FileText className="w-5 h-5 text-rose-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">Syllabus PDF</p>
                          <p className="text-xs text-slate-400 truncate">{subject.syllabus_file_url}</p>
                        </div>
                        <a
                          href={subject.syllabus_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </div>
                    )}

                    {/* No syllabus */}
                    {chapters.length === 0 && !subject.syllabus_file_url && (
                      <p className="text-sm text-slate-400 italic">Syllabus not yet uploaded by teacher.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
