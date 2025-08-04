'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { detailedApply, createSignedUploadUrl } from '../../actions';
import { Loader2, PlusCircle, Trash2, CheckCircle, Upload, X, Check, CalendarIcon, Sparkles, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CustomFieldsForm } from '@/components/recruiter/custom-fields-form';
import { CVAnalysisResult } from '@/lib/cv-analysis';

const workExperienceSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  company: z.string().min(1, 'Company is required'),
  start_date: z.date({ required_error: 'Start date is required' }),
  end_date: z.date().optional(),
  currently_working: z.boolean().optional(),
}).refine(data => data.currently_working || data.end_date, {
    message: "End date is required unless you are currently working here.",
    path: ["end_date"],
});

const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  start_date: z.date({ required_error: 'Start date is required' }),
  end_date: z.date({ required_error: 'End date is required' }),
  qualification_file_path: z.string().optional(),
});

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  coverLetter: z.string().optional(),
  cv_path: z.string().optional(),
  workExperience: z.array(workExperienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  customFields: z.record(z.any()).optional(),
});

type DetailedApplicationFormValues = z.infer<typeof formSchema>;

interface DetailedApplicationFormProps {
  job: { id: number; title: string; };
}

const sanitizeFileName = (name: string) => {
  // Replace spaces with underscores and remove characters that are not letters, numbers, hyphens, underscores, or dots.
  return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-._]/g, '');
};

