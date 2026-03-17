'use client';

import { useMemo, useState } from 'react';
import { FileText, Upload, Download, PlusCircle, Paperclip, CalendarIcon, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import InputField from '@/components/common/InputField';
import SelectField from '@/components/common/SelectField';
import SwitchField from '@/components/common/SwitchField';
import TextareaField from '@/components/common/TextareaField';
import { useTeacherAssignments, useTeacherClasses } from '@/hooks/useTeacherPortal';
import { teacherPortalService } from '@/services/teacherPortalService';
import useAuthStore from '@/store/authStore';

const SUBJECT_COLORS = {
    Mathematics: 'bg-blue-100 text-blue-700 border-blue-200',
    Science: 'bg-teal-100 text-teal-700 border-teal-200',
    English: 'bg-violet-100 text-violet-700 border-violet-200',
    Urdu: 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

const EMPTY_NOTE = {
    title: '',
    subject: '',
    class_id: '',
    section_id: '',
    description: '',
    assigned_on: new Date().toISOString().slice(0, 10),
    due_date: ''
};

const getFileExt = (name = '') => {
    const ext = String(name).split('.').pop();
    return ext ? ext.toUpperCase() : 'FILE';
};

const formatSafeDate = (value) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return format(parsed, 'dd MMM yyyy');
};

export default function TeacherNotesPage() {
    const user = useAuthStore((state) => state.user);
    const t = getPortalTerms(user?.institute_type || 'school');
    const { classes } = useTeacherClasses();
    const {
        assignments: notes,
        loading,
        createAssignment,
        updateAssignment,
        deleteAssignment
    } = useTeacherAssignments({ type: 'project' });

    const [filterSubject, setFilter] = useState('All');
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_NOTE);
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

    const classMap = useMemo(() => normalizedClasses.reduce((acc, cls) => {
        acc[cls.class_id] = cls;
        return acc;
    }, {}), [normalizedClasses]);

    const subjects = useMemo(() => {
        const source = notes.map((n) => n.subject).filter(Boolean);
        return ['All', ...new Set(source)];
    }, [notes]);

    const filtered = filterSubject === 'All'
        ? notes
        : notes.filter((n) => n.subject === filterSubject);

    const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

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

    const handleFile = (e) => {
        const picked = Array.from(e.target.files || []);
        setFiles(picked);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.subject || !form.class_id) {
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
                assigned_on: form.assigned_on,
                due_date: form.due_date || null,
                type: 'project',
                status: publishNow ? 'published' : 'draft',
                is_published: publishNow
            };

            const formData = teacherPortalService.prepareAssignmentFormData(payload, files);
            if (editingItem?.id) {
                await updateAssignment(editingItem.id, formData);
            } else {
                await createAssignment(formData);
            }
            setModalOpen(false);
            setForm(EMPTY_NOTE);
            setFiles([]);
            setEditingItem(null);
            setPublishNow(true);
        } catch {
            // Toast handled by hook
        } finally {
            setSaving(false);
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setPublishNow(true);
        setForm(EMPTY_NOTE);
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
            assigned_on: item.assigned_on ? String(item.assigned_on).split('T')[0] : EMPTY_NOTE.assigned_on,
            due_date: item.due_date ? String(item.due_date).split('T')[0] : ''
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

    if (loading) {
        return <div className="max-w-4xl mx-auto text-sm text-slate-500">Loading notes...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-blue-600" /> {t.notesLabel} & Study Material
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">{notes.length} {t.notesLabel.toLowerCase()} uploaded for your {t.classesLabel.toLowerCase()}</p>
                </div>
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-shrink-0"
                    onClick={openCreateModal}
                >
                    <Upload className="w-4 h-4" /> Upload Note
                </Button>
            </div>

            <AppModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setForm(EMPTY_NOTE);
                    setFiles([]);
                    setEditingItem(null);
                    setPublishNow(true);
                }}
                title={editingItem ? 'Edit Note / Study Material' : 'Upload Note / Study Material'}
                description="Students will be able to download this from their portal."
                size="md"
                footer={
                    <>
                        <Button variant="outline" onClick={() => {
                            setModalOpen(false);
                            setForm(EMPTY_NOTE);
                            setFiles([]);
                            setEditingItem(null);
                            setPublishNow(true);
                        }}>Cancel</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={saving}>
                            {saving ? (editingItem ? 'Updating...' : 'Uploading...') : (editingItem ? 'Update Note' : 'Upload Note')}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                        label="Note Title"
                        name="title"
                        required
                        placeholder="e.g. Chapter 5 - Fractions Notes"
                        value={form.title}
                        onChange={handleChange}
                    />

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
                        label="Description"
                        name="description"
                        rows={2}
                        placeholder="Brief description of this note..."
                        value={form.description}
                        onChange={handleChange}
                        className="resize-none"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Assigned Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {form.assigned_on
                                            ? format(parseISO(form.assigned_on), 'dd MMM yyyy')
                                            : <span className="text-muted-foreground">Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={form.assigned_on ? parseISO(form.assigned_on) : undefined}
                                        onSelect={(d) => setForm((p) => ({ ...p, assigned_on: d ? format(d, 'yyyy-MM-dd') : '' }))}
                                        captionLayout="dropdown"
                                        fromYear={2020}
                                        toYear={2030}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="note-file">Attach File(s)</Label>
                            <label
                                htmlFor="note-file"
                                className="flex items-center gap-2 h-9 w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 text-xs text-slate-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                            >
                                <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">
                                    {files.length ? `${files.length} file(s) selected` : 'Choose file(s)...'}
                                </span>
                            </label>
                            <input id="note-file" type="file" className="hidden" onChange={handleFile} multiple />
                        </div>
                    </div>

                    <SwitchField
                        label="Publish Now"
                        name="is_published"
                        value={publishNow}
                        onChange={setPublishNow}
                        hint="Turn off to save as draft"
                    />

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
                                    <iframe title="Note Attachment PDF" src={existingPdf.url} className="w-full h-64" />
                                </div>
                            )}
                        </div>
                    )}
                </form>
            </AppModal>

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

            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-semibold">No notes uploaded yet.</p>
                    <p className="text-xs mt-1">Click "Upload Note" to add your first note.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {filtered.map((note) => {
                        const classInfo = classMap[note.class_id] || {};
                        const sectionName = note.section_name || classInfo.section_name || classInfo.sections?.[0]?.name || '-';
                        const filesCount = Array.isArray(note.attachments) ? note.attachments.length : 0;
                        const firstFile = filesCount > 0 ? note.attachments[0]?.original_name || note.attachments[0]?.filename || '' : '';

                        return (
                            <div key={note.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${SUBJECT_COLORS[note.subject] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                        {note.subject || 'General'}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                                        {firstFile ? getFileExt(firstFile) : 'NOTE'}
                                    </span>
                                </div>

                                <h3 className="text-sm font-extrabold text-slate-800 leading-tight">{note.title}</h3>
                                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{note.description || 'No description provided.'}</p>

                                <div className="flex items-center justify-between mt-4">
                                    <div>
                                        <p className="text-[10px] text-slate-400">
                                            {note.class_name || classInfo.class_name || '-'}{sectionName && sectionName !== '-' ? ` - ${sectionName}` : ''}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Uploaded {formatSafeDate(note.assigned_on || note.created_at)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Download className="w-3 h-3" /> {filesCount}
                                        </span>
                                        <button
                                            onClick={() => openEditModal(note)}
                                            className="p-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(note)}
                                            className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => toast.info('Download feature coming soon!')}
                                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <PlusCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm font-bold text-blue-900">Share Knowledge with Your Students</p>
                    <p className="text-xs text-blue-700 mt-1">Upload notes, worksheets, or documents and publish them directly to the student portal.</p>
                </div>
            </div>

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Delete Note"
                description={`This will permanently delete "${deleteTarget?.title || 'this note'}".`}
                confirmLabel="Delete"
                variant="destructive"
            />
        </div>
    );
}
