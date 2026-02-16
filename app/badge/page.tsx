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
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // 2. Fetch profile from 'visitors' table
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching visitor:', error)
      } else {
        setVisitor(data)
      }
      setLoading(false)
    }

    fetchVisitor()
  }, [router])

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading Badge...</div>
  if (!visitor) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Badge not found.</div>

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* CARD CONTAINER: White bg, Orange Border, Rounded Corners */}
      <div className="bg-white w-full max-w-sm rounded-[2rem] border-[6px] border-orange-500 shadow-2xl overflow-hidden relative flex flex-col items-center text-center pb-6">
        
        {/* TOP DECORATION (Optional - adds the 'curve' effect at top right if desired, purely decorative) */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-10 -mt-10 z-0 opacity-50"></div>

        {/* 1. LOGO AREA */}
        <div className="mt-8 z-10 w-48 mb-4">
           {/* Replace '/logo.png' with your actual logo file path if you have one uploaded to public folder */}
           {/* If you don't have a logo file yet, this text acts as a placeholder matching the arch design */}
           <div className="text-center">
             <h2 className="text-2xl font-black text-slate-800 leading-none">GUJ GIFT</h2>
             <h2 className="text-2xl font-black text-orange-600 leading-none">EXPO 2026</h2>
             <div className="w-full h-1 bg-slate-800 mt-1 rounded-full"></div>
           </div>
        </div>

        {/* 2. VISITOR PASS TAG */}
        <div className="z-10 bg-orange-600 text-white px-6 py-1 rounded-full text-sm font-bold tracking-wide uppercase mb-6 shadow-md">
          Visitor Pass
        </div>

        {/* 3. VISITOR DETAILS */}
        <div className="z-10 w-full px-4 mb-6">
          {/* Name - Black & Bold */}
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-tight mb-1">
            {visitor.full_name}
          </h1>
          
          {/* Company - BLUE (Restored from Old Badge) */}
          <p className="text-blue-600 font-bold uppercase text-sm tracking-wide mb-1">
            {visitor.company_name}
          </p>
          
          {/* Designation - Grey Italic */}
          <p className="text-gray-400 font-medium italic text-xs">
            {visitor.designation}
          </p>
        </div>

        {/* 4. QR CODE AREA */}
        <div className="z-10 bg-white p-3 rounded-xl border border-gray-100 shadow-sm mb-8">
          <QRCode 
            value={JSON.stringify({
              id: visitor.id,
              name: visitor.full_name,
              company: visitor.company_name
            })} 
            size={160}
          />
        </div>

        {/* 5. FOOTER BOX (Dates & Location) */}
        <div className="w-full bg-gray-50 py-4 px-6 border-t border-gray-100 mt-auto">
          <p className="text-gray-800 font-bold text-sm uppercase">
            27th Feb - 1st March 2026
          </p>
          <p className="text-gray-500 text-xs font-semibold mt-1">
            GMDC Ground, Ahmedabad
          </p>
        </div>

        {/* 6. ORGANIZER FOOTER */}
        <div className="bg-white w-full py-3 flex items-center justify-center gap-2">
            {/* Tiny logo placeholder */}
            <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-[8px] text-white font-bold">SB</div>
            <div className="text-left">
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Organized By</p>
                <p className="text-[10px] text-gray-800 font-bold leading-none">Shree Balaji Event LLP</p>
            </div>
        </div>

      </div>
      
      {/* Helper text below card */}
      <p className="fixed bottom-4 text-gray-400 text-xs font-medium animate-pulse">
        Please show this QR code at the entry gate
      </p>
    </div>
  )
}