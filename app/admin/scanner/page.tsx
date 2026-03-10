'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Scanner } from '@yudiel/react-qr-scanner'

export default function MobileScannerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  
  // Scanner State
  const [scanning, setScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [scanData, setScanData] = useState<any>(null)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    // ALLOWED ADMIN EMAILS
    const allowedEmails = ['maulikshah.13@gmail.com', 'connect@shreebalajievent.com']

    if (!user || !allowedEmails.includes(user.email || '')) {
      alert("Access Denied: Only authorized organizers can access the scanner.")
      router.push('/login')
    } else {
      setLoading(false)
    }
  }

  const handleScan = async (detectedCodes: any[]) => {
    if (scanning || detectedCodes.length === 0) return
    setScanning(true)
    
    const qrText = detectedCodes[0].rawValue
    if (!qrText) {
      setScanStatus('invalid')
      return
    }

    let targetTable = 'visitors'
    let targetId = qrText
    let badgeType = 'Visitor'

    // SMART DETECTION: Is it a Staff Pass or a Visitor Pass?
    if (qrText.startsWith('GGE2026-STAFF-')) {
      targetTable = 'exhibitors'
      targetId = qrText.replace('GGE2026-STAFF-', '')
      badgeType = 'Exhibitor Staff'
    } else {
      // Assuming visitor QR codes might just be the raw ID, or have a prefix
      targetId = qrText.replace('GGE2026-VISITOR-', '') 
    }

    // VERIFY IN DATABASE
    const { data, error } = await supabase
      .from(targetTable)
      .select('*')
      .eq('id', targetId)
      .single()

    if (error || !data) {
      setScanStatus('invalid')
    } else {
      setScanData({ ...data, badgeType })
      setScanStatus('valid')
    }
  }

  const resetScanner = () => {
    setScanStatus('idle')
    setScanData(null)
    setTimeout(() => setScanning(false), 800) 
  }

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center font-black text-slate-400 uppercase tracking-widest text-[10px] animate-pulse">Initializing Security Camera...</div>

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      
      {/* HEADER */}
      <div className="p-6 bg-slate-950 border-b-2 border-slate-800 flex justify-between items-center z-10">
        <div>
          <h1 className="text-xl font-black uppercase text-teal-400 tracking-tighter italic">Security Terminal</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gate 1 • Universal Scanner</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin')} className="font-black border-2 border-slate-700 text-slate-300 text-[10px] uppercase rounded-xl bg-transparent hover:bg-slate-800 h-10">
          Hub
        </Button>
      </div>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col relative">
        
        {/* CAMERA FEED */}
        {scanStatus === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
            <div className="w-full max-w-sm aspect-square overflow-hidden rounded-[3rem] border-4 border-slate-700 shadow-[0_0_50px_-12px_rgba(45,212,191,0.2)] relative bg-black">
              <Scanner 
                onScan={handleScan}
                formats={['qr_code']}
                styles={{ container: { width: '100%', height: '100%' } }}
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white/20 rounded-[2rem] relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-400 rounded-tl-[2rem]"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-400 rounded-tr-[2rem]"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-400 rounded-bl-[2rem]"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-400 rounded-br-[2rem]"></div>
                </div>
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse text-center leading-relaxed">
              Align Visitor or Staff <br/> QR Code inside frame
            </p>
          </div>
        )}

        {/* SUCCESS SCREEN */}
        {scanStatus === 'valid' && scanData && (
          <div className="absolute inset-0 z-20 bg-emerald-500 flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
            <div className="w-full max-w-sm bg-white text-slate-900 rounded-[2rem] p-8 shadow-2xl flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-2">
                ✅
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-emerald-600">Entry Permitted</h2>
              
              <div className="w-full border-t border-slate-200 py-4 space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">{scanData.badgeType}</p>
                 <p className="text-xl font-black uppercase">{scanData.full_name}</p>
              </div>
              
              <div className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Company</p>
                 <p className="text-sm font-bold uppercase text-slate-700 mb-2">{scanData.company_name}</p>
                 {scanData.badgeType === 'Exhibitor Staff' && (
                   <div className="inline-block bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest">
                     Stall: {scanData.stall_number || 'TBA'}
                   </div>
                 )}
              </div>
            </div>
            
            <Button onClick={resetScanner} className="mt-8 w-full max-w-sm h-16 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-black active:scale-95 transition-all text-lg">
              Scan Next →
            </Button>
          </div>
        )}

        {/* ERROR SCREEN */}
        {scanStatus === 'invalid' && (
          <div className="absolute inset-0 z-20 bg-red-600 flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
            <div className="w-full max-w-sm bg-white text-slate-900 rounded-[2rem] p-8 shadow-2xl flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mb-2">
                ❌
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-red-600">Access Denied</h2>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed pt-2">
                Invalid or unrecognized QR code. Ticket not found in registry.
              </p>
            </div>
            
            <Button onClick={resetScanner} className="mt-8 w-full max-w-sm h-16 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-black active:scale-95 transition-all text-lg">
              Try Again ↻
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}