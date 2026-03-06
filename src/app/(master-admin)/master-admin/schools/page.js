'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  Plus, Building2, CheckCircle2, Clock, XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { masterAdminService } from '@/services';
import { INSTITUTE_TYPES } from '@/data/dummyData';
import {
  PageHeader, DataTable, StatusBadge, TableRowActions,
  ConfirmDialog, AppModal, InputField, SelectField,
  SwitchField, FormSubmitButton,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────
const INST_TYPE_OPTIONS = INSTITUTE_TYPES.map((t) => ({
  value: t.value, label: `${t.icon}  ${t.label}`,
}));

const STATUS_OPTIONS = [
  { value: 'true',  label: '🟢 Active'   },
  { value: 'false', label: '🔴 Inactive' },
];

const PLAN_OPTIONS = [
  { value: 'basic',      label: '💎 Basic'      },
  { value: 'standard',   label: '⭐ Standard'   },
  { value: 'premium',    label: '👑 Premium'    },
  { value: 'enterprise', label: '🏢 Enterprise' },
];

const BOARD_OPTIONS = [
  'Punjab Board', 'Federal Board', 'Cambridge CAIE', 'AKU-EB', 'Aga Khan Board',
].map((v) => ({ value: v, label: v }));

const PROVINCE_OPTIONS = [
  'Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad (ICT)', 'GB',
].map((v) => ({ value: v, label: v }));

const TYPE_BADGE = {
  school:     'bg-blue-100 text-blue-800 border-blue-200',
  coaching:   'bg-orange-100 text-orange-800 border-orange-200',
  academy:    'bg-indigo-100 text-indigo-800 border-indigo-200',
  college:    'bg-cyan-100 text-cyan-800 border-cyan-200',
  university: 'bg-violet-100 text-violet-800 border-violet-200',
};

const PLAN_BADGE = {
  basic:      'bg-slate-100 text-slate-700',
  standard:   'bg-blue-100 text-blue-700',
  premium:    'bg-amber-100 text-amber-700',
  enterprise: 'bg-purple-100 text-purple-700',
};

// ─── Columns ─────────────────────────────────────────────────────────────────
function buildColumns(onEdit, onToggle, onDelete, router) {
  return [
    {
      id: 'name',
      header: 'Institute Name',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="cursor-pointer" onClick={() => router.push(`/master-admin/schools/${s.id}`)}>
            <p className="font-semibold text-slate-800 hover:text-emerald-700 transition-colors">{s.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{s.code}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'institute_type',
      header: 'Type',
      cell: ({ getValue }) => {
        const val = getValue();
        const def = INSTITUTE_TYPES.find((t) => t.value === val);
        if (!def) return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
            TYPE_BADGE[val] ?? 'bg-gray-100 text-gray-700',
          )}>
            {def.icon} {def.label}
          </span>
        );
      },
    },
    {
      id: 'plan',
      header: 'Plan',
      cell: ({ row }) => {
        const plan = row.original.subscription?.plan;
        if (!plan) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <span className={cn(
            'rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize',
            PLAN_BADGE[plan] ?? 'bg-gray-100 text-gray-700',
          )}>
            {plan}
          </span>
        );
      },
    },
    {
      id: 'sub_status',
      header: 'Sub. Status',
      cell: ({ row }) => {
        const status = row.original.subscription?.status;
        if (!status) return <span className="text-xs text-muted-foreground">—</span>;
        const cfg = ({
          active:    { icon: CheckCircle2, cls: 'text-emerald-600', label: 'Active'     },
          expired:   { icon: XCircle,      cls: 'text-red-500',     label: 'Expired'    },
          cancelled: { icon: XCircle,      cls: 'text-slate-400',   label: 'Cancelled'  },
          trial:     { icon: Clock,        cls: 'text-amber-500',   label: 'Trial'      },
        })[status] ?? { icon: Clock, cls: 'text-slate-400', label: status };
        return (
          <span className={cn('flex items-center gap-1 text-xs font-medium', cfg.cls)}>
            <cfg.icon size={12} /> {cfg.label}
          </span>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue() ? 'active' : 'inactive'} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <TableRowActions
            onView={() => router.push(`/master-admin/schools/${s.id}`)}
            onEdit={() => onEdit(s)}
            onDelete={() => onDelete(s)}
            extra={[
              {
                label: s.is_active ? '🔒 Deactivate' : '✅ Activate',
                onClick: () => onToggle(s),
              },
            ]}
          />
        );
      },
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MasterSchoolsPage() {
  const router = useRouter();
  const qc     = useQueryClient();

  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [status,     setStatus]     = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [createOpen,   setCreateOpen]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['master-institutes', page, search, status, typeFilter],
    queryFn: () => masterAdminService.getSchools({
      page, limit: 15,
      search: search || undefined,
      is_active: status || undefined,
      institute_type: typeFilter || undefined,
    }),
  });

  const institutes = data?.data?.rows ?? data?.data ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const totalCount = data?.data?.total ?? institutes.length;
  const activeCount = institutes.filter((i) => i.is_active).length;

  const createMutation = useMutation({
    mutationFn: (body) => masterAdminService.createSchool(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['master-institutes'] });
      toast.success('Institute created successfully');
      setCreateOpen(false);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Create failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => masterAdminService.deleteSchool(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['master-institutes'] });
      toast.success('Institute deleted');
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Delete failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => masterAdminService.toggleSchoolStatus(id, is_active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['master-institutes'] });
      toast.success('Status updated');
      setToggleTarget(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const handleFormSubmit = (body) => {
    if (editTarget) {
      masterAdminService.updateSchool(editTarget.id, body)
        .then(() => {
          qc.invalidateQueries({ queryKey: ['master-institutes'] });
          toast.success('Institute updated');
          setEditTarget(null);
        })
        .catch((e) => toast.error(e?.response?.data?.message ?? 'Update failed'));
    } else {
      createMutation.mutate(body);
    }
  };

  const columns = useMemo(
    () => buildColumns(setEditTarget, setToggleTarget, setDeleteTarget, router),
    [router],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="🏢 Institute Management"
        description="Manage all institutes registered on the platform"
        action={
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus size={15} /> New Institute
          </Button>
        }
      />

      {/* ── Quick Stats Strip ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total',    value: totalCount,                   icon: Building2,    bg: 'bg-blue-50',    color: 'text-blue-600'    },
          { label: 'Active',   value: activeCount,                  icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Inactive', value: totalCount - activeCount,     icon: XCircle,      bg: 'bg-red-50',     color: 'text-red-500'     },
          { label: 'Expiring', value: 12,                           icon: Clock,        bg: 'bg-amber-50',   color: 'text-amber-600'   },
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

      {/* ── DataTable ──────────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={institutes}
        loading={isLoading}
        emptyMessage="No institutes found"
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name or code…"
        filters={[
          {
            name: 'type', label: 'Type', value: typeFilter,
            onChange: (v) => { setTypeFilter(v); setPage(1); },
            options: INSTITUTE_TYPES.map((t) => ({ value: t.value, label: `${t.icon} ${t.label}` })),
          },
          {
            name: 'status', label: 'Status', value: status,
            onChange: (v) => { setStatus(v); setPage(1); },
            options: STATUS_OPTIONS,
          },
        ]}
        pagination={{ page, totalPages, total: totalCount, onPageChange: setPage }}
      />

      {/* ── Form Modal ─────────────────────────────────────── */}
      <InstituteFormModal
        open={createOpen || !!editTarget}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        defaultValues={editTarget ?? {}}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending}
        isEdit={!!editTarget}
      />

      {/* ── Delete Confirm ─────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget)}
        loading={deleteMutation.isPending}
        title="Delete Institute"
        description={`Permanently delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* ── Toggle Confirm ─────────────────────────────────── */}
      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={() => toggleMutation.mutate({ id: toggleTarget.id, is_active: !toggleTarget.is_active })}
        loading={toggleMutation.isPending}
        title={toggleTarget?.is_active ? 'Deactivate Institute' : 'Activate Institute'}
        description={`${toggleTarget?.is_active ? 'Deactivate' : 'Activate'} "${toggleTarget?.name}"?`}
        confirmLabel={toggleTarget?.is_active ? 'Deactivate' : 'Activate'}
        variant={toggleTarget?.is_active ? 'destructive' : 'default'}
      />
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="mt-5 mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b pb-1.5">
      {children}
    </p>
  );
}

