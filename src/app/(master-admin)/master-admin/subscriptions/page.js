'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Plus, TrendingUp, CheckCircle2, AlertTriangle, XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { masterAdminService } from '@/services';
import {
  PageHeader, DataTable, StatusBadge, TableRowActions,
  ConfirmDialog, AppModal, InputField, SelectField,
  DatePickerField, SwitchField, FormSubmitButton,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge }  from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────
const PLAN_OPTIONS = [
  { value: 'basic',      label: '💎 Basic'      },
  { value: 'standard',   label: '⭐ Standard'   },
  { value: 'premium',    label: '👑 Premium'    },
  { value: 'enterprise', label: '🏢 Enterprise' },
];

const STATUS_OPTIONS = [
  { value: 'active',    label: '🟢 Active'    },
  { value: 'expired',   label: '🔴 Expired'   },
  { value: 'cancelled', label: '⚫ Cancelled' },
  { value: 'trial',     label: '🟡 Trial'     },
];

const PAYMENT_OPTIONS = [
  { value: 'paid',    label: 'Paid'    },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
];

const METHOD_OPTIONS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash',          label: 'Cash'          },
  { value: 'card',          label: 'Card'          },
  { value: 'easypaisa',     label: 'EasyPaisa'     },
  { value: 'jazzcash',      label: 'JazzCash'      },
];

const PLAN_BADGE = {
  basic:      'bg-slate-100 text-slate-700',
  standard:   'bg-blue-100 text-blue-700',
  premium:    'bg-amber-100 text-amber-700',
  enterprise: 'bg-purple-100 text-purple-700',
};

const fmt = (v) => v != null ? `PKR ${Number(v).toLocaleString()}` : '—';
const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ─── Columns ─────────────────────────────────────────────────────────────────
function buildColumns(onCancel) {
  return [
    {
      id: 'school',
      header: 'Institute',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div>
            <p className="font-semibold text-slate-800">{s.school?.name ?? '—'}</p>
            <p className="text-xs text-muted-foreground font-mono">{s.school?.code ?? ''}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'plan',
      header: 'Plan',
      cell: ({ getValue }) => {
        const plan = getValue();
        return (
          <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize', PLAN_BADGE[plan] ?? 'bg-gray-100 text-gray-700')}>
            {plan ?? '—'}
          </span>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ getValue }) => <span className="font-mono text-sm font-medium">{fmt(getValue())}</span>,
    },
    {
      accessorKey: 'start_date',
      header: 'Start',
      cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{fmtDate(getValue())}</span>,
    },
    {
      accessorKey: 'expires_at',
      header: 'Expires',
      cell: ({ getValue }) => {
        const d = getValue();
        if (!d) return <span className="text-xs text-muted-foreground">—</span>;
        const isExpiring = new Date(d) < new Date(Date.now() + 30 * 864e5);
        const isExpired  = new Date(d) < new Date();
        return (
          <span className={cn('text-xs font-medium', isExpired ? 'text-red-500' : isExpiring ? 'text-amber-500' : 'text-muted-foreground')}>
            {fmtDate(d)}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <TableRowActions
            extra={s.status === 'active' ? [{ label: '🚫 Cancel', onClick: () => onCancel(s) }] : []}
          />
        );
      },
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SubscriptionsPage() {
  const qc = useQueryClient();

  const [page,         setPage]         = useState(1);
  const [schoolFilter, setSchoolFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen,   setCreateOpen]   = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['master-subs', page, schoolFilter, statusFilter],
    queryFn: () => masterAdminService.getSubscriptions({
      page, limit: 15,
      school_id: schoolFilter || undefined,
      status: statusFilter || undefined,
    }),
  });

  const { data: schoolRows } = useQuery({
    queryKey: ['master-schools-all'],
    queryFn: () => masterAdminService.getSchools({ limit: 100 }).then((r) => r?.data?.rows ?? r?.data ?? []),
  });

  const subs       = data?.data?.rows ?? data?.data ?? [];
  const totalCount = data?.data?.total ?? subs.length;
  const totalPages = data?.data?.totalPages ?? 1;

  // Quick stats from current page data
  const active    = subs.filter((s) => s.status === 'active').length;
  const expiring  = subs.filter((s) => {
    const d = s.expires_at || s.end_date;
    return d && new Date(d) < new Date(Date.now() + 30 * 864e5) && new Date(d) > new Date();
  }).length;
  const total_rev = subs.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

  const createMutation = useMutation({
    mutationFn: (body) => masterAdminService.createSubscription(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['master-subs'] });
      toast.success('Subscription created');
      setCreateOpen(false);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id }) => masterAdminService.cancelSubscription(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['master-subs'] });
      toast.success('Subscription cancelled');
      setCancelTarget(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Cancel failed'),
  });

  const schoolOptions = (schoolRows ?? []).map((s) => ({ value: s.id, label: s.name }));
  const columns = useMemo(() => buildColumns(setCancelTarget), []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="💳 Subscriptions"
        description="Manage institute subscriptions and billing"
        action={
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus size={15} /> New Subscription
          </Button>
        }
      />

      {/* ── Stats Strip ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total',     value: totalCount, icon: TrendingUp,  bg: 'bg-blue-50',    color: 'text-blue-600'    },
          { label: 'Active',    value: active,     icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Expiring',  value: expiring,   icon: AlertTriangle, bg: 'bg-amber-50',  color: 'text-amber-600'  },
          { label: 'Revenue',   value: `PKR ${(total_rev / 1000).toFixed(0)}K`, icon: TrendingUp, bg: 'bg-violet-50', color: 'text-violet-600' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm">
            <div className={cn('rounded-lg p-2', s.bg)}>
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-extrabold leading-none text-slate-800">
                {isLoading ? '—' : s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Expiring Soon Alert ─────────────────────────────── */}
      {expiring > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={15} className="shrink-0" />
          <span>
            <strong>{expiring} subscription{expiring > 1 ? 's' : ''}</strong> expiring within 30 days —{' '}
            consider renewing them.
          </span>
        </div>
      )}

      {/* ── DataTable ──────────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={subs}
        loading={isLoading}
        emptyMessage="No subscriptions found"
        filters={[
          {
            name: 'school', label: 'Institute', value: schoolFilter,
            onChange: (v) => { setSchoolFilter(v); setPage(1); },
            options: schoolOptions,
          },
          {
            name: 'status', label: 'Status', value: statusFilter,
            onChange: (v) => { setStatusFilter(v); setPage(1); },
            options: STATUS_OPTIONS,
          },
        ]}
        pagination={{ page, totalPages, total: totalCount, onPageChange: setPage }}
      />

      {/* ── Create Modal ───────────────────────────────────── */}
      <SubFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(body) => createMutation.mutate(body)}
        loading={createMutation.isPending}
        schoolOptions={schoolOptions}
      />

      {/* ── Cancel Confirm ─────────────────────────────────── */}
      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelMutation.mutate(cancelTarget)}
        loading={cancelMutation.isPending}
        title="Cancel Subscription"
        description={`Cancel subscription for "${cancelTarget?.school?.name}"? The institute will lose access when the current period ends.`}
        confirmLabel="Cancel Subscription"
        variant="destructive"
      />
    </div>
  );
}

