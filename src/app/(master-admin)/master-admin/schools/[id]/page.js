'use client';

import { use, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Building2, CreditCard, Shield, Users,
  GraduationCap, BookOpen, UserCheck, LayoutGrid, MapPin,
} from 'lucide-react';
// import { toast } from 'sonner';

import { masterAdminService } from '@/services';
import {
  DUMMY_INSTITUTE_STUDENTS,
  DUMMY_INSTITUTE_TEACHERS,
  DUMMY_INSTITUTE_PARENTS,
  DUMMY_INSTITUTE_STAFF,
} from '@/data/masterAdminDummyData';
import {
  PageHeader, AppBreadcrumb, PageLoader, ErrorAlert,
  InputField, SelectField, CheckboxField, DatePickerField, FormSubmitButton,
  StatusBadge, StatsCard, DataTable, AppModal,
} from '@/components/common';
import { Button }   from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator }  from '@/components/ui/separator';
import { Badge }    from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_OPTIONS = [
  { value: 'school',     label: 'School'     },
  { value: 'college',    label: 'College'    },
  { value: 'university', label: 'University' },
  { value: 'coaching',   label: 'Coaching'   },
  { value: 'academy',    label: 'Academy'    },
];

const PLAN_OPTIONS = [
  { value: 'basic',      label: '💎 Basic — PKR 8,000/month'      },
  { value: 'standard',   label: '⭐ Standard — PKR 15,000/month'  },
  { value: 'premium',    label: '👑 Premium — PKR 25,000/month'   },
  { value: 'enterprise', label: '🏢 Enterprise — PKR 75,000/month' },
];

const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ─── usePaginatedTable ────────────────────────────────────────────────────────
function usePaginatedTable(data, searchFields = []) {
  const [page,    setPage]    = useState(1);
  const [pageSize,setPageSize]= useState(5);
  const [search,  setSearch]  = useState('');
  const [filters, setFilters] = useState({});

  const filtered = useMemo(() => {
    let d = data;
    if (search) {
      const q = search.toLowerCase();
      d = d.filter((r) => searchFields.some((f) => String(r[f] ?? '').toLowerCase().includes(q)));
    }
    Object.entries(filters).forEach(([k, v]) => {
      if (v) d = d.filter((r) => String(r[k]).toLowerCase() === v.toLowerCase());
    });
    return d;
  }, [data, search, filters, searchFields]);

  const total      = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageData   = filtered.slice((page - 1) * pageSize, page * pageSize);

  const setFilter = (name, val) => { setFilters((p) => ({ ...p, [name]: val })); setPage(1); };
  const filterVal = (k) => filters[k] ?? '';

  return {
    pageData, total, totalPages, search, page, pageSize, filterVal, setFilter,
    onSearch: (v) => { setSearch(v); setPage(1); },
    pagination: {
      page, totalPages, total, pageSize,
      onPageChange:     (p) => setPage(p),
      onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
    },
  };
}

// ─── Student Table ────────────────────────────────────────────────────────────
function StudentTable({ onView }) {
  const tbl = usePaginatedTable(DUMMY_INSTITUTE_STUDENTS, ['name', 'father', 'class', 'roll']);
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Student',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div>
            <p className="font-medium text-slate-800">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.father}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'class',
      header: 'Class',
      cell: ({ getValue }) => <span className="text-sm text-slate-600">{getValue()}</span>,
    },
    {
      accessorKey: 'roll',
      header: 'Roll #',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs bg-slate-50 rounded px-1.5 py-0.5 text-slate-600">{getValue()}</span>
      ),
    },
    {
      accessorKey: 'fee_status',
      header: 'Fee',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onView(row.original)}>
          View
        </Button>
      ),
    },
  ], [onView]);

  return (
    <DataTable
      columns={columns}
      data={tbl.pageData}
      emptyMessage="No students found"
      search={tbl.search}
      onSearch={tbl.onSearch}
      searchPlaceholder="Search by name or father…"
      enableColumnVisibility
      exportConfig={{ fileName: 'institute-students' }}
      pagination={tbl.pagination}
      filters={[
        {
          name: 'fee_status', label: 'Fee', value: tbl.filterVal('fee_status'),
          onChange: (v) => tbl.setFilter('fee_status', v),
          options: [
            { value: 'paid',    label: 'Paid'    },
            { value: 'unpaid',  label: 'Unpaid'  },
            { value: 'partial', label: 'Partial' },
          ],
        },
        {
          name: 'status', label: 'Status', value: tbl.filterVal('status'),
          onChange: (v) => tbl.setFilter('status', v),
          options: [
            { value: 'active',   label: 'Active'   },
            { value: 'inactive', label: 'Inactive' },
          ],
        },
      ]}
    />
  );
}

