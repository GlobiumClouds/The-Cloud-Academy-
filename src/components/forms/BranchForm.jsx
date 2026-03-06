'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  InputField,
  CheckboxField,
} from '@/components/common';
import { Button } from '@/components/ui/button';

// ── validation schema ──────────────────────────────────────────────────────────
const schema = z.object({
  name:      z.string().min(2, 'Branch name must be at least 2 characters'),
  address:   z.string().optional().or(z.literal('')),
  phone:     z.string().optional().or(z.literal('')),
  email:     z.string().email('Invalid email').optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

export default function BranchForm({ defaultValues, onSubmit, isLoading }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name:      '',
      address:   '',
      phone:     '',
      email:     '',
      is_active: true,
      ...defaultValues,
    },
  });

  // Reset when editing a different record
  useEffect(() => {
    reset({
      name:      '',
      address:   '',
      phone:     '',
      email:     '',
      is_active: true,
      ...defaultValues,
    });
  }, [defaultValues?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputField
        label="Branch Name"
        name="name"
        register={register}
        error={errors.name}
        placeholder="e.g. Main Campus"
        required
      />

      <InputField
        label="Address"
        name="address"
        register={register}
        error={errors.address}
        placeholder="Full branch address"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Phone"
          name="phone"
          register={register}
          error={errors.phone}
          placeholder="+92-42-XXXXXXXX"
        />
        <InputField
          label="Email"
          name="email"
          register={register}
          error={errors.email}
          placeholder="branch@school.edu.pk"
        />
      </div>

      <CheckboxField
        control={control}
        name="is_active"
        label="Active Branch"
        error={errors.is_active}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving…' : defaultValues?.id ? 'Update Branch' : 'Create Branch'}
        </Button>
      </div>
    </form>
  );
}
