'use client'

import React from 'react'

export default function AppHeader() {
  return (
    // Changed to bg-transparent and removed borders/shadows to eliminate the "white band"
    <header className="bg-transparent sticky top-0 z-50 flex justify-center items-center py-6">
      <div style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <img 
          src="/event-logo.png" 
          alt="Guj Gift Expo" 
          className="h-20 md:h-28 w-auto object-contain drop-shadow-md" 
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const span = document.createElement('span');
            span.className = "text-2xl font-black text-blue-700 italic";
            span.innerText = "GGE 2026";
            e.currentTarget.parentElement?.appendChild(span);
          }}
        />
      </div>
    </header>
  )
}