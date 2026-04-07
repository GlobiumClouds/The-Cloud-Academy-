'use client';

import { Building2, CalendarDays, Landmark, Mail, UserRound, Wallet } from 'lucide-react';
import { MONTHS } from '@/constants';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

const MONTH_MAP = Object.fromEntries((MONTHS ?? []).map((month) => [String(month.value), month.label]));

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveMonthLabel(month) {
  if (month === null || month === undefined || month === '') return '—';
  const normalized = String(month);
  return MONTH_MAP[normalized] ?? normalized;
}

function resolveName(record) {
  return record?.employee_name ?? record?.teacher_name ?? record?.staff_name ?? record?.name ?? '—';
}

function resolveDesignation(record) {
  return record?.designation ?? record?.role ?? record?.title ?? 'Staff';
}

function resolveStatus(record) {
  return record?.status ?? 'generated';
}

export default function PayslipTemplate({ record, className }) {
  if (!record) return null;

  const basic = toNumber(record.basic_salary ?? record.basic ?? 0);
  const allowances = toNumber(record.allowances ?? 0);
  const deductions = toNumber(record.deductions ?? record.total_deductions ?? 0);
  const netSalary = toNumber(record.net_salary ?? record.net ?? record.net_pay ?? basic + allowances - deductions);
  const grossSalary = toNumber(record.gross_salary ?? record.gross ?? basic + allowances);
  const paidDate = record.paid_on ?? record.paid_date ?? record.paidDate ?? null;
  const generatedDate = record.generated_on ?? record.created_at ?? record.createdAt ?? null;
  const status = resolveStatus(record);

  return (
    <section
      className={cn(
        'payslip-print overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-2xl shadow-slate-950/5',
        className,
      )}
    >
      <header className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-slate-900 px-6 py-6 text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_30%)]" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">Salary Slip</p>
              <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">The Clouds Academy</h2>
              <p className="mt-1 max-w-xl text-sm text-white/75">
                Payroll statement prepared with the global theme tokens used across the dashboard.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-white/65">Period</p>
            <p className="mt-1 text-base font-semibold">
              {resolveMonthLabel(record.month)} {record.year ?? ''}
            </p>
            <p className="mt-1 text-xs text-white/70">Reference: {record.id ?? '—'}</p>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-6 py-6">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-2xl border border-border bg-muted/30 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Employee</p>
                <h3 className="mt-1 text-xl font-semibold text-foreground">{resolveName(record)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{resolveDesignation(record)}</p>
              </div>

              <div className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize',
                status === 'paid'
                  ? 'bg-emerald-100 text-emerald-700'
                  : status === 'pending' || status === 'generated'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700',
              )}>
                {String(status).replace(/_/g, ' ')}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <DetailItem icon={UserRound} label="Employee ID" value={record.employee_id ?? record.teacher_id ?? '—'} />
              <DetailItem icon={CalendarDays} label="Payment Date" value={paidDate ? formatDate(paidDate) : 'Pending'} />
              <DetailItem icon={Landmark} label="Bank / Method" value={record.bank ?? record.payment_method ?? '—'} />
              <DetailItem icon={Mail} label="Record ID" value={record.id ?? '—'} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Net Pay</p>
            <div className="mt-3 rounded-2xl bg-primary/5 px-4 py-5">
              <p className="text-sm text-muted-foreground">Amount payable</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {formatCurrency(netSalary)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Gross pay {formatCurrency(grossSalary)} · Deductions {formatCurrency(deductions)}
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              <SummaryRow label="Basic Salary" value={formatCurrency(basic)} />
              <SummaryRow label="Allowances" value={formatCurrency(allowances)} />
              <SummaryRow label="Deductions" value={formatCurrency(deductions)} tone="destructive" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Earnings</p>
                <h4 className="mt-1 text-lg font-semibold">Salary Breakdown</h4>
              </div>
              <Wallet className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-4 space-y-3">
              <BreakdownRow label="Basic Salary" value={formatCurrency(basic)} />
              <BreakdownRow label="Allowances" value={formatCurrency(allowances)} />
              <BreakdownRow label="Gross Salary" value={formatCurrency(grossSalary)} highlight />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Deductions</p>
                <h4 className="mt-1 text-lg font-semibold">Adjustments & Notes</h4>
              </div>
              <div className="rounded-full bg-destructive/10 p-2 text-destructive">
                <span className="text-xs font-semibold">−</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <BreakdownRow label="Deductions" value={formatCurrency(deductions)} tone="destructive" />
              <BreakdownRow label="Net Pay" value={formatCurrency(netSalary)} highlight />
            </div>

            <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Payroll note</p>
              <p className="mt-1">
                {generatedDate
                  ? `Generated on ${formatDate(generatedDate)} using the shared payroll theme.`
                  : 'Generated using the shared payroll theme.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SignatureBlock label="Prepared By" value="Accounts Department" />
          <SignatureBlock label="Approved By" value="Principal / Admin" />
          <SignatureBlock label="Received By" value={resolveName(record)} />
        </div>
      </div>
    </section>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
      <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, tone = 'default' }) {
  return (
    <div className={cn('flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm', tone === 'destructive' ? 'bg-destructive/5' : 'bg-background')}>
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-semibold', tone === 'destructive' ? 'text-destructive' : 'text-foreground')}>
        {value}
      </span>
    </div>
  );
}

function BreakdownRow({ label, value, tone = 'default', highlight = false }) {
  return (
    <div className={cn('flex items-center justify-between rounded-xl px-4 py-3 text-sm', highlight ? 'bg-primary/5' : 'bg-muted/20')}>
      <span className={cn('font-medium', tone === 'destructive' ? 'text-destructive' : 'text-muted-foreground')}>
        {label}
      </span>
      <span className={cn('font-semibold', tone === 'destructive' ? 'text-destructive' : 'text-foreground')}>
        {value}
      </span>
    </div>
  );
}

function SignatureBlock({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/20 px-4 py-5 text-center">
      <div className="mx-auto mb-8 h-px w-20 bg-border" />
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}