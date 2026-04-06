'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Pencil, Plus, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import CreatableSelectField from '@/components/common/CreatableSelectField';
import { cn } from '@/lib/utils';
import { studentService } from '@/services/studentService';
import { DUMMY_STUDENTS } from '@/data/dummyData';
import useAuthStore from '@/store/authStore';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const VENDOR_TYPE_OPTIONS = [
  { value: 'books', label: 'Books and Stationery Vendors' },
  { value: 'uniform', label: 'Uniform Vendors' },
  { value: 'transport', label: 'Transport Vendors' },
  { value: 'canteen', label: 'Canteen Vendors' },
  { value: 'it', label: 'IT Vendors' },
];

const INITIAL_VENDORS = [
  {
    id: 'ven-1',
    name: 'Knowledge Books House',
    type: 'books',
    phone: '0300-1112233',
    email: 'books@knowledge.pk',
    address: 'Urdu Bazar, Lahore',
    status: 'active',
    assignedStudentIds: ['st-1', 'st-2'],
  },
  {
    id: 'ven-2',
    name: 'Smart Uniforms',
    type: 'uniform',
    phone: '0301-4556677',
    email: 'uniform@smart.pk',
    address: 'Main Market, Karachi',
    status: 'active',
    assignedStudentIds: ['st-3'],
  },
  {
    id: 'ven-3',
    name: 'School Riders Transport',
    type: 'transport',
    phone: '0321-9000011',
    email: 'ops@riders.pk',
    address: 'Satellite Town, Rawalpindi',
    status: 'inactive',
    assignedStudentIds: [],
  },
];

const EMPTY_FORM = {
  name: '',
  type: '',
  phone: '',
  email: '',
  address: '',
  status: 'active',
};

