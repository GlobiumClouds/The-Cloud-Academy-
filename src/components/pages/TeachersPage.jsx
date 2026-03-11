<<<<<<< HEAD
'use client';
=======
// 'use client';
// /**
//  * TeachersPage — Adaptive for all institute types
//  * School → Teachers | Coaching → Instructors | Academy → Trainers
//  * College → Lecturers | University → Faculty / Staff
//  */
// import { useState, useMemo } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { toast } from 'sonner';
// import { Plus, Pencil, Trash2, GraduationCap, Phone, Mail } from 'lucide-react';

// import useInstituteConfig from '@/hooks/useInstituteConfig';
// import useAuthStore from '@/store/authStore';
// import DataTable from '@/components/common/DataTable';
// import PageHeader from '@/components/common/PageHeader';
// import AppModal from '@/components/common/AppModal';
// import SelectField from '@/components/common/SelectField';
// import DatePickerField from '@/components/common/DatePickerField';
// import StatsCard from '@/components/common/StatsCard';
// import { cn } from '@/lib/utils';
// import { DUMMY_FLAT_TEACHERS } from '@/data/dummyData';

// // ─── Options ────────────────────────────────────────────────────────────────
// const GENDER_OPTIONS   = [{ value:'male', label:'Male' }, { value:'female', label:'Female' }, { value:'other', label:'Other' }];
// const STATUS_OPTIONS   = [{ value:'true', label:'Active' }, { value:'false', label:'Inactive' }];
// const SUBJECT_OPTIONS  = [
//   { value:'mathematics', label:'Mathematics' }, { value:'physics', label:'Physics' },
//   { value:'chemistry', label:'Chemistry' }, { value:'biology', label:'Biology' },
//   { value:'english', label:'English' }, { value:'computer', label:'Computer Science' },
//   { value:'urdu', label:'Urdu' }, { value:'islamiat', label:'Islamiat' },
// ];

// // ─── Zod schema ─────────────────────────────────────────────────────────────
// const schema = z.object({
//   first_name:  z.string().min(2, 'First name required'),
//   last_name:   z.string().min(2, 'Last name required'),
//   email:       z.string().email('Valid email required'),
//   phone:       z.string().min(10, 'Phone required'),
//   gender:      z.string().min(1, 'Select gender'),
//   joining_date:z.string().optional(),
//   qualification:z.string().optional(),
//   specialization:z.string().optional(),
//   is_active:   z.string().optional(),
// });

// // ─── Dummy fallback ──────────────────────────────────────────────────────────
// const genDummy = (type) => {
//   const base = DUMMY_FLAT_TEACHERS ?? [];
//   return base.length ? base : [
//     { id:'t1', first_name:'Ahmed', last_name:'Raza', email:'ahmed@inst.pk', phone:'0300-1234567', gender:'male', qualification:'M.Sc Physics', joining_date:'2022-04-01', is_active:true },
//   ];
// };

// export default function TeachersPage({ type }) {
//   const qc     = useQueryClient();
//   const canDo  = useAuthStore((s) => s.canDo);
//   const { terms } = useInstituteConfig();
//   const label  = terms.teacher ?? 'Teacher';
//   const labelP = terms.teachers ?? 'Teachers';

//   const [search,   setSearch]   = useState('');
//   const [status,   setStatus]   = useState('');
//   const [page,     setPage]     = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [modal,    setModal]    = useState(false);
//   const [editing,  setEditing]  = useState(null);
//   const [deleting, setDeleting] = useState(null);

//   // Form
//   const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
//     resolver: zodResolver(schema),
//     defaultValues: { is_active: 'true', gender: '' },
//   });

