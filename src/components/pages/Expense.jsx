'use client';

import { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/authStore';

const STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const CATEGORY_OPTIONS = [
  { value: 'utilities', label: 'Utilities' },
  { value: 'transport', label: 'Transport' },
  { value: 'books', label: 'Books & Stationery' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'misc', label: 'Miscellaneous' },
];

const STATUS_COLORS = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
};

const INITIAL_EXPENSES = [
  {
    id: 'exp-1',
    title: 'Science Lab Supplies',
    amount: 42000,
    category: 'books',
    vendor: 'City Books Center',
    date: '2026-03-16',
    description: 'Chemistry glassware and lab copies',
    status: 'approved',
  },
  {
    id: 'exp-2',
    title: 'Generator Fuel',
    amount: 18500,
    category: 'utilities',
    vendor: 'Al Rehman Petroleum',
    date: '2026-03-24',
    description: 'Monthly fuel expense for backup power',
    status: 'paid',
  },
  {
    id: 'exp-3',
    title: 'Van Tire Replacement',
    amount: 30000,
    category: 'transport',
    vendor: 'Fast Wheels',
    date: '2026-04-01',
    description: 'Transport fleet maintenance',
    status: 'pending',
  },
];

const EMPTY_FORM = {
  title: '',
  amount: '',
  category: '',
  vendor: '',
  date: '',
  description: '',
  status: 'pending',
};

