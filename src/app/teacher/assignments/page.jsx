'use client';

import { useMemo, useState } from 'react';
import { ClipboardList, PlusCircle, CheckCircle2, Clock, Award, CalendarIcon, Pencil, Trash2 } from 'lucide-react';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import InputField from '@/components/common/InputField';
import SelectField from '@/components/common/SelectField';
import SwitchField from '@/components/common/SwitchField';
import TextareaField from '@/components/common/TextareaField';
import { useTeacherAssignments, useTeacherClasses } from '@/hooks/useTeacherPortal';
import { teacherPortalService } from '@/services/teacherPortalService';
import TimePickerField from '@/components/common/TimePickerField';
import useAuthStore from '@/store/authStore';

const STATUS_MAP = {
  active: { label: 'Active', icon: Clock, classes: 'bg-blue-100   text-blue-700' },
  submitted: { label: 'Submitted', icon: CheckCircle2, classes: 'bg-amber-100  text-amber-700' },
  graded: { label: 'Graded', icon: Award, classes: 'bg-emerald-100 text-emerald-700' },
};

const SUBJECT_COLORS = [
  'bg-blue-50 border-blue-200', 'bg-violet-50 border-violet-200',
  'bg-teal-50 border-teal-200', 'bg-amber-50 border-amber-200',
];

const EMPTY_FORM = {
  title: '',
  subject: '',
  class_id: '',
  section_id: '',
  description: '',
  due_date: '',
  due_time: '',
  total_marks: ''
};

