'use client';
/**
 * TeachersPage — Adaptive for all institute types
 * School → Teachers | Coaching → Instructors | Academy → Trainers
 * College → Lecturers | University → Faculty / Staff
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GraduationCap, Phone, Mail } from 'lucide-react';

import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import DatePickerField from '@/components/common/DatePickerField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_FLAT_TEACHERS } from '@/data/dummyData';

// ─── Options ────────────────────────────────────────────────────────────────
const GENDER_OPTIONS   = [{ value:'male', label:'Male' }, { value:'female', label:'Female' }, { value:'other', label:'Other' }];
const STATUS_OPTIONS   = [{ value:'true', label:'Active' }, { value:'false', label:'Inactive' }];
const SUBJECT_OPTIONS  = [
  { value:'mathematics', label:'Mathematics' }, { value:'physics', label:'Physics' },
  { value:'chemistry', label:'Chemistry' }, { value:'biology', label:'Biology' },
  { value:'english', label:'English' }, { value:'computer', label:'Computer Science' },
  { value:'urdu', label:'Urdu' }, { value:'islamiat', label:'Islamiat' },
];

// ─── Zod schema ─────────────────────────────────────────────────────────────
const schema = z.object({
  first_name:  z.string().min(2, 'First name required'),
  last_name:   z.string().min(2, 'Last name required'),
  email:       z.string().email('Valid email required'),
  phone:       z.string().min(10, 'Phone required'),
  gender:      z.string().min(1, 'Select gender'),
  joining_date:z.string().optional(),
  qualification:z.string().optional(),
  specialization:z.string().optional(),
  is_active:   z.string().optional(),
});

// ─── Dummy fallback ──────────────────────────────────────────────────────────
const genDummy = (type) => {
  const base = DUMMY_FLAT_TEACHERS ?? [];
  return base.length ? base : [
    { id:'t1', first_name:'Ahmed', last_name:'Raza', email:'ahmed@inst.pk', phone:'0300-1234567', gender:'male', qualification:'M.Sc Physics', joining_date:'2022-04-01', is_active:true },
  ];
};

export default function TeachersPage({ type }) {
  const qc     = useQueryClient();
  const canDo  = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const label  = terms.teacher ?? 'Teacher';
  const labelP = terms.teachers ?? 'Teachers';

  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Form
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { is_active: 'true', gender: '' },
  });

  // Fetch
  const { data, isLoading } = useQuery({
    queryKey: ['teachers', type, page, pageSize, search, status],
    queryFn: async () => {
      try {
        const { teacherService } = await import('@/services');
        return await teacherService.getAll({ page, limit: pageSize, search, is_active: status });
      } catch {
        const dummy = genDummy(type).filter(t =>
          (!search || `${t.first_name} ${t.last_name}`.toLowerCase().includes(search.toLowerCase())) &&
          (!status || String(t.is_active) === status)
        );
        const slice = dummy.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: dummy.length, totalPages: Math.max(1, Math.ceil(dummy.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const teachers   = data?.data?.rows       ?? genDummy(type);
  const total      = data?.data?.total      ?? teachers.length;
  const totalPages = data?.data?.totalPages ?? 1;

  // Save mutation
  const save = useMutation({
    mutationFn: async (vals) => {
      try {
        const { teacherService } = await import('@/services');
        return editing
          ? await teacherService.update(editing.id, vals)
          : await teacherService.create(vals);
      } catch { return { data: { ...vals, id: `t-${Date.now()}` } }; }
    },
    onSuccess: () => {
      toast.success(editing ? `${label} updated` : `${label} added`);
      qc.invalidateQueries({ queryKey: ['teachers'] });
      closeModal();
    },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { teacherService } = await import('@/services'); return await teacherService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['teachers'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ is_active:'true', gender:'' }); setModal(true); };
  const openEdit = (row) => {
    setEditing(row);
    reset({ ...row, is_active: String(row.is_active), gender: row.gender ?? '' });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  // Columns
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row: { original: t } }) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {t.first_name?.[0]}{t.last_name?.[0]}
          </div>
          <div>
            <p className="font-medium leading-tight">{t.first_name} {t.last_name}</p>
            <p className="text-xs text-muted-foreground">{t.qualification}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row: { original: t } }) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1"><Mail size={11} />{t.email}</div>
          <div className="flex items-center gap-1"><Phone size={11} />{t.phone}</div>
        </div>
      ),
    },
    { accessorKey: 'gender', header: 'Gender', cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
    { accessorKey: 'joining_date', header: 'Joined', cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('en-PK') : '—' },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ getValue }) => (
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getValue() ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500')}>
          {getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions', header: 'Actions', enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          {canDo('teacher.update') && (
            <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>
          )}
          {canDo('teacher.delete') && (
            <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>
          )}
        </div>
      ),
    },
  ], [canDo]);

  const active   = teachers.filter(t => t.is_active).length;
  const inactive = teachers.filter(t => !t.is_active).length;

  return (
    <div className="space-y-5">
      <PageHeader title={labelP} description={`${total} total`} />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label={`Total ${labelP}`} value={total} icon={<GraduationCap size={18} />} />
        <StatsCard label="Active" value={active} icon={<GraduationCap size={18} />} trend={null} description="currently teaching" />
        <StatsCard label="Inactive" value={inactive} icon={<GraduationCap size={18} />} />
      </div>

      {/* Table */}
      <DataTable
        columns={columns} data={teachers} loading={isLoading}
        emptyMessage={`No ${labelP.toLowerCase()} found`}
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder={`Search ${labelP.toLowerCase()}…`}
        filters={[{ name:'status', label:'Status', value:status, onChange:(v)=>{ setStatus(v); setPage(1); }, options:STATUS_OPTIONS }]}
        action={canDo('teacher.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> Add {label}</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'teachers' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
      />

      {/* Add / Edit Modal */}
      <AppModal open={modal} onClose={closeModal} title={editing ? `Edit ${label}` : `Add ${label}`} size="lg"
        footer={<>
          <button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
          <button type="submit" form="teacher-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {save.isPending ? 'Saving…' : editing ? 'Update' : 'Add'}
          </button>
        </>}
      >
        <form id="teacher-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">First Name *</label>
              <input {...register('first_name')} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Muhammad" />
              {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Last Name *</label>
              <input {...register('last_name')} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Ahmed" />
              {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email *</label>
              <input {...register('email')} type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="email@inst.pk" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone *</label>
              <input {...register('phone')} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="0300-1234567" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Gender" name="gender" control={control} error={errors.gender} options={GENDER_OPTIONS} placeholder="Select gender" required />
            <DatePickerField label="Joining Date" name="joining_date" control={control} error={errors.joining_date} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Qualification</label>
            <input {...register('qualification')} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="M.Sc Physics" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Specialization</label>
            <input {...register('specialization')} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Algebra, Mechanics" />
          </div>
          <SelectField label="Status" name="is_active" control={control} error={errors.is_active} options={STATUS_OPTIONS} />
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title={`Delete ${label}`} size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {remove.isPending ? 'Deleting\u2026' : 'Delete'}
            </button>
          </>
        }>
        <p className="text-sm text-muted-foreground">Delete <strong>{deleting?.first_name} {deleting?.last_name}</strong>? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