// ─── Teacher Table ────────────────────────────────────────────────────────────
function TeacherTable({ onView }) {
  const tbl = usePaginatedTable(DUMMY_INSTITUTE_TEACHERS, ['name', 'subject', 'email', 'qualification']);
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Teacher',
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div>
            <p className="font-medium text-slate-800">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.email}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ getValue }) => (
        <span className="rounded-full bg-violet-100 text-violet-700 px-2 py-0.5 text-[11px] font-semibold">
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'qualification',
      header: 'Qualification',
      cell: ({ getValue }) => <span className="text-xs text-slate-600">{getValue()}</span>,
    },
    {
      accessorKey: 'experience',
      header: 'Experience',
      cell: ({ getValue }) => <span className="text-xs text-slate-600">{getValue()}</span>,
    },
    {
      accessorKey: 'join_date',
      header: 'Joined',
      cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{fmtDate(getValue())}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onView(row.original)}>
          View
        </Button>
      ),
    },
  ], [onView]);

  return (
    <DataTable
      columns={columns}
      data={tbl.pageData}
      emptyMessage="No teachers found"
      search={tbl.search}
      onSearch={tbl.onSearch}
      searchPlaceholder="Search by name or subject…"
      enableColumnVisibility
      exportConfig={{ fileName: 'institute-teachers' }}
      pagination={tbl.pagination}
      filters={[
        {
          name: 'status', label: 'Status', value: tbl.filterVal('status'),
          onChange: (v) => tbl.setFilter('status', v),
          options: [
            { value: 'active',   label: 'Active'   },
            { value: 'inactive', label: 'Inactive' },
          ],
        },
      ]}
    />
  );
}

// ─── Parent Table ─────────────────────────────────────────────────────────────
function ParentTable({ onView }) {
  const tbl = usePaginatedTable(DUMMY_INSTITUTE_PARENTS, ['name', 'phone', 'email']);
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Parent',
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div>
            <p className="font-medium text-slate-800">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.email}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ getValue }) => <span className="text-sm text-slate-600">{getValue()}</span>,
    },
    {
      accessorKey: 'children',
      header: 'Children',
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div>
            <p className="font-semibold text-slate-700">{p.children}</p>
            <p className="text-xs text-muted-foreground">{p.children_names}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onView(row.original)}>
          View
        </Button>
      ),
    },
  ], [onView]);

  return (
    <DataTable
      columns={columns}
      data={tbl.pageData}
      emptyMessage="No parents found"
      search={tbl.search}
      onSearch={tbl.onSearch}
      searchPlaceholder="Search by name or phone…"
      enableColumnVisibility
      exportConfig={{ fileName: 'institute-parents' }}
      pagination={tbl.pagination}
      filters={[
        {
          name: 'status', label: 'Status', value: tbl.filterVal('status'),
          onChange: (v) => tbl.setFilter('status', v),
          options: [
            { value: 'active',   label: 'Active'   },
            { value: 'inactive', label: 'Inactive' },
          ],
        },
      ]}
    />
  );
}