export default function Expense() {
  const canDo = useAuthStore((s) => s.canDo);
  const [rows, setRows] = useState(INITIAL_EXPENSES);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editingExpense, setEditingExpense] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = useMemo(() => {
    return rows.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q
        || item.title.toLowerCase().includes(q)
        || item.vendor.toLowerCase().includes(q)
        || item.description.toLowerCase().includes(q);
      const matchStatus = !status || item.status === status;
      return matchSearch && matchStatus;
    });
  }, [rows, search, status]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const resetForm = () => setForm(EMPTY_FORM);

  const openAdd = () => {
    setEditingExpense(null);
    resetForm();
    setFormModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingExpense(row);
    setForm({
      title: row.title,
      amount: String(row.amount),
      category: row.category,
      vendor: row.vendor,
      date: row.date,
      description: row.description,
      status: row.status,
    });
    setFormModalOpen(true);
  };

  const openView = (row) => {
    setViewingExpense(row);
    setViewModalOpen(true);
  };

  const closeFormModal = () => {
    setFormModalOpen(false);
    setEditingExpense(null);
    resetForm();
  };

  const onSave = (e) => {
    e.preventDefault();

    if (!form.title || !form.amount || !form.category || !form.vendor || !form.date || !form.status) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category,
      vendor: form.vendor.trim(),
      date: form.date,
      description: form.description.trim(),
      status: form.status,
    };

    if (editingExpense) {
      setRows((prev) => prev.map((item) => (item.id === editingExpense.id ? { ...item, ...payload } : item)));
      toast.success('Expense updated');
    } else {
      const id = `exp-${Date.now()}`;
      setRows((prev) => [{ id, ...payload }, ...prev]);
      toast.success('Expense added');
    }

    closeFormModal();
  };

  const onDelete = () => {
    if (!deletingExpense) return;
    setRows((prev) => prev.filter((item) => item.id !== deletingExpense.id));
    setDeleteModalOpen(false);
    setDeletingExpense(null);
    toast.success('Expense deleted');
  };

  const columns = useMemo(() => [
    { accessorKey: 'title', header: 'Title', cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ getValue }) => {
        const category = getValue();
        const label = CATEGORY_OPTIONS.find((opt) => opt.value === category)?.label || category;
        return <span>{label}</span>;
      },
    },
    { accessorKey: 'vendor', header: 'Vendor' },
    { accessorKey: 'amount', header: 'Amount', cell: ({ getValue }) => `PKR ${Number(getValue() || 0).toLocaleString()}` },
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('en-PK') },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[value] || 'bg-muted text-muted-foreground')}>
            {value}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {canDo('fees.read') && (
            <button onClick={() => openView(row.original)} className="rounded p-1.5 hover:bg-accent" title="View">
              <Eye size={14} />
            </button>
          )}
          {canDo('fees.update') && (
            <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit">
              <Pencil size={14} />
            </button>
          )}
          {canDo('fees.delete') && (
            <button
              onClick={() => {
                setDeletingExpense(row.original);
                setDeleteModalOpen(true);
              }}
              className="rounded p-1.5 text-destructive hover:bg-destructive/10"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ], [canDo]);

  if (!canDo('fees.read')) {
    return <div className="py-20 text-center text-muted-foreground">You don't have permission to view expenses.</div>;
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Expense" description={`${total} records`} />

      <DataTable
        columns={columns}
        data={pageRows}
        loading={false}
        emptyMessage="No expenses found"
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search expenses..."
        filters={[
          {
            name: 'status',
            label: 'Status',
            value: status,
            onChange: (v) => {
              setStatus(v);
              setPage(1);
            },
            options: STATUS_OPTIONS,
          },
        ]}
        action={canDo('fees.create') ? (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus size={14} /> Add Expense
          </button>
        ) : null}
        enableColumnVisibility
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          total,
          pageSize,
          onPageSizeChange: (s) => {
            setPageSize(s);
            setPage(1);
          },
        }}
      />

      <AppModal
        open={formModalOpen}
        onClose={closeFormModal}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        size="lg"
        footer={
          <>
            <button type="button" onClick={closeFormModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
              Cancel
            </button>
            <button type="submit" form="expense-form" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
              {editingExpense ? 'Update' : 'Save'}
            </button>
          </>
        }
      >
        <form id="expense-form" onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Expense Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="input-base"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Amount *</label>
              <input
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                className="input-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              label="Category"
              name="category"
              value={form.category}
              onChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
              options={CATEGORY_OPTIONS}
              required
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Vendor *</label>
              <input
                value={form.vendor}
                onChange={(e) => setForm((prev) => ({ ...prev, vendor: e.target.value }))}
                className="input-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                className="input-base"
              />
            </div>
            <SelectField
              label="Status "
              name="status"
              value={form.status}
              onChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
              options={STATUS_OPTIONS}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="input-base min-h-24"
            />
          </div>
        </form>
      </AppModal>

      <AppModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingExpense(null);
        }}
        title="View Expense"
        size="md"
        footer={<button className="rounded-md border px-4 py-2 text-sm hover:bg-accent" onClick={() => setViewModalOpen(false)}>Close</button>}
      >
        {viewingExpense && (
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div><p className="text-muted-foreground">Expense Title</p><p className="font-medium">{viewingExpense.title}</p></div>
            <div><p className="text-muted-foreground">Amount</p><p className="font-medium">PKR {Number(viewingExpense.amount || 0).toLocaleString()}</p></div>
            <div><p className="text-muted-foreground">Category</p><p className="font-medium">{CATEGORY_OPTIONS.find((opt) => opt.value === viewingExpense.category)?.label || viewingExpense.category}</p></div>
            <div><p className="text-muted-foreground">Vendor</p><p className="font-medium">{viewingExpense.vendor}</p></div>
            <div><p className="text-muted-foreground">Date</p><p className="font-medium">{new Date(viewingExpense.date).toLocaleDateString('en-PK')}</p></div>
            <div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{viewingExpense.status}</p></div>
            <div className="sm:col-span-2"><p className="text-muted-foreground">Description</p><p className="font-medium">{viewingExpense.description || '—'}</p></div>
          </div>
        )}
      </AppModal>

      <AppModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingExpense(null);
        }}
        title="Delete Expense"
        size="sm"
        footer={
          <>
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setDeletingExpense(null);
              }}
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
            >
              Cancel
            </button>
            <button onClick={onDelete} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
              Confirm Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">Are you sure you want to delete this item?</p>
      </AppModal>
    </div>
  );
}