//   // Fetch
//   const { data, isLoading } = useQuery({
//     queryKey: ['teachers', type, page, pageSize, search, status],
//     queryFn: async () => {
//       try {
//         const { teacherService } = await import('@/services');
//         return await teacherService.getAll({ page, limit: pageSize, search, is_active: status });
//       } catch {
//         const dummy = genDummy(type).filter(t =>
//           (!search || `${t.first_name} ${t.last_name}`.toLowerCase().includes(search.toLowerCase())) &&
//           (!status || String(t.is_active) === status)
//         );
//         const slice = dummy.slice((page-1)*pageSize, page*pageSize);
//         return { data: { rows: slice, total: dummy.length, totalPages: Math.max(1, Math.ceil(dummy.length / pageSize)) } };
//       }
//     },
//     placeholderData: (p) => p,
//   });

//   const teachers   = data?.data?.rows       ?? genDummy(type);
//   const total      = data?.data?.total      ?? teachers.length;
//   const totalPages = data?.data?.totalPages ?? 1;

//   // Save mutation
//   const save = useMutation({
//     mutationFn: async (vals) => {
//       try {
//         const { teacherService } = await import('@/services');
//         return editing
//           ? await teacherService.update(editing.id, vals)
//           : await teacherService.create(vals);
//       } catch { return { data: { ...vals, id: `t-${Date.now()}` } }; }
//     },
//     onSuccess: () => {
//       toast.success(editing ? `${label} updated` : `${label} added`);
//       qc.invalidateQueries({ queryKey: ['teachers'] });
//       closeModal();
//     },
//     onError: () => toast.error('Save failed'),
//   });

//   const remove = useMutation({
//     mutationFn: async (id) => {
//       try { const { teacherService } = await import('@/services'); return await teacherService.delete(id); }
//       catch { return { success: true }; }
//     },
//     onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['teachers'] }); setDeleting(null); },
//     onError: () => toast.error('Delete failed'),
//   });

//   const openAdd  = () => { setEditing(null); reset({ is_active:'true', gender:'' }); setModal(true); };
//   const openEdit = (row) => {
//     setEditing(row);
//     reset({ ...row, is_active: String(row.is_active), gender: row.gender ?? '' });
//     setModal(true);
//   };
//   const closeModal = () => { setModal(false); setEditing(null); reset(); };

//   // Columns
//   const columns = useMemo(() => [
//     {
//       accessorKey: 'name',
//       header: 'Name',
//       cell: ({ row: { original: t } }) => (
//         <div className="flex items-center gap-2">
//           <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
//             {t.first_name?.[0]}{t.last_name?.[0]}
//           </div>
//           <div>
//             <p className="font-medium leading-tight">{t.first_name} {t.last_name}</p>
//             <p className="text-xs text-muted-foreground">{t.qualification}</p>
//           </div>
//         </div>
//       ),
//     },
//     {
//       accessorKey: 'contact',
//       header: 'Contact',
//       cell: ({ row: { original: t } }) => (
//         <div className="space-y-0.5 text-xs">
//           <div className="flex items-center gap-1"><Mail size={11} />{t.email}</div>
//           <div className="flex items-center gap-1"><Phone size={11} />{t.phone}</div>
//         </div>
//       ),
//     },
//     { accessorKey: 'gender', header: 'Gender', cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
//     { accessorKey: 'joining_date', header: 'Joined', cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('en-PK') : '—' },
//     {
//       accessorKey: 'is_active',
//       header: 'Status',
//       cell: ({ getValue }) => (
//         <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getValue() ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500')}>
//           {getValue() ? 'Active' : 'Inactive'}
//         </span>
//       ),
//     },
//     {
//       id: 'actions', header: 'Actions', enableHiding: false,
//       cell: ({ row }) => (
//         <div className="flex justify-end gap-1">
//           {canDo('teachers.update') && (
//             <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>
//           )}
//           {canDo('teachers.delete') && (
//             <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>
//           )}
//         </div>
//       ),
//     },
//   ], [canDo]);

//   const active   = teachers.filter(t => t.is_active).length;
//   const inactive = teachers.filter(t => !t.is_active).length;

//   return (
//     <div className="space-y-5">
//       <PageHeader title={labelP} description={`${total} total`} />