// ─── Staff Table ──────────────────────────────────────────────────────────────
function StaffTable({ onView }) {
  const tbl = usePaginatedTable(DUMMY_INSTITUTE_STAFF, ['name', 'role', 'department', 'email']);
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Staff Member',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div>
            <p className="font-medium text-slate-800">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.email}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }) => (
        <span className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 font-medium">{getValue()}</span>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ getValue }) => <span className="text-sm text-slate-600">{getValue()}</span>,
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ getValue }) => <span className="text-xs text-slate-600">{getValue()}</span>,
    },
    {
      accessorKey: 'join_date',
      header: 'Joined',
      cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{fmtDate(getValue())}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onView(row.original)}>
          View
        </Button>
      ),
    },
  ], [onView]);

  return (
    <DataTable
      columns={columns}
      data={tbl.pageData}
      emptyMessage="No staff found"
      search={tbl.search}
      onSearch={tbl.onSearch}
      searchPlaceholder="Search by name or role…"
      enableColumnVisibility
      exportConfig={{ fileName: 'institute-staff' }}
      pagination={tbl.pagination}
    />
  );
}

// ─── Person Detail Modal ──────────────────────────────────────────────────────
const PERSON_TITLES = {
  student: '🎓 Student Detail',
  teacher: '👨‍🏫 Teacher Detail',
  parent:  '👨‍👩‍👧 Parent Detail',
  staff:   '💼 Staff Detail',
};

function PersonDetailModal({ person, type, onClose }) {
  if (!person) return null;

  const rows =
    type === 'student' ? [
      ['Name',            person.name],
      ["Father's Name",   person.father],
      ['Gender',          person.gender],
      ['Date of Birth',   fmtDate(person.dob)],
      ['Class',           person.class],
      ['Roll Number',     person.roll],
      ['Phone (Parent)',  person.phone],
      ['Admission Date',  fmtDate(person.admission_date)],
      ['Address',         person.address],
      ['Fee Status',      <StatusBadge status={person.fee_status} />],
      ['Status',          <StatusBadge status={person.status}     />],
    ]
    : type === 'teacher' ? [
      ['Name',            person.name],
      ['Gender',          person.gender],
      ['Subject',         person.subject],
      ['Qualification',   person.qualification],
      ['Experience',      person.experience],
      ['Email',           person.email],
      ['Phone',           person.phone],
      ['Join Date',       fmtDate(person.join_date)],
      ['Salary',          person.salary ? `PKR ${Number(person.salary).toLocaleString()}` : '—'],
      ['Status',          <StatusBadge status={person.status} />],
    ]
    : type === 'parent' ? [
      ['Name',            person.name],
      ['CNIC',            person.cnic],
      ['Phone',           person.phone],
      ['Email',           person.email],
      ['Children Count',  person.children],
      ["Children's Names",person.children_names],
      ['Address',         person.address],
      ['Status',          <StatusBadge status={person.status} />],
    ]
    : [
      ['Name',        person.name],
      ['Role',        person.role],
      ['Department',  person.department],
      ['Email',       person.email],
      ['Phone',       person.phone],
      ['Join Date',   fmtDate(person.join_date)],
      ['Salary',      person.salary ? `PKR ${Number(person.salary).toLocaleString()}` : '—'],
      ['Status',      <StatusBadge status={person.status} />],
    ];

  return (
    <AppModal
      open={!!person}
      onClose={onClose}
      title={PERSON_TITLES[type] ?? 'Detail'}
      size="md"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {rows.map(([label, value]) => (
          <div key={label} className="space-y-0.5 col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
            <div className="text-sm text-slate-800 break-words">{value ?? '—'}</div>
          </div>
        ))}
      </div>
    </AppModal>
  );
}

