'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Plus, Pencil, Trash2, Check, Star, Crown, Gem, Building2,
  Users, GraduationCap, GitBranch, HardDrive,
} from 'lucide-react';
import { toast } from 'sonner';

import { masterAdminService } from '@/services';
import {
  PageHeader, StatusBadge, ConfirmDialog, AppModal,
  InputField, SwitchField, FormSubmitButton, CheckboxField,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Feature options ──────────────────────────────────────────────────────────
const ALL_FEATURES = [
  'Attendance Tracking',
  'Fee Management',
  'Exam & Results',
  'Homework & Assignments',
  'Timetable',
  'Parent Portal',
  'Student Portal',
  'SMS Notifications',
  'Email Notifications',
  'Payroll',
  'Library Management',
  'Transport',
  'Hostel',
  'Advanced Reports',
  'Multi-Branch',
  'API Access',
];

const fmtPrice = (p) => p != null ? `PKR ${Number(p).toLocaleString()}` : '—';

// Plan icon mapping
function PlanIcon({ name, className }) {
  const n = (name ?? '').toLowerCase();
  if (n.includes('enterprise')) return <Building2 className={className} />;
  if (n.includes('premium'))    return <Crown className={className} />;
  if (n.includes('standard'))   return <Star className={className} />;
  return <Gem className={className} />;
}

const PLAN_COLORS = {
  basic:      { bg: 'bg-slate-50',   border: 'border-slate-200',   accent: 'text-slate-600',   badge: 'bg-slate-100 text-slate-700'   },
  standard:   { bg: 'bg-blue-50',    border: 'border-blue-200',    accent: 'text-blue-600',    badge: 'bg-blue-100 text-blue-700'     },
  premium:    { bg: 'bg-amber-50',   border: 'border-amber-200',   accent: 'text-amber-600',   badge: 'bg-amber-100 text-amber-700'   },
  enterprise: { bg: 'bg-purple-50',  border: 'border-purple-200',  accent: 'text-purple-600',  badge: 'bg-purple-100 text-purple-700' },
};

// Resolve color by either code or index
function getPlanColor(tpl, idx) {
  const name = (tpl.code ?? tpl.name ?? '').toLowerCase();
  for (const key of ['enterprise', 'premium', 'standard', 'basic']) {
    if (name.includes(key)) return PLAN_COLORS[key];
  }
  const palette = Object.values(PLAN_COLORS);
  return palette[idx % palette.length];
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SubscriptionTemplatesPage() {
  const qc = useQueryClient();

  const [createOpen,    setCreateOpen]    = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['sub-templates'],
    queryFn:  () => masterAdminService.getSubscriptionTemplates(),
  });
  const templates = data?.data?.rows ?? data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (body) => masterAdminService.createSubscriptionTemplate?.(body) ?? Promise.reject(new Error('createSubscriptionTemplate not available')),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sub-templates'] });
      toast.success('Plan created');
      setCreateOpen(false);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => masterAdminService.updateSubscriptionTemplate?.(id, body) ?? Promise.reject(new Error('updateSubscriptionTemplate not available')),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sub-templates'] });
      toast.success('Plan updated');
      setEditTarget(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => masterAdminService.deleteSubscriptionTemplate?.(id) ?? Promise.reject(new Error('deleteSubscriptionTemplate not available')),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sub-templates'] });
      toast.success('Plan deleted');
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Failed'),
  });

  const handleSubmit = (body) => {
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, body });
    } else {
      createMutation.mutate(body);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="📦 Subscription Plans"
        description="Define and manage plans available to institutes"
        action={
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus size={15} /> New Plan
          </Button>
        }
      />

      {/* ── Plan Cards ─────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 rounded-2xl border bg-white animate-pulse" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Gem size={40} className="mb-3 opacity-30" />
          <p>No plans found. Create your first plan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((tpl, idx) => {
            const colors = getPlanColor(tpl, idx);
            const features = Array.isArray(tpl.features) ? tpl.features : [];
            return (
              <div
                key={tpl.id}
                className={cn(
                  'relative flex flex-col rounded-2xl border-2 p-5 shadow-sm transition-all hover:shadow-md',
                  colors.bg, colors.border,
                )}
              >
                {/* ── Header ── */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn('rounded-full p-2 bg-white shadow-sm')}>
                      <PlanIcon name={tpl.code ?? tpl.name} className={cn('size-4', colors.accent)} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 capitalize">{tpl.name}</h3>
                      {tpl.code && (
                        <p className="text-[10px] font-mono text-muted-foreground uppercase">{tpl.code}</p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={tpl.is_active !== false ? 'active' : 'inactive'} />
                </div>

                {/* ── Pricing ── */}
                <div className="mb-3">
                  <p className={cn('text-2xl font-extrabold', colors.accent)}>
                    {fmtPrice(tpl.price_monthly)}
                    <span className="text-xs font-normal text-muted-foreground">/mo</span>
                  </p>
                  {tpl.price_yearly && (
                    <p className="text-xs text-muted-foreground">
                      {fmtPrice(tpl.price_yearly)}/yr — save {Math.round((1 - tpl.price_yearly / (tpl.price_monthly * 12)) * 100)}%
                    </p>
                  )}
                  {tpl.duration_months && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Duration: {tpl.duration_months} month{tpl.duration_months > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* ── Limits ── */}
                <div className="mb-3 grid grid-cols-2 gap-1.5">
                  {[
                    { icon: Users, label: 'Students', val: tpl.max_students ?? '∞' },
                    { icon: GraduationCap, label: 'Teachers', val: tpl.max_teachers ?? '∞' },
                    { icon: GitBranch, label: 'Branches', val: tpl.max_branches ?? '∞' },
                    { icon: HardDrive, label: 'Storage', val: tpl.max_storage_gb ? `${tpl.max_storage_gb}GB` : '∞' },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1 rounded-lg bg-white/60 px-2 py-1">
                      <l.icon size={11} className="text-muted-foreground" />
                      <div>
                        <p className="text-[10px] text-muted-foreground leading-none">{l.label}</p>
                        <p className="text-xs font-semibold text-slate-700">{l.val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Features ── */}
                <div className="flex-1 mb-4 space-y-1">
                  {features.slice(0, 5).map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-slate-700">
                      <Check size={11} className="text-emerald-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                  {features.length > 5 && (
                    <p className="text-[11px] text-muted-foreground">+{features.length - 5} more features</p>
                  )}
                </div>

                {/* ── Actions ── */}
                <div className="flex gap-1.5 mt-auto">
                  <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs"
                    onClick={() => setEditTarget(tpl)}>
                    <Pencil size={11} /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => setDeleteTarget(tpl)}>
                    <Trash2 size={11} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Form Modal ─────────────────────────────────────── */}
      <PlanFormModal
        open={createOpen || !!editTarget}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        defaultValues={editTarget ?? {}}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        isEdit={!!editTarget}
      />

      {/* ── Delete Confirm ─────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget)}
        loading={deleteMutation.isPending}
        title="Delete Plan"
        description={`Delete the "${deleteTarget?.name}" plan? Institutes on this plan won't be affected immediately, but no new subscriptions can use it.`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}

// ─── Plan Form Modal ──────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="mt-4 mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b pb-1.5">
      {children}
    </p>
  );
}

function PlanFormModal({ open, onClose, defaultValues, onSubmit, loading, isEdit }) {
  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      is_active:       true,
      features:        [],
      ...defaultValues,
    },
  });

  const selectedFeatures = watch('features') ?? [];

  const toggleFeature = (feature) => {
    const current = selectedFeatures;
    if (current.includes(feature)) {
      setValue('features', current.filter((f) => f !== feature));
    } else {
      setValue('features', [...current, feature]);
    }
  };

  const handleClose = () => { reset(); onClose(); };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={isEdit ? '✏️ Edit Plan' : '➕ New Plan'}
      description={isEdit ? 'Update plan details' : 'Create a new subscription plan'}
      size="xl"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
          <FormSubmitButton loading={loading} label={isEdit ? 'Save Changes' : 'Create Plan'} loadingLabel="Saving…" onClick={handleSubmit(onSubmit)} />
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
        <SectionLabel>Plan Identity</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InputField label="Plan Name" name="name" register={register} error={errors.name}
            rules={{ required: 'Name is required' }} placeholder="Standard" required />
          <InputField label="Code" name="code" register={register} placeholder="standard" />
        </div>
        <InputField label="Description" name="description" register={register} placeholder="Best for medium-size schools" />

        <SectionLabel>Pricing</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InputField label="Monthly Price (PKR)" name="price_monthly" register={register} type="number" placeholder="5000" />
          <InputField label="Yearly Price (PKR)"  name="price_yearly"  register={register} type="number" placeholder="50000" />
          <InputField label="Setup Fee (PKR)"     name="setup_fee"     register={register} type="number" placeholder="0" />
        </div>
        <InputField label="Duration (months)" name="duration_months" register={register} type="number" placeholder="12" />

        <SectionLabel>Limits</SectionLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InputField label="Max Students"  name="max_students"   register={register} type="number" placeholder="500" />
          <InputField label="Max Teachers"  name="max_teachers"   register={register} type="number" placeholder="50" />
          <InputField label="Max Branches"  name="max_branches"   register={register} type="number" placeholder="1" />
          <InputField label="Storage (GB)"  name="max_storage_gb" register={register} type="number" placeholder="10" />
        </div>

        <SectionLabel>Features</SectionLabel>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {ALL_FEATURES.map((feature) => (
            <label
              key={feature}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/40 transition-colors"
            >
              <input
                type="checkbox"
                className="size-4 accent-emerald-600"
                checked={selectedFeatures.includes(feature)}
                onChange={() => toggleFeature(feature)}
              />
              <span className="text-sm text-slate-700">{feature}</span>
            </label>
          ))}
        </div>

        <SectionLabel>Status</SectionLabel>
        <SwitchField label="Plan Active" name="is_active" control={control}
          hint="If disabled, no new subscriptions can be created on this plan" />
      </form>
    </AppModal>
  );
}
