'use client';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, CalendarDays, CheckCircle } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import DatePickerField from '@/components/common/DatePickerField';
import StatsCard from '@/components/common/StatsCard';
import { DUMMY_ACADEMIC_YEARS } from '@/data/dummyData';

const schema = z.object({
  name:        z.string().min(3, 'Required'),
  start_date:  z.string().min(1, 'Required'),
  end_date:    z.string().min(1, 'Required'),
  is_current:  z.boolean().optional(),
  description: z.string().optional(),
});

export default function AcademicYearsPage({ type }) {
  const qc     = useQueryClient();
  const canDo  = useAuthStore((s) => s.canDo);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting,setDeleting]= useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { is_current: false },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['academic-years', type, page, pageSize, search],
    queryFn: async () => {
      try {
        const { academicYearService } = await import('@/services');
        return await academicYearService.getAll({ page, limit: pageSize, search });
      } catch {
        const d = DUMMY_ACADEMIC_YEARS.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows       = data?.data?.rows       ?? DUMMY_ACADEMIC_YEARS;
  const total      = data?.data?.total      ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try {
        const { academicYearService } = await import('@/services');
        return editing ? await academicYearService.update(editing.id, vals) : await academicYearService.create(vals);
      } catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['academic-years'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { academicYearService } = await import('@/services'); return await academicYearService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['academic-years'] }); setDeleting(null); },
    onError:   () => toast.error('Delete failed'),
  });

  const openAdd    = () => { setEditing(null); reset({ is_current: false }); setModal(true); };
  const openEdit   = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const columns = useMemo(() => [
    { accessorKey: 'name',        header: 'Year Name',   cell: ({ getValue }) => <span className="font-semibold">{getValue()}</span> },
    { accessorKey: 'start_date',  header: 'Start Date',  cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('en-PK') },
    { accessorKey: 'end_date',    header: 'End Date',    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('en-PK') },
    { accessorKey: 'description', header: 'Description', cell: ({ getValue }) => getValue() || '—' },
    {
      accessorKey: 'is_current', header: 'Status',
      cell: ({ getValue }) => getValue()
        ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"><CheckCircle size={11} /> Current</span>
        : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Past</span>,
    },
    {
      id: 'actions', header: 'Actions', enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {canDo('academicYear.update') && (
            <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>
          )}
          {canDo('academicYear.delete') && (
            <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>
          )}
        </div>
      ),
    },
  ], [canDo]);

  const addBtn = canDo('academicYear.create') ? (
    <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
      <Plus size={14} /> Add Year
    </button>
  ) : null;

  return (
    <div className="space-y-5">
      <PageHeader title="Academic Years" description={`${total} years configured`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Years"  value={total}                                      icon={<CalendarDays size={18} />} />
        <StatsCard label="Current Year" value={rows.find(r => r.is_current)?.name ?? '—'} icon={<CheckCircle   size={18} />} />
        <StatsCard label="Past Years"   value={rows.filter(r => !r.is_current).length}    icon={<CalendarDays size={18} />} />
      </div>

      <DataTable
        columns={columns} data={rows} loading={isLoading} emptyMessage="No academic years found"
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search years…"
        action={addBtn}
        enableColumnVisibility
        exportConfig={{ fileName: 'academic-years' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
      />

      {/* Save Modal */}
      <AppModal open={modal} onClose={closeModal} title={editing ? 'Edit Academic Year' : 'New Academic Year'} size="md"
        footer={
          <>
            <button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button type="submit" form="ay-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {save.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
          </>
        }>
        <form id="ay-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Year Name *</label>
            <input {...register('name')} className="input-base" placeholder="e.g. 2025-26" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DatePickerField label="Start Date *" name="start_date" control={control} required />
            <DatePickerField label="End Date *"   name="end_date"   control={control} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <input {...register('description')} className="input-base" />
          </div>
          <label className="flex cursor-pointer select-none items-center gap-2">
            <input type="checkbox" {...register('is_current')} className="rounded" />
            <span className="text-sm font-medium">Set as Current Year</span>
          </label>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Academic Year" size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {remove.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }>
        <p className="text-sm text-muted-foreground">Delete <strong>{deleting?.name}</strong>? This action cannot be undone.</p>
      </AppModal>
    </div>
  );
}