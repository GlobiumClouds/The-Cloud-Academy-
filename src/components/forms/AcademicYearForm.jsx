/**
 * AcademicYearForm — Create / Edit academic year
 * ─────────────────────────────────────────────────────────────────
 * Props:
<<<<<<< HEAD
 *   defaultValues  object
 *   onSubmit       (data) => void
 *   onCancel       () => void
 *   loading        boolean
=======
 *   defaultValues  object          Pre-filled values for edit mode
 *   onSubmit       (data) => void  Called with form data
 *   onCancel       () => void
 *   loading        boolean
 *   instituteId    string          Current institute ID
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
 *   isEdit         boolean
 */
'use client';

import { useForm } from 'react-hook-form';
<<<<<<< HEAD
=======
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
import {
  InputField,
  TextareaField,
  DatePickerField,
<<<<<<< HEAD
  SwitchField,
  FormSubmitButton,
} from '@/components/common';
import { Button } from '@/components/ui/button';
=======
  FormSubmitButton,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarDays, AlertCircle } from 'lucide-react';
import { academicYearService } from '@/services/academicYearService';

// Validation schema
const academicYearSchema = z.object({
  name: z.string()
    .min(4, 'Year name must be at least 4 characters')
    .max(20, 'Year name must not exceed 20 characters')
    .regex(/^\d{4}-\d{4}$/, 'Format should be YYYY-YYYY (e.g., 2024-2025)'),
  
  start_date: z.string()
    .min(1, 'Start date is required')
    .refine(date => !isNaN(Date.parse(date)), 'Invalid date format'),
  
  end_date: z.string()
    .min(1, 'End date is required')
    .refine(date => !isNaN(Date.parse(date)), 'Invalid date format'),
  
  is_current: z.boolean().optional().default(false),
  
  description: z.string()
    .max(200, 'Description must not exceed 200 characters')
    .optional(),
  
  institute_id: z.string().optional(),
});
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c

export default function AcademicYearForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  loading = false,
<<<<<<< HEAD
  isEdit  = false,
}) {
=======
  instituteId,
  isEdit = false,
}) {
  const [dateError, setDateError] = useState('');
  const [currentYearExists, setCurrentYearExists] = useState(false);

>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
  const {
    register,
    control,
    handleSubmit,
<<<<<<< HEAD
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputField
        label="Year Name"
=======
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      is_current: false,
      description: '',
      ...defaultValues,
      institute_id: instituteId,
    },
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const isCurrent = watch('is_current');

  // Check if current year already exists
  useEffect(() => {
    const checkCurrentYear = async () => {
      if (instituteId && isCurrent) {
        try {
          const current = await academicYearService.getCurrent(instituteId);
          if (current?.data && (!isEdit || current.data.id !== defaultValues.id)) {
            setCurrentYearExists(true);
          } else {
            setCurrentYearExists(false);
          }
        } catch (error) {
          console.error('Error checking current year:', error);
        }
      }
    };
    checkCurrentYear();
  }, [isCurrent, instituteId, isEdit, defaultValues.id]);

  // Validate date range on change
  useEffect(() => {
    if (startDate && endDate) {
      try {
        academicYearService.validateDateRange(startDate, endDate);
        setDateError('');
      } catch (error) {
        setDateError(error.message);
      }
    }
  }, [startDate, endDate]);

  // Auto-generate name from dates
  useEffect(() => {
    if (startDate && !isEdit) {
      const year = new Date(startDate).getFullYear();
      const nextYear = year + 1;
      setValue('name', `${year}-${nextYear}`, { shouldValidate: true });
    }
  }, [startDate, setValue, isEdit]);

  const onSubmitForm = (data) => {
    if (dateError) {
      return;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
      {/* Year Name */}
      <InputField
        label="Academic Year"
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
        name="name"
        register={register}
        error={errors.name}
        required
<<<<<<< HEAD
        placeholder="e.g. 2024-25"
      />
=======
        placeholder="e.g., 2024-2025"
        disabled={!isEdit && !!startDate} // Auto-generated if start date is set
      />

      {/* Date Range */}
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DatePickerField
          label="Start Date"
          name="start_date"
          control={control}
          error={errors.start_date}
          required
<<<<<<< HEAD
=======
          maxDate={endDate ? new Date(endDate) : undefined}
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
        />
        <DatePickerField
          label="End Date"
          name="end_date"
          control={control}
          error={errors.end_date}
          required
<<<<<<< HEAD
        />
      </div>
=======
          minDate={startDate ? new Date(startDate) : undefined}
        />
      </div>

      {/* Date Validation Error */}
      {dateError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{dateError}</AlertDescription>
        </Alert>
      )}

      {/* Description */}
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
      <TextareaField
        label="Description"
        name="description"
        register={register}
        error={errors.description}
        placeholder="Optional notes about this academic year"
<<<<<<< HEAD
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
=======
        rows={3}
      />

      {/* Current Year Switch */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="is_current" className="text-base font-medium">
            Set as Current Year
          </Label>
          <p className="text-sm text-muted-foreground">
            Only one academic year can be current at a time
          </p>
        </div>
        <Switch
          id="is_current"
          checked={isCurrent}
          onCheckedChange={(checked) => setValue('is_current', checked)}
        />
      </div>

      {/* Warning if current year already exists */}
      {currentYearExists && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">
            There is already a current academic year. Setting this as current will automatically 
            demote the existing current year.
          </AlertDescription>
        </Alert>
      )}

      {/* Duration Info */}
      {startDate && endDate && !dateError && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>
              Duration: {Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} days
            </span>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <FormSubmitButton
          loading={loading}
          label={isEdit ? 'Save Changes' : 'Create Academic Year'}
          loadingLabel={isEdit ? 'Saving…' : 'Creating…'}
          disabled={!!dateError}
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
        />
      </div>
    </form>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
