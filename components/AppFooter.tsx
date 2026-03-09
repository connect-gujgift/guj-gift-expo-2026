'use client'

export default function AppFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-white border-t border-slate-200 py-12 print:hidden mt-auto">
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center space-y-6">
        
        {/* Organizer Info */}
        <div className="flex flex-col items-center gap-4">
          {/* IMPORTANT: Change the src below if your file is named differently! */}
          <img 
            src="/organizer-logo.png" 
            alt="Shree Balaji Event LLP" 
            className="h-24 w-auto object-contain" 
          />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mt-2">
            Organized By - Shree Balaji Event LLP, Ahmedabad
          </h3>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <a 
            href="#" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-green-200 text-green-600 hover:bg-green-50 text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            <span>💬</span> WhatsApp
          </a>
          <button 
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-blue-600 hover:bg-blue-50 text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            <span>⬆️</span> Back to Top
          </button>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-100 w-full">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Guj Gift Expo 2026
          </p>
          <p className="text-[8px] font-bold tracking-widest text-slate-300 mt-1">
            Lead Management System V2.1
          </p>
        </div>

      </div>
    </footer>
  )
}