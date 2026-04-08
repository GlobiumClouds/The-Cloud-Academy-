"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, Clock, LogIn, LogOut, CheckCircle2, 
  MapPin, AlertCircle, History, TrendingUp, 
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useAuthStore from "@/store/authStore";

const DUMMY_HISTORY = [
  { date: '2026-03-10', day: 'Monday', check_in: '07:52 AM', check_out: '03:15 PM', status: 'present', duration: '7h 23m' },
  { date: '2026-03-09', day: 'Friday', check_in: '08:05 AM', check_out: '03:00 PM', status: 'late', duration: '6h 55m' },
  { date: '2026-03-08', day: 'Thursday', check_in: '07:45 AM', check_out: '03:30 PM', status: 'present', duration: '7h 45m' },
  { date: '2026-03-07', day: 'Wednesday', check_in: '07:58 AM', check_out: '03:05 PM', status: 'present', duration: '7h 07m' },
  { date: '2026-03-06', day: 'Tuesday', check_in: '—', check_out: '—', status: 'absent', duration: '0h 0m' },
];

export default function TeacherSelfAttendancePage() {
  const user = useAuthStore((state) => state.user);
  const [time, setTime] = useState(new Date());
  const [isCheckIn, setIsCheckIn] = useState(false);
  const [checkInData, setCheckInData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckAction = () => {
    setLoading(true);
    setTimeout(() => {
      const now = new Date();
      if (!isCheckIn) {
        setCheckInData({ time: format(now, "hh:mm a"), date: format(now, "MMM dd") });
        setIsCheckIn(true);
        toast.success("Checked in successfully!");
      } else {
        setIsCheckIn(false);
        setCheckInData(null);
        toast.info("Checked out successfully!");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Welcome & Time Banner - Project Style */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-blue-100">
        <div className="absolute right-4 top-4 opacity-10">
          <Clock className="w-32 h-32" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-extrabold text-white flex-shrink-0 backdrop-blur-sm">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/70 text-xs mb-0.5 tracking-wider uppercase font-bold">My Attendance</p>
              <h1 className="text-2xl font-extrabold tracking-tight">Daily Presence & Duty</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className="bg-white/20 text-white border-0 text-xs font-bold">{format(time, "EEEE, dd MMMM")}</Badge>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/30 rounded-full text-[10px] font-bold">
                   <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live Tracking Active
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center min-w-[180px]">
            <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">Current Server Time</p>
            <p className="text-3xl font-black text-white font-mono tracking-tighter">
              {format(time, "hh:mm:ss a")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Punctuality', value: '94%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Monthly Presence', value: '22/24', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Late Comings', value: '02', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Pending Approvals', value: '01', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white shadow-sm`}>
              <Icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-bold">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Action */}
        <Card className="lg:col-span-2 border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="pb-4 border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">Attendance Log</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-500 font-medium tracking-tight">Main Campus Gate · Designated Area</span>
                </div>
              </div>
              <Badge className={`uppercase text-[10px] font-black px-2.5 py-1 tracking-wider ${isCheckIn ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {isCheckIn ? "On Duty" : "Off Duty"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="py-10 text-center">
            <AnimatePresence mode="wait">
              <motion.div 
                key={isCheckIn ? 'in' : 'out'}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <div className={`w-28 h-28 rounded-3xl flex items-center justify-center transition-all shadow-inner ${isCheckIn ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                  {isCheckIn ? <CheckCircle2 className="w-14 h-14" /> : <Clock className="w-14 h-14" />}
                </div>
                
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-1 tracking-tight">
                    {isCheckIn ? "You are currently Checked In" : "Mark your Check-In"}
                  </h3>
                  {isCheckIn ? (
                    <p className="text-sm text-slate-500 font-medium">Session started at <span className="text-emerald-600 font-bold">{checkInData?.time}</span></p>
                  ) : (
                    <p className="text-sm text-slate-500 font-medium">Capture your presence for the morning shift</p>
                  )}
                </div>

                <Button 
                  onClick={handleCheckAction}
                  disabled={loading}
                  className={`h-14 px-10 rounded-xl text-sm font-bold tracking-tight transition-all active:scale-95 shadow-md ${
                    isCheckIn 
                    ? "bg-rose-600 hover:bg-rose-700 text-white" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : isCheckIn ? (
                    <><LogOut className="w-4 h-4 mr-2" /> MARK CHECK OUT</>
                  ) : (
                    <><LogIn className="w-4 h-4 mr-2" /> MARK CHECK IN</>
                  )}
                </Button>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Schedule Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
             <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Clock className="w-4 h-4 text-blue-600" /> Today&apos;s Schedule
             </h3>
             <div className="space-y-3">
                {[
                  { time: '08:30 AM', task: 'Class 9 Math (A)', room: 'L-01', active: true },
                  { time: '11:15 AM', task: 'Physics Lab (B)', room: 'Lab-3', active: false },
                  { time: '01:45 PM', task: 'Staff Meeting', room: 'Conf. Hall', active: false },
                ].map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border border-transparent transition-all ${item.active ? 'bg-blue-50 border-blue-100' : 'bg-slate-50'}`}>
                    <div className="flex justify-between items-start">
                      <p className={`text-[10px] font-bold ${item.active ? 'text-blue-600' : 'text-slate-400'}`}>{item.time} · {item.room}</p>
                      {item.active && <Badge className="bg-blue-600 text-[8px] h-4">NOW</Badge>}
                    </div>
                    <p className={`text-sm font-bold tracking-tight mt-0.5 ${item.active ? 'text-blue-900' : 'text-slate-700'}`}>{item.task}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium text-amber-800 leading-relaxed italic">
              Remember to Check Out before leaving the premises. Late comings will be tracked automatically.
            </p>
          </div>
        </div>
      </div>

      {/* History - Professional Table Style */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" /> Recent Logbook
          </h2>
          <button className="text-[11px] font-bold text-blue-600 hover:underline">Download Report</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-3 text-left">Date & Day</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Check IN</th>
                <th className="px-6 py-3 text-center">Check OUT</th>
                <th className="px-6 py-3 text-center">Hours</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {DUMMY_HISTORY.map((row) => (
                <tr key={row.date} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-semibold">
                    <span className="text-slate-900">{row.date}</span>
                    <span className="text-slate-400 ml-2 font-medium">{row.day.slice(0, 3)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${
                      row.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 
                      row.status === 'late' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono opacity-80">{row.check_in}</td>
                  <td className="px-6 py-4 text-center font-mono opacity-80">{row.check_out}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-600 tracking-tight">{row.duration}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-slate-400 hover:text-blue-600">
                       <Info className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
