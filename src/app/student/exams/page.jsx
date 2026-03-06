'use client';

import { BookOpen, Award, Star, TrendingUp } from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { DUMMY_STUDENT_PORTAL_USERS, DUMMY_EXAM_RESULTS } from '@/data/portalDummyData';
import { getPortalTerms } from '@/constants/portalInstituteConfig';

const GRADE_COLORS = {
  'A+': 'bg-emerald-100 text-emerald-700',
  'A':  'bg-teal-100   text-teal-700',
  'B+': 'bg-cyan-100   text-cyan-700',
  'B':  'bg-sky-100    text-sky-700',
  'C':  'bg-amber-100  text-amber-700',
  'D':  'bg-orange-100 text-orange-700',
  'F':  'bg-red-100    text-red-700',
};

const BAR_COLOR = (pct) =>
  pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-teal-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-400';

function ResultCard({ result, t }) {
  const gradePct = result.percentage;
  const rankGradient = gradePct >= 90 ? 'from-emerald-600 to-teal-700' : gradePct >= 75 ? 'from-teal-600 to-cyan-700' : 'from-amber-600 to-orange-700';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${rankGradient} p-5 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-xs mb-1">{result.exam?.name || result.exam?.exam_name || 'Exam'}</p>
            <h3 className="text-lg font-extrabold">{result.exam?.type || result.exam?.exam_type || 'Result'}</h3>
            <p className="text-white/80 text-sm mt-1">{result.exam?.class_name || ''}{result.exam?.session ? ` — ${result.exam.session}` : ''}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold">{result.percentage}%</p>
            <p className="text-white/70 text-xs mt-0.5">
              {result.total_marks}/{result.total_full} marks
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-3">
          <div className="bg-white/20 rounded-lg px-3 py-1 text-center">
            <p className="text-xs text-white/70">Grade</p>
            <p className="text-base font-extrabold">{result.grade}</p>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-1 text-center">
            <p className="text-xs text-white/70">Rank</p>
            <p className="text-base font-extrabold">#{result.position}</p>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-1 text-center">
            <p className="text-xs text-white/70">Class</p>
            <p className="text-base font-extrabold">{result.class_total} students</p>
          </div>
        </div>
      </div>

      {/* Subject-wise */}
      <div className="p-5 space-y-3">
        <h4 className="text-sm font-bold text-slate-700 mb-2">{t.subjectsLabel}-wise Performance</h4>
        {result.subjects?.map((sub, idx) => {
          const obtained = sub.marks ?? sub.obtained ?? 0;
          const total    = sub.total  ?? sub.total_marks ?? 100;
          const subPct   = Math.round((obtained / total) * 100);
          return (
            <div key={`${sub.name || sub.subject}-${idx}`} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">{sub.name || sub.subject}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{obtained}/{total}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${GRADE_COLORS[sub.grade] || 'bg-slate-100 text-slate-600'}`}>
                    {sub.grade}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`${BAR_COLOR(subPct)} h-2 rounded-full transition-all`}
                  style={{ width: `${Math.min(subPct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Remarks */}
      {(result.remarks || result.teacher_remarks) && (
        <div className="mx-5 mb-5 bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.teacherLabel}&apos;s Remarks</p>
          <p className="text-sm text-slate-700 italic">&ldquo;{result.remarks || result.teacher_remarks}&rdquo;</p>
        </div>
      )}
    </div>
  );
}

export default function StudentExamsPage() {
  const { portalUser } = usePortalStore();
  const student = portalUser || DUMMY_STUDENT_PORTAL_USERS[0];
  const t = getPortalTerms(student?.institute_type);
  const studentId = student.id || 'stu-001';
  const results = student.results || DUMMY_EXAM_RESULTS[studentId] || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-600" /> My {t.resultsLabel}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{student.first_name} {student.last_name} — {student.class_name}</p>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-base font-semibold">No published results yet.</p>
          <p className="text-sm mt-1">Check back after exams are completed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((r) => (
            <ResultCard key={r.exam_id} result={r} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
