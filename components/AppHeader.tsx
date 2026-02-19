'use client'

import React from 'react'

export default function AppHeader() {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b-2 border-slate-200 sticky top-0 z-50 shadow-md">
      {/* Increased padding and sizing for a premium feel */}
      <div className="flex justify-between items-center px-4 py-4" style={{ paddingTop: 'calc(16px + env(safe-area-inset-top))' }}>
        
        {/* LEFT: Event Logo (Made significantly larger) */}
        <div className="flex items-center">
          <img 
            src="/event-logo.png" 
            alt="Guj Gift Expo" 
            className="h-14 md:h-16 w-auto object-contain drop-shadow-sm" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const span = document.createElement('span');
              span.className = "text-xl md:text-2xl font-black text-blue-700 italic tracking-tighter";
              span.innerText = "GGE 2026";
              e.currentTarget.parentElement?.appendChild(span);
            }}
          />
        </div>

        {/* RIGHT: Organizer Logo (Made larger with better typography) */}
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Organized By</span>
          <img 
            src="/organizer-logo.png" 
            alt="Shree Balaji" 
            className="h-10 md:h-12 w-auto object-contain drop-shadow-sm"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const span = document.createElement('span');
              span.className = "text-sm md:text-base font-black text-slate-800 tracking-tight";
              span.innerText = "SHREE BALAJI";
              e.currentTarget.parentElement?.appendChild(span);
            }}
          />
        </div>
        
      </div>
    </header>
  )
}