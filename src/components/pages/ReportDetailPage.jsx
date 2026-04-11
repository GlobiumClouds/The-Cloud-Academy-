"use client";
/**
 * ReportDetailPage — Interactive Report with Filters & DataTable
 *
 * Includes Student, Attendance, Exam reports (API based)
 * and Fee Collection, Payroll (Dummy App based)
 */

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  Loader2,
  ChevronLeft,
  Search,
  Filter,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  FileText,
  MoreHorizontal,
  Receipt,
  Wallet,
  Printer,
  FileDown,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import useAuthStore from "@/store/authStore";
import useInstituteStore from "@/store/instituteStore";
import {
  reportService,
  classService,
  examService,
  academicYearService,
  sectionService,
  studentService,
} from "@/services";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SelectField from "@/components/common/SelectField";
import FeeCollectionDummyApp from "./FeeCollectionDummyApp";
import PayrollDummyApp from "./PayrollDummyApp";
import ExportModal from "@/components/common/ExportModal";

// ─────────────────────────────────────────────────────────────────────────────
// REPORT TYPE CONFIGS
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COLUMN DEFINITIONS (A to Z)
// ─────────────────────────────────────────────────────────────────────────────

const STUDENT_REPORT_COLUMNS = [
  // SECTION: PERSONAL
  { id: 'name', header: 'Full Name', accessorFn: s => `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.name || '—' },
  { id: 'roll_no', header: 'Roll Number', accessorFn: s => s.roll_no || s.registration_no || s.roll_number || '—' },
  { id: 'reg_no', header: 'Registration ID', accessorFn: s => s.registration_no || '—' },
  { id: 'gender', header: 'Gender', accessorFn: s => s.gender || '—' },
  { id: 'dob', header: 'Date of Birth', accessorFn: s => s.dob || s.date_of_birth || '—' },
  { id: 'admission_date', header: 'Admission Date', accessorFn: s => s.admission_date || s.enrollment_date || '—' },
  { id: 'cnic', header: 'CNIC / B-Form', accessorFn: s => s.cnic || '—' },
  { id: 'blood_group', header: 'Blood Group', accessorFn: s => s.blood_group || '—' },
  { id: 'religion', header: 'Religion', accessorFn: s => s.religion || '—' },
  { id: 'nationality', header: 'Nationality', accessorFn: s => s.nationality || '—' },

  // SECTION: ACADEMIC
  { id: 'academic_year', header: 'Academic Year', accessorFn: s => s.academic_year_name || s.academic_year?.name || '—' },
  { id: 'class', header: 'Class / Program', accessorFn: s => s.class_name || s.class?.name || '—' },
  { id: 'section', header: 'Section / Batch', accessorFn: s => s.section_name || s.section?.name || '—' },
  { id: 'previous_school', header: 'Previous School', accessorFn: s => s.previous_school || '—' },
  { id: 'previous_class', header: 'Previous Class', accessorFn: s => s.previous_class || '—' },

  // SECTION: CONTACT
  { id: 'phone', header: 'Phone Number', accessorFn: s => s.phone || '—' },
  { id: 'email', header: 'Email Address', accessorFn: s => s.email || '—' },
  { id: 'city', header: 'City', accessorFn: s => s.city || '—' },
  { id: 'address', header: 'Present Address', accessorFn: s => s.present_address || s.address || '—' },
  { id: 'permanent_address', header: 'Permanent Address', accessorFn: s => s.permanent_address || '—' },

  // SECTION: GUARDIAN
  { 
    id: 'primary_guardian', 
    header: 'Primary Guardian', 
    accessorFn: s => {
      const g = (s.guardians && Array.isArray(s.guardians) ? s.guardians : []).find(x => x.type === 'father' || x.type === 'guardian') || (s.guardians && s.guardians[0]);
      return g?.name || s.father_name || s.guardian_name || '—';
    }
  },
  { 
    id: 'guardian_relation', 
    header: 'Relation', 
    accessorFn: s => {
      const g = (s.guardians && Array.isArray(s.guardians) ? s.guardians : []).find(x => x.type === 'father' || x.type === 'guardian') || (s.guardians && s.guardians[0]);
      return g?.relation || g?.type || (s.father_name ? 'Father' : '—');
    }
  },
  { 
    id: 'guardian_phone', 
    header: 'Guardian Phone', 
    accessorFn: s => {
      const g = (s.guardians && Array.isArray(s.guardians) ? s.guardians : []).find(x => x.type === 'father' || x.type === 'guardian') || (s.guardians && s.guardians[0]);
      return g?.phone || s.father_phone || '—';
    }
  },
  { id: 'guardian_email', header: 'Guardian Email', accessorFn: s => (s.guardians?.find(x => x.email)?.email) || s.guardian_email || '—' },
  { id: 'mother_name', header: 'Mother Name', accessorFn: s => s.mother_name || s.guardians?.find(x => x.type === 'mother')?.name || '—' },
  
  // SECTION: HEALTH
  { id: 'medical_conditions', header: 'Medical Conditions', accessorFn: s => s.medical_conditions || '—' },
  { id: 'allergies', header: 'Allergies', accessorFn: s => s.allergies || '—' },

  // SECTION: FINANCE
  { id: 'monthly_fee', header: 'Monthly Fee', accessorFn: s => s.monthly_fee || '—' },
  { id: 'admission_fee', header: 'Admission Fee', accessorFn: s => s.admission_fee || '—' },
  { id: 'concession_type', header: 'Concession Type', accessorFn: s => s.concession_type || '—' },
  { id: 'concession_p', header: 'Concession (%)', accessorFn: s => s.concession_percentage || '—' },

  { 
    id: 'status', 
    header: 'Status', 
    accessorFn: s => (s.is_active ? 'Active' : 'Inactive') 
  },
];

const REPORT_CONFIGS = {
  student: {
    title: "Student Report",
    filters: ["search", "class", "section", "status"],
    columns: [
      STUDENT_REPORT_COLUMNS.find(c => c.id === 'name'),
      STUDENT_REPORT_COLUMNS.find(c => c.id === 'roll_no'),
      { 
        id: 'academic', 
        header: 'Class (Section)', 
        accessorFn: s => `${s.class_name || s.class?.name || '—'} (${s.section_name || s.section?.name || '—'})` 
      },
      { 
        id: 'guardian_contact', 
        header: 'Guardian / Phone', 
        accessorFn: s => {
          const g = (s.guardians && Array.isArray(s.guardians) ? s.guardians : []).find(x => x.type === 'father' || x.type === 'guardian') || (s.guardians && s.guardians[0]);
          const name = g?.name || s.father_name || s.guardian_name || '—';
          const phone = g?.phone || s.phone || '—';
          return `${name} | ${phone}`;
        }
      },
      STUDENT_REPORT_COLUMNS.find(c => c.id === 'status'),
      {
        id: "actions",
        header: "Action",
        size: 80,
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 gap-1.5 text-[10px] font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-50 rounded-lg shadow-sm bg-white"
            onClick={(e) => {
              e.stopPropagation();
              window.__handleIndividualDownload?.(row.original);
            }}
          >
            <FileDown size={11} /> REPORT
          </Button>
        ),
      },
    ],
    permission: "reports.student",
    theme: "indigo",
    icon: Users,
  },
  attendance: {
    title: "Attendance Report",
    filters: ["dateRange", "class", "section", "type"],
    columns: [
      { key: "date", label: "Date" },
      { key: "name", label: "Student Name" },
      { key: "registration_no", label: "Reg. No." },
      { key: "class_name", label: "Class" },
      { key: "section_name", label: "Section" },
      { key: "status", label: "Status" },
      { key: "check_in", label: "In" },
      { key: "check_out", label: "Out" },
    ],
    permission: "reports.attendance",
    theme: "emerald",
    icon: CheckCircle2,
  },
  fee: {
    title: "Fee Collection Report",
    permission: "reports.fee",
    theme: "amber",
    icon: Receipt,
  },
  exam: {
    title: "Exam Results Report",
    filters: ["class", "section", "exam", "type"],
    columns: [
      { key: "name", label: "Student Name" },
      { key: "registration_no", label: "Reg. No." },
      { key: "exam", label: "Exam" },
      { key: "total_marks", label: "Total" },
      { key: "marks_obtained", label: "Obtained" },
      { key: "percentage", label: "%" },
      { key: "grade", label: "Grade" },
      { key: "status", label: "Status" },
    ],
    permission: "reports.exam",
    theme: "violet",
    icon: Sparkles,
  },
  payroll: {
    title: "Payroll Report",
    permission: "reports.payroll",
    theme: "rose",
    icon: Wallet,
  },
};

const THEMES = {
  indigo: {
    main: "text-indigo-600",
    bg: "bg-indigo-50/50",
    grad: "from-indigo-500/10 to-transparent",
    border: "border-indigo-100/50",
  },
  emerald: {
    main: "text-emerald-600",
    bg: "bg-emerald-50/50",
    grad: "from-emerald-500/10 to-transparent",
    border: "border-emerald-100/50",
  },
  amber: {
    main: "text-amber-600",
    bg: "bg-amber-50/50",
    grad: "from-amber-500/10 to-transparent",
    border: "border-amber-100/50",
  },
  rose: {
    main: "text-rose-600",
    bg: "bg-rose-50/50",
    grad: "from-rose-500/10 to-transparent",
    border: "border-rose-100/50",
  },
  violet: {
    main: "text-violet-600",
    bg: "bg-violet-50/50",
    grad: "from-violet-500/10 to-transparent",
    border: "border-violet-100/50",
  },
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
  onExport,
  isExporting,
  canExport,
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
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">
            Search & Filters
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:flex">
              <Loader2 size={12} className="animate-spin" /> Fetching...
            </div>
          )}
          
          {showFilter("search") && (
            <div className="relative w-48 sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => onFilterChange("search", e.target.value)}
                placeholder="Search by name..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[11px] focus:ring-4 focus:ring-slate-100 focus:bg-white transition-all outline-none"
              />
            </div>
          )}

          <Button
            onClick={onExport}
            disabled={!canExport || isExporting}
            size="sm"
            className="h-9 px-4 rounded-xl bg-slate-900 border-none hover:bg-slate-800 text-white font-bold text-[11px] shadow-lg shadow-slate-200 transition-all active:scale-95 whitespace-nowrap"
          >
            {isExporting ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Download size={14} className="mr-2" />}
            {isExporting ? "PREPARING..." : "EXPORT RECORDS"}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 items-end">
        {/* Academic Year Filter */}
        <SelectField
          label="Academic Year"
          placeholder="Select Year"
          value={filters.academic_year_id}
          onChange={(v) => {
            onFilterChange("academic_year_id", v);
            onFilterChange("class_id", "");
            onFilterChange("section_id", "");
          }}
          options={options.years || []}
          className="w-full"
        />

        {showFilter("class") && (
          <SelectField
            label="Class / Course"
            placeholder="Select Class"
            value={filters.class_id}
            onChange={(v) => {
              onFilterChange("class_id", v);
              onFilterChange("section_id", "");
            }}
            options={(options.classes || []).map((c) => ({
              value: String(c.value || c.id || ""),
              label: c.label || c.name || "Unknown",
            }))}
            className="w-full"
            disabled={!filters.academic_year_id}
          />
        )}

        {showFilter("section") && (
          <SelectField
            label="Section / Batch"
            placeholder="Select Section"
            value={filters.section_id}
            onChange={(v) => onFilterChange("section_id", v)}
            options={(sections || []).map((s) => ({
              value: String(s.value || s.id || ""),
              label: s.label || s.name || s.section_name || "—",
            }))}
            className="w-full"
            disabled={!filters.class_id}
          />
        )}

        {showFilter("exam") && (
          <SelectField
            label="Select Exam"
            placeholder="Choose Exam"
            value={filters.exam_id}
            onChange={(v) => onFilterChange("exam_id", v)}
            options={(exams || []).map((ex) => ({
              value: ex.id,
              label: ex.title || ex.name,
            }))}
            className="w-full"
            disabled={!filters.class_id}
          />
        )}

        {showFilter("dateRange") && (
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                From
              </label>
              <input
                type="date"
                value={filters.from_date}
                onChange={(e) => onFilterChange("from_date", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:ring-4 focus:ring-slate-100 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                To
              </label>
              <input
                type="date"
                value={filters.to_date}
                onChange={(e) => onFilterChange("to_date", e.target.value)}
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
  const reportType = searchParams.get("report") || "student";
  const currentInstitute = useInstituteStore((s) => s.currentInstitute);
  const canDo = useAuthStore((s) => s.canDo);

  const config = REPORT_CONFIGS[reportType] || REPORT_CONFIGS.student;

  // State
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    search: "",
    class_id: "",
    section_id: "",
    from_date: "",
    to_date: "",
    exam_id: "",
    status: "",
  });

  const [exporting, setExporting] = useState(false);

  // FETCH: Helper data
  const { data: yearsData } = useQuery({
    queryKey: ["academic-years", currentInstitute?.id],
    queryFn: () => academicYearService.getOptions(currentInstitute?.id),
    enabled: !!currentInstitute?.id,
  });

  const { data: classesData } = useQuery({
    queryKey: ["classes", currentInstitute?.id, filters.academic_year_id],
    queryFn: () =>
      classService.getAll({
        institute_id: currentInstitute?.id,
        academic_year_id: filters.academic_year_id,
        limit: 100,
      }),
    enabled: !!currentInstitute?.id && !!filters.academic_year_id,
  });

  const { data: examsData } = useQuery({
    queryKey: ["exams", currentInstitute?.id, filters.class_id],
    queryFn: () => examService.getAll({ class_id: filters.class_id }),
    enabled: !!filters.class_id && reportType === "exam",
  });

  // Sections
  const { data: sectionsData } = useQuery({
    queryKey: ["sections", filters.class_id],
    queryFn: () =>
      sectionService.getAll({ class_id: filters.class_id, limit: 100 }),
    enabled: !!filters.class_id,
  });

  // Default Year Effect
  useEffect(() => {
    if (yearsData?.data?.length && !filters.academic_year_id) {
      const current =
        yearsData.data.find((y) => y.is_current) || yearsData.data[0];
      setFilters((prev) => ({
        ...prev,
        academic_year_id: String(current.value),
      }));
    }
  }, [yearsData, filters.academic_year_id]);

  // Extract actual arrays with deep nesting support
  const classList = (() => {
    const raw = classesData?.data || classesData;
    if (Array.isArray(raw)) return raw;
    if (raw?.items && Array.isArray(raw.items)) return raw.items;
    return [];
  })();

  const sectionList = (() => {
    // Priority 1: From dedicated sectionsData
    const rawSections = sectionsData?.data || sectionsData;
    if (Array.isArray(rawSections)) return rawSections;
    if (rawSections?.items && Array.isArray(rawSections.items))
      return rawSections.items;

    // Priority 2: From selected Class object
    const selectedClass = classList.find(
      (c) => String(c.id) === String(filters.class_id),
    );
    const nested =
      selectedClass?.Sections ||
      selectedClass?.sections ||
      selectedClass?.data?.sections;
    if (Array.isArray(nested)) return nested;

    return [];
  })();

  const examList = (() => {
    const raw = examsData?.data || examsData;
    if (Array.isArray(raw)) return raw;
    if (raw?.items && Array.isArray(raw.items)) return raw.items;
    return [];
  })();

  // FETCH: Report data
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ["report", reportType, filters],
    queryFn: async () => {
      let res;
      if (reportType === "student")
        res = await reportService.getStudentReport(filters);
      else if (reportType === "attendance")
        res = await reportService.getAttendanceReport(filters);
      else if (reportType === "fee")
        res = await reportService.getFeeReport(filters);
      else if (reportType === "exam")
        res = await reportService.getExamReport(filters);
      else return null;

      // Flatten data for student reports if needed
      if (reportType === "student" && res?.data?.records) {
        res.data.records = res.data.records.map((s) => {
          const details = s.details?.studentDetails || {};
          return { ...s, ...details };
        });
      }
      return res;
    },
    enabled:
      !!currentInstitute?.id &&
      reportType !== "fee" &&
      reportType !== "payroll",
  });

  const [individualExportData, setIndividualExportData] = useState(null);
  const [hydratingBulk, setHydratingBulk] = useState(false);
  const [hydratedBulkData, setHydratedBulkData] = useState([]);

  // Bulk Profile Download (Parallel Hydration)
  const handleBulkProfileDownload = async () => {
    const rawRecords = reportData?.data?.records || [];
    if (!rawRecords.length) return;

    setHydratingBulk(true);
    const loadingToast = toast.loading(`Preparing high-detail profiles for ${rawRecords.length} students...`);

    try {
      // Fetch all full records in parallel
      const fullyLoaded = await Promise.all(
        rawRecords.map(async (s) => {
          try {
            const res = await studentService.getById(s.id);
            const full = res.data || s;
            const details = full.details?.studentDetails || {};
            return { ...full, ...details };
          } catch {
            return s; // Fallback to basic if fetch fails
          }
        })
      );

      setHydratedBulkData(fullyLoaded);
      setExporting(true); // Open the modal
      toast.dismiss(loadingToast);
    } catch (error) {
      console.error("Bulk hydration error:", error);
      toast.error("Failed to prepare full profiles", { id: loadingToast });
    } finally {
      setHydratingBulk(false);
    }
  };

  // Expose individual download to window for the cell button
  useEffect(() => {
    window.__handleIndividualDownload = async (student) => {
      if (!student?.id) return;
      
      const loadingToast = toast.loading("Fetching full student profile...");
      try {
        const res = await studentService.getById(student.id);
        const fullData = res.data || student;
        
        // Ensure flattening matches ExportModal expectations
        const details = fullData.details?.studentDetails || {};
        const flattened = {
          ...fullData,
          ...details,
          // Add any specific mappings if needed (ExportModal handleIndividualDownload style)
        };

        setIndividualExportData([flattened]);
        toast.dismiss(loadingToast);
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.error("Using basic data as fetch failed", { id: loadingToast });
        setIndividualExportData([student]);
      }
    };
    return () => delete window.__handleIndividualDownload;
  }, []);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await reportService.exportReport({
        report_type: reportType,
        filters,
        format: "excel",
      });
      toast.success("Excel Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  // Build Columns
  const columns = useMemo(() => {
    if (!config.columns) return [];
    return config.columns.map((col) => {
      // Base column object
      const tableCol = {
        id: col.id || col.key,
        header: col.header || col.label,
        size: col.size,
      };

      if (col.key) tableCol.accessorKey = col.key;
      if (col.accessorFn) tableCol.accessorFn = col.accessorFn;

      // Custom formatting
      tableCol.cell = ({ getValue, row }) => {
        // If config has its own cell, use it
        if (col.cell) return col.cell({ getValue, row });

        const value = col.accessorFn
          ? col.accessorFn(row.original)
          : getValue();
        const key = col.key || col.id;

        if (key === "status") {
          const colors = {
            active: "bg-emerald-50 text-emerald-600 border-emerald-100",
            paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
            present: "bg-emerald-50 text-emerald-600 border-emerald-100",
            absent: "bg-rose-50 text-rose-600 border-rose-100",
            unpaid: "bg-rose-50 text-rose-600 border-rose-100",
            inactive: "bg-slate-50 text-slate-400 border-slate-200",
          };
          return (
            <span
              className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase border tracking-tight",
                colors[String(value).toLowerCase()] ||
                  "bg-slate-50 border-slate-200",
              )}
            >
              {value}
            </span>
          );
        }

        if (key === "name")
          return (
            <span className="font-semibold text-slate-800 text-sm">
              {value}
            </span>
          );

        return (
          <span className="text-slate-500 text-xs font-medium">{value}</span>
        );
      };

      return tableCol;
    });
  }, [config.columns]);

  if (!canDo(config.permission)) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center animate-in fade-in duration-500">
        <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-rose-100 border border-rose-100">
          <AlertCircle size={38} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Report Restricted
          </h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium leading-relaxed">
            You don't have the necessary administrative privileges to view the{" "}
            {config.title}.
          </p>
        </div>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="h-10 rounded-xl border-slate-200 px-6 font-semibold"
        >
          Return Back
        </Button>
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
      {reportType !== "fee" && reportType !== "payroll" && (
        <div className="relative rounded-2xl p-7 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white border border-slate-200 shadow-xl shadow-slate-200/40">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-slate-50/50 pointer-events-none" />
          <div className="flex items-center gap-5 relative z-10 w-full sm:w-auto">
            <button
              onClick={() => router.back()}
              className="h-11 w-11 flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft size={22} className="text-slate-600" />
            </button>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                <Icon size={12} /> Detailed Insights System
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {config.title}
              </h1>
            </div>
          </div>

        </div>
      )}

      {reportType === "fee" ? (
        <FeeCollectionDummyApp />
      ) : reportType === "payroll" ? (
        <PayrollDummyApp />
      ) : (
        <>
          {/* STATS OVERHAUL */}
          {reportData?.data?.summary && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(reportData.data.summary).map(
                ([key, value], i) => (
                  <div
                    key={key}
                    className={cn(
                      "rounded-2xl border bg-white p-5 transition-all hover:shadow-xl relative overflow-hidden group border-slate-200",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                        theme.grad,
                      )}
                    />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
                      {key.replace(/_/g, " ")}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 tabular-nums relative z-10 mt-1">
                      {value}
                    </h3>
                    <div
                      className={cn(
                        "absolute bottom-4 right-4 h-1 w-8 rounded-full opacity-50 transition-all group-hover:w-12",
                        theme.bg.replace("bg-", "bg-").split("/")[0],
                      )}
                    />
                  </div>
                ),
              )}
            </div>
          )}

          <ReportFilters
            reportType={reportType}
            filters={filters}
            onFilterChange={handleFilterChange}
            options={{
              classes: classList,
              years: yearsData?.data || [],
            }}
            loading={reportLoading}
            sections={sectionList}
            exams={examList}
            onExport={() => {
              if (reportType === 'student') handleBulkProfileDownload();
              else setExporting(true);
            }}
            isExporting={hydratingBulk}
            canExport={!!reportData?.data?.records?.length && !!filters.class_id}
          />

          {/* TABLE OVERHAUL */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden relative">
            {!filters.class_id &&
            reportType !== "fee" &&
            reportType !== "payroll" ? (
              <div className="flex flex-col items-center justify-center p-20 text-center space-y-4 min-h-[300px]">
                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100">
                  <Filter size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800">
                    No Data to Display
                  </h3>
                  <p className="text-sm text-slate-400 max-w-[280px]">
                    Please select{" "}
                    <span className="font-bold text-slate-600">Class</span> and{" "}
                    <span className="font-bold text-slate-600">Section</span> to
                    load the report.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-0 pb-6 compact-table border-none">
                <DataTable
                  columns={columns}
                  data={reportData?.data?.records || []}
                  loading={reportLoading}
                  pagination={{
                    page: filters.page,
                    totalPages: totalPages,
                    total: totalRecords,
                    onPageChange: (p) => handleFilterChange("page", p),
                    onPageSizeChange: (s) => handleFilterChange("limit", s),
                    pageSize: filters.limit,
                  }}
                />
              </div>
            )}
          </div>

          {/* Export Modals Overlay */}
          <ExportModal
            open={exporting}
            onClose={() => {
              setExporting(false);
              setHydratedBulkData([]); // Clear after use
            }}
            columns={STUDENT_REPORT_COLUMNS}
            rows={hydratedBulkData.length > 0 ? hydratedBulkData : (reportData?.data?.records || [])}
            fileName={`${config.title}-Profiles-Class`}
          />

          <ExportModal
            open={!!individualExportData}
            onClose={() => setIndividualExportData(null)}
            columns={STUDENT_REPORT_COLUMNS}
            rows={individualExportData || []}
            fileName={`Full-Profile-${
              individualExportData?.[0]?.first_name || "Student"
            }`}
          />
        </>
      )}
    </div>
  );
}
