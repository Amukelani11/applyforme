"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff,
  Building,
  Phone,
  Mail,
  MapPin,
  Globe,
  AlertTriangle,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react"
import { slugify } from "@/lib/utils"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface RecruiterProfile {
  id: string
  email: string
  full_name: string
  company_name: string
  phone: string
  address: string
  website: string
  bio: string
  created_at: string
  updated_at: string
  company_slug: string
  cover_image_url?: string
  logo_url?: string
}

interface NotificationSettings {
  email_notifications: boolean
  application_alerts: boolean
  job_expiry_reminders: boolean
  weekly_reports: boolean
  marketing_emails: boolean
}

export default function RecruiterSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [profile, setProfile] = useState<Partial<RecruiterProfile>>({
    full_name: "",
    company_name: "",
    phone: "",
    address: "",
    website: "",
    bio: "",
    cover_image_url: "",
    logo_url: "",
  })
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    application_alerts: true,
    job_expiry_reminders: true,
    weekly_reports: false,
    marketing_emails: false,
  })
  
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      if (!session?.user) {
        router.push('/recruiter/login')
        return
      }

      // Fetch recruiter profile
      const { data: profileData, error: profileError } = await supabase
        .from('recruiters')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError)
      }

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          company_name: profileData.company_name || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          website: profileData.website || "",
          bio: profileData.bio || "",
          company_slug: profileData.company_slug || "",
          cover_image_url: profileData.cover_image_url || "",
          logo_url: profileData.logo_url || "",
        })
      }

      // Fetch notification settings
      const { data: notificationData, error: notificationError } = await supabase
        .from('recruiter_notifications')
        .select('*')
        .eq('recruiter_id', session.user.id)
        .single()

      if (notificationData) {
        setNotifications(notificationData)
      }

    } catch (error: any) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    try {
      setSaving(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error("No session")

      const { error } = await supabase
        .from('recruiters')
        .update({
          full_name: profile.full_name,
          company_name: profile.company_name,
          company_slug: slugify(profile.company_name || ""),
          phone: profile.phone,
          address: profile.address,
          website: profile.website,
          bio: profile.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', session.user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      })
      return
    }

    if (passwords.new.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      })

      if (error) throw error

      setPasswords({ current: "", new: "", confirm: "" })
      toast({
        title: "Success",
        description: "Password updated successfully",
      })
    } catch (error: any) {
      console.error('Error updating password:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationUpdate = async () => {
    try {
      setSaving(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error("No session")

      const { error } = await supabase
        .from('recruiter_notifications')
        .upsert({
          recruiter_id: session.user.id,
          ...notifications,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Notification settings updated",
      })
    } catch (error: any) {
      console.error('Error updating notifications:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update notification settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setSaving(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error("No session")

      // Delete recruiter data
      await supabase
        .from('recruiters')
        .delete()
        .eq('user_id', session.user.id)

      // Delete job postings
      await supabase
        .from('job_postings')
        .delete()
        .eq('recruiter_id', session.user.id)

      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(session.user.id)
      if (error) throw error

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
      })
      
      router.push('/recruiter/login')
    } catch (error: any) {
      console.error('Error deleting account:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No session");

      const filePath = `cover-images/${session.user.id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('documents') // Assuming you have a bucket named 'documents' or similar
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('recruiters')
        .update({ cover_image_url: publicUrl })
        .eq('user_id', session.user.id);
      
      if (dbError) throw dbError;

      setProfile(prev => ({ ...prev, cover_image_url: publicUrl }));
      toast({ title: "Success", description: "Cover image updated successfully." });

    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to upload image.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) {
        throw new Error("You must select an image to upload.")
      }
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error("User not logged in")

      const fileExt = file.name.split('.').pop()
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { error: uploadError } = await supabase.storage.from('recruiters').upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage.from('recruiters').getPublicUrl(filePath)
      
      setProfile(prev => ({ ...prev, logo_url: publicUrl }))

      const { error: dbError } = await supabase
        .from('recruiters')
        .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('user_id', session.user.id)

      if (dbError) throw dbError

      toast({
        title: "Success!",
        description: "Company logo uploaded successfully.",
      })

    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c084fc]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your recruiter account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>This is how your company will appear to candidates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" value={profile.company_name} onChange={e => setProfile({...profile, company_name: e.target.value})} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="fullName">Your Full Name</Label>
                    <Input id="fullName" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Company Bio</Label>
                  <Textarea id="bio" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="Tell candidates about your company..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" value={profile.website} onChange={e => setProfile({...profile, website: e.target.value})} placeholder="https://example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Branding</CardTitle>
                <CardDescription>Upload your company's logo and cover image.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile.logo_url} alt="Company Logo" />
                      <AvatarFallback><Building /></AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <p className="text-sm text-muted-foreground mb-2">Upload a square image (e.g., 200x200px). JPG, PNG, or SVG.</p>
                      <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="max-w-xs" />
                    </div>
                  </div>
                </div>
                 <Separator />
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div 
                    className="w-full h-40 bg-gray-100 rounded-md flex items-center justify-center border-2 border-dashed"
                    style={{ backgroundImage: `url(${profile.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  >
                    {!profile.cover_image_url && <p className="text-muted-foreground">No cover image uploaded</p>}
                  </div>
                  <Input id="cover-image-upload" type="file" accept="image/*" onChange={handleCoverImageUpload} className="max-w-xs mt-2" />
                  <p className="text-sm text-muted-foreground">Upload a landscape image for your company profile page (e.g., 1200x400px).</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleProfileUpdate} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>
                  Update your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handlePasswordChange}
                  disabled={saving || !passwords.new || !passwords.confirm}
                  className="bg-[#c084fc] hover:bg-[#a855f7] text-white"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {saving ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>
                  Choose how and when you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email_notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email_notifications"
                      checked={notifications.email_notifications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email_notifications: checked }))}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="application_alerts">Application Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified when candidates apply</p>
                    </div>
                    <Switch
                      id="application_alerts"
                      checked={notifications.application_alerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, application_alerts: checked }))}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="job_expiry_reminders">Job Expiry Reminders</Label>
                      <p className="text-sm text-gray-500">Reminders before job postings expire</p>
                    </div>
                    <Switch
                      id="job_expiry_reminders"
                      checked={notifications.job_expiry_reminders}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, job_expiry_reminders: checked }))}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weekly_reports">Weekly Reports</Label>
                      <p className="text-sm text-gray-500">Receive weekly performance summaries</p>
                    </div>
                    <Switch
                      id="weekly_reports"
                      checked={notifications.weekly_reports}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weekly_reports: checked }))}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing_emails">Marketing Emails</Label>
                      <p className="text-sm text-gray-500">Receive updates about new features and promotions</p>
                    </div>
                    <Switch
                      id="marketing_emails"
                      checked={notifications.marketing_emails}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing_emails: checked }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleNotificationUpdate}
                  disabled={saving}
                  className="bg-[#c084fc] hover:bg-[#a855f7] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Danger Zone</span>
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Delete Account</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. This will permanently delete:
                  </p>
                  <ul className="text-sm text-red-700 space-y-1 mb-4">
                    <li>• All your job postings</li>
                    <li>• All candidate applications</li>
                    <li>• Your profile and settings</li>
                    <li>• All associated data</li>
                  </ul>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {saving ? "Deleting..." : "Delete Account"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 