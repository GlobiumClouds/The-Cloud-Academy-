'use client';

import { useState } from 'react';
import { Briefcase, Users, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import usePortalStore from '@/store/portalStore';
import { DUMMY_TEACHER_PORTAL_USERS } from '@/data/portalDummyData';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { Badge } from '@/components/ui/badge';

const SUBJECT_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

export default function TeacherClassesPage() {
  const { portalUser } = usePortalStore();
  const teacher = portalUser || DUMMY_TEACHER_PORTAL_USERS[0];
  const t = getPortalTerms(teacher?.institute_type);
  const classes = teacher.assigned_classes || [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-blue-600" /> My {t.classesLabel}
        </h1>
        <p className="text-sm text-slate-500 mt-1">You are assigned to {classes.length} {t.classesLabel.toLowerCase()} this session.</p>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
          <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No classes assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((cls, i) => (
            <div key={cls.class_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-sky-700 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-base font-extrabold">
                    {i + 1}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold">{cls.class_name}</h2>
                    <p className="text-white/70 text-xs mt-0.5">{cls.total_students} enrolled {t.studentsLabel.toLowerCase()}</p>
                  </div>
                </div>
                <Users className="w-6 h-6 text-white/50" />
              </div>

              {/* Subjects */}
              <div className="p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.subjectsLabel} I Teach</p>
                <div className="flex flex-wrap gap-2">
                  {cls.subjects.map((sub, j) => (
                    <span key={sub} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${SUBJECT_COLORS[j % SUBJECT_COLORS.length]}`}>
                      {sub}
                    </span>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { label: 'Notes',       href: '/teacher/notes',       color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
                    { label: 'Assignments', href: '/teacher/assignments', color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
                    { label: 'Attendance',  href: '/teacher/attendance',  color: 'bg-teal-50   text-teal-700   hover:bg-teal-100' },
                  ].map((a) => (
                    <Link
                      key={a.label}
                      href={a.href}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${a.color}`}
                    >
                      {a.label} <ChevronRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
