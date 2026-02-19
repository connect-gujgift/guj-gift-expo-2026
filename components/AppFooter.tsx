'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

export default function AppFooter() {
  const router = useRouter()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-14 mt-auto w-full">
      <div className="flex flex-col items-center justify-center text-center px-4">
        
        {/* 1. Large Organizer Logo (Hero Element) */}
        <img 
          src="/organizer-logo.png" 
          alt="Shree Balaji Event LLP" 
          className="h-20 md:h-28 w-auto object-contain mb-6 drop-shadow-sm"
          onError={(e) => {
            // Falls back to text if logo is missing from public folder
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* 2. Official Organizer Text strictly BELOW the logo */}
        <p className="text-[13px] md:text-base font-black text-slate-700 uppercase tracking-wider mb-8">
          Organized by- Shree Balaji Event LLP, Ahmedabad
        </p>

        {/* 3. Navigation & Support Row */}
        <div className="flex flex-col gap-4 w-full max-w-[320px]">
          
          {/* Main Directory Button for Visitors */}
          <Button 
            onClick={() => router.push('/directory')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-7 rounded-2xl shadow-lg uppercase italic text-sm tracking-tight active:scale-95 transition-transform"
          >
            📂 View Stall Directory
          </Button>

          {/* Secondary Support Row */}
          <div className="flex gap-2">
            {/* REPLACE WITH YOUR ACTUAL NUMBER */}
            <a href="https://wa.me/+916358260767" target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" className="w-full border-green-500 text-green-600 font-bold text-[10px] uppercase h-11 rounded-xl hover:bg-green-50">
                💬 WhatsApp
              </Button>
            </a>
            
            <Button 
              variant="outline" 
              onClick={scrollToTop}
              className="flex-1 border-slate-200 text-slate-400 font-bold text-[10px] uppercase h-11 rounded-xl hover:bg-slate-50"
            >
              ⬆️ Back to Top
            </Button>
          </div>
        </div>
        
        {/* Version & Identity Footer */}
        <div className="mt-10 border-t border-slate-50 pt-6 w-full max-w-[200px]">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.25em]">
            Guj Gift Expo 2026
          </p>
          <p className="text-[8px] font-medium text-slate-200 uppercase mt-1">
            Lead Management System v2.1
          </p>
        </div>
      </div>
    </footer>
  )
}