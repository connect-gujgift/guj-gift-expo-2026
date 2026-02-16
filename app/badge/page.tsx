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

      // 1. Fetch Basic Profile
      const { data: visitorData } = await supabase
        .from('visitors')
        .select('*')
        .eq('id', user.id)
        .single()

      if (visitorData) setVisitor(visitorData)

      // 2. Check if the user is an Exhibitor to get Stall Number
      const { data: exhibitorData } = await supabase
        .from('exhibitors')
        .select('stall_number')
        .eq('id', user.id)
        .single()

      if (exhibitorData) {
        setExhibitorInfo(exhibitorData)
      }

      setLoading(false)
    }
    fetchBadgeData()
  }, [router])

  // ROBUST DOWNLOAD FUNCTION
  const downloadBadge = async () => {
    if (badgeRef.current) {
      try {
        await document.fonts.ready; // Wait for fonts to load for clean text

        const canvas = await html2canvas(badgeRef.current, {
          backgroundColor: '#ffffff',
          scale: 3, // High resolution for clear QR scanning
          useCORS: true, // Fix for logos not showing in download
          allowTaint: true,
          logging: false,
        });

        const image = canvas.toDataURL("image/png", 1.0);
        const link = document.createElement("a");
        link.style.display = 'none';
        link.href = image;
        link.download = `GUJ-GIFT-BADGE-${visitor.full_name.replace(/\s+/g, '-')}.png`;
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);

      } catch (err) {
        console.error("Download error:", err);
        alert("Unable to download image. Please take a screenshot of your badge.");
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Generating Badge...</div>
  if (!visitor) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Badge Data Missing.</div>

  const isExhibitor = !!exhibitorInfo;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 gap-6">
      
      {/* 🟢 THE BADGE CARD (Captured by html2canvas) */}
      <div ref={badgeRef} className="bg-white w-full max-w-sm rounded-[2rem] border-[6px] border-orange-500 shadow-2xl overflow-hidden flex flex-col items-center text-center pb-6 relative">
        
        {/* Decorative Curve */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-bl-full -mr-10 -mt-10 z-0 opacity-50"></div>

        {/* 1. TOP LOGO */}
        <div className="mt-8 z-10 w-48 mb-6 relative h-24 flex items-center justify-center">
           <img 
             src="/event-logo.png" 
             alt="GUJ GIFT EXPO" 
             className="object-contain w-full h-full"
             crossOrigin="anonymous" // Required for html2canvas
           />
        </div>

        {/* 2. PASS TYPE PILL */}
        <div className={`z-10 px-8 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-4 shadow-sm ${isExhibitor ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>
          {isExhibitor ? 'EXHIBITOR PASS' : 'VISITOR PASS'}
        </div>

        {/* 3. STALL NUMBER (Exhibitor Only) */}
        {isExhibitor && exhibitorInfo.stall_number && (
          <div className="z-10 mb-4 border-2 border-green-600 text-green-700 px-4 py-1 rounded-lg font-black text-lg uppercase bg-green-50">
            STALL: {exhibitorInfo.stall_number}
          </div>
        )}

        {/* 4. USER DETAILS */}
        <div className="z-10 w-full px-4 mb-6">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-tight mb-2">
            {visitor.full_name}
          </h1>
          <p className="text-blue-600 font-bold uppercase text-sm tracking-wide mb-1">
            {visitor.company_name}
          </p>
          <p className="text-gray-400 font-medium italic text-xs lowercase">
            {visitor.designation}
          </p>
        </div>

        {/* 5. QR CODE */}
        <div className="z-10 bg-white p-2 rounded-xl border border-gray-100 shadow-sm mb-8">
          <QRCode 
            value={JSON.stringify({
              id: visitor.id,
              role: isExhibitor ? 'exhibitor' : 'visitor',
              stall: exhibitorInfo?.stall_number || ''
            })} 
            size={150}
          />
        </div>

        {/* 6. DATES & VENUE (Restored to August) */}
        <div className="w-full bg-gray-50 py-4 px-6 border-t border-gray-100 mt-auto">
          <p className="text-gray-900 font-black text-sm uppercase tracking-wide">
            12th - 14th AUGUST 2026
          </p>
          <p className="text-gray-500 text-xs font-bold mt-1">
            GMDC Ground, Ahmedabad
          </p>
        </div>

        {/* 7. ORGANIZER FOOTER */}
        <div className="bg-white w-full py-4 flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
              <img src="/organizer-logo.png" alt="SB" className="w-full h-full object-cover" crossOrigin="anonymous" />
            </div>
            <div className="text-left">
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Organized By</p>
                <p className="text-[10px] text-gray-900 font-bold leading-tight">Shree Balaji Event LLP, Ahmedabad</p>
            </div>
        </div>
      </div>

      {/* 🔵 DOWNLOAD BUTTON */}
      <div className="flex flex-col gap-2 w-full max-w-sm">
        <Button 
          onClick={downloadBadge}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg shadow-xl"
        >
          ⬇️ DOWNLOAD BADGE IMAGE
        </Button>
        <p className="text-center text-gray-400 text-xs font-medium uppercase tracking-widest">
          GUJ GIFT EXPO 2026
        </p>
      </div>
    </div>
  )
}