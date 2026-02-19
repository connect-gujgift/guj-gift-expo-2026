'use client'

import React from 'react'
import { Button } from "@/components/ui/button"

export default function AppFooter() {
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

        {/* 3. NEW: Help & Contact Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <a href="https://wa.me/+916358260767" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="border-green-500 text-green-600 font-bold text-[10px] uppercase hover:bg-green-50 rounded-full px-6">
              💬 WhatsApp Help
            </Button>
          </a>
          <a href="mailto:info@shreebalajievent.com">
            <Button variant="outline" size="sm" className="border-blue-500 text-blue-600 font-bold text-[10px] uppercase hover:bg-blue-50 rounded-full px-6">
              📧 Email Support
            </Button>
          </a>
        </div>
        
        <p className="mt-6 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
          Official Lead Management System v2.0
        </p>
      </div>
    </footer>
  )
}