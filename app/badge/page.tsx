'use client'
import { useEffect, useState, useRef } from 'react' // Added useRef
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import QRCode from 'react-qr-code'
import { toPng } from 'html-to-image' // Added this import
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function BadgePage() {
  const router = useRouter()
  const badgeRef = useRef<HTMLDivElement>(null) // Reference for the badge
  const [visitor, setVisitor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVisitor = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data } = await supabase
        .from('visitors')
        .select('*')
        .eq('id', user.id)
        .single()
      setVisitor(data)
      setLoading(false)
    }
    fetchVisitor()
  }, [router])

  // Function to download ONLY the badge as an image
  const downloadBadgeImage = () => {
    if (badgeRef.current === null) return

    toPng(badgeRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = `Guj-Gift-Expo-Badge-${visitor?.full_name || 'Visitor'}.png`
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err)
      })
  }

  if (loading) return <div className="p-10 text-center">Generating...</div>

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      
      {/* 1. We wrap the Card in a div with badgeRef */}
      <div ref={badgeRef} className="bg-gray-100 p-2"> 
        <Card className="w-[350px] shadow-2xl border-t-[10px] border-orange-500 relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -z-0 opacity-40"></div>
          <CardContent className="flex flex-col items-center pt-6 pb-4 z-10 relative">
            
            <div className="flex flex-col items-center mb-3">
               <Image src="/event-logo.jpg" alt="Expo" width={160} height={80} className="object-contain mb-2" />
               <span className="bg-orange-600 text-white px-3 py-0.5 rounded text-[10px] font-black tracking-widest uppercase">
                 VISITOR PASS
               </span>
            </div>

            <div className="text-center mb-4">
              <h2 className="text-2xl font-black text-gray-900 leading-tight uppercase">{visitor?.full_name}</h2>
              <p className="text-blue-600 font-bold text-sm uppercase tracking-wide">{visitor?.company_name}</p>
              <p className="text-gray-500 text-[11px] font-medium italic">{visitor?.designation}</p>
            </div>

            <div className="bg-white p-2 border border-gray-100 rounded shadow-inner mb-4">
               <QRCode size={90} value={visitor?.id || "unknown"} viewBox={`0 0 256 256`} />
            </div>

            <div className="text-center w-full mb-3 bg-gray-50 py-2">
              <p className="text-[11px] font-black text-gray-800">12th - 14th AUGUST 2026</p>
              <p className="text-[10px] text-gray-600 font-bold">GMDC University Ground, Ahmedabad</p>
            </div>

            <div className="w-full border-t border-gray-100 pt-3 flex items-center justify-center gap-3">
              <Image src="/organizer-logo.jpg" alt="Balaji" width={30} height={30} className="rounded-full" />
              <div className="text-left">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Organized By</p>
                <p className="text-[10px] font-black text-gray-800 leading-none">Shree Balaji Event LLP, Ahmedabad</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex gap-3">
        {/* NEW DOWNLOAD IMAGE BUTTON */}
        <Button onClick={downloadBadgeImage} variant="outline" className="text-xs h-9 bg-white shadow-sm border-orange-200 text-orange-700 hover:bg-orange-50">
          Download Image
        </Button>
        <Button onClick={() => router.push('/exhibitors')} className="bg-blue-600 hover:bg-blue-700 text-xs h-9">
          View Directory
        </Button>
      </div>
    </div>
  )
}