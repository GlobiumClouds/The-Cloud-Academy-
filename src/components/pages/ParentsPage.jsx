'use client';
/**
 * ParentsPage — Parent/Guardian management
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, UserCheck } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_PARENTS } from '@/data/dummyData';

const RELATION_OPTS = [{ value:'father', label:'Father' }, { value:'mother', label:'Mother' }, { value:'guardian', label:'Guardian' }, { value:'other', label:'Other' }];
const STATUS_OPTS   = [{ value:'active', label:'Active' }, { value:'inactive', label:'Inactive' }];

const schema = z.object({
  first_name:  z.string().min(2, 'Required'),
  last_name:   z.string().min(2, 'Required'),
  email:       z.string().email().optional().or(z.literal('')),
  phone:       z.string().min(10, 'Required'),
  relation:    z.string().min(1, 'Required'),
  cnic:        z.string().optional(),
  occupation:  z.string().optional(),
  address:     z.string().optional(),
  status:      z.string().min(1, 'Required'),
});



export default function ParentsPage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting,setDeleting]= useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status:'active', relation:'father' } });

  const { data, isLoading } = useQuery({
    queryKey: ['parents', type, page, pageSize, search, status],
    queryFn: async () => {
      try { const { parentService } = await import('@/services'); return await parentService.getAll({ page, limit: pageSize, search, status }); }
      catch {
        const d = DUMMY_PARENTS.filter(r => (!search || `${r.first_name} ${r.last_name}`.toLowerCase().includes(search.toLowerCase())) && (!status || r.status === status));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_PARENTS;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { parentService } = await import('@/services'); return editing ? await parentService.update(editing.id, vals) : await parentService.create(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['parents'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { parentService } = await import('@/services'); return await parentService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['parents'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ status:'active', relation:'father' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Parent/Guardian', cell: ({ row: { original: r } }) => <div><p className="font-medium">{r.first_name} {r.last_name}</p><p className="text-xs text-muted-foreground">{r.email || r.phone}</p></div> },
    { accessorKey: 'phone',    header: 'Phone',    cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'relation', header: 'Relation', cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
    { accessorKey: 'children', header: `${terms.students}`, cell: ({ getValue }) => getValue() ?? 0 },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', getValue() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{getValue()}</span> },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('parent.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('parent.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo, terms]);

  return (
    <div className="space-y-5">
      <PageHeader title="Parents & Guardians" description={`${total} registered`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Parents"  value={total}                                         icon={<UserCheck size={18} />} />
        <StatsCard label="Active"         value={rows.filter(r => r.status === 'active').length}    icon={<UserCheck size={18} />} />
        <StatsCard label="Linked Students"value={rows.reduce((s, r) => s + (r.children ?? 0), 0)}  icon={<UserCheck size={18} />} />
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No parents found"
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search parents…"
        filters={[{ name:'status', label:'Status', value:status, onChange:(v) => { setStatus(v); setPage(1); }, options:STATUS_OPTS }]}
        action={canDo('parent.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> Add Parent</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'parents' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? 'Edit Parent' : 'New Parent'} size="lg"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="parent-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Add'}</button></>}>
        <form id="parent-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">First Name *</label><input {...register('first_name')} className="input-base" />{errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Last Name *</label><input {...register('last_name')} className="input-base" />{errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Phone *</label><input {...register('phone')} className="input-base" />{errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Email</label><input type="email" {...register('email')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">CNIC</label><input {...register('cnic')} className="input-base" placeholder="XXXXX-XXXXXXX-X" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Occupation</label><input {...register('occupation')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Relation *" name="relation" control={control} error={errors.relation} options={RELATION_OPTS} required />
            <SelectField label="Status *"   name="status"   control={control} error={errors.status}   options={STATUS_OPTS}   required />
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Address</label><input {...register('address')} className="input-base" /></div>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Parent" size="sm"
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
