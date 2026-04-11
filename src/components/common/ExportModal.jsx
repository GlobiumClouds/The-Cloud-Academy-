
'use client';

/**
 * ExportModal — Enhanced Export with Professional PDF Generation
 * Features:
 * - Professional PDF with institute branding (logo, name, address)
 * - Date range picker with DatePickerField component
 * - Multiple export formats with preview
 * - Column selection with drag-drop reordering
 * - Export progress indicator
 * - Responsive and user-friendly UI
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  FileJson, FileSpreadsheet, FileText, File, Download, Calendar, 
  Columns, Loader2, CheckCircle2, AlertCircle, Printer, Eye,
  Settings, Layout, Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import DatePickerField from './DatePickerField';
import { useForm } from 'react-hook-form';

// Drag & Drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

const FORMAT_OPTIONS = [
  { value: 'csv',   label: 'CSV',   icon: FileText,        color: 'text-emerald-500', description: 'Comma separated values' },
  { value: 'json',  label: 'JSON',  icon: FileJson,        color: 'text-yellow-500',  description: 'Raw JSON data' },
  { value: 'excel', label: 'Excel', icon: FileSpreadsheet, color: 'text-green-600',   description: 'Microsoft Excel format' },
  { value: 'pdf',   label: 'PDF',   icon: File,            color: 'text-red-500',     description: 'Professional document' },
];

// PDF Configuration Options
const PDF_PAPER_SIZES = [
  { value: 'a4', label: 'A4', width: 210, height: 297 },
  { value: 'letter', label: 'Letter', width: 216, height: 279 },
  { value: 'legal', label: 'Legal', width: 216, height: 356 },
];

const PDF_ORIENTATIONS = [
  { value: 'portrait', label: 'Portrait', icon: '📄' },
  { value: 'landscape', label: 'Landscape', icon: '📄↔️' },
];

const PDF_FONT_SIZES = [
  { value: 8, label: 'Small (8pt)' },
  { value: 9, label: 'Normal (9pt)' },
  { value: 10, label: 'Medium (10pt)' },
  { value: 11, label: 'Large (11pt)' },
];

// function buildCols(columns = []) {
//   return columns
//     .map((c, index) => ({
//       key:   c.accessorKey ?? c.id ?? '',
//       label: typeof c.header === 'string' ? c.header : (c.accessorKey ?? c.id ?? ''),
//       originalIndex: index,
//     }))
//     .filter((c) => c.key && c.key !== 'select' && c.key !== 'actions');
// }

// BAAD — id bhi filter karo, aur better label fallback:
function buildCols(columns = []) {
  return columns
    .map((c, index) => ({
      key: c.accessorKey ?? c.id ?? '',
      label:
        typeof c.header === 'string'
          ? c.header
          : c.meta?.exportLabel   // ← optional: column mein meta.exportLabel daal sakte ho
          ?? c.accessorKey?.split('.').pop()  // nested key ka last part: "student.name" → "name"
          ?? c.id
          ?? '',
      originalIndex: index,
    }))
    .filter(
      (c) =>
        c.key &&
        c.key !== 'select' &&
        c.key !== 'actions' &&
        c.key !== '__select__'  // DataTable ka selection column
    );
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href    = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

// Helper to format date
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-PK', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function ExportModal({
  open, onClose, columns = [], rows = [], fileName = 'export', dateField = null,
}) {
  const { user, institute } = useAuthStore();
  const [activeTab, setActiveTab] = useState('format');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('idle'); // idle, processing, success, error
  
  // Column state
  const colDefs = useMemo(() => buildCols(columns), [columns]);
  const [selectedCols, setSelectedCols] = useState(() => colDefs.map((c) => c.key));
  const [columnOrder, setColumnOrder] = useState(() => colDefs.map((c) => c.key));
  
  // Format state
  const [format, setFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  // PDF specific settings
  const [pdfSettings, setPdfSettings] = useState({
    paperSize: 'a4',
    orientation: 'portrait',
    fontSize: 9,
    showLogo: true,
    showFooter: true,
    showPageNumbers: true,
    includeTimestamp: true,
    colorTheme: 'primary',
    tableStriped: true,
    headerBackground: true,
  });
  
  // Form for date picker
  const { control, watch, reset } = useForm({
    defaultValues: {
      fromDate: '',
      toDate: '',
    }
  });
  
  const fromDate = watch('fromDate');
  const toDate = watch('toDate');
  
  // Update date range when form values change
  useMemo(() => {
    setDateRange({ from: fromDate, to: toDate });
  }, [fromDate, toDate]);
  
  // Sensors for drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Get institute info for PDF branding
  const instituteInfo = useMemo(() => ({
    name: institute?.name || user?.institute?.name || user?.school?.name || 'The Clouds Academy',
    logo: institute?.logo_url || user?.institute?.logo_url || null,
    address: institute?.address || user?.institute?.address || '',
    city: institute?.city || user?.institute?.city || '',
    phone: institute?.phone || user?.institute?.phone || '',
    email: institute?.email || user?.institute?.email || '',
    website: institute?.website || 'www.thecloudsacademy.com',
  }), [user, institute]);
  
  // Re-sync selected columns when columns prop changes
  useMemo(() => { 
    setSelectedCols(colDefs.map((c) => c.key));
    setColumnOrder(colDefs.map((c) => c.key));
  }, [colDefs]);
  
  function toggleCol(key) {
    setSelectedCols((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }
  
  function toggleAll() {
    setSelectedCols((prev) => 
      prev.length === colDefs.length ? [] : colDefs.map((c) => c.key)
    );
  }
  
  function handleDragEnd(event) {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id);
      const newIndex = columnOrder.indexOf(over.id);
      const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
      setColumnOrder(newOrder);
    }
  }
  
  function getFilteredRows() {
    let data = rows;
    if (dateField && (dateRange.from || dateRange.to)) {
      const from = dateRange.from ? new Date(dateRange.from) : null;
      const to   = dateRange.to ? new Date(dateRange.to + 'T23:59:59') : null;
      data = data.filter((row) => {
        const val = row[dateField];
        if (!val) return true;
        const d = new Date(val);
        if (from && d < from) return false;
        if (to   && d > to)   return false;
        return true;
      });
    }
    
    // Order columns according to drag-drop order
    const orderedCols = columnOrder.filter(key => selectedCols.includes(key));
    
    return data.map((row) => {
      const out = {};
      orderedCols.forEach((k) => { 
        // Find the original column definition to check for accessorFn
        const colDef = columns.find(c => (c.accessorKey ?? c.id) === k);
        
        if (colDef?.accessorFn) {
          out[k] = colDef.accessorFn(row) ?? '';
        } else if (colDef?.accessorKey) {
          // Handle nested keys like "details.phone"
          const keys = colDef.accessorKey.split('.');
          let val = row;
          for (const key of keys) {
            val = val?.[key];
          }
          out[k] = val ?? '';
        } else {
          out[k] = row[k] ?? ''; 
        }
      });
      return out;
    });
  }
  
  // Professional PDF Generation
  // Professional PDF Generation (Tabular)
  async function generateProfessionalPDF(data, headers, orderedCols) {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const orientation = pdfSettings.orientation;
    const doc = new jsPDF({ 
      orientation, 
      unit: 'mm',
      format: pdfSettings.paperSize 
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    
    // Header with Logo and Institute Info
    if (pdfSettings.showLogo && instituteInfo.logo) {
      try {
        const img = new Image();
        img.src = instituteInfo.logo;
        await new Promise((resolve) => {
          img.onload = () => {
            const maxWidth = 40;
            const maxHeight = 20;
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
            
            doc.addImage(img, 'PNG', pageWidth / 2 - width / 2, yPos, width, height);
            yPos += height + 5;
            resolve();
          };
          img.onerror = resolve;
          if (img.complete) img.onload();
        });
      } catch (err) {}
    }
    
    // Institute Name
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text(instituteInfo.name, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    // Address Line
    if (instituteInfo.address) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const addressText = `${instituteInfo.address}, ${instituteInfo.city}`;
      doc.text(addressText, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
    }
    
    // Contact Info
    if (instituteInfo.phone || instituteInfo.email) {
      const contact = [instituteInfo.phone, instituteInfo.email].filter(Boolean).join(' | ');
      doc.text(contact, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
    }
    
    // Divider Line
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 8;
    
    // Report Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(fileName, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    
    // Date Range Info
    if (dateRange.from || dateRange.to) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      let dateText = 'Date Range: ';
      if (dateRange.from) dateText += `${formatDate(dateRange.from)} `;
      if (dateRange.to) dateText += `to ${formatDate(dateRange.to)}`;
      doc.text(dateText, pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
    }
    
    // Export Info
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    const exportInfo = `Generated on: ${formatDate(new Date())} | Total Records: ${data.length}`;
    doc.text(exportInfo, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    // Main Table
    const tableHeaders = orderedCols.map(key => {
      const col = colDefs.find(c => c.key === key);
      return col?.label || key;
    });
    
    const tableBody = data.map(row => 
      orderedCols.map(key => String(row[key] ?? ''))
    );
    
    const headerColor = pdfSettings.colorTheme === 'primary' ? [99, 102, 241] : [52, 211, 153];
    
    autoTable(doc, {
      head: [tableHeaders],
      body: tableBody,
      startY: yPos + 2,
      styles: { 
        fontSize: pdfSettings.fontSize,
        cellPadding: pdfSettings.tableStriped ? 4 : 3,
        valign: 'middle',
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: headerColor, 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: pdfSettings.tableStriped ? { fillColor: [245, 246, 250] } : {},
      margin: { left: 15, right: 15 },
      didDrawPage: (data) => {
        if (pdfSettings.showPageNumbers) {
          const pageCount = doc.internal.getNumberOfPages();
          const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(`Page ${pageNumber} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        }
        if (pdfSettings.showFooter) {
          doc.setFontSize(7);
          doc.setTextColor(150, 150, 150);
          doc.text(instituteInfo.website || 'www.thecloudsacademy.com', pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
        }
      },
    });
    
    return doc;
  }

  // Segmented Profile PDF for Individual Export
  async function generateProfilePDF(student, headers, orderedCols) {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ 
      orientation: 'portrait', 
      unit: 'mm',
      format: 'a4' 
    });
    await appendProfileToDoc(doc, student, headers, orderedCols);
    return doc;
  }

  async function appendProfileToDoc(doc, student, headers, orderedCols) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = 20;

    // 1. Header with branding
    if (pdfSettings.showLogo && instituteInfo.logo) {
      try {
        const img = new Image();
        img.src = instituteInfo.logo;
        await new Promise((resolve) => {
          img.onload = () => {
            doc.addImage(img, 'PNG', margin, yPos, 25, 25);
            resolve();
          };
          img.onerror = resolve;
          if (img.complete) img.onload();
        });
      } catch (err) {}
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text(instituteInfo.name, 50, yPos + 10);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`${instituteInfo.address}, ${instituteInfo.city}`, 50, yPos + 16);
    doc.text(`${instituteInfo.phone} | ${instituteInfo.email}`, 50, yPos + 21);
    
    yPos += 35;

    // 2. Profile Title Ribbon
    doc.setFillColor(99, 102, 241); // Indigo-600
    doc.rect(margin, yPos, pageWidth - (margin * 2), 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("OFFICIAL STUDENT PROFILE REPORT", pageWidth / 2, yPos + 8, { align: 'center' });
    
    yPos += 20;

    // 3. Organization helper
    const drawSection = (title, items) => {
      // Check for page break
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(99, 102, 241);
      doc.text(title.toUpperCase(), margin, yPos);
      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
      yPos += 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // Slate-600

      const colWidth = (pageWidth - (margin * 2)) / 2;
      
      items.forEach((item, idx) => {
        const x = margin + (idx % 2 === 0 ? 0 : colWidth);
        const currentY = yPos + (Math.floor(idx / 2) * 8);

        doc.setFont('helvetica', 'bold');
        doc.text(`${item.label}:`, x, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(String(item.value || '—'), x + 35, currentY);

        if (idx % 2 !== 0 || idx === items.length - 1) {
          // Add row spacing only after full row or last item
          if (idx === items.length - 1) yPos = currentY + 12;
        }
      });
    };

    // Grouping the orderedCols into logic
    const getVal = (id) => {
      const col = colDefs.find(c => c.key === id);
      const val = student[id] ?? '—';
      return { label: col?.label || id, value: val };
    };

    // Segment mappings
    const personal = ['name', 'roll_no', 'reg_no', 'gender', 'dob', 'cnic', 'admission_date', 'nationality', 'status', 'religion'].map(getVal).filter(v => v.value !== '—');
    const academic = ['academic_year', 'class', 'section', 'previous_school', 'previous_class'].map(getVal).filter(v => v.value !== '—');
    const contact = ['phone', 'email', 'city', 'address', 'permanent_address'].map(getVal).filter(v => v.value !== '—');
    const guardian = ['primary_guardian', 'guardian_relation', 'guardian_phone', 'guardian_email', 'guardian_cnic', 'mother_name'].map(getVal).filter(v => v.value !== '—');
    const finance = ['monthly_fee', 'admission_fee', 'concession_type', 'concession_percentage'].map(getVal).filter(v => v.value !== '—');

    if (personal.length) drawSection("Personal Information", personal);
    if (academic.length) drawSection("Academic Record", academic);
    if (contact.length) drawSection("Contact Details", contact);
    if (guardian.length) drawSection("Family & Guardian", guardian);
    if (finance.length) drawSection("Fee & Concessions", finance);

    // 4. Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
    doc.text(`System Generated Report • ${formatDate(new Date())}`, margin, pageHeight - 20);
    // doc.text(`Page 1 of 1`, pageWidth - margin, pageHeight - 20, { align: 'right' });
    doc.text(instituteInfo.website, pageWidth / 2, pageHeight - 15, { align: 'center' });
  }
  
  async function handleExport() {
    if (!selectedCols.length) return;
    
    setExporting(true);
    setExportProgress(0);
    setExportStatus('processing');
    
    try {
      const filtered = getFilteredRows();
      const orderedCols = columnOrder.filter(key => selectedCols.includes(key));
      const headers = orderedCols.map(key => {
        const col = colDefs.find(c => c.key === key);
        return col?.label || key;
      });
      
      setExportProgress(30);
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `${fileName}.json`);
      }
      else if (format === 'csv') {
        const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const rows2d = filtered.map((row) => orderedCols.map((k) => escape(row[k])).join(','));
        const csv = [headers.map((h) => escape(h)).join(','), ...rows2d].join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `${fileName}.csv`);
      }
      else if (format === 'excel') {
        setExportProgress(50);
        const XLSX = await import('xlsx');
        const ws = XLSX.utils.json_to_sheet(filtered);
        XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, fileName);
        XLSX.writeFile(wb, `${fileName}.xlsx`);
      }
      else if (format === 'pdf') {
        setExportProgress(70);
        let doc;
        // Detect Individual Export Mode OR Multi-Profile Mode
        if (fileName.includes('Profile')) {
          for (let i = 0; i < filtered.length; i++) {
            if (i === 0) {
              doc = await generateProfilePDF(filtered[i], headers, orderedCols);
            } else {
              doc.addPage();
              // Reset yPos for the new page in generateProfilePDF logic but wait, 
              // generateProfilePDF returns a new doc. I should refactor it.
              await appendProfileToDoc(doc, filtered[i], headers, orderedCols);
            }
            setExportProgress(70 + Math.floor((i / filtered.length) * 25));
          }
        } else {
          doc = await generateProfessionalPDF(filtered, headers, orderedCols);
        }
        doc.save(`${fileName}.pdf`);
      }
      
      setExportProgress(100);
      setExportStatus('success');
      
      setTimeout(() => {
        onClose();
        reset();
      }, 1000);
      
    } catch (err) {
      console.error('Export error', err);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    } finally {
      setTimeout(() => setExporting(false), 500);
    }
  }
  
  const totalRows = getFilteredRows().length;
  
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
            <Badge variant="secondary" className="ml-2">
              {rows.length} records
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="format" className="flex items-center gap-2">
              <File className="h-4 w-4" /> Format
            </TabsTrigger>
            <TabsTrigger value="columns" className="flex items-center gap-2">
              <Columns className="h-4 w-4" /> Columns
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[1000px] pr-4">
            {/* Format Tab */}
            <TabsContent value="format" className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Export Format</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {FORMAT_OPTIONS.map(({ value, label, icon: Icon, color, description }) => (
                    <button
                      key={value}
                      onClick={() => setFormat(value)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg border p-4 transition-all",
                        format === value
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      <Icon className={cn("h-8 w-8", format === value ? "text-primary" : color)} />
                      <span className="font-medium text-sm">{label}</span>
                      <span className="text-xs text-muted-foreground">{description}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* PDF Settings (only shown when PDF is selected) */}
              {format === 'pdf' && (
                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-medium">PDF Document Settings</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Paper Size</Label>
                      <Select
                        value={pdfSettings.paperSize}
                        onValueChange={(v) => setPdfSettings({ ...pdfSettings, paperSize: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PDF_PAPER_SIZES.map(size => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Orientation</Label>
                      <Select
                        value={pdfSettings.orientation}
                        onValueChange={(v) => setPdfSettings({ ...pdfSettings, orientation: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PDF_ORIENTATIONS.map(orient => (
                            <SelectItem key={orient.value} value={orient.value}>
                              {orient.icon} {orient.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Font Size</Label>
                      <Select
                        value={String(pdfSettings.fontSize)}
                        onValueChange={(v) => setPdfSettings({ ...pdfSettings, fontSize: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PDF_FONT_SIZES.map(size => (
                            <SelectItem key={size.value} value={String(size.value)}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Color Theme</Label>
                      <Select
                        value={pdfSettings.colorTheme}
                        onValueChange={(v) => setPdfSettings({ ...pdfSettings, colorTheme: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary (Indigo)</SelectItem>
                          <SelectItem value="secondary">Secondary (Green)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={pdfSettings.showLogo}
                        onCheckedChange={(v) => setPdfSettings({ ...pdfSettings, showLogo: v })}
                      />
                      Show Institute Logo
                    </label>
                    
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={pdfSettings.showFooter}
                        onCheckedChange={(v) => setPdfSettings({ ...pdfSettings, showFooter: v })}
                      />
                      Show Footer
                    </label>
                    
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={pdfSettings.showPageNumbers}
                        onCheckedChange={(v) => setPdfSettings({ ...pdfSettings, showPageNumbers: v })}
                      />
                      Show Page Numbers
                    </label>
                    
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={pdfSettings.tableStriped}
                        onCheckedChange={(v) => setPdfSettings({ ...pdfSettings, tableStriped: v })}
                      />
                      Striped Rows
                    </label>
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* Columns Tab with Drag & Drop */}
            <TabsContent value="columns" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Columns className="h-4 w-4" /> Select & Order Columns
                </Label>
                <Button variant="ghost" size="sm" onClick={toggleAll}>
                  {selectedCols.length === colDefs.length ? 'Deselect all' : 'Select all'}
                </Button>
              </div>
              
              <div className="rounded-lg border bg-muted/20 p-3">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={columnOrder}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {columnOrder.map((key) => {
                        const col = colDefs.find(c => c.key === key);
                        if (!col) return null;
                        return (
                          <SortableItem key={key} id={key}>
                            <div className="flex items-center gap-2 p-2 bg-background rounded border">
                              <Checkbox
                                id={`col-${key}`}
                                checked={selectedCols.includes(key)}
                                onCheckedChange={() => toggleCol(key)}
                              />
                              <Label 
                                htmlFor={`col-${key}`} 
                                className="flex-1 cursor-pointer text-sm"
                              >
                                {col.label}
                              </Label>
                              <div className="cursor-move text-muted-foreground">⋮⋮</div>
                            </div>
                          </SortableItem>
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {selectedCols.length} of {colDefs.length} columns selected • Drag to reorder
              </p>
            </TabsContent>
            
            {/* Settings Tab with Date Picker */}
            <TabsContent value="settings" className="space-y-5 mt-4">
              {dateField && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Date Range Filter
                    <Badge variant="outline" className="text-xs">optional</Badge>
                  </Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <DatePickerField
                      label="From Date"
                      name="fromDate"
                      control={control}
                      placeholder="Select start date"
                    />
                    <DatePickerField
                      label="To Date"
                      name="toDate"
                      control={control}
                      placeholder="Select end date"
                    />
                  </div>
                  
                  {(dateRange.from || dateRange.to) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        reset({ fromDate: '', toDate: '' });
                        setDateRange({ from: '', to: '' });
                      }}
                      className="text-xs"
                    >
                      Clear date range
                    </Button>
                  )}
                </div>
              )}
              
              {/* Preview Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Export Preview</Label>
                <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Records to export:</span>
                    <Badge variant="secondary">{totalRows} rows</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Selected columns:</span>
                    <Badge variant="secondary">{selectedCols.length} columns</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">File format:</span>
                    <Badge variant="outline">{format.toUpperCase()}</Badge>
                  </div>
                  {format === 'pdf' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">PDF Settings:</span>
                      <Badge variant="outline">
                        {pdfSettings.paperSize.toUpperCase()} • {pdfSettings.orientation}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        {/* Progress Bar */}
        {exporting && exportStatus === 'processing' && (
          <div className="space-y-2 mt-4">
            <Progress value={exportProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Exporting... {exportProgress}%
            </p>
          </div>
        )}
        
        {/* Success/Error Message */}
        {exportStatus === 'success' && (
          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-lg text-green-700 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Export completed successfully!</span>
          </div>
        )}
        
        {exportStatus === 'error' && (
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 rounded-lg text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Export failed. Please try again.</span>
          </div>
        )}
        
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={exporting}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={exporting || !selectedCols.length}
            className="min-w-[100px]"
          >
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}