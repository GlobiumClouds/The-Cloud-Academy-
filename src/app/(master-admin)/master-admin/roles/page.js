'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm }          from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, ShieldCheck, Pencil, Trash2, CheckSquare, Square,
  RefreshCw, Search, Users, Loader2, ToggleLeft, ToggleRight,
  Building2, GraduationCap, BookOpen, UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import { roleService } from '@/services';
import {
  ADMIN_PERMISSION_GROUPS,   ALL_ADMIN_PERMISSIONS,
  TEACHER_PERMISSION_GROUPS, ALL_TEACHER_PERMISSIONS,
  STUDENT_PERMISSION_GROUPS, ALL_STUDENT_PERMISSIONS,
  PARENT_PERMISSION_GROUPS,  ALL_PARENT_PERMISSIONS,
  permLabel,
} from '@/constants/permissions';
import {
  PageHeader, StatusBadge, ConfirmDialog, AppModal,
  InputField, StatsCard,
} from '@/components/common';
import { Button }     from '@/components/ui/button';
import { Input }      from '@/components/ui/input';
import { Label }      from '@/components/ui/label';
import { Textarea }   from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn }         from '@/lib/utils';
import { CARD_COLORS } from '@/lib/formatters';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Return per-user-type permission arrays.
 * Handles JSONB { instituteAdmin, teacher, student, parent } OR legacy flat [].
 */
function permsByType(permissions) {
  if (!permissions) return { instituteAdmin: [], teacher: [], student: [], parent: [] };
  if (Array.isArray(permissions)) {
    // Legacy flat array — put everything under instituteAdmin
    return { instituteAdmin: permissions, teacher: [], student: [], parent: [] };
  }
  return {
    instituteAdmin: permissions.instituteAdmin ?? [],
    teacher:        permissions.teacher        ?? [],
    student:        permissions.student        ?? [],
    parent:         permissions.parent         ?? [],
  };
}

const isFullAccess = (perms) => Array.isArray(perms) && perms.includes('ALL');

