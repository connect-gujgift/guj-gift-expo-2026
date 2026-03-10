'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function AppHeader() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-24 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center">
          <div className="relative h-16 w-[200px] md:w-[260px]">
            <Image 
              src="/event-logo.png" 
              alt="Guj Gift Expo 2026" 
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>
        
        {/* DESKTOP NAVIGATION */}
        <nav className="hidden xl:flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
           <Link href="/exhibitors" className="hover:text-orange-500 transition-colors">Directory</Link>
           <Link href="/floor-plan" className="hover:text-orange-500 transition-colors">Stall Map</Link>
           <Link href="/register" className="hover:text-orange-500 transition-colors">Visitor Reg.</Link>
           
           {/* Visual Divider */}
           <div className="h-5 w-px bg-slate-200 mx-2"></div> 

           {/* Event Staff Pass - Styled as a special pill button */}
           <Link href="/pass" className="flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-200 px-5 py-2.5 rounded-full hover:bg-orange-100 hover:scale-105 transition-all shadow-sm">
             <span className="text-sm leading-none">🎟️</span> Event Staff Pass
           </Link>

           {/* Portal Login */}
           <Link href="/login" className="bg-[#0b3d41] text-white px-7 py-3 rounded-xl hover:bg-slate-900 transition-all shadow-md ml-2 active:scale-95">
             Portal Login
           </Link>
        </nav>

        {/* MOBILE NAVIGATION (Fallback for smaller screens) */}
        <div className="xl:hidden flex items-center gap-3">
           <Link href="/pass" className="text-[9px] font-black uppercase tracking-widest text-orange-600 border border-orange-200 bg-orange-50 px-3 py-2.5 rounded-lg shadow-sm">
             Pass
           </Link>
           <Link href="/login" className="text-[9px] font-black uppercase tracking-widest text-white bg-[#0b3d41] px-4 py-2.5 rounded-lg shadow-sm">
             Login
           </Link>
        </div>

      </div>
    </header>
  )
}