//       {/* Stats */}
//       <div className="grid gap-4 sm:grid-cols-3">
//         <StatsCard label={`Total ${labelP}`} value={total} icon={<GraduationCap size={18} />} />
//         <StatsCard label="Active" value={active} icon={<GraduationCap size={18} />} trend={null} description="currently teaching" />
//         <StatsCard label="Inactive" value={inactive} icon={<GraduationCap size={18} />} />
//       </div>

//       {/* Table */}
//       <DataTable
//         columns={columns} data={teachers} loading={isLoading}
//         emptyMessage={`No ${labelP.toLowerCase()} found`}
//         search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder={`Search ${labelP.toLowerCase()}…`}
//         filters={[{ name:'status', label:'Status', value:status, onChange:(v)=>{ setStatus(v); setPage(1); }, options:STATUS_OPTIONS }]}
//         action={canDo('teachers.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> Add {label}</button> : null}
//         enableColumnVisibility
//         exportConfig={{ fileName: 'teachers' }}
//         pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
//       />

//       {/* Add / Edit Modal */}
//       <AppModal open={modal} onClose={closeModal} title={editing ? `Edit ${label}` : `Add ${label}`} size="lg"
//         footer={<>
//           <button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
//           <button type="submit" form="teacher-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
//             {save.isPending ? 'Saving…' : editing ? 'Update' : 'Add'}
//           </button>
//         </>}
//       >
//         <form id="teacher-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-1.5">
//               <label className="text-sm font-medium">First Name *</label>
//               <input {...register('first_name')} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Muhammad" />
//               {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
//             </div>
//             <div className="space-y-1.5">
//               <label className="text-sm font-medium">Last Name *</label>
//               <input {...register('last_name')} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Ahmed" />
//               {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-1.5">
//               <label className="text-sm font-medium">Email *</label>
//               <input {...register('email')} type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="email@inst.pk" />
//               {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
//             </div>
//             <div className="space-y-1.5">
//               <label className="text-sm font-medium">Phone *</label>
//               <input {...register('phone')} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="0300-1234567" />
//               {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <SelectField label="Gender" name="gender" control={control} error={errors.gender} options={GENDER_OPTIONS} placeholder="Select gender" required />
//             <DatePickerField label="Joining Date" name="joining_date" control={control} error={errors.joining_date} />
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Qualification</label>
//             <input {...register('qualification')} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="M.Sc Physics" />
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Specialization</label>
//             <input {...register('specialization')} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Algebra, Mechanics" />
//           </div>
//           <SelectField label="Status" name="is_active" control={control} error={errors.is_active} options={STATUS_OPTIONS} />
//         </form>
//       </AppModal>

//       {/* Delete Confirm */}
//       <AppModal open={!!deleting} onClose={() => setDeleting(null)} title={`Delete ${label}`} size="sm"
//         footer={
//           <>
//             <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
//             <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
//               {remove.isPending ? 'Deleting' : 'Delete'}
//             </button>
//           </>
//         }>
//         <p className="text-sm text-muted-foreground">Delete <strong>{deleting?.first_name} {deleting?.last_name}</strong>? This cannot be undone.</p>
//       </AppModal>
//     </div>
//   );
// }

'use client';

