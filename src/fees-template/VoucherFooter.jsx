'use client';

import { fmtDate } from '@/lib/formatters';

export default function VoucherFooter({ voucherMeta = {}, theme, copyLabel = 'Student Copy' }) {
  return (
    <footer className="space-y-2 border px-3 py-2" style={{ borderColor: theme.colors.border }}>
      <div className="text-[10px]" style={{ color: theme.colors.mutedText }}>
        <p>
          <span className="font-semibold">Due Date Notice:</span> Please submit fee on or before {fmtDate(voucherMeta.dueDate)}.
        </p>
        <p>
          <span className="font-semibold">Late Fee Policy:</span> A late fine may be charged after the due date as per institute policy.
        </p>
      </div>

      <div className="grid grid-cols-2 items-end pt-3">
        <div>
          <div className="w-[160px] border-b" style={{ borderColor: theme.colors.border }} />
          <p style={{ fontSize: theme.fontSize.small }}>Authorized Signature</p>
        </div>
        <div className="text-right">
          <span className="inline-block border px-2 py-1 font-semibold uppercase tracking-wide" style={{ borderColor: theme.colors.border, fontSize: theme.fontSize.small }}>
            {copyLabel}
          </span>
        </div>
      </div>
    </footer>
  );
}
