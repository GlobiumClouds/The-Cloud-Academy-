'use client';

import { useMemo, useState } from 'react';
import { NotebookPen, PlusCircle, CalendarDays, BookOpen, CalendarIcon, Pencil, Trash2, Paperclip, ExternalLink } from 'lucide-react';
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

const SUBJECT_COLORS = {
  'Mathematics': 'bg-blue-100   text-blue-700   border-blue-200',
  'English': 'bg-violet-100 text-violet-700 border-violet-200',
  'Science': 'bg-teal-100   text-teal-700   border-teal-200',
  'Urdu': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Art & Craft': 'bg-pink-100   text-pink-700   border-pink-200',
};

const today = () => new Date().toISOString().split('T')[0];
const EMPTY_HW = {
  title: '',
  subject: '',
  class_id: '',
  section_id: '',
  description: '',
  date: today(),
  due_date: '',
  due_time: ''
};

export default function TeacherHomeworkPage() {
  const user = useAuthStore((state) => state.user);
  const t = getPortalTerms(user?.institute_type || 'school');
  const { classes } = useTeacherClasses();
  const { assignments: homework, loading, createAssignment, updateAssignment, deleteAssignment } = useTeacherAssignments({ type: 'homework' });

  const [filterSubject, setFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_HW);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [publishNow, setPublishNow] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const existingAttachments = useMemo(() => {
    if (!editingItem || !Array.isArray(editingItem.attachments)) return [];
    return editingItem.attachments.map((file, idx) => ({
      id: file?.id || `${idx}`,
      name: file?.name || file?.original_name || file?.filename || `Attachment ${idx + 1}`,
      url: file?.url || file?.file_url || file?.download_url || file?.pdf_url || null,
      type: file?.type || null
    }));
  }, [editingItem]);

  const existingPdf = existingAttachments.find(
    (file) => String(file?.type || '').toLowerCase().includes('pdf') || String(file?.url || '').toLowerCase().endsWith('.pdf')
  );

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

  const subjects = ['All', ...new Set(homework.map((h) => h.subject).filter(Boolean))];
  const filtered = filterSubject === 'All' ? homework : homework.filter((h) => h.subject === filterSubject);

  // Group by date
  const grouped = filtered.reduce((acc, hw) => {
    const key = (hw.assigned_on || hw.created_at || hw.date || '').split('T')[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(hw);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles(picked);
  };

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
        assigned_on: form.date,
        due_date: form.due_date,
        due_time: form.due_time || null,
        type: 'homework',
        status: publishNow ? 'published' : 'draft',
        is_published: publishNow
      };
      const formData = teacherPortalService.prepareAssignmentFormData(payload, files);
      if (editingItem?.id) {
        await updateAssignment(editingItem.id, formData);
      } else {
        await createAssignment(formData);
      }
      setSaving(false);
      setModalOpen(false);
      setForm(EMPTY_HW);
      setFiles([]);
      setEditingItem(null);
      setPublishNow(true);
    } catch {
      setSaving(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setPublishNow(true);
    setForm(EMPTY_HW);
    setFiles([]);
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
      date: item.assigned_on ? String(item.assigned_on).split('T')[0] : today(),
      due_date: item.due_date ? String(item.due_date).split('T')[0] : '',
      due_time: item.due_time || ''
    });
    setFiles([]);
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

  if (loading) {
    return <div className="max-w-3xl mx-auto text-sm text-slate-500">Loading homework...</div>;
  }

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
          onClick={openCreateModal}
        >
          <PlusCircle className="w-4 h-4" /> Add Homework
        </Button>
      </div>

      {/* ── Add Homework Modal ── */}
      <AppModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setForm(EMPTY_HW);
          setFiles([]);
          setEditingItem(null);
          setPublishNow(true);
        }}
        title={editingItem ? 'Edit Homework / Diary Entry' : 'Add Homework / Diary Entry'}
        description="This homework will be instantly visible to students in their portal."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setModalOpen(false);
              setForm(EMPTY_HW);
              setFiles([]);
              setEditingItem(null);
              setPublishNow(true);
            }}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={saving}>
              {saving ? (editingItem ? 'Updating...' : 'Saving...') : (editingItem ? 'Update Homework' : 'Add to Diary')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Homework Title"
            name="title"
            required
            placeholder="e.g. Read Chapter 4 & answer questions"
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
            placeholder="What exactly do students need to do?"
            value={form.description}
            onChange={handleChange}
            className="resize-none"
          />

          {/* Date + Due Date row */}
          <div className="grid grid-cols-3 gap-3">
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
          </div>

          <SwitchField
            label="Publish Now"
            name="is_published"
            value={publishNow}
            onChange={setPublishNow}
            hint="Turn off to save as draft"
          />

          <div className="space-y-1.5">
            <Label htmlFor="homework-file">Attach File(s)</Label>
            <label
              htmlFor="homework-file"
              className="flex items-center gap-2 h-9 w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 text-xs text-slate-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {files.length ? `${files.length} file(s) selected` : 'Choose file(s)...'}
              </span>
            </label>
            <input id="homework-file" type="file" className="hidden" onChange={handleFile} multiple />
          </div>

          {editingItem && existingAttachments.length > 0 && (
            <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Existing Attachments</p>
              {existingAttachments.map((file) => (
                <div key={file.id} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 border border-slate-200">
                  <div className="min-w-0 flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="text-xs text-slate-700 truncate">{file.name}</span>
                  </div>
                  {file.url ? (
                    <a href={file.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900">
                      Open <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">No URL</span>
                  )}
                </div>
              ))}

              {existingPdf?.url && (
                <div className="rounded-md border border-slate-200 overflow-hidden bg-white">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 border-b">PDF Preview</div>
                  <iframe title="Homework Attachment PDF" src={existingPdf.url} className="w-full h-64" />
                </div>
              )}
            </div>
          )}
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
                  <p className="text-sm font-extrabold text-slate-800">{formatSafeDate(date)}</p>
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
                          <span className="text-[10px] text-slate-400">{hw.class_name || classNameById[hw.class_id] || hw.class || 'N/A'}</span>
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-800">{hw.title}</h3>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{hw.description || hw.instructions || 'No description provided'}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Due: <span className="font-semibold text-red-600">{formatSafeDate(hw.due_date)}</span></span>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEditModal(hw)}>
                          <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button type="button" variant="destructive" size="sm" className="h-7 text-xs" onClick={() => setDeleteTarget(hw)}>
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                        </Button>
                      </div>
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Homework"
        description={`This will permanently delete "${deleteTarget?.title || 'this homework'}".`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
