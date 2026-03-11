<<<<<<< HEAD
'use client';
/**
 * TimetablePage — Weekly timetable grid view
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Grid3X3, Pencil, Trash2 } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import StatsCard from '@/components/common/StatsCard';
import { DUMMY_TIMETABLE } from '@/data/dummyData';

const DAYS   = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_OPTS = DAYS.map(d => ({ value: d.toLowerCase(), label: d }));
const PERIOD_OPTS = [1,2,3,4,5,6,7,8].map(n => ({ value: String(n), label: `Period ${n}` }));

const schema = z.object({
  day:       z.string().min(1, 'Required'),
  period:    z.string().min(1, 'Required'),
  subject:   z.string().min(1, 'Required'),
  teacher:   z.string().optional(),
  class_name:z.string().optional(),
  room:      z.string().optional(),
  start_time:z.string().optional(),
  end_time:  z.string().optional(),
});



export default function TimetablePage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const [classFilter, setClassFilter] = useState('');
  const [dayFilter,   setDayFilter]   = useState('');
  const [page,        setPage]        = useState(1);
  const [pageSize,    setPageSize]    = useState(10);
  const [modal,       setModal]       = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [deleting,    setDeleting]    = useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['timetable', type, page, pageSize, classFilter, dayFilter],
    queryFn: async () => {
      try { const { timetableService } = await import('@/services'); return await timetableService.getAll({ page, limit: pageSize, class_name:classFilter, day:dayFilter }); }
      catch {
        const d = DUMMY_TIMETABLE.filter(r => (!classFilter || r.class_name === classFilter) && (!dayFilter || r.day === dayFilter));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_TIMETABLE;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { timetableService } = await import('@/services'); return editing ? await timetableService.update(editing.id, vals) : await timetableService.create(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['timetable'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { timetableService } = await import('@/services'); return await timetableService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['timetable'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({}); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const columns = useMemo(() => [
    { accessorKey: 'day',        header: 'Day',     cell: ({ getValue }) => <span className="capitalize font-medium">{getValue()}</span> },
    { accessorKey: 'period',     header: 'Period',  cell: ({ getValue }) => `Period ${getValue()}` },
    { accessorKey: 'subject',    header: 'Subject', cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { accessorKey: 'teacher',    header: 'Teacher', cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'class_name', header: terms.primary_unit },
    { accessorKey: 'room',       header: 'Room',    cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'start_time', header: 'Time',    cell: ({ row: { original: r } }) => r.start_time && r.end_time ? `${r.start_time} – ${r.end_time}` : '—' },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('timetable.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('timetable.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo, terms.primary_unit]);

  const daySubjectCount = useMemo(() => {
    const counts = {};
    DAYS.forEach(d => { counts[d.toLowerCase()] = rows.filter(r => r.day === d.toLowerCase()).length; });
    return counts;
  }, [rows]);

  return (
    <div className="space-y-5">
      <PageHeader title="Timetable" description={`${total} slots configured`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Slots"      value={total}  icon={<Grid3X3 size={18} />} />
        <StatsCard label="Days Configured"  value={Object.values(daySubjectCount).filter(c => c > 0).length} icon={<Grid3X3 size={18} />} />
        <StatsCard label="Subjects / Day"   value={total ? Math.round(total / 5) : 0} icon={<Grid3X3 size={18} />} />
      </div>

      {/* Day filter chips */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setDayFilter('')} className={`rounded-full px-3 py-1 text-xs font-medium border ${!dayFilter ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent'}`}>All</button>
        {DAYS.map(d => (
          <button key={d} onClick={() => setDayFilter(d.toLowerCase())} className={`rounded-full px-3 py-1 text-xs font-medium border capitalize ${dayFilter === d.toLowerCase() ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent'}`}>{d}</button>
        ))}
      </div>

      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No timetable slots found"
        action={canDo('timetable.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> Add Slot</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'timetable' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? 'Edit Slot' : 'New Timetable Slot'} size="md"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="tt-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Add'}</button></>}>
        <form id="tt-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Day *"    name="day"    control={control} error={errors.day}    options={DAY_OPTS}    required />
            <SelectField label="Period *" name="period" control={control} error={errors.period} options={PERIOD_OPTS} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Subject *</label><input {...register('subject')} className="input-base" />{errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Teacher</label><input {...register('teacher')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">{terms.primary_unit}</label><input {...register('class_name')} className="input-base" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Room</label><input {...register('room')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Start Time</label><input type="time" {...register('start_time')} className="input-base" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">End Time</label><input type="time" {...register('end_time')} className="input-base" /></div>
          </div>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Slot" size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {remove.isPending ? 'Deleting\u2026' : 'Delete'}
            </button>
          </>
        }>
        <p className="text-sm text-muted-foreground">Delete <strong>{deleting?.subject}</strong> ({deleting?.day}, Period {deleting?.period})? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
=======
// // //src/components/pages/TimetablePage.jsx
// // 'use client';

// // import { useState, useMemo } from 'react';
// // import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// // import { useForm } from 'react-hook-form';
// // import { zodResolver } from '@hookform/resolvers/zod';
// // import { z } from 'zod';
// // import { toast } from 'sonner';
// // import { Plus, Pencil, Trash2 } from 'lucide-react';

// // import PageHeader from '@/components/common/PageHeader';
// // import AppModal from '@/components/common/AppModal';
// // import SelectField from '@/components/common/SelectField';
// // import useAuthStore from '@/store/authStore';
// // import { DUMMY_TIMETABLE } from '@/data/dummyData';

// // const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
// // const PERIODS = [1,2,3,4,5,6,7,8];

// // const DAY_OPTS = DAYS.map(d => ({ value: d.toLowerCase(), label: d }));
// // const PERIOD_OPTS = PERIODS.map(p => ({ value: String(p), label: `Period ${p}` }));

// // const schema = z.object({
// //   day: z.string(),
// //   period: z.string(),
// //   subject: z.string(),
// //   teacher: z.string().optional(),
// //   class_name: z.string().optional(),
// //   room: z.string().optional(),
// //   start_time: z.string().optional(),
// //   end_time: z.string().optional(),
// // });

// // export default function TimetablePage({ type }) {

// //   const qc = useQueryClient();
// //   const canDo = useAuthStore((s)=>s.canDo);

// //   const [modal,setModal] = useState(false);
// //   const [editing,setEditing] = useState(null);
// //   const [deleting,setDeleting] = useState(null);
// //   const [addSlot,setAddSlot] = useState({});

// //   const { register,handleSubmit,control,reset,formState:{errors} } = useForm({
// //     resolver:zodResolver(schema)
// //   });

// //   const { data,isLoading } = useQuery({
// //     queryKey:['timetable'],
// //     queryFn: async ()=>{
// //       try{
// //         const { timetableService } = await import('@/services');
// //         return await timetableService.getAll();
// //       }catch{
// //         return { data:{ rows:DUMMY_TIMETABLE }};
// //       }
// //     }
// //   });

// //   const rows = data?.data?.rows ?? DUMMY_TIMETABLE;

// //   /* grid build */
// //   const grid = useMemo(()=>{
// //     const g={};
// //     DAYS.forEach(d=>{ g[d.toLowerCase()] = {}; });

// //     rows.forEach(r=>{
// //       if(!g[r.day]) g[r.day]={};
// //       g[r.day][r.period] = r;
// //     });

// //     return g;
// //   },[rows]);

// //   /* save mutation */

// //   const save = useMutation({
// //     mutationFn: async (vals)=>{
// //       try{
// //         const { timetableService } = await import('@/services');
// //         return editing
// //           ? timetableService.update(editing.id,vals)
// //           : timetableService.create(vals);
// //       }catch{
// //         return { data:vals };
// //       }
// //     },
// //     onSuccess:()=>{
// //       toast.success(editing ? 'Updated' : 'Created');
// //       qc.invalidateQueries({queryKey:['timetable']});
// //       closeModal();
// //     }
// //   });

// //   const remove = useMutation({
// //     mutationFn: async (id)=>{
// //       try{
// //         const { timetableService } = await import('@/services');
// //         return timetableService.delete(id);
// //       }catch{
// //         return true;
// //       }
// //     },
// //     onSuccess:()=>{
// //       toast.success('Deleted');
// //       qc.invalidateQueries({queryKey:['timetable']});
// //       setDeleting(null);
// //     }
// //   });

// //   const openAdd=(day,period)=>{
// //     setEditing(null);
// //     setAddSlot({day,period:String(period)});
// //     reset({day,period:String(period)});
// //     setModal(true);
// //   };

// //   const openEdit=(slot)=>{
// //     setEditing(slot);
// //     reset({...slot,period:String(slot.period)});
// //     setModal(true);
// //   };

// //   const closeModal=()=>{
// //     setModal(false);
// //     setEditing(null);
// //     reset({});
// //   };

// //   return (
// //     <div className="space-y-4">

// //       <PageHeader
// //         title="Timetable"
// //         description={`${rows.length} slots configured`}
// //         action={
// //           canDo('timetable.create') && (
// //             <button
// //               onClick={()=>openAdd('monday',1)}
// //               className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
// //             >
// //               <Plus size={14}/> Add Slot
// //             </button>
// //           )
// //         }
// //       />

// //       {/* GRID */}

// //       <div className="overflow-x-auto rounded-lg border">

// //         <table className="w-full text-sm border-collapse">

// //           <thead>
// //             <tr className="bg-muted/50">
// //               <th className="px-4 py-3 text-left border-r">Period</th>
// //               {DAYS.map(day=>(
// //                 <th key={day} className="px-4 py-3 text-center border-r">
// //                   {day}
// //                 </th>
// //               ))}
// //             </tr>
// //           </thead>

// //           <tbody>

// //             {PERIODS.map(period=>(
// //               <tr key={period} className="border-b">

// //                 <td className="px-4 py-3 font-medium border-r">
// //                   Period {period}
// //                 </td>

// //                 {DAYS.map(day=>{

// //                   const slot = grid[day.toLowerCase()]?.[period];

// //                   return (
// //                     <td key={day} className="p-2 border-r text-center">

// //                       {slot ? (

// //                         <div className="relative rounded-md bg-primary/10 px-2 py-1 text-xs group">

// //                           <div className="font-semibold">{slot.subject}</div>

// //                           {slot.teacher && (
// //                             <div className="text-[10px] opacity-70">
// //                               {slot.teacher}
// //                             </div>
// //                           )}

// //                           <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100">

// //                             {canDo('timetable.update') && (
// //                               <button
// //                                 onClick={()=>openEdit(slot)}
// //                                 className="hover:text-primary"
// //                               >
// //                                 <Pencil size={12}/>
// //                               </button>
// //                             )}

// //                             {canDo('timetable.delete') && (
// //                               <button
// //                                 onClick={()=>setDeleting(slot)}
// //                                 className="hover:text-destructive"
// //                               >
// //                                 <Trash2 size={12}/>
// //                               </button>
// //                             )}

// //                           </div>

// //                         </div>

// //                       ) : (

// //                         canDo('timetable.create') && (

// //                           <button
// //                             onClick={()=>openAdd(day.toLowerCase(),period)}
// //                             className="w-full h-10 border-dashed border rounded-md text-muted-foreground hover:text-primary"
// //                           >
// //                             +
// //                           </button>

// //                         )

// //                       )}

// //                     </td>
// //                   );

// //                 })}

// //               </tr>
// //             ))}

// //           </tbody>

// //         </table>

// //       </div>

// //       {/* Modal */}

// //       <AppModal
// //         open={modal}
// //         onClose={closeModal}
// //         title={editing ? "Edit Slot":"New Slot"}
// //       >

// //         <form
// //           onSubmit={handleSubmit((v)=>save.mutate(v))}
// //           className="space-y-4"
// //         >

// //           <div className="grid grid-cols-2 gap-4">
// //             <SelectField
// //               label="Day"
// //               name="day"
// //               control={control}
// //               options={DAY_OPTS}
// //               error={errors.day}
// //               required
// //             />

// //             <SelectField
// //               label="Period"
// //               name="period"
// //               control={control}
// //               options={PERIOD_OPTS}
// //               error={errors.period}
// //               required
// //             />
// //           </div>

// //           <div className="grid grid-cols-2 gap-4">

// //             <div className="space-y-1.5">
// //               <label className="text-sm font-medium">Subject</label>
// //               <input {...register('subject')} className="input-base"/>
// //             </div>

// //             <div className="space-y-1.5">
// //               <label className="text-sm font-medium">Teacher</label>
// //               <input {...register('teacher')} className="input-base"/>
// //             </div>

// //           </div>

// //           <div className="grid grid-cols-2 gap-4">

// //             <div className="space-y-1.5">
// //               <label className="text-sm font-medium">Room</label>
// //               <input {...register('room')} className="input-base"/>
// //             </div>

// //             <div className="space-y-1.5">
// //               <label className="text-sm font-medium">Start Time</label>
// //               <input type="time" {...register('start_time')} className="input-base"/>
// //             </div>

// //           </div>

// //           <div className="flex justify-end gap-2 pt-3">

// //             <button
// //               type="button"
// //               onClick={closeModal}
// //               className="border px-4 py-2 rounded-md text-sm"
// //             >
// //               Cancel
// //             </button>

// //             <button
// //               type="submit"
// //               className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm"
// //             >
// //               {editing ? "Update":"Add"}
// //             </button>

// //           </div>

// //         </form>

// //       </AppModal>

// //       {/* Delete */}

// //       <AppModal
// //         open={!!deleting}
// //         onClose={()=>setDeleting(null)}
// //         title="Delete Slot"
// //       >

// //         <p className="text-sm mb-4">
// //           Delete {deleting?.subject} ({deleting?.day}, Period {deleting?.period}) ?
// //         </p>

// //         <div className="flex justify-end gap-2">

// //           <button
// //             onClick={()=>setDeleting(null)}
// //             className="border px-4 py-2 rounded-md text-sm"
// //           >
// //             Cancel
// //           </button>

// //           <button
// //             onClick={()=>remove.mutate(deleting.id)}
// //             className="bg-destructive text-white px-4 py-2 rounded-md text-sm"
// //           >
// //             Delete
// //           </button>

// //         </div>

// //       </AppModal>

// //     </div>
// //   );
// // }





// //src/componentts/pages/TimetablePage.jsx
// 'use client';

// import { useState, useMemo } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useForm } from 'react-hook-form';
// import { DndProvider, useDrag, useDrop } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
// import { toast } from 'sonner';

// import PageHeader from '@/components/common/PageHeader';
// import AppModal from '@/components/common/AppModal';
// import ConfirmDialog from '@/components/common/ConfirmDialog';
// import SelectField from '@/components/common/SelectField';
// import InputField from '@/components/common/InputField';
// import FormSubmitButton from '@/components/common/FormSubmitButton';
// import ErrorAlert from '@/components/common/ErrorAlert';
// import PageLoader from '@/components/common/PageLoader';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { cn } from '@/lib/utils';

// // Constants
// const DAYS = [
//   { value: 'monday', label: 'Monday' },
//   { value: 'tuesday', label: 'Tuesday' },
//   { value: 'wednesday', label: 'Wednesday' },
//   { value: 'thursday', label: 'Thursday' },
//   { value: 'friday', label: 'Friday' },
//   { value: 'saturday', label: 'Saturday' }
// ];

// const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

// const PERIOD_OPTIONS = PERIODS.map(p => ({
//   value: p,
//   label: `Period ${p}`
// }));

// const TYPE = "TIMETABLE_SLOT";

// // Colors for subjects
// const SUBJECT_COLORS = {
//   'Math': 'bg-blue-100 text-blue-700 border-blue-200',
//   'English': 'bg-green-100 text-green-700 border-green-200',
//   'Science': 'bg-purple-100 text-purple-700 border-purple-200',
//   'Computer': 'bg-orange-100 text-orange-700 border-orange-200',
//   'Physics': 'bg-indigo-100 text-indigo-700 border-indigo-200',
//   'Chemistry': 'bg-pink-100 text-pink-700 border-pink-200',
//   'Biology': 'bg-emerald-100 text-emerald-700 border-emerald-200',
//   'History': 'bg-amber-100 text-amber-700 border-amber-200',
//   'Geography': 'bg-teal-100 text-teal-700 border-teal-200',
//   'Urdu': 'bg-rose-100 text-rose-700 border-rose-200',
//   'Islamiat': 'bg-cyan-100 text-cyan-700 border-cyan-200',
//   'default': 'bg-gray-100 text-gray-700 border-gray-200'
// };

// /* ---------- Drag Cell Component ---------- */
// function TimetableCell({ slot, day, period, onDropSlot, onEdit, onDelete }) {
//   const [{ isDragging }, drag] = useDrag(() => ({
//     type: TYPE,
//     item: slot,
//     canDrag: !!slot,
//     collect: (monitor) => ({
//       isDragging: monitor.isDragging()
//     })
//   }));

//   const [{ isOver }, drop] = useDrop(() => ({
//     accept: TYPE,
//     drop: (item) => {
//       onDropSlot(item, day, period);
//     },
//     collect: (monitor) => ({
//       isOver: monitor.isOver()
//     })
//   }));

//   const getSubjectColor = (subject) => {
//     return SUBJECT_COLORS[subject] || SUBJECT_COLORS.default;
//   };

//   return (
//     <div
//       ref={(node) => drag(drop(node))}
//       className={cn(
//         'relative min-h-[80px] rounded-lg border-2 transition-all duration-200',
//         isOver && 'border-primary bg-primary/5',
//         isDragging && 'opacity-50',
//         slot ? 'cursor-move hover:shadow-md' : 'cursor-pointer hover:border-dashed'
//       )}
//       onClick={() => !slot && onEdit({ day, period })}
//     >
//       {slot ? (
//         <div className={cn(
//           'h-full w-full rounded-lg p-2',
//           getSubjectColor(slot.subject)
//         )}>
//           <div className="flex items-start justify-between">
//             <GripVertical size={14} className="opacity-50" />
//             <div className="flex gap-1">
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onEdit(slot);
//                 }}
//                 className="rounded p-1 hover:bg-black/5"
//               >
//                 <Pencil size={12} />
//               </button>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onDelete(slot);
//                 }}
//                 className="rounded p-1 hover:bg-black/5 text-destructive"
//               >
//                 <Trash2 size={12} />
//               </button>
//             </div>
//           </div>
          
//           <div className="mt-1 space-y-1">
//             <p className="font-semibold text-sm leading-tight">
//               {slot.subject}
//             </p>
//             {slot.teacher && (
//               <p className="text-xs opacity-75">
//                 {slot.teacher}
//               </p>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="flex h-full min-h-[80px] items-center justify-center text-muted-foreground hover:text-primary">
//           <Plus size={20} />
//         </div>
//       )}
//     </div>
//   );
// }

// /* ---------- Teacher Conflict Check ---------- */
// function checkTeacherConflict(slots, teacher, day, period, excludeId = null) {
//   return slots.some(
//     (s) =>
//       s.teacher === teacher &&
//       s.day === day &&
//       Number(s.period) === Number(period) &&
//       s.id !== excludeId
//   );
// }

// /* ---------- Auto Generator ---------- */
// function generateAutoTimetable(subjects, teachers) {
//   const result = [];
  
//   DAYS.forEach(day => {
//     PERIODS.forEach(period => {
//       const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
//       const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
      
//       result.push({
//         day: day.value,
//         period,
//         subject: randomSubject,
//         teacher: randomTeacher
//       });
//     });
//   });
  
//   return result;
// }

// export default function TimetablePage() {
//   const qc = useQueryClient();
  
//   // State
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingSlot, setEditingSlot] = useState(null);
//   const [deletingSlot, setDeletingSlot] = useState(null);
//   const [error, setError] = useState(null);
  
