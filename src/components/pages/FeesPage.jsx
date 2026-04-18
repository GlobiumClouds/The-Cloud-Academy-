/**
 * FeesPage — Student fee records with payment status + Bulk Voucher Generation
 */
'use client';
/**
 * FeesPage — Fee Vouchers (Single + Bulk Generation)
 * Data from feeVoucherService only.
 */
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, DollarSign, AlertCircle, FileText, Filter, Download, Trash2, Loader2, Eye } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SelectField from '@/components/common/SelectField';
import DatePickerField from '@/components/common/DatePickerField';
import StatsCard from '@/components/common/StatsCard';
import BulkVoucherGenerator from '@/components/forms/BulkVoucherGenerator';
import { feeVoucherService, academicYearService } from '@/services';

// const STATUS_OPTS = [
//   { value: 'paid', label: 'Paid' },
//   { value: 'overdue', label: 'Overdue' },
//   { value: 'partial', label: 'Partial' },
// ];

// const STATUS_COLORS = {
//   paid: 'bg-emerald-100 text-emerald-700',
//   pending: 'bg-amber-100 text-amber-700',
//   overdue: 'bg-red-100 text-red-700',
//   partial: 'bg-blue-100 text-blue-700',
// };

const MONTH_OPTS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2026, i).toLocaleString('default', { month: 'long' }),
}));

