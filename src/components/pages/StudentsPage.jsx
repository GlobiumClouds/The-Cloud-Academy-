/**
 * StudentsPage — Adaptive for all institute types
 *
 * School     → "Students"   | Class / Section filters
 * Coaching   → "Candidates" | Course / Batch filters
 * Academy    → "Trainees"   | Program / Batch filters
 * College    → "Students"   | Department / Semester filters
 * University → "Students"   | Faculty / Dept / Semester filters
 *
 * Uses shared DataTable component with @tanstack/react-table v8.
 */
'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';

import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import { studentService } from '@/services';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import { cn } from '@/lib/utils';
import { DUMMY_FLAT_STUDENTS } from '@/data/dummyData';

// Status badge color map
const STATUS_COLORS = {
  paid:    'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
  partial: 'bg-blue-100 text-blue-700',
};

// Type → primary unit filter key
const PRIMARY_KEY = {
  school: 'class_id', coaching: 'course_id', academy: 'program_id',
  college: 'department_id', university: 'faculty_id',
};
// Type → grouping unit filter key
const GROUP_KEY = {
  school: 'section_id', coaching: 'batch_id', academy: 'batch_id',
  college: 'semester_id', university: 'semester_id',
};

// Build react-table ColumnDef[] dynamically from studentColumns config
function buildColumns(studentColumns, type, terms, canDo, router, onDelete) {
  const cols = studentColumns.map((col) => ({
    accessorKey: col.key,
    header: col.label,
    cell: ({ row }) => <StudentCell student={row.original} columnKey={col.key} />,
    enableSorting: ['name', 'roll_number', 'cgpa'].includes(col.key),
  }));

  // Actions column
  cols.push({
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const stu = row.original;
      return (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => router.push(`/${type}/students/${stu.id}`)}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-accent"
            title="View"
          >
            <Eye size={13} /> View
          </button>
          {canDo('student.update') && (
            <button
              onClick={() => router.push(`/${type}/students/${stu.id}/edit`)}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-accent"
              title="Edit"
            >
              <Pencil size={13} /> Edit
            </button>
          )}
          {canDo('student.delete') && (
            <button
              onClick={() => onDelete(stu)}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
              title="Delete"
            >
              <Trash2 size={13} /> Delete
            </button>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  });

  return cols;
}

export default function StudentsPage({ type }) {
  const router  = useRouter();
  const qc      = useQueryClient();
  const canDo   = useAuthStore((s) => s.canDo);
  const { terms, studentColumns } = useInstituteConfig();

  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleting, setDeleting] = useState(null);

  const remove = useMutation({
    mutationFn: async (id) => {
      try { return await studentService.delete(id, type); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast && toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['students'] }); setDeleting(null); },
  });

  const filters = useMemo(() => ({
    page, limit: pageSize, search, is_active: status,
  }), [page, pageSize, search, status]);

  const { data, isLoading } = useQuery({
    queryKey: ['students', type, filters],
    queryFn:  async () => {
      try { return await studentService.getAll(filters, type); }
      catch {
        const d = DUMMY_FLAT_STUDENTS.filter(r =>
          (!filters.search || `${r.first_name} ${r.last_name}`.toLowerCase().includes(filters.search.toLowerCase()))
        );
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (prev) => prev,
  });

  const students   = data?.data?.rows       ?? DUMMY_FLAT_STUDENTS;
  const total      = data?.data?.total      ?? students.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const columns = useMemo(
    () => buildColumns(studentColumns, type, terms, canDo, router, setDeleting),
    [studentColumns, type, terms, canDo, router],
  );

  const statusOptions = [
    { value: 'true',  label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  const addButton = canDo('student.create') ? (
    <button
      onClick={() => router.push(`/${type}/students/add`)}
      className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
    >
      <Plus size={14} /> Add {terms.student}
    </button>
  ) : null;

  return (
    <div className="space-y-4">
      <PageHeader
        title={terms.students}
        description={`${total} ${total === 1 ? terms.student : terms.students} total`}
      />

      <DataTable
        columns={columns}
        data={students}
        loading={isLoading}
        emptyMessage={`No ${terms.students.toLowerCase()} found`}
        // Toolbar props
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={`Search ${terms.students.toLowerCase()}…`}
        filters={[
          {
            name: 'status',
            label: 'Status',
            value: status,
            onChange: (v) => { setStatus(v); setPage(1); },
            options: statusOptions,
          },
        ]}
        action={addButton}
        enableColumnVisibility
        exportConfig={{ fileName: `${type}-${terms.students.toLowerCase()}` }}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          total,
          pageSize,
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
      />

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Student" size="sm"
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

// ─────────────────────────────────────────────────────────────────────────────
// Cell renderer — per-column display logic
// ─────────────────────────────────────────────────────────────────────────────
function StudentCell({ student: s, columnKey }) {
  switch (columnKey) {
    case 'name':
      return (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {s.first_name?.[0]}{s.last_name?.[0]}
          </div>
          <div>
            <p className="font-medium leading-tight">{s.first_name} {s.last_name}</p>
            {s.email && <p className="text-xs text-muted-foreground">{s.email}</p>}
          </div>
        </div>
      );
    case 'roll_number':
      return <span className="font-mono text-xs">{s.roll_number || s.candidate_id || s.trainee_id || s.reg_number || '—'}</span>;
    case 'class_name':    return <span>{s.class?.name || '—'}</span>;
    case 'course_name':   return <span>{s.course?.name || '—'}</span>;
    case 'program_name':  return <span>{s.program?.name || '—'}</span>;
    case 'section_name':  return <span>{s.section?.name || '—'}</span>;
    case 'batch_name':    return <span>{s.batch?.name || '—'}</span>;
    case 'semester':      return <span>{s.semester?.name || (s.semester_number ? `Semester ${s.semester_number}` : '—')}</span>;
    case 'department':    return <span>{s.department?.name || '—'}</span>;
    case 'faculty':       return <span>{s.faculty?.name || '—'}</span>;
    case 'target_exam':   return <span>{s.target_exam || '—'}</span>;
    case 'module':        return <span>{s.current_module || '—'}</span>;
    case 'cgpa':          return <span className="font-mono">{s.cgpa ?? '—'}</span>;
    case 'fee_status':
      return s.fee_status ? (
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLORS[s.fee_status] ?? 'bg-gray-100 text-gray-700')}>
          {s.fee_status.charAt(0).toUpperCase() + s.fee_status.slice(1)}
        </span>
      ) : <span className="text-muted-foreground">—</span>;
    case 'guardian_name':
      return s.guardian_name ? (
        <div>
          <p className="text-xs">{s.guardian_name}</p>
          {s.guardian_phone && <p className="text-[10px] text-muted-foreground">{s.guardian_phone}</p>}
        </div>
      ) : <span className="text-muted-foreground">—</span>;
    case 'is_active':
      return (
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500')}>
          {s.is_active ? 'Active' : 'Inactive'}
        </span>
      );
    default:
      return <span className="text-sm">{s[columnKey] ?? '—'}</span>;
  }
}
