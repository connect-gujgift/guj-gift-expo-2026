'use client'

import React from 'react'

export default function AppHeader() {
  return (
    // Updated: Changed bg-white to bg-transparent and removed border/shadow for a clean look
    <header className="bg-transparent sticky top-0 z-50 flex justify-center items-center py-4" style={{ paddingTop: 'calc(16px + env(safe-area-inset-top))' }}>
      
      {/* Centered Event Logo */}
      <img 
        src="/event-logo.png" 
        alt="Guj Gift Expo" 
        // Ensure your event-logo.png is a transparent PNG for the best result
        className="h-16 md:h-24 w-auto object-contain drop-shadow-sm transition-all" 
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const span = document.createElement('span');
          span.className = "text-2xl md:text-3xl font-black text-blue-700 italic tracking-tighter";
          span.innerText = "GGE 2026";
          e.currentTarget.parentElement?.appendChild(span);
        }}
      />
        
    </header>
  )
}