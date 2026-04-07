'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  Search, 
  Download, 
  Filter, 
  ChevronDown, 
  CalendarCheck, 
  CalendarX, 
  Clock, 
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  CalendarDays,
  ArrowRight,
  Printer
} from 'lucide-react';
import { studentAttendanceService } from '@/services/studentAttendanceService';
import { classService } from '@/services/classService';
import { studentService } from '@/services/studentService';
import { sectionService } from '@/services/sectionService';
import { academicYearService } from '@/services/academicYearService';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Dummy data removed as per real API integration.

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20 transition-colors group-hover:scale-110 duration-300`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trendValue}
        </div>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">{trendValue ? 'Sessions' : 'Days'}</span>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
      <div className="flex -space-x-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden" />
        ))}
        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
          +4
        </div>
      </div>
      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const AttendanceReport = ({ terms = {} }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();
  const [reportType, setReportType] = useState('class');
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [filters, setFilters] = useState({
    class: 'all',
    section: 'all',
    academicYear: 'all',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: 'all',
    minAttendance: 0
  });

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch Academic Years
  React.useEffect(() => {
    if (!isMounted) return;
    const fetchYears = async () => {
      try {
        const res = await academicYearService.getOptions(user?.school_id);
        const years = res.data || [];
        setAcademicYears(years);
        
        // Auto select current academic year
        const currentYear = years.find(y => y.is_current);
        if (currentYear) {
          setFilters(prev => ({ ...prev, academicYear: currentYear.value }));
        }
      } catch (err) {
        console.error('Failed to fetch years:', err);
      }
    };
    fetchYears();
  }, [user?.school_id, isMounted]);

  // Fetch Classes
  React.useEffect(() => {
    if (!isMounted) return;
    const fetchClasses = async () => {
      try {
        const res = await classService.getAll({ school_id: user?.school_id });
        setClasses(res.data || res || []);
      } catch (err) {
        console.error('Failed to fetch classes:', err);
      }
    };
    fetchClasses();
  }, [user?.school_id, isMounted]);

  // Reset section when class changes
  const handleClassChange = (classId) => {
    setFilters(prev => ({ ...prev, class: classId, section: 'all' }));
  };

  // Derived Sections from selected class
  const sections = useMemo(() => {
    if (!filters.class || filters.class === 'all') return [];
    const selectedClass = classes.find(c => String(c.id) === String(filters.class));
    // Try both lowercase and uppercase 'sections' property as backend might vary
    return selectedClass?.sections || selectedClass?.Sections || [];
  }, [filters.class, classes]);

  // Fetch Students for selected class
  React.useEffect(() => {
    if (isMounted && reportType === 'student' && filters.class !== 'all') {
      const fetchStudents = async () => {
        try {
          const res = await studentService.getAll({ 
            class_id: filters.class,
            section_id: filters.section === 'all' ? undefined : filters.section
          });
          const studentData = res.data || res;
          setStudents(Array.isArray(studentData) ? studentData : []);
        } catch (err) {
          console.error('Failed to fetch students:', err);
          setStudents([]);
        }
      };
      fetchStudents();
    }
  }, [reportType, filters.class, filters.section, isMounted]);

  const handleGenerateReport = async () => {
    if (!filters.class || filters.class === 'all') {
      toast.error('Please select a class first');
      return;
    }

    setLoading(true);
    try {
      // Find selected academic year object to extract the year
      const selectedYearObj = academicYears.find(y => y.value === filters.academicYear);
      // Extract first 4 digits from label (e.g. "2025" from "2025-2026") or fallback to current
      const yearFromLabel = selectedYearObj?.label?.match(/\d{4}/)?.[0] || new Date().getFullYear();

      const params = {
        school_id: user?.school_id,
        academic_year_id: filters.academicYear === 'all' ? undefined : filters.academicYear,
        class_id: filters.class === 'all' ? undefined : filters.class,
        section_id: filters.section === 'all' ? undefined : filters.section,
        student_id: selectedStudent === 'all' ? undefined : selectedStudent,
        month: filters.month,
        year: yearFromLabel,
      };

      console.log('Generating report with params:', params);
      const res = await studentAttendanceService.getAttendanceReport(params);
      
      // Backend usually wraps data in a 'data' property
      const resData = res?.data || res;
      
      // Check if we actually got data back
      const studentsList = resData?.student_wise || (Array.isArray(resData) ? resData : []);
      if (studentsList.length === 0 && !resData?.class_summary) {
        toast.error('No records found for the selected filters');
      } else {
        setReportData(resData);
        toast.success('Report generated successfully');
      }
    } catch (err) {
      console.error('Report error:', err);
      toast.error(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!reportData || filteredRows.length === 0) {
      toast.error('No report data to export');
      return;
    }

    const doc = new jsPDF();
    const primaryColor = [79, 70, 229]; // Indigo-600
    const secondaryColor = [71, 85, 105]; // Slate-600

    // Header
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('THE CLOUDS ACADEMY', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    const reportTitle = reportType === 'class' ? 'Class Attendance Report' : 'Individual Performance Report';
    doc.text(reportTitle, 105, 30, { align: 'center' });
    
    // Horizontal Line
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 35, 190, 35);

    // Meta Data
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const selectedClass = classes.find(c => c.id === filters.class)?.name || 'N/A';
    const selectedSection = sections.find(s => s.id === filters.section)?.name || 'All Sections';
    const monthName = new Date(0, filters.month - 1).toLocaleString('default', { month: 'long' });
    
    doc.text(`Class: ${selectedClass}`, 20, 45);
    doc.text(`Section: ${selectedSection}`, 20, 50);
    doc.text(`Report Period: ${monthName} ${new Date().getFullYear()}`, 140, 45);
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 140, 50);

    // Summary Boxes (Optional but look great) - Simple text for now
    if (stats?.isClass) {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(20, 58, 170, 15, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`Overall Attendance: ${stats.overallPercentage}%`, 40, 67);
      doc.text(`Working Days: ${stats.workingDays}`, 120, 67);
    }

    // Table
    const tableData = filteredRows.map(item => {
      const student = item.student || item.Student || item;
      const percentage = parseFloat(item.presentPercentage || item.attendance_percentage || 0);
      return [
        `${student?.first_name} ${student?.last_name}`,
        student?.registration_no || 'N/A',
        `${percentage}%`,
        item.present || 0,
        item.absent || 0,
        item.leave || 0,
        percentage >= 75 ? 'Satisfactory' : 'Low'
      ];
    });

    autoTable(doc, {
      startY: stats?.isClass ? 80 : 60,
      head: [['Student Name', 'Reg No.', 'Attendance %', 'P', 'A', 'L', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor, 
        textColor: 255, 
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { halign: 'center' },
        2: { halign: 'center', fontStyle: 'bold' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
      },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
      doc.text('© The Clouds Academy Management System', 105, 290, { align: 'center' });
    }

    doc.save(`Attendance_Report_${selectedClass}_${monthName}.pdf`);
    toast.success('PDF Report downloaded successfully');
  };

  const displayData = useMemo(() => {
    if (!reportData) return [];
    // Handle the nested structure of the report response
    const payload = reportData.data || reportData;
    if (payload.student_wise) return payload.student_wise;
    if (Array.isArray(payload)) return payload;
    // If it's a single student object
    if (payload.student) return [payload];
    return [];
  }, [reportData]);

  const stats = useMemo(() => {
    if (!reportData) return null;
    const payload = reportData.data || reportData;
    
    // If it's a student report (single student response)
    if (payload.student && !payload.student_wise) {
      return {
        present: payload.present,
        absent: payload.absent,
        late: payload.late,
        leave: payload.leave,
        percentage: payload.presentPercentage
      };
    }
    
    // If it's a class report (with summary)
    if (payload.class_summary) {
      return {
        isClass: true,
        enrolled: payload.class_summary.total_students_enrolled,
        workingDays: payload.class_summary.working_days,
        overallPercentage: payload.class_summary.overall_present_percentage
      };
    }

    return null;
  }, [reportData]);

  const filteredRows = useMemo(() => {
    return displayData.filter(item => {
      // Handle both lowercase 'student' and uppercase 'Student' keys
      const student = item.student || item.Student || item;
      const first = student?.first_name || '';
      const last = student?.last_name || '';
      const reg = student?.registration_no || '';
      
      const studentName = `${first} ${last}`.toLowerCase();
      const matchesSearch = studentName.includes(search.toLowerCase()) || 
                           reg.toLowerCase().includes(search.toLowerCase());
      
      // Use whichever percentage field the API provides
      const attendance = parseFloat(item.presentPercentage || item.attendance_percentage || 0);
      const matchesAttendance = attendance >= filters.minAttendance;
      
      const matchesStatus = filters.status === 'all' || 
                           (filters.status === 'low' && attendance < 75) ||
                           (filters.status === 'satisfactory' && attendance >= 75);

      return matchesSearch && matchesAttendance && matchesStatus;
    });
  }, [displayData, search, filters.minAttendance, filters.status]);

  if (!isMounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Report Type Toggle */}
      <div className="flex justify-center">
        <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl flex gap-1 shadow-inner">
          <button 
            onClick={() => setReportType('class')}
            className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${reportType === 'class' ? 'bg-white dark:bg-slate-800 text-primary shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Users className="w-4 h-4" />
            Class Report
          </button>
          <button 
            onClick={() => setReportType('student')}
            className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${reportType === 'student' ? 'bg-white dark:bg-slate-800 text-primary shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Search className="w-4 h-4" />
            Student Report
          </button>
        </div>
      </div>

      {/* Top Filter Selection Mode */}
      <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportType === 'class' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Select {terms.class || 'Class'}
                </label>
                <div className="relative group">
                  <select 
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer font-medium"
                    value={filters.class}
                    onChange={(e) => handleClassChange(e.target.value)}
                  >
                    <option value="all">All Classes</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  Select Section
                </label>
                <div className="relative group">
                  <select 
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer font-medium"
                    value={filters.section}
                    onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
                  >
                    <option value="all">All Sections</option>
                    {Array.isArray(sections) && sections.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Select Class
                </label>
                <div className="relative group">
                  <select 
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer font-medium"
                    value={filters.class}
                    onChange={(e) => handleClassChange(e.target.value)}
                  >
                    <option value="all">Select Class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  Select Section
                </label>
                <div className="relative group">
                  <select 
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer font-medium"
                    value={filters.section}
                    onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
                  >
                    <option value="all">All Sections</option>
                    {Array.isArray(sections) && sections.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Select Student
                </label>
                <div className="relative group">
                  <select 
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer font-medium"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                  >
                    <option value="all">Choose a Student</option>
                    {students.map(st => (
                      <option key={st.id} value={st.id}>{st.first_name} {st.last_name} ({st.registration_no || 'No Reg'})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Academic Year
            </label>
            <div className="relative group">
              <select 
                className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer font-medium"
                value={filters.academicYear}
                onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
              >
                <option value="all">Select Year</option>
                {academicYears.map(y => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Select Month
            </label>
            <div className="relative group">
              <select 
                className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer font-medium"
                value={filters.month}
                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Report Management Engine 2.0</p>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold text-slate-600 dark:text-slate-300 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Print Results
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-primary hover:text-primary font-bold transition-all shadow-sm active:scale-95"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button 
              onClick={handleGenerateReport}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Result Filters (Only shown when data exists) */}
      {reportData && (
        <div className="bg-gradient-to-r from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/50 p-1 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none animate-in fade-in zoom-in duration-700">
          <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md rounded-[2.2rem] p-6 lg:px-8 flex flex-col md:flex-row gap-8 items-center">
            
            <div className="flex-1 w-full space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-sm shadow-primary/5">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Performance Filter</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Segregate by Attendance Bracket</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: 'all', label: 'All Records', icon: Users },
                  { id: 'low', label: 'Low Performance', sub: '< 75%', icon: CalendarX },
                  { id: 'satisfactory', label: 'Satisfactory', sub: '≥ 75%', icon: ShieldCheck }
                ].map((s) => {
                  const Icon = s.icon;
                  const isActive = filters.status === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setFilters(prev => ({ ...prev, status: s.id }))}
                      className={`relative flex flex-col items-start px-5 py-3 rounded-2xl transition-all duration-300 group ${
                        isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 -translate-y-1' 
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                        <span className="text-sm font-black tracking-tight">{s.label}</span>
                      </div>
                      {s.sub && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider opacity-60 ${isActive ? 'text-primary-foreground/80' : 'text-slate-500'}`}>
                          {s.sub}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-foreground rounded-full shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full md:w-[320px] bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 space-y-4">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-xs font-black uppercase tracking-tighter">Min. Threshold</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-black text-primary">{filters.minAttendance}</span>
                  <span className="text-xs font-bold text-slate-400">%</span>
                </div>
              </div>
              
              <div className="relative pt-2">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={filters.minAttendance}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAttendance: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-primary hover:accent-primary-hover focus:outline-none transition-all"
                />
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-[10px] font-bold text-slate-400">0%</span>
                  <span className="text-[10px] font-bold text-slate-400">100%</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Middle Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats?.isClass ? (
          <>
            <StatCard 
              title="Students Enrolled" 
              value={stats.enrolled} 
              icon={Users} 
              color="bg-primary" 
            />
            <StatCard 
              title="Working Days" 
              value={stats.workingDays} 
              icon={Calendar} 
              color="bg-emerald-500" 
            />
            <StatCard 
              title="Overall Attendance" 
              value={`${stats.overallPercentage}%`}
              icon={CalendarCheck} 
              color="bg-emerald-500" 
              trend="up" 
              trendValue="Target 90%" 
            />
            <StatCard 
              title="On Leave" 
              value="09" 
              icon={UserPlus} 
              color="bg-blue-500" 
            />
          </>
        ) : stats ? (
          <>
            <StatCard 
              title="Present Days" 
              value={stats.present} 
              icon={CalendarCheck} 
              color="bg-emerald-500" 
              trend="up" 
              trendValue={`${stats.percentage}%`} 
            />
            <StatCard 
              title="Absent Days" 
              value={stats.absent} 
              icon={CalendarX} 
              color="bg-rose-500" 
            />
            <StatCard 
              title="Late Arrivals" 
              value={stats.late} 
              icon={Clock} 
              color="bg-amber-500" 
            />
            <StatCard 
              title="On Leave" 
              value={stats.leave} 
              icon={UserPlus} 
              color="bg-blue-500" 
            />
          </>
        ) : (
          <div className="lg:col-span-4 p-8 text-center bg-white dark:bg-slate-950 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <p className="text-slate-500">Please select filters and generate a report to see statistics</p>
          </div>
        )}
      </div>

      {/* Bottom Table Section */}
      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              {reportType === 'class' ? 'Detailed Attendance Log' : 'Student Performance Overview'}
            </h3>
            <p className="text-sm text-slate-500">
              {reportType === 'class' 
                ? 'Individual performance tracking for Oct 2023' 
                : 'Showing attendance summary for the selected student'}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search student..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 uppercase text-[11px] font-bold tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Student Info</th>
                <th className="px-6 py-4 text-center">Attendance %</th>
                <th className="px-6 py-4 text-center">Present</th>
                <th className="px-6 py-4 text-center">Absent</th>
                <th className="px-6 py-4 text-center">Leave</th>
                <th className="px-6 py-4 text-center">Late</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRows.map((item, idx) => {
                const student = item.student || item.Student || item;
                const percentage = parseFloat(item.presentPercentage || item.attendance_percentage || 0);

                return (
                  <tr key={student?.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-sm shadow-sm">
                          {student?.first_name?.[0]}{student?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-primary transition-colors">
                            {student?.first_name} {student?.last_name}
                          </p>
                          <p className="text-xs text-slate-500">Reg: {student?.registration_no || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
                        <span className={`text-sm font-bold ${percentage >= 90 ? 'text-emerald-600' : percentage >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {percentage}%
                        </span>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${percentage >= 90 ? 'bg-emerald-500' : percentage >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">{item.present}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">{item.absent}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">{item.leave}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">{item.late}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        percentage >= 75 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30'
                      }`}>
                        {percentage >= 75 ? 'Satisfactory' : 'Low'}
                      </span>
                    </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing 1 to {filteredRows.length} students</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-50 transition-all hover:border-primary" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm">1</button>
              <button className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-sm">2</button>
              <button className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-sm">3</button>
            </div>
            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:border-primary">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;
