'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { QrCode, Users, UserSquare, CheckCircle, Search, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField, DatePickerField, AppModal } from '@/components/common';
import QRScanner from '@/components/attendance/QRScanner';
import AttendanceFilter from '@/components/attendance/AttendanceFilter';

import useInstituteConfig from '@/hooks/useInstituteConfig';
import {
  studentAttendanceService,
  classService,
  studentService,
  academicYearService
} from '@/services';


export default function MarkAttendanceModal({ open, onClose, defaultMode = 'class', type = 'school' }) {
  const { terms } = useInstituteConfig();
  const [activeTab, setActiveTab] = useState(defaultMode);

  // Sync tab with defaultMode when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab(defaultMode);
    }
  }, [open, defaultMode]);

  const isScanOnly = defaultMode === 'scan';

  return (
    <AppModal 
      open={open} 
      onClose={onClose} 
      title={isScanOnly ? "Scan QR Attendance" : "Manual Attendance"} 
      description={isScanOnly ? "Rapidly scan student ID cards to mark bulk attendance." : "Mark bulk attendance by class or search for an individual student."}
      size="xl"
    >
      <div className="space-y-6">
        {isScanOnly ? (
          <InstantScanTab />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-col sm:grid sm:grid-cols-3 w-full h-auto mb-6 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl gap-1">
              <TabsTrigger value="bulk-scan" className="rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                <QrCode className="w-4 h-4 mr-2" /> Bulk Scan Mode
              </TabsTrigger>
              <TabsTrigger value="class" className="rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                <Users className="w-4 h-4 mr-2" /> By {terms.class || 'Class'}
              </TabsTrigger>
              <TabsTrigger value="student" className="rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                <UserSquare className="w-4 h-4 mr-2" /> By {terms.student || 'Student'}
              </TabsTrigger>
            </TabsList>

            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
              <TabsContent value="bulk-scan" className="mt-0 outline-none">
                <BulkScanTab />
              </TabsContent>

              <TabsContent value="class" className="mt-0 outline-none">
                <ClassAttendanceTab terms={terms} type={type} />
              </TabsContent>

              <TabsContent value="student" className="mt-0 outline-none">
                <StudentSearchTab terms={terms} type={type} />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </AppModal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Instant Scan Tab
// ─────────────────────────────────────────────────────────────────────────────
function InstantScanTab() {
  const [scanHistory, setScanHistory] = useState([]);
  const [scanType, setScanType] = useState('regular');
  
  // Hand to hand matching uses strictly current local date
  const todayDate = new Date().toISOString().slice(0, 10);

  const handleScan = async (studentId) => {
    if (!studentId) return false;
    
    // Prevent double scanning the exact same code within short intervals
    const lastScan = scanHistory[0];
    if (lastScan && lastScan.id === studentId && (Date.now() - lastScan.timestamp < 3000)) {
      return false; 
    }
    
    try {
      await studentAttendanceService.scanQR({
        student_id: studentId,
        date: todayDate,
        type: scanType
      });
      
      toast.success(`Successfully marked attendance for ${studentId}`);
      setScanHistory(prev => [{ id: studentId, status: 'success', timestamp: Date.now() }, ...prev].slice(0, 50));
      return true; 
    } catch(err) {
      toast.error(err.response?.data?.message || `Failed to mark attendance for ${studentId}`);
      setScanHistory(prev => [{ 
        id: studentId, 
        status: 'error', 
        error: err.response?.data?.message || 'Error occurred', 
        timestamp: Date.now() 
      }, ...prev].slice(0, 50));
      return false;
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
      <div className="space-y-6 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
        
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-extrabold text-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                <QrCode size={18} />
              </div>
              Instant QR Scanner
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Scan student ID cards to mark them present instantly. Uses today's date automatically.
            </p>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800 relative group">
          <QRScanner onScan={handleScan} bulkMode={true} />
        </div>
      </div>
      
      <div className="space-y-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <SelectField
            label="Attendance Type"
            options={[
              { value: 'regular', label: 'Regular Classes' },
              { value: 'exam', label: 'Examinations' },
              { value: 'extra_class', label: 'Extra Classes' },
              { value: 'event', label: 'Special Event' }
            ]}
            value={scanType}
            onChange={(val) => setScanType(val)}
          />
          <div className="space-y-1.5 flex flex-col justify-end pointer-events-none opacity-80">
            <DatePickerField
              label="Date (Fixed)"
              value={todayDate}
              onChange={() => {}}
            />
          </div>
        </div>

        <div className="min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
              Recent Scans
            </h4>
            {scanHistory.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs text-slate-500 hover:text-red-500 h-6 px-2">
                Clear List
              </Button>
            )}
          </div>
          
          {scanHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-950 transition-all">
              <QrCode className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-slate-500">Camera is ready</p>
              <p className="text-xs text-slate-400">Scan QR to log directly to the server</p>
            </div>
          ) : (
            <ul className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
              {scanHistory.map((item, idx) => (
                <li key={`${item.id}-${item.timestamp}-${idx}`} className={`flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-950 border ${item.status === 'success' ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800'} shadow-sm animate-in slide-in-from-right-4 transition-colors`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner shrink-0 ${
                    item.status === 'success' 
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {item.status === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold font-mono tracking-wider text-slate-800 dark:text-slate-200 text-lg block leading-none truncate">
                      {item.id}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider mt-1 block ${item.status === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {item.status === 'success' ? `Logged at ${new Date(item.timestamp).toLocaleTimeString()}` : item.error}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1b. Bulk Scan Tab (Queue-based)
// ─────────────────────────────────────────────────────────────────────────────
function BulkScanTab() {
  const [scannedIds, setScannedIds] = useState([]);
  const scannedIdsRef = useRef([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    scannedIdsRef.current = scannedIds;
  }, [scannedIds]);

  const handleScan = async (studentId) => {
    if (!studentId) return false;
    
    if (scannedIdsRef.current.includes(studentId)) {
      return false; 
    }
    
    setScannedIds(prev => [...prev, studentId]);
    return true; 
  };

  const removeScannedId = (id) => {
    setScannedIds(prev => prev.filter(item => item !== id));
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        date,
        records: scannedIds.map(id => ({ student_id: id, status: 'present' })),
        type: 'bulk_qr'
      };
      
      try {
        return await studentAttendanceService.bulkMarkAttendance(payload);
      } catch (err) {
        console.warn('Bulk API failed, falling back to sequential scans...', err);
        const promises = scannedIds.map(id => 
          studentAttendanceService.scanQR({ student_id: id, date, type: 'regular' }).catch(e => ({ error: e, id }))
        );
        const results = await Promise.all(promises);
        return { data: results, fallback: true };
      }
    },
    onSuccess: () => {
      toast.success(`Successfully marked attendance for ${scannedIds.length} students!`);
      setScannedIds([]);
    },
    onError: (err) => {
      toast.error('Failed to submit bulk attendance. Please try again.');
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
      <div className="space-y-6 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
        
        <div>
          <h3 className="font-extrabold text-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
              <QrCode size={18} />
            </div>
            Queue Scanner
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Scan continuously and save IDs locally. Then submit all of them at once.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800 relative group">
          <QRScanner onScan={handleScan} bulkMode={true} />
        </div>
      </div>
      
      <div className="space-y-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 items-end">
          <div className="w-full min-w-0">
            <DatePickerField
              label="Attendance Date"
              value={date}
              onChange={(val) => setDate(val)}
            />
          </div>
          <div className="w-full flex justify-end">
            <Button 
              disabled={scannedIds.length === 0 || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
              className="w-full sm:w-auto h-[42px] px-8 rounded-xl shadow-lg shadow-primary/20 font-bold"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {submitMutation.isPending ? 'Submitting...' : `Submit Batch (${scannedIds.length})`}
            </Button>
          </div>
        </div>

        <div className="min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
              Scan Queue
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 py-0.5 px-2.5 rounded-full text-xs font-black">
                {scannedIds.length}
              </span>
            </h4>
            {scannedIds.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setScannedIds([])} className="text-xs text-slate-500 hover:text-red-500 h-6 px-2">
                Clear All
              </Button>
            )}
          </div>
          
          {scannedIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-950 transition-all">
              <QrCode className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-slate-500">Camera is ready</p>
              <p className="text-xs text-slate-400">Scan QR codes to add to queue</p>
            </div>
          ) : (
            <ul className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
              {scannedIds.map((id, idx) => (
                <li key={`${id}-${idx}`} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-right-4 group hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-xs shadow-inner">
                      {idx + 1}
                    </div>
                    <div>
                      <span className="font-bold font-mono tracking-wider text-slate-800 dark:text-slate-200 text-lg block leading-none">
                        {id}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Pending Submit</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeScannedId(id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 px-3 rounded-lg sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Class/Section Filter Tab
// ─────────────────────────────────────────────────────────────────────────────
function ClassAttendanceTab({ terms, type = 'school' }) {
  const [filters, setFilters] = useState({
    academic_year_id: '',
    class_id: '',
    section_id: '',
    date: new Date().toISOString().slice(0, 10),
  });
  
  const [attendanceState, setAttendanceState] = useState({});

  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students-for-attendance', filters.class_id, filters.section_id, filters.academic_year_id],
    queryFn: () => studentService.getAll({ 
      academic_year_id: filters.academic_year_id,
      class_id: filters.class_id, 
      section_id: filters.section_id || undefined,
      limit: 1000
    }, type),
    enabled: !!filters.class_id,
  });

  const students = studentsData?.data?.rows ?? studentsData?.data ?? [];

  useEffect(() => {
    if (students.length > 0) {
      const initial = {};
      students.forEach(s => { initial[s.id] = 'present'; });
      setAttendanceState(initial);
    } else {
      setAttendanceState({});
    }
  }, [studentsData]);

  const markAll = (status) => {
    const nextState = {};
    students.forEach(s => { nextState[s.id] = status; });
    setAttendanceState(nextState);
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const records = Object.entries(attendanceState).map(([student_id, status]) => ({
        student_id,
        status,
        remarks: ''
      }));

      return studentAttendanceService.bulkMarkAttendance({
        academic_year_id: filters.academic_year_id,
        class_id: filters.class_id,
        section_id: filters.section_id,
        date: filters.date,
        records
      });
    },
    onSuccess: () => {
      toast.success('Attendance submitted successfully!');
    },
    onError: (err) => {
      toast.error('Failed to submit attendance.');
      console.error(err);
    }
  });

  const stats = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0 };
    Object.values(attendanceState).forEach(val => {
      if (counts[val] !== undefined) counts[val]++;
    });
    return counts;
  }, [attendanceState]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold tracking-tight">Bulk Class Mark</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Filter students by {terms.class || 'class'} and {terms.section || 'section'} to mark bulk attendance.</p>
        </div>
        
        <AttendanceFilter 
          filters={filters} 
          setFilters={setFilters} 
          terms={terms} 
          showDate={true} 
        />
      </div>

      {!filters.class_id ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No {terms.class || 'Class'} Selected</h3>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto">Please select a {terms.class || 'class'} from the filters above to load the student list.</p>
        </div>
      ) : isLoadingStudents ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 animate-pulse">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-medium text-slate-600 dark:text-slate-400">Loading student roster...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-semibold">No Students Found</h3>
          <p className="text-slate-500">There are no students matching the selected {terms.class} and {terms.section}.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="flex flex-col lg:flex-row items-center justify-between bg-white dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm gap-6">
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 sm:gap-6 divide-x divide-slate-200 dark:divide-slate-800 w-full lg:w-auto">
              <div className="pl-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">{students.length}</p>
              </div>
              <div className="pl-6">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Present</p>
                <p className="text-2xl font-black text-emerald-500 leading-none">{stats.present}</p>
              </div>
              <div className="pl-6 hidden sm:block">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Absent</p>
                <p className="text-2xl font-black text-red-500 leading-none">{stats.absent}</p>
              </div>
              <div className="pl-6 hidden sm:block">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Late</p>
                <p className="text-2xl font-black text-amber-500 leading-none">{stats.late}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 shrink-0">
              <Button onClick={() => markAll('present')} variant="outline" className="flex-1 sm:flex-none border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 hover:text-emerald-700 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40">
                Mark All Present
              </Button>
              <Button onClick={() => markAll('absent')} variant="outline" className="flex-1 sm:flex-none border-red-200 bg-red-50/50 hover:bg-red-100 hover:text-red-700 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:hover:bg-red-900/40">
                All Absent
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Student Details</th>
                    <th className="px-5 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs w-[120px]">Reg. No</th>
                    <th className="px-5 py-4 text-right font-bold text-slate-500 uppercase tracking-wider text-xs min-w-[280px]">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {students.map((s, index) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                            {s.first_name.charAt(0)}{s.last_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{s.first_name} {s.last_name}</p>
                            <p className="text-xs text-slate-500">{s.class?.name} • {s.section?.name || 'No Section'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {s.registration_no || s.id.substring(0,8)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex sm:inline-flex flex-wrap justify-end rounded-xl sm:p-1 gap-1 sm:gap-0 sm:bg-slate-100 sm:dark:bg-slate-900 sm:border border-slate-200 dark:border-slate-800 sm:shadow-inner">
                          {['present', 'late', 'absent'].map(status => (
                            <button
                              key={status}
                              onClick={() => setAttendanceState(prev => ({ ...prev, [s.id]: status }))}
                              className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-200
                                ${attendanceState[s.id] === status 
                                  ? status === 'present' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                    : status === 'absent' ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                                    : 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                                  : 'bg-slate-100 sm:bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:bg-slate-800 sm:dark:bg-transparent dark:hover:text-slate-200'
                                }
                              `}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sticky bottom-4 w-full flex justify-end z-10 px-2 sm:px-0">
            <div className="w-full sm:w-auto bg-white dark:bg-slate-900 p-2 sm:pl-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 animate-bounce-in">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden md:block">
                Ready to submit attendance for <span className="font-bold text-slate-900 dark:text-white">{students.length}</span> students?
              </p>
              <Button 
                onClick={() => submitMutation.mutate()} 
                disabled={submitMutation.isPending} 
                className="w-full sm:w-auto h-12 px-8 rounded-xl shadow-lg shadow-primary/20"
              >
                <Save className="w-5 h-5 mr-2" />
                {submitMutation.isPending ? 'Processing...' : 'Save Attendance'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Student Search Tab
// ─────────────────────────────────────────────────────────────────────────────
function StudentSearchTab({ terms, type = 'school' }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState('present');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['student-search', debouncedSearch, type],
    queryFn: () => studentService.getAll({ search: debouncedSearch, limit: 10 }, type),
    enabled: debouncedSearch.length >= 2,
  });

  const students = studentsData?.data?.rows ?? studentsData?.data ?? [];

  const markMutation = useMutation({
    mutationFn: (payload) => studentAttendanceService.markAttendance(payload),
    onSuccess: () => {
      toast.success(`Attendance marked as ${status} for ${selectedStudent.first_name}!`);
      setSelectedStudent(null);
      setSearch('');
    },
    onError: (err) => {
      toast.error('Failed to mark. ' + (err.response?.data?.message || ''));
    }
  });

  const handleSubmit = () => {
    markMutation.mutate({
      student_id: selectedStudent.id,
      date,
      status,
      type: 'manual'
    });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold">Search Student</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            autoFocus
            className="pl-10 h-12 text-lg rounded-xl shadow-sm"
            placeholder="Type name or reg number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value === '') setSelectedStudent(null);
            }}
          />
        </div>
        
        {isLoading && <p className="text-sm text-slate-500 mt-2 px-2 animate-pulse">Searching...</p>}
        {debouncedSearch.length >= 2 && !isLoading && students.length === 0 && (
          <p className="text-sm text-red-500 mt-2 px-2">No students found matching "{debouncedSearch}"</p>
        )}
        
        {debouncedSearch.length >= 2 && students.length > 0 && !selectedStudent && (
          <ul className="mt-2 bg-white dark:bg-slate-900 border rounded-xl shadow-lg overflow-hidden border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
            {students.map(s => (
              <li 
                key={s.id} 
                className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between border-b last:border-0"
                onClick={() => setSelectedStudent(s)}
              >
                <div>
                  <p className="font-semibold">{s.first_name} {s.last_name}</p>
                  <p className="text-xs text-slate-500">{s.registration_no} • {s.class?.name || 'No Class'}</p>
                </div>
                <Button size="sm" variant="secondary" className="rounded-full">Select</Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedStudent && (
        <div className="bg-slate-50 dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-6 shadow-sm animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-4 mb-6 border-b pb-4 border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl">
              {selectedStudent.first_name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold">{selectedStudent.first_name} {selectedStudent.last_name}</h3>
              <p className="text-sm text-slate-500">{selectedStudent.registration_no} • {selectedStudent.class?.name || ''}</p>
            </div>
          </div>

          <div className="space-y-6">
            <DatePickerField label="Select Date" value={date} onChange={setDate} />
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">Attendance Status</label>
              <div className="grid grid-cols-3 gap-3">
                {['present', 'late', 'absent'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`p-3 rounded-xl border-2 font-bold uppercase tracking-wider text-sm transition-all
                      ${status === s 
                        ? s === 'present' ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : s === 'absent' ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950'
                      }
                    `}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full h-12 text-md" 
              onClick={handleSubmit} 
              disabled={markMutation.isPending}
            >
              {markMutation.isPending ? 'Saving...' : `Mark ${status.toUpperCase()} for ${selectedStudent.first_name}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
