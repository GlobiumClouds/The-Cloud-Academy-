'use client';

import { useMemo, useRef, useState } from 'react';
import { AlertCircle, Clock, DollarSign, Download, Eye, Printer, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useStudentFees, useStudentProfile } from '@/hooks/useStudentPortal';
import useInstituteStore from '@/store/instituteStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import FeeVoucher from '@/fees-template/FeeVoucher';
import { getFeeTheme } from '@/fees-template/styles/feeTheme';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB');
};

const getMonthLabel = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'string' && Number.isNaN(Number(value))) return value;
  const monthIndex = Number(value);
  return MONTHS[monthIndex - 1] || String(value);
};

const normalizeInstitute = (storeInstitute = {}, profile = {}) => {
  const institute = storeInstitute || {};
  const studentProfile = profile || {};

  return {
    name: institute.name || institute.title || studentProfile.institute_name || studentProfile.school_name || 'ABC School',
    logo: institute.logo_url || institute.logo || studentProfile.logo_url || studentProfile.logo || null,
    address: institute.campus_address || institute.address || studentProfile.address || studentProfile.campus_address || 'Campus address not available',
    phone: institute.phone || institute.phone_number || institute.contact_number || studentProfile.phone || studentProfile.phone_number || 'N/A',
    email: institute.email || institute.contact_email || studentProfile.email || 'N/A',
  };
};

const buildVoucherView = (voucher = {}, profile = {}, institute = {}) => {
  const amount = toNumber(voucher.amount ?? voucher.total_amount ?? voucher.net_amount);
  const discount = toNumber(voucher.discount ?? 0);
  const fine = toNumber(voucher.fine ?? voucher.late_fee ?? 0);
  const paidAmount = toNumber(voucher.paid_amount ?? voucher.paidAmount ?? 0);
  const netAmount = toNumber(voucher.net_amount ?? amount - discount + fine);
  const remainingAmount = Math.max(toNumber(voucher.remaining_amount ?? netAmount - paidAmount), 0);
  const feeBreakdown = voucher.fee_breakdown || voucher.feeBreakdown || {};
  const monthLabel = getMonthLabel(voucher.month ?? profile.month);

  const feeStructure = [];
  const addRow = (label, value) => {
    if (value !== undefined && value !== null && value !== '') {
      feeStructure.push({ feeType: label, amount: value });
    }
  };

  addRow('Lab Charges', feeBreakdown.labCharges ?? feeBreakdown.lab_charges ?? voucher.lab_charges);
  addRow('Monthly Fee', feeBreakdown.monthlyFee ?? feeBreakdown.monthly_fee ?? voucher.monthly_fee ?? amount);
  addRow('Annual Charges', feeBreakdown.annualCharges ?? feeBreakdown.annual_charges ?? voucher.annual_charges);
  addRow('Admission Charges', feeBreakdown.admissionCharges ?? feeBreakdown.admission_charges ?? voucher.admission_charges);
  addRow('Concession Percentage', voucher.concession_percentage ?? voucher.concessionPercent);
  addRow('Discount', discount);
  addRow('Total Amount', netAmount);
  addRow('Remaining Amount', remainingAmount);

  return {
    voucherNumber: voucher.voucher_number || voucher.voucherNumber || voucher.id || '-',
    generatedDate: voucher.issued_date || voucher.generated_date || voucher.created_at || new Date().toISOString(),
    dueDate: voucher.due_date || voucher.dueDate || '-',
    month: monthLabel,
    year: voucher.year ?? profile.year ?? new Date().getFullYear(),
    studentData: {
      studentName: voucher.student_name || voucher.Student?.first_name || profile.name || 'Student Name',
      fatherName: voucher.father_name || voucher.Student?.father_name || profile.father_name || 'N/A',
      className: voucher.class_name || voucher.Student?.class_name || profile.class_name || profile.class || 'N/A',
      section: voucher.section_name || voucher.Student?.section_name || profile.section_name || profile.section || 'N/A',
      rollNumber: voucher.roll_no || voucher.Student?.roll_no || profile.roll_no || profile.roll_number || 'N/A',
      studentId: voucher.registration_no || voucher.Student?.registration_no || profile.registration_no || profile.reg_no || 'N/A',
    },
    voucherMeta: {
      title: 'Fee Voucher',
      voucherNumber: voucher.voucher_number || voucher.voucherNumber || voucher.id || 'N/A',
      issueDate: voucher.issued_date || voucher.generated_date || voucher.created_at || new Date().toISOString(),
      dueDate: voucher.due_date || voucher.dueDate,
      month: monthLabel,
      year: voucher.year ?? profile.year ?? new Date().getFullYear(),
      feeStatus: voucher.status || 'pending',
      copyLabel: 'Student Copy',
    },
    instituteData: institute,
    feeStructure,
  };
};

const captureVoucherCanvas = async (sourceNode) => {
  const exportHost = document.createElement('div');
  exportHost.style.position = 'fixed';
  exportHost.style.left = '-100000px';
  exportHost.style.top = '0';
  exportHost.style.background = '#ffffff';
  exportHost.style.padding = '0';
  exportHost.style.zIndex = '-1';

  const exportNode = sourceNode.cloneNode(true);
  exportNode.style.transform = 'none';
  exportNode.style.width = '210mm';
  exportNode.style.minHeight = '297mm';
  exportNode.style.margin = '0';

  exportHost.appendChild(exportNode);
  document.body.appendChild(exportHost);

  try {
    return await html2canvas(exportNode, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: exportNode.scrollWidth,
      windowHeight: exportNode.scrollHeight,
    });
  } finally {
    document.body.removeChild(exportHost);
  }
};

