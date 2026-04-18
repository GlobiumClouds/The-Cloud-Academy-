'use client';

import { fmtAmount } from '@/lib/formatters';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeLabel = (label = '') => label.toLowerCase().trim();

const isDiscount = (label) => normalizeLabel(label).includes('discount');
const isPaid = (label) => normalizeLabel(label).includes('paid amount');
const isRemaining = (label) => normalizeLabel(label).includes('remaining amount');
const isTotal = (label) => normalizeLabel(label).includes('total amount');

export default function FeeTable({ feeStructure = [], theme }) {
  const normalizedRows = (feeStructure || []).map((row) => ({
    feeType: row.feeType || row.label || 'Unknown Fee',
    amount: toNumber(row.amount),
  }));

  const chargeTotal = normalizedRows
    .filter((row) => !isPaid(row.feeType) && !isRemaining(row.feeType) && !isTotal(row.feeType) && !isDiscount(row.feeType))
    .reduce((sum, row) => sum + row.amount, 0);

  const discount = normalizedRows
    .filter((row) => isDiscount(row.feeType))
    .reduce((sum, row) => sum + row.amount, 0);

  const paidAmount = normalizedRows
    .filter((row) => isPaid(row.feeType))
    .reduce((sum, row) => sum + row.amount, 0);

  const totalAmount = chargeTotal - discount;
  const remainingAmount = Math.max(totalAmount - paidAmount, 0);

  const displayRows = [
    ...normalizedRows.filter((row) => !isTotal(row.feeType) && !isRemaining(row.feeType)),
    { feeType: 'Total Amount', amount: totalAmount },
    { feeType: 'Paid Amount', amount: paidAmount },
    { feeType: 'Remaining Amount', amount: remainingAmount },
  ];

  return (
    <section className="border" style={{ borderColor: theme.colors.border }}>
      <div className="border-b px-2 py-1 text-center font-bold uppercase" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.tableHeader, fontSize: theme.fontSize.body }}>
        Fee Structure
      </div>

      <table className="w-full border-collapse" style={{ fontSize: theme.fontSize.body }}>
        <thead>
          <tr>
            <th className="border px-2 py-1 text-left font-semibold" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.tableHeader }}>
              Fee Type
            </th>
            <th className="border px-2 py-1 text-right font-semibold" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.tableHeader }}>
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          {displayRows.map((row, index) => {
            const lower = normalizeLabel(row.feeType);
            const isSummary = lower.includes('total amount') || lower.includes('remaining amount') || lower.includes('paid amount');

            return (
              <tr key={`${row.feeType}-${index}`}>
                <td className="border px-2 py-1" style={{ borderColor: theme.colors.border, fontWeight: isSummary ? 700 : 500 }}>
                  {row.feeType}
                </td>
                <td className="border px-2 py-1 text-right" style={{ borderColor: theme.colors.border, fontWeight: isSummary ? 700 : 500 }}>
                  {fmtAmount(row.amount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
