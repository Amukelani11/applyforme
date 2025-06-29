import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wand2, FileText, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">ApplyForMe</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 ${
            pathname === '/dashboard' ? 'bg-gray-100 text-gray-900' : ''
          }`}
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <Link
          href="/dashboard/improve"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 ${
            pathname === '/dashboard/improve' ? 'bg-gray-100 text-gray-900' : ''
          }`}
        >
          <Wand2 className="h-4 w-4" />
          Improve CV
        </Link>
        <Link
          href="/dashboard/applications"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 ${
            pathname === '/dashboard/applications' ? 'bg-gray-100 text-gray-900' : ''
          }`}
        >
          <FileText className="h-4 w-4" />
          Applications
        </Link>
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 ${
            pathname === '/dashboard/settings' ? 'bg-gray-100 text-gray-900' : ''
          }`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </nav>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
} 