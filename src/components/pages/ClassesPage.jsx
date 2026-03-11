
// src/components/pages/ClassesPage.jsx
'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Plus, 
  BookOpen, 
  Eye,
  Copy,
  Power 
} from 'lucide-react';

import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import useInstituteConfig from '@/hooks/useInstituteConfig';

// Reusable Components
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatsCard from '@/components/common/StatsCard';
import TableRowActions from '@/components/common/TableRowActions';
import ErrorAlert from '@/components/common/ErrorAlert';
import PageLoader from '@/components/common/PageLoader';
import ClassForm from '@/components/forms/ClassForm';
import SectionHeader from '@/components/common/SectionHeader';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { classService } from '@/services/classService';
import { academicYearService } from '@/services/academicYearService';

export default function ClassesPage({ type }) {
  const queryClient = useQueryClient();
  const { canDo } = useAuthStore();
  const { currentInstitute } = useInstituteStore();
  const { terms } = useInstituteConfig();
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [viewingClass, setViewingClass] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [statusDialog, setStatusDialog] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Get terms based on institute type
  const classTerm = terms?.primary_unit || 'Class';
  const classTermPlural = terms?.primary_units || 'Classes';
  const sectionTerm = terms?.secondary_unit || 'Section';
  const courseTerm = terms?.tertiary_unit || 'Course';

  // Fetch academic years for dropdown
  const { data: academicYears, error: academicYearsError } = useQuery({
    queryKey: ['academic-years-options', currentInstitute?.id],
    queryFn: () => academicYearService.getOptions(currentInstitute?.id, true),
    enabled: !!currentInstitute?.id,
  });

  // Fetch classes
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['classes', currentInstitute?.id, page, pageSize, search, status],
    queryFn: () => classService.getAll({
      institute_id: currentInstitute?.id,
      page,
      limit: pageSize,
      search: search || undefined,
      status: status || undefined,
    }),
    enabled: !!currentInstitute?.id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => classService.create(data),
    onSuccess: () => {
      toast.success(`${classTerm} created successfully`);
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setModalOpen(false);
      setEditingClass(null);
    },
    onError: (error) => {
      toast.error(error.message || `Failed to create ${classTerm.toLowerCase()}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => classService.update(id, data),
    onSuccess: () => {
      toast.success(`${classTerm} updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setModalOpen(false);
      setEditingClass(null);
    },
    onError: (error) => {
      toast.error(error.message || `Failed to update ${classTerm.toLowerCase()}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => classService.delete(id),
    onSuccess: () => {
      toast.success(`${classTerm} deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setDeleteDialog(null);
    },
    onError: (error) => {
      toast.error(error.message || `Failed to delete ${classTerm.toLowerCase()}`);
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => classService.toggleStatus(id, isActive),
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setStatusDialog(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  // Handle form submit
  const handleSubmit = (formData) => {
    if (editingClass && !editingClass.isCopy) {
      updateMutation.mutate({ id: editingClass.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Open add modal
  const openAddModal = () => {
    setEditingClass(null);
    setModalOpen(true);
  };

  // Normalize API data to form field names
  const normalizeForForm = (classItem) => ({
    ...classItem,
    active: classItem.is_active ?? classItem.active ?? true,
    sections: (classItem.sections || []).map(s => ({
      ...s,
      active: s.is_active ?? s.active ?? true,
    })),
    courses: (classItem.courses || []).map(c => ({
      ...c,
      code: c.code || c.course_code || '',
      active: c.is_active ?? c.active ?? true,
      materials: (c.materials || []).map(m => ({
        ...m,
        pdf_url: m.pdf_url || null,  // pass existing Cloudinary URL to form
        active: m.is_active ?? m.active ?? true,
      })),
    })),
  });

  // Open edit modal
  const openEditModal = (classItem) => {
    setEditingClass(normalizeForForm(classItem));
    setModalOpen(true);
  };

  // Open view modal
  const openViewModal = (classItem) => {
    setViewingClass(classItem);
    setActiveTab('overview');
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditingClass(null);
  };

  // Close view modal
  const closeViewModal = () => {
    setViewingClass(null);
    setActiveTab('overview');
  };

  // Handle copy class
  const handleCopyClass = (classItem) => {
    const normalized = normalizeForForm(classItem);
    const newClass = {
      ...normalized,
      id: undefined,
      name: `${classItem.name} (Copy)`,
      active: true,
      isCopy: true,
      sections: normalized.sections.map(s => ({ ...s, id: undefined, class_id: undefined })),
      courses: normalized.courses.map(c => ({
        ...c,
        id: undefined,
        class_id: undefined,
        materials: (c.materials || []).map(m => ({ ...m, id: undefined, course_id: undefined }))
      }))
    };
    setEditingClass(newClass);
    setModalOpen(true);
  };

  // Handle toggle status
  const handleToggleStatus = (classItem) => {
    setStatusDialog(classItem);
  };

  // Table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: `${classTerm} Name`,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {row.original.is_current && (
            <Badge variant="default" className="bg-green-500">Current</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'sections',
      header: sectionTerm,
      cell: ({ row }) => {
        const sections = row.original.sections;
        const count = Array.isArray(sections) ? sections.length : (sections || 0);
        return (
          <span className="text-sm">
            {count} {count === 1 ? sectionTerm.toLowerCase() : `${sectionTerm.toLowerCase()}s`}
          </span>
        );
      },
    },
    {
      accessorKey: 'courses',
      header: courseTerm,
      cell: ({ row }) => {
        const courses = row.original.courses;
        const count = Array.isArray(courses) ? courses.length : (courses || 0);
        return (
          <span className="text-sm">
            {count} {count === 1 ? courseTerm.toLowerCase() : `${courseTerm.toLowerCase()}s`}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.is_active ?? row.original.status === 'active';
        return (
          <Badge variant={isActive ? 'success' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const classItem = row.original;
        const canUpdate = canDo('classes.update');
        const canDelete = canDo('classes.delete');
        
        const extraActions = [];
        
        if (canUpdate) {
          extraActions.push({
            label: 'View Details',
            icon: <Eye className="h-4 w-4" />,
            onClick: () => openViewModal(classItem)
          });
          
          extraActions.push({
            label: 'Copy Class',
            icon: <Copy className="h-4 w-4" />,
            onClick: () => handleCopyClass(classItem)
          });
          
          extraActions.push({
            label: classItem.is_active ? 'Deactivate' : 'Activate',
            icon: <Power className="h-4 w-4" />,
            onClick: () => handleToggleStatus(classItem),
            variant: classItem.is_active ? 'destructive' : 'default'
          });
        }
        
        return (
          <TableRowActions
            onView={() => openViewModal(classItem)}
            onEdit={canUpdate ? () => openEditModal(classItem) : undefined}
            onDelete={canDelete ? () => setDeleteDialog(classItem) : undefined}
            extra={extraActions}
          />
        );
      },
    },
  ], [classTerm, sectionTerm, courseTerm, canDo]);

  // Stats data
  const stats = useMemo(() => {
    const rows = Array.isArray(data?.data) ? data.data : [];
    return {
      total: data?.pagination?.total || rows.length,
      active: rows.filter(c => c.is_active !== false).length,
      inactive: rows.filter(c => c.is_active === false).length,
    };
  }, [data]);

  // Loading state
  if (isLoading && !data) {
    return <PageLoader message={`Loading ${classTermPlural.toLowerCase()}...`} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={classTermPlural}
        description={`Manage ${classTermPlural.toLowerCase()} for your institute`}
        action={
          canDo('classes.create') && (
            <Button onClick={openAddModal} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add {classTerm}
            </Button>
          )
        }
      />

      {/* Error Alerts */}
      <ErrorAlert message={error?.message || academicYearsError?.message} />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          label={`Total ${classTermPlural}`}
          value={stats.total}
          icon={<BookOpen className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          label="Active"
          value={stats.active}
          icon={<BookOpen className="h-4 w-4 text-green-500" />}
          loading={isLoading}
        />
        <StatsCard
          label="Inactive"
          value={stats.inactive}
          icon={<BookOpen className="h-4 w-4 text-gray-500" />}
          loading={isLoading}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        search={search}
        onSearch={setSearch}
        searchPlaceholder={`Search ${classTermPlural.toLowerCase()}...`}
        filters={[
          {
            name: 'status',
            label: 'Status',
            value: status,
            onChange: setStatus,
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
          },
        ]}
        enableColumnVisibility
        exportConfig={{
          fileName: classTermPlural.toLowerCase().replace(/\s+/g, '-'),
          dateField: 'created_at'
        }}
        pagination={{
          page,
          totalPages: data?.pagination?.totalPages || 1,
          onPageChange: setPage,
          total: data?.pagination?.total || 0,
          pageSize,
          onPageSizeChange: setPageSize,
        }}
        emptyMessage={`No ${classTermPlural.toLowerCase()} found`}
      />

      {/* Add/Edit Modal */}
      <AppModal
        open={modalOpen}
        onClose={closeModal}
        title={editingClass ? (editingClass.isCopy ? `Copy ${classTerm}` : `Edit ${classTerm}`) : `Add ${classTerm}`}
        size="xl"
        description={
          editingClass?.isCopy 
            ? `Create a new ${classTerm.toLowerCase()} based on ${editingClass.name}`
            : undefined
        }
      >
        <ClassForm
          key={editingClass?.id || 'new'}
          defaultValues={editingClass || {}}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          loading={createMutation.isPending || updateMutation.isPending}
          academicYearOptions={academicYears?.data || []}
          instituteType={type}
          isEdit={!!editingClass && !editingClass.isCopy}
        />
      </AppModal>

      {/* View Modal */}
      <AppModal
        open={!!viewingClass}
        onClose={closeViewModal}
        title={`${classTerm} Details: ${viewingClass?.name}`}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={closeViewModal}>
              Close
            </Button>
            {canDo('classes.update') && (
              <Button onClick={() => {
                openEditModal(viewingClass);
                closeViewModal();
              }}>
                Edit {classTerm}
              </Button>
            )}
          </div>
        }
      >
        {viewingClass && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sections">{sectionTerm}s</TabsTrigger>
              <TabsTrigger value="courses">{courseTerm}s</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{viewingClass.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={viewingClass.is_active ? 'success' : 'secondary'}>
                    {viewingClass.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {viewingClass.code && (
                  <div>
                    <p className="text-sm text-muted-foreground">Code</p>
                    <p className="font-mono text-sm">{viewingClass.code}</p>
                  </div>
                )}
                {viewingClass.academic_year && (
                  <div>
                    <p className="text-sm text-muted-foreground">Academic Year</p>
                    <p className="text-sm">{viewingClass.academic_year.name}</p>
                  </div>
                )}
                {viewingClass.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm bg-muted/50 p-3 rounded-md">{viewingClass.description}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="sections" className="space-y-4 pt-4">
              {viewingClass.sections && viewingClass.sections.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {viewingClass.sections.map((section, idx) => (
                    <div key={idx} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{section.name}</span>
                        <Badge variant={section.is_active ? 'success' : 'secondary'} size="sm">
                          {section.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {(section.room_no || section.capacity) && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {section.room_no && <span>📍 Room: {section.room_no} </span>}
                          {section.capacity && <span>👥 Capacity: {section.capacity}</span>}
                        </div>
                      )}
                      {section.teacher && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          👨‍🏫 Teacher: {section.teacher.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No {sectionTerm.toLowerCase()}s found
                </p>
              )}
            </TabsContent>

            <TabsContent value="courses" className="space-y-4 pt-4">
              {viewingClass.courses && viewingClass.courses.length > 0 ? (
                <div className="space-y-3">
                  {viewingClass.courses.map((course, idx) => (
                    <div key={idx} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{course.name}</span>
                          {course.code && (
                            <Badge variant="outline" className="ml-2">
                              {course.code}
                            </Badge>
                          )}
                        </div>
                        <Badge variant={course.is_active ? 'success' : 'secondary'} size="sm">
                          {course.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      {course.teacher && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          👨‍🏫 Teacher: {course.teacher.name}
                        </div>
                      )}
                      
                      {course.materials && course.materials.length > 0 && (
                        <div className="mt-3 border-t pt-2">
                          <SectionHeader title="Materials" />
                          <div className="grid grid-cols-2 gap-2">
                            {course.materials.map((material, midx) => (
                              <div key={midx} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                                <span>{material.name}</span>
                                <Badge variant={material.is_active ? 'success' : 'secondary'} size="sm">
                                  {material.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No {courseTerm.toLowerCase()}s found
                </p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </AppModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={() => deleteMutation.mutate(deleteDialog.id)}
        loading={deleteMutation.isPending}
        title={`Delete ${classTerm}`}
        description={
          <>
            Are you sure you want to delete <strong>{deleteDialog?.name}</strong>? 
            This action cannot be undone. All associated sections, courses, and student records will be affected.
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Status Toggle Confirmation */}
      <ConfirmDialog
        open={!!statusDialog}
        onClose={() => setStatusDialog(null)}
        onConfirm={() => toggleStatusMutation.mutate({
          id: statusDialog.id,
          isActive: !statusDialog.is_active
        })}
        loading={toggleStatusMutation.isPending}
        title={statusDialog?.is_active ? `Deactivate ${classTerm}` : `Activate ${classTerm}`}
        description={
          <>
            Are you sure you want to {statusDialog?.is_active ? 'deactivate' : 'activate'} {' '}
            <strong>{statusDialog?.name}</strong>?
          </>
        }
        confirmLabel={statusDialog?.is_active ? 'Deactivate' : 'Activate'}
        variant={statusDialog?.is_active ? 'destructive' : 'default'}
      />
    </div>
  );
}