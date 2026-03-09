'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function AppHeader() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-4 h-32 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          {/* logo container with enough height to prevent clipping */}
          <div className="relative w-[300px] h-[100px] flex items-center">
            <Image 
              src="/event-logo.png" 
              alt="Guj Gift Expo 2026" 
              width={280} 
              height={80}
              className="object-contain"
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