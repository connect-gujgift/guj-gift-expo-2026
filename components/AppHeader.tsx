'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function AppHeader() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-16 w-48">
            <Image 
              src="/event-logo.png" 
              alt="Guj Gift Expo 2026" 
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
           <Link href="/floor-plan" className="hover:text-orange-500 transition-colors">Stall Map</Link>
           <Link href="/register" className="hover:text-orange-500 transition-colors">Visitor Registration</Link>
           <Link href="/login" className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-all">Portal Login</Link>
        </nav>
      </div>
    </header>
  )
}