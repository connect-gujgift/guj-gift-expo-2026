'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"
import html2canvas from 'html2canvas'
import { Button } from "@/components/ui/button"

export default function BadgePage() {
  const router = useRouter()
  const [visitor, setVisitor] = useState<any>(null)
  const [exhibitorInfo, setExhibitorInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const badgeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchBadgeData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: visitorData } = await supabase
        .from('visitors')
        .select('*')
        .eq('id', user.id)
        .single()

      if (visitorData) setVisitor(visitorData)

      const { data: exhibitorData } = await supabase
        .from('exhibitors')
        .select('stall_number')
        .eq('id', user.id)
        .single()

      if (exhibitorData) setExhibitorInfo(exhibitorData)
      setLoading(false)
    }
    fetchBadgeData()
  }, [router])

  const downloadBadge = async () => {
    if (!badgeRef.current) return;
    
    try {
      // Ensure the user is scrolled to top for a clean capture
      window.scrollTo(0,0);

      const canvas = await html2canvas(badgeRef.current, {
        backgroundColor: '#ffffff',
        scale: 3, 
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: badgeRef.current.offsetWidth,
        height: badgeRef.current.offsetHeight
      });

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `BADGE-${visitor?.full_name?.split(' ')[0] || 'GUJ-GIFT-EXPO'}.png`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Capture failure:", err);
      alert("Download failed. Please take a screenshot of your badge.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500 italic">Preparing your pass...</div>
  if (!visitor) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Error: Profile not found.</div>

  const isExhibitor = !!exhibitorInfo;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 gap-6 font-sans">
      
      {/* BADGE AREA */}
      <div 
        ref={badgeRef} 
        className="bg-white w-[350px] rounded-[2.5rem] border-[8px] border-orange-500 shadow-2xl overflow-hidden flex flex-col items-center text-center pb-8 relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>

        {/* 1. LOGO */}
        <div className="mt-8 mb-4 h-28 flex items-center justify-center px-6">
           <img 
             src="/event-logo.png" 
             alt="GUJ GIFT EXPO" 
             className="max-w-full max-h-full object-contain"
             crossOrigin="anonymous" 
           />
        </div>

        {/* 2. ROLE LABEL */}
        <div className={`px-10 py-2 rounded-full text-sm font-black tracking-widest uppercase mb-4 shadow-md ${isExhibitor ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>
          {isExhibitor ? 'EXHIBITOR' : 'VISITOR'}
        </div>

        {/* 3. STALL INFO */}
        {isExhibitor && (
          <div className="mb-4 bg-green-50 border-2 border-green-600 text-green-700 px-6 py-1 rounded-xl font-black text-xl">
            STALL: {exhibitorInfo.stall_number || 'A-000'}
          </div>
        )}

        {/* 4. DETAILS */}
        <div className="px-6 mb-6">
          <h1 className="text-3xl font-black text-slate-900 uppercase leading-tight">
            {visitor.full_name}
          </h1>
          <p className="text-blue-600 font-bold uppercase text-sm tracking-wide mt-1">
            {visitor.company_name}
          </p>
          <p className="text-gray-400 font-medium italic text-xs mt-1">
            {visitor.designation}
          </p>
        </div>

        {/* 5. QR CODE */}
        <div className="bg-white p-3 rounded-2xl border-2 border-slate-50 shadow-inner mb-8">
          <QRCode 
            value={visitor.id} 
            size={160}
            level="H"
          />
        </div>

        {/* 6. EVENT FOOTER */}
        <div className="w-full bg-slate-50 py-4 px-6 border-t border-slate-100 mt-auto">
          <p className="text-slate-900 font-black text-sm uppercase tracking-tighter">
            12th - 14th AUGUST 2026
          </p>
          <p className="text-slate-500 text-[10px] font-bold uppercase">
            GMDC University Ground, Ahmedabad
          </p>
        </div>

        {/* 7. ORGANIZER BRANDING */}
        <div className="bg-white w-full py-4 flex items-center justify-center gap-3">
            <img src="/organizer-logo.png" alt="SB" className="w-8 h-8 object-contain rounded-full" crossOrigin="anonymous" />
            <div className="text-left border-l pl-3 border-slate-200">
                <p className="text-[7px] text-slate-400 font-black uppercase">Organized By</p>
                <p className="text-[11px] text-slate-900 font-black leading-none">Shree Balaji Event LLP</p>
            </div>
        </div>
      </div>

      {/* BUTTON */}
      <div className="w-full max-w-[350px]">
        <Button 
          onClick={downloadBadge}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-8 text-xl shadow-2xl rounded-2xl transition-all"
        >
          ⬇️ SAVE TO GALLERY
        </Button>
      </div>
    </div>
  )
}