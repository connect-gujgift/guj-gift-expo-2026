'use client'

import React from 'react'

export default function AppFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-6 pb-8 mt-auto w-full" style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom))' }}>
      <div className="flex flex-col items-center justify-center text-center">
        {/* Updated Organizer Text */}
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 px-4">
          Organized by- Shree Balaji Event LLP, Ahmedabad
        </span>
        <img 
          src="/organizer-logo.png" 
          alt="Shree Balaji" 
          className="h-14 md:h-18 w-auto object-contain drop-shadow-sm"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const span = document.createElement('span');
            span.className = "text-sm md:text-base font-black text-slate-800 tracking-tight";
            span.innerText = "SHREE BALAJI";
            e.currentTarget.parentElement?.appendChild(span);
          }}
        />
      </div>
    </footer>
  )
}