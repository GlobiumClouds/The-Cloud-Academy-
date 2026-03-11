<<<<<<< HEAD
/**
 * StudentForm — Create / Edit student
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   defaultValues      object          Pre-filled values for edit mode
 *   onSubmit           (data) => void  Called with form data
 *   onCancel           () => void
 *   loading            boolean
 *   classOptions       { value, label }[]
 *   sectionOptions     { value, label }[]
 *   academicYearOptions{ value, label }[]
 *   isEdit             boolean
=======
// ── Student Form Component ─────────────────────────────────────────────────
// src/components/forms/StudentForm.jsx
// /**
//  * StudentForm — Create / Edit student
//  * ─────────────────────────────────────────────────────────────────
//  * Props:
//  *   defaultValues      object          Pre-filled values for edit mode
//  *   onSubmit           (data) => void  Called with form data
//  *   onCancel           () => void
//  *   loading            boolean
//  *   classOptions       { value, label }[]
//  *   sectionOptions     { value, label }[]
//  *   academicYearOptions { value, label }[]
//  *   courseOptions      { value, label }[] (for coaching/academy)
//  *   batchOptions       { value, label }[] (for coaching/academy)
//  *   programOptions     { value, label }[] (for college/university)
//  *   instituteType      string           'school' | 'coaching' | 'academy' | 'college' | 'university' | 'tuition_center'
//  *   isEdit             boolean
//  */
/**
 * StudentForm — Create / Edit student (Fully Responsive)
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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
<<<<<<< HEAD

const GENDER_OPTIONS = [
  { value: 'male',   label: 'Male'   },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other'  },
];
=======
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, X, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { GENDER_OPTIONS, RELIGION_OPTIONS, BLOOD_GROUP_OPTIONS, DOCUMENT_TYPES } from '@/constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c

export default function StudentForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  loading = false,
<<<<<<< HEAD
  classOptions       = [],
  sectionOptions     = [],
  academicYearOptions = [],
  isEdit = false,
}) {
=======
  classOptions = [],
  sectionOptions = [],
  academicYearOptions = [],
  courseOptions = [],
  batchOptions = [],
  programOptions = [],
  instituteType = 'school',
  isEdit = false,
}) {
  const [activeTab, setActiveTab] = useState('personal');
  const [documents, setDocuments] = useState(defaultValues.documents || []);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
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

      {/* Personal Info */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Personal Information
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField label="First Name" name="first_name" register={register} error={errors.first_name} required placeholder="e.g. Ahmed" />
          <InputField label="Last Name"  name="last_name"  register={register} error={errors.last_name}  required placeholder="e.g. Ali" />
          <InputField label="GR Number"  name="gr_number"  register={register} error={errors.gr_number}  placeholder="e.g. 2024-001" />
          <SelectField label="Gender"    name="gender"     control={control}   error={errors.gender}     options={GENDER_OPTIONS} placeholder="Select gender" />
          <DatePickerField label="Date of Birth" name="dob" control={control} error={errors.dob} />
        </div>
      </div>

      <Separator />

      {/* Academic */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Academic Details
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField label="Academic Year" name="academic_year_id" control={control} error={errors.academic_year_id} options={academicYearOptions} placeholder="Select year"    />
          <SelectField label="Class"         name="class_id"         control={control} error={errors.class_id}         options={classOptions}        placeholder="Select class"   />
          <SelectField label="Section"       name="section_id"       control={control} error={errors.section_id}       options={sectionOptions}      placeholder="Select section" />
        </div>
      </div>

      <Separator />

      {/* Guardian */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Guardian Details
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField label="Guardian Name"  name="guardian_name"  register={register} error={errors.guardian_name}  placeholder="e.g. Muhammad Ali" />
          <InputField label="Guardian Phone" name="guardian_phone" register={register} error={errors.guardian_phone} placeholder="e.g. 03001234567"   type="tel" />
        </div>
        <div className="mt-4">
          <TextareaField label="Address" name="address" register={register} error={errors.address} placeholder="Full residential address" rows={2} />
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
      ...defaultValues,
      details: {
        studentDetails: {
          ...defaultValues.details?.studentDetails,
        }
      }
    } 
  });

  // Mobile tab navigation
  const nextTab = () => {
    const tabs = ['personal', 'academic', 'guardian', 'contact', 'fee', 'documents'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const prevTab = () => {
    const tabs = ['personal', 'academic', 'guardian', 'contact', 'fee', 'documents'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
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

  // Render academic fields based on institute type
  const renderAcademicFields = () => {
    const fieldClass = isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3';
    
    switch(instituteType) {
      case 'school':
        return (
          <div className={`grid grid-cols-1 gap-4 ${isMobile ? '' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            <SelectField 
              label="Class" 
              name="details.studentDetails.class_id" 
              control={control} 
              error={errors.details?.studentDetails?.class_id} 
              options={classOptions} 
              placeholder="Select class" 
              required
            />
            <SelectField 
              label="Section" 
              name="details.studentDetails.section_id" 
              control={control} 
              error={errors.details?.studentDetails?.section_id} 
              options={sectionOptions} 
              placeholder="Select section" 
            />
            <InputField 
              label="House" 
              name="details.studentDetails.house" 
              register={register} 
              error={errors.details?.studentDetails?.house} 
              placeholder="e.g. Iqbal House" 
            />
            <InputField 
              label="Previous School" 
              name="details.studentDetails.previous_school" 
              register={register} 
              error={errors.details?.studentDetails?.previous_school} 
              placeholder="Previous school name" 
            />
          </div>
        );
      
      case 'college':
      case 'university':
        return (
          <div className={`grid grid-cols-1 gap-4 ${isMobile ? '' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            <SelectField 
              label="Program" 
              name="details.studentDetails.program_id" 
              control={control} 
              error={errors.details?.studentDetails?.program_id} 
              options={programOptions} 
              placeholder="Select program" 
              required
            />
            <SelectField 
              label="Semester" 
              name="details.studentDetails.semester" 
              control={control} 
              error={errors.details?.studentDetails?.semester} 
              options={Array.from({ length: 8 }, (_, i) => ({ value: i+1, label: `Semester ${i+1}` }))} 
              placeholder="Select semester" 
            />
            <SelectField 
              label="Shift" 
              name="details.studentDetails.shift" 
              control={control} 
              error={errors.details?.studentDetails?.shift} 
              options={[
                { value: 'morning', label: 'Morning' },
                { value: 'evening', label: 'Evening' }
              ]} 
              placeholder="Select shift" 
            />
            <InputField 
              label="Specialization" 
              name="details.studentDetails.specialization" 
              register={register} 
              error={errors.details?.studentDetails?.specialization} 
              placeholder="e.g. Computer Science" 
            />
          </div>
        );
      
      case 'coaching':
      case 'academy':
        return (
          <div className={`grid grid-cols-1 gap-4 ${isMobile ? '' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            <SelectField 
              label="Course" 
              name="details.studentDetails.course_id" 
              control={control} 
              error={errors.details?.studentDetails?.course_id} 
              options={courseOptions} 
              placeholder="Select course" 
              required
            />
            <SelectField 
              label="Batch" 
              name="details.studentDetails.batch_id" 
              control={control} 
              error={errors.details?.studentDetails?.batch_id} 
              options={batchOptions} 
              placeholder="Select batch" 
            />
            <InputField 
              label="Target Exam" 
              name="details.studentDetails.target_exam" 
              register={register} 
              error={errors.details?.studentDetails?.target_exam} 
              placeholder="e.g. MDCAT, CSS" 
            />
          </div>
        );
      
      case 'tuition_center':
        return (
          <div className={`grid grid-cols-1 gap-4 ${isMobile ? '' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            <InputField 
              label="Grade/Class" 
              name="details.studentDetails.grade" 
              register={register} 
              error={errors.details?.studentDetails?.grade} 
              placeholder="e.g. 10th, A-Levels" 
              required
            />
            <SelectField 
              label="Tuition Type" 
              name="details.studentDetails.tuition_type" 
              control={control} 
              error={errors.details?.studentDetails?.tuition_type} 
              options={[
                { value: 'individual', label: 'Individual' },
                { value: 'group', label: 'Group' }
              ]} 
              placeholder="Select type" 
            />
            <InputField 
              label="Subjects" 
              name="details.studentDetails.subjects" 
              register={register} 
              error={errors.details?.studentDetails?.subjects} 
              placeholder="e.g. Math, Physics" 
            />
            <InputField 
              label="Preferred Timings" 
              name="details.studentDetails.timings" 
              register={register} 
              error={errors.details?.studentDetails?.timings} 
              placeholder="e.g. 4-6 PM" 
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const onSubmitForm = (data) => {
    const formattedData = {
      ...data,
      user_type: 'STUDENT',
      registration_no: data.registration_no || data.gr_number,
      details: {
        studentDetails: {
          ...data.details?.studentDetails,
          date_of_birth: data.dob,
          gender: data.gender,
          blood_group: data.blood_group,
          religion: data.religion,
          nationality: data.nationality,
          cnic: data.cnic,
          father_name: data.father_name,
          father_cnic: data.father_cnic,
          father_phone: data.father_phone,
          father_occupation: data.father_occupation,
          mother_name: data.mother_name,
          mother_phone: data.mother_phone,
          guardian_name: data.guardian_name,
          guardian_relation: data.guardian_relation,
          guardian_phone: data.guardian_phone,
          present_address: data.present_address,
          permanent_address: data.permanent_address,
          city: data.city,
          medical_conditions: data.medical_conditions,
          allergies: data.allergies,
          fee_plan_id: data.fee_plan_id,
          monthly_fee: data.monthly_fee,
          concession_type: data.concession_type,
          concession_percentage: data.concession_percentage,
          admission_date: data.admission_date,
          previous_school: data.previous_school,
        }
      },
      documents: documents,
    };
    
    onSubmit(formattedData);
  };

  // Responsive tabs list - horizontal scroll on mobile
  const renderTabsList = () => {
    if (isMobile) {
      return (
        <div className="overflow-x-auto pb-2 mb-4">
          <TabsList className="inline-flex w-auto min-w-full">
            <TabsTrigger value="personal" className="px-3 py-1.5 text-xs">Personal</TabsTrigger>
            <TabsTrigger value="academic" className="px-3 py-1.5 text-xs">Academic</TabsTrigger>
            <TabsTrigger value="guardian" className="px-3 py-1.5 text-xs">Guardian</TabsTrigger>
            <TabsTrigger value="contact" className="px-3 py-1.5 text-xs">Contact</TabsTrigger>
            <TabsTrigger value="fee" className="px-3 py-1.5 text-xs">Fee</TabsTrigger>
            <TabsTrigger value="documents" className="px-3 py-1.5 text-xs">Docs</TabsTrigger>
          </TabsList>
        </div>
      );
    }
    
    return (
      <TabsList className={`grid grid-cols-6 mb-6 ${isTablet ? 'text-sm' : ''}`}>
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="academic">Academic</TabsTrigger>
        <TabsTrigger value="guardian">Guardian</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
        <TabsTrigger value="fee">Fee</TabsTrigger>
        <TabsTrigger value="documents">Docs</TabsTrigger>
      </TabsList>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 sm:space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {renderTabsList()}

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
                    placeholder="e.g. Ahmed" 
                  />
                  <InputField 
                    label="Last Name"  
                    name="last_name"  
                    register={register} 
                    error={errors.last_name}  
                    required 
                    placeholder="e.g. Ali" 
                  />
                  <InputField 
                    label="GR/Reg No"  
                    name="registration_no"  
                    register={register} 
                    error={errors.registration_no}  
                    required 
                    placeholder="e.g. 2024-001" 
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
                    placeholder="Select gender" 
                    required
                  />
                  <SelectField 
                    label="Blood Group" 
                    name="blood_group" 
                    control={control} 
                    error={errors.blood_group} 
                    options={BLOOD_GROUP_OPTIONS} 
                    placeholder="Select blood group" 
                  />
                  <SelectField 
                    label="Religion" 
                    name="religion" 
                    control={control} 
                    error={errors.religion} 
                    options={RELIGION_OPTIONS} 
                    placeholder="Select religion" 
                  />
                  <InputField 
                    label="Nationality" 
                    name="nationality" 
                    register={register} 
                    error={errors.nationality} 
                    placeholder="e.g. Pakistani" 
                    defaultValue="Pakistani"
                  />
                  <InputField 
                    label="CNIC/B-Form" 
                    name="cnic" 
                    register={register} 
                    error={errors.cnic} 
                    placeholder="00000-0000000-0" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Academic Information */}
        <TabsContent value="academic">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Academic Details ({instituteType.replace('_', ' ').toUpperCase()})
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <SelectField 
                    label="Academic Year" 
                    name="details.studentDetails.academic_year_id" 
                    control={control} 
                    error={errors.details?.studentDetails?.academic_year_id} 
                    options={academicYearOptions} 
                    placeholder="Select year"    
                    required
                  />
                  <DatePickerField 
                    label="Admission Date" 
                    name="admission_date" 
                    control={control} 
                    error={errors.admission_date} 
                    required
                  />
                  <InputField 
                    label="Roll Number" 
                    name="details.studentDetails.roll_no" 
                    register={register} 
                    error={errors.details?.studentDetails?.roll_no} 
                    placeholder="e.g. 101" 
                  />
                </div>
                
                {/* Institute-specific academic fields */}
                {renderAcademicFields()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Guardian Information */}
        <TabsContent value="guardian">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Father's Information
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InputField 
                    label="Father's Name" 
                    name="father_name" 
                    register={register} 
                    error={errors.father_name} 
                    required 
                    placeholder="e.g. Muhammad Ahmed" 
                  />
                  <InputField 
                    label="Father's CNIC" 
                    name="father_cnic" 
                    register={register} 
                    error={errors.father_cnic} 
                    placeholder="00000-0000000-0" 
                  />
                  <InputField 
                    label="Father's Phone" 
                    name="father_phone" 
                    register={register} 
                    error={errors.father_phone} 
                    required 
                    placeholder="e.g. 03001234567" 
                    type="tel"
                  />
                  <InputField 
                    label="Father's Occupation" 
                    name="father_occupation" 
                    register={register} 
                    error={errors.father_occupation} 
                    placeholder="e.g. Businessman" 
                  />
                  <InputField 
                    label="Father's Education" 
                    name="father_education" 
                    register={register} 
                    error={errors.father_education} 
                    placeholder="e.g. Masters" 
                  />
                </div>

                <Separator className="my-4" />

                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Mother's Information
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InputField 
                    label="Mother's Name" 
                    name="mother_name" 
                    register={register} 
                    error={errors.mother_name} 
                    placeholder="e.g. Fatima Ahmed" 
                  />
                  <InputField 
                    label="Mother's CNIC" 
                    name="mother_cnic" 
                    register={register} 
                    error={errors.mother_cnic} 
                    placeholder="00000-0000000-0" 
                  />
                  <InputField 
                    label="Mother's Phone" 
                    name="mother_phone" 
                    register={register} 
                    error={errors.mother_phone} 
                    placeholder="e.g. 03001234567" 
                    type="tel"
                  />
                  <InputField 
                    label="Mother's Occupation" 
                    name="mother_occupation" 
                    register={register} 
                    error={errors.mother_occupation} 
                    placeholder="e.g. Housewife" 
                  />
                </div>

                <Separator className="my-4" />

                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Guardian Information
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InputField 
                    label="Guardian Name" 
                    name="guardian_name" 
                    register={register} 
                    error={errors.guardian_name} 
                    placeholder="e.g. Aslam Khan" 
                  />
                  <InputField 
                    label="Relation" 
                    name="guardian_relation" 
                    register={register} 
                    error={errors.guardian_relation} 
                    placeholder="e.g. Uncle" 
                  />
                  <InputField 
                    label="Guardian Phone" 
                    name="guardian_phone" 
                    register={register} 
                    error={errors.guardian_phone} 
                    placeholder="e.g. 03001234567" 
                    type="tel"
                  />
                  <InputField 
                    label="Guardian CNIC" 
                    name="guardian_cnic" 
                    register={register} 
                    error={errors.guardian_cnic} 
                    placeholder="00000-0000000-0" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Contact Information */}
        <TabsContent value="contact">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Contact Details
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                  <InputField 
                    label="Phone Number" 
                    name="phone" 
                    register={register} 
                    error={errors.phone} 
                    required 
                    placeholder="e.g. 03001234567" 
                    type="tel"
                  />
                  <InputField 
                    label="Email Address" 
                    name="email" 
                    register={register} 
                    error={errors.email} 
                    placeholder="e.g. student@example.com" 
                    type="email"
                  />
                  <InputField 
                    label="Alternate Phone" 
                    name="alternate_phone" 
                    register={register} 
                    error={errors.alternate_phone} 
                    placeholder="e.g. 03123456789" 
                    type="tel"
                  />
                  <InputField 
                    label="City" 
                    name="city" 
                    register={register} 
                    error={errors.city} 
                    required 
                    placeholder="e.g. Karachi" 
                  />
                  <InputField 
                    label="Postal Code" 
                    name="postal_code" 
                    register={register} 
                    error={errors.postal_code} 
                    placeholder="e.g. 75500" 
                  />
                </div>

                <TextareaField 
                  label="Present Address" 
                  name="present_address" 
                  register={register} 
                  error={errors.present_address} 
                  required 
                  placeholder="Full residential address" 
                  rows={isMobile ? 2 : 2} 
                />

                <TextareaField 
                  label="Permanent Address" 
                  name="permanent_address" 
                  register={register} 
                  error={errors.permanent_address} 
                  placeholder="If different from present address" 
                  rows={isMobile ? 2 : 2} 
                />

                <Separator className="my-4" />

                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Emergency Contact
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InputField 
                    label="Contact Person" 
                    name="emergency_contact_name" 
                    register={register} 
                    error={errors.emergency_contact_name} 
                    placeholder="e.g. Kamran Khan" 
                  />
                  <InputField 
                    label="Relation" 
                    name="emergency_contact_relation" 
                    register={register} 
                    error={errors.emergency_contact_relation} 
                    placeholder="e.g. Brother" 
                  />
                  <InputField 
                    label="Emergency Phone" 
                    name="emergency_contact_phone" 
                    register={register} 
                    error={errors.emergency_contact_phone} 
                    placeholder="e.g. 03001234567" 
                    type="tel"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Fee Information */}
        <TabsContent value="fee">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Fee Details
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InputField 
                    label="Fee Plan" 
                    name="fee_plan_id" 
                    register={register} 
                    error={errors.fee_plan_id} 
                    placeholder="Select fee plan" 
                  />
                  <InputField 
                    label="Monthly Fee (PKR)" 
                    name="monthly_fee" 
                    register={register} 
                    error={errors.monthly_fee} 
                    type="number" 
                    placeholder="e.g. 5000" 
                  />
                  <InputField 
                    label="Admission Fee" 
                    name="admission_fee" 
                    register={register} 
                    error={errors.admission_fee} 
                    type="number" 
                    placeholder="e.g. 2000" 
                  />
                  <SelectField 
                    label="Concession Type" 
                    name="concession_type" 
                    control={control} 
                    error={errors.concession_type} 
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'scholarship', label: 'Scholarship' },
                      { value: 'discount', label: 'Discount' },
                      { value: 'waiver', label: 'Fee Waiver' }
                    ]} 
                    placeholder="Select type" 
                  />
                  <InputField 
                    label="Concession %" 
                    name="concession_percentage" 
                    register={register} 
                    error={errors.concession_percentage} 
                    type="number" 
                    placeholder="e.g. 20" 
                  />
                  <TextareaField 
                    label="Concession Reason" 
                    name="concession_reason" 
                    register={register} 
                    error={errors.concession_reason} 
                    placeholder="Reason for concession" 
                    rows={isMobile ? 1 : 1} 
                  />
                </div>

                <Separator className="my-4" />

                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Medical Information
                </p>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <TextareaField 
                    label="Medical Conditions" 
                    name="medical_conditions" 
                    register={register} 
                    error={errors.medical_conditions} 
                    placeholder="Any medical conditions" 
                    rows={isMobile ? 2 : 2} 
                  />
                  <TextareaField 
                    label="Allergies" 
                    name="allergies" 
                    register={register} 
                    error={errors.allergies} 
                    placeholder="Any allergies" 
                    rows={isMobile ? 2 : 2} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Documents */}
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
                      size={isMobile ? "default" : "sm"}
                      className="w-full sm:w-auto"
                      onClick={() => document.getElementById('document-upload').click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                  </div>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click the button above to upload
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {documents.map((doc, index) => (
                      <div key={doc.id || index} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="font-medium text-sm truncate">{doc.file_name || doc.title || 'Document'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(doc.id)}
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
                  placeholder="Select document type" 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="flex justify-between items-center gap-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={prevTab}
            disabled={activeTab === 'personal'}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </span>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={nextTab}
            disabled={activeTab === 'documents'}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
        <FormSubmitButton
          loading={loading}
          label={isEdit ? 'Save Changes' : 'Add Student'}
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