export default function FeesPage() {
  const qc = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const currentInstitute = useInstituteStore((s) => s.currentInstitute);
  const { terms } = useInstituteConfig();

  const [voucherGeneratorModal, setVoucherGeneratorModal] = useState(false);
  const [singleVoucherModal, setSingleVoucherModal] = useState(false);
  const [deletingVoucher, setDeletingVoucher] = useState(null);
  const [voucherPage, setVoucherPage] = useState(1);
  const [voucherPageSize, setVoucherPageSize] = useState(20);
  const [isGeneratingVouchers, setIsGeneratingVouchers] = useState(false);
  const [downloadingVoucherId, setDownloadingVoucherId] = useState(null);

  // Filters
  const currentMonth = String(new Date().getMonth() + 1);
  const [voucherMonth, setVoucherMonth] = useState(currentMonth);
  const [voucherAcademicYearId, setVoucherAcademicYearId] = useState('');
  const [viewingVoucher, setViewingVoucher] = useState(null);

  // Academic years
  const { data: academicYearsData = [] } = useQuery({
    queryKey: ['academic-years-fees', currentInstitute?.id],
    queryFn: async () => {
      try {
        const response = await academicYearService.getAll({
          institute_id: currentInstitute?.id,
          is_active: true,
        });
        return response?.data?.rows || response?.data || [];
      } catch {
        return [];
      }
    },
    enabled: !!currentInstitute?.id,
  });

  useEffect(() => {
    if (academicYearsData.length > 0 && !voucherAcademicYearId) {
      const current = academicYearsData.find((ay) => ay.is_current) || academicYearsData[0];
      if (current) setVoucherAcademicYearId(current.id);
    }
  }, [academicYearsData, voucherAcademicYearId]);

  // Fetch vouchers with pagination
  const {
    data: voucherData = { vouchers: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } },
    isLoading: vouchersLoading,
    refetch: refetchVouchers,
  } = useQuery({
    queryKey: ['fee-vouchers', currentInstitute?.id, voucherMonth, voucherAcademicYearId, voucherPage, voucherPageSize],
    queryFn: async () => {
      const filters = {
        month: voucherMonth ? parseInt(voucherMonth) : undefined,
        academic_year_id: voucherAcademicYearId || undefined,
      };
      const response = await feeVoucherService.getAll(filters, { page: voucherPage, limit: voucherPageSize });
      console.log('Fetched vouchers with pagination:', response);
      return response || { vouchers: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
    },
    enabled: !!currentInstitute?.id && !!voucherAcademicYearId,
  });

  const vouchers = voucherData?.vouchers || [];
  const voucherPagination = voucherData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };

  // Stats
  const voucherStats = useMemo(() => {
    const paid = vouchers.filter((v) => v.status === 'paid');
    const pending = vouchers.filter((v) => ['pending', 'overdue', 'partial'].includes(v.status));
    return {
      total: vouchers.length,
      pending: pending.length,
      paid: paid.length,
      totalAmount: vouchers.reduce((sum, v) => sum + (parseFloat(v.net_amount) || parseFloat(v.amount) || 0), 0),
      pendingAmount: pending.reduce((sum, v) => sum + (parseFloat(v.net_amount) || parseFloat(v.amount) || 0), 0),
    };
  }, [vouchers]);

  // Only paid vouchers amount
  const collectedAmount = useMemo(() => {
    return vouchers.filter((v) => v.status === 'paid')
      .reduce((sum, v) => sum + (parseFloat(v.netAmount) || parseFloat(v.amount) || 0), 0);
  }, [vouchers]);

  // Delete (archive) voucher
  const deleteVoucher = useMutation({
    mutationFn: (id) => feeVoucherService.delete(id),
    onSuccess: () => {
      toast.success('Voucher deleted');
      setDeletingVoucher(null);
      refetchVouchers();
    },
    onError: () => toast.error('Failed to delete voucher'),
  });

  // Download voucher PDF
  const handleDownloadVoucher = async (voucher) => {
    const currentVoucherId = voucher?.id || voucher?.voucherNumber || voucher?.voucher_number || 'unknown';
    setDownloadingVoucherId(currentVoucherId);
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 7;
      const marginTop = 6;
      const gap = 3;
      const sectionHeight = (pageHeight - marginTop * 2 - gap * 2) / 3;
      const instituteName = currentInstitute?.name || 'School Management System';
      const instituteLogoUrl = currentInstitute?.logo_url || currentInstitute?.logo || currentInstitute?.institute_logo || null;
      const voucherNumber = voucher?.voucherNumber || voucher?.voucher_number || 'N/A';
      const monthLabel = MONTH_OPTS.find((m) => m.value === String(voucher?.month))?.label || String(voucher?.month || 'N/A');
      const issueDate = voucher?.issuedDate ? new Date(voucher.issuedDate).toLocaleDateString('en-PK') : 'N/A';
      const dueDate = voucher?.dueDate ? new Date(voucher.dueDate).toLocaleDateString('en-PK') : 'N/A';

      const loadImageAsDataUrl = async (url) => {
        if (!url) return null;
        try {
          const response = await fetch(url, { mode: 'cors' });
          if (!response.ok) return null;
          const blob = await response.blob();
          return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch {
          return null;
        }
      };

      const logoDataUrl = await loadImageAsDataUrl(instituteLogoUrl);

      const toAmount = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const isPercentageField = (label = '') => {
        const normalized = String(label).toLowerCase();
        return normalized.includes('percentage') || normalized.includes('percent');
      };

      const formatRowValue = (label, numericValue) => {
        if (isPercentageField(label)) {
          return `${numericValue}%`;
        }
        return `PKR ${numericValue.toLocaleString('en-PK')}`;
      };

      const breakdown = voucher?.feeBreakdown;
      const feeRows = [];

      if (Array.isArray(breakdown)) {
        breakdown.forEach((item) => {
          const amount = toAmount(item?.amount || item?.value);
          const label = item?.feeType || item?.label || item?.type || 'Fee Item';
          const isPercent = isPercentageField(label) || item?.unit === 'percentage' || item?.value_type === 'percentage';
          if (amount > 0) {
            feeRows.push([
              label,
              isPercent ? `${amount}%` : formatRowValue(label, amount),
            ]);
          }
        });
      } else if (breakdown && typeof breakdown === 'object') {
        Object.entries(breakdown).forEach(([key, value]) => {
          const amount = toAmount(value);
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
          if (amount > 0) {
            feeRows.push([
              label,
              formatRowValue(label, amount),
            ]);
          }
        });
      }

      const amount = toAmount(voucher?.amount);
      const discount = toAmount(voucher?.discount);
      const netAmount = toAmount(voucher?.netAmount || voucher?.net_amount || voucher?.amount);
      const paidAmount = String(voucher?.status || '').toLowerCase() === 'paid' ? netAmount : toAmount(voucher?.paidAmount || voucher?.paid_amount);
      const remainingAmount = Math.max(netAmount - paidAmount, 0);

      if (!feeRows.length && amount > 0) feeRows.push(['Tuition Fee', `PKR ${amount.toLocaleString('en-PK')}`]);
      if (discount > 0) feeRows.push(['Discount', `PKR ${discount.toLocaleString('en-PK')}`]);
      if (netAmount > 0) feeRows.push(['Total Amount', `PKR ${netAmount.toLocaleString('en-PK')}`]);
      if (paidAmount > 0) feeRows.push(['Paid Amount', `PKR ${paidAmount.toLocaleString('en-PK')}`]);
      if (remainingAmount > 0) feeRows.push(['Remaining Amount', `PKR ${remainingAmount.toLocaleString('en-PK')}`]);

      const copyLabels = ['BANK COPY', 'SCHOOL COPY', 'PARENT COPY'];

      copyLabels.forEach((copyLabel, index) => {
        const y = marginTop + index * (sectionHeight + gap);

        doc.setDrawColor(130, 130, 130);
        doc.rect(marginX, y, pageWidth - marginX * 2, sectionHeight);

        if (logoDataUrl) {
          try {
            const imageFormat = String(logoDataUrl).includes('image/png') ? 'PNG' : 'JPEG';
            doc.addImage(logoDataUrl, imageFormat, marginX + 2, y + 1.5, 8, 8);
          } catch {
            // Keep voucher generation resilient if logo rendering fails
          }
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(copyLabel, marginX + 12, y + 5);
        doc.setFontSize(10);
        doc.text(instituteName, pageWidth / 2, y + 5, { align: 'center' });
        doc.setFontSize(8);
        doc.text('Fee Voucher', pageWidth / 2, y + 10, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`Voucher #: ${voucherNumber}`, marginX + 2, y + 15);
        doc.text(`Generate Date: ${issueDate}`, pageWidth - marginX - 2, y + 15, { align: 'right' });

        autoTable(doc, {
          startY: y + 17,
          margin: { left: marginX + 1, right: marginX + 1 },
          theme: 'grid',
          body: [
            ['Student', voucher?.studentName || 'N/A', 'Reg #', voucher?.registrationNo || 'N/A'],
            ['Generate Date', issueDate, 'Due Date', dueDate],
            ['Month', monthLabel, 'Year', String(voucher?.year || 'N/A')],
          ],
          styles: { fontSize: 7, cellPadding: 1.2 },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 18 },
            1: { cellWidth: 60 },
            2: { fontStyle: 'bold', cellWidth: 18 },
            3: { cellWidth: 60 },
          },
        });

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 1,
          margin: { left: marginX + 1, right: marginX + 1 },
          head: [['Fee Type', 'Amount']],
          body: feeRows.length ? feeRows : [['No fee lines', '—']],
          theme: 'grid',
          headStyles: { fillColor: [22, 101, 52], textColor: [255, 255, 255] },
          styles: { fontSize: 7, cellPadding: 1.2 },
          columnStyles: {
            0: { cellWidth: 120 },
            1: { halign: 'right' },
          },
        });

        const footerY = y + sectionHeight - 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.text('Late fee policy applies after due date.', marginX + 2, footerY);
        doc.text('Authorized Signature: ____________________', pageWidth - marginX - 2, footerY, { align: 'right' });

        if (index < copyLabels.length - 1) {
          doc.setLineDashPattern([1.2, 1.2], 0);
          doc.line(marginX, y + sectionHeight + gap / 2, pageWidth - marginX, y + sectionHeight + gap / 2);
          doc.setLineDashPattern([], 0);
        }
      });

      const safeVoucherNo = String(voucherNumber).replace(/[^a-zA-Z0-9_-]/g, '-');
      doc.save(`fee-voucher-${safeVoucherNo}.pdf`);
      toast.success(`Voucher ${voucherNumber} downloaded`);
    } catch (error) {
      console.error('Failed to download voucher PDF:', error);
      toast.error('Failed to download voucher PDF');
    } finally {
      setDownloadingVoucherId(null);
    }
  };

  const voucherColumns = useMemo(
    () => [
      {
        accessorKey: 'voucherNumber',
        header: 'Voucher #',
        cell: ({ row: { original: r } }) => <span className="font-mono font-semibold">{r.voucherNumber || 'N/A'}</span>
      },
      {
        accessorKey: 'student_id',
        header: `${terms.student}`,
        cell: ({ row: { original: r } }) => (
          <div>
            <p className="font-medium">{r.studentName || 'N/A'}</p>
            <p className="text-xs text-muted-foreground">Reg: {r.registrationNo || 'N/A'}</p>
          </div>
        ),
      },
      { accessorKey: 'month', header: 'Month', cell: ({ getValue }) => MONTH_OPTS.find(m => m.value === String(getValue()))?.label || getValue() },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row: { original: r } }) => (
          <div>
            <p className="font-medium">{r.amount || 'N/A'}</p>
            <p className="text-xs text-muted-foreground">{r.currency || 'N/A'}</p>
          </div>
        ),
      },
      // {
      //   accessorKey: 'status',
      //   header: 'Status',
      //   cell: ({ getValue }) => {
      //     const s = getValue();
      //     return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[s] || 'bg-gray-100')}>{s}</span>;
      //   },
      // },
      { accessorKey: 'issuedDate', header: 'Issued', cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('en-PK') : '—' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewingVoucher(row.original)}
              className="rounded p-1 hover:bg-accent"
              title="View Details"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={() => handleDownloadVoucher(row.original)}
              disabled={downloadingVoucherId === (row.original?.id || row.original?.voucherNumber || row.original?.voucher_number)}
              className="rounded p-1 hover:bg-accent disabled:opacity-50"
              title="Download"
            >
              {downloadingVoucherId === (row.original?.id || row.original?.voucherNumber || row.original?.voucher_number)
                ? <Loader2 size={14} className="animate-spin" />
                : <Download size={14} />}
            </button>
            {canDo('fees.delete') && (
              <button onClick={() => setDeletingVoucher(row.original)} className="rounded p-1 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={14} /></button>
            )}
          </div>
        ),
      },
    ],
    [terms.student, canDo, setViewingVoucher, setDeletingVoucher, downloadingVoucherId]
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Fee Vouchers" description={`${voucherStats.total} vouchers • ${voucherStats.pending} pending`} />

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">Filter Vouchers</h3>
          <Filter size={16} className="text-muted-foreground" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Month" options={MONTH_OPTS} value={voucherMonth} onChange={setVoucherMonth} />
          <SelectField label="Academic Year" options={academicYearsData.map(ay => ({ value: ay.id, label: ay.name }))} value={voucherAcademicYearId} onChange={setVoucherAcademicYearId} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatsCard label="Total Vouchers" value={voucherStats.total} icon={<FileText size={18} />} />
        <StatsCard label="Collected (Paid)" value={`PKR ${collectedAmount.toLocaleString('en-PK')}`} icon={<DollarSign size={18} />} />
        <StatsCard label="Pending Collection" value={voucherStats.pending} icon={<AlertCircle size={18} />} />
        <StatsCard label="Pending Amount" value={`PKR ${voucherStats.pendingAmount.toLocaleString('en-PK')}`} icon={<DollarSign size={18} />} />
      </div>

      {/* Vouchers Table with Action Buttons and Pagination */}
      <DataTable
        columns={voucherColumns}
        data={vouchers}
        loading={vouchersLoading}
        emptyMessage="No vouchers found for selected filters"
        enableColumnVisibility
        exportConfig={{ fileName: `fee-vouchers-${voucherMonth}` }}
        pagination={{
          page: voucherPagination.page,
          pageSize: voucherPageSize,
          total: voucherPagination.total,
          totalPages: voucherPagination.totalPages,
          onPageChange: setVoucherPage,
          onPageSizeChange: (size) => {
            setVoucherPageSize(size);
            setVoucherPage(1);
          },
        }}
        action={
          <div className="flex items-center gap-2">
            {canDo('fees.create') && (
              <button
                onClick={() => {
                  setVoucherGeneratorModal(true);
                }}
                disabled={isGeneratingVouchers}
                className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {isGeneratingVouchers ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <FileText size={14} /> Generate Vouchers
                  </>
                )}
              </button>
            )}
          </div>
        }
      />

      {/* Bulk Voucher Generator Modal */}
      <AppModal open={voucherGeneratorModal} onClose={() => setVoucherGeneratorModal(false)} title="Generate Bulk Vouchers" size="xl">
        <BulkVoucherGenerator
          instituteId={currentInstitute?.id}
          onGeneratingChange={setIsGeneratingVouchers}
          onSuccess={() => {
            setVoucherGeneratorModal(false);
            refetchVouchers();
            qc.invalidateQueries({ queryKey: ['fee-vouchers'] });
            toast.success('Bulk vouchers generated!');
          }}
        />
      </AppModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingVoucher}
        onClose={() => setDeletingVoucher(null)}
        onConfirm={() => deleteVoucher.mutate(deletingVoucher.id)}
        loading={deleteVoucher.isPending}
        title="Delete Voucher"
        description={`Delete voucher ${deletingVoucher?.voucher_number}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Voucher Detail View Modal */}
      <AppModal open={!!viewingVoucher} onClose={() => setViewingVoucher(null)} title="Voucher Details" size="lg">
        {viewingVoucher && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">VOUCHER #</p>
                <p className="text-lg font-bold font-mono">{viewingVoucher.voucherNumber || viewingVoucher.voucher_number}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">ISSUED DATE</p>
                <p className="text-sm">{viewingVoucher.issuedDate ? new Date(viewingVoucher.issuedDate).toLocaleDateString('en-PK') : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">DUE DATE</p>
                <p className="text-sm">{viewingVoucher.dueDate ? new Date(viewingVoucher.dueDate).toLocaleDateString('en-PK') : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">MONTH/YEAR</p>
                <p className="text-sm">{MONTH_OPTS.find(m => m.value === String(viewingVoucher.month))?.label} {viewingVoucher.year}</p>
              </div>
            </div>

            {/* Student Info */}
            <div className="rounded-lg bg-slate-50 p-4 space-y-3">
              <h4 className="font-semibold text-sm">Student Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{viewingVoucher.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Registration #</p>
                  <p className="font-medium">{viewingVoucher.registrationNo}</p>
                </div>
              </div>
            </div>

            {/* Amount Details */}
            <div className="rounded-lg bg-emerald-50 p-4 space-y-3">
              <h4 className="font-semibold text-sm">Amount Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">PKR {(viewingVoucher.amount || 0).toLocaleString('en-PK')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="font-medium">PKR {(viewingVoucher.discount || 0).toLocaleString('en-PK')}</span>
                </div>
                <div className="border-t border-emerald-200 my-2" />
                <div className="flex justify-between font-semibold text-emerald-700">
                  <span>Net Amount:</span>
                  <span>PKR {(viewingVoucher.netAmount || 0).toLocaleString('en-PK')}</span>
                </div>
              </div>
            </div>

            {/* Currency & Dates */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Currency</p>
                <p className="font-medium">{viewingVoucher.currency || 'PKR'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="font-medium">{viewingVoucher.dueDate ? new Date(viewingVoucher.dueDate).toLocaleDateString('en-PK') : 'N/A'}</p>
              </div>
            </div>

            {/* Fee Breakdown */}
            {viewingVoucher.feeBreakdown && Object.keys(viewingVoucher.feeBreakdown).length > 0 && (
              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-semibold text-sm">Fee Breakdown</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(viewingVoucher.feeBreakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium">{typeof value === 'number' ? `PKR ${value.toLocaleString('en-PK')}` : String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {viewingVoucher.notes && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-700 mb-2">NOTES</p>
                <p className="text-sm text-amber-900 whitespace-pre-wrap">{viewingVoucher.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4">
              <button onClick={() => setViewingVoucher(null)} className="rounded-md border px-4 py-2 text-sm">Close</button>
              <button
                onClick={() => { handleDownloadVoucher(viewingVoucher); }}
                disabled={downloadingVoucherId === (viewingVoucher?.id || viewingVoucher?.voucherNumber || viewingVoucher?.voucher_number)}
                className="rounded-md bg-primary px-4 py-2 text-sm text-white flex items-center gap-1.5 disabled:opacity-60"
              >
                {downloadingVoucherId === (viewingVoucher?.id || viewingVoucher?.voucherNumber || viewingVoucher?.voucher_number) ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Downloading...
                  </>
                ) : (
                  <>
                    <Download size={14} /> Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </AppModal>
    </div>
  );
}
