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
  ChevronRight
} from 'lucide-react';

const DUMMY_REPORT_DATA = [
  { id: 1, name: 'Sajid Ali', class: '10A', rollNo: '1001', attendance: 95, present: 20, absent: 1, leave: 1, late: 0, status: 'Active' },
  { id: 2, name: 'Ayesha Khan', class: '10A', rollNo: '1002', attendance: 88, present: 18, absent: 3, leave: 1, late: 2, status: 'Active' },
  { id: 3, name: 'Bilal Ahmed', class: '10A', rollNo: '1003', attendance: 92, present: 19, absent: 2, leave: 1, late: 1, status: 'Inactive' },
  { id: 4, name: 'Fatima Zahra', class: '10A', rollNo: '1004', attendance: 100, present: 22, absent: 0, leave: 0, late: 0, status: 'Active' },
  { id: 5, name: 'Imran Malik', class: '10A', rollNo: '1005', attendance: 75, present: 15, absent: 5, leave: 2, late: 3, status: 'Active' },
  { id: 6, name: 'Zoya Sheikh', class: '10B', rollNo: '1006', attendance: 98, present: 21, absent: 1, leave: 0, late: 0, status: 'Active' },
  { id: 7, name: 'Hassan Raza', class: '10B', rollNo: '1007', attendance: 82, present: 17, absent: 4, leave: 1, late: 4, status: 'Active' },
  { id: 8, name: 'Marium Batool', class: '10B', rollNo: '1008', attendance: 90, present: 19, absent: 2, leave: 1, late: 1, status: 'Active' },
  { id: 9, name: 'Usman Ghani', class: '10B', rollNo: '1009', attendance: 68, present: 12, absent: 7, leave: 3, late: 5, status: 'Active' },
  { id: 10, name: 'Sara Qureshi', class: '10C', rollNo: '1010', attendance: 94, present: 20, absent: 2, leave: 0, late: 1, status: 'Active' },
];

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
        <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">Students</span>
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
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    class: 'all',
    section: 'all',
    academicYear: '2023-2024',
    dateRange: 'Oct 01, 2023 - Oct 31, 2023'
  });

  const filteredData = useMemo(() => {
    return DUMMY_REPORT_DATA.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.rollNo.includes(search);
      const matchesClass = filters.class === 'all' || item.class.includes(filters.class);
      return matchesSearch && matchesClass;
    });
  }, [search, filters.class]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Filter Selection Mode */}
      <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Select {terms.class || 'Class'}
            </label>
            <div className="relative group">
              <select 
                className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer font-medium"
                value={filters.class}
                onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
              >
                <option value="all">All Classes</option>
                <option value="10A">Class 10-A</option>
                <option value="10B">Class 10-B</option>
                <option value="10C">Class 10-C</option>
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
              <select className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer font-medium">
                <option value="all">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Academic Year
            </label>
            <div className="relative group">
              <select className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer font-medium">
                <option>2023-2024</option>
                <option>2024-2025</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Date Range
            </label>
            <div className="relative group">
              <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 cursor-pointer hover:border-primary transition-all">
                <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                <span className="text-sm font-medium">{filters.dateRange}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500 italic">Showing dummy data for visual demonstration</p>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold transition-all active:scale-95">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Middle Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Present Today" 
          value="342" 
          icon={CalendarCheck} 
          color="bg-emerald-500" 
          trend="up" 
          trendValue="+12%" 
        />
        <StatCard 
          title="Absent Today" 
          value="18" 
          icon={CalendarX} 
          color="bg-rose-500" 
          trend="down" 
          trendValue="-5%" 
        />
        <StatCard 
          title="Late Arrivals" 
          value="14" 
          icon={Clock} 
          color="bg-amber-500" 
          trend="up" 
          trendValue="+8%" 
        />
        <StatCard 
          title="On Leave" 
          value="09" 
          icon={UserPlus} 
          color="bg-blue-500" 
        />
      </div>

      {/* Bottom Table Section */}
      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Detailed Attendance Log</h3>
            <p className="text-sm text-slate-500">Individual performance tracking for Oct 2023</p>
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
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-sm shadow-sm">
                        {item.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-primary transition-colors">{item.name}</p>
                        <p className="text-xs text-slate-500">Roll: {item.rollNo} • Class: {item.class}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
                      <span className={`text-sm font-bold ${item.attendance >= 90 ? 'text-emerald-600' : item.attendance >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {item.attendance}%
                      </span>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.attendance >= 90 ? 'bg-emerald-500' : item.attendance >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${item.attendance}%` }}
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
                      item.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing 1 to {filteredData.length} of 150 students</p>
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
