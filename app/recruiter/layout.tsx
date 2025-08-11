"use client";

import { RecruiterSidebar } from "@/components/recruiter/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const noSidebarRoutes = ['/recruiter/login', '/recruiter/register', '/recruiter', '/recruiter/free-trial', '/recruiter/trial-success'];

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
      <MobileSidebarShell>
        {children}
      </MobileSidebarShell>
      <Toaster />
    </div>
  );
} 

function MobileSidebarShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <RecruiterSidebar open={open} onClose={() => setOpen(false)} />
      <main className="flex-1 lg:pl-72">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              aria-label="Open menu"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path fillRule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6.75c0-.414.336-.75.75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm.75 6a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="text-sm font-medium text-gray-700">Recruiter</div>
            <div className="w-9" />
          </div>
        </div>
        {children}
      </main>
    </>
  )
}