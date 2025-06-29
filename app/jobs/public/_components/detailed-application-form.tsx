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
import { useToast } from '@/hooks/use-toast';
import { detailedApply, createSignedUploadUrl } from '../../actions';
import { Loader2, PlusCircle, Trash2, CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/lib/supabase/client';

const workExperienceSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  company: z.string().min(1, 'Company is required'),
  duration: z.string().optional(),
  currently_working: z.boolean().optional(),
}).refine(data => data.currently_working || (data.duration && data.duration.length > 0), {
    message: "Duration is required unless you are currently working here.",
    path: ["duration"],
});

const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  duration: z.string().min(1, 'Duration is required'),
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
});

type DetailedApplicationFormValues = z.infer<typeof formSchema>;

interface DetailedApplicationFormProps {
  job: { id: number; title: string; };
}

const sanitizeFileName = (name: string) => {
  // Replace spaces with underscores and remove characters that are not letters, numbers, hyphens, underscores, or dots.
  return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-._]/g, '');
};

export function DetailedApplicationForm({ job }: DetailedApplicationFormProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [qualificationFiles, setQualificationFiles] = useState<(File | null)[]>([]);

  const form = useForm<DetailedApplicationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      coverLetter: '',
      cv_path: '',
      workExperience: [{ role: '', company: '', duration: '', currently_working: false }],
      education: [{ institution: '', qualification: '', duration: '' }],
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
        
        // Insert into documents table after CV upload
        await supabase.from('documents').insert({
          user_id: applicantEmail,
          name: cvFile.name,
          type: 'cv',
          url: signedUrlResult.path,
        });
        
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

        // 3. Submit metadata to server action
        const result = await detailedApply(job.id, {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phoneNumber: values.phoneNumber,
            cv_path: values.cv_path || "",
            workExperience: [],
            education: [],
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
      <div className="flex flex-col items-center justify-center h-full">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h2 className="text-2xl font-bold mt-4">Application Submitted</h2>
        <p className="text-gray-500 mt-2">Thank you for applying. We will review your application shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...form.register('firstName')} />
              {form.formState.errors.firstName && <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...form.register('lastName')} />
              {form.formState.errors.lastName && <p className="text-red-500 text-sm">{form.formState.errors.lastName.message}</p>}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...form.register('email')} />
              {form.formState.errors.email && <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" {...form.register('phoneNumber')} />
              {form.formState.errors.phoneNumber && <p className="text-red-500 text-sm">{form.formState.errors.phoneNumber.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Work Experience</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {workFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
              <div>
                <Label>Role</Label>
                <Input {...form.register(`workExperience.${index}.role`)} />
              </div>
              <div>
                <Label>Company</Label>
                <Input {...form.register(`workExperience.${index}.company`)} />
              </div>
              <Controller
                control={form.control}
                name={`workExperience.${index}.currently_working`}
                render={({ field: { onChange, value, ...rest } }) => (
                  <>
                    {!value && (
                       <div>
                          <Label>Duration (e.g., 2020 - 2023)</Label>
                          <Input {...form.register(`workExperience.${index}.duration`)} />
                       </div>
                    )}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={`currently_working_${index}`}
                            checked={value}
                            onCheckedChange={onChange}
                            {...rest}
                        />
                        <Label htmlFor={`currently_working_${index}`}>I currently work here</Label>
                    </div>
                  </>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeWork(index)} className="absolute top-2 right-2"><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => appendWork({ role: '', company: '', duration: '', currently_working: false })}><PlusCircle className="mr-2 w-4 h-4" /> Add Experience</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Education & Qualifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {eduFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                <div>
                  <Label>Institution</Label>
                  <Input {...form.register(`education.${index}.institution`)} />
                </div>
                <div>
                  <Label>Qualification</Label>
                  <Input {...form.register(`education.${index}.qualification`)} />
                </div>
                 <div>
                  <Label>Duration (e.g., 2018 - 2022)</Label>
                  <Input {...form.register(`education.${index}.duration`)} />
                </div>
                <div>
                    <Label>Upload Qualification (Optional)</Label>
                    <Input type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={(e) => handleQualificationFileChange(index, e.target.files ? e.target.files[0] : null)}/>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeEdu(index)} className="absolute top-2 right-2"><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => {
              appendEdu({ institution: '', qualification: '', duration: '' });
              setQualificationFiles([...qualificationFiles, null]);
          }}><PlusCircle className="mr-2 w-4 h-4" /> Add Education</Button>
        </CardContent>
      </Card>

      <Card>
          <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
              <Textarea id="coverLetter" {...form.register('coverLetter')} />
            </div>
            <div>
              <Label htmlFor="cv">Upload CV</Label>
              <Input 
                type="file" 
                id="cv"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setCvFile(e.target.files ? e.target.files[0] : null)}
                required
              />
              {form.formState.errors.cv_path && <p className="text-red-500 text-sm">{form.formState.errors.cv_path.message}</p>}
            </div>
          </CardContent>
      </Card>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Application'}
      </Button>
    </form>
  );
}
 