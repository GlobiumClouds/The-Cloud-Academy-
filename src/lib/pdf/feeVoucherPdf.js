import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const CURRENCY = 'PKR';
const COPIES = ['BANK COPY', 'SCHOOL COPY', 'PARENT COPY'];
const PRIMARY_GREEN = [22, 101, 52];

const toNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = Number(value.replace(/,/g, ''));
    return Number.isFinite(normalized) ? normalized : 0;
  }
  return 0;
};

const hasNonZeroAmount = (value) => {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'string' && value.includes('%')) {
    const parsed = Number(value.replace('%', '').trim());
    return Number.isFinite(parsed) && parsed !== 0;
  }
  return toNumber(value) !== 0;
};

const formatAmount = (value) => `${CURRENCY} ${toNumber(value).toLocaleString('en-PK')}`;

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return format(date, 'dd/MM/yyyy');
};

const formatMonth = (voucher) => {
  if (voucher?.month_name) return voucher.month_name;
  if (voucher?.month && voucher?.year) {
    const date = new Date(voucher.year, Math.max(voucher.month - 1, 0), 1);
    if (!Number.isNaN(date.getTime())) {
      return format(date, 'MMMM');
    }
  }
  if (voucher?.due_date) {
    const date = new Date(voucher.due_date);
    if (!Number.isNaN(date.getTime())) {
      return format(date, 'MMMM');
    }
  }
  return '-';
};

const buildFeeRows = (voucher = {}) => {
  const objectBreakdown = voucher?.fee_breakdown && !Array.isArray(voucher.fee_breakdown)
    ? Object.entries(voucher.fee_breakdown).map(([label, amount]) => ({
      label: String(label)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      amount
    }))
    : [];

  const arrayBreakdown = Array.isArray(voucher?.fee_breakdown)
    ? voucher.fee_breakdown.map((item) => ({
      label: item?.label || item?.title || 'Fee Item',
      amount: item?.amount || 0
    }))
    : [];

  const knownRows = [
    { label: 'Lab Charges', amount: voucher.lab_charges },
    { label: 'Monthly Fee', amount: voucher.monthly_fee ?? voucher.amount },
    { label: 'Annual Charges', amount: voucher.annual_charges },
    { label: 'Admission Charges', amount: voucher.admission_charges },
    { label: 'Concession Percentage', amount: voucher.concession_percentage ? `${voucher.concession_percentage}%` : null },
    { label: 'Discount', amount: voucher.discount },
    { label: 'Total Amount', amount: voucher.amount ?? voucher.total_amount },
    { label: 'Remaining Amount', amount: voucher.remaining_amount ?? voucher.balance_due ?? voucher.net_amount }
  ].filter((row) => hasNonZeroAmount(row.amount));

  const merged = [...arrayBreakdown, ...objectBreakdown, ...knownRows].filter((row) => hasNonZeroAmount(row.amount));

  if (!merged.length && hasNonZeroAmount(voucher.net_amount ?? voucher.amount)) {
    merged.push({ label: 'Monthly Fee', amount: voucher.net_amount ?? voucher.amount });
  }

  const rows = merged.map((row) => [
    row.label,
    typeof row.amount === 'string' && row.amount.includes('%') ? row.amount : formatAmount(row.amount)
  ]);

  return rows.length ? rows : [['No fee lines', '-']];
};

export const generateFeeVoucherPdfBlob = ({ voucher = {}, student = {}, instituteName = 'ABC School' }) => {
  const doc = new jsPDF('p', 'pt', 'a4');

  const sectionX = 28;
  const sectionWidth = 540;
  const sectionHeight = 247;
  const sectionGap = 16;
  const tableStartX = sectionX + 8;

  const generatedOn = formatDate(new Date());
  const studentName = student?.name || voucher?.student?.name || voucher?.student_name || '-';
  const registrationNo = student?.registration_no || voucher?.student?.registration_no || voucher?.registration_no || '-';
  const gender = student?.gender || voucher?.student?.gender || '-';
  const dueDate = formatDate(voucher?.due_date);
  const monthName = formatMonth(voucher);
  const yearValue = voucher?.year || (voucher?.due_date ? new Date(voucher.due_date).getFullYear() : '-');

  COPIES.forEach((copyName, index) => {
    const sectionY = 24 + index * (sectionHeight + sectionGap);

    if (index > 0) {
      doc.setDrawColor(90, 90, 90);
      doc.setLineDashPattern([4, 3], 0);
      doc.line(sectionX, sectionY - 8, sectionX + sectionWidth, sectionY - 8);
      doc.setLineDashPattern([], 0);
    }

    doc.setDrawColor(160, 160, 160);
    doc.rect(sectionX, sectionY, sectionWidth, sectionHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(copyName, sectionX + 10, sectionY + 14);

    doc.setFontSize(11);
    doc.text(instituteName, sectionX + sectionWidth / 2, sectionY + 14, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Generate Date: ${generatedOn}`, sectionX + sectionWidth - 10, sectionY + 14, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Fee Voucher', sectionX + sectionWidth / 2, sectionY + 28, { align: 'center' });

    autoTable(doc, {
      startY: sectionY + 34,
      margin: { left: tableStartX, right: 28 },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [20, 20, 20],
        lineColor: [190, 190, 190],
        lineWidth: 0.5
      },
      columnStyles: {
        0: { cellWidth: 68, fontStyle: 'bold' },
        1: { cellWidth: 192 },
        2: { cellWidth: 60, fontStyle: 'bold' },
        3: { cellWidth: 180 }
      },
      body: [
        ['Voucher #', voucher?.voucher_number || voucher?.voucherNumber || '-', 'Reg #', registrationNo],
        ['Student', studentName, 'Due Date', dueDate],
        ['Gender', gender, 'Status', (voucher?.status || '-').toString().toUpperCase()],
        ['Month', monthName, 'Year', String(yearValue)]
      ]
    });

    const feeRows = buildFeeRows(voucher);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 4,
      margin: { left: tableStartX, right: 28 },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [20, 20, 20],
        lineColor: [190, 190, 190],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: PRIMARY_GREEN,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 340 },
        1: { cellWidth: 160, halign: 'right' }
      },
      head: [['Fee Type', 'Amount']],
      body: feeRows
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('Late fee policy applies after due date.', tableStartX, sectionY + sectionHeight - 8);

    doc.text(
      'Authorized Signature: ____________________',
      sectionX + sectionWidth - 10,
      sectionY + sectionHeight - 8,
      { align: 'right' }
    );
  });

  return doc.output('blob');
};
