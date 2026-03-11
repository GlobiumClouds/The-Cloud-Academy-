/**
 * TeacherForm — Create / Edit teacher
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   defaultValues  object
 *   onSubmit       (data) => void
 *   onCancel       () => void
 *   loading        boolean
 *   branchOptions  { value, label }[]
 *   isEdit         boolean
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
import { Button }    from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function TeacherForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  loading       = false,
  branchOptions = [],
  isEdit        = false,
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Personal */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Personal Information
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField label="First Name"    name="first_name"   register={register} error={errors.first_name}   required placeholder="e.g. Ali"            />
          <InputField label="Last Name"     name="last_name"    register={register} error={errors.last_name}    required placeholder="e.g. Hassan"         />
          <InputField label="Email"         name="email"        register={register} error={errors.email}        type="email" placeholder="teacher@school.com" />
          <InputField label="Phone"         name="phone"        register={register} error={errors.phone}        type="tel"   placeholder="e.g. 03001234567"  />
          <InputField label="Employee ID"   name="employee_id"  register={register} error={errors.employee_id}  placeholder="e.g. EMP-001"                  />
          <InputField label="Qualification" name="qualification" register={register} error={errors.qualification} placeholder="e.g. M.Ed, PhD"              />
        </div>
      </div>

      <Separator />

      {/* Employment */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Employment Details
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePickerField label="Joining Date" name="joining_date" control={control} error={errors.joining_date} />
          <InputField      label="Salary (PKR)" name="salary"       register={register} error={errors.salary}  type="number" placeholder="e.g. 35000" />
          {branchOptions.length > 0 && (
            <SelectField label="Branch" name="branch_id" control={control} error={errors.branch_id} options={branchOptions} placeholder="Select branch" />
          )}
        </div>
        <div className="mt-4">
          <TextareaField label="Address" name="address" register={register} error={errors.address} placeholder="Residential address" rows={2} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <FormSubmitButton
          loading={loading}
          label={isEdit ? 'Save Changes' : 'Add Teacher'}
          loadingLabel={isEdit ? 'Saving…' : 'Adding…'}
        />
      </div>
    </form>
  );
}