// Custom Checkbox Component
const CustomCheckbox = ({ checked, onCheckedChange, id, ...props }: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id: string;
}) => {
  return (
    <motion.div
      className="relative inline-flex items-center"
      whileTap={{ scale: 0.95 }}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="sr-only"
        {...props}
      />
      <motion.div
        className={`w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-all duration-200 ${
          checked 
            ? 'bg-[#c084fc] border-[#c084fc]' 
            : 'bg-white border-gray-300 hover:border-[#c084fc]'
        }`}
        onClick={() => onCheckedChange?.(!checked)}
        animate={{
          scale: checked ? 1.1 : 1,
          backgroundColor: checked ? '#c084fc' : '#ffffff',
        }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// Custom Date Picker Component with Year/Month Selection
const CustomDatePicker = ({ date, onDateChange, placeholder, disabled = false }: {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder: string;
  disabled?: boolean;
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(date?.getFullYear() || new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(date?.getMonth() || new Date().getMonth());
  
  // Generate year options (from 1950 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
  
  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal transition-colors duration-200",
            !date && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "focus:border-[#c084fc] focus:ring-[#c084fc] hover:border-[#c084fc]"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[#c084fc]" />
          {date ? format(date, "MMM d, yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50" align="start">
        <div className="p-3 border-b bg-gray-50/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <Label className="text-xs font-medium text-gray-600 mb-1 block">Month</Label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-[#c084fc] focus:ring-1 focus:ring-[#c084fc] transition-colors"
              >
                {monthOptions.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <Label className="text-xs font-medium text-gray-600 mb-1 block">Year</Label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-[#c084fc] focus:ring-1 focus:ring-[#c084fc] transition-colors"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          month={new Date(selectedYear, selectedMonth)}
          onMonthChange={(newMonth) => {
            setSelectedYear(newMonth.getFullYear());
            setSelectedMonth(newMonth.getMonth());
          }}
          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
          initialFocus
          className="border-0"
        />
      </PopoverContent>
    </Popover>
  );
};

// Custom File Upload Component
const CustomFileUpload = ({ onChange, accept, label, file, required = false }: {
  onChange: (file: File | null) => void;
  accept: string;
  label: string;
  file: File | null;
  required?: boolean;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (selectedFile: File | null) => {
    onChange(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 cursor-pointer ${
          isDragOver
            ? 'border-[#c084fc] bg-purple-50'
            : file
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-[#c084fc] hover:bg-purple-50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white transition-all duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </motion.div>
            <span className="text-sm text-gray-500">
              {file ? file.name : 'No file chosen'}
            </span>
          </div>
          {file && (
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFileChange(null);
              }}
              className="text-red-500 hover:text-red-700 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export function DetailedApplicationForm({ job }: DetailedApplicationFormProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [qualificationFiles, setQualificationFiles] = useState<(File | null)[]>([]);
  const [cvAnalysis, setCvAnalysis] = useState<CVAnalysisResult | null>(null);
  const [isAnalyzingCV, setIsAnalyzingCV] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);

  const form = useForm<DetailedApplicationFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      coverLetter: '',
      cv_path: '',
      workExperience: [{ 
        role: '', 
        company: '', 
        start_date: new Date(), 
        end_date: new Date(), 
        currently_working: false 
      }],
      education: [{ 
        institution: '', 
        qualification: '', 
        start_date: new Date(), 
        end_date: new Date() 
      }],
      customFields: {},
    },
  });

  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
    control: form.control,
    name: "workExperience",
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control: form.control,
    name: "education",
  });
  
  const handleQualificationFileChange = (index: number, file: File | null) => {
    const newFiles = [...qualificationFiles];
    newFiles[index] = file;
    setQualificationFiles(newFiles);
  };

  const analyzeCV = async () => {
    if (!cvFile) {
      toast({ title: 'No CV uploaded', description: 'Please upload your CV first.', variant: 'destructive' });
      return;
    }

    setIsAnalyzingCV(true);
    try {
      // Upload CV temporarily for analysis
      const sanitizedCvFileName = sanitizeFileName(cvFile.name);
      const cvFileName = `temp-${Date.now()}-${sanitizedCvFileName}`;
      
      const signedUrlResult = await createSignedUploadUrl(job.id, cvFileName, 'temp-analysis');
      
      if (!signedUrlResult.success) {
        throw new Error(signedUrlResult.error || 'Could not get upload URL for CV analysis.');
      }

      if (!('path' in signedUrlResult) || !('token' in signedUrlResult)) {
        throw new Error('Signed URL result missing path or token');
      }

      const { error: cvUploadError } = await supabase.storage
        .from('documents')
        .uploadToSignedUrl(signedUrlResult.path, signedUrlResult.token, cvFile);

      if (cvUploadError) throw new Error(`CV upload failed: ${cvUploadError.message}`);

      // Analyze CV
      const response = await fetch('/api/cv-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl: signedUrlResult.path,
          jobId: job.id,
          jobTitle: job.title,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze CV');
      }

      const data = await response.json();
      setCvAnalysis(data.analysis);
      setCvUploaded(true);

      toast({
        title: 'CV Analysis Complete',
        description: 'Your CV has been analyzed. You can now autofill the form with the extracted information.',
      });

    } catch (error) {
      console.error('Error analyzing CV:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze CV',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzingCV(false);
    }
  };

  const autofillFromCV = () => {
    if (!cvAnalysis) {
      toast({ title: 'No CV analysis available', description: 'Please analyze your CV first.', variant: 'destructive' });
      return;
    }

    try {
      // Fill personal information
      if (cvAnalysis.personalInfo.firstName) {
        form.setValue('firstName', cvAnalysis.personalInfo.firstName);
      }
      if (cvAnalysis.personalInfo.lastName) {
        form.setValue('lastName', cvAnalysis.personalInfo.lastName);
      }
      if (cvAnalysis.personalInfo.email) {
        form.setValue('email', cvAnalysis.personalInfo.email);
      }
      if (cvAnalysis.personalInfo.phone) {
        form.setValue('phoneNumber', cvAnalysis.personalInfo.phone);
      }

      // Fill work experience
      if (cvAnalysis.workExperience.length > 0) {
        const workExp = cvAnalysis.workExperience.map(exp => ({
          role: exp.role,
          company: exp.company,
          start_date: exp.startDate ? new Date(exp.startDate) : new Date(),
          end_date: exp.endDate ? new Date(exp.endDate) : new Date(),
          currently_working: exp.currentlyWorking || false,
        }));
        
        // Clear existing work experience and add new ones
        form.setValue('workExperience', workExp);
      }

      // Fill education
      if (cvAnalysis.education.length > 0) {
        const education = cvAnalysis.education.map(edu => ({
          institution: edu.institution,
          qualification: edu.qualification,
          start_date: edu.startDate ? new Date(edu.startDate) : new Date(),
          end_date: edu.endDate ? new Date(edu.endDate) : new Date(),
        }));
        
        // Clear existing education and add new ones
        form.setValue('education', education);
      }

      // Fill custom fields
      if (cvAnalysis.customFieldsSuggestions) {
        Object.entries(cvAnalysis.customFieldsSuggestions).forEach(([fieldName, value]) => {
          form.setValue(`customFields.${fieldName}`, value);
        });
      }

      toast({
        title: 'Form Autofilled',
        description: 'Your application form has been filled with information from your CV.',
      });

    } catch (error) {
      console.error('Error autofilling form:', error);
      toast({
        title: 'Autofill Failed',
        description: 'Failed to autofill form with CV data.',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (values: DetailedApplicationFormValues) => {
    setIsSubmitting(true);
    
    try {
        if (!cvFile) {
            toast({ title: 'CV is required', description: 'Please select your CV to upload.', variant: 'destructive' });
            setIsSubmitting(false);
            return;
        }

        const applicantEmail = values.email;

        // --- CV Upload via Signed URL ---
        const sanitizedCvFileName = sanitizeFileName(cvFile.name);
        const cvFileName = `${Date.now()}-${sanitizedCvFileName}`;
        
        const signedUrlResult = await createSignedUploadUrl(job.id, cvFileName, applicantEmail);
        
        if (!signedUrlResult.success) {
             throw new Error(signedUrlResult.error || 'Could not get a secure upload URL for CV.');
        }
        if (!('path' in signedUrlResult) || !('token' in signedUrlResult)) {
             throw new Error('Signed URL result missing path or token');
        }
        const { error: cvUploadError } = await supabase.storage
            .from('documents')
            .uploadToSignedUrl(signedUrlResult.path, signedUrlResult.token, cvFile);

        if (cvUploadError) throw new Error(`CV upload failed: ${cvUploadError.message}`);
        values.cv_path = signedUrlResult.path;
        
        console.log('CV uploaded successfully:', {
          fileName: cvFile.name,
          path: signedUrlResult.path,
          size: cvFile.size
        });
        
        // Note: For public applications, CV path is stored directly in public_applications table
        // No need to insert into documents table as that's only for authenticated users
        
        // --- Qualification Uploads via Signed URL ---
        const updatedEducation = await Promise.all(
            (values.education || []).map(async (edu, index) => {
                const file = qualificationFiles[index];
                const eduWithDefaults = { ...edu, currently_working: false };

                if (file) {
                    const sanitizedQFileName = sanitizeFileName(file.name);
                    const qFileName = `${Date.now()}-${sanitizedQFileName}`;
                    
                    const qSignedUrlResult = await createSignedUploadUrl(job.id, qFileName, `${applicantEmail}/qualifications`);
                    
                    if (!qSignedUrlResult.success) {
                        console.error(`Could not get upload URL for ${file.name}:`, qSignedUrlResult.error);
                        return { ...eduWithDefaults, qualification_file_path: undefined };
                    }
                    if (!('path' in qSignedUrlResult) || !('token' in qSignedUrlResult)) {
                        console.error('Signed URL result missing path or token for qualification');
                        return { ...eduWithDefaults, qualification_file_path: undefined };
                    }
                    const { error: qUploadError } = await supabase.storage
                        .from('documents')
                        .uploadToSignedUrl(qSignedUrlResult.path, qSignedUrlResult.token, file);

                    if (qUploadError) {
                        console.error(`Upload failed for ${file.name}:`, qUploadError);
                        return { ...eduWithDefaults, qualification_file_path: undefined };
                    }
                    return { ...eduWithDefaults, qualification_file_path: qSignedUrlResult.path };
                }
                return eduWithDefaults;
            })
        );
        values.education = updatedEducation;

        // Transform work experience data to match server schema
        const transformedWorkExperience = (values.workExperience || []).map(exp => ({
            role: exp.role,
            company: exp.company,
            duration: exp.currently_working ? 'Present' : 
                     exp.end_date ? `${exp.start_date.getFullYear()}-${exp.end_date.getFullYear()}` : 
                     `${exp.start_date.getFullYear()}-Present`,
            currently_working: exp.currently_working || false,
        }));

        // Transform education data to match server schema
        const transformedEducation = (values.education || []).map(edu => ({
            institution: edu.institution,
            qualification: edu.qualification,
            duration: `${edu.start_date.getFullYear()}-${edu.end_date.getFullYear()}`,
            qualification_file_path: edu.qualification_file_path,
        }));

        console.log('Submitting application with data:', {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          cv_path: values.cv_path,
          workExperienceCount: transformedWorkExperience.length,
          educationCount: transformedEducation.length,
          customFieldsCount: Object.keys(values.customFields || {}).length
        });

        // 3. Submit metadata to server action
        const result = await detailedApply(job.id, {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phoneNumber: values.phoneNumber,
            cv_path: values.cv_path || "",
            workExperience: transformedWorkExperience,
            education: transformedEducation,
            customFields: values.customFields || {},
        });

        if (result.success) {
            setIsSuccess(true);
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }

    } catch (error) {
      toast({ title: 'An unexpected error occurred', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isSuccess) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-full py-12"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="w-16 h-16 text-green-500" />
        </motion.div>
        <motion.h2
          className="text-2xl font-bold mt-4 text-gray-900"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Application Submitted
        </motion.h2>
        <motion.p
          className="text-gray-500 mt-2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Thank you for applying. We will review your application shortly.
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* CV Upload Section - First Step */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Step 1: Upload Your CV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Start by uploading your CV. We'll analyze it and help you autofill the application form with relevant information.
                </p>
              </div>
              
              <CustomFileUpload
                label="Upload CV"
                accept=".pdf,.doc,.docx"
                file={cvFile}
                onChange={setCvFile}
                required={true}
              />

              {cvFile && (
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={analyzeCV}
                    disabled={isAnalyzingCV}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isAnalyzingCV ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing CV...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze CV with AI
                      </>
                    )}
                  </Button>

                  {cvAnalysis && (
                    <Button
                      type="button"
                      onClick={autofillFromCV}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Autofill Form
                    </Button>
                  )}
                </div>
              )}

              {cvAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900 mb-2">CV Analysis Complete!</h4>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>✅ Extracted personal information</p>
                        <p>✅ Found {cvAnalysis.workExperience.length} work experience entries</p>
                        <p>✅ Found {cvAnalysis.education.length} education entries</p>
                        <p>✅ Identified {cvAnalysis.skills.technical.length + cvAnalysis.skills.soft.length} skills</p>
                        {Object.keys(cvAnalysis.customFieldsSuggestions).length > 0 && (
                          <p>✅ Generated suggestions for {Object.keys(cvAnalysis.customFieldsSuggestions).length} custom fields</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Step 2: Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                  <Input 
                    id="firstName" 
                    {...form.register('firstName')} 
                    className="mt-1 focus:border-[#c084fc] focus:ring-[#c084fc] transition-colors duration-200"
                  />
                  {form.formState.errors.firstName && (
                    <motion.p
                      className="text-red-500 text-sm mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {form.formState.errors.firstName.message}
                    </motion.p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                  <Input 
                    id="lastName" 
                    {...form.register('lastName')} 
                    className="mt-1 focus:border-[#c084fc] focus:ring-[#c084fc] transition-colors duration-200"
                  />
                  {form.formState.errors.lastName && (
                    <motion.p
                      className="text-red-500 text-sm mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {form.formState.errors.lastName.message}
                    </motion.p>
                  )}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    {...form.register('email')} 
                    className="mt-1 focus:border-[#c084fc] focus:ring-[#c084fc] transition-colors duration-200"
                  />
                  {form.formState.errors.email && (
                    <motion.p
                      className="text-red-500 text-sm mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {form.formState.errors.email.message}
                    </motion.p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    {...form.register('phoneNumber')} 
                    className="mt-1 focus:border-[#c084fc] focus:ring-[#c084fc] transition-colors duration-200"
                  />
                  {form.formState.errors.phoneNumber && (
                    <motion.p
                      className="text-red-500 text-sm mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {form.formState.errors.phoneNumber.message}
                    </motion.p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Step 3: Work Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence>
                {workFields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 border border-gray-200 rounded-lg space-y-4 relative bg-gray-50/50"
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Role</Label>
                        <Input 
                          {...form.register(`workExperience.${index}.role`)} 
                          className="mt-1 focus:border-[#c084fc] focus:ring-[#c084fc] transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Company</Label>
                        <Input 
                          {...form.register(`workExperience.${index}.company`)} 
                          className="mt-1 focus:border-[#c084fc] focus:ring-[#c084fc] transition-colors duration-200"
                        />
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                        <div className="mt-1">
                          <Controller
                            control={form.control}
                            name={`workExperience.${index}.start_date`}
                            render={({ field: { onChange, value } }) => (
                              <CustomDatePicker
                                date={value}
                                onDateChange={onChange}
                                placeholder="Select start date"
                              />
                            )}
                          />
                        </div>
                        {form.formState.errors.workExperience?.[index]?.start_date && (
                          <motion.p
                            className="text-red-500 text-xs mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {form.formState.errors.workExperience[index]?.start_date?.message}
                          </motion.p>
                        )}
                      </div>
                      
                      <Controller
                        control={form.control}
                        name={`workExperience.${index}.currently_working`}
                        render={({ field: { onChange: onCurrentlyWorkingChange, value: currentlyWorking } }) => (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">End Date</Label>
                            <div className="mt-1">
                              <Controller
                                control={form.control}
                                name={`workExperience.${index}.end_date`}
                                render={({ field: { onChange, value } }) => (
                                  <CustomDatePicker
                                    date={value}
                                    onDateChange={onChange}
                                    placeholder={currentlyWorking ? "Currently working" : "Select end date"}
                                    disabled={currentlyWorking}
                                  />
                                )}
                              />
                            </div>
                            {form.formState.errors.workExperience?.[index]?.end_date && !currentlyWorking && (
                              <motion.p
                                className="text-red-500 text-xs mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                {form.formState.errors.workExperience[index]?.end_date?.message}
                              </motion.p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    
                    <Controller
                      control={form.control}
                      name={`workExperience.${index}.currently_working`}
                      render={({ field: { onChange, value, ...rest } }) => (
                        <div className="flex items-center space-x-3">
                          <CustomCheckbox
                            id={`currently_working_${index}`}
                            checked={value || false}
                            onCheckedChange={(checked: boolean) => {
                              onChange(checked);
                              if (checked) {
                                form.setValue(`workExperience.${index}.end_date`, undefined);
                              }
                            }}
                          />
                          <Label htmlFor={`currently_working_${index}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                            I currently work here
                          </Label>
                        </div>
                      )}
                    />
                    
                    {workFields.length > 1 && (
                      <motion.button
                        type="button"
                        onClick={() => removeWork(index)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => appendWork({ 
                    role: '', 
                    company: '', 
                    start_date: new Date(), 
                    end_date: new Date(), 
                    currently_working: false 
                  })}
                  className="border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white transition-all duration-200"
                >
                  <PlusCircle className="mr-2 w-4 h-4" /> Add Experience
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Step 4: Education & Qualifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence>
                {eduFields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 border border-gray-200 rounded-lg space-y-4 relative bg-gray-50/50"
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Institution</Label>
                        <Input 
                          {...form.register(`education.${index}.institution`)} 
                          className="mt-1 focus:border-[#c084fc] focus:ring-[#c084fc] transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Qualification</Label>
                        <Input 
                          {...form.register(`education.${index}.qualification`)} 
                          className="mt-1 focus:border-[#c084fc] focus:ring-[#c084fc] transition-colors duration-200"
                        />
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                        <div className="mt-1">
                          <Controller
                            control={form.control}
                            name={`education.${index}.start_date`}
                            render={({ field: { onChange, value } }) => (
                              <CustomDatePicker
                                date={value}
                                onDateChange={onChange}
                                placeholder="Select start date"
                              />
                            )}
                          />
                        </div>
                        {form.formState.errors.education?.[index]?.start_date && (
                          <motion.p
                            className="text-red-500 text-xs mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {form.formState.errors.education[index]?.start_date?.message}
                          </motion.p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">End Date</Label>
                        <div className="mt-1">
                          <Controller
                            control={form.control}
                            name={`education.${index}.end_date`}
                            render={({ field: { onChange, value } }) => (
                              <CustomDatePicker
                                date={value}
                                onDateChange={onChange}
                                placeholder="Select end date"
                              />
                            )}
                          />
                        </div>
                        {form.formState.errors.education?.[index]?.end_date && (
                          <motion.p
                            className="text-red-500 text-xs mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {form.formState.errors.education[index]?.end_date?.message}
                          </motion.p>
                        )}
                      </div>
                    </div>
                    
                    <CustomFileUpload
                      label="Upload Qualification"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      file={qualificationFiles[index]}
                      onChange={(file: File | null) => handleQualificationFileChange(index, file)}
                    />
                    
                    {eduFields.length > 1 && (
                      <motion.button
                        type="button"
                        onClick={() => removeEdu(index)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    appendEdu({ 
                      institution: '', 
                      qualification: '', 
                      start_date: new Date(), 
                      end_date: new Date() 
                    });
                    setQualificationFiles([...qualificationFiles, null]);
                  }}
                  className="border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white transition-all duration-200"
                >
                  <PlusCircle className="mr-2 w-4 h-4" /> Add Education
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Step 5: Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CustomFieldsForm 
                jobId={job.id} 
                register={form.register}
                setValue={form.setValue}
                watch={form.watch}
                formState={form.formState}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Step 6: Cover Letter (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="coverLetter" className="text-sm font-medium text-gray-700">Cover Letter</Label>
                <Textarea 
                  id="coverLetter" 
                  {...form.register('coverLetter')} 
                  className="mt-1 min-h-[120px] focus:border-[#c084fc] focus:ring-[#c084fc] transition-colors duration-200 resize-none"
                  placeholder="Tell us why you're interested in this position..."
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            type="submit" 
            className="w-full bg-black hover:bg-gray-800 text-white py-3 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader2 className="animate-spin mr-2" />
                Submitting Application...
              </motion.div>
            ) : (
              'Submit Application'
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
 