"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Briefcase, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

interface NavbarProps {
  variant?: 'default' | 'dashboard'
}

export function Navbar({ variant = 'default' }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [showNavbar, setShowNavbar] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  // Dashboard variant styles
  const isDashboard = variant === 'dashboard'
  const navClasses = isDashboard 
    ? "bg-background border-b border-border fixed top-0 left-0 right-0 z-50 shadow-sm"
    : `bg-background/80 backdrop-blur-md border border-border/50 sticky top-4 z-50 mx-4 rounded-2xl shadow-lg shadow-black/5 transition-transform duration-300 ${showNavbar ? "translate-y-0" : "-translate-y-full"}`

  const containerClasses = isDashboard
    ? "max-w-7xl mx-auto px-4 lg:px-6"
    : "max-w-6xl mx-auto px-4 lg:px-6"

  return (
    <nav className={navClasses}>
      <div className={containerClasses}>
        <div className="flex justify-between" style={{ minHeight: 56 }}>
          <div className="flex items-start">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-start pl-2 pt-2">
              <Image
                src="/talio-logo.svg"
                alt="Talio"
                width={48}
                height={48}
                className="h-12 w-auto"
                style={{ width: 'auto' }}
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isDashboard && (
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Pricing
              </Link>
            )}
            {isAuthenticated ? (
              <>
                {!isDashboard && (
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                    Dashboard
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-medium"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-medium">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-[#2e6417] hover:bg-[#6fa03a] text-white">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-foreground p-2"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-4 pb-6 space-y-3 bg-background">
              {!isDashboard && (
                <Link
                  href="/pricing"
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground font-medium"
                >
                  Pricing
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  {!isDashboard && (
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-muted-foreground hover:text-foreground font-medium"
                    >
                      Dashboard
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start font-medium"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="w-full justify-start font-medium">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="w-full bg-[#2e6417] hover:bg-[#6fa03a] text-white">
                      Get started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}