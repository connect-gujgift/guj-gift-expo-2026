'use client'

import React from 'react'

export default function AppHeader() {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      {/* Safe Area Padding for Mobile Notches */}
      <div className="flex justify-between items-center px-4 py-3" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        
        {/* LEFT: Event Logo */}
        <div className="flex items-center">
          <img 
            src="/event-logo.png" 
            alt="Guj Gift Expo" 
            className="h-10 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              // Fallback text if image fails
              const span = document.createElement('span');
              span.className = "text-lg font-black text-blue-600 italic tracking-tighter";
              span.innerText = "GGE 2026";
              e.currentTarget.parentElement?.appendChild(span);
            }}
          />
        </div>

        {/* RIGHT: Organizer Logo */}
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Organized By</span>
          <img 
            src="/organizer-logo.png" 
            alt="Shree Balaji" 
            className="h-8 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              // Fallback text if image fails
              const span = document.createElement('span');
              span.className = "text-xs font-bold text-slate-800";
              span.innerText = "SHREE BALAJI";
              e.currentTarget.parentElement?.appendChild(span);
            }}
          />
        </div>
        
      </div>
    </header>
  )
}