// ─── Subscription Form Modal ──────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="mt-4 mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b pb-1.5">
      {children}
    </p>
  );
}

function SubFormModal({ open, onClose, onSubmit, loading, schoolOptions = [] }) {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { is_trial: false },
  });

  const handleClose = () => { reset(); onClose(); };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="➕ New Subscription"
      description="Assign a new subscription to an institute"
      size="lg"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
          <FormSubmitButton loading={loading} label="Create Subscription" loadingLabel="Creating…" onClick={handleSubmit(onSubmit)} />
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
        <SectionLabel>Institute &amp; Plan</SectionLabel>
        <SelectField label="Institute" name="school_id" control={control} error={errors.school_id}
          options={schoolOptions} placeholder="Select institute" required />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectField label="Plan" name="plan" control={control} error={errors.plan}
            options={PLAN_OPTIONS} placeholder="Select plan" required />
          <InputField label="Amount (PKR)" name="amount" register={register} placeholder="50000" type="number" />
        </div>

        <SectionLabel>Dates</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DatePickerField label="Start Date" name="start_date" control={control} fromYear={2020} toYear={2030} />
          <DatePickerField label="Expiry Date" name="expires_at" control={control} fromYear={2020} toYear={2030} />
        </div>
        <SwitchField label="Trial Period" name="is_trial" control={control} hint="Mark as trial subscription" />

        <SectionLabel>Payment Details</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectField label="Payment Status" name="payment_status" control={control}
            options={PAYMENT_OPTIONS} placeholder="Select status" />
          <SelectField label="Payment Method" name="payment_method" control={control}
            options={METHOD_OPTIONS} placeholder="Select method" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InputField label="Transaction ID" name="transaction_id" register={register} placeholder="TXN-2024-XXXX" />
          <InputField label="Invoice No." name="invoice_no" register={register} placeholder="INV-2024-001" />
        </div>
        <InputField label="Notes" name="notes" register={register} placeholder="Optional notes…" />
      </form>
    </AppModal>
  );
}