// ─── Role Card ────────────────────────────────────────────────────────────────
function RoleCard({ role, idx, onEdit, onDelete, onToggle }) {
  const c    = CARD_COLORS[idx % CARD_COLORS.length];
  const byType = useMemo(() => permsByType(role.permissions), [role.permissions]);

  const typeRows = [
    { key: 'instituteAdmin', label: 'Admin',   icon: <Building2  size={10} /> },
    { key: 'teacher',        label: 'Teacher', icon: <BookOpen   size={10} /> },
    { key: 'student',        label: 'Student', icon: <GraduationCap size={10} /> },
    { key: 'parent',         label: 'Parent',  icon: <UserCheck  size={10} /> },
  ];

  return (
    <div className={cn(
      'relative rounded-2xl border-2 p-5 shadow-sm hover:shadow-md transition-all flex flex-col',
      c.bg, c.border,
    )}>
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="shrink-0 rounded-full bg-white/80 p-2 shadow-sm">
            <ShieldCheck size={16} className={c.icon} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 truncate">{role.name}</h3>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">{role.code}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
          <StatusBadge status={role.is_active !== false ? 'active' : 'inactive'} />
          {role.is_template && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              Template
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {role.description && (
        <p className="text-xs text-slate-600 mb-3 line-clamp-2">{role.description}</p>
      )}

      {/* Per-user-type permission summary */}
      <div className="mb-4 flex-1 space-y-1">
        {typeRows.map(({ key, label, icon }) => {
          const perms = byType[key];
          const full  = isFullAccess(perms);
          const count = full ? null : perms.length;
          return (
            <div key={key} className="flex items-center gap-1.5 text-[11px]">
              <span className={cn('flex items-center gap-0.5 text-muted-foreground w-14 shrink-0')}>
                {icon} {label}
              </span>
              {full ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Full Access
                </span>
              ) : count > 0 ? (
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', c.badge)}>
                  {count} perm{count !== 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-muted-foreground/50 text-[10px]">—</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 mt-auto">
        <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs h-8" onClick={() => onEdit(role)}>
          <Pencil size={11} /> Edit
        </Button>
        <Button
          size="sm" variant="outline"
          className={cn('h-8 px-2.5', role.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50')}
          onClick={() => onToggle(role)}
          title={role.is_active ? 'Deactivate' : 'Activate'}
        >
          {role.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
        </Button>
        <Button
          size="sm" variant="outline"
          className="h-8 px-2.5 text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={() => onDelete(role)}
          title="Delete"
        >
          <Trash2 size={12} />
        </Button>
      </div>
    </div>
  );
}

// ─── flatPerms helper (used for stats only) ───────────────────────────────────
function flatPerms(permissions) {
  if (!permissions) return [];
  if (Array.isArray(permissions)) return permissions;
  return [...new Set(Object.values(permissions).flat())];
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MasterRolesPage() {
  const qc = useQueryClient();

  const [search,       setSearch]       = useState('');
  const [createOpen,   setCreateOpen]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['master-roles', search],
    queryFn:  () => roleService.getAll({ search: search || undefined, limit: 100 }),
    staleTime: 0,
  });

  const roles      = data?.data?.rows ?? data?.data ?? [];
  const totalCount = data?.data?.total ?? roles.length;
  const activeCount = roles.filter((r) => r.is_active !== false).length;
  const totalPerms  = roles.reduce((acc, r) => acc + flatPerms(r.permissions).length, 0);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-roles'] });

  const createMutation = useMutation({
    mutationFn: (body) => roleService.create(body),
    onSuccess: () => { invalidate(); toast.success('\u2705 Role created!'); setCreateOpen(false); },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => roleService.update(id, body),
    onSuccess: () => { invalidate(); toast.success('\u2705 Role updated!'); setEditTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => roleService.delete(id),
    onSuccess: () => { invalidate(); toast.success('Role deleted'); setDeleteTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Delete failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => roleService.update(id, { is_active }),
    onSuccess: (_, { is_active }) => {
      invalidate();
      toast.success(is_active ? 'Role activated' : 'Role deactivated');
      setToggleTarget(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const filtered = useMemo(
    () => search
      ? roles.filter((r) =>
          r.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.code?.toLowerCase().includes(search.toLowerCase()),
        )
      : roles,
    [roles, search],
  );

  const handleFormSubmit = (body) => {
    if (editTarget) updateMutation.mutate({ id: editTarget.id, body });
    else            createMutation.mutate(body);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Roles & Permissions"
        description="Define platform template roles and assign permissions for institute access control"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw size={13} className={cn('mr-1', isFetching && 'animate-spin')} />
              Refresh
            </Button>
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus size={15} /> New Role
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard label="Total Roles"  value={isLoading ? '\u2026' : totalCount}               icon={<ShieldCheck size={16} />} />
        <StatsCard label="Active"       value={isLoading ? '\u2026' : activeCount}              icon={<CheckSquare size={16} />} />
        <StatsCard label="Inactive"     value={isLoading ? '\u2026' : totalCount - activeCount} icon={<Square size={16} />} />
        <StatsCard label="Total Perms"  value={isLoading ? '\u2026' : totalPerms}               icon={<Users size={16} />} />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-8 text-sm"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 rounded-2xl border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ShieldCheck size={40} className="mb-3 opacity-25" />
          <p className="font-medium">No roles found</p>
          <p className="text-sm mt-1">Create your first platform template role to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((role, idx) => (
            <RoleCard
              key={role.id}
              role={role}
              idx={idx}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
              onToggle={setToggleTarget}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <RoleFormModal
        key={editTarget?.id ?? 'create'}
        open={createOpen || !!editTarget}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        role={editTarget}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
        title="Delete Role"
        description={
          <span>
            Delete role <strong>{deleteTarget?.name}</strong>?
            Institutes assigned this role may lose access.
          </span>
        }
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Toggle Active */}
      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={() =>
          toggleMutation.mutate({ id: toggleTarget.id, is_active: !toggleTarget.is_active })
        }
        loading={toggleMutation.isPending}
        title={toggleTarget?.is_active ? 'Deactivate Role' : 'Activate Role'}
        description={`${toggleTarget?.is_active ? 'Deactivate' : 'Activate'} "${toggleTarget?.name}"?`}
        confirmLabel={toggleTarget?.is_active ? 'Deactivate' : 'Activate'}
        variant={toggleTarget?.is_active ? 'destructive' : 'default'}
      />
    </div>
  );
}

// ─── Permission Tab Panel ─────────────────────────────────────────────────────
function PermTabPanel({ groups, allPerms, selected, onChange, isFull, onToggleFull }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        perms: g.perms.filter(
          (p) => p.toLowerCase().includes(q) || permLabel(p).toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.perms.length > 0 || g.label.toLowerCase().includes(q));
  }, [search, groups]);

  const toggle = (perm) =>
    onChange((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );

  const toggleGroup = (perms) => {
    const allOn = perms.every((p) => selected.includes(p));
    onChange((prev) =>
      allOn ? prev.filter((p) => !perms.includes(p)) : [...new Set([...prev, ...perms])],
    );
  };

  return (
    <div className="space-y-3">
      {/* Full Access toggle */}
      <div className="flex items-center justify-between rounded-lg border bg-white/70 px-3 py-2.5">
        <div>
          <p className="text-xs font-bold text-slate-700">Full Access</p>
          <p className="text-[10px] text-muted-foreground">Grant ALL permissions for this user type</p>
        </div>
        <button
          type="button"
          onClick={onToggleFull}
          className="flex items-center gap-1.5 text-xs font-medium"
        >
          {isFull ? (
            <ToggleRight size={22} className="text-emerald-600" />
          ) : (
            <ToggleLeft size={22} className="text-slate-400" />
          )}
        </button>
      </div>

      {/* Per-permission picker — shown only when not full access */}
      {!isFull && (
        <>
          {/* Header bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              {selected.length} / {allPerms.length} selected
            </span>
            <div className="flex gap-1.5">
              <Button
                type="button" size="sm" variant="outline" className="h-7 gap-1 text-xs"
                onClick={() => onChange(() => [...allPerms])}
              >
                <CheckSquare size={11} /> All
              </Button>
              <Button
                type="button" size="sm" variant="outline" className="h-7 gap-1 text-xs"
                onClick={() => onChange(() => [])}
              >
                <Square size={11} /> None
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter permissions\u2026"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          {/* Groups */}
          <ScrollArea className="h-64 rounded-lg border p-2 bg-white/50">
            <div className="space-y-2">
              {filtered.map((group) => {
                const allOn  = group.perms.every((p) => selected.includes(p));
                const someOn = group.perms.some((p) => selected.includes(p));
                const onCnt  = group.perms.filter((p) => selected.includes(p)).length;
                return (
                  <div key={group.label} className="rounded-lg border bg-white/70 px-3 py-2">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 text-left mb-1.5"
                      onClick={() => toggleGroup(group.perms)}
                    >
                      <div className={cn(
                        'size-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors',
                        allOn  ? 'bg-emerald-500 border-emerald-500 text-white'
                               : someOn ? 'bg-emerald-100 border-emerald-400'
                               : 'border-slate-300',
                      )}>
                        {allOn  && <span className="text-[9px] font-bold leading-none">\u2713</span>}
                        {!allOn && someOn && <span className="text-[9px] text-emerald-600 font-bold leading-none">\u2013</span>}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{group.icon} {group.label}</span>
                      <span className={cn(
                        'ml-auto text-[10px] font-semibold rounded-full px-1.5 py-0.5',
                        onCnt > 0 ? 'bg-emerald-100 text-emerald-700' : 'text-muted-foreground',
                      )}>
                        {onCnt}/{group.perms.length}
                      </span>
                    </button>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pl-6 sm:grid-cols-3">
                      {group.perms.map((perm) => (
                        <label
                          key={perm}
                          className="flex cursor-pointer items-center gap-1.5 rounded py-0.5 px-1 hover:bg-muted/40 transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="size-3.5 accent-emerald-600 shrink-0"
                            checked={selected.includes(perm)}
                            onChange={() => toggle(perm)}
                          />
                          <span className="text-xs text-slate-600 leading-tight">{permLabel(perm)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No permissions match &ldquo;{search}&rdquo;
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}

// ─── Role Form Modal ──────────────────────────────────────────────────────────
function RoleFormModal({ open, onClose, role, onSubmit, loading }) {
  const isEdit = !!role?.id;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name:        role?.name        ?? '',
      code:        role?.code        ?? '',
      description: role?.description ?? '',
    },
  });

  // ── Per-user-type permission state ─────────────────────────────────────────
  const initial = () => {
    const byType = permsByType(role?.permissions);
    return {
      adminPerms:   isFullAccess(byType.instituteAdmin) ? [] : (byType.instituteAdmin ?? []),
      teacherPerms: isFullAccess(byType.teacher)        ? [] : (byType.teacher        ?? []),
      studentPerms: isFullAccess(byType.student)        ? [] : (byType.student        ?? []),
      parentPerms:  isFullAccess(byType.parent)         ? [] : (byType.parent         ?? []),
      adminFull:   isFullAccess(byType.instituteAdmin),
      teacherFull: isFullAccess(byType.teacher),
      studentFull: isFullAccess(byType.student),
      parentFull:  isFullAccess(byType.parent),
    };
  };

  const [adminPerms,   setAdminPerms]   = useState(initial().adminPerms);
  const [teacherPerms, setTeacherPerms] = useState(initial().teacherPerms);
  const [studentPerms, setStudentPerms] = useState(initial().studentPerms);
  const [parentPerms,  setParentPerms]  = useState(initial().parentPerms);
  const [adminFull,    setAdminFull]    = useState(initial().adminFull);
  const [teacherFull,  setTeacherFull]  = useState(initial().teacherFull);
  const [studentFull,  setStudentFull]  = useState(initial().studentFull);
  const [parentFull,   setParentFull]   = useState(initial().parentFull);
  const [activeTab,    setActiveTab]    = useState('admin');

  // Sync state when modal opens / role changes
  useEffect(() => {
    if (open) {
      reset({
        name:        role?.name        ?? '',
        code:        role?.code        ?? '',
        description: role?.description ?? '',
      });
      const init = initial();
      setAdminPerms(init.adminPerms);
      setTeacherPerms(init.teacherPerms);
      setStudentPerms(init.studentPerms);
      setParentPerms(init.parentPerms);
      setAdminFull(init.adminFull);
      setTeacherFull(init.teacherFull);
      setStudentFull(init.studentFull);
      setParentFull(init.parentFull);
      setActiveTab('admin');
    }
  }, [open, role?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => onClose();

  const handleFormSubmit = (fields) => {
    const code = (fields.code || fields.name)
      .toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
    onSubmit({
      ...fields,
      code,
      permissions: {
        instituteAdmin: adminFull   ? ['ALL'] : adminPerms,
        teacher:        teacherFull ? ['ALL'] : teacherPerms,
        student:        studentFull ? ['ALL'] : studentPerms,
        parent:         parentFull  ? ['ALL'] : parentPerms,
      },
    });
  };

  // ── Tab config ─────────────────────────────────────────────────────────────
  const TABS = [
    {
      key:       'admin',
      label:     'Admin',
      icon:      <Building2 size={13} />,
      groups:    ADMIN_PERMISSION_GROUPS,
      allPerms:  ALL_ADMIN_PERMISSIONS,
      perms:     adminPerms,
      setPerms:  setAdminPerms,
      isFull:    adminFull,
      toggleFull: () => setAdminFull((v) => !v),
    },
    {
      key:       'teacher',
      label:     'Teacher',
      icon:      <BookOpen size={13} />,
      groups:    TEACHER_PERMISSION_GROUPS,
      allPerms:  ALL_TEACHER_PERMISSIONS,
      perms:     teacherPerms,
      setPerms:  setTeacherPerms,
      isFull:    teacherFull,
      toggleFull: () => setTeacherFull((v) => !v),
    },
    {
      key:       'student',
      label:     'Student',
      icon:      <GraduationCap size={13} />,
      groups:    STUDENT_PERMISSION_GROUPS,
      allPerms:  ALL_STUDENT_PERMISSIONS,
      perms:     studentPerms,
      setPerms:  setStudentPerms,
      isFull:    studentFull,
      toggleFull: () => setStudentFull((v) => !v),
    },
    {
      key:       'parent',
      label:     'Parent',
      icon:      <UserCheck size={13} />,
      groups:    PARENT_PERMISSION_GROUPS,
      allPerms:  ALL_PARENT_PERMISSIONS,
      perms:     parentPerms,
      setPerms:  setParentPerms,
      isFull:    parentFull,
      toggleFull: () => setParentFull((v) => !v),
    },
  ];

  const activeTabData = TABS.find((t) => t.key === activeTab);

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={isEdit ? `\u270F Edit \u2014 ${role?.name}` : '\u2795 New Platform Role'}
      description={
        isEdit
          ? 'Update role name, code and permissions per user type'
          : 'Create a platform template role with per-user-type permissions.'
      }
      size="xl"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit(handleFormSubmit)} disabled={loading} className="min-w-[140px] gap-1.5">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Saving\u2026' : isEdit ? 'Save Changes' : 'Create Role'}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">

        {/* Identity fields */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InputField
            label="Role Name" name="name" register={register} error={errors.name}
            rules={{ required: 'Name is required' }} placeholder="School Premium" required
          />
          <div className="space-y-1">
            <Label className="text-xs font-semibold">
              Code
              <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                (auto-generated from name if empty)
              </span>
            </Label>
            <Input
              {...register('code')}
              placeholder="SCHOOL_PREMIUM"
              className="h-9 text-sm font-mono"
              onInput={(e) => {
                e.target.value = e.target.value.toUpperCase().replace(/\s/g, '_');
              }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold">
            Description
            <span className="ml-1 text-[10px] font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            {...register('description')}
            placeholder="Describe what this role enables\u2026"
            rows={2}
            className="text-sm resize-none"
          />
        </div>

        {/* 4-Tab Permissions section */}
        <div>
          <p className="text-sm font-bold text-slate-700 mb-3">
            Permissions
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              (configure per user type)
            </span>
          </p>

          {/* Tab bar */}
          <div className="flex rounded-lg border bg-muted/30 p-0.5 gap-0.5 mb-3">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const cnt      = tab.isFull ? null : tab.perms.length;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 px-2 text-xs font-medium transition-all',
                    isActive
                      ? 'bg-white shadow-sm text-slate-800'
                      : 'text-muted-foreground hover:text-slate-700',
                  )}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.isFull ? (
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">ALL</span>
                  ) : cnt > 0 ? (
                    <span className={cn(
                      'rounded-full px-1.5 py-0.5 text-[9px] font-semibold',
                      isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground',
                    )}>{cnt}</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Active tab panel */}
          {activeTabData && (
            <PermTabPanel
              key={activeTabData.key}
              groups={activeTabData.groups}
              allPerms={activeTabData.allPerms}
              selected={activeTabData.perms}
              onChange={activeTabData.setPerms}
              isFull={activeTabData.isFull}
              onToggleFull={activeTabData.toggleFull}
            />
          )}
        </div>

      </div>
    </AppModal>
  );
}
