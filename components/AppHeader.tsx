'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function AppHeader() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-4 h-28 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          {/* Logo set to 250px wide - safe even if CSS fails to load */}
          <Image 
            src="/event-logo.png" 
            alt="Guj Gift Expo 2026" 
            width={250} 
            height={70}
            className="object-contain"
            priority
          />
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400">
           <Link href="/floor-plan" className="hover:text-orange-500 transition-colors">Stall Map</Link>
           <Link href="/register" className="hover:text-orange-500 transition-colors">Visitor Registration</Link>
           <Link href="/login" className="bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-orange-600 transition-all shadow-lg">Portal Login</Link>
        </nav>
      </div>
    </header>
  )
}