//   // Form
//   const {
//     control,
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//     watch
//   } = useForm({
//     defaultValues: {
//       day: '',
//       period: '',
//       subject: '',
//       teacher: ''
//     }
//   });

//   // Watch form values for conflict checking
//   const watchedDay = watch('day');
//   const watchedPeriod = watch('period');
//   const watchedTeacher = watch('teacher');

//   // Fetch timetable data
//   const { data, isLoading, error: queryError } = useQuery({
//     queryKey: ['timetable'],
//     queryFn: async () => {
//       try {
//         const { timetableService } = await import('@/services');
//         const response = await timetableService.getAll();
//         return response;
//       } catch (err) {
//         // Return dummy data for demo
//         return {
//           data: {
//             rows: [
//               { id: '1', day: 'monday', period: 1, subject: 'Math', teacher: 'Ali' },
//               { id: '2', day: 'monday', period: 2, subject: 'English', teacher: 'Sara' },
//               { id: '3', day: 'tuesday', period: 1, subject: 'Science', teacher: 'Ahmed' },
//               { id: '4', day: 'tuesday', period: 2, subject: 'Computer', teacher: 'Fatima' },
//             ]
//           }
//         };
//       }
//     }
//   });

//   const slots = data?.data?.rows ?? [];

//   // Build grid for easy access
//   const grid = useMemo(() => {
//     const g = {};
//     DAYS.forEach(d => { g[d.value] = {}; });
//     slots.forEach(s => {
//       g[s.day][s.period] = s;
//     });
//     return g;
//   }, [slots]);

