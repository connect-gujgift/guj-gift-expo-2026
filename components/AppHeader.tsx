'use client'

import React from 'react'

export default function AppHeader() {
  return (
    // Changed 'sticky' to 'relative' so it moves with the page
    // Removed 'bg-white' and 'shadow' to ensure no white band appears
    <header className="relative w-full bg-transparent flex justify-center items-center py-8">
      <div style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <img 
          src="/event-logo.png" 
          alt="Guj Gift Expo 2026" 
          className="h-24 md:h-32 w-auto object-contain drop-shadow-md" 
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const span = document.createElement('span');
            span.className = "text-2xl font-black text-blue-700 italic";
            span.innerText = "GUJ GIFT EXPO 2026";
            e.currentTarget.parentElement?.appendChild(span);
          }}
        />
      </div>
    </header>
  )
}