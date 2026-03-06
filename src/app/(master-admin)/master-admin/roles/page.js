'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ShieldCheck, Pencil, Trash2, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

import { roleService } from '@/services';
import { PERMISSIONS } from '@/constants';
import {
  PageHeader, StatusBadge, ConfirmDialog, AppModal,
  InputField, FormSubmitButton,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge }  from '@/components/ui/badge';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea }  from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// ─── Permission groups ────────────────────────────────────────────────────────
const PERMISSION_GROUPS = [
  {
    label: '🎓 Students',
    perms: [
      PERMISSIONS.STUDENT_CREATE, PERMISSIONS.STUDENT_READ,
      PERMISSIONS.STUDENT_UPDATE, PERMISSIONS.STUDENT_DELETE,
      PERMISSIONS.STUDENT_EXPORT,
    ],
  },
  {
    label: '📋 Admissions',
    perms: [
      PERMISSIONS.ADMISSION_CREATE, PERMISSIONS.ADMISSION_READ,
      PERMISSIONS.ADMISSION_UPDATE, PERMISSIONS.ADMISSION_DELETE,
      PERMISSIONS.ADMISSION_APPROVE,
    ],
  },
  {
    label: '👨‍👩‍👧 Parents',
    perms: [
      PERMISSIONS.PARENT_CREATE, PERMISSIONS.PARENT_READ,
      PERMISSIONS.PARENT_UPDATE, PERMISSIONS.PARENT_DELETE,
    ],
  },
  {
    label: '👩‍🏫 Teachers',
    perms: [
      PERMISSIONS.TEACHER_CREATE, PERMISSIONS.TEACHER_READ,
      PERMISSIONS.TEACHER_UPDATE, PERMISSIONS.TEACHER_DELETE,
    ],
  },
  {
    label: '📚 Academics',
    perms: [
      PERMISSIONS.CLASS_CREATE,   PERMISSIONS.CLASS_READ,
      PERMISSIONS.CLASS_UPDATE,   PERMISSIONS.CLASS_DELETE,
      PERMISSIONS.SECTION_CREATE, PERMISSIONS.SECTION_READ,
      PERMISSIONS.SECTION_UPDATE, PERMISSIONS.SECTION_DELETE,
      PERMISSIONS.SUBJECT_CREATE, PERMISSIONS.SUBJECT_READ,
      PERMISSIONS.SUBJECT_UPDATE, PERMISSIONS.SUBJECT_DELETE,
      PERMISSIONS.TIMETABLE_CREATE, PERMISSIONS.TIMETABLE_READ,
      PERMISSIONS.TIMETABLE_UPDATE, PERMISSIONS.TIMETABLE_DELETE,
    ],
  },
  {
    label: '✅ Attendance',
    perms: [
      PERMISSIONS.ATTENDANCE_CREATE, PERMISSIONS.ATTENDANCE_READ,
      PERMISSIONS.ATTENDANCE_UPDATE, PERMISSIONS.ATTENDANCE_EXPORT,
    ],
  },
  {
    label: '💰 Finance',
    perms: [
      PERMISSIONS.FEE_CREATE,    PERMISSIONS.FEE_READ,
      PERMISSIONS.FEE_UPDATE,    PERMISSIONS.FEE_DELETE,
      PERMISSIONS.FEE_COLLECT,   PERMISSIONS.FEE_REFUND,
      PERMISSIONS.FEE_EXPORT,
      PERMISSIONS.FEE_TEMPLATE_CREATE, PERMISSIONS.FEE_TEMPLATE_READ,
      PERMISSIONS.FEE_TEMPLATE_UPDATE, PERMISSIONS.FEE_TEMPLATE_DELETE,
      PERMISSIONS.FEE_TEMPLATE_ASSIGN,
    ],
  },
  {
    label: '📝 Exams',
    perms: [
      PERMISSIONS.EXAM_CREATE, PERMISSIONS.EXAM_READ,
      PERMISSIONS.EXAM_UPDATE, PERMISSIONS.EXAM_DELETE,
      PERMISSIONS.EXAM_PUBLISH,
    ],
  },
  {
    label: '💼 HR & Payroll',
    perms: [
      PERMISSIONS.PAYROLL_READ,     PERMISSIONS.PAYROLL_CREATE,
      PERMISSIONS.PAYROLL_UPDATE,   PERMISSIONS.PAYROLL_DELETE,
      PERMISSIONS.PAYROLL_GENERATE, PERMISSIONS.PAYROLL_EXPORT,
      PERMISSIONS.LEAVE_READ,       PERMISSIONS.LEAVE_CREATE,
      PERMISSIONS.LEAVE_APPROVE,
    ],
  },
  {
    label: '📣 Communication',
    perms: [
      PERMISSIONS.NOTICE_CREATE,     PERMISSIONS.NOTICE_READ,
      PERMISSIONS.NOTICE_UPDATE,     PERMISSIONS.NOTICE_DELETE,
      PERMISSIONS.NOTIFICATION_SEND,
    ],
  },
  {
    label: '📊 Reports',
    perms: [
      PERMISSIONS.REPORT_FINANCIAL,  PERMISSIONS.REPORT_ATTENDANCE,
      PERMISSIONS.REPORT_STUDENT,    PERMISSIONS.REPORT_EXAM,
      PERMISSIONS.REPORT_SALARY,     PERMISSIONS.REPORT_EXPORT,
    ],
  },
  {
    label: '⚙️ Admin',
    perms: [
      PERMISSIONS.ROLE_CREATE,  PERMISSIONS.ROLE_READ,
      PERMISSIONS.ROLE_UPDATE,  PERMISSIONS.ROLE_DELETE,
      PERMISSIONS.ROLE_ASSIGN,
      PERMISSIONS.USER_CREATE,  PERMISSIONS.USER_READ,
      PERMISSIONS.USER_UPDATE,  PERMISSIONS.USER_DELETE,
      PERMISSIONS.ACADEMIC_YEAR_CREATE, PERMISSIONS.ACADEMIC_YEAR_READ,
      PERMISSIONS.ACADEMIC_YEAR_UPDATE, PERMISSIONS.ACADEMIC_YEAR_DELETE,
      PERMISSIONS.SCHOOL_UPDATE,   PERMISSIONS.SCHOOL_SETTINGS,
      PERMISSIONS.SCHOOL_ASSIGN_ROLE,
      PERMISSIONS.BRANCH_CREATE, PERMISSIONS.BRANCH_READ,
      PERMISSIONS.BRANCH_UPDATE, PERMISSIONS.BRANCH_DELETE,
    ],
  },
];

