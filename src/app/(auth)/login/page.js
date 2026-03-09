'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { Eye, EyeOff, GraduationCap, Zap } from 'lucide-react';

import { authService } from '@/services';
import useAuthStore from '@/store/authStore';

// Single login schema — works for all roles
const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Minimum 6 characters'),
});

// Redirect map: institute_type → dashboard path
const DASHBOARD_PATHS = {
  school:     '/school/dashboard',
  coaching:   '/coaching/dashboard',
  academy:    '/academy/dashboard',
  college:    '/college/dashboard',
  university: '/university/dashboard',
};

// Quick-login credentials for demo / development
const QUICK_LOGINS = [
  {
    label:    'Master Admin',
    email:    'admin@thecloudsacademy.com',
    password: 'Admin@TCA2026!',
    badge:    'MASTER',
    color:    'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200',
  },
  {
    label:    'School Admin',
    email:    'hafizshoaibraza180@gmail.com',
    password: '123456',
    badge:    'ADMIN',
    color:    'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
  },
  {
    label:    'Academy Admin',
    email:    'hafizshoaibraza190@gmail.com',
    password: '123456',
    badge:    'ADMIN',
    color:    'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
  },
  {
    label:    'University Admin',
    email:    'shoaibrazamemon170@gmail.com',
    password: '123456',
    badge:    'ADMIN',
    color:    'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
  },
  {
    label:    'College Admin',
    email:    'hafizshoaibraza170@gmail.com',
    password: '123456',
    badge:    'ADMIN',
    color:    'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
  },
];

export default function LoginPage() {
  const router   = useRouter();
  const setUser  = useAuthStore((s) => s.setUser);
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const fillCredentials = (cred) => {
    setValue('email',    cred.email,    { shouldValidate: true });
    setValue('password', cred.password, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await authService.login(data);
      const user = res.user;

      // Clear any stale cookies from a previous session first
      Cookies.remove('access_token');
      Cookies.remove('role_code');
      Cookies.remove('institute_type');

      // Persist in store (also sets access_token cookie via setAccessToken)
      setUser(user, res.access_token);

      // Set cookies for Next.js middleware route-guards
      Cookies.set('access_token',  res.access_token,                        { expires: 7 });
      Cookies.set('role_code',     user.role_code ?? user.user_type ?? '',   { expires: 7 });

      const instType =
        user.institute_type ||
        user.institute?.institute_type ||
        user.school?.institute_type ||
        null;
      if (instType) Cookies.set('institute_type', instType, { expires: 7 });

      toast.success(`Welcome back, ${user.first_name}!`);

      // Redirect based on role
      if (user.role_code === 'MASTER_ADMIN' || user.user_type === 'MASTER_ADMIN') {
        router.replace('/master-admin');
      } else {
        router.replace(DASHBOARD_PATHS[instType] ?? '/dashboard');
      }
    } catch (err) {
      const status = err?.response?.status;
      const msg    = err?.response?.data?.message ?? err?.message ?? 'Login failed';
      if (!status) {
        toast.error('Cannot reach server. Make sure the backend is running on port 5000.');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="w-full max-w-sm">

        {/* Logo / Brand */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <GraduationCap size={26} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">The Clouds Academy</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@institute.com"
                autoComplete="email"
                autoFocus
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Password</label>
                <a
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          All users — Master Admin, Institute Admin, Teacher, Student, Parent — use this single login.
        </p>

        {/* ── Quick Login ── */}
        <div className="mt-5 rounded-xl border border-dashed bg-muted/40 p-4">
          <div className="mb-3 flex items-center gap-1.5">
            <Zap size={13} className="text-amber-500" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Quick Login
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {QUICK_LOGINS.map((cred) => (
              <button
                key={cred.email}
                type="button"
                onClick={() => fillCredentials(cred)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${cred.color}`}
              >
                <span>{cred.label}</span>
                <span className="ml-2 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider opacity-70">
                  {cred.badge}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground/70">
            Click a role to auto-fill credentials, then press Sign in.
          </p>
        </div>
      </div>
    </div>
  );
}