//   // Mutations
//   const createMutation = useMutation({
//     mutationFn: async (data) => {
//       const { timetableService } = await import('@/services');
//       return timetableService.create(data);
//     },
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['timetable'] });
//       toast.success('Slot added successfully');
//       setModalOpen(false);
//       reset();
//     },
//     onError: (err) => {
//       toast.error(err.message || 'Failed to add slot');
//     }
//   });

//   const updateMutation = useMutation({
//     mutationFn: async (data) => {
//       const { timetableService } = await import('@/services');
//       return timetableService.update(data.id, data);
//     },
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['timetable'] });
//       toast.success('Slot updated successfully');
//       setModalOpen(false);
//       setEditingSlot(null);
//       reset();
//     },
//     onError: (err) => {
//       toast.error(err.message || 'Failed to update slot');
//     }
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async (id) => {
//       const { timetableService } = await import('@/services');
//       return timetableService.delete(id);
//     },
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['timetable'] });
//       toast.success('Slot deleted successfully');
//       setDeletingSlot(null);
//     },
//     onError: (err) => {
//       toast.error(err.message || 'Failed to delete slot');
//     }
//   });

//   // Handlers
//   const handleMoveSlot = (draggedSlot, newDay, newPeriod) => {
//     if (draggedSlot.day === newDay && draggedSlot.period === newPeriod) {
//       return; // No change
//     }