// ─── Subscription Renew / Edit Modal ─────────────────────────────────────────
function SubEditModal({ open, onClose, school }) {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: { plan: school?.plan ?? '', start_date: null, end_date: null },
  });

  const handleSave = (data) => {
    toast.success(`Subscription updated: ${data.plan} plan`);
    onClose();
    reset();
  };

  return (
    <AppModal
      open={open}
      onClose={() => { onClose(); reset(); }}
      title="📋 Edit Subscription"
      description="Update subscription plan and validity dates"
      size="sm"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={() => { onClose(); reset(); }}>Cancel</Button>
          <Button onClick={handleSubmit(handleSave)}>Save Changes</Button>
        </div>
      }
    >
      <form className="space-y-4">
        <SelectField
          label="Subscription Plan"
          name="plan"
          control={control}
          options={PLAN_OPTIONS}
          placeholder="Select plan…"
          required
        />
        <DatePickerField
          label="Start Date"
          name="start_date"
          control={control}
          placeholder="Pick start date"
          required
        />
        <DatePickerField
          label="End / Expiry Date"
          name="end_date"
          control={control}
          placeholder="Pick expiry date"
          required
        />
      </form>
    </AppModal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InstituteDetailPage({ params }) {
  const { id }  = use(params);
  const router  = useRouter();
  const qc      = useQueryClient();

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personType,     setPersonType]     = useState(null);
  const [subEditOpen,    setSubEditOpen]    = useState(false);

  const { data: school, isLoading, error } = useQuery({
    queryKey: ['master-school', id],
    queryFn:  () => masterAdminService.getSchoolById(id),
    enabled:  !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (body) => masterAdminService.updateSchool(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['master-school',  id] });
      qc.invalidateQueries({ queryKey: ['master-schools']    });
      toast.success('Institute updated successfully');
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Update failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: (is_active) => masterAdminService.toggleSchoolStatus(id, is_active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['master-school',  id] });
      qc.invalidateQueries({ queryKey: ['master-schools']    });
      toast.success('Status updated');
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Update failed'),
  });

  const { register, control, handleSubmit } = useForm({
    values: school ? {
      name:           school.name            ?? '',
      city:           school.city            ?? '',
      contact:        school.contact         ?? '',
      has_branches:   school.has_branches    ?? false,
      institute_type: school.type ?? school.institute_type ?? 'school',
    } : undefined,
  });

  const openPerson = (type) => (row) => { setPersonType(type); setSelectedPerson(row); };
  const closePerson = () => { setSelectedPerson(null); setPersonType(null); };

  if (isLoading) return <PageLoader message="Loading institute…" />;
  if (error)     return <ErrorAlert message="Failed to load institute data." />;
  if (!school)   return null;

  const isActive = school.is_active ?? school.status === 'active';
  const sub      = school.subscription;
  const expires  = school.expires ?? sub?.end_date ?? sub?.expires_at ?? sub?.end;
  const daysLeft = expires
    ? Math.ceil((new Date(expires) - Date.now()) / 86400000)
    : null;

  return (
    <div className="space-y-6">
      <AppBreadcrumb
        items={[
          { label: 'Institutes', href: '/master-admin/schools' },
          { label: school.name },
        ]}
      />

      <PageHeader
        title={school.name}
        description={`Code: ${school.code}${school.city ? ` · ${school.city}` : ''}`}
        action={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft size={14} className="mr-2" /> Back
          </Button>
        }
      />

      {/* ── Meta badges row ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 -mt-3">
        <span className="font-mono text-xs bg-slate-100 border rounded px-2 py-0.5 text-slate-600">
          {school.code}
        </span>
        <Badge variant="outline" className="capitalize text-xs bg-blue-50 text-blue-700 border-blue-200">
          {school.type ?? school.institute_type}
        </Badge>
        {school.city && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={10} /> {school.city}
          </span>
        )}
        <StatusBadge status={isActive ? 'active' : 'inactive'} />
      </div>

      {/* ── 6-card Stats Strip ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatsCard
          label="Students"
          value={school.students ?? DUMMY_INSTITUTE_STUDENTS.length}
          icon={<GraduationCap size={18} />}
        />
        <StatsCard
          label="Teachers"
          value={DUMMY_INSTITUTE_TEACHERS.length}
          icon={<BookOpen size={18} />}
        />
        <StatsCard
          label="Parents"
          value={DUMMY_INSTITUTE_PARENTS.length}
          icon={<Users size={18} />}
        />
        <StatsCard
          label="Staff"
          value={DUMMY_INSTITUTE_STAFF.length}
          icon={<UserCheck size={18} />}
        />
        <StatsCard
          label="Branches"
          value={school.branches ?? (school.has_branches ? '2+' : '1')}
          icon={<LayoutGrid size={18} />}
        />
        <StatsCard
          label="Plan"
          value={<span className="capitalize">{school.plan ?? sub?.plan ?? '—'}</span>}
          icon={<CreditCard size={18} />}
        />
      </div>

      {/* ── Main 3-col Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── Left 2/3: Edit + People ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info edit form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 size={16} /> Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit((body) => updateMutation.mutate(body))}
                className="grid gap-4 sm:grid-cols-2"
              >
                <InputField
                  label="Institute Name"
                  name="name"
                  register={register}
                  placeholder="e.g. Bright Future School"
                  required
                  className="sm:col-span-2"
                />
                <InputField
                  label="City / Location"
                  name="city"
                  register={register}
                  placeholder="e.g. Lahore"
                />
                <InputField
                  label="Contact Email"
                  name="contact"
                  register={register}
                  type="email"
                  placeholder="admin@school.pk"
                />
                <SelectField
                  label="Institute Type"
                  name="institute_type"
                  control={control}
                  options={TYPE_OPTIONS}
                  placeholder="Select type…"
                  required
                />
                <CheckboxField
                  label="Has Multiple Branches?"
                  name="has_branches"
                  control={control}
                />
                <div className="sm:col-span-2 flex justify-end pt-1">
                  <FormSubmitButton
                    loading={updateMutation.isPending}
                    label="Save Changes"
                    loadingLabel="Saving…"
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          {/* People Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users size={16} /> People
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="students" className="w-full">
                <div className="border-b px-4">
                  <TabsList className="h-auto bg-transparent rounded-none gap-1 pb-0">
                    <TabsTrigger value="students" className="text-xs rounded-b-none pb-2.5">
                      🎓 Students ({DUMMY_INSTITUTE_STUDENTS.length})
                    </TabsTrigger>
                    <TabsTrigger value="teachers" className="text-xs rounded-b-none pb-2.5">
                      👨‍🏫 Teachers ({DUMMY_INSTITUTE_TEACHERS.length})
                    </TabsTrigger>
                    <TabsTrigger value="parents" className="text-xs rounded-b-none pb-2.5">
                      👨‍👩‍👧 Parents ({DUMMY_INSTITUTE_PARENTS.length})
                    </TabsTrigger>
                    <TabsTrigger value="staff" className="text-xs rounded-b-none pb-2.5">
                      💼 Staff ({DUMMY_INSTITUTE_STAFF.length})
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="p-4">
                  <TabsContent value="students">
                    <StudentTable onView={openPerson('student')} />
                  </TabsContent>
                  <TabsContent value="teachers">
                    <TeacherTable onView={openPerson('teacher')} />
                  </TabsContent>
                  <TabsContent value="parents">
                    <ParentTable onView={openPerson('parent')} />
                  </TabsContent>
                  <TabsContent value="staff">
                    <StaffTable onView={openPerson('staff')} />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* ── Right 1/3: Status + Subscription + Meta ── */}
        <div className="space-y-6">

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield size={16} /> Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Status</span>
                <StatusBadge status={isActive ? 'active' : 'inactive'} />
              </div>
              <Separator />
              <Button
                variant={isActive ? 'destructive' : 'default'}
                size="sm"
                className="w-full"
                disabled={toggleMutation.isPending}
                onClick={() => toggleMutation.mutate(!isActive)}
              >
                {toggleMutation.isPending
                  ? 'Updating…'
                  : isActive ? 'Deactivate Institute' : 'Activate Institute'}
              </Button>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard size={16} /> Subscription
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setSubEditOpen(true)}
                >
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(school.plan || sub) ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Plan</span>
                    <Badge variant="outline" className="capitalize bg-violet-50 text-violet-700 border-violet-200">
                      {school.plan ?? sub?.plan}
                    </Badge>
                  </div>
                  <Separator />
                  <InfoRow label="Start"   value={fmtDate(sub?.start_date ?? sub?.start)} />
                  <InfoRow label="Expires" value={fmtDate(expires)} />
                  <InfoRow
                    label="Amount"
                    value={sub?.amount ? `PKR ${Number(sub.amount).toLocaleString()}` : '—'}
                  />
                  <InfoRow
                    label="Sub Status"
                    value={<StatusBadge status={sub?.status ?? (isActive ? 'active' : 'inactive')} />}
                  />

                  {/* Days remaining bar */}
                  {daysLeft != null && (
                    <div className="pt-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                        <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</span>
                        <span
                          className={cn(
                            'font-medium',
                            daysLeft <= 0 ? 'text-red-500' : daysLeft <= 30 ? 'text-amber-500' : 'text-emerald-600',
                          )}
                        >
                          {daysLeft <= 0 ? '⚠ Expired' : daysLeft <= 30 ? '⚠ Expiring soon' : '✓ Valid'}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={cn(
                            'h-1.5 rounded-full transition-all',
                            daysLeft <= 0 ? 'bg-red-500' : daysLeft <= 30 ? 'bg-amber-400' : 'bg-emerald-500',
                          )}
                          style={{ width: `${Math.max(2, Math.min(100, (daysLeft / 365) * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No subscription assigned.{' '}
                  <a href="/master-admin/subscriptions" className="text-primary underline">
                    Assign one →
                  </a>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Meta details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Code"       value={<span className="font-mono bg-slate-50 rounded px-1 text-xs">{school.code}</span>} />
              <InfoRow label="Type"       value={<span className="capitalize">{school.type ?? school.institute_type ?? '—'}</span>} />
              <InfoRow label="City"       value={school.city ?? '—'} />
              <InfoRow label="Branches"   value={school.branches ?? (school.has_branches ? 'Multiple' : 'Single')} />
              <InfoRow label="Contact"    value={<span className="text-xs">{school.contact}</span>} />
              <InfoRow label="Joined"     value={fmtDate(school.createdAt ?? school.joined)} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <PersonDetailModal
        person={selectedPerson}
        type={personType}
        onClose={closePerson}
      />
      <SubEditModal
        open={subEditOpen}
        onClose={() => setSubEditOpen(false)}
        school={school}
      />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-right">{value ?? '—'}</span>
    </div>
  );
}

// import { toast } from 'sonner';

// import { masterAdminService } from '@/services';
// import {
//   PageHeader,
//   AppBreadcrumb,
//   PageLoader,
//   ErrorAlert,
//   InputField,
//   CheckboxField,
//   SwitchField,
//   FormSubmitButton,
//   StatusBadge,
//   SectionHeader,
// } from '@/components/common';
// import { Button }     from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Separator }  from '@/components/ui/separator';
// import { Badge }      from '@/components/ui/badge';

// // ─── API ─────────────────────────────────────────────────────
// const fetchSchool  = (id)          => masterAdminService.getSchoolById(id);
// const updateSchool = (id, body)    => masterAdminService.updateSchool(id, body);
// const toggleStatus = (id, is_active) => masterAdminService.toggleSchoolStatus(id, is_active);

// // ─── Page ─────────────────────────────────────────────────────
// export default function InstituteDetailPage({ params }) {
//   const { id }  = use(params);
//   const router  = useRouter();
//   const qc      = useQueryClient();

//   const { data: school, isLoading, error } = useQuery({
//     queryKey: ['master-school', id],
//     queryFn:  () => fetchSchool(id),
//     enabled:  !!id,
//   });

//   const updateMutation = useMutation({
//     mutationFn: (body) => updateSchool(id, body),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['master-school', id] });
//       qc.invalidateQueries({ queryKey: ['master-schools']     });
//       toast.success('Institute updated');
//     },
//     onError: (e) => toast.error(e?.response?.data?.message ?? 'Update failed'),
//   });

//   const toggleMutation = useMutation({
//     mutationFn: (is_active) => toggleStatus(id, is_active),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['master-school', id] });
//       qc.invalidateQueries({ queryKey: ['master-institutes']  });
//       toast.success('Status updated');
//     },
//     onError: (e) => toast.error(e?.response?.data?.message ?? 'Update failed'),
//   });

//   const { register, control, handleSubmit, formState: { errors } } = useForm({
//     values: school ? { name: school.name, has_branches: school.has_branches } : {},
//   });

//   if (isLoading) return <PageLoader message="Loading institute…" />;
//   if (error)     return <ErrorAlert message="Failed to load institute data." />;
//   if (!school)   return null;

//   const sub = school.subscription;

//   return (
//     <div className="space-y-6">
//       <AppBreadcrumb
//         items={[
//           { label: 'Institutes', href: '/master-admin/schools' },
//           { label: school.name },
//         ]}
//       />

//       <PageHeader
//         title={school.name}
//         description={`Code: ${school.code}`}
//         action={
//           <Button variant="outline" onClick={() => router.back()}>
//             <ArrowLeft size={14} className="mr-2" /> Back
//           </Button>
//         }
//       />

//       <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

//         {/* ── Left column: Edit form ── */}
//         <div className="lg:col-span-2 space-y-6">

//           {/* Basic info */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-base">
//                 <Building2 size={16} /> Basic Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <form
//                 onSubmit={handleSubmit((body) => updateMutation.mutate(body))}
//                 className="space-y-4"
//               >
//                 <InputField
//                   label="Institute Name"
//                   name="name"
//                   register={register}
//                   error={errors.name}
//                   required
//                 />
//                 <CheckboxField
//                   label="This institute has multiple branches"
//                   name="has_branches"
//                   control={control}
//                 />
//                 <div className="flex justify-end pt-2">
//                   <FormSubmitButton
//                     loading={updateMutation.isPending}
//                     label="Save Changes"
//                     loadingLabel="Saving…"
//                   />
//                 </div>
//               </form>
//             </CardContent>
//           </Card>

//           {/* Subscription details */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-base">
//                 <CreditCard size={16} /> Subscription
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {sub ? (
//                 <div className="space-y-3 text-sm">
//                   <Row label="Plan"       value={<Badge variant="outline">{sub.plan}</Badge>} />
//                   <Separator />
//                   <Row label="Start Date" value={sub.start_date ? new Date(sub.start_date).toLocaleDateString() : '—'} />
//                   <Row label="End Date"   value={sub.end_date   ? new Date(sub.end_date).toLocaleDateString()   : '—'} />
//                   <Row label="Amount"     value={sub.amount != null ? `PKR ${Number(sub.amount).toLocaleString()}` : '—'} />
//                   <Row label="Status"     value={<StatusBadge status={sub.status ?? (sub.is_active ? 'active' : 'inactive')} />} />
//                 </div>
//               ) : (
//                 <p className="text-sm text-muted-foreground">
//                   No subscription assigned.{' '}
//                   <a href="/master-admin/subscriptions" className="text-primary underline">
//                     Manage subscriptions →
//                   </a>
//                 </p>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* ── Right column: Status & meta ── */}
//         <div className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-base">
//                 <Shield size={16} /> Status
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm">Current status</span>
//                 <StatusBadge status={school.is_active ? 'active' : 'inactive'} />
//               </div>
//               <Separator />
//               <Button
//                 variant={school.is_active ? 'destructive' : 'default'}
//                 size="sm"
//                 className="w-full"
//                 disabled={toggleMutation.isPending}
//                 onClick={() => toggleMutation.mutate(!school.is_active)}
//               >
//                 {toggleMutation.isPending
//                   ? 'Updating…'
//                   : school.is_active ? 'Deactivate Institute' : 'Activate Institute'}
//               </Button>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="text-base">Details</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3 text-sm">
//               <Row label="Code"           value={<span className="font-mono">{school.code}</span>} />
//               <Row label="Type"           value={school.institute_type ?? '—'} />
//               <Row label="Has Branches"   value={school.has_branches ? 'Yes' : 'No'} />
//               <Row label="Created"        value={school.createdAt ? new Date(school.createdAt).toLocaleDateString() : '—'} />
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Row({ label, value }) {
//   return (
//     <div className="flex items-center justify-between">
//       <span className="text-muted-foreground">{label}</span>
//       <span>{value}</span>
//     </div>
//   );
// }
