'use client';

import { useMemo, useRef, useState } from 'react';
import { Download, Printer, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import FeeVoucher from './FeeVoucher';
import { getFeeTheme } from '../styles/feeTheme';

export default function FeeVoucherPreviewModal({
  open,
  onClose,
  studentData,
  feeStructure,
  instituteData,
  voucherMeta,
  copyMode = 'single',
  onCopyModeChange,
}) {
  const { resolvedTheme } = useTheme();
  const [isDownloading, setIsDownloading] = useState(false);
  const voucherRef = useRef(null);
  const theme = useMemo(() => getFeeTheme(resolvedTheme), [resolvedTheme]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!voucherRef.current) return;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(voucherRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const width = 210;
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imageData, 'PNG', 0, 0, width, height, undefined, 'FAST');
      pdf.save(`fee-voucher-${voucherMeta?.voucherNumber || 'download'}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose?.()}>
      <DialogContent className="fee-voucher-modal-shell !max-w-[96vw] border p-0 sm:!max-w-[96vw]">
        <DialogHeader className="border-b px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DialogTitle className="text-base font-semibold">Fee Voucher Preview</DialogTitle>

            <div className="fee-voucher-modal-actions flex flex-wrap items-center gap-2">
              <label className="mr-1 inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                <span>Double Copy</span>
                <Switch checked={copyMode === 'double'} onCheckedChange={(checked) => onCopyModeChange?.(checked ? 'double' : 'single')} />
              </label>

              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                Print
              </Button>

              <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isDownloading}>
                <Download className="h-4 w-4" />
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </Button>

              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[80vh] overflow-auto bg-slate-100 p-4">
          <div className="mx-auto w-fit origin-top scale-[0.62] sm:scale-75 md:scale-90 lg:scale-100">
            <div ref={voucherRef} className="fee-voucher-print-target">
              <FeeVoucher
                studentData={studentData}
                feeStructure={feeStructure}
                instituteData={instituteData}
                voucherMeta={voucherMeta}
                copyMode={copyMode}
                theme={theme}
              />
            </div>
          </div>
        </div>
      </DialogContent>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          .fee-voucher-print-target,
          .fee-voucher-print-target * {
            visibility: visible !important;
          }

          .fee-voucher-print-target {
            position: absolute !important;
            inset: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: #fff !important;
          }

          .fee-voucher-modal-shell,
          .fee-voucher-modal-actions,
          [data-radix-dialog-overlay] {
            display: none !important;
          }

          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </Dialog>
  );
}