//     if (checkTeacherConflict(slots, draggedSlot.teacher, newDay, newPeriod, draggedSlot.id)) {
//       toast.error('Teacher is already assigned to another class at this time');
//       return;
//     }

//     updateMutation.mutate({
//       ...draggedSlot,
//       day: newDay,
//       period: newPeriod
//     });
//   };

//   const handleEditSlot = (slot) => {
//     setEditingSlot(slot);
//     reset(slot);
//     setModalOpen(true);
//   };

//   const handleDeleteSlot = (slot) => {
//     setDeletingSlot(slot);
//   };

//   const handleAutoGenerate = () => {
//     const subjects = ['Math', 'English', 'Science', 'Computer', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography'];
//     const teachers = ['Ali', 'Ahmed', 'Sara', 'Fatima', 'Usman', 'Ayesha', 'Bilal', 'Zainab'];
    
//     const autoSlots = generateAutoTimetable(subjects, teachers);
    
//     // Clear existing slots first? Or just add?
//     toast.info('Generating timetable...');
    
//     autoSlots.forEach(slot => {
//       createMutation.mutate(slot);
//     });
//   };

//   const onSubmit = (formData) => {
//     // Check for teacher conflict
//     if (checkTeacherConflict(
//       slots,
//       formData.teacher,
//       formData.day,
//       formData.period,
//       editingSlot?.id
//     )) {
//       toast.error('Teacher is already assigned to another class at this time');
//       return;
//     }

