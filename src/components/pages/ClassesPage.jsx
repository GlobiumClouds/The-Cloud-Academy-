'use client';
/**
 * ClassesPage — Adaptive:
 * school → Classes | coaching → Courses | academy → Programs | college/uni → Departments/Courses
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import TableRowActions from '@/components/common/TableRowActions';
import SwitchField from '@/components/common/SwitchField';
import StatsCard from '@/components/common/StatsCard';
import InputField from '@/components/common/InputField';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { DUMMY_CLASSES } from '@/data/dummyData';

/* ── Constants ─────────────────────────────────────── */
const STATUS_OPTS   = [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }];
const MAX_PDF_MB    = 1;
const MAX_PDF_BYTES = MAX_PDF_MB * 1024 * 1024;

/* ── Zod Schemas ────────────────────────────────────── */
const materialSchema = z.object({
  name:   z.string().min(1, 'Required'),
  file:   z.any().optional(),
  active: z.boolean().default(true),
});

const courseSchema = z.object({
  name:      z.string().min(1, 'Required'),
  code:      z.string().min(1, 'Required'),
  active:    z.boolean().default(true),
  materials: z.array(materialSchema).optional(),
});

const sectionSchema = z.object({
  name:     z.string().min(1, 'Required'),
  room_no:  z.string().optional(),
  capacity: z.coerce.number().min(1, 'Min 1'),
  active:   z.boolean().default(true),
});

const schema = z.object({
  name:        z.string().min(1, 'Required'),
  teacher_id:  z.string().optional(),
  active:      z.boolean().default(true),
  description: z.string().optional(),
  sections:    z.array(sectionSchema).default([]),
  courses:     z.array(courseSchema).default([]),
});

