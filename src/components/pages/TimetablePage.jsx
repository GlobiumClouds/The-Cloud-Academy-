'use client';
/**
 * TimetablePage — Weekly timetable grid view
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Grid3X3, Pencil, Trash2 } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import StatsCard from '@/components/common/StatsCard';
import { DUMMY_TIMETABLE } from '@/data/dummyData';

const DAYS   = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_OPTS = DAYS.map(d => ({ value: d.toLowerCase(), label: d }));
const PERIOD_OPTS = [1,2,3,4,5,6,7,8].map(n => ({ value: String(n), label: `Period ${n}` }));

const schema = z.object({
  day:       z.string().min(1, 'Required'),
  period:    z.string().min(1, 'Required'),
  subject:   z.string().min(1, 'Required'),
  teacher:   z.string().optional(),
  class_name:z.string().optional(),
  room:      z.string().optional(),
  start_time:z.string().optional(),
  end_time:  z.string().optional(),
});



export default function TimetablePage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const [classFilter, setClassFilter] = useState('');
  const [dayFilter,   setDayFilter]   = useState('');
  const [page,        setPage]        = useState(1);
  const [pageSize,    setPageSize]    = useState(10);
  const [modal,       setModal]       = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [deleting,    setDeleting]    = useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['timetable', type, page, pageSize, classFilter, dayFilter],
    queryFn: async () => {
      try { const { timetableService } = await import('@/services'); return await timetableService.getAll({ page, limit: pageSize, class_name:classFilter, day:dayFilter }); }
      catch {
        const d = DUMMY_TIMETABLE.filter(r => (!classFilter || r.class_name === classFilter) && (!dayFilter || r.day === dayFilter));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_TIMETABLE;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { timetableService } = await import('@/services'); return editing ? await timetableService.update(editing.id, vals) : await timetableService.create(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['timetable'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { timetableService } = await import('@/services'); return await timetableService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['timetable'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({}); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const columns = useMemo(() => [
    { accessorKey: 'day',        header: 'Day',     cell: ({ getValue }) => <span className="capitalize font-medium">{getValue()}</span> },
    { accessorKey: 'period',     header: 'Period',  cell: ({ getValue }) => `Period ${getValue()}` },
    { accessorKey: 'subject',    header: 'Subject', cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { accessorKey: 'teacher',    header: 'Teacher', cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'class_name', header: terms.primary_unit },
    { accessorKey: 'room',       header: 'Room',    cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'start_time', header: 'Time',    cell: ({ row: { original: r } }) => r.start_time && r.end_time ? `${r.start_time} – ${r.end_time}` : '—' },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('timetable.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('timetable.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo, terms.primary_unit]);

  const daySubjectCount = useMemo(() => {
    const counts = {};
    DAYS.forEach(d => { counts[d.toLowerCase()] = rows.filter(r => r.day === d.toLowerCase()).length; });
    return counts;
  }, [rows]);

  return (
    <div className="space-y-5">
      <PageHeader title="Timetable" description={`${total} slots configured`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Slots"      value={total}  icon={<Grid3X3 size={18} />} />
        <StatsCard label="Days Configured"  value={Object.values(daySubjectCount).filter(c => c > 0).length} icon={<Grid3X3 size={18} />} />
        <StatsCard label="Subjects / Day"   value={total ? Math.round(total / 5) : 0} icon={<Grid3X3 size={18} />} />
      </div>

      {/* Day filter chips */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setDayFilter('')} className={`rounded-full px-3 py-1 text-xs font-medium border ${!dayFilter ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent'}`}>All</button>
        {DAYS.map(d => (
          <button key={d} onClick={() => setDayFilter(d.toLowerCase())} className={`rounded-full px-3 py-1 text-xs font-medium border capitalize ${dayFilter === d.toLowerCase() ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent'}`}>{d}</button>
        ))}
      </div>

      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No timetable slots found"
        action={canDo('timetable.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> Add Slot</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'timetable' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? 'Edit Slot' : 'New Timetable Slot'} size="md"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="tt-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Add'}</button></>}>
        <form id="tt-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Day *"    name="day"    control={control} error={errors.day}    options={DAY_OPTS}    required />
            <SelectField label="Period *" name="period" control={control} error={errors.period} options={PERIOD_OPTS} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Subject *</label><input {...register('subject')} className="input-base" />{errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Teacher</label><input {...register('teacher')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">{terms.primary_unit}</label><input {...register('class_name')} className="input-base" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Room</label><input {...register('room')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Start Time</label><input type="time" {...register('start_time')} className="input-base" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">End Time</label><input type="time" {...register('end_time')} className="input-base" /></div>
          </div>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Slot" size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {remove.isPending ? 'Deleting\u2026' : 'Delete'}
            </button>
          </>
        }>
        <p className="text-sm text-muted-foreground">Delete <strong>{deleting?.subject}</strong> ({deleting?.day}, Period {deleting?.period})? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
