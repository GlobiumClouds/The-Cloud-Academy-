'use client';

import VoucherHeader from './VoucherHeader';
import StudentInfoSection from './StudentInfoSection';
import FeeTable from '../../FeeTable';
import VoucherFooter from './VoucherFooter';

const A4_WIDTH_MM = '210mm';
const A4_HEIGHT_MM = '297mm';

export default function FeeVoucher({
  studentData = {},
  feeStructure = [],
  instituteData = {},
  voucherMeta = {},
  theme,
  copyMode = 'single',
  className = '',
}) {
  const copyLabels = copyMode === 'double' ? ['Student Copy', 'Office Copy'] : [voucherMeta.copyLabel || 'Student Copy'];

  return (
    <div
      className={`fee-voucher-print-target fee-voucher-sheet mx-auto bg-white shadow-sm ${className}`.trim()}
      style={{
        width: A4_WIDTH_MM,
        minHeight: A4_HEIGHT_MM,
        color: theme.colors.text,
        backgroundColor: '#ffffff',
        padding: theme.spacing.pagePadding,
      }}
    >
      <div className="flex h-full flex-col gap-3">
        {copyLabels.map((label, index) => (
          <section
            key={label}
            className="flex flex-1 flex-col gap-2"
            style={{
              borderBottom: index === copyLabels.length - 1 ? 'none' : `1px dashed ${theme.colors.border}`,
              paddingBottom: index === copyLabels.length - 1 ? 0 : '8px',
            }}
          >
            <VoucherHeader instituteData={instituteData} voucherMeta={voucherMeta} theme={theme} />
            <StudentInfoSection studentData={studentData} voucherMeta={voucherMeta} theme={theme} />
            <FeeTable feeStructure={feeStructure} theme={theme} />
            <VoucherFooter voucherMeta={voucherMeta} theme={theme} copyLabel={label} />
          </section>
        ))}
      </div>
    </div>
  );
}
