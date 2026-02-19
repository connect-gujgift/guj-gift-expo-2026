'use client'

import React from 'react'

export default function AppFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-6 mt-auto w-full" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
      <div className="flex flex-col items-center justify-center">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
          Organized By
        </span>
        <img 
          src="/organizer-logo.png" 
          alt="Shree Balaji" 
          className="h-12 md:h-16 w-auto object-contain drop-shadow-sm"
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