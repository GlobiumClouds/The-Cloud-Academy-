'use client';

import { CalendarDays, Clock3, MapPin } from 'lucide-react';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { useTeacherTimetable } from '@/hooks/useTeacherPortal';

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday'
};

export default function TeacherTimetablePage() {
  const t = getPortalTerms('school');
  const { timetable, loading } = useTeacherTimetable();

  if (loading) {
    return <div className="max-w-5xl mx-auto text-sm text-slate-500">Loading timetable...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-blue-600" /> {t.nav.timetable}
        </h1>
        <p className="text-sm text-slate-500 mt-1">Class and section-wise periods assigned to you.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {DAY_ORDER.map((day) => {
          const slots = timetable?.[day] || [];
          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800">{DAY_LABELS[day]}</p>
                <span className="text-xs text-slate-400">{slots.length} periods</span>
              </div>

              {slots.length === 0 ? (
                <div className="px-4 py-6 text-xs text-slate-400">No classes scheduled.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {slots.map((slot) => (
                    <div key={slot.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{slot.subject || 'Subject'}</p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{slot.class || 'Class'}{slot.section_name ? ` · ${slot.section_name}` : ''}</p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">P{slot.period || '-'}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="w-3.5 h-3.5" /> {slot.start_time || '--:--'} - {slot.end_time || '--:--'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> Room {slot.room || '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
