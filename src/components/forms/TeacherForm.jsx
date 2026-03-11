<<<<<<< HEAD
/**
 * TeacherForm — Create / Edit teacher
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   defaultValues  object
 *   onSubmit       (data) => void
 *   onCancel       () => void
 *   loading        boolean
 *   branchOptions  { value, label }[]
 *   isEdit         boolean
=======
/// ── Teacher Form Component ─────────────────────────────────────────────────
//src/components/forms/TeacherForm.jsx
/**
 * TeacherForm — Create / Edit teacher (Complete Version)
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   defaultValues    object          Pre-filled values for edit mode
 *   onSubmit         (data) => void  Called with form data
 *   onCancel         () => void
 *   loading          boolean
 *   departmentOptions { value, label }[]
 *   designationOptions { value, label }[]
 *   subjectOptions   { value, label }[]
 *   branchOptions    { value, label }[]
 *   isEdit           boolean
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
 */
'use client';

import { useForm } from 'react-hook-form';
<<<<<<< HEAD
=======
import { useState } from 'react';
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
import {
  InputField,
  SelectField,
  TextareaField,
  DatePickerField,
  FormSubmitButton,
} from '@/components/common';
<<<<<<< HEAD
import { Button }    from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
=======
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload } from 'lucide-react';
import { 
  GENDER_OPTIONS, 
  RELIGION_OPTIONS, 
  BLOOD_GROUP_OPTIONS,
  TEACHER_QUALIFICATION_OPTIONS,
  TEACHER_DESIGNATION_OPTIONS,
  TEACHER_DEPARTMENT_OPTIONS,
  TEACHER_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  DOCUMENT_TYPES 
} from '@/constants/index';
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c

