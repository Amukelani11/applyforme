'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, UploadCloud, File as FileIcon } from 'lucide-react';
import { submitPublicApplication } from '../actions';

interface PublicApplicationFormProps {
  jobId: number;
  onSuccess: () => void;
}

export function PublicApplicationForm({ jobId, onSuccess }: PublicApplicationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File too large", description: "Please upload a file smaller than 5MB.", variant: "destructive" });
        return;
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        toast({ title: "Invalid file type", description: "Please upload a PDF or Word document.", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      toast({ title: "CV is required", description: "Please upload your CV.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    formData.append('cv', selectedFile);
    
    try {
      const result = await submitPublicApplication(jobId, formData);

      if (result.success) {
        toast({ title: "Application submitted!", description: "Your application has been sent to the recruiter." });
        onSuccess();
        formRef.current?.reset();
        setSelectedFile(null);
      } else {
        toast({ title: "Submission failed", description: result.error, variant: "destructive" });
      }
    } catch (error) {
       toast({ title: "An unexpected error occurred", description: "Please try again later.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Apply for this Job</CardTitle>
        <CardDescription>Fill out the form below to submit your application.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label>Upload CV</Label>
             <div 
                className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
             >
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    name="cv-upload" // Use a different name to avoid being included in formData directly
                />
                {selectedFile ? (
                    <div className="flex flex-col items-center text-sm text-gray-600">
                        <FileIcon className="w-8 h-8 text-purple-500 mb-2" />
                        <span>{selectedFile.name}</span>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-sm text-gray-600">
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                        <span>Click to upload or drag and drop</span>
                        <p className="text-xs text-gray-500">PDF or DOCX (MAX. 5MB)</p>
                    </div>
                )}
             </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Application
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 