//     if (editingSlot) {
//       updateMutation.mutate({ ...editingSlot, ...formData });
//     } else {
//       createMutation.mutate(formData);
//     }
//   };

//   // Loading state
//   if (isLoading) {
//     return <PageLoader message="Loading timetable..." />;
//   }

//   return (
//     <DndProvider backend={HTML5Backend}>
//       <div className="space-y-6">
//         {/* Header */}
//         <PageHeader
//           title="Weekly Timetable"
//           description="Manage and organize class schedules"
//           action={
//             <div className="flex gap-2">
//               <Button
//                 onClick={() => {
//                   setEditingSlot(null);
//                   reset({ day: '', period: '', subject: '', teacher: '' });
//                   setModalOpen(true);
//                 }}
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Slot
//               </Button>
//               <Button
//                 variant="secondary"
//                 onClick={handleAutoGenerate}
//                 disabled={createMutation.isPending}
//               >
//                 Auto Generate
//               </Button>
//             </div>
//           }
//         />

//         {/* Error Alert */}
//         <ErrorAlert message={queryError?.message || error} />

//         {/* Timetable Grid */}
//         <Card>
//           <CardContent className="p-4">
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[800px] border-collapse">
//                 <thead>
//                   <tr>
//                     <th className="w-20 p-3 text-left font-semibold text-muted-foreground border-b">
//                       Period
//                     </th>
//                     {DAYS.map(day => (
//                       <th key={day.value} className="p-3 text-center font-semibold border-b">
//                         {day.label}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {PERIODS.map(period => (
//                     <tr key={period}>
//                       <td className="p-2 font-medium text-muted-foreground border-r">
//                         Period {period}
//                       </td>
//                       {DAYS.map(day => {
//                         const slot = grid[day.value]?.[period];
//                         return (
//                           <td key={day.value} className="p-2">
//                             <TimetableCell
//                               slot={slot}
//                               day={day.value}
//                               period={period}
//                               onDropSlot={handleMoveSlot}
//                               onEdit={handleEditSlot}
//                               onDelete={handleDeleteSlot}
//                             />
//                           </td>
//                         );
//                       })}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Add/Edit Modal */}
//         <AppModal
//           open={modalOpen}
//           onClose={() => {
//             setModalOpen(false);
//             setEditingSlot(null);
//             reset();
//           }}
//           title={editingSlot ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
//           size="md"
//         >
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <SelectField
//                 label="Day"
//                 name="day"
//                 control={control}
//                 options={DAYS}
//                 error={errors.day}
//                 required
//                 placeholder="Select day"
//               />

