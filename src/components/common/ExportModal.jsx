'use client';
/**
 * ExportModal — export table data as JSON / CSV / Excel / PDF
 *
 * Props:
 *   open        : boolean
 *   onClose     : () => void
 *   columns     : [{ accessorKey|id, header }]  — DataTable column defs
 *   rows        : object[]                       — raw data rows
 *   fileName    : string                         — base name without extension
 *   dateField   : string | null                  — key to use for date range filter
 */
import { useState, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  FileJson, FileSpreadsheet, FileText, File, Download, Calendar, Columns,
} from 'lucide-react';

const FORMAT_OPTIONS = [
  { value: 'csv',   label: 'CSV',   icon: FileText,        color: 'text-emerald-500' },
  { value: 'json',  label: 'JSON',  icon: FileJson,        color: 'text-yellow-500'  },
  { value: 'excel', label: 'Excel', icon: FileSpreadsheet, color: 'text-green-600'   },
  { value: 'pdf',   label: 'PDF',   icon: File,            color: 'text-red-500'     },
];

function buildCols(columns = []) {
  return columns
    .map((c) => ({
      key:   c.accessorKey ?? c.id ?? '',
      label: typeof c.header === 'string' ? c.header : (c.accessorKey ?? c.id ?? ''),
    }))
    .filter((c) => c.key && c.key !== 'select' && c.key !== 'actions');
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href    = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportModal({
  open, onClose, columns = [], rows = [], fileName = 'export', dateField = null,
}) {
  const colDefs  = useMemo(() => buildCols(columns), [columns]);
  const [selCols,    setSelCols]    = useState(() => colDefs.map((c) => c.key));
  const [format,     setFormat]     = useState('csv');
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');
  const [exporting,  setExporting]  = useState(false);

  // Re-sync selCols when columns prop changes (modal re-open)
  useMemo(() => { setSelCols(colDefs.map((c) => c.key)); }, [colDefs]);

  function toggleCol(key) {
    setSelCols((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }
  function toggleAll() {
    setSelCols((prev) => prev.length === colDefs.length ? [] : colDefs.map((c) => c.key));
  }

  function getFilteredRows() {
    let data = rows;
    if (dateField && (dateFrom || dateTo)) {
      const from = dateFrom ? new Date(dateFrom) : null;
      const to   = dateTo   ? new Date(dateTo + 'T23:59:59') : null;
      data = data.filter((row) => {
        const val = row[dateField];
        if (!val) return true;
        const d = new Date(val);
        if (from && d < from) return false;
        if (to   && d > to)   return false;
        return true;
      });
    }
    // Pick only selected columns
    return data.map((row) => {
      const out = {};
      selCols.forEach((k) => { out[k] = row[k] ?? ''; });
      return out;
    });
  }

  async function handleExport() {
    if (!selCols.length) return;
    setExporting(true);
    try {
      const filtered = getFilteredRows();
      const headers  = colDefs.filter((c) => selCols.includes(c.key)).map((c) => c.label);

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `${fileName}.json`);
      }

      else if (format === 'csv') {
        const escape  = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const rows2d  = filtered.map((row) => selCols.map((k) => escape(row[k])).join(','));
        const csv     = [headers.map((h) => escape(h)).join(','), ...rows2d].join('\r\n');
        const blob    = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `${fileName}.csv`);
      }

      else if (format === 'excel') {
        const XLSX = await import('xlsx');
        const ws   = XLSX.utils.json_to_sheet(filtered);
        // Write human-readable headers
        XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
        const wb   = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        XLSX.writeFile(wb, `${fileName}.xlsx`);
      }

      else if (format === 'pdf') {
        const { default: jsPDF }         = await import('jspdf');
        const { default: autoTable }     = await import('jspdf-autotable');
        const doc = new jsPDF({ orientation: selCols.length > 5 ? 'landscape' : 'portrait' });
        doc.setFontSize(14);
        doc.text(fileName, 14, 16);
        autoTable(doc, {
          head:       [headers],
          body:       filtered.map((row) => selCols.map((k) => String(row[k] ?? ''))),
          startY:     22,
          styles:     { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 246, 250] },
        });
        doc.save(`${fileName}.pdf`);
      }

      onClose();
    } catch (err) {
      console.error('Export error', err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Format selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Export Format</Label>
            <div className="grid grid-cols-4 gap-2">
              {FORMAT_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  onClick={() => setFormat(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors
                    ${format === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50 text-muted-foreground'
                    }`}
                >
                  <Icon className={`h-5 w-5 ${format === value ? 'text-primary' : color}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Column selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Columns className="h-4 w-4" /> Columns
              </Label>
              <button
                onClick={toggleAll}
                className="text-xs text-primary hover:underline"
              >
                {selCols.length === colDefs.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto rounded-lg border bg-muted/20 p-3 grid grid-cols-2 gap-2">
              {colDefs.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox
                    id={`col-${key}`}
                    checked={selCols.includes(key)}
                    onCheckedChange={() => toggleCol(key)}
                  />
                  <Label htmlFor={`col-${key}`} className="text-xs cursor-pointer truncate">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {selCols.length} of {colDefs.length} columns selected
            </p>
          </div>

          {/* Date range */}
          {dateField && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Date Range
                <Badge variant="outline" className="text-xs ml-1">optional</Badge>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(''); setDateTo(''); }}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Clear date range
                </button>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>
              Exporting <strong className="text-foreground">{rows.length}</strong> rows
              {dateField && (dateFrom || dateTo) ? ' (filtered by date)' : ''}
            </span>
            <span>
              <strong className="text-foreground">{selCols.length}</strong> cols · {format.toUpperCase()}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={exporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting || !selCols.length}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? 'Exporting…' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
