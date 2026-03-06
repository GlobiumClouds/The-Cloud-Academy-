/**
 * AcademicYearForm — Create / Edit academic year
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   defaultValues  object
 *   onSubmit       (data) => void
 *   onCancel       () => void
 *   loading        boolean
 *   isEdit         boolean
 */
'use client';

import { useForm } from 'react-hook-form';
import {
  InputField,
  TextareaField,
  DatePickerField,
  SwitchField,
  FormSubmitButton,
} from '@/components/common';
import { Button } from '@/components/ui/button';

export default function AcademicYearForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  loading = false,
  isEdit  = false,
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputField
        label="Year Name"
        name="name"
        register={register}
        error={errors.name}
        required
        placeholder="e.g. 2024-25"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DatePickerField
          label="Start Date"
          name="start_date"
          control={control}
          error={errors.start_date}
          required
        />
        <DatePickerField
          label="End Date"
          name="end_date"
          control={control}
          error={errors.end_date}
          required
        />
      </div>
      <TextareaField
        label="Description"
        name="description"
        register={register}
        error={errors.description}
        placeholder="Optional notes about this academic year"
        rows={2}
      />
      <SwitchField
        label="Set as Current Year"
        name="is_current"
        control={control}
        hint="Only one academic year can be current at a time"
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <FormSubmitButton
          loading={loading}
          label={isEdit ? 'Save Changes' : 'Create Year'}
          loadingLabel={isEdit ? 'Saving…' : 'Creating…'}
        />
      </div>
    </form>
  );
}
