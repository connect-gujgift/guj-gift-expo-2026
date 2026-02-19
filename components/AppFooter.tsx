'use client'

import React from 'react'

export default function AppFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-8 pb-10 mt-auto w-full">
      <div className="flex flex-col items-center justify-center text-center px-4">
        {/* Logo first */}
        <img 
          src="/organizer-logo.png" 
          alt="Shree Balaji" 
          className="h-14 md:h-20 w-auto object-contain mb-4"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Official text written below the logo */}
        <p className="text-[12px] md:text-sm font-black text-slate-600 uppercase tracking-tighter">
          Organized by- Shree Balaji Event LLP, Ahmedabad
        </p>
      </div>
    </footer>
  )
}