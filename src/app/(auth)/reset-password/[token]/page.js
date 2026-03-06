'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { authService } from '@/services';

const schema = z
  .object({
    new_password:     z.string().min(8, 'Minimum 8 characters'),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

export default function ResetPasswordPage() {
  const router  = useRouter();
  const { token } = useParams();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await authService.resetPassword(token, data.new_password);
      toast.success('Password reset! Please sign in.');
      router.replace('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Link expired or invalid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">Set new password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">New Password</label>
          <input
            {...register('new_password')}
            type="password"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
          />
          {errors.new_password && <p className="mt-1 text-xs text-destructive">{errors.new_password.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Confirm Password</label>
          <input
            {...register('confirm_password')}
            type="password"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
          />
          {errors.confirm_password && <p className="mt-1 text-xs text-destructive">{errors.confirm_password.message}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Reset password'}
        </button>
      </form>
    </div>
  );
}
