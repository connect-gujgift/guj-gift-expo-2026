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
      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(badgeRef.current, {
        backgroundColor: '#ffffff',
        scale: 3, 
        useCORS: true, // Crucial for external/local images
        allowTaint: false, // Set to false to avoid security errors on some browsers
        logging: true, 
      });

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `GUJ-GIFT-BADGE-${visitor?.full_name?.replace(/\s+/g, '-') || 'Badge'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Capture failure:", err);
      alert("Unable to download. Please take a screenshot of your badge.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Generating Pass...</div>
  if (!visitor) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">User not found.</div>

  const isExhibitor = !!exhibitorInfo;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 gap-6">
      
      {/* BADGE AREA */}
      <div ref={badgeRef} className="bg-white w-[350px] rounded-[2rem] border-[6px] border-orange-500 shadow-2xl overflow-hidden flex flex-col items-center text-center pb-6 relative">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-10 -mt-10 z-0 opacity-40"></div>

        {/* LOGO */}
        <div className="mt-8 z-10 w-44 h-24 flex items-center justify-center">
           <img 
             src="/event-logo.png" 
             alt="Logo" 
             className="object-contain max-w-full max-h-full"
             crossOrigin="anonymous" 
           />
        </div>

        {/* PASS TYPE */}
        <div className={`z-10 px-8 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-4 shadow-sm ${isExhibitor ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>
          {isExhibitor ? 'EXHIBITOR PASS' : 'VISITOR PASS'}
        </div>

        {isExhibitor && (
          <div className="z-10 mb-4 border-2 border-green-600 text-green-700 px-6 py-1 rounded-lg font-black text-xl bg-green-50">
            STALL: {exhibitorInfo.stall_number || 'TBD'}
          </div>
        )}

        {/* USER INFO */}
        <div className="z-10 px-4 mb-4">
          <h1 className="text-2xl font-black text-gray-900 uppercase leading-tight mb-1">
            {visitor.full_name}
          </h1>
          <p className="text-blue-600 font-bold uppercase text-xs tracking-wider mb-1">
            {visitor.company_name}
          </p>
          <p className="text-gray-400 font-medium italic text-[10px] lowercase">
            {visitor.designation}
          </p>
        </div>

        {/* QR CODE */}
        <div className="z-10 bg-white p-2 rounded-xl border border-gray-100 shadow-inner mb-6">
          <QRCode 
            value={visitor.id} 
            size={140}
          />
        </div>

        {/* FOOTER BOX */}
        <div className="w-full bg-gray-50 py-3 px-6 border-t border-gray-100 mt-auto">
          <p className="text-gray-900 font-black text-xs uppercase">
            12th - 14th AUGUST 2026
          </p>
          <p className="text-gray-500 text-[10px] font-bold">
            GMDC University Ground, Ahmedabad
          </p>
        </div>

        {/* ORGANIZER */}
        <div className="bg-white w-full py-3 flex items-center justify-center gap-2">
            <img src="/organizer-logo.png" alt="SB" className="w-6 h-6 object-contain" crossOrigin="anonymous" />
            <div className="text-left">
                <p className="text-[7px] text-gray-400 font-bold uppercase">Organized By</p>
                <p className="text-[9px] text-gray-900 font-bold leading-none">Shree Balaji Event LLP</p>
            </div>
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="w-full max-w-[350px] space-y-3">
        <Button 
          onClick={downloadBadge}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-7 text-lg shadow-xl"
        >
          ⬇️ DOWNLOAD BADGE IMAGE
        </Button>
      </div>
    </div>
  )
}