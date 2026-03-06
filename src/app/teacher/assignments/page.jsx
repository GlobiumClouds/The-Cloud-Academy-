'use client';

import { useState } from 'react';
import { ClipboardList, PlusCircle, CheckCircle2, Clock, Award, CalendarIcon } from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { DUMMY_TEACHER_PORTAL_USERS } from '@/data/portalDummyData';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import AppModal from '@/components/common/AppModal';

const STATUS_MAP = {
  active:    { label: 'Active',    icon: Clock,         classes: 'bg-blue-100   text-blue-700' },
  submitted: { label: 'Submitted', icon: CheckCircle2,  classes: 'bg-amber-100  text-amber-700' },
  graded:    { label: 'Graded',    icon: Award,         classes: 'bg-emerald-100 text-emerald-700' },
};

const SUBJECT_COLORS = [
  'bg-blue-50 border-blue-200', 'bg-violet-50 border-violet-200',
  'bg-teal-50 border-teal-200', 'bg-amber-50 border-amber-200',
];

const EMPTY_FORM = { title: '', subject: '', class_id: '', description: '', due_date: '', total_marks: '' };

export default function TeacherAssignmentsPage() {
  const { portalUser } = usePortalStore();
  const teacher     = portalUser || DUMMY_TEACHER_PORTAL_USERS[0];
  const t = getPortalTerms(teacher?.institute_type);
  const assignments = teacher.assignments || [];
  const classes     = teacher.assigned_classes || [];

  const [filterStatus, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  const filtered = filterStatus === 'all' ? assignments : assignments.filter((a) => a.status === filterStatus);

  const allSubjects = [...new Set(classes.flatMap((c) => c.subjects || [c.subject]).filter(Boolean))];

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.class_id || !form.due_date) {
      toast.error('Please fill all required fields.');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setModalOpen(false);
      setForm(EMPTY_FORM);
      toast.success('Assignment created successfully!');
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" /> {t.assignmentsLabel}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{assignments.length} {t.assignmentsLabel.toLowerCase()} across your {t.classesLabel.toLowerCase()}</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-shrink-0"
          onClick={() => setModalOpen(true)}
        >
          <PlusCircle className="w-4 h-4" /> New Assignment
        </Button>
      </div>

      {/* ── New Assignment Modal ── */}
      <AppModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setForm(EMPTY_FORM); }}
        title="Create New Assignment"
        description="Fill in the details below to assign work to your class."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => { setModalOpen(false); setForm(EMPTY_FORM); }}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Creating...' : 'Create Assignment'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Assignment Title <span className="text-red-500">*</span></Label>
            <Input id="title" name="title" placeholder="e.g. Chapter 5 Practice Problems" value={form.title} onChange={handleChange} />
          </div>

          {/* Subject + Class row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Subject <span className="text-red-500">*</span></Label>
              <Select value={form.subject} onValueChange={(v) => setForm((p) => ({ ...p, subject: v }))}>
                <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                <SelectContent>
                  {allSubjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Class <span className="text-red-500">*</span></Label>
              <Select value={form.class_id} onValueChange={(v) => setForm((p) => ({ ...p, class_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c.class_id} value={c.class_id}>{c.class_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description / Instructions</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Describe the assignment, what students need to do..."
              value={form.description}
              onChange={handleChange}
              className="resize-none"
            />
          </div>

          {/* Due Date + Total Marks row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Due Date <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.due_date
                      ? format(parseISO(form.due_date), 'dd MMM yyyy')
                      : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.due_date ? parseISO(form.due_date) : undefined}
                    onSelect={(d) => setForm((p) => ({ ...p, due_date: d ? format(d, 'yyyy-MM-dd') : '' }))}
                    captionLayout="dropdown"
                    fromYear={2020}
                    toYear={2030}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="total_marks">Total Marks</Label>
              <Input id="total_marks" name="total_marks" type="number" min="0" placeholder="e.g. 20" value={form.total_marks} onChange={handleChange} />
            </div>
          </div>
        </form>
      </AppModal>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active',    value: assignments.filter((a) => a.status === 'active').length,    color: 'text-blue-600',    bg: 'bg-blue-50' },
          { label: 'Submitted', value: assignments.filter((a) => a.status === 'submitted').length, color: 'text-amber-600',   bg: 'bg-amber-50' },
          { label: 'Graded',    value: assignments.filter((a) => a.status === 'graded').length,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white text-center`}>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {[['all','All'],['active','Active'],['submitted','Submitted'],['graded','Graded']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterStatus === v ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Assignment list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No assignments in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((asgn, i) => {
            const sm = STATUS_MAP[asgn.status] || STATUS_MAP['active'];
            const Icon = sm.icon;
            const submissionPct = Math.round((asgn.submissions / asgn.total_students) * 100);
            return (
              <div key={asgn.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 text-slate-700">{asgn.subject}</span>
                        <span className="text-xs text-slate-400">{asgn.class_name}</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-800">{asgn.title}</h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{asgn.description}</p>
                    </div>
                    <span className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${sm.classes}`}>
                      <Icon className="w-3 h-3" /> {sm.label}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>Assigned: {asgn.assigned_on}</span>
                      <span className="font-semibold text-red-600">Due: {asgn.due_date}</span>
                      <span>Marks: {asgn.total_marks}</span>
                    </div>
                  </div>

                  {/* Submission progress */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Submissions: {asgn.submissions}/{asgn.total_students}</span>
                      <span>{submissionPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${submissionPct >= 90 ? 'bg-emerald-500' : submissionPct >= 60 ? 'bg-amber-500' : 'bg-red-400'}`}
                        style={{ width: `${submissionPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