/* ── Main Page ──────────────────────────────────────── */
export default function ClassesPage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();

  const label  = terms.primary_unit  ?? 'Class';
  const labelP = terms.primary_units ?? 'Classes';

  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [viewing,  setViewing]  = useState(null);   // ← separate view state
  const [deleting, setDeleting] = useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { active: true, sections: [], courses: [] },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['classes', type, page, pageSize, search, status],
    queryFn: async () => {
      try {
        const { classService } = await import('@/services');
        return await classService.getAll({ page, limit: pageSize, search, status });
      } catch {
        const d = DUMMY_CLASSES.filter(
          (r) =>
            (!search || r.name.toLowerCase().includes(search.toLowerCase())) &&
            (!status || r.status === status)
        );
        const slice = d.slice((page - 1) * pageSize, page * pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows       = data?.data?.rows       ?? DUMMY_CLASSES;
  const total      = data?.data?.total      ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try {
        const { classService } = await import('@/services');
        return editing ? await classService.update(editing.id, vals) : await classService.create(vals);
      } catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['classes'] }); closeModal(); },
    onError:   () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { classService } = await import('@/services'); return await classService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['classes'] }); setDeleting(null); },
    onError:   () => toast.error('Delete failed'),
  });

  const openAdd    = () => { setEditing(null);  reset({ active: true, sections: [], courses: [] }); setModal(true); };
  const openEdit   = (row) => { setEditing(row); reset({ ...row, active: row.active ?? row.status === 'active' }); setModal(true); };
  const openView   = (row) => setViewing(row);    // ← read-only view
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: `${label} Name`,
      cell: ({ getValue }) => <span className="font-semibold">{getValue()}</span>,
    },
    {
      accessorKey: 'sections',
      header: type === 'school' ? 'Sections' : 'Batches',
      cell: ({ row }) => {
        const sections = row.original.sections;
        if (Array.isArray(sections)) {
          return (
            <span className="text-sm font-medium">
              {sections.length} {sections.length === 1 ? 'section' : 'sections'}
            </span>
          );
        }
        // legacy numeric value from API
        const count = typeof sections === 'number' ? sections : 0;
        return <span className="text-sm">{count}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.active != null
          ? row.original.active === true
          : row.original.status === 'active';
        return (
          <span className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium',
            isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          )}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <TableRowActions
            onView={() => openView(row.original)}
            onEdit={() => openEdit(row.original)}
            onDelete={() => setDeleting(row.original)}
          />
        </div>
      ),
    },
  ], [canDo, label, type]);


  return (
    <div className="space-y-5">
      <PageHeader title={labelP} description={`${total} ${labelP.toLowerCase()} total`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label={`Total ${labelP}`} value={total}                                          icon={<BookOpen size={18} />} />
        <StatsCard label="Active"            value={rows.filter((r) => r.status === 'active').length}   icon={<BookOpen size={18} />} />
        <StatsCard label="Inactive"          value={rows.filter((r) => r.status === 'inactive').length} icon={<BookOpen size={18} />} />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyMessage={`No ${labelP.toLowerCase()} found`}
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={`Search ${labelP.toLowerCase()}…`}
        filters={[{ name: 'status', label: 'Status', value: status, onChange: (v) => { setStatus(v); setPage(1); }, options: STATUS_OPTS }]}
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus size={14} /> New {label}
          </button>
        }
        enableColumnVisibility
        exportConfig={{ fileName: 'classes' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
      />

      {/* ── Create / Edit Modal ── */}
      <AppModal
        open={modal}
        onClose={closeModal}
        title={editing ? `Edit ${label}` : `New ${label}`}
        size="xl"
        footer={
          <>
            <button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
              Cancel
            </button>
            <button
              type="submit"
              form="class-form"
              disabled={save.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {save.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form id="class-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label={`${label} Name`}
              name="name"
              register={register}
              error={errors.name}
              placeholder={`e.g. ${label} 9`}
              required
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <input {...register('description')} className="input-base" placeholder="Optional description" />
            </div>
          </div>

          {/* Class Active Switch with live label */}
          <ActiveSwitch name="active" control={control} />

          {/* Sections */}
          <div className="border-t pt-4">
            <ClassSectionsForm control={control} register={register} errors={errors} />
          </div>

          {/* Courses */}
          <div className="border-t pt-4">
            <ClassCoursesForm control={control} register={register} errors={errors} />
          </div>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Delete ${label}`}
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button
              onClick={() => remove.mutate(deleting.id)}
              disabled={remove.isPending}
              className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {remove.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">Delete <strong>{deleting?.name}</strong>? This cannot be undone.</p>
      </AppModal>

      {/* ── View Modal (read-only) ── */}
      <AppModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={`View ${label}`}
        size="xl"
        footer={
          <>
            <button onClick={() => setViewing(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Close</button>
            {canDo('class.update') && (
              <button
                onClick={() => { setViewing(null); openEdit(viewing); }}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Edit
              </button>
            )}
          </>
        }
      >
        {viewing && <ClassViewDetails row={viewing} label={label} />}
      </AppModal>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   Sections Sub-form
   Fields: Section Name | Room No. | Capacity | Active toggle
────────────────────────────────────────────────────── */
function ClassSectionsForm({ control, register, errors }) {
  const { fields, append, remove } = useFieldArray({ control, name: 'sections' });

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Sections</h3>
        <button
          type="button"
          onClick={() => append({ name: '', room_no: '', capacity: 30, active: true })}
          className="flex items-center gap-1 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2 py-1.5 rounded-md"
        >
          <Plus size={12} /> Add Section
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground">No sections added. Click &quot;Add Section&quot; to begin.</p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="bg-accent/20 border rounded-lg p-3 space-y-3">
            {/* Header row */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Section {index + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1 text-destructive hover:bg-destructive/10 rounded"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Section Name *</label>
                <input
                  {...register(`sections.${index}.name`)}
                  className="input-base !py-1.5 text-sm"
                  placeholder="e.g. A, North, Morning"
                />
                {errors?.sections?.[index]?.name && (
                  <p className="text-xs text-destructive">{errors.sections[index].name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Room No.</label>
                <input
                  {...register(`sections.${index}.room_no`)}
                  className="input-base !py-1.5 text-sm"
                  placeholder="e.g. 101, Lab-3"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Capacity *</label>
                <input
                  type="number"
                  {...register(`sections.${index}.capacity`)}
                  className="input-base !py-1.5 text-sm"
                  placeholder="e.g. 40"
                />
                {errors?.sections?.[index]?.capacity && (
                  <p className="text-xs text-destructive">{errors.sections[index].capacity.message}</p>
                )}
              </div>
            </div>

            {/* Active switch */}
            <ActiveSwitch name={`sections.${index}.active`} control={control} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   Course Materials Sub-form (nested inside each Course)
   PDF max 1 MB validation
────────────────────────────────────────────────────── */
function CourseMaterialsForm({ nestIndex, control, register, errors }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `courses.${nestIndex}.materials`,
  });

  return (
    <div className="mt-3 border-t pt-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <BookOpen size={12} /> Course Materials
          <span className="text-[10px] opacity-70">(PDF · max {MAX_PDF_MB}MB each)</span>
        </h4>
        <button
          type="button"
          onClick={() => append({ name: '', active: true })}
          className="flex items-center gap-1 text-[10px] bg-secondary hover:bg-secondary/80 px-2 py-1 rounded-md"
        >
          <Plus size={10} /> Add Material
        </button>
      </div>

      <div className="space-y-2">
        {fields.length === 0 && (
          <p className="text-[11px] text-muted-foreground italic">No materials added yet.</p>
        )}
        {fields.map((field, mIndex) => (
          <div key={field.id} className="bg-background border rounded-md p-2 space-y-2">
            {/* Name + Delete */}
            <div className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                <input
                  {...register(`courses.${nestIndex}.materials.${mIndex}.name`)}
                  className="input-base !py-1 text-xs"
                  placeholder="Material Name (e.g. Chapter 1 Notes)"
                />
                {errors?.courses?.[nestIndex]?.materials?.[mIndex]?.name && (
                  <p className="text-[10px] text-destructive">
                    {errors.courses[nestIndex].materials[mIndex].name.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(mIndex)}
                className="text-destructive hover:bg-destructive/10 p-1.5 rounded mt-0.5"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* File upload + Active switch */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <div className="flex-1 space-y-1">
                <input
                  type="file"
                  accept=".pdf"
                  {...register(`courses.${nestIndex}.materials.${mIndex}.file`, {
                    validate: (files) => {
                      if (!files?.[0]) return true;
                      return files[0].size <= MAX_PDF_BYTES || `Max file size is ${MAX_PDF_MB}MB`;
                    },
                  })}
                  className="block w-full text-xs text-slate-500
                    file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0
                    file:text-xs file:font-semibold file:bg-primary/10 file:text-primary
                    hover:file:bg-primary/20 cursor-pointer"
                />
                {errors?.courses?.[nestIndex]?.materials?.[mIndex]?.file && (
                  <p className="text-[10px] text-destructive mt-0.5">
                    {errors.courses[nestIndex].materials[mIndex].file.message}
                  </p>
                )}
              </div>
              <div className="shrink-0">
                <ActiveSwitch
                  name={`courses.${nestIndex}.materials.${mIndex}.active`}
                  control={control}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   Courses Sub-form
────────────────────────────────────────────────────── */
function ClassCoursesForm({ control, register, errors }) {
  const { fields, append, remove } = useFieldArray({ control, name: 'courses' });

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Courses / Subjects</h3>
        <button
          type="button"
          onClick={() => append({ name: '', code: '', active: true, materials: [] })}
          className="flex items-center gap-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md"
        >
          <Plus size={12} /> Add Course
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground">No courses mapped to this class yet.</p>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="border p-3 rounded-lg bg-accent/10 relative shadow-sm">
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute top-2 right-2 p-1 text-destructive hover:bg-destructive/10 rounded-md"
            >
              <Trash2 size={16} />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8 mb-3">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground uppercase">Course Name *</label>
                <input
                  {...register(`courses.${index}.name`)}
                  className="input-base !py-1.5 text-sm"
                  placeholder="e.g. Mathematics"
                />
                {errors?.courses?.[index]?.name && (
                  <p className="text-xs text-destructive">{errors.courses[index].name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground uppercase">Course Code *</label>
                <input
                  {...register(`courses.${index}.code`)}
                  className="input-base !py-1.5 text-sm"
                  placeholder="e.g. MTH-101"
                />
                {errors?.courses?.[index]?.code && (
                  <p className="text-xs text-destructive">{errors.courses[index].code.message}</p>
                )}
              </div>
            </div>

            {/* Course Active switch */}
            <ActiveSwitch name={`courses.${index}.active`} control={control} />

            {/* Nested Materials */}
            <CourseMaterialsForm
              nestIndex={index}
              control={control}
              register={register}
              errors={errors}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   ActiveSwitch — SwitchField with live Active/Inactive label
────────────────────────────────────────────────────── */

function ActiveSwitch({ name, control }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <span className="text-sm font-medium">Status</span>
            <p className={cn('text-xs font-semibold mt-0.5', field.value ? 'text-emerald-600' : 'text-red-500')}>
              {field.value ? 'Active' : 'Inactive'}
            </p>
          </div>
          <Switch
            id={name}
            checked={!!field.value}
            onCheckedChange={field.onChange}
          />
        </div>
      )}
    />
  );
}

/* ──────────────────────────────────────────────────────
   ClassViewDetails — read-only summary shown in View modal
────────────────────────────────────────────────────── */
function ClassViewDetails({ row, label }) {
  const isActive = row.active != null ? row.active : row.status === 'active';
  return (
    <div className="space-y-5">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase">{label} Name</p>
          <p className="text-sm font-semibold">{row.name || '—'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase">Description</p>
          <p className="text-sm">{row.description || '—'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase">Status</p>
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium',
            isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Sections */}
      {Array.isArray(row.sections) && row.sections.length > 0 && (
        <div className="border-t pt-4 space-y-2">
          <h3 className="text-sm font-semibold">Sections</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {row.sections.map((s, i) => (
              <div key={i} className="bg-accent/20 border rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{s.name}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium',
                    (s.active ?? s.status === 'active') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                    {(s.active ?? s.status === 'active') ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {s.room_no  && <span>Room: <strong>{s.room_no}</strong></span>}
                  {s.capacity && <span>Capacity: <strong>{s.capacity}</strong></span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courses */}
      {Array.isArray(row.courses) && row.courses.length > 0 && (
        <div className="border-t pt-4 space-y-3">
          <h3 className="text-sm font-semibold">Courses / Subjects</h3>
          <div className="space-y-3">
            {row.courses.map((c, i) => (
              <div key={i} className="border rounded-lg p-3 bg-accent/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{c.name}</span>
                    {c.code && (
                      <span className="text-xs bg-secondary px-1.5 py-0.5 rounded font-mono">{c.code}</span>
                    )}
                  </div>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium',
                    (c.active ?? c.status === 'active') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                    {(c.active ?? c.status === 'active') ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {Array.isArray(c.materials) && c.materials.length > 0 && (
                  <div className="border-t pt-2 space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">Materials</p>
                    {c.materials.map((m, mi) => (
                      <div key={mi} className="flex items-center gap-2 text-xs">
                        <span className="font-medium">{m.name}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium',
                          (m.active ?? m.status === 'active') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                          {(m.active ?? m.status === 'active') ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
