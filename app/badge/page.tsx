'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import QRCode from "react-qr-code"

export default function BadgePage() {
  const router = useRouter()
  const [visitor, setVisitor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVisitor = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) setVisitor(data)
      setLoading(false)
    }
    fetchVisitor()
  }, [router])

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading Badge...</div>
  if (!visitor) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Badge not found.</div>

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      
      {/* CARD: White, Orange Border, Rounded Corners - MATCHING OLD DESIGN */}
      <div className="bg-white w-full max-w-sm rounded-[2rem] border-[6px] border-orange-500 shadow-2xl overflow-hidden flex flex-col items-center text-center pb-6 relative">
        
        {/* DECORATIVE CURVE (Top Right) */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-bl-full -mr-10 -mt-10 z-0 opacity-50"></div>

        {/* 1. TOP LOGO AREA */}
        <div className="mt-8 z-10 w-48 mb-6 relative h-24 flex items-center justify-center">
           {/* IMPORTANT: Ensure 'event-logo.png' is in your 'public' folder */}
           <img 
             src="/event-logo.png" 
             alt="GUJ GIFT EXPO 2026" 
             className="object-contain w-full h-full"
             onError={(e) => {
               // Fallback if image is missing
               e.currentTarget.style.display = 'none';
               e.currentTarget.parentElement!.innerHTML = '<h2 class="text-2xl font-black text-slate-800">GUJ GIFT<br/><span class="text-orange-600">EXPO 2026</span></h2>';
             }}
           />
        </div>

        {/* 2. VISITOR PASS PILL */}
        <div className="z-10 bg-orange-600 text-white px-8 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-6 shadow-sm">
          Visitor Pass
        </div>

        {/* 3. VISITOR DETAILS */}
        <div className="z-10 w-full px-4 mb-6">
          {/* Name - BLACK & BOLD */}
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-tight mb-2">
            {visitor.full_name}
          </h1>
          
          {/* Company - BLUE (As per 'Old Badge') */}
          <p className="text-blue-600 font-bold uppercase text-sm tracking-wide mb-1">
            {visitor.company_name}
          </p>
          
          {/* Designation - Grey Italic */}
          <p className="text-gray-400 font-medium italic text-xs lowercase">
            {visitor.designation}
          </p>
        </div>

        {/* 4. QR CODE */}
        <div className="z-10 bg-white p-2 rounded-xl border border-gray-100 shadow-sm mb-8">
          <QRCode 
            value={JSON.stringify({
              id: visitor.id,
              name: visitor.full_name,
              company: visitor.company_name
            })} 
            size={150}
          />
        </div>

        {/* 5. GREY FOOTER BOX (Corrected Dates) */}
        <div className="w-full bg-gray-50 py-4 px-6 border-t border-gray-100 mt-auto">
          <p className="text-gray-900 font-black text-sm uppercase tracking-wide">
            12th - 14th AUGUST 2026
          </p>
          <p className="text-gray-500 text-xs font-bold mt-1">
            GMDC Ground, Ahmedabad
          </p>
        </div>

        {/* 6. ORGANIZER LOGO SECTION */}
        <div className="bg-white w-full py-4 flex items-center justify-center gap-3">
            {/* IMPORTANT: Ensure 'organizer-logo.png' is in your 'public' folder */}
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
              <img src="/organizer-logo.png" alt="SB" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Organized By</p>
                <p className="text-[10px] text-gray-900 font-bold leading-tight">Shree Balaji Event LLP, Ahmedabad</p>
            </div>
        </div>

      </div>
      
      {/* Instruction Text */}
      <p className="fixed bottom-4 text-gray-400 text-xs font-medium">
        Please show this QR code at the entry gate
      </p>
    </div>
  )
}