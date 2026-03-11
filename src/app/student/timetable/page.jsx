'use client';

import { useState } from 'react';
import { Clock, BookOpen, User, MapPin } from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { DUMMY_STUDENT_PORTAL_USERS, DUMMY_TIMETABLE } from '@/data/portalDummyData';
import { getPortalTerms } from '@/constants/portalInstituteConfig';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const SUBJECT_COLORS = {
  // Academy / School core
  'Mathematics':          'bg-blue-50   border-blue-200   text-blue-700',
  'English':              'bg-violet-50 border-violet-200 text-violet-700',
  'English Language':     'bg-violet-50 border-violet-200 text-violet-700',
  'Urdu':                 'bg-emerald-50 border-emerald-200 text-emerald-700',
  'Science':              'bg-teal-50   border-teal-200   text-teal-700',
  'Social Studies':       'bg-amber-50  border-amber-200  text-amber-700',
  'Islamic Studies':      'bg-green-50  border-green-200  text-green-700',
  'Islamiat':             'bg-green-50  border-green-200  text-green-700',
  'Computer Science':     'bg-cyan-50   border-cyan-200   text-cyan-700',
  'Computer':             'bg-cyan-50   border-cyan-200   text-cyan-700',
  'Art & Craft':          'bg-pink-50   border-pink-200   text-pink-700',
  'Arts & Crafts':        'bg-pink-50   border-pink-200   text-pink-700',
  'Physical Education':   'bg-orange-50 border-orange-200 text-orange-700',
  'General Knowledge':    'bg-yellow-50 border-yellow-200 text-yellow-700',
  'Pak. Studies':         'bg-lime-50   border-lime-200   text-lime-700',
  // Coaching / College / University
  'Physics':              'bg-sky-50    border-sky-200    text-sky-700',
  'Chemistry':            'bg-teal-50   border-teal-200   text-teal-700',
  'Biology':              'bg-green-50  border-green-200  text-green-700',
  'Data Structures':      'bg-indigo-50 border-indigo-200 text-indigo-700',
  'OOP (Java)':           'bg-violet-50 border-violet-200 text-violet-700',
  'Database Systems':     'bg-cyan-50   border-cyan-200   text-cyan-700',
  'Computer Networks':    'bg-blue-50   border-blue-200   text-blue-700',
  'Discrete Mathematics': 'bg-amber-50  border-amber-200  text-amber-700',
  'Revision':             'bg-slate-50  border-slate-200  text-slate-500',
  // Break
  'Break':                'bg-slate-50  border-slate-200  text-slate-400',
  'Lunch Break':          'bg-slate-50  border-slate-200  text-slate-400',
  'Assembly':             'bg-rose-50   border-rose-200   text-rose-400',
};

function getSubjectColor(subject) {
  return SUBJECT_COLORS[subject] || 'bg-indigo-50 border-indigo-200 text-indigo-700';
}

export default function StudentTimetablePage() {
  const { portalUser } = usePortalStore();
  const student = portalUser || DUMMY_STUDENT_PORTAL_USERS[0];
  const t = getPortalTerms(student?.institute_type);
  // Use timetable directly from student object if present, else fall back to DUMMY_TIMETABLE
  const classId = student.class_id || 'class-001';
  const timetable = student.timetable || DUMMY_TIMETABLE[classId] || {};

  // timetable data has { schedule: [{ day, periods }] } structure
  const scheduleMap = {};
  (timetable.schedule || []).forEach((s) => { scheduleMap[s.day] = s.periods; });

  const [activeDay, setActiveDay] = useState('Monday');
  const daySchedule = scheduleMap[activeDay] || [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-emerald-600" /> {t.timetableLabel}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{student.class_name} — Academic Year 2025–26</p>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeDay === day
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Full week grid (hidden on mobile, shown on desktop) */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase border-b border-slate-100 w-20">
                Period
              </th>
              {DAYS.map((day) => (
                <th key={day} className={`px-3 py-3 text-xs font-bold uppercase border-b border-l border-slate-100 ${day === activeDay ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'}`}>
                  {day.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(scheduleMap['Monday'] || []).map((_, periodIdx) => (
              <tr key={periodIdx} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2 text-[11px] font-bold text-slate-400">
                  P{periodIdx + 1}
                  <br />
                  <span className="font-normal text-slate-300">
                    {scheduleMap['Monday']?.[periodIdx]?.time}
                  </span>
                </td>
                {DAYS.map((day) => {
                  const period = scheduleMap[day]?.[periodIdx];
                  if (!period) return <td key={day} className="border-l border-slate-100 px-2 py-2" />;
                  const isBreak = period.subject?.toLowerCase().includes('break');
                  return (
                    <td key={day} className={`border-l border-slate-100 px-2 py-2 ${day === activeDay ? 'bg-emerald-50/30' : ''}`}>
                      {isBreak ? (
                        <span className="text-[10px] text-slate-300 font-medium italic block text-center">{period.subject}</span>
                      ) : (
                        <div className={`rounded-lg border px-2 py-1.5 ${getSubjectColor(period.subject)}`}>
                          <p className="text-[10px] font-bold leading-tight">{period.subject}</p>
                          {period.teacher && <p className="text-[9px] opacity-70 mt-0.5">{period.teacher.split(' ').slice(-1)[0]}</p>}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/single-day view */}
      <div className="lg:hidden space-y-2">
        <h2 className="text-base font-bold text-slate-800">{activeDay}&apos;s Schedule</h2>
        {daySchedule.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No schedule for {activeDay}.</p>
          </div>
        ) : (
          daySchedule.map((period, idx) => {
            const isBreak = period.subject?.toLowerCase().includes('break');
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-xl border ${isBreak ? 'bg-slate-50 border-slate-200 opacity-60' : `${getSubjectColor(period.subject)} bg-white`}`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0 text-xs font-extrabold text-slate-500">
                  P{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${isBreak ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                    {period.subject}
                  </p>
                  {!isBreak && (
                    <div className="flex gap-3 mt-0.5">
                      {period.teacher && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <User className="w-3 h-3" /> {period.teacher}
                        </span>
                      )}
                      {period.room && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" /> {period.room}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] font-semibold text-slate-400">{period.time}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop single day detail */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-emerald-50">
          <h2 className="text-base font-bold text-emerald-800">{activeDay} — Detailed Schedule</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {daySchedule.map((period, idx) => {
            const isBreak = period.subject?.toLowerCase().includes('break');
            return (
              <div key={idx} className={`flex items-center gap-4 px-5 py-3 ${isBreak ? 'opacity-50' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-extrabold text-slate-500 flex-shrink-0">
                  P{idx + 1}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${isBreak ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                    {period.subject}
                  </p>
                  {!isBreak && (
                    <div className="flex gap-4 mt-0.5">
                      {period.teacher && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <User className="w-3 h-3" /> {period.teacher}
                        </span>
                      )}
                      {period.room && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {period.room}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-400">{period.time}</p>
                  {!isBreak && (
                    <p className="text-[10px] text-slate-300 mt-0.5">45 min</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
