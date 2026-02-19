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
        
        {/* 1. Organizer Logo */}
        <img 
          src="/organizer-logo.png" 
          alt="Shree Balaji Event LLP" 
          className="h-20 md:h-28 w-auto object-contain mb-4 drop-shadow-sm"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* 2. Official Text */}
        <p className="text-[13px] md:text-base font-black text-slate-700 uppercase tracking-wider mb-6">
          Organized by- Shree Balaji Event LLP, Ahmedabad
        </p>

        {/* 3. Navigation & Directory Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-[280px]">
          {/* Main Directory Button */}
          <Button 
            onClick={() => router.push('/directory')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-2xl shadow-lg uppercase italic text-sm"
          >
            📂 View Stall Directory
          </Button>

          <div className="flex gap-2">
            <a href="https://wa.me/+916358260767" target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" className="w-full border-green-500 text-green-600 font-bold text-[10px] uppercase h-10 rounded-xl">
                💬 WhatsApp
              </Button>
            </a>
            <Button 
              variant="outline" 
              onClick={scrollToTop}
              className="flex-1 border-slate-200 text-slate-400 font-bold text-[10px] uppercase h-10 rounded-xl"
            >
              ⬆️ Top
            </Button>
          </div>
        </div>
        
        <p className="mt-8 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
          Guj Gift Expo 2026 • Lead Management System
        </p>
      </div>
    </footer>
  )
}