function normalizeTypeLabel(value) {
  if (!value) return '';
  return String(value)
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function studentDisplayName(student) {
  if (student?.name) return student.name;
  const full = `${student?.first_name || ''} ${student?.last_name || ''}`.trim();
  return full || student?.student_name || student?.id || 'Unknown Student';
}

export default function Vendors({ type = 'school' }) {
  const canDo = useAuthStore((s) => s.canDo);
  const [rows, setRows] = useState(INITIAL_VENDORS);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [vendorType, setVendorType] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const [editingVendor, setEditingVendor] = useState(null);
  const [viewingVendor, setViewingVendor] = useState(null);
  const [deletingVendor, setDeletingVendor] = useState(null);
  const [assigningVendor, setAssigningVendor] = useState(null);

  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);

  const { data: studentsData = [] } = useQuery({
    queryKey: ['students-for-vendors', type],
    queryFn: async () => {
      try {
        const res = await studentService.getAll({ page: 1, limit: 500 }, type);
        if (Array.isArray(res?.data?.rows)) return res.data.rows;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.rows)) return res.rows;
        if (Array.isArray(res)) return res;
        return DUMMY_STUDENTS || [];
      } catch {
        return DUMMY_STUDENTS || [];
      }
    },
    placeholderData: (prev) => prev,
  });

  const studentsById = useMemo(() => {
    return (studentsData || []).reduce((acc, student) => {
      acc[student.id] = student;
      return acc;
    }, {});
  }, [studentsData]);

  const filtered = useMemo(() => {
    return rows.filter((item) => {
      const q = search.trim().toLowerCase();
      const searchMatch = !q
        || item.name.toLowerCase().includes(q)
        || item.phone.toLowerCase().includes(q)
        || item.email.toLowerCase().includes(q);
      const statusMatch = !status || item.status === status;
      const typeMatch = !vendorType || item.type === vendorType;
      return searchMatch && statusMatch && typeMatch;
    });
  }, [rows, search, status, vendorType]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const assignmentCandidates = useMemo(() => {
    const q = assignmentSearch.trim().toLowerCase();
    return (studentsData || []).filter((student) => {
      if (!q) return true;
      const name = studentDisplayName(student).toLowerCase();
      const reg = String(student.registration_no || student.roll_no || '').toLowerCase();
      return name.includes(q) || reg.includes(q);
    });
  }, [studentsData, assignmentSearch]);

  const vendorTypeOptions = useMemo(() => {
    const fromRows = rows
      .map((item) => item.type)
      .filter(Boolean)
      .map((value) => ({ value, label: normalizeTypeLabel(value) }));

    const map = new Map();
    [...VENDOR_TYPE_OPTIONS, ...fromRows].forEach((opt) => {
      if (!map.has(opt.value)) map.set(opt.value, opt);
    });
    return Array.from(map.values());
  }, [rows]);

  const resetForm = () => setForm(EMPTY_FORM);

  const openAdd = () => {
    setEditingVendor(null);
    resetForm();
    setFormModalOpen(true);
  };

  const openEdit = (vendor) => {
    setEditingVendor(vendor);
    setForm({
      name: vendor.name,
      type: vendor.type,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
      status: vendor.status,
    });
    setFormModalOpen(true);
  };

  const openView = (vendor) => {
    setViewingVendor(vendor);
    setViewModalOpen(true);
  };

  const openAssignModal = (vendor) => {
    setAssigningVendor(vendor);
    setSelectedStudentIds(vendor.assignedStudentIds || []);
    setAssignmentSearch('');
    setAssignModalOpen(true);
  };

  const closeFormModal = () => {
    setFormModalOpen(false);
    setEditingVendor(null);
    resetForm();
  };

  const saveVendor = (e) => {
    e.preventDefault();

    if (!form.name || !form.type || !form.phone || !form.status) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      name: form.name.trim(),
      type: form.type,
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      status: form.status,
    };

    if (editingVendor) {
      setRows((prev) => prev.map((item) => (item.id === editingVendor.id ? { ...item, ...payload } : item)));
      toast.success('Vendor updated');
    } else {
      const id = `ven-${Date.now()}`;
      setRows((prev) => [{ id, ...payload, assignedStudentIds: [] }, ...prev]);
      toast.success('Vendor added');
    }

    closeFormModal();
  };

  const deleteVendor = () => {
    if (!deletingVendor) return;
    setRows((prev) => prev.filter((item) => item.id !== deletingVendor.id));
    setDeleteModalOpen(false);
    setDeletingVendor(null);
    toast.success('Vendor deleted');
  };

  const saveAssignment = () => {
    if (!assigningVendor) return;

    setRows((prev) => prev.map((item) => (
      item.id === assigningVendor.id
        ? { ...item, assignedStudentIds: selectedStudentIds }
        : item
    )));

    if (viewingVendor?.id === assigningVendor.id) {
      setViewingVendor((prev) => (prev ? { ...prev, assignedStudentIds: selectedStudentIds } : prev));
    }

    setAssignModalOpen(false);
    setAssigningVendor(null);
    toast.success('Student assignments saved');
  };

  const removeAssignmentFromVendor = (vendorId, studentId) => {
    setRows((prev) => prev.map((item) => {
      if (item.id !== vendorId) return item;
      return {
        ...item,
        assignedStudentIds: (item.assignedStudentIds || []).filter((id) => id !== studentId),
      };
    }));

    setViewingVendor((prev) => {
      if (!prev || prev.id !== vendorId) return prev;
      return {
        ...prev,
        assignedStudentIds: (prev.assignedStudentIds || []).filter((id) => id !== studentId),
      };
    });

    setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
    toast.success('Assignment removed');
  };

  const toggleStudent = (studentId) => {
    setSelectedStudentIds((prev) => (
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    ));
  };

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Vendor Name', cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    {
      accessorKey: 'type',
      header: 'Vendor Type',
      cell: ({ getValue }) => {
        const value = getValue();
        return vendorTypeOptions.find((opt) => opt.value === value)?.label || normalizeTypeLabel(value);
      },
    },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'email', header: 'Email', cell: ({ getValue }) => getValue() || '—' },
    {
      id: 'assigned_students',
      header: 'Assigned Students',
      accessorFn: (row) => row.assignedStudentIds?.length || 0,
      cell: ({ row }) => {
        const count = row.original.assignedStudentIds?.length || 0;
        return (
          canDo('fees.update') ? (
            <button
              className="text-primary text-sm font-medium hover:underline"
              onClick={() => openAssignModal(row.original)}
            >
              {count} student{count === 1 ? '' : 's'}
            </button>
          ) : (
            <span className="text-sm">{count} student{count === 1 ? '' : 's'}</span>
          )
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <span className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
            value === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
          )}>
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
          {canDo('fees.update') && (
            <button onClick={() => openAssignModal(row.original)} className="rounded p-1.5 hover:bg-accent" title="Assign Students">
              <UserPlus size={14} />
            </button>
          )}
          {canDo('fees.delete') && (
            <button
              onClick={() => {
                setDeletingVendor(row.original);
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
  ], [canDo, vendorTypeOptions]);

  if (!canDo('fees.read')) {
    return <div className="py-20 text-center text-muted-foreground">You don't have permission to view vendors.</div>;
  }

  const currentAssignedStudents = useMemo(() => {
    if (!viewingVendor?.assignedStudentIds?.length) return [];
    return viewingVendor.assignedStudentIds
      .map((id) => studentsById[id])
      .filter(Boolean);
  }, [viewingVendor, studentsById]);

  return (
    <div className="space-y-5">
      <PageHeader title="Vendors" description={`${total} records`} />

      <DataTable
        columns={columns}
        data={pageRows}
        loading={false}
        emptyMessage="No vendors found"
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search vendors..."
        filters={[
          {
            name: 'type',
            label: 'Type',
            value: vendorType,
            onChange: (v) => {
              setVendorType(v);
              setPage(1);
            },
            options: vendorTypeOptions,
          },
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
            <Plus size={14} /> Add Vendor
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
        title={editingVendor ? 'Edit Vendor' : 'Add Vendor'}
        size="lg"
        footer={
          <>
            <button type="button" onClick={closeFormModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
              Cancel
            </button>
            <button type="submit" form="vendor-form" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
              {editingVendor ? 'Update' : 'Save'}
            </button>
          </>
        }
      >
        <form id="vendor-form" onSubmit={saveVendor} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Vendor Name </label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input-base" />
            </div>
            <CreatableSelectField
              label="Vendor Type "
              value={form.type}
              onChange={(value) => setForm((p) => ({ ...p, type: value }))}
              options={vendorTypeOptions}
              placeholder="Select or create vendor type"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone Number </label>
              <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="input-base" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="input-base" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Address</label>
            <textarea value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className="input-base min-h-24" />
          </div>

          <SelectField
            label="Status "
            name="vendor_status"
            value={form.status}
            onChange={(value) => setForm((p) => ({ ...p, status: value }))}
            options={STATUS_OPTIONS}
            required
          />
        </form>
      </AppModal>

      <AppModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingVendor(null);
        }}
        title="View Vendor"
        size="lg"
        footer={<button onClick={() => setViewModalOpen(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Close</button>}
      >
        {viewingVendor && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><p className="text-muted-foreground">Vendor Name</p><p className="font-medium">{viewingVendor.name}</p></div>
              <div><p className="text-muted-foreground">Vendor Type</p><p className="font-medium">{vendorTypeOptions.find((opt) => opt.value === viewingVendor.type)?.label || normalizeTypeLabel(viewingVendor.type)}</p></div>
              <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{viewingVendor.phone || '—'}</p></div>
              <div><p className="text-muted-foreground">Email</p><p className="font-medium">{viewingVendor.email || '—'}</p></div>
              <div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{viewingVendor.status}</p></div>
              <div className="sm:col-span-2"><p className="text-muted-foreground">Address</p><p className="font-medium">{viewingVendor.address || '—'}</p></div>
            </div>

            <div className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold">Assigned Students</p>
                <button
                  onClick={() => openAssignModal(viewingVendor)}
                  className="rounded-md border px-3 py-1.5 text-xs hover:bg-accent"
                >
                  Edit Assignment
                </button>
              </div>

              {currentAssignedStudents.length === 0 ? (
                <p className="text-muted-foreground">No students assigned.</p>
              ) : (
                <div className="space-y-2">
                  {currentAssignedStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <div>
                        <p className="font-medium">{studentDisplayName(student)}</p>
                        <p className="text-xs text-muted-foreground">{student.registration_no || student.roll_no || '—'}</p>
                      </div>
                      <button
                        onClick={() => removeAssignmentFromVendor(viewingVendor.id, student.id)}
                        className="rounded-md border border-destructive/40 px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </AppModal>

      <AppModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingVendor(null);
        }}
        title="Delete Vendor"
        size="sm"
        footer={
          <>
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setDeletingVendor(null);
              }}
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
            >
              Cancel
            </button>
            <button onClick={deleteVendor} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
              Confirm Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">Are you sure you want to delete this item?</p>
      </AppModal>

      <AppModal
        open={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setAssigningVendor(null);
          setSelectedStudentIds([]);
          setAssignmentSearch('');
        }}
        title="Assign Students"
        size="lg"
        footer={
          <>
            <button
              onClick={() => {
                setAssignModalOpen(false);
                setAssigningVendor(null);
                setSelectedStudentIds([]);
                setAssignmentSearch('');
              }}
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
            >
              Cancel
            </button>
            <button onClick={saveAssignment} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Save Assignment
            </button>
          </>
        }
      >
        {assigningVendor && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground">Vendor</p>
                <p className="font-medium">{assigningVendor.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Vendor Type</p>
                <p className="font-medium">{vendorTypeOptions.find((opt) => opt.value === assigningVendor.type)?.label || normalizeTypeLabel(assigningVendor.type)}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Search Students</label>
              <input
                value={assignmentSearch}
                onChange={(e) => setAssignmentSearch(e.target.value)}
                placeholder="Type student name or roll no..."
                className="input-base"
              />
            </div>

            <div className="max-h-72 space-y-2 overflow-auto rounded-lg border p-2">
              {assignmentCandidates.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">No students found.</p>
              ) : (
                assignmentCandidates.map((student) => {
                  const isChecked = selectedStudentIds.includes(student.id);
                  return (
                    <label key={student.id} className="flex cursor-pointer items-start gap-3 rounded-md border p-2 hover:bg-accent/40">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={isChecked}
                        onChange={() => toggleStudent(student.id)}
                      />
                      <div className="text-sm">
                        <p className="font-medium">{studentDisplayName(student)}</p>
                        <p className="text-xs text-muted-foreground">
                          {student.registration_no || student.roll_no || '—'}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <p className="text-xs font-medium text-muted-foreground">
              Selected students: {selectedStudentIds.length}
            </p>
          </div>
        )}
      </AppModal>
    </div>
  );
}
