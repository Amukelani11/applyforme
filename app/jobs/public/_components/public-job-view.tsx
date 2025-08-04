'use client'

import React, { useState, useEffect } from "react"
import { createClient } from '@/lib/supabase/client';
import { Badge } from "@/components/ui/badge"
import { Briefcase, Clock, MapPin, DollarSign, Calendar, CheckCircle, FileText, Star, Zap, UserCheck, User, LogIn, UserPlus, ArrowRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { fastApply } from "../../actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"

type UserProfile = {
  isLoggedIn: boolean;
  isProfileComplete: boolean;
  userId: string;
} | null;

type PublicJobViewProps = {
  job: {
    id: number;
    title: string;
    location: string;
    job_type: string;
    contract_term: string;
    salary_range: string;
    salary_type: string;
    description: string | null;
    requirements: string | null;
    benefits: string | null;
    application_deadline: string | null;
    limitReached: boolean;
    job_slug: string;
    recruiter: {
        company_name: string | null;
        company_slug: string | null;
    } | null;
  };
  userProfile: UserProfile;
  companySlug?: string;
}

// Utility function to format text with bullet points
const formatTextWithBullets = (text: string | null) => {
  if (!text) return null;

  const lines = text.split('\n').filter(line => line.trim());
  
  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null;
        
        // Check if it's already a bullet point
        const isBullet = trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*');
        const cleanedLine = isBullet ? trimmedLine.substring(1).trim() : trimmedLine;
        
        return (
          <motion.div 
            key={index}
            className="flex items-start space-x-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="w-1.5 h-1.5 bg-gray-700 rounded-full mt-2.5 flex-shrink-0"></div>
            <span className="text-gray-700 leading-relaxed">{cleanedLine}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

// Public Header Component
const PublicHeader = ({ userProfile }: { userProfile: UserProfile }) => {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/applyforme.svg"
              alt="ApplyForMe"
              width={40}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Right side navigation */}
          <div className="flex items-center space-x-4">
            {userProfile?.isLoggedIn ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 font-medium">
                    <LogIn className="h-4 w-4 mr-2" />
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-[#c084fc] hover:bg-[#a855f7] text-white font-medium shadow-sm hover:shadow-md transition-all duration-200">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Application Modal Component
const ApplicationModal = ({ userProfile, jobTitle, companyName, applyLink }: { 
  userProfile: UserProfile; 
  jobTitle: string; 
  companyName: string;
  applyLink: string;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 20px 30px rgba(0, 0, 0, 0.15)"
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Button 
            size="lg" 
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-gray-300"
          >
            <motion.div
              className="flex items-center"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Apply Now
            </motion.div>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Apply for {jobTitle}</DialogTitle>
            <DialogDescription className="text-gray-600">
              Choose how you'd like to apply to {companyName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {userProfile?.isLoggedIn ? (
              <Link href="/dashboard" className="block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Apply with Your Profile
                  </Button>
                </motion.div>
              </Link>
            ) : (
              <>
                <Link href="/login" className="block">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button variant="outline" className="w-full py-3 border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                      <LogIn className="w-4 h-4 mr-2" />
                      Log In to Apply
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/signup" className="block">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="w-full bg-[#c084fc] hover:bg-[#a855f7] text-white py-3 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account & Apply
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}
            <Link href={applyLink} className="block">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button variant="ghost" className="w-full py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200">
                  <FileText className="w-4 h-4 mr-2" />
                  Apply as Guest (Limited Features)
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export function PublicJobView({ job, userProfile, companySlug }: PublicJobViewProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const trackView = async () => {
      const viewedKey = `job_viewed_${job.id}`;
      if (!localStorage.getItem(viewedKey)) {
        const { error } = await supabase.rpc('increment_job_view', { job_id_param: job.id });
        if (error) {
          console.error("Error tracking view:", error.message);
        } else {
          localStorage.setItem(viewedKey, 'true');
        }
      }
    };
    trackView();
  }, [job.id, supabase]);
  
  const { limitReached, recruiter, application_deadline } = job;

  const handleFastApply = async () => {
    if (!userProfile?.userId) return;
    setIsSubmitting(true);
    
    const result = await fastApply(job.id, userProfile.userId);
    
    if (result.success) {
      setIsSuccess(true);
      toast({ title: "Application Submitted!", description: "Your profile has been sent to the recruiter." });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    
    setIsSubmitting(false);
  };

  const formattedDeadline = application_deadline
    ? new Date(application_deadline).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not specified';

  const applyLink = `/jobs/public/apply/${companySlug}/${job.job_slug}-${job.id}`;
    
  if (isSuccess) {
    return (
      <>
        <PublicHeader userProfile={userProfile} />
        <motion.div 
          className="flex flex-col items-center justify-center min-h-screen bg-white p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div 
            className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center max-w-md w-full"
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h1>
              <p className="text-gray-600">
                  Your application for the <span className="font-semibold">{job.title}</span> position has been successfully sent to <span className="font-semibold">{recruiter?.company_name}</span>.
              </p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="mt-6"
              >
                <Link href="/">
                  <Button className="bg-[#c084fc] hover:bg-[#a855f7] text-white px-6 py-2">
                    Continue Exploring Jobs
                  </Button>
                </Link>
              </motion.div>
          </motion.div>
        </motion.div>
      </>
    );
  }

  if (limitReached) {
      return (
        <>
          <PublicHeader userProfile={userProfile} />
          <motion.div 
            className="flex flex-col items-center justify-center min-h-screen bg-white p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center max-w-md w-full"
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Eye className="w-16 h-16 text-red-500 mx-auto mb-6" />
                </motion.div>
                <h1 className="text-2xl font-bold text-red-600 mb-3">Applications Closed</h1>
                <p className="text-gray-600">
                    This job is no longer accepting public applications. Thank you for your interest.
                </p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="mt-6"
                >
                  <Link href="/">
                    <Button className="bg-[#c084fc] hover:bg-[#a855f7] text-white px-6 py-2">
                      Explore Other Jobs
                    </Button>
                  </Link>
                </motion.div>
            </motion.div>
         </motion.div>
        </>
      )
  }

  return (
    <>
      <PublicHeader userProfile={userProfile} />
      <motion.div 
        className="min-h-screen bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Job Details Section */}
            <motion.div 
              className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-8 lg:p-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">{job.title}</h1>
                  <p className="text-xl text-gray-600 font-medium mb-8">{recruiter?.company_name}</p>
                </motion.div>
                
                <motion.div 
                  className="flex flex-wrap gap-3 mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-50 text-gray-700 border-gray-200">
                      <MapPin className="w-4 h-4" /> {job.location}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-50 text-gray-700 border-gray-200">
                      <Briefcase className="w-4 h-4" /> {job.job_type}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-50 text-gray-700 border-gray-200">
                      <Clock className="w-4 h-4" /> {job.contract_term}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-50 text-gray-700 border-gray-200">
                      <DollarSign className="w-4 h-4" /> {job.salary_range} ({job.salary_type})
                    </Badge>
                </motion.div>

                {/* Job Description */}
                <motion.div 
                  className="mb-10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-3 text-gray-500" />
                    Job Description
                  </h3>
                  {formatTextWithBullets(job.description)}
                </motion.div>
                
                {/* Requirements */}
                {job.requirements && (
                  <motion.div 
                    className="mb-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-3 text-gray-500" />
                      Requirements
                    </h3>
                    {formatTextWithBullets(job.requirements)}
                  </motion.div>
                )}

                {/* Benefits */}
                {job.benefits && (
                  <motion.div 
                    className="mb-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Star className="w-5 h-5 mr-3 text-gray-500" />
                      Benefits & Perks
                    </h3>
                    {formatTextWithBullets(job.benefits)}
                  </motion.div>
                )}

                 {/* Application Deadline */}
                 <motion.div 
                   className="mt-10 pt-6 border-t border-gray-100"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.4, delay: 0.7 }}
                 >
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        Application Deadline
                    </h3>
                    <p className="text-gray-600">{formattedDeadline}</p>
                </motion.div>
            </motion.div>

            {/* Application Section */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 lg:p-8 sticky top-24">
                {userProfile?.isLoggedIn && userProfile?.isProfileComplete ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserCheck className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">You're Ready to Apply!</h3>
                      <p className="text-gray-600">
                        Your profile is complete. Apply instantly with your saved CV and details.
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        onClick={handleFastApply} 
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
                        disabled={isSubmitting}
                        size="lg"
                      >
                        <motion.div
                          className="flex items-center justify-center"
                          whileHover={{ x: 3 }}
                          transition={{ duration: 0.2 }}
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          ) : (
                            <UserCheck className="w-5 h-5 mr-2" />
                          )}
                          Apply with Your Profile
                        </motion.div>
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-[#c084fc] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-[#c084fc]" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Apply Now</h3>
                      <p className="text-gray-600">
                        Submit a detailed application to stand out from the crowd.
                      </p>
                    </div>
                    <ApplicationModal 
                      userProfile={userProfile} 
                      jobTitle={job.title} 
                      companyName={recruiter?.company_name || 'this company'}
                      applyLink={applyLink}
                    />
                  </motion.div>
                )}

                {/* Additional Info */}
                <motion.div 
                  className="mt-8 pt-6 border-t border-gray-200 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <p className="text-sm text-gray-500 mb-4">
                    Powered by <span className="font-semibold text-[#c084fc]">ApplyForMe</span>
                  </p>
                  <Link href="/signup">
                    <Button variant="ghost" size="sm" className="text-[#c084fc] hover:text-[#a855f7] hover:bg-[#c084fc] hover:bg-opacity-10">
                      Join ApplyForMe →
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
 