//               <SelectField
//                 label="Period"
//                 name="period"
//                 control={control}
//                 options={PERIOD_OPTIONS}
//                 error={errors.period}
//                 required
//                 placeholder="Select period"
//               />
//             </div>

//             <Separator />

//             <InputField
//               label="Subject"
//               name="subject"
//               register={register}
//               error={errors.subject}
//               required
//               placeholder="e.g. Mathematics"
//             />

//             <InputField
//               label="Teacher"
//               name="teacher"
//               register={register}
//               error={errors.teacher}
//               required
//               placeholder="e.g. Mr. Ali"
//             />

//             {/* Show warning if teacher conflict */}
//             {watchedDay && watchedPeriod && watchedTeacher && 
//              checkTeacherConflict(slots, watchedTeacher, watchedDay, watchedPeriod, editingSlot?.id) && (
//               <Badge variant="destructive" className="w-full justify-center">
//                 This teacher is already assigned at this time
//               </Badge>
//             )}

//             <div className="flex justify-end gap-3 pt-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => {
//                   setModalOpen(false);
//                   setEditingSlot(null);
//                   reset();
//                 }}
//               >
//                 Cancel
//               </Button>
//               <FormSubmitButton
//                 loading={createMutation.isPending || updateMutation.isPending}
//                 label={editingSlot ? 'Update Slot' : 'Add Slot'}
//                 loadingLabel={editingSlot ? 'Updating...' : 'Adding...'}
//               />
//             </div>
//           </form>
//         </AppModal>

//         {/* Delete Confirmation */}
//         <ConfirmDialog
//           open={!!deletingSlot}
//           onClose={() => setDeletingSlot(null)}
//           onConfirm={() => deleteMutation.mutate(deletingSlot.id)}
//           loading={deleteMutation.isPending}
//           title="Delete Timetable Slot"
//           description={`Are you sure you want to delete ${deletingSlot?.subject} (Period ${deletingSlot?.period})? This action cannot be undone.`}
//           confirmLabel="Delete"
//           variant="destructive"
//         />
//       </div>
//     </DndProvider>
//   );
// }



// src/components/pages/TimetablePage.jsx
'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SelectField from '@/components/common/SelectField';
import InputField from '@/components/common/InputField';
import FormSubmitButton from '@/components/common/FormSubmitButton';
import ErrorAlert from '@/components/common/ErrorAlert';
import PageLoader from '@/components/common/PageLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Constants
const DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' }
];

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const PERIOD_OPTIONS = PERIODS.map(p => ({ value: p, label: `Period ${p}` }));
const TYPE = "TIMETABLE_SLOT";