>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
/**
 * TeachersPage — Adaptive for all institute types
 * School → Teachers | Coaching → Instructors | Academy → Trainers
 * College → Lecturers | University → Faculty / Staff
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
<<<<<<< HEAD
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GraduationCap, Phone, Mail } from 'lucide-react';
=======
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GraduationCap, Phone, Mail, Eye } from 'lucide-react';
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c

import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
<<<<<<< HEAD
import SelectField from '@/components/common/SelectField';
import DatePickerField from '@/components/common/DatePickerField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_FLAT_TEACHERS } from '@/data/dummyData';

// ─── Options ────────────────────────────────────────────────────────────────
const GENDER_OPTIONS   = [{ value:'male', label:'Male' }, { value:'female', label:'Female' }, { value:'other', label:'Other' }];
const STATUS_OPTIONS   = [{ value:'true', label:'Active' }, { value:'false', label:'Inactive' }];
const SUBJECT_OPTIONS  = [
  { value:'mathematics', label:'Mathematics' }, { value:'physics', label:'Physics' },
  { value:'chemistry', label:'Chemistry' }, { value:'biology', label:'Biology' },
  { value:'english', label:'English' }, { value:'computer', label:'Computer Science' },
  { value:'urdu', label:'Urdu' }, { value:'islamiat', label:'Islamiat' },
];

// ─── Zod schema ─────────────────────────────────────────────────────────────
const schema = z.object({
  first_name:  z.string().min(2, 'First name required'),
  last_name:   z.string().min(2, 'Last name required'),
  email:       z.string().email('Valid email required'),
  phone:       z.string().min(10, 'Phone required'),
  gender:      z.string().min(1, 'Select gender'),
  joining_date:z.string().optional(),
  qualification:z.string().optional(),
  specialization:z.string().optional(),
  is_active:   z.string().optional(),
});
=======
import TeacherForm from '@/components/forms/TeacherForm';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_FLAT_TEACHERS } from '@/data/dummyData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';

// ─── Options ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }];

// Dummy options (in real app, fetch from API)
const DEPARTMENT_OPTIONS = [
  { value: 'science', label: 'Science' },
  { value: 'math', label: 'Mathematics' },
  { value: 'english', label: 'English' },
  { value: 'computer', label: 'Computer Science' },
];

const SUBJECT_OPTIONS = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'english', label: 'English' },
  { value: 'computer', label: 'Computer Science' },
  { value: 'urdu', label: 'Urdu' },
  { value: 'islamiat', label: 'Islamiat' },
];

const DESIGNATION_OPTIONS = [
  { value: 'senior_teacher', label: 'Senior Teacher' },
  { value: 'junior_teacher', label: 'Junior Teacher' },
  { value: 'lecturer', label: 'Lecturer' },
  { value: 'assistant_professor', label: 'Assistant Professor' },
  { value: 'associate_professor', label: 'Associate Professor' },
  { value: 'professor', label: 'Professor' },
];

const BRANCH_OPTIONS = [
  { value: 'main', label: 'Main Campus' },
  { value: 'city', label: 'City Campus' },
  { value: 'north', label: 'North Branch' },
];
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c

// ─── Dummy fallback ──────────────────────────────────────────────────────────
const genDummy = (type) => {
  const base = DUMMY_FLAT_TEACHERS ?? [];
  return base.length ? base : [
<<<<<<< HEAD
    { id:'t1', first_name:'Ahmed', last_name:'Raza', email:'ahmed@inst.pk', phone:'0300-1234567', gender:'male', qualification:'M.Sc Physics', joining_date:'2022-04-01', is_active:true },
=======
    { 
      id: 't1', 
      first_name: 'Ahmed', 
      last_name: 'Raza', 
      email: 'ahmed@inst.pk', 
      phone: '0300-1234567', 
      gender: 'male', 
      qualification: 'M.Sc Physics',
      specialization: 'Quantum Mechanics',
      joining_date: '2022-04-01', 
      is_active: true,
      employee_id: 'EMP-001',
      designation: 'Senior Teacher',
      department: 'Science',
      subjects: ['physics', 'mathematics'],
      details: {
        teacherDetails: {
          basic_salary: 45000,
          bank_name: 'HBL',
          bank_account_no: '1234567890'
        }
      }
    },
    { 
      id: 't2', 
      first_name: 'Fatima', 
      last_name: 'Ahmed', 
      email: 'fatima@inst.pk', 
      phone: '0301-7654321', 
      gender: 'female', 
      qualification: 'M.A English',
      specialization: 'Linguistics',
      joining_date: '2023-01-15', 
      is_active: true,
      employee_id: 'EMP-002',
      designation: 'Lecturer',
      department: 'English',
      subjects: ['english', 'urdu'],
      details: {
        teacherDetails: {
          basic_salary: 40000,
          bank_name: 'UBL',
          bank_account_no: '0987654321'
        }
      }
    },
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
  ];
};

export default function TeachersPage({ type }) {
<<<<<<< HEAD
  const qc     = useQueryClient();
  const canDo  = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const label  = terms.teacher ?? 'Teacher';
  const labelP = terms.teachers ?? 'Teachers';

  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Form
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { is_active: 'true', gender: '' },
  });

  // Fetch
=======
  const qc = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const label = terms.teacher ?? 'Teacher';
  const labelP = terms.teachers ?? 'Teachers';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Modal states
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'add', // 'add' | 'edit' | 'view'
    data: null
  });

  const [deleting, setDeleting] = useState(null);

  // Fetch teachers
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
  const { data, isLoading } = useQuery({
    queryKey: ['teachers', type, page, pageSize, search, status],
    queryFn: async () => {
      try {
        const { teacherService } = await import('@/services');
<<<<<<< HEAD
        return await teacherService.getAll({ page, limit: pageSize, search, is_active: status });
=======
        return await teacherService.getAll({ 
          page, 
          limit: pageSize, 
          search, 
          is_active: status 
        });
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
      } catch {
        const dummy = genDummy(type).filter(t =>
          (!search || `${t.first_name} ${t.last_name}`.toLowerCase().includes(search.toLowerCase())) &&
          (!status || String(t.is_active) === status)
        );
        const slice = dummy.slice((page-1)*pageSize, page*pageSize);
<<<<<<< HEAD
        return { data: { rows: slice, total: dummy.length, totalPages: Math.max(1, Math.ceil(dummy.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const teachers   = data?.data?.rows       ?? genDummy(type);
  const total      = data?.data?.total      ?? teachers.length;
=======
        return { 
          data: { 
            rows: slice, 
            total: dummy.length, 
            totalPages: Math.max(1, Math.ceil(dummy.length / pageSize)) 
          } 
        };
      }
    },
    placeholderData: (prev) => prev,
  });

  const teachers = data?.data?.rows ?? genDummy(type);
  const total = data?.data?.total ?? teachers.length;
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
  const totalPages = data?.data?.totalPages ?? 1;

  // Save mutation
  const save = useMutation({
<<<<<<< HEAD
    mutationFn: async (vals) => {
      try {
        const { teacherService } = await import('@/services');
        return editing
          ? await teacherService.update(editing.id, vals)
          : await teacherService.create(vals);
      } catch { return { data: { ...vals, id: `t-${Date.now()}` } }; }
    },
    onSuccess: () => {
      toast.success(editing ? `${label} updated` : `${label} added`);
=======
    mutationFn: async (formData) => {
      try {
        const { teacherService } = await import('@/services');
        
        // Prepare data for API
        const apiData = {
          ...formData,
          user_type: 'TEACHER',
          school_id: 'current-school-id', // Get from context/auth
        };
        
        if (modalState.mode === 'edit' && modalState.data) {
          return await teacherService.update(modalState.data.id, apiData);
        } else {
          return await teacherService.create(apiData);
        }
      } catch (error) {
        console.error('Save error:', error);
        // Fallback for development
        return { 
          data: { 
            ...formData, 
            id: modalState.mode === 'edit' ? modalState.data.id : `t-${Date.now()}` 
          } 
        };
      }
    },
    onSuccess: () => {
      toast.success(modalState.mode === 'edit' ? `${label} updated` : `${label} added`);
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
      qc.invalidateQueries({ queryKey: ['teachers'] });
      closeModal();
    },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
<<<<<<< HEAD
      try { const { teacherService } = await import('@/services'); return await teacherService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['teachers'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ is_active:'true', gender:'' }); setModal(true); };
  const openEdit = (row) => {
    setEditing(row);
    reset({ ...row, is_active: String(row.is_active), gender: row.gender ?? '' });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  // Columns
=======
      try { 
        const { teacherService } = await import('@/services'); 
        return await teacherService.delete(id); 
      } catch { 
        return { success: true }; 
      }
    },
    onSuccess: () => { 
      toast.success('Deleted'); 
      qc.invalidateQueries({ queryKey: ['teachers'] }); 
      setDeleting(null); 
    },
    onError: () => toast.error('Delete failed'),
  });

  // Modal handlers
  const openAddModal = () => {
    setModalState({
      isOpen: true,
      mode: 'add',
      data: null
    });
  };

  const openEditModal = (teacher) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      data: teacher
    });
  };

  const openViewModal = (teacher) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      data: teacher
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: 'add',
      data: null
    });
  };

  // Form submit handler
  const handleFormSubmit = async (formData) => {
    save.mutate(formData);
  };

  // Get modal title
  const getModalTitle = () => {
    if (modalState.mode === 'add') return `Add ${label}`;
    if (modalState.mode === 'edit') return `Edit ${label}`;
    return `View ${label}`;
  };

  // Columns for DataTable
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row: { original: t } }) => (
<<<<<<< HEAD
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {t.first_name?.[0]}{t.last_name?.[0]}
          </div>
          <div>
            <p className="font-medium leading-tight">{t.first_name} {t.last_name}</p>
            <p className="text-xs text-muted-foreground">{t.qualification}</p>
=======
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
              {t.first_name?.[0]}{t.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium leading-tight">{t.first_name} {t.last_name}</p>
            <p className="text-xs text-muted-foreground">{t.qualification || t.designation}</p>
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row: { original: t } }) => (
        <div className="space-y-0.5 text-xs">
<<<<<<< HEAD
          <div className="flex items-center gap-1"><Mail size={11} />{t.email}</div>
          <div className="flex items-center gap-1"><Phone size={11} />{t.phone}</div>
        </div>
      ),
    },
    { accessorKey: 'gender', header: 'Gender', cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
    { accessorKey: 'joining_date', header: 'Joined', cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('en-PK') : '—' },
=======
          <div className="flex items-center gap-1"><Mail size={11} className="text-muted-foreground" />{t.email}</div>
          <div className="flex items-center gap-1"><Phone size={11} className="text-muted-foreground" />{t.phone}</div>
        </div>
      ),
    },
    { 
      accessorKey: 'employee_id', 
      header: 'Employee ID',
      cell: ({ getValue }) => getValue() || '—'
    },
    { 
      accessorKey: 'department', 
      header: 'Department',
      cell: ({ getValue }) => getValue() || '—'
    },
    { 
      accessorKey: 'joining_date', 
      header: 'Joined', 
      cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('en-PK') : '—' 
    },
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ getValue }) => (
<<<<<<< HEAD
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getValue() ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500')}>
          {getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions', header: 'Actions', enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          {canDo('teacher.update') && (
            <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>
          )}
          {canDo('teacher.delete') && (
            <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>
=======
        <Badge variant={getValue() ? 'success' : 'secondary'}>
          {getValue() ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <button 
            onClick={() => openViewModal(row.original)} 
            className="rounded p-1.5 hover:bg-accent" 
            title="View Details"
          >
            <Eye size={13} />
          </button>
          {canDo('teachers.update') && (
            <button 
              onClick={() => openEditModal(row.original)} 
              className="rounded p-1.5 hover:bg-accent" 
              title="Edit"
            >
              <Pencil size={13} />
            </button>
          )}
          {canDo('teachers.delete') && (
            <button 
              onClick={() => setDeleting(row.original)} 
              className="rounded p-1.5 text-destructive hover:bg-destructive/10" 
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
          )}
        </div>
      ),
    },
  ], [canDo]);

<<<<<<< HEAD
  const active   = teachers.filter(t => t.is_active).length;
  const inactive = teachers.filter(t => !t.is_active).length;

  return (
    <div className="space-y-5">
      <PageHeader title={labelP} description={`${total} total`} />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label={`Total ${labelP}`} value={total} icon={<GraduationCap size={18} />} />
        <StatsCard label="Active" value={active} icon={<GraduationCap size={18} />} trend={null} description="currently teaching" />
        <StatsCard label="Inactive" value={inactive} icon={<GraduationCap size={18} />} />
      </div>

      {/* Table */}
      <DataTable
        columns={columns} data={teachers} loading={isLoading}
        emptyMessage={`No ${labelP.toLowerCase()} found`}
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder={`Search ${labelP.toLowerCase()}…`}
        filters={[{ name:'status', label:'Status', value:status, onChange:(v)=>{ setStatus(v); setPage(1); }, options:STATUS_OPTIONS }]}
        action={canDo('teacher.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> Add {label}</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'teachers' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
      />

      {/* Add / Edit Modal */}
      <AppModal open={modal} onClose={closeModal} title={editing ? `Edit ${label}` : `Add ${label}`} size="lg"
        footer={<>
          <button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
          <button type="submit" form="teacher-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {save.isPending ? 'Saving…' : editing ? 'Update' : 'Add'}
          </button>
        </>}
      >
        <form id="teacher-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">First Name *</label>
              <input {...register('first_name')} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Muhammad" />
              {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Last Name *</label>
              <input {...register('last_name')} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Ahmed" />
              {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email *</label>
              <input {...register('email')} type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="email@inst.pk" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone *</label>
              <input {...register('phone')} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="0300-1234567" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Gender" name="gender" control={control} error={errors.gender} options={GENDER_OPTIONS} placeholder="Select gender" required />
            <DatePickerField label="Joining Date" name="joining_date" control={control} error={errors.joining_date} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Qualification</label>
            <input {...register('qualification')} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="M.Sc Physics" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Specialization</label>
            <input {...register('specialization')} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Algebra, Mechanics" />
          </div>
          <SelectField label="Status" name="is_active" control={control} error={errors.is_active} options={STATUS_OPTIONS} />
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title={`Delete ${label}`} size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {remove.isPending ? 'Deleting\u2026' : 'Delete'}
            </button>
          </>
        }>
        <p className="text-sm text-muted-foreground">Delete <strong>{deleting?.first_name} {deleting?.last_name}</strong>? This cannot be undone.</p>
=======
  const active = teachers.filter(t => t.is_active).length;
  const inactive = teachers.filter(t => !t.is_active).length;

  // Render view mode
  const renderViewMode = () => {
    const teacher = modalState.data;
    if (!teacher) return null;

    return (
      <div className="space-y-6">
        {/* Header with Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
              {teacher.first_name?.[0]}{teacher.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{teacher.first_name} {teacher.last_name}</h3>
            <p className="text-sm text-muted-foreground">{teacher.designation} • {teacher.department}</p>
            <Badge variant={teacher.is_active ? 'success' : 'secondary'} className="mt-1">
              {teacher.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="bank">Bank</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardContent className="p-4">
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">Full Name</dt>
                    <dd className="font-medium">{teacher.first_name} {teacher.last_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Gender</dt>
                    <dd className="font-medium capitalize">{teacher.gender || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Email</dt>
                    <dd className="font-medium">{teacher.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Phone</dt>
                    <dd className="font-medium">{teacher.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">CNIC</dt>
                    <dd className="font-medium">{teacher.cnic || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Date of Birth</dt>
                    <dd className="font-medium">{teacher.dob ? new Date(teacher.dob).toLocaleDateString() : '—'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional">
            <Card>
              <CardContent className="p-4">
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">Employee ID</dt>
                    <dd className="font-medium">{teacher.employee_id || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Designation</dt>
                    <dd className="font-medium">{teacher.designation || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Department</dt>
                    <dd className="font-medium">{teacher.department || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Joining Date</dt>
                    <dd className="font-medium">{teacher.joining_date ? new Date(teacher.joining_date).toLocaleDateString() : '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Employment Type</dt>
                    <dd className="font-medium capitalize">{teacher.employment_type || 'Permanent'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic">
            <Card>
              <CardContent className="p-4">
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">Qualification</dt>
                    <dd className="font-medium">{teacher.qualification || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Specialization</dt>
                    <dd className="font-medium">{teacher.specialization || '—'}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-sm text-muted-foreground mb-2">Subjects</dt>
                    <dd>
                      {teacher.subjects && teacher.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {teacher.subjects.map(subj => (
                            <Badge key={subj} variant="outline">{subj}</Badge>
                          ))}
                        </div>
                      ) : '—'}
                    </dd>
                  </div>
                </dl>

                {teacher.details?.teacherDetails?.qualifications?.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <h4 className="text-sm font-semibold mb-3">Qualifications</h4>
                    {teacher.details.teacherDetails.qualifications.map((qual, idx) => (
                      <div key={idx} className="mb-3 p-3 border rounded-lg">
                        <p className="font-medium">{qual.degree}</p>
                        <p className="text-sm text-muted-foreground">{qual.institute} • {qual.year}</p>
                        <p className="text-sm">Grade: {qual.grade}</p>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bank">
            <Card>
              <CardContent className="p-4">
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">Basic Salary</dt>
                    <dd className="font-medium">
                      {teacher.details?.teacherDetails?.basic_salary ? 
                        `PKR ${teacher.details.teacherDetails.basic_salary.toLocaleString()}` : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Bank Name</dt>
                    <dd className="font-medium">{teacher.details?.teacherDetails?.bank_name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Account No</dt>
                    <dd className="font-medium">{teacher.details?.teacherDetails?.bank_account_no || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Branch</dt>
                    <dd className="font-medium">{teacher.details?.teacherDetails?.bank_branch || '—'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={closeModal}>
            Close
          </Button>
          {canDo('teachers.update') && (
            <Button onClick={() => {
              closeModal();
              openEditModal(teacher);
            }}>
              Edit
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader 
        title={labelP} 
        description={`Manage ${labelP.toLowerCase()} • ${total} total`} 
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard 
          label={`Total ${labelP}`} 
          value={total} 
          icon={<GraduationCap size={18} />} 
        />
        <StatsCard 
          label="Active" 
          value={active} 
          icon={<GraduationCap size={18} />} 
          description="currently teaching"
        />
        <StatsCard 
          label="Inactive" 
          value={inactive} 
          icon={<GraduationCap size={18} />} 
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={teachers}
        loading={isLoading}
        emptyMessage={`No ${labelP.toLowerCase()} found`}
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={`Search ${labelP.toLowerCase()}…`}
        filters={[
          { 
            name: 'status', 
            label: 'Status', 
            value: status, 
            onChange: (v) => { setStatus(v); setPage(1); }, 
            options: STATUS_OPTIONS 
          }
        ]}
        action={
          canDo('teachers.create') ? (
            <button 
              onClick={openAddModal} 
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus size={14} /> Add {label}
            </button>
          ) : null
        }
        enableColumnVisibility
        exportConfig={{ 
          fileName: `${type}_teachers_${new Date().toISOString().split('T')[0]}`,
          sheetName: labelP
        }}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          total,
          pageSize,
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); }
        }}
      />

      {/* Add / Edit Modal with TeacherForm */}
      <AppModal
        open={modalState.isOpen && modalState.mode !== 'view'}
        onClose={closeModal}
        title={getModalTitle()}
        size="xl"
      >
        <TeacherForm
          defaultValues={modalState.mode === 'edit' ? modalState.data : {}}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          loading={save.isPending}
          departmentOptions={DEPARTMENT_OPTIONS}
          subjectOptions={SUBJECT_OPTIONS}
          branchOptions={BRANCH_OPTIONS}
          designationOptions={DESIGNATION_OPTIONS}
          isEdit={modalState.mode === 'edit'}
        />
      </AppModal>

      {/* View Modal */}
      <AppModal
        open={modalState.isOpen && modalState.mode === 'view'}
        onClose={closeModal}
        title={getModalTitle()}
        size="xl"
      >
        {renderViewMode()}
      </AppModal>

      {/* Delete Confirmation Modal */}
      <AppModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Delete ${label}`}
        size="sm"
        footer={
          <>
            <button 
              onClick={() => setDeleting(null)} 
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
            >
              Cancel
            </button>
            <button 
              onClick={() => remove.mutate(deleting?.id)} 
              disabled={remove.isPending} 
              className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {remove.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Delete <strong>{deleting?.first_name} {deleting?.last_name}</strong>? 
          This action cannot be undone.
        </p>
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
      </AppModal>
    </div>
  );
}
<<<<<<< HEAD
=======



>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
