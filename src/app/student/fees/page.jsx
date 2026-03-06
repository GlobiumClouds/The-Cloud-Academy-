'use client';

import { DollarSign, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { DUMMY_STUDENT_PORTAL_USERS } from '@/data/portalDummyData';
import { Badge } from '@/components/ui/badge';

const MONTH_NAMES = ['','January','February','March','April','May','June','July','August','September','October','November','December'];

const STATUS_MAP = {
  paid:    { label: 'Paid',    icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'Pending', icon: AlertCircle,  color: 'text-amber-600',   bg: 'bg-amber-50',   badge: 'bg-amber-100 text-amber-700' },
  overdue: { label: 'Overdue', icon: AlertCircle,  color: 'text-red-600',     bg: 'bg-red-50',     badge: 'bg-red-100 text-red-700' },
};

export default function StudentFeesPage() {
  const { portalUser } = usePortalStore();
  const student = portalUser || DUMMY_STUDENT_PORTAL_USERS[0];
  const fees = student.fees || [];

  const totalAmount   = fees.reduce((s, f) => s + (f.amount || 0), 0);
  const totalPaid     = fees.filter((f) => f.status === 'paid').reduce((s, f) => s + (f.amount || 0), 0);
  const totalPending  = fees.filter((f) => f.status !== 'paid').reduce((s, f) => s + (f.amount || 0), 0);
  const hasPending    = totalPending > 0;

  const fmt = (n) => `PKR ${n?.toLocaleString() ?? 0}`;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-emerald-600" /> My Fee Record
        </h1>
        <p className="text-sm text-slate-500 mt-1">{student.first_name} {student.last_name} — {student.class_name}</p>
      </div>

      {/* Alert banner */}
      {hasPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Outstanding Dues</p>
            <p className="text-xs text-amber-700 mt-0.5">Please clear your pending fees. Contact accounts office for assistance.</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',    value: fmt(totalAmount),  icon: DollarSign,  bg: 'bg-slate-50',    color: 'text-slate-700' },
          { label: 'Paid',     value: fmt(totalPaid),    icon: CheckCircle2,bg: 'bg-emerald-50',  color: 'text-emerald-600' },
          { label: 'Pending',  value: fmt(totalPending), icon: Clock,       bg: hasPending ? 'bg-amber-50' : 'bg-slate-50', color: hasPending ? 'text-amber-600' : 'text-slate-400' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white`}>
              <Icon className={`w-4 h-4 ${s.color} mb-2`} />
              <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Fee list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Fee History</h2>
        </div>
        {fees.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No fee records found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {fees.map((fee) => {
              const sm = STATUS_MAP[fee.status] || STATUS_MAP['pending'];
              const Icon = sm.icon;
              const monthLabel = fee.month ? MONTH_NAMES[fee.month] : fee.month_label || 'N/A';
              return (
                <div key={fee.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className={`w-10 h-10 rounded-xl ${sm.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${sm.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{fee.month_label || monthLabel} Fee</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Due: {fee.due_date || 'N/A'}
                      {fee.paid_on ? ` · Paid: ${fee.paid_on}` : ''}
                      {fee.discount ? ` · Discount: PKR ${fee.discount}` : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-extrabold text-slate-800">PKR {fee.amount?.toLocaleString()}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sm.badge}`}>
                      {sm.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
