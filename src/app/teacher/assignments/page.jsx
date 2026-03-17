'use client';

import { useMemo, useState } from 'react';
import { ClipboardList, PlusCircle, CheckCircle2, Clock, Award, CalendarIcon, Pencil, Trash2, Paperclip, ExternalLink, FileText } from 'lucide-react';
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

const asText = (value) => String(value ?? '').trim();

const getSubmissionCount = (assignment) => assignment.stats?.submitted ?? assignment.submissions ?? 0;

const getNormalizedAssignmentStatus = (assignment) => {
  const rawStatus = String(assignment?.status || '').toLowerCase();
  const submittedCount = getSubmissionCount(assignment);

  if (rawStatus === 'graded') return 'graded';
  if (submittedCount > 0) return 'submitted';

  const published = assignment?.is_published || rawStatus === 'published' || rawStatus === 'active';
  if (published) return 'active';

  return 'active';
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
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [publishNow, setPublishNow] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeAttachmentView, setActiveAttachmentView] = useState(null);
  const [isAttachmentViewOpen, setIsAttachmentViewOpen] = useState(false);

  console.log('Assignments:', assignments);

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
      const classId = asText(cls.class_id || cls.id);
      const sections = Array.isArray(cls.sections) && cls.sections.length
        ? cls.sections
          .map((section) => ({
            id: asText(section?.id || section?.section_id),
            name: section?.name || section?.section_name || 'Section'
          }))
          .filter((section) => section.id)
        : (cls.section_id
          ? [{ id: asText(cls.section_id), name: cls.section_name || 'Section' }]
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

  const classMap = useMemo(() => normalizedClasses.reduce((acc, cls) => {
    acc[cls.class_id] = cls;
    return acc;
  }, {}), [normalizedClasses]);

  const resolveClassForItem = (item) => {
    const itemClassId = asText(item.class_id);
    const byId = normalizedClasses.find((c) => asText(c.class_id) === itemClassId);
    if (byId) return byId;

    const itemClassName = asText(item.class_name || item.class);
    if (!itemClassName) return null;
    const normalizedItemClass = itemClassName.toLowerCase().split(' - ')[0].trim();

    const byName = normalizedClasses.find((c) => {
      const clsName = asText(c.class_name || c.name).toLowerCase();
      return clsName === itemClassName.toLowerCase() || clsName === normalizedItemClass || normalizedItemClass.includes(clsName);
    });
    if (byName) return byName;

    const itemSectionName = asText(item.section_name).toLowerCase();
    if (!itemSectionName) return null;
    const bySection = normalizedClasses.find((c) =>
      (c.sections || []).some((section) => asText(section.name).toLowerCase() === itemSectionName)
    );
    return bySection || null;
  };

  const resolveSectionIdForItem = (item) => {
    const cls = resolveClassForItem(item);
    const options = cls?.sections || [];

    if (!options.length) return '';
    const itemSectionId = asText(item.section_id);
    if (itemSectionId && options.some((section) => asText(section.id) === itemSectionId)) {
      return itemSectionId;
    }

    const byName = options.find(
      (section) => asText(section.name).toLowerCase() === asText(item.section_name).toLowerCase()
    );
    if (byName?.id) return byName.id;

    return options.length === 1 ? options[0].id : '';
  };

  const selectedClass = normalizedClasses.find((cls) => asText(cls.class_id) === asText(form.class_id));
  const sectionOptions = selectedClass?.sections || [];
  const subjectOptions = selectedClass?.subjects || [];
  const fallbackEditSectionOptions = useMemo(() => {
    if (!editingItem) return sectionOptions;
    const originalClassId = asText(editingItem.class_id);
    const currentClassId = asText(form.class_id);
    if (currentClassId && currentClassId !== originalClassId) return sectionOptions;
    if (sectionOptions.length > 0) return sectionOptions;

    const fallbackId = asText(form.section_id || editingItem.section_id || editingItem.section_name);
    const fallbackName = asText(editingItem.section_name || editingItem.section_id || 'Section');
    return fallbackId ? [{ id: fallbackId, name: fallbackName }] : [];
  }, [editingItem, form.class_id, form.section_id, sectionOptions]);
  const effectiveSectionOptions = fallbackEditSectionOptions;
  const requiresSection = effectiveSectionOptions.length > 0;

  const filtered = filterStatus === 'all'
    ? assignments
    : assignments.filter((a) => getNormalizedAssignmentStatus(a) === filterStatus);

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
        section_id: form.section_id || null,
        description: form.description,
        due_date: form.due_date,
        due_time: form.due_time || null,
        total_marks: form.total_marks || null,
        type: 'assignment',
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
      setForm(EMPTY_FORM);
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
    setForm(EMPTY_FORM);
    setFiles([]);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    const matchedClass = resolveClassForItem(item);
    const resolvedSectionId = resolveSectionIdForItem(item) || asText(item.section_id || item.section_name);
    setEditingItem(item);
    setPublishNow(item.is_published ?? item.status === 'published');
    setForm({
      title: item.title || '',
      subject: item.subject || '',
      class_id: asText(matchedClass?.class_id || item.class_id),
      section_id: resolvedSectionId,
      description: item.description || item.instructions || '',
      due_date: item.due_date ? String(item.due_date).split('T')[0] : '',
      due_time: item.due_time || '',
      total_marks: item.total_marks ? String(item.total_marks) : ''
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

  const onClassChange = (classId) => {
    const nextClassId = asText(classId);
    const cls = normalizedClasses.find((c) => asText(c.class_id) === nextClassId);
    const nextSections = cls?.sections || [];
    setForm((prev) => ({
      ...prev,
      class_id: nextClassId,
      section_id: '',
      subject: ''
    }));
  };

  const formatSafeDate = (value) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return format(parsed, 'dd MMM yyyy');
  };

  const openAttachmentView = (item) => {
    const materials = (Array.isArray(item?.attachments) ? item.attachments : []).map((file, idx) => ({
      id: file?.id || `${idx}`,
      name: file?.name || file?.original_name || file?.filename || `Attachment ${idx + 1}`,
      type: file?.type || null,
      url: file?.url || file?.file_url || file?.download_url || file?.pdf_url || null
    }));

    const pdf = materials.find(
      (m) => String(m?.type || '').toLowerCase().includes('pdf') || String(m?.url || '').toLowerCase().endsWith('.pdf')
    );

    setActiveAttachmentView({
      title: item?.title || 'Assignment',
      className: item?.class_name || classMap[item?.class_id]?.class_name || '-',
      materials,
      pdfUrl: pdf?.url || null
    });
    setIsAttachmentViewOpen(true);
  };

  const summaryData = [
    {
      label: 'Active',
      value: assignments.filter((a) => getNormalizedAssignmentStatus(a) === 'active').length,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Submitted',
      value: assignments.filter((a) => getNormalizedAssignmentStatus(a) === 'submitted').length,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      label: 'Graded',
      value: assignments.filter((a) => getNormalizedAssignmentStatus(a) === 'graded').length,
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
          setFiles([]);
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
              setFiles([]);
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
          {effectiveSectionOptions.length > 0 && (
            <div className="space-y-1.5">
              <SelectField
                label={`Section${requiresSection ? ' *' : ''}`}
                name="section_id"
                value={form.section_id}
                onChange={(v) => setForm((p) => ({ ...p, section_id: v }))}
                placeholder="Select Section"
                options={effectiveSectionOptions.map((section) => ({ value: asText(section.id), label: section.name }))}
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

          <div className="space-y-1.5">
            <Label htmlFor="assignment-file">Attach File(s)</Label>
            <label
              htmlFor="assignment-file"
              className="flex items-center gap-2 h-9 w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 text-xs text-slate-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {files.length ? `${files.length} file(s) selected` : 'Choose file(s)...'}
              </span>
            </label>
            <input id="assignment-file" type="file" className="hidden" onChange={handleFile} multiple />
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
                  <iframe title="Assignment Attachment PDF" src={existingPdf.url} className="w-full h-64" />
                </div>
              )}
            </div>
          )}
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
            const normalizedStatus = getNormalizedAssignmentStatus(asgn);
            const sm = STATUS_MAP[normalizedStatus] || STATUS_MAP['active'];
            const Icon = sm.icon;
            const submitted = getSubmissionCount(asgn);
            const totalStudents = asgn.stats?.total_students ?? asgn.total_students ?? 0;
            const submissionPct = totalStudents > 0 ? Math.round((submitted / totalStudents) * 100) : 0;
            const attachmentCount = Array.isArray(asgn.attachments) ? asgn.attachments.length : 0;
            return (
              <div key={asgn.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 text-slate-700">{asgn.subject || 'General'}</span>
                        <span className="text-xs text-slate-400">{asgn.class_name || classMap[asgn.class_id]?.class_name || '-'}</span>
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
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={attachmentCount === 0}
                        onClick={() => openAttachmentView(asgn)}
                      >
                        <Paperclip className="w-3.5 h-3.5 mr-1" /> Files ({attachmentCount})
                      </Button>
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

      <AppModal
        open={isAttachmentViewOpen}
        onClose={() => {
          setIsAttachmentViewOpen(false);
          setActiveAttachmentView(null);
        }}
        title={activeAttachmentView ? `${activeAttachmentView.title} Attachments` : 'Attachments'}
        description={activeAttachmentView ? `${activeAttachmentView.className} - Uploaded Materials` : 'Attachment details'}
        size="xl"
        footer={
          <Button
            variant="outline"
            onClick={() => {
              setIsAttachmentViewOpen(false);
              setActiveAttachmentView(null);
            }}
          >
            Close
          </Button>
        }
      >
        {!activeAttachmentView ? null : (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Materials</p>
              {activeAttachmentView.materials.length === 0 ? (
                <p className="text-sm text-slate-500">No material uploaded for this assignment.</p>
              ) : (
                <div className="space-y-2">
                  {activeAttachmentView.materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                      <div className="min-w-0 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <p className="text-sm text-slate-700 truncate">{material.name}</p>
                      </div>
                      {material.url ? (
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                        >
                          Open <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">No file URL</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activeAttachmentView.pdfUrl && (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 border-b text-xs font-semibold text-slate-600">
                  PDF Preview
                </div>
                <iframe
                  title="Assignment Attachment PDF Preview"
                  src={activeAttachmentView.pdfUrl}
                  className="w-full h-[60vh]"
                />
              </div>
            )}
          </div>
        )}
      </AppModal>
    </div>
  );
}
