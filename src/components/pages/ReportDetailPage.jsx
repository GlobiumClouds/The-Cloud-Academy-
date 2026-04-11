'use client';
/**
 * ReportDetailPage — Interactive Report with Filters & DataTable
 * 
 * Includes Student, Attendance, Exam reports (API based)
 * and Fee Collection, Payroll (Dummy App based)
 */

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Loader2, ChevronLeft, Search, Filter, Calendar, Users, CheckCircle2, AlertCircle, TrendingUp, Sparkles, FileText, MoreHorizontal, Receipt, Wallet } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import { reportService, classService, examService } from '@/services';
import DataTable from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SelectField from '@/components/common/SelectField';
import FeeCollectionDummyApp from './FeeCollectionDummyApp';
import PayrollDummyApp from './PayrollDummyApp';

// ─────────────────────────────────────────────────────────────────────────────
// REPORT TYPE CONFIGS
// ─────────────────────────────────────────────────────────────────────────────

const REPORT_CONFIGS = {
  student: {
    title: 'Student Report',
    filters: ['search', 'class', 'section', 'status'],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'registration_no', label: 'Reg. No.' },
      { key: 'student_id', label: 'Student ID' },
      { key: 'father_name', label: "Father Name" },
      { key: 'phone', label: 'Phone' },
      { key: 'class_name', label: 'Class' },
      { key: 'section_name', label: 'Section' },
      { key: 'gender', label: 'Gender' },
      { key: 'blood_group', label: 'Blood' },
      { key: 'joined_on', label: 'Joined' },
      { key: 'status', label: 'Status' },
    ],
    permission: 'reports.student',
    theme: 'indigo',
    icon: Users,
  },
  attendance: {
    title: 'Attendance Report',
    filters: ['dateRange', 'class', 'section', 'type'],
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'name', label: 'Student Name' },
      { key: 'registration_no', label: 'Reg. No.' },
      { key: 'class_name', label: 'Class' },
      { key: 'section_name', label: 'Section' },
      { key: 'status', label: 'Status' },
      { key: 'check_in', label: 'In' },
      { key: 'check_out', label: 'Out' },
    ],
    permission: 'reports.attendance',
    theme: 'emerald',
    icon: CheckCircle2,
  },
  fee: {
    title: 'Fee Collection Report',
    permission: 'reports.fee',
    theme: 'amber',
    icon: Receipt,
  },
  exam: {
    title: 'Exam Results Report',
    filters: ['class', 'section', 'exam', 'type'],
    columns: [
      { key: 'name', label: 'Student Name' },
      { key: 'registration_no', label: 'Reg. No.' },
      { key: 'exam', label: 'Exam' },
      { key: 'total_marks', label: 'Total' },
      { key: 'marks_obtained', label: 'Obtained' },
      { key: 'percentage', label: '%' },
      { key: 'grade', label: 'Grade' },
      { key: 'status', label: 'Status' },
    ],
    permission: 'reports.exam',
    theme: 'violet',
    icon: Sparkles,
  },
  payroll: {
    title: 'Payroll Report',
    permission: 'reports.payroll',
    theme: 'rose',
    icon: Wallet,
  },
};

const THEMES = {
  indigo: { main: 'text-indigo-600', bg: 'bg-indigo-50/50', grad: 'from-indigo-500/10 to-transparent', border: 'border-indigo-100/50' },
  emerald: { main: 'text-emerald-600', bg: 'bg-emerald-50/50', grad: 'from-emerald-500/10 to-transparent', border: 'border-emerald-100/50' },
  amber: { main: 'text-amber-600', bg: 'bg-amber-50/50', grad: 'from-amber-500/10 to-transparent', border: 'border-amber-100/50' },
  rose: { main: 'text-rose-600', bg: 'bg-rose-50/50', grad: 'from-rose-500/10 to-transparent', border: 'border-rose-100/50' },
  violet: { main: 'text-violet-600', bg: 'bg-violet-50/50', grad: 'from-violet-500/10 to-transparent', border: 'border-violet-100/50' },
};

