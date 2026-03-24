'use client';

/**
 * School Students Page
 *
 * CRUD fully integrated with backend:
 *   GET    /api/v1/students          → list
 *   POST   /api/v1/students          → create
 *   PUT    /api/v1/students/:id      → update (via Edit Modal)
 *   DELETE /api/v1/students/:id      → delete
 *   PATCH  /api/v1/students/:id/toggle-status → active ↔ inactive
 */

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Eye } from 'lucide-react';
import { toast } from 'sonner';

import { studentService, classService, academicYearService } from '@/services';
import useAuthStore from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { PERMISSIONS } from '@/constants';
import {
  PageHeader,
  DataTable,
  AvatarWithInitials,
  StatusBadge,
  TableRowActions,
  ConfirmDialog,
  AppModal,
} from '@/components/common';
import { StudentForm } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── helpers ──────────────────────────────────────────────────────────────────
const extractRows = (d) => {
  if (Array.isArray(d))       return d;
  if (Array.isArray(d?.data)) return d.data;
  return d?.data?.students ?? d?.data?.rows ?? d?.students ?? d?.rows ?? [];
};
const extractPages = (d) => {
  if (Array.isArray(d) || Array.isArray(d?.data)) return 1;
  return d?.data?.totalPages ?? d?.totalPages ?? d?.data?.pagination?.totalPages ?? 1;
};
const extractTotal = (d, rows) =>
  d?.data?.total ?? d?.data?.count ?? d?.total ?? rows.length;

