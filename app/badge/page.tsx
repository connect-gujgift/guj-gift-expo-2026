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

      // 2. Check if Exhibitor
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

  // FUNCTION TO DOWNLOAD BADGE AS IMAGE
  const downloadBadge = async () => {
    if (badgeRef.current) {
      const canvas = await html2canvas(badgeRef.current, {
        backgroundColor: '#ffffff', // Ensure white background
        scale: 2 // High resolution
      })
      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = "GUJ-GIFT-BADGE.png"
      link.click()
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading Badge...</div>
  if (!visitor) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Badge not found.</div>

  const isExhibitor = !!exhibitorInfo;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 gap-6">
      
      {/* BADGE CONTAINER (This part gets downloaded) */}
      <div ref={badgeRef} className="bg-white w-full max-w-sm rounded-[2rem] border-[6px] border-orange-500 shadow-2xl overflow-hidden flex flex-col items-center text-center pb-6 relative">
        
        {/* DECORATIVE CURVE */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-bl-full -mr-10 -mt-10 z-0 opacity-50"></div>

        {/* 1. TOP LOGO AREA */}
        <div className="mt-8 z-10 w-48 mb-6 relative h-24 flex items-center justify-center">
           <img 
             src="/event-logo.png" 
             alt="GUJ GIFT EXPO 2026" 
             className="object-contain w-full h-full"
             onError={(e) => {
               e.currentTarget.style.display = 'none';
               e.currentTarget.parentElement!.innerHTML = '<h2 class="text-2xl font-black text-slate-800">GUJ GIFT<br/><span class="text-orange-600">EXPO 2026</span></h2>';
             }}
           />
        </div>

        {/* 2. PASS TYPE & STALL INFO */}
        <div className={`z-10 px-8 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-4 shadow-sm ${isExhibitor ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>
          {isExhibitor ? 'EXHIBITOR PASS' : 'VISITOR PASS'}
        </div>

        {isExhibitor && exhibitorInfo.stall_number && (
          <div className="z-10 mb-4 border-2 border-green-600 text-green-700 px-4 py-1 rounded-lg font-black text-lg uppercase bg-green-50">
            STALL: {exhibitorInfo.stall_number}
          </div>
        )}

        {/* 3. USER DETAILS */}
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

        {/* 4. QR CODE */}
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

        {/* 5. DATES & VENUE */}
        <div className="w-full bg-gray-50 py-4 px-6 border-t border-gray-100 mt-auto">
          <p className="text-gray-900 font-black text-sm uppercase tracking-wide">
            12th - 14th AUGUST 2026
          </p>
          <p className="text-gray-500 text-xs font-bold mt-1">
            GMDC Ground, Ahmedabad
          </p>
        </div>

        {/* 6. ORGANIZER LOGO */}
        <div className="bg-white w-full py-4 flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
              <img src="/organizer-logo.png" alt="SB" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Organized By</p>
                <p className="text-[10px] text-gray-900 font-bold leading-tight">Shree Balaji Event LLP, Ahmedabad</p>
            </div>
        </div>
      </div>

      {/* DOWNLOAD BUTTON (Outside the capture area) */}
      <div className="flex flex-col gap-2 w-full max-w-sm">
        <Button 
          onClick={downloadBadge}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg shadow-lg"
        >
          ⬇️ DOWNLOAD BADGE IMAGE
        </Button>
        <p className="text-center text-gray-400 text-xs font-medium">
          Save this image to your gallery for quick entry
        </p>
      </div>
    </div>
  )
}