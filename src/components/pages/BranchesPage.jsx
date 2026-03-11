'use client';
/**
 * BranchesPage — school/coaching/academy → Branches | university/college → Campuses
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_BRANCHES } from '@/data/dummyData';

const STATUS_OPTS = [{ value:'active', label:'Active' }, { value:'inactive', label:'Inactive' }];

const schema = z.object({
  name:     z.string().min(2, 'Required'),
  address:  z.string().min(5, 'Required'),
  city:     z.string().optional(),
  phone:    z.string().optional(),
  head:     z.string().optional(),
  email:    z.string().email().optional().or(z.literal('')),
  capacity: z.coerce.number().optional(),
  status:   z.string().min(1, 'Required'),
});



export default function BranchesPage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const label  = type === 'university' || type === 'college' ? 'Campus'   : 'Branch';
  const labelP = type === 'university' || type === 'college' ? 'Campuses' : 'Branches';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting,setDeleting]= useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status:'active' } });

  const { data, isLoading } = useQuery({
    queryKey: ['branches', type, page, pageSize, search, status],
    queryFn: async () => {
      try { const { branchService } = await import('@/services'); return await branchService.getAll({ page, limit: pageSize, search, status }); }
      catch {
        const d = DUMMY_BRANCHES.filter(r => (!search || r.name.toLowerCase().includes(search.toLowerCase())) && (!status || r.status === status));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_BRANCHES;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { branchService } = await import('@/services'); return editing ? await branchService.update(editing.id, vals) : await branchService.create(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['branches'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { branchService } = await import('@/services'); return await branchService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['branches'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ status:'active' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const columns = useMemo(() => [
    { accessorKey: 'name', header: `${label} Name`, cell: ({ row: { original: r } }) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.city}</p></div> },
    { accessorKey: 'address', header: 'Address', cell: ({ getValue }) => <span className="text-sm">{getValue()}</span> },
    { accessorKey: 'phone',   header: 'Phone',   cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'head',    header: `${label} Head`, cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'students',header: 'Students', cell: ({ getValue }) => getValue() ?? 0 },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', getValue() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{getValue()}</span> },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('branch.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('branch.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo, label]);

  return (
    <div className="space-y-5">
      <PageHeader title={labelP} description={`${total} ${labelP.toLowerCase()}`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label={`Total ${labelP}`} value={total}                                       icon={<MapPin size={18} />} />
        <StatsCard label="Active"            value={rows.filter(r => r.status === 'active').length}   icon={<MapPin size={18} />} />
        <StatsCard label="Total Students"    value={rows.reduce((s, r) => s + (r.students ?? 0), 0)} icon={<MapPin size={18} />} />
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage={`No ${labelP.toLowerCase()} found`}
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder={`Search ${labelP.toLowerCase()}…`}
        filters={[{ name:'status', label:'Status', value:status, onChange:(v) => { setStatus(v); setPage(1); }, options:STATUS_OPTS }]}
        action={canDo('branch.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> New {label}</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'branches' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? `Edit ${label}` : `New ${label}`} size="lg"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="branch-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}</button></>}>
        <form id="branch-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">{label} Name *</label><input {...register('name')} className="input-base" />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">City</label><input {...register('city')} className="input-base" /></div>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Address *</label><input {...register('address')} className="input-base" />{errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Phone</label><input {...register('phone')} className="input-base" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Email</label><input type="email" {...register('email')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">{label} Head</label><input {...register('head')} className="input-base" /></div>
            <SelectField label="Status" name="status" control={control} error={errors.status} options={STATUS_OPTS} required />
          </div>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title={`Delete ${label}`} size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {remove.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }>
        <p className="text-sm text-muted-foreground">Delete <strong>{deleting?.name}</strong>? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