const ALL_PERMISSIONS_FLAT = PERMISSION_GROUPS.flatMap((g) => g.perms);

const permLabel = (p) =>
  p.split('.').pop().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// ─── Role Card Colors ─────────────────────────────────────────────────────────
const CARD_COLORS = [
  { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: 'text-blue-600',   badge: 'bg-blue-100 text-blue-700'   },
  { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-600', badge: 'bg-violet-100 text-violet-700' },
  { bg: 'bg-emerald-50',border: 'border-emerald-200',icon: 'text-emerald-600',badge: 'bg-emerald-100 text-emerald-700' },
  { bg: 'bg-amber-50',  border: 'border-amber-200',  icon: 'text-amber-600',  badge: 'bg-amber-100 text-amber-700'  },
  { bg: 'bg-rose-50',   border: 'border-rose-200',   icon: 'text-rose-600',   badge: 'bg-rose-100 text-rose-700'   },
  { bg: 'bg-cyan-50',   border: 'border-cyan-200',   icon: 'text-cyan-600',   badge: 'bg-cyan-100 text-cyan-700'   },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MasterRolesPage() {
  const qc = useQueryClient();

  const [page,         setPage]         = useState(1);
  const [search,       setSearch]       = useState('');
  const [createOpen,   setCreateOpen]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['roles', page, search],
    queryFn:  () => roleService.getAll({ page, limit: 20, search: search || undefined }),
  });

  const roles = data?.data?.rows ?? data?.data ?? [];
  const total = data?.data?.total ?? roles.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const createMutation = useMutation({
    mutationFn: roleService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); toast.success('Role created'); setCreateOpen(false); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => roleService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); toast.success('Role updated'); setEditTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: roleService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); toast.success('Role deleted'); setDeleteTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="🛡️ Roles & Permissions"
        description="Define roles and control what each role can access"
        action={
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus size={15} /> New Role
          </Button>
        }
      />

      {/* ── Search ──────────────────────────────────────────── */}
      <div className="max-w-xs">
        <Input
          placeholder="Search roles…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="h-9 text-sm"
        />
      </div>

      {/* ── Role Cards Grid ─────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl border bg-white animate-pulse" />
          ))}
        </div>
      ) : roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ShieldCheck size={40} className="mb-3 opacity-30" />
          <p>No roles found. Create your first role.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role, idx) => {
            const c = CARD_COLORS[idx % CARD_COLORS.length];
            const permCount = role.permissions?.length ?? 0;
            const groupsUsed = PERMISSION_GROUPS.filter((g) =>
              g.perms.some((p) => role.permissions?.includes(p)),
            ).map((g) => g.label);
            return (
              <div
                key={role.id}
                className={cn('relative rounded-2xl border-2 p-5 shadow-sm hover:shadow-md transition-all', c.bg, c.border)}
              >
                {/* ── Top ── */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-white/80 p-2 shadow-sm">
                      <ShieldCheck size={16} className={c.icon} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{role.name}</h3>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">{role.code}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={role.is_active !== false ? 'active' : 'inactive'} />
                    {role.is_system && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        System
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Description ── */}
                {role.description && (
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">{role.description}</p>
                )}

                {/* ── Permission Summary ── */}
                <div className="mb-4">
                  <div className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', c.badge)}>
                    {permCount} permissions
                  </div>
                  {groupsUsed.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {groupsUsed.slice(0, 4).map((g) => (
                        <span key={g} className="rounded-full bg-white/70 border px-1.5 py-0.5 text-[10px] text-slate-600">
                          {g}
                        </span>
                      ))}
                      {groupsUsed.length > 4 && (
                        <span className="text-[10px] text-muted-foreground self-center">+{groupsUsed.length - 4} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Actions ── */}
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs"
                    onClick={() => setEditTarget(role)}>
                    <Pencil size={11} /> Edit Permissions
                  </Button>
                  {!role.is_system && (
                    <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setDeleteTarget(role)}>
                      <Trash2 size={11} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination strip ─────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 justify-center pt-2">
          <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      {/* ── Create Modal ─────────────────────────────────────── */}
      <RoleFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultValues={{}}
        onSubmit={(body) => createMutation.mutate(body)}
        loading={createMutation.isPending}
        isEdit={false}
      />

      {/* ── Edit Modal ───────────────────────────────────────── */}
      <RoleFormModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        defaultValues={editTarget ?? {}}
        onSubmit={(body) => updateMutation.mutate({ id: editTarget.id, body })}
        loading={updateMutation.isPending}
        isEdit
      />

      {/* ── Delete Confirm ───────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
        title="Delete Role"
        description={`Delete role "${deleteTarget?.name}"? Users with this role will lose access.`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}

// ─── Role Form Modal ──────────────────────────────────────────────────────────
function RoleFormModal({ open, onClose, defaultValues, onSubmit, loading, isEdit }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name:        defaultValues.name        ?? '',
      code:        defaultValues.code        ?? '',
      description: defaultValues.description ?? '',
    },
  });

  const [selected, setSelected] = useState(defaultValues.permissions ?? []);

  // Keep permissions in sync when defaultValues change (edit target changes)
  useEffect(() => {
    setSelected(defaultValues.permissions ?? []);
  }, [defaultValues]);

  const toggle = (perm) =>
    setSelected((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );

  const toggleGroup = (perms) => {
    const allOn = perms.every((p) => selected.includes(p));
    setSelected((prev) =>
      allOn ? prev.filter((p) => !perms.includes(p)) : [...new Set([...prev, ...perms])],
    );
  };

  const selectAll = () => setSelected([...ALL_PERMISSIONS_FLAT]);
  const clearAll  = () => setSelected([]);

  const handleClose = () => { reset(); setSelected([]); onClose(); };

  const handleFormSubmit = (fields) => {
    onSubmit({ ...fields, permissions: selected });
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={isEdit ? '✏️ Edit Role' : '➕ New Role'}
      description={isEdit ? 'Update role name, code and permissions' : 'Create a new role and assign permissions'}
      size="xl"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
          <FormSubmitButton loading={loading} label={isEdit ? 'Save Changes' : 'Create Role'} loadingLabel="Saving…" onClick={handleSubmit(handleFormSubmit)} />
        </div>
      }
    >
      <div className="space-y-5">
        {/* ── Identity ── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Role Name <span className="text-red-500">*</span></Label>
            <Input
              {...register('name', { required: true })}
              placeholder="School Admin"
              className={cn('h-9 text-sm', errors.name && 'border-red-400')}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Code <span className="text-red-500">*</span></Label>
            <Input
              {...register('code', { required: true })}
              placeholder="school_admin"
              className={cn('h-9 text-sm font-mono', errors.code && 'border-red-400')}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Description</Label>
          <Textarea {...register('description')} placeholder="Brief description of this role…" rows={2} className="text-sm resize-none" />
        </div>

        {/* ── Permissions ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-slate-700">
              Permissions
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                {selected.length} selected
              </span>
            </p>
            <div className="flex gap-1.5">
              <Button type="button" size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={selectAll}>
                <CheckSquare size={11} /> Select All
              </Button>
              <Button type="button" size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={clearAll}>
                <Square size={11} /> Clear All
              </Button>
            </div>
          </div>

          <ScrollArea className="h-72 rounded-lg border p-3">
            <div className="space-y-4">
              {PERMISSION_GROUPS.map((group) => {
                const allOn = group.perms.every((p) => selected.includes(p));
                const someOn = group.perms.some((p) => selected.includes(p));
                return (
                  <div key={group.label}>
                    <button
                      type="button"
                      className="flex items-center gap-2 w-full text-left mb-2"
                      onClick={() => toggleGroup(group.perms)}
                    >
                      <div className={cn(
                        'size-4 rounded border-2 flex items-center justify-center transition-colors',
                        allOn
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : someOn
                            ? 'bg-emerald-100 border-emerald-400'
                            : 'border-slate-300',
                      )}>
                        {allOn && <span className="text-[9px] font-bold">✓</span>}
                        {!allOn && someOn && <span className="text-[9px] text-emerald-500 font-bold">–</span>}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{group.label}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {group.perms.filter((p) => selected.includes(p)).length}/{group.perms.length}
                      </span>
                    </button>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 pl-6">
                      {group.perms.map((perm) => (
                        <label
                          key={perm}
                          className="flex cursor-pointer items-center gap-2 rounded py-1 hover:bg-muted/30 transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="size-3.5 accent-emerald-600"
                            checked={selected.includes(perm)}
                            onChange={() => toggle(perm)}
                          />
                          <span className="text-xs text-slate-600">{permLabel(perm)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </AppModal>
  );
}
