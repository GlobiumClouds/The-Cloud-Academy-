'use client';

import { fmtDate } from '@/lib/formatters';

export default function VoucherHeader({ instituteData = {}, voucherMeta = {}, theme }) {
  const title = voucherMeta.title || 'FEE VOUCHER';

  return (
    <header
      className="grid grid-cols-[110px_1fr_180px] items-start gap-3 border px-3 py-2"
      style={{
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.headerBackground,
      }}
    >
      <div className="flex h-[72px] items-center justify-center border bg-white p-1" style={{ borderColor: theme.colors.border }}>
        {instituteData.logo ? (
          <img
            src={instituteData.logo}
            alt="Institute Logo"
            className="h-full w-full object-contain"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Institute Logo</div>
        )}
      </div>

      <div className="text-center leading-tight">
        <h1 className="font-bold uppercase tracking-wide" style={{ color: theme.colors.primary, fontSize: theme.fontSize.title }}>
          {instituteData.name || 'Institute Name'}
        </h1>
        <p className="mt-1" style={{ color: theme.colors.mutedText, fontSize: theme.fontSize.small }}>
          {instituteData.address || 'Campus address not available'}
        </p>
        <p style={{ color: theme.colors.mutedText, fontSize: theme.fontSize.small }}>
          {instituteData.phone || 'N/A'} | {instituteData.email || 'N/A'}
        </p>
      </div>

      <div className="space-y-1 text-right" style={{ fontSize: theme.fontSize.small }}>
        <h2 className="text-sm font-bold tracking-wide" style={{ color: theme.colors.secondary }}>
          {title}
        </h2>
        <p>
          <span className="font-semibold">Voucher #:</span> {voucherMeta.voucherNumber || 'N/A'}
        </p>
        <p>
          <span className="font-semibold">Issue Date:</span> {fmtDate(voucherMeta.issueDate)}
        </p>
        <p>
          <span className="font-semibold">Due Date:</span> {fmtDate(voucherMeta.dueDate)}
        </p>
        <p>
          <span className="font-semibold">Status:</span> {(voucherMeta.feeStatus || 'pending').toUpperCase()}
        </p>
      </div>
    </header>
  );
}
