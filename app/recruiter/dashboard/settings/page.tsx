"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { createClient } from '@/lib/supabase/client'
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
  Loader2,
  X
} from "lucide-react"
import { slugify } from "@/lib/utils"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTour } from '@/components/tour/useTour'

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

const SettingsTabs = ({ tabs, activeTab, setActiveTab }: { tabs: { id: string, label: string, icon: React.ReactNode }[], activeTab: string, setActiveTab: (id: string) => void }) => {
  return (
    <div className="flex space-x-8 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`${
            activeTab === tab.id ? 'text-theme-600' : 'text-gray-500 hover:text-gray-700'
          } relative py-4 px-2 text-sm font-medium transition-colors duration-200 focus:outline-none`}
        >
          <span className="flex items-center gap-2">
            {tab.icon}
            {tab.label}
          </span>
          {activeTab === tab.id && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-600"
              layoutId="underline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default function RecruiterSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const tour = useTour()
  
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

  const [activeTab, setActiveTab] = useState("profile");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

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

      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !user.email) {
        throw new Error("Could not find user. Please sign in again.");
      }

      // Verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwords.current,
      });

      if (signInError) {
        throw new Error("Your current password is not correct.");
      }
      
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

  // Update image previews when files change
  useEffect(() => {
    if (logoFile) {
      setLogoPreview(URL.createObjectURL(logoFile));
    } else {
      setLogoPreview(profile.logo_url || null);
    }
  }, [logoFile, profile.logo_url]);

  useEffect(() => {
    if (coverFile) {
      setCoverPreview(URL.createObjectURL(coverFile));
    } else {
      setCoverPreview(profile.cover_image_url || null);
    }
  }, [coverFile, profile.cover_image_url]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2e6417]"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'account', label: 'Account', icon: <Shield className="h-4 w-4" /> },
  ];

  const inputStyles = "w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md focus:border-theme-500 focus:ring-theme-500 focus:ring-opacity-50 focus:outline-none transition-colors duration-200";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your recruiter account and preferences</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => { localStorage.removeItem('recruiter_tour_seen'); tour.start() }}>Restart Product Tour</Button>
          </div>
        </div>

        <SettingsTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <motion.div
          key={activeTab}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-8 rounded-lg shadow-sm border border-gray-100"
        >
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Company Profile</h3>
                <p className="text-gray-500 text-sm mt-1">Update your company's public information.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cover Image Upload */}
                <div className="md:col-span-3">
                  <label className="text-sm font-medium text-gray-700">Cover Image</label>
                  <div className="mt-2 flex justify-center items-center w-full h-48 rounded-lg border-2 border-dashed border-gray-300 relative bg-gray-50 overflow-hidden">
                    {coverPreview ? (
                      <>
                        <Image src={coverPreview} alt="Cover preview" layout="fill" objectFit="cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Button variant="outline" className="bg-white text-gray-800 hover:bg-gray-100" onClick={() => document.getElementById('cover-upload')?.click()}>Change</Button>
                          <Button variant="ghost" size="icon" className="text-white hover:bg-black/50 ml-2" onClick={() => setCoverFile(null)}><X className="h-5 w-5"/></Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">No cover image uploaded</p>
                        <Button variant="link" className="text-theme-600 hover:text-theme-700 mt-1" onClick={() => document.getElementById('cover-upload')?.click()}>Upload an image</Button>
                      </div>
                    )}
                    <input id="cover-upload" type="file" className="hidden" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Company Logo</label>
                  <div className="mt-2 flex items-center space-x-6">
                    <div className="flex-shrink-0 h-24 w-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative">
                      {logoPreview ? (
                        <Image src={logoPreview} alt="Logo preview" layout="fill" objectFit="cover" />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Button variant="outline" className="border-theme-300 text-theme-700 hover:bg-theme-50" onClick={() => document.getElementById('logo-upload')?.click()}>Change Logo</Button>
                      {logoFile && <p className="text-xs text-gray-500 mt-2">{logoFile.name} <button onClick={() => setLogoFile(null)} className="text-red-500 hover:underline">(remove)</button></p>}
                    </div>
                    <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                <div>
                  <label htmlFor="companyName" className="text-sm font-medium text-gray-700 block mb-2">Company Name</label>
                  <Input id="companyName" value={profile.company_name} onChange={(e) => setProfile({...profile, company_name: e.target.value})} className={inputStyles} />
                </div>
                <div>
                  <label htmlFor="fullName" className="text-sm font-medium text-gray-700 block mb-2">Your Full Name</label>
                  <Input id="fullName" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className={inputStyles} />
                </div>
                <div>
                  <label htmlFor="website" className="text-sm font-medium text-gray-700 block mb-2">Website</label>
                  <Input id="website" value={profile.website} onChange={(e) => setProfile({...profile, website: e.target.value})} className={inputStyles} />
                </div>
                <div>
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700 block mb-2">Phone</label>
                  <Input id="phone" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className={inputStyles} />
                </div>
                <div>
                  <label htmlFor="address" className="text-sm font-medium text-gray-700 block mb-2">Address</label>
                  <Input id="address" value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} className={inputStyles} />
                </div>
              </div>
              
              <div>
                <label htmlFor="bio" className="text-sm font-medium text-gray-700 block mb-2">Company Bio</label>
                <Textarea id="bio" value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} className={inputStyles} rows={5} />
              </div>

              <div className="flex justify-end">
                <Button className="bg-theme-600 hover:bg-theme-700 text-white" disabled={saving} onClick={handleProfileUpdate}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Security Settings</h3>
                <p className="text-gray-500 text-sm mt-1">Change your account password.</p>
              </div>

              <div className="space-y-6 pt-6 border-t border-gray-100">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className={inputStyles}
                      placeholder="Enter your current password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                      {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                   <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className={inputStyles}
                      placeholder="Enter new password"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                      {showNewPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className={inputStyles}
                      placeholder="Confirm new password"
                    />
                     <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                      {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                 <Button onClick={handlePasswordChange} className="bg-theme-600 hover:bg-theme-700 text-white" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Update Password
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Notification Settings</h3>
                <p className="text-gray-500 text-sm mt-1">Control how you receive notifications from us.</p>
              </div>

              <div className="space-y-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="application_alerts">Application Alerts</Label>
                    <p className="text-xs text-gray-500">Get an email for each new application.</p>
                  </div>
                  <Switch id="application_alerts" checked={notifications.application_alerts} onCheckedChange={(checked) => setNotifications({...notifications, application_alerts: checked})} />
                </div>
                <div className="flex items-center justify-between">
                   <div>
                    <Label htmlFor="job_expiry_reminders">Job Expiry Reminders</Label>
                    <p className="text-xs text-gray-500">Receive reminders for jobs that are about to expire.</p>
                  </div>
                  <Switch id="job_expiry_reminders" checked={notifications.job_expiry_reminders} onCheckedChange={(checked) => setNotifications({...notifications, job_expiry_reminders: checked})} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly_reports">Weekly Reports</Label>
                    <p className="text-xs text-gray-500">Get a weekly summary of your job activities.</p>
                  </div>
                  <Switch id="weekly_reports" checked={notifications.weekly_reports} onCheckedChange={(checked) => setNotifications({...notifications, weekly_reports: checked})} />
                </div>
                 <div className="flex items-center justify-between">
                   <div>
                    <Label htmlFor="marketing_emails">Marketing Emails</Label>
                    <p className="text-xs text-gray-500">Receive news, feature updates, and offers from Talio.</p>
                  </div>
                  <Switch id="marketing_emails" checked={notifications.marketing_emails} onCheckedChange={(checked) => setNotifications({...notifications, marketing_emails: checked})} />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleNotificationUpdate} className="bg-theme-600 hover:bg-theme-700 text-white" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Settings
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-red-600">Danger Zone</h3>
                <p className="text-gray-500 text-sm mt-1">Manage your account deletion.</p>
              </div>

              <div className="p-6 border border-red-200 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-700">Delete Your Account</h4>
                <p className="text-sm text-red-600 mt-2">
                  Once you delete your account, there is no going back. All of your data, including your profile, job postings, and applications will be permanently removed. Please be certain.
                </p>
                <div className="mt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={saving}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete My Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                           {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 