// ─────────────────────────────────────────────────────────────────────────────
// FILTER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function ReportFilters({ 
  reportType, 
  filters, 
  onFilterChange, 
  options, 
  loading,
  sections = [],
  exams = [],
}) {
  const config = REPORT_CONFIGS[reportType] || REPORT_CONFIGS.student;
  const showFilter = (name) => config.filters?.includes(name);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
            <Filter size={14} />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Report Filters</h3>
        </div>
        {loading && <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Loader2 size={12} className="animate-spin" /> Synchronizing...
        </div>}
      </div>
      
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 items-end">
        {showFilter('search') && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
               Search Records
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                placeholder="Name, ID or Number..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:ring-4 focus:ring-slate-100 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>
        )}

        {showFilter('class') && (
          <SelectField
            label="Class"
            placeholder="All Classes"
            value={filters.class_id}
            onChange={(v) => onFilterChange('class_id', v)}
            options={(options.classes || []).map(c => ({ value: c.id, label: c.name }))}
            className="w-full"
          />
        )}

        {showFilter('section') && (
          <SelectField
            label="Section"
            placeholder="All Sections"
            value={filters.section_id}
            onChange={(v) => onFilterChange('section_id', v)}
            options={(sections || []).map(s => ({ value: s.id, label: s.name || s.section_name }))}
            className="w-full"
          />
        )}

        {showFilter('exam') && (
          <SelectField
            label="Select Exam"
            placeholder="Choose Exam"
            value={filters.exam_id}
            onChange={(v) => onFilterChange('exam_id', v)}
            options={(exams || []).map(ex => ({ value: ex.id, label: ex.title }))}
            className="w-full"
          />
        )}

        {showFilter('dateRange') && (
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">From Date</label>
              <input
                type="date"
                value={filters.from_date}
                onChange={(e) => onFilterChange('from_date', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:ring-4 focus:ring-slate-100 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">To Date</label>
              <input
                type="date"
                value={filters.to_date}
                onChange={(e) => onFilterChange('to_date', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:ring-4 focus:ring-slate-100 focus:bg-white outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ReportDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportType = searchParams.get('report') || 'student';
  const currentInstitute = useInstituteStore((s) => s.currentInstitute);
  const canDo = useAuthStore((s) => s.canDo);

  const config = REPORT_CONFIGS[reportType] || REPORT_CONFIGS.student;

  // State
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    search: '',
    class_id: '',
    section_id: '',
    from_date: '',
    to_date: '',
    exam_id: '',
    status: '',
  });

  const [exporting, setExporting] = useState(false);

  // FETCH: Helper data
  const { data: classesData } = useQuery({
    queryKey: ['classes', currentInstitute?.id],
    queryFn: () => classService.getAll({ limit: 100 }),
    enabled: !!currentInstitute?.id,
  });

  const { data: examsData } = useQuery({
    queryKey: ['exams', currentInstitute?.id],
    queryFn: () => examService.getAll({ limit: 100 }),
    enabled: !!currentInstitute?.id && reportType === 'exam',
  });

  // Sections
  const sections = useMemo(() => {
    if (!filters.class_id || !classesData?.data) return [];
    return classesData.data.find(c => String(c.id) === String(filters.class_id))?.Sections || [];
  }, [filters.class_id, classesData]);

  // FETCH: Report data
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['report', reportType, filters],
    queryFn: async () => {
      if (reportType === 'student') return reportService.getStudentReport(filters);
      if (reportType === 'attendance') return reportService.getAttendanceReport(filters);
      if (reportType === 'fee') return reportService.getFeeReport(filters);
      if (reportType === 'exam') return reportService.getExamReport(filters);
      return null;
    },
    enabled: !!currentInstitute?.id && reportType !== 'fee' && reportType !== 'payroll',
  });

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await reportService.exportReport({
        report_type: reportType,
        filters,
        format: 'excel'
      });
      toast.success('Excel Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  // Build Columns
  const columns = useMemo(() => {
    if (!config.columns) return [];
    return config.columns.map(col => ({
      accessorKey: col.key,
      header: col.label,
      cell: ({ getValue }) => {
        const value = getValue();
        if (col.key === 'status') {
          const colors = {
            paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            present: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            absent: 'bg-rose-50 text-rose-600 border-rose-100',
            unpaid: 'bg-rose-50 text-rose-600 border-rose-100'
          };
          return (
            <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase border tracking-tight", colors[String(value).toLowerCase()] || "bg-slate-50 border-slate-200")}>
              {value}
            </span>
          );
        }
        if (col.key === 'name') return <span className="font-semibold text-slate-800 text-sm">{value}</span>;
        return <span className="text-slate-500 text-xs font-medium">{value}</span>;
      }
    }));
  }, [config.columns]);

  if (!canDo(config.permission)) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center animate-in fade-in duration-500">
        <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-rose-100 border border-rose-100">
          <AlertCircle size={38} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Report Restricted</h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium leading-relaxed">You don't have the necessary administrative privileges to view the {config.title}.</p>
        </div>
        <Button onClick={() => router.back()} variant="outline" className="h-10 rounded-xl border-slate-200 px-6 font-semibold">Return Back</Button>
      </div>
    );
  }

  const totalRecords = reportData?.data?.pagination?.total || 0;
  const totalPages = Math.ceil(totalRecords / filters.limit);
  const theme = THEMES[config.theme] || THEMES.indigo;
  const Icon = config.icon;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700 max-w-[1600px] mx-auto pb-10 px-2 sm:px-0">
      
      {/* HEADER OVERHAUL */}
      {reportType !== 'fee' && reportType !== 'payroll' && (
        <div className="relative rounded-2xl p-7 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white border border-slate-200 shadow-xl shadow-slate-200/40">
           <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-slate-50/50 pointer-events-none" />
           <div className="flex items-center gap-5 relative z-10 w-full sm:w-auto">
              <button onClick={() => router.back()} className="h-11 w-11 flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                <ChevronLeft size={22} className="text-slate-600" />
              </button>
              <div className="space-y-1">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                   <Icon size={12} /> Detailed Insights System
                 </div>
                 <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{config.title}</h1>
              </div>
           </div>

           <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
             <Button 
               disabled={exporting || !reportData}
               onClick={handleExport}
               variant="outline" 
               className="flex-1 sm:flex-none h-11 border-slate-200 rounded-2xl px-5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95"
             >
               {exporting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Download size={16} className="mr-2" />}
               Export Excel
             </Button>
             <Button 
               onClick={() => window.print()}
               className="flex-1 sm:flex-none h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-6 text-[13px] font-bold shadow-lg shadow-slate-200 transition-all active:scale-95"
             >
               Print PDF
             </Button>
           </div>
        </div>
      )}

      {reportType === 'fee' ? (
        <FeeCollectionDummyApp />
      ) : reportType === 'payroll' ? (
        <PayrollDummyApp />
      ) : (
        <>
          {/* STATS OVERHAUL */}
          {reportData?.data?.summary && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(reportData.data.summary).map(([key, value], i) => (
                <div key={key} className={cn("rounded-2xl border bg-white p-5 transition-all hover:shadow-xl relative overflow-hidden group border-slate-200")}>
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", theme.grad)} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">{key.replace(/_/g, ' ')}</p>
                  <h3 className="text-2xl font-bold text-slate-900 tabular-nums relative z-10 mt-1">{value}</h3>
                  <div className={cn("absolute bottom-4 right-4 h-1 w-8 rounded-full opacity-50 transition-all group-hover:w-12", theme.bg.replace('bg-', 'bg-').split('/')[0])} />
                </div>
              ))}
            </div>
          )}

          <ReportFilters
            reportType={reportType}
            filters={filters}
            onFilterChange={handleFilterChange}
            options={{ classes: classesData?.data || [] }}
            loading={reportLoading}
            sections={sections}
            exams={examsData?.data || []}
          />

          {/* TABLE OVERHAUL */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
             <div className="p-0 compact-table border-none">
               <DataTable
                 columns={columns}
                 data={reportData?.data?.records || []}
                 loading={reportLoading}
                 pagination={{
                   page: filters.page,
                   totalPages: totalPages,
                   total: totalRecords,
                   onPageChange: (p) => handleFilterChange('page', p),
                   onPageSizeChange: (s) => handleFilterChange('limit', s),
                   pageSize: filters.limit
                 }}
               />
             </div>
          </div>
        </>
      )}
    </div>
  );
}
