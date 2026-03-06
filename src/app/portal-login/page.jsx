'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import Link from 'next/link';
import {
  GraduationCap, Users, BookOpen, Eye, EyeOff,
  ArrowLeft, CheckCircle, Mail, Lock, Briefcase,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import usePortalStore from '@/store/portalStore';
import { dummyPortalLogin, PORTAL_DEMO_ACCOUNTS } from '@/data/portalDummyData';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(4, 'Minimum 4 characters'),
});

const PORTAL_TYPES = [
  {
    type: 'PARENT',
    icon: Users,
    label: 'Parent Portal',
    tagline: 'Track your child\'s progress',
    color: 'indigo',
    gradient: 'from-indigo-600 to-violet-600',
    bg: 'bg-indigo-50',
    ic: 'text-indigo-600',
    border: 'border-indigo-200',
    activeBg: 'bg-gradient-to-r from-indigo-600 to-violet-600',
    demoHint: `parent@tca.edu.pk / parent@123`,
    redirectTo: '/parent',
    features: ['Child attendance', 'Fee status', 'Exam results', 'Announcements'],
  },
  {
    type: 'STUDENT',
    icon: BookOpen,
    label: 'Student Portal',
    tagline: 'View your own academic data',
    color: 'emerald',
    gradient: 'from-emerald-600 to-teal-600',
    bg: 'bg-emerald-50',
    ic: 'text-emerald-600',
    border: 'border-emerald-200',
    activeBg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    demoHint: `ali@student.tca / student@123`,
    redirectTo: '/student',
    features: ['My attendance', 'My fee record', 'My exam results', 'Class timetable'],
  },
  {
    type: 'TEACHER',
    icon: Briefcase,
    label: 'Teacher Portal',
    tagline: 'Manage your classes & students',
    color: 'blue',
    gradient: 'from-blue-600 to-sky-600',
    bg: 'bg-blue-50',
    ic: 'text-blue-600',
    border: 'border-blue-200',
    activeBg: 'bg-gradient-to-r from-blue-600 to-sky-600',
    demoHint: `hassan@teacher.tca / teacher@123`,
    redirectTo: '/teacher',
    features: ['My classes & subjects', 'Upload notes', 'Assign homework', 'Mark attendance'],
  },
];

const INSTITUTE_TABS = [
  { value: 'school',     label: 'School'     },
  { value: 'coaching',   label: 'Coaching'   },
  { value: 'academy',    label: 'Academy'    },
  { value: 'college',    label: 'College'    },
  { value: 'university', label: 'University' },
];

const ROLE_STYLES = {
  PARENT:  { icon: Users,     bg: 'bg-indigo-100',  ic: 'text-indigo-600'  },
  STUDENT: { icon: BookOpen,  bg: 'bg-emerald-100', ic: 'text-emerald-600' },
  TEACHER: { icon: Briefcase, bg: 'bg-blue-100',    ic: 'text-blue-600'    },
};

export default function PortalLoginPage() {
  const router = useRouter();
  const setPortalUser = usePortalStore((s) => s.setPortalUser);
  const [activeType, setActiveType] = useState('PARENT');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [demoInstitute, setDemoInstitute] = useState('academy');

  const activePt = PORTAL_TYPES.find((p) => p.type === activeType);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const result = dummyPortalLogin({ ...data, type: activeType });
      setPortalUser(result.user, result.portal_type, result.institute_type);
      Cookies.set('portal_token', result.token, { expires: 1 });
      Cookies.set('portal_type', result.portal_type, { expires: 1 });
      toast.success(`Welcome, ${result.user.name || result.user.first_name}!`);
      router.replace(activePt.redirectTo);
    } catch (err) {
      toast.error(err?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: activeType === 'PARENT'
          ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)'
          : activeType === 'TEACHER'
          ? 'linear-gradient(135deg, #0c1a2e 0%, #1e3a5f 50%, #1d4ed8 100%)'
          : 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #0f766e 100%)',
        transition: 'background 0.5s ease',
      }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Back button */}
      <div className="relative z-10 p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="relative flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl grid lg:grid-cols-5 gap-8 items-center">
          {/* LEFT — Info panel */}
          <div className="lg:col-span-2 text-white hidden lg:block">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">The Clouds Academy</p>
                <p className="text-white/60 text-xs">Student Information System</p>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold mb-3 leading-tight">
              {activePt.label}
            </h1>
            <p className="text-white/70 text-sm mb-7">{activePt.tagline}</p>

            <ul className="space-y-3">
              {activePt.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <span className="text-white/80">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/20">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Demo Credentials</p>
              <p className="text-sm font-mono text-white/90">{activePt.demoHint}</p>
            </div>
          </div>

          {/* RIGHT — Login card */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Portal type switcher */}
            <div className="grid grid-cols-3">
              {PORTAL_TYPES.map((pt) => {
                const Icon = pt.icon;
                const isActive = pt.type === activeType;
                return (
                  <button
                    key={pt.type}
                    onClick={() => setActiveType(pt.type)}
                    className={`flex items-center justify-center gap-2.5 py-4 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? `${pt.activeBg} text-white`
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                    {pt.label}
                  </button>
                );
              })}
            </div>

            {/* Form */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Sign in to {activePt.label}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {activeType === 'PARENT' ? 'Enter your registered parent account credentials' : activeType === 'TEACHER' ? 'Enter your teacher account credentials' : 'Enter your student login credentials'}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={activeType === 'PARENT' ? 'parent@tca.edu.pk' : activeType === 'TEACHER' ? 'hassan@teacher.tca' : 'ali@student.tca'}
                      className="pl-10"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                    Password
                  </Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-semibold py-5 ${
                    activeType === 'PARENT'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
                      : activeType === 'TEACHER'
                      ? 'bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                  } text-white`}
                >
                  {loading ? 'Signing in...' : `Sign in to ${activePt.label}`}
                </Button>
              </form>

              {/* Quick Demo Login */}
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Quick Demo Login</p>

                {/* Institute type tabs */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {INSTITUTE_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setDemoInstitute(tab.value)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                        demoInstitute === tab.value
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Account cards — 3 per institute type */}
                <div className="grid grid-cols-3 gap-2">
                  {PORTAL_DEMO_ACCOUNTS.filter((a) => a.institute_type === demoInstitute).map((acc) => {
                    const rs = ROLE_STYLES[acc.role];
                    const Icon = rs.icon;
                    return (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => {
                          setActiveType(acc.role);
                          setValue('email', acc.email);
                          setValue('password', acc.password);
                          toast.success(`${acc.role.charAt(0) + acc.role.slice(1).toLowerCase()} account filled!`);
                        }}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-white hover:shadow-sm transition-all text-center group"
                      >
                        <div className={`w-8 h-8 rounded-lg ${rs.bg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${rs.ic}`} />
                        </div>
                        <p className="text-[11px] font-bold text-slate-800 leading-tight">{acc.name.split(' ')[0]}</p>
                        <p className="text-[10px] text-slate-400 capitalize leading-none">{acc.role.toLowerCase()}</p>
                        <p className="text-[9px] text-slate-300 leading-none font-mono">{acc.password}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Staff login link */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  Are you a school staff member?{' '}
                  <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                    Staff Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