// ─── Institute Form Modal ─────────────────────────────────────────────────────
function InstituteFormModal({ open, onClose, defaultValues, onSubmit, loading, isEdit }) {
  const { register, control, handleSubmit, reset, formState: { errors }, watch } = useForm({
    defaultValues: { is_active: true, has_branches: false, ...defaultValues },
  });

  const selectedType = watch('institute_type');

  const { data: tplData } = useQuery({
    queryKey: ['sub-templates-list'],
    queryFn: () => masterAdminService.getSubscriptionTemplates(),
    enabled: open,
  });
  const tplOptions = (tplData?.data?.rows ?? tplData?.data ?? []).map((t) => ({
    value: t.id,
    label: `${t.name} — PKR ${t.price_monthly?.toLocaleString()}/mo`,
  }));

  const handleClose = () => { reset(); onClose(); };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={isEdit ? '✏️ Edit Institute' : '➕ Add New Institute'}
      description={isEdit ? 'Update institute information' : 'Register a new institute on the platform'}
      size="xl"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
          <FormSubmitButton
            loading={loading}
            label={isEdit ? 'Save Changes' : 'Create Institute'}
            loadingLabel="Saving…"
            onClick={handleSubmit(onSubmit)}
          />
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">

        {/* Basic Info */}
        <SectionLabel>Basic Information</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InputField
            label="Institute Name" name="name" register={register} error={errors.name}
            rules={{ required: 'Name is required' }} placeholder="The Clouds Academy" required
          />
          <InputField
            label="Code" name="code" register={register} error={errors.code}
            rules={{ required: 'Code is required' }} placeholder="TCA-LHR" required
          />
        </div>
        <SelectField
          label="Institute Type" name="institute_type" control={control} error={errors.institute_type}
          options={INST_TYPE_OPTIONS} placeholder="Select type" required
        />

        {/* Contact */}
        <SectionLabel>Contact &amp; Address</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InputField
            label="Admin Email" name="admin_email" register={register} error={errors.admin_email}
            rules={{ required: 'Email is required' }} placeholder="admin@institute.edu.pk" required type="email"
          />
          <InputField label="Phone" name="phone" register={register} placeholder="+92-42-35761234" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InputField label="Website" name="website" register={register} placeholder="https://institute.edu.pk" />
          <InputField label="City" name="city" register={register} placeholder="Lahore" />
        </div>
        <InputField label="Address" name="address" register={register} placeholder="12-B, Gulberg III, Lahore" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectField label="Province" name="province" control={control} options={PROVINCE_OPTIONS} placeholder="Select province" />
          <InputField label="Admin Password (new only)" name="admin_password" register={register} placeholder="Min. 8 characters" type="password" />
        </div>

        {/* Subscription */}
        <SectionLabel>Subscription Plan</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tplOptions.length > 0 ? (
            <SelectField label="Subscription Template" name="subscription_template_id" control={control} options={tplOptions} placeholder="Select template" />
          ) : (
            <SelectField label="Plan" name="plan" control={control} options={PLAN_OPTIONS} placeholder="Select plan" />
          )}
        </div>

        {/* Type-specific */}
        {selectedType === 'school' && (
          <>
            <SectionLabel>School-Specific</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SelectField label="Affiliation Board" name="affiliation_board" control={control} options={BOARD_OPTIONS} placeholder="Select board" />
              <InputField label="Grade Range" name="grade_range" register={register} placeholder="Class 1 – 12" />
            </div>
            <InputField label="Principal Name" name="principal_name" register={register} placeholder="Prof. Ahmed Raza" />
          </>
        )}

        {selectedType === 'coaching' && (
          <>
            <SectionLabel>Coaching-Specific</SectionLabel>
            <InputField label="Subject Focus" name="subject_focus" register={register} placeholder="Mathematics, Physics, Chemistry" />
            <InputField label="Target Exams" name="target_exams" register={register} placeholder="MDCAT, ECAT, CSS" />
            <InputField label="Director Name" name="director_name" register={register} placeholder="Dr. Khalid Mehmood" />
          </>
        )}

        {selectedType === 'college' && (
          <>
            <SectionLabel>College-Specific</SectionLabel>
            <InputField label="Affiliation University" name="affiliation_board" register={register} placeholder="University of Punjab" />
            <InputField label="Degree Programs" name="degree_programs" register={register} placeholder="FSc, FA, ICS, B.Com" />
            <InputField label="Principal Name" name="principal_name" register={register} placeholder="Prof. Naveed Hassan" />
          </>
        )}

        {selectedType === 'university' && (
          <>
            <SectionLabel>University-Specific</SectionLabel>
            <InputField label="Faculties" name="faculties" register={register} placeholder="Engineering, Sciences, Business, Arts" />
            <InputField label="HEC Charter No." name="hec_charter" register={register} placeholder="HEC-2005-XXX" />
          </>
        )}

        {selectedType === 'academy' && (
          <>
            <SectionLabel>Academy-Specific</SectionLabel>
            <InputField label="Specialization" name="specialization" register={register} placeholder="IT & Programming, Languages, Arts…" />
          </>
        )}

        {/* Settings */}
        <SectionLabel>Settings</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SwitchField label="Has Branches" name="has_branches" control={control} hint="Institute operates multiple branches" />
          <SwitchField label="Active" name="is_active" control={control} hint="Institute is active on the platform" />
        </div>

      </form>
    </AppModal>
  );
}