// Colors for subjects
const SUBJECT_COLORS = {
  'Math': 'bg-blue-100 text-blue-700 border-blue-200',
  'English': 'bg-green-100 text-green-700 border-green-200',
  'Science': 'bg-purple-100 text-purple-700 border-purple-200',
  'Computer': 'bg-orange-100 text-orange-700 border-orange-200',
  'Physics': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Chemistry': 'bg-pink-100 text-pink-700 border-pink-200',
  'Biology': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'History': 'bg-amber-100 text-amber-700 border-amber-200',
  'Geography': 'bg-teal-100 text-teal-700 border-teal-200',
  'Urdu': 'bg-rose-100 text-rose-700 border-rose-200',
  'Islamiat': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'default': 'bg-gray-100 text-gray-700 border-gray-200'
};

/* ---------- Drag Cell Component ---------- */
function TimetableCell({ slot, day, period, onDropSlot, onEdit, onDelete }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: TYPE,
    item: slot,
    canDrag: !!slot,
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: TYPE,
    drop: (item) => onDropSlot(item, day, period),
    collect: (monitor) => ({ isOver: monitor.isOver() })
  }));

  const getSubjectColor = (subject) => SUBJECT_COLORS[subject] || SUBJECT_COLORS.default;

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={cn(
        'relative min-h-[80px] rounded-lg border-2 transition-all duration-200',
        isOver && 'border-primary bg-primary/5',
        isDragging && 'opacity-50',
        slot ? 'cursor-move hover:shadow-md' : 'cursor-pointer hover:border-dashed'
      )}
      onClick={() => !slot && onEdit({ day, period })}
    >
      {slot ? (
        <div className={cn('h-full w-full rounded-lg p-2', getSubjectColor(slot.subject))}>
          <div className="flex items-start justify-between">
            <GripVertical size={14} className="opacity-50" />
            <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); onEdit(slot); }} className="rounded p-1 hover:bg-black/5">
                <Pencil size={12} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(slot); }} className="rounded p-1 hover:bg-black/5 text-destructive">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          <div className="mt-1 space-y-1">
            <p className="font-semibold text-sm">{slot.subject}</p>
            {slot.teacher && <p className="text-xs opacity-75">{slot.teacher}</p>}
          </div>
        </div>
      ) : (
        <div className="flex h-full min-h-[80px] items-center justify-center text-muted-foreground hover:text-primary">
          <Plus size={20} />
        </div>
      )}
    </div>
  );
}

/* ---------- Teacher Conflict Check ---------- */
function checkTeacherConflict(slots, teacher, day, period, excludeId = null) {
  return slots.some(
    (s) => s.teacher === teacher && s.day === day && Number(s.period) === Number(period) && s.id !== excludeId
  );
}

/* ---------- AI Smart Generator ---------- */
function generateAutoTimetable(subjects, teachers) {
  const result = [];
  DAYS.forEach(day => {
    PERIODS.forEach(period => {
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
      result.push({ id: crypto.randomUUID(), day: day.value, period, subject: randomSubject, teacher: randomTeacher });
    });
  });
  return result;
}

