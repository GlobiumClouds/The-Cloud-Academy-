/**
 * StudentForm — Create / Edit student
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   defaultValues      object          Pre-filled values for edit mode
 *   onSubmit           (data) => void  Called with form data
 *   onCancel           () => void
 *   loading            boolean
 *   classOptions       { value, label }[]
 *   sectionOptions     { value, label }[]
 *   academicYearOptions{ value, label }[]
 *   isEdit             boolean
 */
'use client';

import { useForm } from 'react-hook-form';
import {
  InputField,
  SelectField,
  TextareaField,
  DatePickerField,
  FormSubmitButton,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const GENDER_OPTIONS = [
  { value: 'male',   label: 'Male'   },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other'  },
];

export default function StudentForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  loading = false,
  classOptions       = [],
  sectionOptions     = [],
  academicYearOptions = [],
  isEdit = false,
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Personal Info */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Personal Information
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField label="First Name" name="first_name" register={register} error={errors.first_name} required placeholder="e.g. Ahmed" />
          <InputField label="Last Name"  name="last_name"  register={register} error={errors.last_name}  required placeholder="e.g. Ali" />
          <InputField label="GR Number"  name="gr_number"  register={register} error={errors.gr_number}  placeholder="e.g. 2024-001" />
          <SelectField label="Gender"    name="gender"     control={control}   error={errors.gender}     options={GENDER_OPTIONS} placeholder="Select gender" />
          <DatePickerField label="Date of Birth" name="dob" control={control} error={errors.dob} />
        </div>
      </div>

      <Separator />

      {/* Academic */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Academic Details
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField label="Academic Year" name="academic_year_id" control={control} error={errors.academic_year_id} options={academicYearOptions} placeholder="Select year"    />
          <SelectField label="Class"         name="class_id"         control={control} error={errors.class_id}         options={classOptions}        placeholder="Select class"   />
          <SelectField label="Section"       name="section_id"       control={control} error={errors.section_id}       options={sectionOptions}      placeholder="Select section" />
        </div>
      </div>

      <Separator />

      {/* Guardian */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Guardian Details
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField label="Guardian Name"  name="guardian_name"  register={register} error={errors.guardian_name}  placeholder="e.g. Muhammad Ali" />
          <InputField label="Guardian Phone" name="guardian_phone" register={register} error={errors.guardian_phone} placeholder="e.g. 03001234567"   type="tel" />
        </div>
        <div className="mt-4">
          <TextareaField label="Address" name="address" register={register} error={errors.address} placeholder="Full residential address" rows={2} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <FormSubmitButton
          loading={loading}
          label={isEdit ? 'Save Changes' : 'Add Student'}
          loadingLabel={isEdit ? 'Saving…' : 'Adding…'}
        />
      </div>
    </form>
  );
}
