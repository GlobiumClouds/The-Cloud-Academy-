'use client';
/**
 * FeeTemplatesPage — Fee structure templates
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, LayoutTemplate } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_FEE_TEMPLATES } from '@/data/dummyData';

const STATUS_OPTS = [{ value:'active', label:'Active' }, { value:'inactive', label:'Inactive' }];
const FREQ_OPTS   = [{ value:'monthly', label:'Monthly' }, { value:'quarterly', label:'Quarterly' }, { value:'annually', label:'Annually' }, { value:'once', label:'One-Time' }];

const schema = z.object({
  name:        z.string().min(2, 'Required'),
  class_name:  z.string().optional(),
  total_amount:z.coerce.number().min(1, 'Required'),
  frequency:   z.string().min(1, 'Required'),
  components:  z.string().optional(),
  status:      z.string().min(1, 'Required'),
});



export default function FeeTemplatesPage({ type }) {
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

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status:'active', frequency:'monthly' } });

  const { data, isLoading } = useQuery({
    queryKey: ['fee-templates', type, page, pageSize, search, status],
    queryFn: async () => {
      try { const { feeTemplateService } = await import('@/services'); return await feeTemplateService.getAll({ page, limit: pageSize, search, status }); }
      catch {
        const d = DUMMY_FEE_TEMPLATES.filter(r => (!search || r.name.toLowerCase().includes(search.toLowerCase())) && (!status || r.status === status));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_FEE_TEMPLATES;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { feeTemplateService } = await import('@/services'); return editing ? await feeTemplateService.update(editing.id, vals) : await feeTemplateService.create(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['fee-templates'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { feeTemplateService } = await import('@/services'); return await feeTemplateService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['fee-templates'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ status:'active', frequency:'monthly' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const columns = useMemo(() => [
    { accessorKey: 'name',         header: 'Template Name', cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { accessorKey: 'class_name',   header: terms.primary_unit, cell: ({ getValue }) => getValue() || 'All' },
    { accessorKey: 'total_amount', header: 'Amount',    cell: ({ getValue }) => `PKR ${(getValue() ?? 0).toLocaleString()}` },
    { accessorKey: 'frequency',    header: 'Frequency', cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
    { accessorKey: 'components',   header: 'Components', cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{getValue()}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', getValue() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{getValue()}</span> },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('feeTemplate.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('feeTemplate.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo, terms.primary_unit]);

  return (
    <div className="space-y-5">
      <PageHeader title="Fee Templates" description={`${total} templates`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Templates" value={total}                                         icon={<LayoutTemplate size={18} />} />
        <StatsCard label="Active"          value={rows.filter(r => r.status === 'active').length}   icon={<LayoutTemplate size={18} />} />
        <StatsCard label="Inactive"        value={rows.filter(r => r.status === 'inactive').length} icon={<LayoutTemplate size={18} />} />
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No templates found"
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search templates…"
        filters={[{ name:'status', label:'Status', value:status, onChange:(v) => { setStatus(v); setPage(1); }, options:STATUS_OPTS }]}
        action={canDo('feeTemplate.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> New Template</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'fee-templates' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? 'Edit Template' : 'New Fee Template'} size="md"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="ft-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}</button></>}>
        <form id="ft-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">Template Name *</label><input {...register('name')} className="input-base" />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">{terms.primary_unit}</label><input {...register('class_name')} className="input-base" placeholder="Leave blank for all" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Total Amount *</label><input type="number" {...register('total_amount')} className="input-base" />{errors.total_amount && <p className="text-xs text-destructive">{errors.total_amount.message}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Frequency" name="frequency" control={control} error={errors.frequency} options={FREQ_OPTS} required />
            <SelectField label="Status"    name="status"    control={control} error={errors.status}    options={STATUS_OPTS} required />
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Components (e.g. Tuition:4000,Lab:500)</label><textarea {...register('components')} rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Fee Template" size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {remove.isPending ? 'Deleting\u2026' : 'Delete'}
            </button>
          </>
        }>
        <p className="text-sm text-muted-foreground">Delete <strong>{deleting?.name}</strong>? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
