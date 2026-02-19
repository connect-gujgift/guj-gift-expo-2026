'use client'

import React from 'react'

export default function AppFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-10 pb-12 mt-auto w-full">
      <div className="flex flex-col items-center justify-center text-center px-4">
        
        {/* 1. Logo First */}
        <img 
          src="/organizer-logo.png" 
          alt="Shree Balaji Event LLP" 
          className="h-16 md:h-24 w-auto object-contain mb-4"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* 2. Text strictly BELOW the logo */}
        <p className="text-[12px] md:text-sm font-black text-slate-600 uppercase tracking-tight">
          Organized by- Shree Balaji Event LLP, Ahmedabad
        </p>

      </div>
    </footer>
  )
}