const saveCanvasAsA4Pdf = (canvas, fileName) => {
  const imageData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageWidth = pageWidth;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;

  let heightLeft = imageHeight;
  let position = 0;

  pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight, undefined, 'FAST');
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imageHeight;
    pdf.addPage();
    pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight, undefined, 'FAST');
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
};

export default function StudentFeesPage() {
  const { data: feesRes, isLoading } = useStudentFees();
  const { data: profileRes } = useStudentProfile();
  const { resolvedTheme } = useTheme();
  const currentInstitute = useInstituteStore((state) => state.currentInstitute);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const voucherRef = useRef(null);

  const fees = feesRes?.data || feesRes || {};
  const summary = fees.summary || {};
  const vouchers = fees.vouchers || [];
  const profile = profileRes?.data || profileRes || {};
  const institute = useMemo(() => normalizeInstitute(currentInstitute, profile), [currentInstitute, profile]);
  const theme = useMemo(() => getFeeTheme(resolvedTheme), [resolvedTheme]);

  const activeVoucher = useMemo(() => {
    if (!vouchers.length) return null;
    return vouchers.find((voucher) => voucher.status !== 'paid') || vouchers[0];
  }, [vouchers]);

  const voucherView = useMemo(
    () => buildVoucherView(selectedVoucher || {}, profile, institute),
    [selectedVoucher, profile, institute]
  );

  const handleViewVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    setIsVoucherOpen(true);
  };

  const handleDownloadPdf = async () => {
    if (!voucherRef.current) return;

    try {
      setIsDownloading(true);
      const canvas = await captureVoucherCanvas(voucherRef.current);
      saveCanvasAsA4Pdf(canvas, `fee-voucher-${selectedVoucher?.voucher_number || selectedVoucher?.id || 'download'}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-4xl mx-auto text-sm text-slate-500">Loading fee record...</div>;
  }

  if (!activeVoucher) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <DollarSign className="mx-auto h-10 w-10 text-slate-400" />
        <h1 className="mt-4 text-xl font-semibold text-slate-900">No fee voucher found</h1>
        <p className="mt-2 text-sm text-slate-500">Once a voucher is generated, it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-emerald-600" /> Fee Record
        </h1>
        <p className="text-sm text-slate-500 mt-1">{profile.name || 'Student'} | {profile.class_name || '-'}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Metric label="Total Due" value={summary.total_due || 0} />
        <Metric label="Total Paid" value={summary.total_paid || 0} color="text-emerald-600" />
        <Metric label="Pending Vouchers" value={summary.pending_vouchers || 0} color="text-amber-600" />
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b bg-slate-50">
          <h2 className="font-semibold text-slate-800">Vouchers</h2>
        </div>

        {vouchers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No fee vouchers found.</div>
        ) : (
          <div className="divide-y">
            {vouchers.map((voucher) => (
              <div key={voucher.id || voucher.voucher_number} className="px-5 py-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{voucher.title || 'Voucher'}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Due: {voucher.due_date ? formatDate(voucher.due_date) : '-'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">PKR {toNumber(voucher.net_amount || voucher.amount || 0).toLocaleString()}</p>
                  <Status status={voucher.status} />
                </div>
                <button
                  type="button"
                  onClick={() => handleViewVoucher(voucher)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Eye className="h-4 w-4" /> View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <VoucherModal
        open={isVoucherOpen}
        onOpenChange={(next) => {
          setIsVoucherOpen(next);
          if (!next) setSelectedVoucher(null);
        }}
        voucherView={voucherView}
        voucherRef={voucherRef}
        theme={theme}
        institute={institute}
        isDownloading={isDownloading}
        onDownload={handleDownloadPdf}
      />
    </div>
  );
}

function Metric({ label, value, color = 'text-slate-800' }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className={`text-2xl font-bold ${color}`}>PKR {Number(value || 0).toLocaleString()}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function Status({ status }) {
  if (status === 'paid') return <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Paid</span>;
  if (status === 'overdue') return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">Overdue</span>;
  if (status === 'partial') return <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">Partial</span>;
  return <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">Pending</span>;
}

function VoucherModal({ open, onOpenChange, voucherView, voucherRef, theme, institute, isDownloading, onDownload }) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] p-0 sm:max-w-[96vw]">
        <DialogHeader className="border-b px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DialogTitle className="text-base font-semibold">Fee Voucher Details</DialogTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" variant="outline" onClick={onDownload} disabled={isDownloading}>
                <Download className="h-4 w-4" />
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" /> Close
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[80vh] overflow-auto bg-slate-100 p-4">
          <div className="mx-auto w-fit origin-top scale-[0.62] sm:scale-75 md:scale-90 lg:scale-100">
            <div ref={voucherRef} className="fee-voucher-print-target">
              <FeeVoucher
                studentData={voucherView.studentData}
                feeStructure={voucherView.feeStructure}
                instituteData={voucherView.instituteData || institute}
                voucherMeta={voucherView.voucherMeta}
                theme={theme}
                copyMode="triple"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
