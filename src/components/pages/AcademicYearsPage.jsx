<<<<<<< HEAD
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
=======
// ── AcademicYearsPage Component ─────────────────────────────────────────────────
// src/components/pages/AcademicYearsPage.jsx

'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  CalendarDays, 
  CheckCircle, 
  XCircle,
  MoreHorizontal,
  Copy,
  Power,
  Star
} from 'lucide-react';

import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import { academicYearService } from '@/services/academicYearService';

// Reusable Components
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatsCard from '@/components/common/StatsCard';
import TableRowActions from '@/components/common/TableRowActions';
import ErrorAlert from '@/components/common/ErrorAlert';
import PageLoader from '@/components/common/PageLoader';
import AcademicYearForm from '@/components/forms/AcademicYearForm';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AcademicYearsPage({ type }) {
  const queryClient = useQueryClient();
  const { canDo } = useAuthStore();
  const { currentInstitute } = useInstituteStore();
  const { terms } = useInstituteConfig();
  
  // Local state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [statusDialog, setStatusDialog] = useState(null);
  const [currentDialog, setCurrentDialog] = useState(null);

  // Fetch academic years
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['academic-years', currentInstitute?.id, page, pageSize, search],
    queryFn: () => academicYearService.getAll({
      institute_id: currentInstitute?.id,
      page,
      limit: pageSize,
      search: search || undefined,
      sortBy: 'start_date',
      sortOrder: 'DESC'
    }),
    enabled: !!currentInstitute?.id,
  });

  // Derive current year from main data
  const currentYear = useMemo(() => {
    const found = data?.data?.find(y => y.is_current);
    return found ? { data: found } : null;
  }, [data]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => academicYearService.create({
      ...data,
      institute_id: currentInstitute?.id
    }),
    onSuccess: () => {
      toast.success(`${terms?.academic_year || 'Academic year'} created successfully`);
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      setModalOpen(false);
      setEditingYear(null);
    },
    onError: (error) => {
      toast.error(error.message || `Failed to create ${terms?.academic_year?.toLowerCase() || 'academic year'}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => academicYearService.update(id, data),
    onSuccess: () => {
      toast.success(`${terms?.academic_year || 'Academic year'} updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      setModalOpen(false);
      setEditingYear(null);
    },
    onError: (error) => {
      toast.error(error.message || `Failed to update ${terms?.academic_year?.toLowerCase() || 'academic year'}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => academicYearService.delete(id, currentInstitute?.id),
    onSuccess: () => {
      toast.success(`${terms?.academic_year || 'Academic year'} deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      setDeleteDialog(null);
    },
    onError: (error) => {
      toast.error(error.message || `Failed to delete ${terms?.academic_year?.toLowerCase() || 'academic year'}`);
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => academicYearService.toggleActive(id, isActive),
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      setStatusDialog(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  // Set current mutation
  const setCurrentMutation = useMutation({
    mutationFn: (id) => academicYearService.setCurrent(id, currentInstitute?.id),
    onSuccess: () => {
      toast.success(`Current ${terms?.academic_year?.toLowerCase() || 'academic year'} updated`);
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      queryClient.invalidateQueries({ queryKey: ['current-academic-year'] });
      setCurrentDialog(null);
    },
    onError: (error) => {
      toast.error(error.message || `Failed to set current ${terms?.academic_year?.toLowerCase() || 'year'}`);
    },
  });

  // Handle form submit
  const handleSubmit = (formData) => {
    if (editingYear && !editingYear.isCopy) {
      updateMutation.mutate({ id: editingYear.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Handle set as current
  const handleSetCurrent = (year) => {
    if (year.is_current) {
      toast.info(`This is already the current ${terms?.academic_year?.toLowerCase() || 'year'}`);
      return;
    }
    setCurrentDialog(year);
  };

  // Handle toggle active
  const handleToggleActive = (year) => {
    setStatusDialog(year);
  };

  // Handle copy year
  const handleCopyYear = (year) => {
    // Create a new year based on existing one
    const startDate = new Date(year.start_date);
    const endDate = new Date(year.end_date);
    
    const newYear = {
      name: `${parseInt(year.name.split('-')[0]) + 1}-${parseInt(year.name.split('-')[1]) + 1}`,
      start_date: new Date(startDate.setFullYear(startDate.getFullYear() + 1)).toISOString().split('T')[0],
      end_date: new Date(endDate.setFullYear(endDate.getFullYear() + 1)).toISOString().split('T')[0],
      description: `Copy of ${year.name}`,
      is_current: false
    };
    
    setEditingYear({ ...newYear, isCopy: true });
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (year) => {
    setEditingYear(year);
    setModalOpen(true);
  };

  // Open add modal
  const openAddModal = () => {
    setEditingYear(null);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditingYear(null);
  };

  // Table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: terms?.academic_year || 'Year',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {row.original.is_current && (
            <Badge variant="default" className="bg-green-500">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Current
            </Badge>
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
          )}
        </div>
      ),
    },
<<<<<<< HEAD
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
=======
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ getValue }) => {
        const date = getValue();
        return date ? new Date(date).toLocaleDateString('en-PK', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : '—';
      },
    },
    {
      accessorKey: 'end_date',
      header: 'End Date',
      cell: ({ getValue }) => {
        const date = getValue();
        return date ? new Date(date).toLocaleDateString('en-PK', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : '—';
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => getValue() || '—',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'secondary'}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const year = row.original;
        const canUpdate = canDo('academic_years.update');
        const canDelete = canDo('academic_years.delete');
        
        const extraActions = [];
        
        if (canUpdate) {
          if (!year.is_current) {
            extraActions.push({
              label: 'Set as Current',
              icon: <Star className="h-4 w-4" />,
              onClick: () => handleSetCurrent(year)
            });
          }
          
          extraActions.push({
            label: 'Copy Year',
            icon: <Copy className="h-4 w-4" />,
            onClick: () => handleCopyYear(year)
          });
          
          extraActions.push({
            label: year.is_active ? 'Deactivate' : 'Activate',
            icon: <Power className="h-4 w-4" />,
            onClick: () => handleToggleActive(year),
            variant: year.is_active ? 'destructive' : 'default'
          });
        }
        
        return (
          <TableRowActions
            onView={() => openEditModal(year)}
            onEdit={canUpdate ? () => openEditModal(year) : undefined}
            onDelete={canDelete && !year.is_current ? () => setDeleteDialog(year) : undefined}
            extra={extraActions}
          />
        );
      },
    },
  ], [canDo, terms]);

  // Stats data
  const stats = useMemo(() => {
    const rows = data?.data || [];
    return {
      total: data?.pagination?.total || 0,
      current: rows.find(y => y.is_current)?.name || 'Not set',
      active: rows.filter(y => y.is_active).length,
      inactive: rows.filter(y => !y.is_active).length,
    };
  }, [data]);

  // Page title based on type and config
  const pageTitle = terms?.academic_years || 'Academic Years';

  // Check if user has permission
  const canCreate = canDo('academic_years.create');

  // Loading state
  if (isLoading && !data) {
    return <PageLoader message={`Loading ${pageTitle.toLowerCase()}...`} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader 
        title={pageTitle}
        description={`Manage ${pageTitle.toLowerCase()} for your institute`}
        action={
          canCreate && (
            <Button onClick={openAddModal} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add {terms?.academic_year || 'Year'}
            </Button>
          )
        }
      />

      {/* Error Alert */}
      <ErrorAlert message={error?.message} />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label={`Total ${pageTitle}`}
          value={stats.total}
          icon={<CalendarDays className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          label={`Current ${terms?.academic_year || 'Year'}`}
          value={stats.current}
          icon={<Star className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          label="Active"
          value={stats.active}
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          loading={isLoading}
        />
        <StatsCard
          label="Inactive"
          value={stats.inactive}
          icon={<XCircle className="h-4 w-4 text-gray-500" />}
          loading={isLoading}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        search={search}
        onSearch={setSearch}
        searchPlaceholder={`Search ${pageTitle.toLowerCase()}...`}
        enableColumnVisibility
        exportConfig={{
          fileName: pageTitle.toLowerCase().replace(/\s+/g, '-'),
          dateField: 'created_at'
        }}
        pagination={{
          page,
          totalPages: data?.pagination?.totalPages || 1,
          onPageChange: setPage,
          total: data?.pagination?.total || 0,
          pageSize,
          onPageSizeChange: setPageSize,
        }}
        emptyMessage={`No ${pageTitle.toLowerCase()} found`}
      />

      {/* Add/Edit Modal */}
      <AppModal
        open={modalOpen}
        onClose={closeModal}
        title={
          editingYear 
            ? (editingYear.isCopy 
                ? `Copy ${terms?.academic_year || 'Year'}` 
                : `Edit ${terms?.academic_year || 'Year'}`) 
            : `Add ${terms?.academic_year || 'Year'}`
        }
        size="lg"
        description={
          editingYear?.isCopy 
            ? `Create a new ${terms?.academic_year?.toLowerCase() || 'year'} based on ${editingYear.name}`
            : undefined
        }
      >
        <AcademicYearForm
          defaultValues={editingYear || {}}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          loading={createMutation.isPending || updateMutation.isPending}
          instituteId={currentInstitute?.id}
          isEdit={!!editingYear && !editingYear.isCopy}
        />
      </AppModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={() => deleteMutation.mutate(deleteDialog.id)}
        loading={deleteMutation.isPending}
        title={`Delete ${terms?.academic_year || 'Year'}`}
        description={
          <>
            Are you sure you want to delete <strong>{deleteDialog?.name}</strong>? 
            This action cannot be undone. All associated classes and records will be affected.
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Toggle Status Confirmation */}
      <ConfirmDialog
        open={!!statusDialog}
        onClose={() => setStatusDialog(null)}
        onConfirm={() => toggleStatusMutation.mutate({
          id: statusDialog.id,
          isActive: !statusDialog.is_active
        })}
        loading={toggleStatusMutation.isPending}
        title={statusDialog?.is_active ? 'Deactivate Year' : 'Activate Year'}
        description={
          <div>
            <p>
              Are you sure you want to {statusDialog?.is_active ? 'deactivate' : 'activate'} {' '}
              <strong>{statusDialog?.name}</strong>?
            </p>
            {statusDialog?.is_current && statusDialog?.is_active && (
              <p className="mt-2 text-yellow-600">
                Note: This is the current {terms?.academic_year?.toLowerCase() || 'year'}. 
                Deactivating it may affect ongoing processes.
              </p>
            )}
          </div>
        }
        confirmLabel={statusDialog?.is_active ? 'Deactivate' : 'Activate'}
        variant={statusDialog?.is_active ? 'destructive' : 'default'}
      />

      {/* Set Current Confirmation */}
      <ConfirmDialog
        open={!!currentDialog}
        onClose={() => setCurrentDialog(null)}
        onConfirm={() => setCurrentMutation.mutate(currentDialog.id)}
        loading={setCurrentMutation.isPending}
        title={`Set as Current ${terms?.academic_year || 'Year'}`}
        description={
          <div>
            <p>
              Set <strong>{currentDialog?.name}</strong> as the current {terms?.academic_year?.toLowerCase() || 'year'}?
            </p>
            {currentYear?.data && (
              <p className="mt-2 text-yellow-600">
                This will replace <strong>{currentYear.data.name}</strong> as the current year.
              </p>
            )}
          </div>
        }
        confirmLabel="Set as Current"
        variant="default"
      />
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
    </div>
  );
}