// ─── Table Columns ────────────────────────────────────────────────────────────
const buildColumns = (
  { onView, onEdit, onDelete, onToggle, canUpdate, canDelete, classOptions }
) => [
  {
    id: 'student',
    header: 'Student',
    cell: ({ row }) => {
      const s = row.original;
      const rollNo =
        s.roll_number || s.registration_no || s.gr_number ||
        s.details?.studentDetails?.roll_no || '—';
      return (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onView(s)}>
          <AvatarWithInitials
            src={s.photo_url || s.profile_image}
            firstName={s.first_name}
            lastName={s.last_name}
            size="sm"
          />
          <div>
            <p className="font-medium text-sm leading-tight">
              {s.first_name} {s.last_name}
            </p>
            <p className="text-xs text-muted-foreground font-mono">{rollNo}</p>
          </div>
        </div>
      );
    },
  },
  {
    id: 'class',
    header: 'Class / Section',
    cell: ({ row }) => {
      const s = row.original;
      const classId   = s.class_id   || s.details?.studentDetails?.class_id;
      const sectionId = s.section_id || s.details?.studentDetails?.section_id;

      let className   = s.class?.name   || s.class_name;
      let sectionName = s.section?.name || s.section_name;

      if (!className && classId && classOptions?.length) {
        const cls = classOptions.find(c => c.value === classId);
        if (cls) {
          className = cls.label;
          if (!sectionName && sectionId && cls.sections?.length) {
            const sec = cls.sections.find(x => x.id === sectionId);
            if (sec) sectionName = sec.name;
          }
        }
      }
      return (
        <span className="text-sm">
          {className ?? '—'}{sectionName ? ` / ${sectionName}` : ''}
        </span>
      );
    },
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ getValue }) => (
      <Badge variant="outline" className="capitalize text-xs">
        {getValue() || '—'}
      </Badge>
    ),
  },
  {
    id: 'guardian_phone',
    header: 'Guardian Phone',
    cell: ({ row }) => {
      const s = row.original;
      const phone = s.guardian_phone || s.parent?.phone || s.details?.studentDetails?.guardian_phone || s.details?.studentDetails?.father_phone;
      return <span className="text-sm text-muted-foreground">{phone || '—'}</span>;
    },
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ getValue }) => (
      <StatusBadge status={getValue() !== false ? 'active' : 'inactive'} />
    ),
  },
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    cell: ({ row }) => {
      const s = row.original;

      const extra = [];
      if (canUpdate) {
        extra.push({
          label: s.is_active ? 'Deactivate' : 'Activate',
          onClick: () => onToggle(s.id),
        });
      }

      return (
        <TableRowActions
          onView={() => onView(s)}
          onEdit={canUpdate ? () => onEdit(s) : undefined}
          onDelete={canDelete ? () => onDelete(s) : undefined}
          extra={extra}
        />
      );
    },
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StudentsPage() {
  const router = useRouter();
  const qc     = useQueryClient();

  const canCreate = useAuthStore((s) => s.canDo(PERMISSIONS.STUDENT_CREATE));
  const canUpdate = useAuthStore((s) => s.canDo(PERMISSIONS.STUDENT_UPDATE ?? 'students.update'));
  const canDelete = useAuthStore((s) => s.canDo(PERMISSIONS.STUDENT_DELETE));
  const { activeBranchId } = useUIStore();

  const [mounted,       setMounted]       = useState(false);
  const [page,          setPage]          = useState(1);
  const [pageSize,      setPageSize]      = useState(10);
  const [search,        setSearch]        = useState('');
  const [classFilter,   setClassFilter]   = useState('');
  const [statusFilter,  setStatusFilter]  = useState('');
  const [createOpen,    setCreateOpen]    = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);  // holds { id } or full row
  const [deleteTarget,  setDeleteTarget]  = useState(null);

  useEffect(() => { setMounted(true); }, []);

  // ── GET /students ────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['students', { page, pageSize, search, class_id: classFilter, is_active: statusFilter, branch_id: activeBranchId }],
    queryFn: () =>
      studentService.getAll({
        page,
        limit:     pageSize,
        search:    search    || undefined,
        class_id:  classFilter  || undefined,
        is_active: statusFilter || undefined,
        branch_id: activeBranchId || undefined,
      }),
    keepPreviousData: true,
  });

  // ── Supporting data (classes + years) ───────────────────────────────────
  const { data: classesData } = useQuery({
    queryKey: ['classes-all'],
    queryFn: () => classService.getAll({ limit: 200 }),
  });

  const { data: yearsData } = useQuery({
    queryKey: ['academic-years-all'],
    queryFn: () => academicYearService.getAll(),
  });

  // ── Derived values ───────────────────────────────────────────────────────
  const students   = extractRows(data);
  const totalPages = extractPages(data);
  const total      = extractTotal(data, students);

  const classOptions = (extractRows(classesData) || []).map(c => ({
    value:    c.id,
    label:    c.name,
    sections: c.sections,
  }));

  const academicYearOptions = (
    Array.isArray(yearsData?.data) ? yearsData.data :
    Array.isArray(yearsData)       ? yearsData      : []
  ).map(y => ({ value: y.id, label: y.name }));

  // ── POST /students ───────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (body) => studentService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student added successfully');
      setCreateOpen(false);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed to add student'),
  });

  // ── PUT /students/:id ────────────────────────────────────────────────────
  // Fetch FULL student details when Edit is clicked (list data has no nested fields)
  const { data: editStudentFull, isLoading: editFetching } = useQuery({
    queryKey: ['student-edit', editTarget?.id],
    queryFn:  () => studentService.getById(editTarget.id),
    enabled:  !!editTarget?.id,
  });

  // Flatten nested response for StudentForm defaultValues
  const editDefaultValues = (() => {
    const raw = editStudentFull?.data ?? editStudentFull ?? editTarget ?? {};
    const dt  = raw.details?.studentDetails || {};
    return {
      ...raw,
      dob:              raw.dob              || raw.date_of_birth || dt.date_of_birth || dt.dob,
      gender:           raw.gender           || dt.gender,
      blood_group:      raw.blood_group      || dt.blood_group,
      religion:         raw.religion         || dt.religion,
      nationality:      raw.nationality      || dt.nationality,
      cnic:             raw.cnic             || dt.cnic,
      father_name:      raw.father_name      || dt.father_name,
      father_cnic:      raw.father_cnic      || dt.father_cnic,
      father_phone:     raw.father_phone     || dt.father_phone,
      father_occupation:raw.father_occupation|| dt.father_occupation,
      mother_name:      raw.mother_name      || dt.mother_name,
      mother_phone:     raw.mother_phone     || dt.mother_phone,
      guardian_name:    raw.guardian_name    || dt.guardian_name    || dt.father_name,
      guardian_phone:   raw.guardian_phone   || dt.guardian_phone   || dt.father_phone,
      guardian_email:   raw.guardian_email   || dt.guardian_email,
      guardian_relation:raw.guardian_relation|| dt.guardian_relation,
      present_address:  raw.present_address  || raw.address || dt.present_address,
      permanent_address:raw.permanent_address|| dt.permanent_address,
      city:             raw.city             || dt.city,
      registration_no:  raw.registration_no  || raw.gr_number || dt.registration_no || dt.roll_no,
    };
  })();

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => studentService.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['student-edit', editTarget?.id] });
      toast.success('Student updated successfully');
      setEditTarget(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed to update student'),
  });

  // ── PATCH /students/:id/toggle-status ────────────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: (id) => studentService.toggleStatus(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      toast.success('Status updated');
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed to toggle status'),
  });

  // ── DELETE /students/:id ─────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id) => studentService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted');
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed to delete student'),
  });

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns = useMemo(
    () =>
      buildColumns({
        onView:     (s) => router.push(`/students/${s.id}`),
        onEdit:     (s) => setEditTarget(s),
        onDelete:   (s) => setDeleteTarget(s),
        onToggle:   (id) => toggleMutation.mutate(id),
        canUpdate,
        canDelete,
        classOptions,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canUpdate, canDelete, classOptions],
  );

  const statusOptions = [
    { value: 'true',  label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description={`${total} student${total !== 1 ? 's' : ''} total`}
        action={
          mounted && canCreate && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} className="mr-2" /> Add Student
            </Button>
          )
        }
      />

      <DataTable
        columns={columns}
        data={students}
        loading={isLoading || isFetching}
        emptyMessage="No students found"
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name or GR number…"
        filters={[
          {
            name:     'class',
            label:    'Class',
            value:    classFilter,
            onChange: (v) => { setClassFilter(v); setPage(1); },
            options:  classOptions,
          },
          {
            name:     'status',
            label:    'Status',
            value:    statusFilter,
            onChange: (v) => { setStatusFilter(v); setPage(1); },
            options:  statusOptions,
          },
        ]}
        enableColumnVisibility
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          total,
          pageSize,
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
        exportConfig={{ fileName: 'students', dateField: 'created_at' }}
      />

      {/* ── Add Student Modal ── */}
      <AppModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add New Student"
        size="lg"
      >
        <StudentForm
          onSubmit={(body) => createMutation.mutate(body)}
          onCancel={() => setCreateOpen(false)}
          loading={createMutation.isPending}
          classOptions={classOptions}
          academicYearOptions={academicYearOptions}
        />
      </AppModal>

      {/* ── Edit Student Modal ── */}
      <AppModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Student"
        size="lg"
      >
        {editFetching ? (
          <div className="flex h-48 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <span className="text-sm">Loading student details…</span>
            </div>
          </div>
        ) : (
          <StudentForm
            key={editTarget?.id}
            defaultValues={editDefaultValues}
            onSubmit={(body) => updateMutation.mutate({ id: editTarget?.id, body })}
            onCancel={() => setEditTarget(null)}
            loading={updateMutation.isPending}
            classOptions={classOptions}
            academicYearOptions={academicYearOptions}
            isEdit
          />
        )}
      </AppModal>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        loading={deleteMutation.isPending}
        title="Delete Student"
        description={`"${deleteTarget?.first_name} ${deleteTarget?.last_name}" ko permanently delete karna chahte hain?`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
