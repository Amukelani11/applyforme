"use client";

import { RecruiterSidebar } from "@/components/recruiter/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function AdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <RecruiterSidebar />
      <main className="flex-1 lg:pl-72">
        {children}
      </main>
      <Toaster />
    </div>
  );
} 