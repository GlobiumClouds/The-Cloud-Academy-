'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';

import { authService } from '@/services';

const schema = z.object({
  email:       z.string().email(),
  school_code: z.string().min(2, 'Enter your school code'),
});

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await authService.forgotPassword(data.email, data.school_code);
      setSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-xl border bg-card p-8 shadow-sm text-center space-y-3">
        <div className="text-4xl">📧</div>
        <h2 className="text-lg font-semibold">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          A reset link has been sent. It expires in 1 hour.
        </p>
        <Link href="/login" className="text-sm text-primary hover:underline">Back to login</Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm">
      <h2 className="mb-1 text-xl font-semibold">Reset your password</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Enter your school code and email and we&apos;ll send a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">School Code</label>
          <input {...register('school_code')} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none" />
          {errors.school_code && <p className="mt-1 text-xs text-destructive">{errors.school_code.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input {...register('email')} type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none" />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
        <p className="text-center text-xs">
          <Link href="/login" className="text-muted-foreground hover:text-foreground">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
