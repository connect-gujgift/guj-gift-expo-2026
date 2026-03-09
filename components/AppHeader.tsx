'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function AppHeader() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 h-28 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          {/* This relative box is the strict boundary. The logo cannot escape it. */}
          <div className="relative h-20 w-[260px]">
            <Image 
              src="/event-logo.png" 
              alt="Guj Gift Expo 2026" 
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400">
           <Link href="/floor-plan" className="hover:text-orange-500 transition-colors">Stall Map</Link>
           <Link href="/register" className="hover:text-orange-500 transition-colors">Visitor Registration</Link>
           <Link href="/login" className="bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-orange-600 transition-all shadow-lg">Portal Login</Link>
        </nav>
      </div>
    </header>
  )
}