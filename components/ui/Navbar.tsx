'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="flex h-20 items-center px-4 md:px-8 max-w-7xl mx-auto justify-between">
        
        {/* EVENT LOGO SECTION */}
        <Link href="/exhibitors" className="flex items-center gap-3">
          <Image 
            src="/event-logo.jpg" 
            alt="Guj Gift Expo 2026" 
            width={60} 
            height={60} 
            className="object-contain"
          />
          <span className="text-xl font-bold tracking-tight hidden md:block text-gray-900">
            GUJ GIFT <span className="text-orange-600">EXPO 2026</span>
          </span>
        </Link>

        {/* Menu Links */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <Link href="/exhibitors" className="text-sm font-medium transition-colors hover:text-orange-600">
            Directory
          </Link>
          <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-orange-600">
            My Dashboard
          </Link>
          
          <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}