"use client";

import { RecruiterSidebar } from "@/components/recruiter/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from 'next/navigation';

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const noSidebarRoutes = ['/recruiter/login', '/recruiter/register', '/recruiter'];

  if (noSidebarRoutes.includes(pathname)) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <main>{children}</main>
        <Toaster />
      </div>
    );
  }

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