export default function TimetablePage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [deletingSlot, setDeletingSlot] = useState(null);
  const [generatorModal, setGeneratorModal] = useState(false);
  const [generatedSlots, setGeneratedSlots] = useState([]);

  const { control, register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { day: '', period: '', subject: '', teacher: '' }
  });

  const watchedDay = watch('day');
  const watchedPeriod = watch('period');
  const watchedTeacher = watch('teacher');

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['timetable'],
    queryFn: async () => {
      try {
        const { timetableService } = await import('@/services');
        return await timetableService.getAll();
      } catch {
        return { data: { rows: [] } };
      }
    }
  });

  const slots = data?.data?.rows ?? [];

  const grid = useMemo(() => {
    const g = {}; DAYS.forEach(d => { g[d.value] = {}; });
    slots.forEach(s => { g[s.day][s.period] = s; });
    return g;
  }, [slots]);

  // Mutations
  const createMutation = useMutation({ mutationFn: async (d) => (await import('@/services')).timetableService.create(d), onSuccess: () => { qc.invalidateQueries(['timetable']); toast.success('Slot added'); }});
  const updateMutation = useMutation({ mutationFn: async (d) => (await import('@/services')).timetableService.update(d.id, d), onSuccess: () => { qc.invalidateQueries(['timetable']); toast.success('Slot updated'); }});
  const deleteMutation = useMutation({ mutationFn: async (id) => (await import('@/services')).timetableService.delete(id), onSuccess: () => { qc.invalidateQueries(['timetable']); toast.success('Slot deleted'); }});

  // Handlers
  const handleMoveSlot = (draggedSlot, newDay, newPeriod) => {
    if (draggedSlot.day === newDay && draggedSlot.period === newPeriod) return;
    if (checkTeacherConflict(slots, draggedSlot.teacher, newDay, newPeriod, draggedSlot.id)) { toast.error('Teacher conflict'); return; }
    updateMutation.mutate({ ...draggedSlot, day: newDay, period: newPeriod });
  };

  const handleEditSlot = (slot) => { setEditingSlot(slot); reset(slot); setModalOpen(true); };
  const handleDeleteSlot = (slot) => setDeletingSlot(slot);

  const handleAutoGenerate = () => {
    const subjects = ['Math','English','Science','Computer','Physics','Chemistry','Biology','History','Geography'];
    const teachers = ['Ali','Ahmed','Sara','Fatima','Usman','Ayesha','Bilal','Zainab'];
    const generated = generateAutoTimetable(subjects, teachers);
    setGeneratedSlots(generated);
    setGeneratorModal(true);
  };

  const finalizeGeneratedSlots = () => {
    generatedSlots.forEach(slot => createMutation.mutate(slot));
    setGeneratorModal(false);
  };

  const onSubmit = (formData) => {
    if (checkTeacherConflict(slots, formData.teacher, formData.day, formData.period, editingSlot?.id)) {
      toast.error('Teacher conflict at this slot');
      return;
    }
    if (editingSlot) updateMutation.mutate({ ...editingSlot, ...formData });
    else createMutation.mutate(formData);
    setModalOpen(false); reset();
  };

  if (isLoading) return <PageLoader message="Loading timetable..." />;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <PageHeader
          title="Weekly Timetable"
          description="Manage class schedules"
          action={
            <div className="flex gap-2">
              <Button onClick={() => { setEditingSlot(null); reset({ day:'',period:'',subject:'',teacher:'' }); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4"/>Add Slot</Button>
              <Button variant="secondary" onClick={handleAutoGenerate}>Auto Generate</Button>
            </div>
          }
        />

        <ErrorAlert message={queryError} />

        <Card>
          <CardContent className="p-4 overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr>
                  <th className="p-3 w-20 text-left font-semibold border-b">Period</th>
                  {DAYS.map(d => <th key={d.value} className="p-3 text-center font-semibold border-b">{d.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(period => (
                  <tr key={period}>
                    <td className="p-2 font-medium text-muted-foreground border-r">Period {period}</td>
                    {DAYS.map(day => {
                      const slot = grid[day.value]?.[period];
                      return <td key={day.value} className="p-2">
                        <TimetableCell slot={slot} day={day.value} period={period} onDropSlot={handleMoveSlot} onEdit={handleEditSlot} onDelete={handleDeleteSlot}/>
                      </td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <AppModal open={modalOpen} onClose={() => { setModalOpen(false); setEditingSlot(null); reset(); }} title={editingSlot ? 'Edit Slot' : 'Add Slot'} size="md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Day" name="day" control={control} options={DAYS} error={errors.day} required/>
              <SelectField label="Period" name="period" control={control} options={PERIOD_OPTIONS} error={errors.period} required/>
            </div>
            <Separator/>
            <InputField label="Subject" name="subject" register={register} error={errors.subject} required placeholder="e.g. Mathematics"/>
            <InputField label="Teacher" name="teacher" register={register} error={errors.teacher} required placeholder="e.g. Mr. Ali"/>
            {watchedDay && watchedPeriod && watchedTeacher && checkTeacherConflict(slots, watchedTeacher, watchedDay, watchedPeriod, editingSlot?.id) && (
              <Badge variant="destructive" className="w-full justify-center">This teacher is already assigned at this time</Badge>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setModalOpen(false); setEditingSlot(null); reset(); }}>Cancel</Button>
              <FormSubmitButton loading={createMutation.isPending || updateMutation.isPending} label={editingSlot ? 'Update Slot' : 'Add Slot'} loadingLabel={editingSlot ? 'Updating...' : 'Adding...'}/>
            </div>
          </form>
        </AppModal>

        {/* Generated Timetable Modal */}
        <AppModal open={generatorModal} onClose={() => setGeneratorModal(false)} title="Generated Timetable" size="lg">
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border-b">Day</th>
                  <th className="p-2 border-b">Period</th>
                  <th className="p-2 border-b">Subject</th>
                  <th className="p-2 border-b">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {generatedSlots.map(slot => (
                  <tr key={slot.id} className="hover:bg-muted/10">
                    <td className="p-2">{slot.day}</td>
                    <td className="p-2">{slot.period}</td>
                    <td className="p-2">{slot.subject}</td>
                    <td className="p-2">{slot.teacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setGeneratorModal(false)}>Cancel</Button>
            <Button onClick={finalizeGeneratedSlots}>Add All to Timetable</Button>
          </div>
        </AppModal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deletingSlot}
          onClose={() => setDeletingSlot(null)}
          onConfirm={() => deleteMutation.mutate(deletingSlot.id)}
          loading={deleteMutation.isPending}
          title="Delete Timetable Slot"
          description={`Are you sure you want to delete ${deletingSlot?.subject} (Period ${deletingSlot?.period})?`}
          confirmLabel="Delete"
          variant="destructive"
        />
      </div>
    </DndProvider>
  );
}
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
