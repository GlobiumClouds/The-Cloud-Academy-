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
 */
'use client';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { academicYearService, classService, sectionService } from '@/services';
import {
  InputField,
  SelectField,
  TextareaField,
  DatePickerField,
  FormSubmitButton,
} from '@/components/common';
import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, X, Upload, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { toast } from 'sonner';
import { GENDER_OPTIONS, RELIGION_OPTIONS, BLOOD_GROUP_OPTIONS, DOCUMENT_TYPES } from '@/constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function StudentForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  loading = false,
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
  const [guardianType, setGuardianType] = useState(
    defaultValues.guardian_name || defaultValues.details?.studentDetails?.guardian_name
      ? 'guardian'
      : 'parent'
  );
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(
    defaultValues.profile_image && typeof defaultValues.profile_image === 'string'
      ? defaultValues.profile_image
      : defaultValues.photo_url || null
  );
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const dt = defaultValues.details?.studentDetails || {};
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      documents: [],
      ...defaultValues,
      dob: defaultValues.dob || defaultValues.date_of_birth || dt.date_of_birth || dt.dob,
      gender: defaultValues.gender || dt.gender,
      blood_group: defaultValues.blood_group || dt.blood_group,
      religion: defaultValues.religion || dt.religion,
      nationality: defaultValues.nationality || dt.nationality,
      cnic: defaultValues.cnic || dt.cnic,
      father_name: defaultValues.father_name || dt.father_name,
      father_cnic: defaultValues.father_cnic || dt.father_cnic,
      father_phone: defaultValues.father_phone || dt.father_phone,
      father_occupation: defaultValues.father_occupation || dt.father_occupation,
      mother_name: defaultValues.mother_name || dt.mother_name,
      mother_phone: defaultValues.mother_phone || dt.mother_phone,
      mother_occupation: defaultValues.mother_occupation || dt.mother_occupation,
      guardian_name: defaultValues.guardian_name || dt.guardian_name,
      guardian_relation: defaultValues.guardian_relation || dt.guardian_relation,
      guardian_phone: defaultValues.guardian_phone || dt.guardian_phone,
      guardian_cnic: defaultValues.guardian_cnic || dt.guardian_cnic,
      present_address: defaultValues.present_address || dt.present_address,
      permanent_address: defaultValues.permanent_address || dt.permanent_address,
      city: defaultValues.city || dt.city,
      registration_no: defaultValues.registration_no || defaultValues.gr_number || dt.registration_no,
      admission_date: defaultValues.admission_date || dt.admission_date,
      phone: defaultValues.phone || dt.phone,
      alternate_phone: defaultValues.alternate_phone || dt.alternate_phone,
      details: {
        studentDetails: {
          ...defaultValues.details?.studentDetails,
        }
      }
    }
  });

  const { currentInstitute } = useInstituteStore();
  const instituteId = currentInstitute?.id || useAuthStore((s) => s.user?.institute_id);

  const watchAcademicYearId = watch('details.studentDetails.academic_year_id');
  const watchClassId = watch('details.studentDetails.class_id');

  // Fetch Academic Years directly from API
  const { data: fetchedAcademicYears = [] } = useQuery({
    queryKey: ['form-academicYears', instituteId],
    queryFn: async () => {
      const res = await academicYearService.getAll({ institute_id: instituteId, limit: 100 });
      const items = Array.isArray(res) ? res : (res?.data || []);
      // We keep the is_current property so we can auto-select it later
      return items.map(y => ({ value: y.id, label: y.name, is_current: y.is_current }));
    },
    enabled: !!instituteId,
  });

  // Auto-select the current academic year if none is selected
  useEffect(() => {
    if (!isEdit && !watchAcademicYearId && fetchedAcademicYears.length > 0) {
      const currentYear = fetchedAcademicYears.find(y => y.is_current) || fetchedAcademicYears[0];
      if (currentYear) {
        setValue('details.studentDetails.academic_year_id', currentYear.value, {
          shouldValidate: true,
          shouldDirty: true
        });
      }
    }
  }, [fetchedAcademicYears, watchAcademicYearId, isEdit, setValue]);

  // Fetch Classes directly from API based on selected Academic Year
  const { data: fetchedClasses = [] } = useQuery({
    queryKey: ['form-classes', instituteId, watchAcademicYearId],
    queryFn: async () => {
      const res = await classService.getAll({
        institute_id: instituteId,
        academic_year_id: watchAcademicYearId,
        limit: 100
      });
      let items = [];
      if (Array.isArray(res)) items = res;
      else if (Array.isArray(res?.data)) items = res.data;
      else if (Array.isArray(res?.data?.data)) items = res.data.data;
      else if (Array.isArray(res?.data?.rows)) items = res.data.rows;

      return items.map(c => ({
        value: c.id,
        label: c.name,
        sections: c.sections,
        original: c
      }));
    },
    // Only fetch if an academic year is selected
    enabled: !!instituteId && !!watchAcademicYearId,
  });

  // Fetch Sections directly from API depending on class
  const { data: fetchedSections = [] } = useQuery({
    queryKey: ['form-sections', watchClassId, watchAcademicYearId],
    queryFn: async () => {
      let items = [];
      try {
        console.log('Fetching sections for class:', watchClassId);
        const res = await sectionService.getAll({
          institute_id: instituteId,
          academic_year_id: watchAcademicYearId,
          class_id: watchClassId,
          limit: 100
        });
        console.log('Sections API response:', res);

        if (Array.isArray(res)) items = res;
        else if (Array.isArray(res?.data)) items = res.data;
        else if (Array.isArray(res?.data?.data)) items = res.data.data;
        else if (Array.isArray(res?.data?.rows)) items = res.data.rows;
        else if (res && typeof res === 'object') {
          // Fallback: search for any top-level array
          for (const key in res) {
            if (Array.isArray(res[key])) {
              items = res[key];
              break;
            }
          }
        }
      } catch (err) {
        console.error('sectionService failed, will use fallback:', err);
      }

      if (!items || items.length === 0) {
        const foundClass = fetchedClasses.find(c => c.value === watchClassId) || classOptions?.find(c => c.value === watchClassId);
        console.log('Falling back to finding sections in Class object:', foundClass);
        if (foundClass?.sections && Array.isArray(foundClass.sections)) {
          items = foundClass.sections;
        } else if (foundClass?.original?.sections && Array.isArray(foundClass?.original?.sections)) {
          items = foundClass.original.sections;
        }
      }

      console.log('Final parsed section items:', items);
      return items.map(s => ({ value: s.id, label: s.name }));
    },
    enabled: !!watchClassId && !!instituteId,
  });

  const finalClassOptions = watchAcademicYearId ? fetchedClasses : classOptions;
  const finalSectionOptions = watchClassId ? fetchedSections : sectionOptions;

  console.log('📊 Dropdown UI received sections:', finalSectionOptions);

  const finalAcademicYearOptions = fetchedAcademicYears.length > 0 ? fetchedAcademicYears : academicYearOptions;

  const TABS = ['personal', 'academic', 'guardian', 'contact', 'fee', 'documents'];

  const getFieldsForTab = (tab) => {
    switch (tab) {
      case 'personal':
        return ['first_name', 'last_name', 'registration_no', 'dob', 'gender'];
      case 'academic':
        return [
          'details.studentDetails.academic_year_id',
          'admission_date',
          'details.studentDetails.class_id',
          'details.studentDetails.program_id',
          'details.studentDetails.course_id',
          'details.studentDetails.grade'
        ];
      case 'guardian':
        if (guardianType === 'parent') return ['father_name', 'father_phone'];
        return ['guardian_name', 'guardian_relation', 'guardian_phone'];
      case 'contact':
        return ['phone', 'city', 'present_address'];
      case 'fee':
        return [];
      case 'documents':
        return [];
      default: return [];
    }
  };

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForTab(activeTab);
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      const currentIndex = TABS.indexOf(activeTab);
      if (currentIndex < TABS.length - 1) {
        setActiveTab(TABS[currentIndex + 1]);
      }
    } else {
      toast.error('Please fill all required fields correctly to proceed.');
    }
  };

  const handlePrev = () => {
    const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1]);
    }
  };

  const handleTabChange = async (newTab) => {
    const currentIndex = TABS.indexOf(activeTab);
    const newIndex = TABS.indexOf(newTab);

    // Allow backwards navigation directly
    if (newIndex <= currentIndex) {
      setActiveTab(newTab);
      return;
    }

    // Check validation of current tab before jumping to next tab
    const fieldsToValidate = getFieldsForTab(activeTab);
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setActiveTab(newTab);
    } else {
      toast.error('Please complete this section before moving forward.');
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

  const handleProfilePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhotoPreview(URL.createObjectURL(file));
      setValue('profile_image', file);
    }
  };

  // Render academic fields based on institute type
  const renderAcademicFields = () => {
    const fieldClass = isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3';

    switch (instituteType) {
      case 'school':
        return (
          <div className={`grid grid-cols-1 gap-4 ${isMobile ? '' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            <SelectField
              label="Class"
              name="details.studentDetails.class_id"
              control={control}
              error={errors.details?.studentDetails?.class_id}
              options={finalClassOptions}
              placeholder={finalClassOptions.length > 0 ? "Select class" : "No classes found"}
              required
              disabled={finalClassOptions.length === 0}
            />
            <SelectField
              label="Section"
              name="details.studentDetails.section_id"
              control={control}
              error={errors.details?.studentDetails?.section_id}
              options={finalSectionOptions}
              placeholder={finalSectionOptions.length > 0 ? "Select section" : "No sections found"}
              disabled={finalSectionOptions.length === 0 || !watchClassId}
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
              options={Array.from({ length: 8 }, (_, i) => ({ value: i + 1, label: `Semester ${i + 1}` }))}
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
    const studentDetails = {
      ...data.details?.studentDetails,
      date_of_birth:         data.dob,
      gender:                data.gender,
      blood_group:           data.blood_group,
      religion:              data.religion,
      nationality:           data.nationality,
      cnic:                  data.cnic,
      father_name:           data.father_name,
      father_cnic:           data.father_cnic,
      father_phone:          data.father_phone,
      father_occupation:     data.father_occupation,
      mother_name:           data.mother_name,
      mother_phone:          data.mother_phone,
      guardian_name:         data.guardian_name,
      guardian_relation:     data.guardian_relation,
      guardian_phone:        data.guardian_phone,
      present_address:       data.present_address,
      permanent_address:     data.permanent_address,
      city:                  data.city,
      medical_conditions:    data.medical_conditions,
      allergies:             data.allergies,
      fee_plan_id:           data.fee_plan_id,
      monthly_fee:           data.monthly_fee,
      concession_type:       data.concession_type,
      concession_percentage: data.concession_percentage,
      admission_date:        data.admission_date,
      previous_school:       data.previous_school,
      roll_no:               data.details?.studentDetails?.roll_no,
    };

    const formattedData = {
      ...data,
      registration_no: data.registration_no || data.gr_number,
      details: { studentDetails },
      documents,
      guardian_type: guardianType,
    };

    // In edit mode, remove fields the PUT endpoint shouldn't receive
    if (isEdit) {
      delete formattedData.password;
      delete formattedData.user_type;
    } else {
      formattedData.user_type = 'STUDENT';
    }

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
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {renderTabsList()}

        {/* Tab 1: Personal Information */}
        <TabsContent value="personal">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden bg-muted border-4 border-background shadow-sm">
                    {profilePhotoPreview ? (
                      <img src={profilePhotoPreview} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full w-full bg-secondary text-secondary-foreground">
                        <User className="h-8 w-8 sm:h-12 sm:w-12 opacity-50" />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-full px-4"
                    onClick={() => document.getElementById('profile-photo-upload').click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  <input
                    type="file"
                    id="profile-photo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePhotoUpload}
                  />
                </div>

                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground border-b pb-2">
                  Basic Information
                </p>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-4">Identity Details</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <InputField label="First Name" name="first_name" register={register} error={errors.first_name} required placeholder="e.g. Ahmed" />
                      <InputField label="Last Name" name="last_name" register={register} error={errors.last_name} required placeholder="e.g. Ali" />
                      <InputField label="GR/Reg No" name="registration_no" register={register} error={errors.registration_no} required placeholder="e.g. 2024-001" />
                      <DatePickerField label="Date of Birth" name="dob" control={control} error={errors.dob} required />
                      <SelectField label="Gender" name="gender" control={control} error={errors.gender} options={GENDER_OPTIONS} placeholder="Select gender" required />
                      <InputField label="CNIC/B-Form" name="cnic" register={register} error={errors.cnic} placeholder="00000-0000000-0" />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-4">Other Details</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <SelectField label="Blood Group" name="blood_group" control={control} error={errors.blood_group} options={BLOOD_GROUP_OPTIONS} placeholder="Select blood group" />
                      <SelectField label="Religion" name="religion" control={control} error={errors.religion} options={RELIGION_OPTIONS} placeholder="Select religion" />
                      <InputField label="Nationality" name="nationality" register={register} error={errors.nationality} placeholder="e.g. Pakistani" defaultValue="Pakistani" />
                    </div>
                  </div>
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
                    options={finalAcademicYearOptions}
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
                <div className="flex items-center justify-center mb-6">
                  <div className="inline-flex bg-muted p-1 rounded-lg">
                    <button
                      type="button"
                      className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${guardianType === 'parent'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                      onClick={() => setGuardianType('parent')}
                    >
                      Parents
                    </button>
                    <button
                      type="button"
                      className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${guardianType === 'guardian'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                      onClick={() => setGuardianType('guardian')}
                    >
                      Guardian
                    </button>
                  </div>
                </div>

                {guardianType === 'parent' ? (
                  <div className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground border-b pb-2">
                      Father's Information
                    </p>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-foreground mb-4">Identity & Contact</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <InputField label="Father's Name" name="father_name" register={register} error={errors.father_name} required={guardianType === 'parent'} placeholder="e.g. Muhammad Ahmed" />
                          <InputField label="Father's CNIC" name="father_cnic" register={register} error={errors.father_cnic} placeholder="00000-0000000-0" />
                          <InputField label="Father's Phone" name="father_phone" register={register} error={errors.father_phone} required={guardianType === 'parent'} placeholder="e.g. 03001234567" type="tel" />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-foreground mb-4">Professional Details</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <InputField label="Father's Occupation" name="father_occupation" register={register} error={errors.father_occupation} placeholder="e.g. Businessman" />
                          <InputField label="Father's Education" name="father_education" register={register} error={errors.father_education} placeholder="e.g. Masters" />
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground border-b pb-2">
                      Mother's Information
                    </p>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-foreground mb-4">Identity & Contact</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <InputField label="Mother's Name" name="mother_name" register={register} error={errors.mother_name} placeholder="e.g. Fatima Ahmed" />
                          <InputField label="Mother's CNIC" name="mother_cnic" register={register} error={errors.mother_cnic} placeholder="00000-0000000-0" />
                          <InputField label="Mother's Phone" name="mother_phone" register={register} error={errors.mother_phone} placeholder="e.g. 03001234567" type="tel" />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-foreground mb-4">Professional Details</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <InputField label="Mother's Occupation" name="mother_occupation" register={register} error={errors.mother_occupation} placeholder="e.g. Housewife" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground border-b pb-2">
                      Guardian Information
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <InputField
                        label="Guardian Name"
                        name="guardian_name"
                        register={register}
                        error={errors.guardian_name}
                        required={guardianType === 'guardian'}
                        placeholder="e.g. Aslam Khan"
                      />
                      <InputField
                        label="Relation"
                        name="guardian_relation"
                        register={register}
                        error={errors.guardian_relation}
                        required={guardianType === 'guardian'}
                        placeholder="e.g. Uncle"
                      />
                      <InputField
                        label="Guardian Phone"
                        name="guardian_phone"
                        register={register}
                        error={errors.guardian_phone}
                        required={guardianType === 'guardian'}
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
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Contact Information */}
        <TabsContent value="contact">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-4">Contact Numbers & Email</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InputField label="Primary Phone" name="phone" register={register} error={errors.phone} required placeholder="e.g. 03001234567" type="tel" />
                    <InputField label="Alternate Phone" name="alternate_phone" register={register} error={errors.alternate_phone} placeholder="e.g. 03123456789" type="tel" />
                    <InputField label="Email Address" name="email" register={register} error={errors.email} placeholder="e.g. student@example.com" type="email" />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-foreground mb-4">Location & Address</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InputField label="City" name="city" register={register} error={errors.city} required placeholder="e.g. Karachi" />
                    <InputField label="Postal Code" name="postal_code" register={register} error={errors.postal_code} placeholder="e.g. 75500" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <TextareaField label="Present Address" name="present_address" register={register} error={errors.present_address} required placeholder="Full residential address" rows={isMobile ? 2 : 2} />
                    <TextareaField label="Permanent Address" name="permanent_address" register={register} error={errors.permanent_address} placeholder="If different from present address" rows={isMobile ? 2 : 2} />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-foreground mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InputField label="Contact Person" name="emergency_contact_name" register={register} error={errors.emergency_contact_name} placeholder="e.g. Kamran Khan" />
                    <InputField label="Relation" name="emergency_contact_relation" register={register} error={errors.emergency_contact_relation} placeholder="e.g. Brother" />
                    <InputField label="Emergency Phone" name="emergency_contact_phone" register={register} error={errors.emergency_contact_phone} placeholder="e.g. 03001234567" type="tel" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Fee Information */}
        <TabsContent value="fee">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-4">General Fees</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InputField label="Fee Plan" name="fee_plan_id" register={register} error={errors.fee_plan_id} placeholder="Select fee plan" />
                    <InputField label="Monthly Fee (PKR)" name="monthly_fee" register={register} error={errors.monthly_fee} type="number" placeholder="e.g. 5000" />
                    <InputField label="Admission Fee" name="admission_fee" register={register} error={errors.admission_fee} type="number" placeholder="e.g. 2000" />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-foreground mb-4">Concessions</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <SelectField label="Concession Type" name="concession_type" control={control} error={errors.concession_type} options={[{ value: 'none', label: 'None' }, { value: 'scholarship', label: 'Scholarship' }, { value: 'discount', label: 'Discount' }, { value: 'waiver', label: 'Fee Waiver' }]} placeholder="Select type" />
                    <InputField label="Concession %" name="concession_percentage" register={register} error={errors.concession_percentage} type="number" placeholder="e.g. 20" />
                    <TextareaField label="Concession Reason" name="concession_reason" register={register} error={errors.concession_reason} placeholder="Reason for concession" rows={isMobile ? 1 : 1} />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-foreground mb-4">Medical Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <TextareaField label="Medical Conditions" name="medical_conditions" register={register} error={errors.medical_conditions} placeholder="Any medical conditions" rows={isMobile ? 2 : 2} />
                    <TextareaField label="Allergies" name="allergies" register={register} error={errors.allergies} placeholder="Any allergies" rows={isMobile ? 2 : 2} />
                  </div>
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

      <div className="flex flex-col-reverse justify-between items-center gap-4 sm:flex-row pt-6 border-t mt-8 bg-background sticky bottom-0 z-10 py-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
        <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto text-muted-foreground hover:text-foreground">
          Cancel
        </Button>
        <div className="flex w-full sm:w-auto gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={activeTab === 'personal'}
            className="w-full sm:w-32"
          >
            <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
            Previous
          </Button>

          {activeTab !== 'documents' ? (
            <Button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-32 shadow-md relative overflow-hidden transition-all hover:shadow-lg"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
            </Button>
          ) : (
            <FormSubmitButton
              loading={loading}
              label={isEdit ? 'Save Changes' : 'Add Student'}
              loadingLabel={isEdit ? 'Saving…' : 'Adding…'}
              className="w-full sm:w-40 shadow-md"
            />
          )}
        </div>
      </div>
    </form>
  );
}
