'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

import { authService } from '@/services';
import useAuthStore from '@/store/authStore';
import { DUMMY_USERS, INSTITUTE_TYPES } from '@/data/dummyData';

// Institute login — school_code required
const instituteSchema = z.object({
  school_code: z.string().min(2, 'Institute code is required'),
  email:       z.string().email('Invalid email'),
  password:    z.string().min(6, 'Minimum 6 characters'),
});

// Master admin login — no school_code needed
const masterSchema = z.object({
  school_code: z.string().optional(),
  email:       z.string().email('Invalid email'),
  password:    z.string().min(6, 'Minimum 6 characters'),
});

// Role colour mapping
const ROLE_COLORS = {
  MASTER_ADMIN:  { bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300', dot: 'bg-purple-500' },
  SCHOOL_ADMIN:  { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',         dot: 'bg-blue-500'   },
  FEE_MANAGER:   { bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500' },
  CLASS_TEACHER: { bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',     dot: 'bg-amber-500'  },
  RECEPTIONIST:  { bg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',         dot: 'bg-rose-500'   },
  BRANCH_ADMIN:  { bg: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',         dot: 'bg-teal-500'   },
};

// Institute-type colour override for SCHOOL_ADMIN users
const INST_TYPE_COLORS = {
  school:     { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',         dot: 'bg-blue-500'   },
  coaching:   { bg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300', dot: 'bg-orange-500' },
  academy:    { bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300', dot: 'bg-indigo-500' },
  college:    { bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',         dot: 'bg-cyan-500'   },
  university: { bg: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300', dot: 'bg-violet-500' },
};

const ACCESS_LABELS = {
  MASTER_ADMIN:  'All Institutes',
  SCHOOL_ADMIN:  'Full Access',
  FEE_MANAGER:   'Fees only',
  CLASS_TEACHER: 'Class + Exams',
  RECEPTIONIST:  'Limited',
  BRANCH_ADMIN:  'Branch Mgmt',
};

// Resolve the best label + type name for a user card
function resolveUserMeta(user) {
  const instType = user.school?.institute_type;
  const typeDef  = instType ? INSTITUTE_TYPES.find((t) => t.value === instType) : null;
  const colors   = (user.role_code === 'SCHOOL_ADMIN' && instType && INST_TYPE_COLORS[instType])
    ? INST_TYPE_COLORS[instType]
    : (ROLE_COLORS[user.role_code] ?? { bg: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' });
  const badge    = typeDef ? `${typeDef.icon} ${typeDef.label} Admin` : (user.role?.name ?? user.role_code);
  return { colors, badge, typeDef };
}

export default function LoginPage() {
  const router      = useRouter();
  const setUser     = useAuthStore((s) => s.setUser);
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loginMode, setLoginMode] = useState('institute'); // 'institute' | 'master'

  const isMaster = loginMode === 'master';

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isMaster ? masterSchema : instituteSchema),
  });

  const switchMode = (mode) => {
    setLoginMode(mode);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await authService.login(data);
      setUser(res.user, res.access_token);
      Cookies.set('role_code', res.user.role_code, { expires: 7 });

      // Store institute_type in cookie so middleware can use it for route guards
      const instType =
        res.user.institute_type ||
        res.user.school?.institute_type ||
        res.user.institute?.institute_type;
      if (instType) Cookies.set('institute_type', instType, { expires: 7 });

      toast.success(`Welcome back, ${res.user.first_name}!`);

      // Redirect to the correct institute-type dashboard
      const DASHBOARD_PATHS = {
        school:     '/school/dashboard',
        coaching:   '/coaching/dashboard',
        academy:    '/academy/dashboard',
        college:    '/college/dashboard',
        university: '/university/dashboard',
      };
      if (res.user.role_code === 'MASTER_ADMIN') {
        router.replace('/master-admin');
      } else {
        router.replace(DASHBOARD_PATHS[instType] ?? '/dashboard');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (user) => {
    const isMasterUser = user.role_code === 'MASTER_ADMIN';
    // Switch mode to match demo user type
    if (isMasterUser && loginMode !== 'master')   switchMode('master');
    if (!isMasterUser && loginMode !== 'institute') switchMode('institute');
    // Use setTimeout so reset() finishes before setValue
    setTimeout(() => {
      // DUMMY_USERS store institute_code (not school_code) — map it correctly
      if (!isMasterUser) setValue('school_code', user.institute_code ?? '');
      setValue('email',    user.email);
      setValue('password', user.password);
      toast.info(`Filled: ${user.first_name} (${user.role?.name})`);
    }, 0);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

      {/* ════════════════════════ LOGIN FORM ════════════════════════ */}
      <div className="lg:col-span-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="mb-1 text-xl font-semibold">Sign in</h2>
          <p className="mb-6 text-sm text-muted-foreground">Enter your credentials to continue</p>

          {/* ── Login mode toggle ── */}
          <div className="mb-5 flex rounded-lg border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => switchMode('institute')}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                !isMaster
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Institute Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('master')}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                isMaster
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Master Admin
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Institute Code — hidden for Master Admin */}
            {!isMaster && (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Institute Code <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('school_code')}
                  placeholder="e.g. TCA-LHR"
                  autoComplete="organization"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                />
                {errors.school_code && (
                  <p className="mt-1 text-xs text-destructive">{errors.school_code.message}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@school.com"
                autoComplete="email"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <a href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

      {/* ════════════════════════ DEMO CREDENTIALS ════════════════════════ */}
      <div className="lg:col-span-3">
        <div className="rounded-xl border border-dashed bg-muted/40 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={15} className="text-primary" />
            <span className="text-sm font-semibold">Demo Accounts</span>
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              Click to auto-fill
            </span>
          </div>

            {/* ── Demo Credentials ── */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DUMMY_USERS.map((user) => {
              const { colors, badge, typeDef } = resolveUserMeta(user);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => fillDemo(user)}
                  className="group flex flex-col items-start rounded-lg border bg-background px-3 py-3 text-left shadow-sm transition-all hover:border-primary hover:shadow-md active:scale-[0.98]"
                >
                  {/* Name + Role badge */}
                  <div className="mb-2 flex w-full items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${colors.dot}`} />
                      <span className="truncate text-sm font-semibold leading-tight">
                        {user.first_name} {user.last_name}
                      </span>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors.bg}`}>
                      {badge}
                    </span>
                  </div>

                  {/* Credentials */}
                  <div className="w-full space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="w-10 shrink-0 text-[10px] text-muted-foreground">Email</span>
                      <span className="truncate font-mono text-[11px] text-foreground/80">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-10 shrink-0 text-[10px] text-muted-foreground">Pass</span>
                      <span className="font-mono text-[11px] text-foreground/80">{user.password}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-10 shrink-0 text-[10px] text-muted-foreground">Code</span>
                      <span className="font-mono text-[11px] text-foreground/80">{user.school_code}</span>
                    </div>
                  </div>

                  {/* Access level + institute type */}
                  <div className="mt-2 w-full border-t pt-1.5 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground">Access: </span>
                      <span className="text-[10px] font-medium text-foreground/70">{ACCESS_LABELS[user.role_code] ?? '—'}</span>
                    </div>
                    {typeDef && (
                      <span className="text-[10px] text-muted-foreground">
                        {typeDef.icon} {typeDef.label}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Works even when backend is offline (demo mode)
          </p>
        </div>
      </div>

    </div>
  );
}
