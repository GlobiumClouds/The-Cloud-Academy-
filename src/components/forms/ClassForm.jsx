//src/components/forms/ClassForm.jsx
/**
 * ClassForm — Create / Edit class with sections and courses (Fully Responsive)
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   defaultValues      object          Pre-filled values for edit mode
 *   onSubmit           (data) => void  Called with form data
 *   onCancel           () => void
 *   loading            boolean
 *   academicYearOptions { value, label }[]
 *   teacherOptions     { value, label }[]
 *   instituteType      string
 *   isEdit             boolean
 */
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  InputField,
  SelectField,
  TextareaField,
  SwitchField,
  FormSubmitButton,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Trash2, 
  BookOpen, 
  Users, 
  FileText,
  Upload,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Constants
const MAX_PDF_MB = 10;
const MAX_PDF_BYTES = MAX_PDF_MB * 1024 * 1024;

// Validation Schemas
const materialSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional().default(''),
  description: z.string().optional(),
  file: z.any().optional(),
  pdf_url: z.string().optional(),   // existing Cloudinary URL
  active: z.boolean().default(true),
});

const courseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Course name is required'),
  code: z.string().optional().default(''),
  description: z.string().optional(),
  active: z.boolean().default(true),
  materials: z.array(materialSchema).default([]),
});

const sectionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Section name is required'),
  room_no: z.string().optional(),
  capacity: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(1, 'Capacity must be at least 1').optional()
  ),
  active: z.boolean().default(true),
});

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  description: z.string().optional(),
  academic_year_id: z.string().min(1, 'Academic year is required'),
  active: z.boolean().default(true),
  sections: z.array(sectionSchema).default([]),
  courses: z.array(courseSchema).default([]),
});

