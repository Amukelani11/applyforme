"use client"

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false);
  const [adminStatus, setAdminStatus] = useState<any>(null);
  
  const supabase = createClient();
  const { toast } = useToast();

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Not logged in",
          description: "Please log in first",
          variant: "destructive",
        });
        return;
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('id, email, full_name, is_admin')
        .eq('id', user.id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setAdminStatus(userData);
      
      if (userData.is_admin) {
        toast({
          title: "Admin Access Confirmed",
          description: "You have admin privileges",
        });
      } else {
        toast({
          title: "Not Admin",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Not logged in",
          description: "Please log in first",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "You are now an admin!",
      });

      // Refresh admin status
      await checkAdminStatus();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Setup</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Access Check
          </CardTitle>
          <CardDescription>
            Check and configure your admin access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button onClick={checkAdminStatus} disabled={loading}>
              Check Admin Status
            </Button>
            <Button onClick={makeAdmin} disabled={loading} variant="outline">
              Make Me Admin
            </Button>
          </div>

          {adminStatus && (
            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Current User Status:</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {adminStatus.full_name || 'N/A'}</p>
                <p><strong>Email:</strong> {adminStatus.email}</p>
                <p><strong>User ID:</strong> {adminStatus.id}</p>
                <div className="flex items-center gap-2">
                  <strong>Admin Status:</strong>
                  {adminStatus.is_admin ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>Not Admin</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>1. Click "Check Admin Status" to see your current admin privileges</p>
            <p>2. If you're not an admin, click "Make Me Admin" to grant yourself admin access</p>
            <p>3. Once you're an admin, you can access the main admin dashboard</p>
            <p>4. Go to <code className="bg-gray-100 px-1 rounded">/admin</code> to access the admin dashboard</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 