export default function TeacherAssignmentsPage() {
  const user = useAuthStore((state) => state.user);
  const t = getPortalTerms(user?.institute_type || 'school');
  const { classes } = useTeacherClasses();
  const {
    assignments,
    loading,
    createAssignment,
    updateAssignment,
    deleteAssignment
  } = useTeacherAssignments({ type: 'assignment' });

  const [filterStatus, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [publishNow, setPublishNow] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const normalizedClasses = useMemo(
    () => classes.map((cls) => {
      const classId = cls.class_id || cls.id;
      const sections = Array.isArray(cls.sections) && cls.sections.length
        ? cls.sections.filter((section) => section?.id)
        : (cls.section_id
          ? [{ id: cls.section_id, name: cls.section_name || 'Section' }]
          : []);

      return {
        ...cls,
        class_id: classId,
        class_name: cls.class_name || cls.name,
        sections,
        subjects: Array.isArray(cls.subjects) ? cls.subjects : []
      };
    }),
    [classes]
  );

  const selectedClass = normalizedClasses.find((cls) => cls.class_id === form.class_id);
  const sectionOptions = selectedClass?.sections || [];
  const subjectOptions = selectedClass?.subjects || [];
  const requiresSection = sectionOptions.length > 1;

  const filtered = filterStatus === 'all'
    ? assignments
    : assignments.filter((a) => {
      const normalized = a.status || (a.is_published ? 'active' : 'draft');
      return normalized === filterStatus;
    });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.class_id || !form.due_date) {
      toast.error('Please fill all required fields.');
      return;
    }
    if (requiresSection && !form.section_id) {
      toast.error('Please select a section for this class.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        subject: form.subject,
        class_id: form.class_id,
        section_id: form.section_id || sectionOptions[0]?.id || null,
        description: form.description,
        due_date: form.due_date,
        due_time: form.due_time || null,
        total_marks: form.total_marks || null,
        type: 'assignment',
        status: publishNow ? 'published' : 'draft',
        is_published: publishNow
      };
      const formData = teacherPortalService.prepareAssignmentFormData(payload);
      if (editingItem?.id) {
        await updateAssignment(editingItem.id, formData);
      } else {
        await createAssignment(formData);
      }
      setSaving(false);
      setModalOpen(false);
      setForm(EMPTY_FORM);
      setEditingItem(null);
      setPublishNow(true);
    } catch {
      setSaving(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setPublishNow(true);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setPublishNow(item.is_published ?? item.status === 'published');
    setForm({
      title: item.title || '',
      subject: item.subject || '',
      class_id: item.class_id || '',
      section_id: item.section_id || '',
      description: item.description || item.instructions || '',
      due_date: item.due_date ? String(item.due_date).split('T')[0] : '',
      due_time: item.due_time || '',
      total_marks: item.total_marks ? String(item.total_marks) : ''
    });
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await deleteAssignment(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const classNameById = normalizedClasses.reduce((acc, cls) => {
    acc[cls.class_id] = cls.class_name || cls.name;
    return acc;
  }, {});

  const onClassChange = (classId) => {
    const cls = normalizedClasses.find((c) => c.class_id === classId);
    const nextSections = cls?.sections || [];
    setForm((prev) => ({
      ...prev,
      class_id: classId,
      section_id: nextSections.length === 1 ? nextSections[0].id : '',
      subject: ''
    }));
  };

  const formatSafeDate = (value) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return format(parsed, 'dd MMM yyyy');
  };

  const summaryData = [
    {
      label: 'Active',
      value: assignments.filter((a) => (a.status || (a.is_published ? 'active' : 'draft')) === 'active').length,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Submitted',
      value: assignments.filter((a) => (a.stats?.submitted || a.submissions || 0) > 0).length,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      label: 'Graded',
      value: assignments.filter((a) => (a.status || '').toLowerCase() === 'graded').length,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    }
  ];

  if (loading) {
    return <div className="max-w-4xl mx-auto text-sm text-slate-500">Loading assignments...</div>;
  }

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
          onClick={openCreateModal}
        >
          <PlusCircle className="w-4 h-4" /> New Assignment
        </Button>
      </div>

      {/* ── New Assignment Modal ── */}
      <AppModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setForm(EMPTY_FORM);
          setEditingItem(null);
          setPublishNow(true);
        }}
        title={editingItem ? 'Edit Assignment' : 'Create New Assignment'}
        description="Fill in the details below to assign work to your class."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setModalOpen(false);
              setForm(EMPTY_FORM);
              setEditingItem(null);
              setPublishNow(true);
            }}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={saving}>
              {saving ? (editingItem ? 'Updating...' : 'Creating...') : (editingItem ? 'Update Assignment' : 'Create Assignment')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Assignment Title"
            name="title"
            required
            placeholder="e.g. Chapter 5 Practice Problems"
            value={form.title}
            onChange={handleChange}
          />

          {/* Subject + Class row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <SelectField
                label="Class"
                name="class_id"
                required
                value={form.class_id}
                onChange={onClassChange}
                placeholder="Select Class"
                options={normalizedClasses.map((c) => ({ value: c.class_id, label: c.class_name || c.name }))}
              />
            </div>
            <div className="space-y-1.5">
              <SelectField
                label="Subject"
                name="subject"
                required
                value={form.subject}
                onChange={(v) => setForm((p) => ({ ...p, subject: v }))}
                placeholder="Select Subject"
                options={subjectOptions.map((s) => ({ value: s, label: s }))}
              />
            </div>

          </div>

          {/* Section row */}
          {sectionOptions.length > 0 && (
            <div className="space-y-1.5">
              <SelectField
                label={`Section${requiresSection ? ' *' : ''}`}
                name="section_id"
                value={form.section_id || (sectionOptions.length === 1 ? sectionOptions[0].id : '')}
                onChange={(v) => setForm((p) => ({ ...p, section_id: v }))}
                disabled={sectionOptions.length === 1}
                placeholder="Select Section"
                options={sectionOptions.map((section) => ({ value: section.id, label: section.name }))}
              />
            </div>
          )}

          <TextareaField
            label="Description / Instructions"
            name="description"
            rows={3}
            placeholder="Describe the assignment, what students need to do..."
            value={form.description}
            onChange={handleChange}
            className="resize-none"
          />

          {/* Due Date + Total Marks row */}
          <div className="grid grid-cols-3 gap-3">
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
              <Label>Due Time</Label>
              <TimePickerField
                value={form.due_time}
                onChange={(value) => setForm((p) => ({ ...p, due_time: value }))}
                mode="simple"
                interval={15}
                placeholder="Select Time"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="total_marks">Total Marks</Label>
              <InputField name="total_marks" type="number" min="0" placeholder="e.g. 20" value={form.total_marks} onChange={handleChange} />
            </div>
          </div>

          <SwitchField
            label="Publish Now"
            name="is_published"
            value={publishNow}
            onChange={setPublishNow}
            hint="Turn off to save this item as draft"
          />
        </form>
      </AppModal>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {summaryData.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white text-center`}>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {[['all', 'All'], ['active', 'Active'], ['submitted', 'Submitted'], ['graded', 'Graded']].map(([v, l]) => (
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
            const normalizedStatus = asgn.status || (asgn.is_published ? 'active' : 'draft');
            const sm = STATUS_MAP[normalizedStatus] || STATUS_MAP['active'];
            const Icon = sm.icon;
            const submitted = asgn.stats?.submitted ?? asgn.submissions ?? 0;
            const totalStudents = asgn.stats?.total_students ?? asgn.total_students ?? 0;
            const submissionPct = totalStudents > 0 ? Math.round((submitted / totalStudents) * 100) : 0;
            return (
              <div key={asgn.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 text-slate-700">{asgn.subject || 'General'}</span>
                        <span className="text-xs text-slate-400">{asgn.class_name || classNameById[asgn.class_id] || asgn.class || 'N/A'}</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-800">{asgn.title}</h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{asgn.description || asgn.instructions || 'No description provided'}</p>
                    </div>
                    <span className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${sm.classes}`}>
                      <Icon className="w-3 h-3" /> {sm.label}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>Assigned: {formatSafeDate(asgn.assigned_on || asgn.created_at)}</span>
                      <span className="font-semibold text-red-600">Due: {formatSafeDate(asgn.due_date)}</span>
                      <span>Marks: {asgn.total_marks || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEditModal(asgn)}>
                        <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                      <Button type="button" variant="destructive" size="sm" className="h-7 text-xs" onClick={() => setDeleteTarget(asgn)}>
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>

                  {/* Submission progress */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Submissions: {submitted}/{totalStudents}</span>
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Assignment"
        description={`This will permanently delete "${deleteTarget?.title || 'this assignment'}".`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
