'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Loader2, Check, Zap } from 'lucide-react';
import { updateJobSharing } from '../actions';
import { slugify } from '@/lib/utils';

interface ShareJobDialogProps {
  job: {
    id: number;
    title: string;
    public_share_id: string | null;
    allow_public_applications: boolean;
    public_application_count: number;
    recruiter: { company_slug: string } | null;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedJob: Partial<any>) => void;
  currentPlan: string;
}

export function ShareJobDialog({ job, isOpen, onOpenChange, onUpdate, currentPlan }: ShareJobDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [allowPublic, setAllowPublic] = useState(job.allow_public_applications);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateJobSharing(job.id, allowPublic);
      if (result.error) throw new Error(result.error);
      
      onUpdate({ ...result.data });
      toast({ title: 'Settings saved!' });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error saving settings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCopyLink = () => {
    const companySlug = job.recruiter?.company_slug || slugify('');
    if (!companySlug) {
      toast({ title: 'Error', description: 'Company not configured yet.', variant: 'destructive' });
      return;
    }
    const jobSlug = slugify(job.title);
    const shareableLink = `${window.location.origin}/jobs/public/${companySlug}/${jobSlug}-${job.id}`;
    navigator.clipboard.writeText(shareableLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); 
    toast({ title: 'Copied to clipboard!' });
  };
  
  const getShareableLink = () => {
    const companySlug = job.recruiter?.company_slug || slugify('');
    if (!companySlug) return "Set company profile to generate link.";
    const jobSlug = slugify(job.title);
    return `${window.location.origin}/jobs/public/${companySlug}/${jobSlug}-${job.id}`;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Public Link</DialogTitle>
          <DialogDescription>
            {currentPlan === 'free'
              ? 'Upgrade to Premium to share your job with a public link.'
              : 'Generate a shareable link to allow anyone to view this job and apply, even without an account.'}
          </DialogDescription>
        </DialogHeader>

        {currentPlan === 'free' ? (
          <div className="my-6 text-center p-6 bg-gray-50 rounded-lg">
            <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Unlock Public Job Sharing</h3>
            <p className="text-gray-600 mt-2 mb-6">
                Upgrade to a Premium plan to share your job with a public link and reach more candidates.
            </p>
            <Link href="/pricing">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 my-4">
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className='space-y-0.5'>
                      <Label htmlFor="allow_public">Enable Public Applications</Label>
                      <p className='text-xs text-muted-foreground'>
                         {currentPlan === 'premium' 
                            ? 'Allows unlimited applications from non-users.' 
                            : 'Allows up to 5 applications from non-users.'}
                      </p>
                  </div>
                  <Switch
                      id="allow_public"
                      checked={allowPublic}
                      onCheckedChange={setAllowPublic}
                  />
              </div>

              {allowPublic && job.public_share_id && (
                  <div>
                      <Label>Shareable Link</Label>
                      <div className="flex items-center space-x-2 mt-1">
                          <Input
                              readOnly
                              value={getShareableLink()}
                          />
                          <Button variant="outline" size="icon" onClick={handleCopyLink}>
                             {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                      </div>
                      {currentPlan !== 'premium' && (
                       <p className="text-sm text-gray-600 mt-2">
                          {job.public_application_count || 0}/5 public applications used.
                        </p>
                      )}
                  </div>
              )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {currentPlan === 'free' ? 'Close' : 'Cancel'}
          </Button>
          {currentPlan !== 'free' && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 