export default function TeacherForm({
  defaultValues = {},
  onSubmit,
  onCancel,
<<<<<<< HEAD
  loading       = false,
  branchOptions = [],
  isEdit        = false,
}) {
=======
  loading = false,
  departmentOptions = TEACHER_DEPARTMENT_OPTIONS,
  designationOptions = TEACHER_DESIGNATION_OPTIONS,
  subjectOptions = [],
  branchOptions = [],
  isEdit = false,
}) {
  const [activeTab, setActiveTab] = useState('personal');
  const [selectedSubjects, setSelectedSubjects] = useState(defaultValues.subjects || []);
  const [documents, setDocuments] = useState(defaultValues.documents || []);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount
  useState(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
  const {
    register,
    control,
    handleSubmit,
<<<<<<< HEAD
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Personal */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Personal Information
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField label="First Name"    name="first_name"   register={register} error={errors.first_name}   required placeholder="e.g. Ali"            />
          <InputField label="Last Name"     name="last_name"    register={register} error={errors.last_name}    required placeholder="e.g. Hassan"         />
          <InputField label="Email"         name="email"        register={register} error={errors.email}        type="email" placeholder="teacher@school.com" />
          <InputField label="Phone"         name="phone"        register={register} error={errors.phone}        type="tel"   placeholder="e.g. 03001234567"  />
          <InputField label="Employee ID"   name="employee_id"  register={register} error={errors.employee_id}  placeholder="e.g. EMP-001"                  />
          <InputField label="Qualification" name="qualification" register={register} error={errors.qualification} placeholder="e.g. M.Ed, PhD"              />
        </div>
      </div>

      <Separator />

      {/* Employment */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Employment Details
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePickerField label="Joining Date" name="joining_date" control={control} error={errors.joining_date} />
          <InputField      label="Salary (PKR)" name="salary"       register={register} error={errors.salary}  type="number" placeholder="e.g. 35000" />
          {branchOptions.length > 0 && (
            <SelectField label="Branch" name="branch_id" control={control} error={errors.branch_id} options={branchOptions} placeholder="Select branch" />
          )}
        </div>
        <div className="mt-4">
          <TextareaField label="Address" name="address" register={register} error={errors.address} placeholder="Residential address" rows={2} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
=======
    watch,
    setValue,
    formState: { errors },
  } = useForm({ 
    defaultValues: {
      documents: [],
      subjects: [],
      ...defaultValues,
      details: {
        teacherDetails: {
          ...defaultValues.details?.teacherDetails,
        }
      }
    } 
  });

  // Handle subject selection
  const addSubject = (subjectId) => {
    if (!selectedSubjects.includes(subjectId)) {
      const newSubjects = [...selectedSubjects, subjectId];
      setSelectedSubjects(newSubjects);
      setValue('subjects', newSubjects);
    }
  };

  const removeSubject = (subjectId) => {
    const newSubjects = selectedSubjects.filter(id => id !== subjectId);
    setSelectedSubjects(newSubjects);
    setValue('subjects', newSubjects);
  };

  // Document handlers
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocs = files.map(file => ({
      id: Date.now() + Math.random(),
      type: 'other',
      title: file.name,
      file_name: file.name,
      file_url: URL.createObjectURL(file),
      uploaded_at: new Date().toISOString(),
      verified: false
    }));
    
    const updatedDocs = [...documents, ...newDocs];
    setDocuments(updatedDocs);
    setValue('documents', updatedDocs);
  };

  const removeDocument = (docId) => {
    const updatedDocs = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocs);
    setValue('documents', updatedDocs);
  };

  // Navigation for mobile
  const nextTab = () => {
    const tabs = ['personal', 'professional', 'employment', 'documents'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const prevTab = () => {
    const tabs = ['personal', 'professional', 'employment', 'documents'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const onSubmitForm = (data) => {
    // Format data before submitting
    const formattedData = {
      ...data,
      user_type: 'TEACHER',
      employee_id: data.employee_id,
      details: {
        teacherDetails: {
          // Personal Info
          date_of_birth: data.dob,
          gender: data.gender,
          blood_group: data.blood_group,
          religion: data.religion,
          nationality: data.nationality,
          cnic: data.cnic,
          
          // Professional Info
          qualification: data.qualification,
          specialization: data.specialization,
          experience_years: data.experience_years,
          previous_institution: data.previous_institution,
          subjects: selectedSubjects,
          
          // Employment Info
          employee_id: data.employee_id,
          designation: data.designation,
          department: data.department,
          employment_type: data.employment_type,
          joining_date: data.joining_date,
          contract_start_date: data.contract_start_date,
          contract_end_date: data.contract_end_date,
          salary: data.salary,
          bank_name: data.bank_name,
          bank_account_no: data.bank_account_no,
          bank_branch: data.bank_branch,
          
          // Contact Info
          present_address: data.present_address,
          permanent_address: data.permanent_address,
          city: data.city,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_relation: data.emergency_contact_relation,
          emergency_contact_phone: data.emergency_contact_phone,
          
          // Status
          status: data.status,
          branch_id: data.branch_id,
        }
      },
      documents: documents,
    };
    
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 sm:space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Scrollable tabs */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className={`inline-flex w-auto sm:grid ${isMobile ? 'flex-nowrap' : 'grid-cols-4'} mb-4 sm:mb-6`}>
            <TabsTrigger value="personal" className="px-3 sm:px-4">Personal</TabsTrigger>
            <TabsTrigger value="professional" className="px-3 sm:px-4">Professional</TabsTrigger>
            <TabsTrigger value="employment" className="px-3 sm:px-4">Employment</TabsTrigger>
            <TabsTrigger value="documents" className="px-3 sm:px-4">Documents</TabsTrigger>
          </TabsList>
        </div>

        {/* Mobile Navigation */}
        {isMobile && (
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={prevTab}
              disabled={activeTab === 'personal'}
            >
              Previous
            </Button>
            <span className="text-sm font-medium capitalize">
              {activeTab}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={nextTab}
              disabled={activeTab === 'documents'}
            >
              Next
            </Button>
          </div>
        )}

        {/* Tab 1: Personal Information */}
        <TabsContent value="personal">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Basic Information
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InputField 
                    label="First Name" 
                    name="first_name" 
                    register={register} 
                    error={errors.first_name} 
                    required 
                    placeholder="Ahmed" 
                  />
                  <InputField 
                    label="Last Name"  
                    name="last_name"  
                    register={register} 
                    error={errors.last_name}  
                    required 
                    placeholder="Hassan" 
                  />
                  <InputField 
                    label="Employee ID"  
                    name="employee_id"  
                    register={register} 
                    error={errors.employee_id}  
                    required 
                    placeholder="TCH-2024-001" 
                  />
                  <DatePickerField 
                    label="Date of Birth" 
                    name="dob" 
                    control={control} 
                    error={errors.dob} 
                    required
                  />
                  <SelectField 
                    label="Gender"    
                    name="gender"     
                    control={control}   
                    error={errors.gender}     
                    options={GENDER_OPTIONS} 
                    placeholder="Select" 
                    required
                  />
                  <SelectField 
                    label="Blood Group" 
                    name="blood_group" 
                    control={control} 
                    error={errors.blood_group} 
                    options={BLOOD_GROUP_OPTIONS} 
                    placeholder="Select" 
                  />
                  <SelectField 
                    label="Religion" 
                    name="religion" 
                    control={control} 
                    error={errors.religion} 
                    options={RELIGION_OPTIONS} 
                    placeholder="Select" 
                  />
                  <InputField 
                    label="Nationality" 
                    name="nationality" 
                    register={register} 
                    error={errors.nationality} 
                    placeholder="Pakistani" 
                    defaultValue="Pakistani"
                  />
                  <InputField 
                    label="CNIC" 
                    name="cnic" 
                    register={register} 
                    error={errors.cnic} 
                    placeholder="00000-0000000-0" 
                  />
                </div>

                <Separator className="my-3 sm:my-4" />

                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Contact Information
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                  <InputField 
                    label="Email Address" 
                    name="email" 
                    register={register} 
                    error={errors.email} 
                    required 
                    placeholder="teacher@school.com" 
                    type="email"
                  />
                  <InputField 
                    label="Phone Number" 
                    name="phone" 
                    register={register} 
                    error={errors.phone} 
                    required 
                    placeholder="03001234567" 
                    type="tel"
                  />
                  <InputField 
                    label="Alternate Phone" 
                    name="alternate_phone" 
                    register={register} 
                    error={errors.alternate_phone} 
                    placeholder="03123456789" 
                    type="tel"
                  />
                  <InputField 
                    label="City" 
                    name="city" 
                    register={register} 
                    error={errors.city} 
                    required 
                    placeholder="Karachi" 
                  />
                </div>

                <TextareaField 
                  label="Present Address" 
                  name="present_address" 
                  register={register} 
                  error={errors.present_address} 
                  required 
                  placeholder="Full residential address" 
                  rows={2} 
                />

                <TextareaField 
                  label="Permanent Address" 
                  name="permanent_address" 
                  register={register} 
                  error={errors.permanent_address} 
                  placeholder="If different from present address" 
                  rows={2} 
                />

                <Separator className="my-3 sm:my-4" />

                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Emergency Contact
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
                  <InputField 
                    label="Contact Person" 
                    name="emergency_contact_name" 
                    register={register} 
                    error={errors.emergency_contact_name} 
                    placeholder="Kamran Khan" 
                  />
                  <InputField 
                    label="Relation" 
                    name="emergency_contact_relation" 
                    register={register} 
                    error={errors.emergency_contact_relation} 
                    placeholder="Brother" 
                  />
                  <InputField 
                    label="Emergency Phone" 
                    name="emergency_contact_phone" 
                    register={register} 
                    error={errors.emergency_contact_phone} 
                    placeholder="03001234567" 
                    type="tel"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Professional Information */}
        <TabsContent value="professional">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Qualifications & Experience
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <SelectField 
                    label="Highest Qualification" 
                    name="qualification" 
                    control={control} 
                    error={errors.qualification} 
                    options={TEACHER_QUALIFICATION_OPTIONS} 
                    placeholder="Select" 
                    required
                  />
                  <InputField 
                    label="Specialization" 
                    name="specialization" 
                    register={register} 
                    error={errors.specialization} 
                    placeholder="e.g. Mathematics" 
                  />
                  <InputField 
                    label="Experience (Years)" 
                    name="experience_years" 
                    register={register} 
                    error={errors.experience_years} 
                    type="number" 
                    placeholder="5" 
                  />
                  <InputField 
                    label="Previous Institution" 
                    name="previous_institution" 
                    register={register} 
                    error={errors.previous_institution} 
                    placeholder="Last school/college" 
                    className="sm:col-span-2"
                  />
                </div>

                <Separator className="my-3 sm:my-4" />

                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Subjects
                </p>
                
                {/* Subject Selection */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <SelectField 
                      label="Add Subject" 
                      name="subject_selector" 
                      control={control} 
                      options={subjectOptions} 
                      placeholder="Select subject" 
                      onChange={(value) => addSubject(value)}
                    />
                  </div>

                  {/* Selected Subjects */}
                  {selectedSubjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedSubjects.map((subjectId) => {
                        const subject = subjectOptions.find(s => s.value === subjectId);
                        return (
                          <Badge key={subjectId} variant="secondary" className="px-3 py-1">
                            {subject?.label || subjectId}
                            <button
                              type="button"
                              onClick={() => removeSubject(subjectId)}
                              className="ml-2 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No subjects selected</p>
                  )}
                </div>

                <Separator className="my-3 sm:my-4" />

                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Professional Details
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                  <InputField 
                    label="Professional Certifications" 
                    name="certifications" 
                    register={register} 
                    error={errors.certifications} 
                    placeholder="e.g. NTS, BPSTP" 
                  />
                  <InputField 
                    label="Languages Known" 
                    name="languages" 
                    register={register} 
                    error={errors.languages} 
                    placeholder="Urdu, English" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Employment Information */}
        <TabsContent value="employment">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Employment Details
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <SelectField 
                    label="Designation" 
                    name="designation" 
                    control={control} 
                    error={errors.designation} 
                    options={designationOptions} 
                    placeholder="Select" 
                    required
                  />
                  <SelectField 
                    label="Department" 
                    name="department" 
                    control={control} 
                    error={errors.department} 
                    options={departmentOptions} 
                    placeholder="Select" 
                    required
                  />
                  <SelectField 
                    label="Employment Type" 
                    name="employment_type" 
                    control={control} 
                    error={errors.employment_type} 
                    options={EMPLOYMENT_TYPE_OPTIONS} 
                    placeholder="Select" 
                    required
                  />
                  <DatePickerField 
                    label="Joining Date" 
                    name="joining_date" 
                    control={control} 
                    error={errors.joining_date} 
                    required
                  />
                  <DatePickerField 
                    label="Contract Start" 
                    name="contract_start_date" 
                    control={control} 
                    error={errors.contract_start_date} 
                  />
                  <DatePickerField 
                    label="Contract End" 
                    name="contract_end_date" 
                    control={control} 
                    error={errors.contract_end_date} 
                  />
                  <InputField 
                    label="Monthly Salary (PKR)" 
                    name="salary" 
                    register={register} 
                    error={errors.salary} 
                    type="number" 
                    placeholder="50000" 
                  />
                  <SelectField 
                    label="Status" 
                    name="status" 
                    control={control} 
                    error={errors.status} 
                    options={TEACHER_STATUS_OPTIONS} 
                    placeholder="Select" 
                  />
                  {branchOptions.length > 0 && (
                    <SelectField 
                      label="Branch" 
                      name="branch_id" 
                      control={control} 
                      error={errors.branch_id} 
                      options={branchOptions} 
                      placeholder="Select" 
                    />
                  )}
                </div>

                <Separator className="my-3 sm:my-4" />

                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Bank Details
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InputField 
                    label="Bank Name" 
                    name="bank_name" 
                    register={register} 
                    error={errors.bank_name} 
                    placeholder="e.g. HBL" 
                  />
                  <InputField 
                    label="Account Number" 
                    name="bank_account_no" 
                    register={register} 
                    error={errors.bank_account_no} 
                    placeholder="1234567890" 
                  />
                  <InputField 
                    label="Branch" 
                    name="bank_branch" 
                    register={register} 
                    error={errors.bank_branch} 
                    placeholder="Main Branch" 
                  />
                </div>

                <Separator className="my-3 sm:my-4" />

                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Work Schedule
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                  <InputField 
                    label="Timing" 
                    name="timing" 
                    register={register} 
                    error={errors.timing} 
                    placeholder="8:00 AM - 2:00 PM" 
                  />
                  <InputField 
                    label="Working Days" 
                    name="working_days" 
                    register={register} 
                    error={errors.working_days} 
                    placeholder="Monday - Friday" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Documents */}
        <TabsContent value="documents">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Uploaded Documents
                  </p>
                  <div className="w-full sm:w-auto">
                    <input
                      type="file"
                      id="document-upload"
                      multiple
                      className="hidden"
                      onChange={handleDocumentUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('document-upload').click()}
                      className="w-full sm:w-auto"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                  </div>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 border-2 border-dashed rounded-lg">
                    <p className="text-sm sm:text-base text-muted-foreground">No documents uploaded yet</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Upload certificates, degrees, CNIC, etc.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {documents.map((doc, index) => (
                      <div key={doc.id || index} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium truncate">{doc.file_name || 'Document'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(doc.id)}
                          className="ml-2 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <SelectField 
                  label="Document Type" 
                  name="next_document_type" 
                  control={control} 
                  options={DOCUMENT_TYPES} 
                  placeholder="Select type" 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
        <FormSubmitButton
          loading={loading}
          label={isEdit ? 'Save Changes' : 'Add Teacher'}
          loadingLabel={isEdit ? 'Saving…' : 'Adding…'}
<<<<<<< HEAD
=======
          className="w-full sm:w-auto"
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
        />
      </div>
    </form>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
