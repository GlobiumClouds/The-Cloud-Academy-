'use client';

import { useState } from 'react';
import { FileText, Upload, Download, PlusCircle, BookOpen, Paperclip, ChevronDown } from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { DUMMY_TEACHER_PORTAL_USERS } from '@/data/portalDummyData';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import AppModal from '@/components/common/AppModal';

const SUBJECT_COLORS = {
  'Mathematics': 'bg-blue-100   text-blue-700   border-blue-200',
  'Science':     'bg-teal-100   text-teal-700   border-teal-200',
  'English':     'bg-violet-100 text-violet-700 border-violet-200',
  'Urdu':        'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const FILE_ICONS = {
  'PDF':  'bg-red-100 text-red-600',
  'DOCX': 'bg-blue-100 text-blue-600',
  'PPT':  'bg-orange-100 text-orange-600',
};

const EMPTY_NOTE = { title: '', subject: '', class_id: '', description: '', file_type: 'PDF', file_name: '' };

export default function TeacherNotesPage() {
  const { portalUser } = usePortalStore();
  const teacher = portalUser || DUMMY_TEACHER_PORTAL_USERS[0];
  const t = getPortalTerms(teacher?.institute_type);
  const notes   = teacher.notes || [];
  const classes = teacher.assigned_classes || [];

  const [filterSubject, setFilter] = useState('All');
  const [modalOpen, setModalOpen]  = useState(false);
  const [form, setForm]            = useState(EMPTY_NOTE);
  const [saving, setSaving]        = useState(false);

  const subjects  = ['All', ...new Set(notes.map((n) => n.subject))];
  const filtered  = filterSubject === 'All' ? notes : notes.filter((n) => n.subject === filterSubject);
  const allSubjects = [...new Set(classes.flatMap((c) => c.subjects || [c.subject]).filter(Boolean))];

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleFile   = (e) => setForm((p) => ({ ...p, file_name: e.target.files?.[0]?.name || '' }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.class_id) {
      toast.error('Please fill all required fields.');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setModalOpen(false);
      setForm(EMPTY_NOTE);
      toast.success('Note uploaded successfully!');
    }, 900);
  };

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
          onClick={() => setModalOpen(true)}
        >
          <Upload className="w-4 h-4" /> Upload Note
        </Button>
      </div>

      {/* ── Upload Note Modal ── */}
      <AppModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setForm(EMPTY_NOTE); }}
        title="Upload Note / Study Material"
        description="Students will be able to download this from their portal."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => { setModalOpen(false); setForm(EMPTY_NOTE); }}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Uploading...' : 'Upload Note'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="note-title">Note Title <span className="text-red-500">*</span></Label>
            <Input id="note-title" name="title" placeholder="e.g. Chapter 5 – Fractions Notes" value={form.title} onChange={handleChange} />
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
            <Label htmlFor="note-desc">Description</Label>
            <Textarea
              id="note-desc"
              name="description"
              rows={2}
              placeholder="Brief description of this note..."
              value={form.description}
              onChange={handleChange}
              className="resize-none"
            />
          </div>

          {/* File Type + File row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>File Type</Label>
              <Select value={form.file_type} onValueChange={(v) => setForm((p) => ({ ...p, file_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="DOCX">DOCX</SelectItem>
                  <SelectItem value="PPT">PPT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note-file">Attach File</Label>
              <label
                htmlFor="note-file"
                className="flex items-center gap-2 h-9 w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 text-xs text-slate-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{form.file_name || 'Choose file...'}</span>
              </label>
              <input id="note-file" type="file" className="hidden" onChange={handleFile} accept=".pdf,.docx,.ppt,.pptx" />
            </div>
          </div>
        </form>
      </AppModal>

      {/* Subject filter */}
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

      {/* Notes grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">No notes uploaded yet.</p>
          <p className="text-xs mt-1">Click &ldquo;Upload Note&rdquo; to add your first note.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((note) => (
            <div key={note.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              {/* Subject + file type */}
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${SUBJECT_COLORS[note.subject] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {note.subject}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${FILE_ICONS[note.file_type] || 'bg-slate-100 text-slate-600'}`}>
                  {note.file_type}
                </span>
              </div>

              <h3 className="text-sm font-extrabold text-slate-800 leading-tight">{note.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{note.description}</p>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-[10px] text-slate-400">{note.class_name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Uploaded {note.uploaded_on} · {note.file_size}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Download className="w-3 h-3" /> {note.downloads}
                  </span>
                  <button
                    onClick={() => toast.info('Download feature coming soon!')}
                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload prompt */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <PlusCircle className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-900">Share Knowledge with Your Students</p>
          <p className="text-xs text-blue-700 mt-1">Upload PDF notes, presentations, or worksheets. Students can access and download them directly from their portal.</p>
        </div>
      </div>
    </div>
  );
}
