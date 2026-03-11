'use client';

import { useState } from 'react';
import { NotebookPen, PlusCircle, CalendarDays, BookOpen, CalendarIcon } from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { DUMMY_TEACHER_PORTAL_USERS } from '@/data/portalDummyData';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import AppModal from '@/components/common/AppModal';

const SUBJECT_COLORS = {
  'Mathematics': 'bg-blue-100   text-blue-700   border-blue-200',
  'English':     'bg-violet-100 text-violet-700 border-violet-200',
  'Science':     'bg-teal-100   text-teal-700   border-teal-200',
  'Urdu':        'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Art & Craft': 'bg-pink-100   text-pink-700   border-pink-200',
};

const today = () => new Date().toISOString().split('T')[0];
const EMPTY_HW = { title: '', subject: '', class_id: '', description: '', date: today(), due_date: '' };

export default function TeacherHomeworkPage() {
  const { portalUser } = usePortalStore();
  const teacher  = portalUser || DUMMY_TEACHER_PORTAL_USERS[0];
  const t = getPortalTerms(teacher?.institute_type);
  const homework = teacher.homework || [];
  const classes  = teacher.assigned_classes || [];

  const [filterSubject, setFilter] = useState('All');
  const [modalOpen, setModalOpen]  = useState(false);
  const [form, setForm]            = useState(EMPTY_HW);
  const [saving, setSaving]        = useState(false);

  const subjects  = ['All', ...new Set(homework.map((h) => h.subject))];
  const filtered  = filterSubject === 'All' ? homework : homework.filter((h) => h.subject === filterSubject);

  const allSubjects = [...new Set(classes.flatMap((c) => c.subjects || [c.subject]).filter(Boolean))];

  // Group by date
  const grouped = filtered.reduce((acc, hw) => {
    const key = hw.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(hw);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

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
      setForm(EMPTY_HW);
      toast.success('Homework added to diary!');
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <NotebookPen className="w-6 h-6 text-blue-600" /> {t.homeworkLabel}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Daily {t.homeworkLabel.toLowerCase()} given to your {t.classesLabel.toLowerCase()}</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-shrink-0"
          onClick={() => setModalOpen(true)}
        >
          <PlusCircle className="w-4 h-4" /> Add Homework
        </Button>
      </div>

      {/* ── Add Homework Modal ── */}
      <AppModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setForm(EMPTY_HW); }}
        title="Add Homework / Diary Entry"
        description="This homework will be instantly visible to students in their portal."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => { setModalOpen(false); setForm(EMPTY_HW); }}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Add to Diary'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="hw-title">Homework Title <span className="text-red-500">*</span></Label>
            <Input id="hw-title" name="title" placeholder="e.g. Read Chapter 4 & answer questions" value={form.title} onChange={handleChange} />
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
            <Label htmlFor="hw-desc">Description / Instructions</Label>
            <Textarea
              id="hw-desc"
              name="description"
              rows={3}
              placeholder="What exactly do students need to do?"
              value={form.description}
              onChange={handleChange}
              className="resize-none"
            />
          </div>

          {/* Date + Due Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Assigned Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.date
                      ? format(parseISO(form.date), 'dd MMM yyyy')
                      : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.date ? parseISO(form.date) : undefined}
                    onSelect={(d) => setForm((p) => ({ ...p, date: d ? format(d, 'yyyy-MM-dd') : '' }))}
                    captionLayout="dropdown"
                    fromYear={2020}
                    toYear={2030}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
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
          </div>
        </form>
      </AppModal>

      {/* Subject filters */}
      <div className="flex flex-wrap gap-2">
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterSubject === s ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Grouped diary entries */}
      {sortedDates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
          <NotebookPen className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No homework entries found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-800">{date}</p>
                  <p className="text-xs text-slate-400">{grouped[date].length} homework entr{grouped[date].length !== 1 ? 'ies' : 'y'}</p>
                </div>
              </div>

              {/* Entries for this date */}
              <div className="ml-3 pl-10 border-l-2 border-blue-100 space-y-3">
                {grouped[date].map((hw) => (
                  <div key={hw.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${SUBJECT_COLORS[hw.subject] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {hw.subject}
                          </span>
                          <span className="text-[10px] text-slate-400">{hw.class_name}</span>
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-800">{hw.title}</h3>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{hw.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Due: <span className="font-semibold text-red-600">{hw.due_date}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info banner */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 flex gap-3">
        <BookOpen className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-cyan-900">Student Portal Integration</p>
          <p className="text-xs text-cyan-700 mt-0.5">All homework you add here is visible to students in their portal. Keep it updated daily!</p>
        </div>
      </div>
    </div>
  );
}
