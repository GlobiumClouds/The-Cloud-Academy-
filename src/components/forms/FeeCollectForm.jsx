/**
 * FeeCollectForm — Collect payment against a fee voucher
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   defaultValues  object
 *   onSubmit       (data) => void
 *   onCancel       () => void
 *   loading        boolean
 *   maxAmount      number  (outstanding amount for display)
 */
'use client';

import { useForm } from 'react-hook-form';
import {
  InputField,
  SelectField,
  TextareaField,
  FormSubmitButton,
} from '@/components/common';
import { Button } from '@/components/ui/button';

const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash',         label: 'Cash'          },
  { value: 'bank_transfer',label: 'Bank Transfer'  },
  { value: 'online',       label: 'Online Payment' },
  { value: 'cheque',       label: 'Cheque'        },
];

export default function FeeCollectForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  loading    = false,
  maxAmount  = null,
}) {
  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount_paid: '',
      payment_method: 'cash',
      transaction_id: '',
      notes: '',
      ...defaultValues,
    },
  });

  const selectedPaymentMethod = watch('payment_method');
  const watchedAmountPaid = watch('amount_paid');
  const hasOutstanding = maxAmount != null && Number.isFinite(Number(maxAmount));
  const maxAmountNumber = hasOutstanding ? Number(maxAmount) : null;
  const amountPaidNumber = Number(watchedAmountPaid || 0);
  const showRemainingPreview = hasOutstanding && Number.isFinite(amountPaidNumber) && amountPaidNumber > 0;
  const remainingAmount = showRemainingPreview
    ? Math.max(maxAmountNumber - amountPaidNumber, 0)
    : maxAmountNumber;

  const submitForm = (values) => {
    const amount = Number(values.amount_paid);

    const payload = {
      ...values,
      amount_paid: Number.isFinite(amount) ? amount : 0,
      payment_method: values.payment_method || 'cash',
      transaction_id: String(values.transaction_id || '').trim(),
      notes: String(values.notes || '').trim(),
    };

    onSubmit?.(payload);
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
      {hasOutstanding && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Outstanding Amount:{' '}
          <span className="font-semibold">PKR {maxAmountNumber.toLocaleString('en-PK')}</span>
        </div>
      )}

      {showRemainingPreview && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Remaining After Payment:{' '}
          <span className="font-semibold">PKR {remainingAmount.toLocaleString('en-PK')}</span>
        </div>
      )}

      <InputField
        label="Amount Paid (PKR)"
        name="amount_paid"
        {...register('amount_paid', {
          required: 'Amount is required',
          min: { value: 1, message: 'Amount must be greater than 0' },
          validate: (value) => {
            const parsed = Number(value);
            if (!Number.isFinite(parsed)) return 'Enter a valid amount';
            if (hasOutstanding && parsed > maxAmountNumber) {
              return `Amount cannot exceed outstanding PKR ${maxAmountNumber.toLocaleString('en-PK')}`;
            }
            return true;
          },
        })}
        error={errors.amount_paid}
        type="number"
        required
        disabled={loading}
        placeholder="e.g. 5000"
        min="1"
        step="0.01"
      />
      <SelectField
        label="Payment Method"
        name="payment_method"
        control={control}
        error={errors.payment_method}
        options={PAYMENT_METHOD_OPTIONS}
        placeholder="Select method"
        rules={{ required: 'Payment method is required' }}
        disabled={loading}
        required
      />
      <InputField
        label="Transaction / Reference ID"
        name="transaction_id"
        {...register('transaction_id', {
          validate: (value) => {
            const val = String(value || '').trim();
            if (selectedPaymentMethod !== 'cash' && !val) {
              return 'Transaction / Reference ID is required for non-cash payments';
            }
            return true;
          },
        })}
        error={errors.transaction_id}
        placeholder={selectedPaymentMethod === 'cash' ? 'Optional for cash payments' : 'Required for selected payment method'}
        disabled={loading}
      />
      <TextareaField
        label="Notes"
        name="notes"
        {...register('notes', {
          maxLength: {
            value: 500,
            message: 'Notes cannot exceed 500 characters',
          },
        })}
        error={errors.notes}
        placeholder="Optional remarks"
        rows={2}
        disabled={loading}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <FormSubmitButton
          loading={loading}
          label="Collect Payment"
          loadingLabel="Processing..."
        />
      </div>
    </form>
  );
}
