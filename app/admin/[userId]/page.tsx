import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, GraduationCap, Briefcase, Award, Users, CreditCard, Send } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Database } from '@/types/supabase';
import { UserPreferencesView } from '@/components/admin/user-preferences-view';
import { createClient } from '@/lib/supabase/server';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  subscription_status: string;
  subscription_plan: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkExperience {
  id: number;
  user_id: string;
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  location: string | null;
}

interface Education {
  id: number;
  user_id: string;
  institution_name: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  location: string | null;
  current_education: boolean;
}

interface Certification {
  id: number;
  user_id: string;
  name: string;
  issuer: string;
  date_obtained: string;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
}

interface Application {
  id: number;
  user_id: string;
  job_title: string;
  company: string;
  status: string;
  applied_date: string;
  notes: string | null;
  salary_range: string | null;
  location: string | null;
  contact_name: string | null;
  contact_email: string | null;
  next_steps: string | null;
}

interface JobPosting {
  id: number
  title: string
  company: string
  location: string
  job_type: string
  salary_range: string
  description: string
  requirements: string
  benefits: string
  application_deadline: string
  is_active: boolean
  created_at: string
  updated_at: string
}

type PageProps = {
    params: {
        userId: string;
    }
}

async function getUserData(supabase: any, userId: string) {
    const { data: user, error } = await supabase
        .from('users')
        .select(`
            id,
            email,
            raw_user_meta_data,
            last_sign_in_at
        `)
        .eq('id', userId)
        .single();
    
    if (error || !user) {
        notFound();
    }
    return user;
}

async function getUserPreferences(supabase: any, userId:string) {
    const { data: preferences, error } = await supabase
        .from('job_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    // An error is expected if no preferences are found, so we just return null.
    if (error) {
        return null;
    }

    return preferences;
}

export default async function AdminUserDetailsPage(props: PageProps) {
    const { params } = await props;
    const supabase = await createClient();
    const user = await getUserData(supabase, params.userId);
    const preferences = await getUserPreferences(supabase, params.userId);
    
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">User Details</h1>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-2">Account Information</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Full Name:</strong> {user.raw_user_meta_data?.full_name || 'N/A'}</p>
                 <p><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</p>
            </div>

            <UserPreferencesView preferences={preferences} />
        </div>
    )
}