export default function ClassForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  loading = false,
  academicYearOptions = [],
  instituteType = 'school',
  isEdit = false,
}) {
  const [activeTab, setActiveTab] = useState('basic');
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(classSchema),
    defaultValues: {
      active: true,
      sections: [],
      courses: [],
      ...defaultValues,
    },
  });

  // Re-initialize form whenever the item being edited changes
  useEffect(() => {
    reset({
      active: true,
      sections: [],
      courses: [],
      ...defaultValues,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues?.id]);

  // Field arrays
  const { 
    fields: sectionFields, 
    append: appendSection, 
    remove: removeSection 
  } = useFieldArray({ control, name: 'sections' });

  const { 
    fields: courseFields, 
    append: appendCourse, 
    remove: removeCourse 
  } = useFieldArray({ control, name: 'courses' });

  // Watch values
  const watchSections = watch('sections');
  const watchCourses = watch('courses');

  // Navigation for mobile tabs
  const nextTab = () => {
    const tabs = ['basic', 'sections', 'courses'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const prevTab = () => {
    const tabs = ['basic', 'sections', 'courses'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  // Get term based on institute type
  const getTerm = (key) => {
    const terms = {
      school: { class: 'Class', section: 'Section', course: 'Subject' },
      college: { class: 'Program', section: 'Batch', course: 'Course' },
      university: { class: 'Department', section: 'Semester', course: 'Course' },
      coaching: { class: 'Batch', section: 'Group', course: 'Subject' },
      academy: { class: 'Program', section: 'Batch', course: 'Module' },
      tuition_center: { class: 'Grade', section: 'Group', course: 'Subject' },
    };
    return terms[instituteType]?.[key] || key;
  };

  // Handle file selection for course materials (RHF-controlled)
  const handleFileChange = (courseIndex, materialIndex, file, rhfOnChange) => {
    if (file && file.size > MAX_PDF_BYTES) {
      alert(`File size must be less than ${MAX_PDF_MB}MB`);
      return;
    }
    // Store FileList/File into RHF field so it's available on submit
    rhfOnChange(file ?? null);
    setUploadingFiles(prev => ({
      ...prev,
      [`${courseIndex}-${materialIndex}`]: file ? file.name : null,
    }));
  };

  // Remove newly selected file (don't remove existing pdf_url)
  const removeMaterialFile = (courseIndex, materialIndex) => {
    setValue(`courses.${courseIndex}.materials.${materialIndex}.file`, null);
    setUploadingFiles(prev => {
      const newState = { ...prev };
      delete newState[`${courseIndex}-${materialIndex}`];
      return newState;
    });
  };

  // Add new section
  const handleAddSection = () => {
    appendSection({
      name: '',
      room_no: '',
      capacity: 30,
      active: true,
    });
  };

  // Add new course
  const handleAddCourse = () => {
    appendCourse({
      name: '',
      code: '',
      description: '',
      active: true,
      materials: [],
    });
  };

  // Add material to course
  const handleAddMaterial = (courseIndex) => {
    const materials = getValues(`courses.${courseIndex}.materials`) || [];
    setValue(`courses.${courseIndex}.materials`, [
      ...materials,
      { name: '', description: '', active: true }
    ]);
  };

  // Remove material from course
  const handleRemoveMaterial = (courseIndex, materialIndex) => {
    const materials = getValues(`courses.${courseIndex}.materials`) || [];
    materials.splice(materialIndex, 1);
    setValue(`courses.${courseIndex}.materials`, materials);
  };

  // Form submit handler
  const onSubmitForm = (data) => {
    const formattedData = {
      ...data,
      sections: data.sections.map(section => ({
        ...section,
        capacity: section.capacity ? parseInt(section.capacity) : null,
      })),
      courses: data.courses.map(course => ({
        ...course,
        materials: course.materials?.map(material => ({
          ...material,
          // file is now a File object (set via Controller), not FileList
          file: material.file instanceof File ? material.file : undefined,
        }))
      }))
    };
    onSubmit(formattedData);
  };

  // Auto-jump to first tab that has validation errors
  const onFormError = (errs) => {
    if (errs.name || errs.description || errs.academic_year_id) {
      setActiveTab('basic');
    } else if (errs.sections) {
      setActiveTab('sections');
    } else if (errs.courses) {
      setActiveTab('courses');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm, onFormError)} className="space-y-4 sm:space-y-6">
      {/* Mobile/Desktop Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Scrollable tabs for mobile */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className={`inline-flex w-auto sm:grid ${isMobile ? 'flex-nowrap' : 'grid-cols-3'} mb-4 sm:mb-6`}>
            <TabsTrigger value="basic" className="px-3 sm:px-4">
              Basic Info
              {(errors.name || errors.description || errors.academic_year_id) && (
                <span className="ml-1 h-2 w-2 rounded-full bg-destructive inline-block" />
              )}
            </TabsTrigger>
            <TabsTrigger value="sections" className="px-3 sm:px-4">
              {getTerm('section')}s
              {sectionFields.length > 0 && (
                <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] sm:text-xs">
                  {sectionFields.length}
                </Badge>
              )}
              {errors.sections && (
                <span className="ml-1 h-2 w-2 rounded-full bg-destructive inline-block" />
              )}
            </TabsTrigger>
            <TabsTrigger value="courses" className="px-3 sm:px-4">
              {getTerm('course')}s
              {courseFields.length > 0 && (
                <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] sm:text-xs">
                  {courseFields.length}
                </Badge>
              )}
              {errors.courses && (
                <span className="ml-1 h-2 w-2 rounded-full bg-destructive inline-block" />
              )}
            </TabsTrigger>
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
              disabled={activeTab === 'basic'}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium capitalize">
              {activeTab === 'basic' ? 'Basic Info' : activeTab}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={nextTab}
              disabled={activeTab === 'courses'}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Tab 1: Basic Information */}
        <TabsContent value="basic">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {getTerm('class')} Information
                </p>
                
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                  <InputField
                    label={`${getTerm('class')} Name`}
                    name="name"
                    register={register}
                    error={errors.name}
                    required
                    placeholder={`e.g. ${getTerm('class')} 9`}
                  />
                  
                  <SelectField
                    label="Academic Year"
                    name="academic_year_id"
                    control={control}
                    error={errors.academic_year_id}
                    options={academicYearOptions}
                    placeholder="Select"
                    required
                  />
                  
                  <div className="col-span-1 md:col-span-2">
                    <TextareaField
                      label="Description"
                      name="description"
                      register={register}
                      error={errors.description}
                      placeholder={`Description for this ${getTerm('class').toLowerCase()}`}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-3 sm:p-4 gap-3">
                  <div>
                    <Label htmlFor="active" className="text-sm sm:text-base font-medium">
                      Status
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {watch('active') ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <Controller
                    name="active"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Sections */}
        <TabsContent value="sections">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {getTerm('section')} Management
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSection}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {getTerm('section')}
                  </Button>
                </div>

                {sectionFields.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 border-2 border-dashed rounded-lg">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm sm:text-base text-muted-foreground">No sections added yet</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Click the button above to add sections
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {sectionFields.map((field, index) => (
                      <div key={field.id} className="border rounded-lg p-3 sm:p-4 relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                          onClick={() => removeSection(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3 pr-8">
                          <InputField
                            label={`${getTerm('section')} Name`}
                            name={`sections.${index}.name`}
                            register={register}
                            error={errors.sections?.[index]?.name}
                            required
                            placeholder={`e.g. A, Morning`}
                          />
                          
                          <InputField
                            label="Room No."
                            name={`sections.${index}.room_no`}
                            register={register}
                            error={errors.sections?.[index]?.room_no}
                            placeholder="e.g. 101"
                          />
                          
                          <InputField
                            label="Capacity"
                            name={`sections.${index}.capacity`}
                            register={register}
                            error={errors.sections?.[index]?.capacity}
                            type="number"
                            placeholder="e.g. 40"
                          />
                        </div>

                        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <Label htmlFor={`section-${index}-active`} className="text-xs sm:text-sm">
                            Status
                          </Label>
                          <Controller
                            name={`sections.${index}.active`}
                            control={control}
                            render={({ field }) => (
                              <Switch
                                id={`section-${index}-active`}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Courses */}
        <TabsContent value="courses">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {getTerm('course')} Management
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCourse}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {getTerm('course')}
                  </Button>
                </div>

                {courseFields.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 border-2 border-dashed rounded-lg">
                    <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm sm:text-base text-muted-foreground">No courses added yet</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Click the button above to add courses
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {courseFields.map((field, courseIndex) => (
                      <div key={field.id} className="border rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                          <h4 className="text-sm sm:text-base font-medium">Course {courseIndex + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                            onClick={() => removeCourse(courseIndex)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Course
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                          <InputField
                            label="Course Name"
                            name={`courses.${courseIndex}.name`}
                            register={register}
                            error={errors.courses?.[courseIndex]?.name}
                            required
                            placeholder="e.g. Mathematics"
                          />
                          
                          <InputField
                            label="Course Code"
                            name={`courses.${courseIndex}.code`}
                            register={register}
                            error={errors.courses?.[courseIndex]?.code}
                            required
                            placeholder="e.g. MATH-101"
                          />
                          
                          <div className="col-span-1 md:col-span-2">
                            <TextareaField
                              label="Description"
                              name={`courses.${courseIndex}.description`}
                              register={register}
                              error={errors.courses?.[courseIndex]?.description}
                              placeholder="Course description"
                              rows={2}
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t pt-3 gap-3">
                          <Label htmlFor={`course-${courseIndex}-active`} className="text-xs sm:text-sm">
                            Course Status
                          </Label>
                          <Controller
                            name={`courses.${courseIndex}.active`}
                            control={control}
                            render={({ field }) => (
                              <Switch
                                id={`course-${courseIndex}-active`}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                        </div>

                        {/* Materials Section */}
                        <div className="mt-4 border-t pt-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                            <h5 className="text-xs sm:text-sm font-medium flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              Course Materials
                            </h5>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddMaterial(courseIndex)}
                              className="w-full sm:w-auto"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Material
                            </Button>
                          </div>

                          {(!watchCourses[courseIndex]?.materials || 
                            watchCourses[courseIndex].materials.length === 0) ? (
                            <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                              No materials added yet
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {watchCourses[courseIndex].materials.map((material, materialIndex) => (
                                <div key={materialIndex} className="bg-accent/20 rounded-lg p-3">
                                  <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-2">
                                    <div className="w-full sm:flex-1">
                                      <InputField
                                        label="Material Name"
                                        name={`courses.${courseIndex}.materials.${materialIndex}.name`}
                                        register={register}
                                        error={errors.courses?.[courseIndex]?.materials?.[materialIndex]?.name}
                                        required
                                        placeholder="e.g. Chapter 1 Notes"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:bg-destructive/10 w-full sm:w-auto mt-1 sm:mt-0"
                                      onClick={() => handleRemoveMaterial(courseIndex, materialIndex)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 gap-3">
                                    <TextareaField
                                      label="Description"
                                      name={`courses.${courseIndex}.materials.${materialIndex}.description`}
                                      register={register}
                                      error={errors.courses?.[courseIndex]?.materials?.[materialIndex]?.description}
                                      placeholder="Material description"
                                      rows={1}
                                    />

                                    <div className="space-y-2">
                                      <Label className="text-xs sm:text-sm">PDF File (Max {MAX_PDF_MB}MB)</Label>

                                      {/* Show existing uploaded PDF link */}
                                      {watchCourses[courseIndex]?.materials?.[materialIndex]?.pdf_url && !uploadingFiles[`${courseIndex}-${materialIndex}`] && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/20 rounded px-2 py-1">
                                          <FileText className="h-3 w-3 shrink-0" />
                                          <a
                                            href={watchCourses[courseIndex].materials[materialIndex].pdf_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="truncate hover:underline text-blue-600"
                                          >
                                            Current PDF
                                          </a>
                                          <span className="text-muted-foreground">(upload new to replace)</span>
                                        </div>
                                      )}

                                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                        {/* Use Controller so file is stored in RHF state */}
                                        <Controller
                                          name={`courses.${courseIndex}.materials.${materialIndex}.file`}
                                          control={control}
                                          render={({ field: { onChange } }) => (
                                            <>
                                              <input
                                                type="file"
                                                accept=".pdf,application/pdf"
                                                onChange={(e) => handleFileChange(courseIndex, materialIndex, e.target.files?.[0] ?? null, onChange)}
                                                className="hidden"
                                                id={`file-${courseIndex}-${materialIndex}`}
                                              />
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => document.getElementById(`file-${courseIndex}-${materialIndex}`).click()}
                                                className="flex-1"
                                              >
                                                <Upload className="h-4 w-4 mr-2" />
                                                <span className="truncate">
                                                  {uploadingFiles[`${courseIndex}-${materialIndex}`] || 'Choose PDF'}
                                                </span>
                                              </Button>
                                            </>
                                          )}
                                        />
                                        {uploadingFiles[`${courseIndex}-${materialIndex}`] && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeMaterialFile(courseIndex, materialIndex)}
                                            className="w-full sm:w-auto"
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                      <Label htmlFor={`material-${courseIndex}-${materialIndex}-active`} className="text-xs sm:text-sm">
                                        Active
                                      </Label>
                                      <Controller
                                        name={`courses.${courseIndex}.materials.${materialIndex}.active`}
                                        control={control}
                                        render={({ field }) => (
                                          <Switch
                                            id={`material-${courseIndex}-${materialIndex}-active`}
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                          />
                                        )}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <FormSubmitButton
          loading={loading}
          label={isEdit ? 'Save Changes' : `Create ${getTerm('class')}`}
          loadingLabel={isEdit ? 'Saving…' : 'Creating…'}
          className="w-full sm:w-auto"
        />
      </div>
    </form>
  );
}