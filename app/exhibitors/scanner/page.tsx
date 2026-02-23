'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function LeadScannerPage() {
  const router = useRouter()
  const [exhibitor, setExhibitor] = useState<any>(null)
  
  // Scanner States
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [recentlyScanned, setRecentlyScanned] = useState<string | null>(null)

  useEffect(() => {
    const initUser = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return router.push('/login')

      const { data: exhibitorData } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!exhibitorData) return router.push('/dashboard')
      setExhibitor(exhibitorData)
    }
    initUser()
  }, [router])

  const handleScan = async (scannedText: string) => {
    if (isProcessing || scannedText === recentlyScanned || !exhibitor) return;

    setIsProcessing(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      // SMART PARSE: Handle IDs that might be wrapped in URLs or have spaces
      let parsedId = scannedText.trim()
      if (parsedId.includes('?id=')) {
        parsedId = parsedId.split('?id=')[1].split('&')[0]
      } else if (parsedId.includes('/')) {
        parsedId = parsedId.split('/').pop() || parsedId
      }

      // 1. Find the Visitor
      const { data: visitor, error: visitorError } = await supabase
        .from('visitors')
        .select('id, full_name, company_name')
        .eq('id', parsedId)
        .single()

      if (visitorError || !visitor) {
        throw new Error("Visitor not found. Ensure you are scanning a valid GGE 2026 badge.")
      }

      // 2. Save the Lead
      const { error: insertError } = await supabase
        .from('leads')
        .insert([{
          exhibitor_id: exhibitor.id,
          visitor_id: visitor.id
        }])

      if (insertError) {
        if (insertError.code === '23505') throw new Error(`Already scanned: ${visitor.full_name}`)
        throw insertError
      }

      setSuccessMessage(`CAPTURED: ${visitor.full_name}`)
      setRecentlyScanned(scannedText)

      setTimeout(() => {
        setSuccessMessage('')
        setRecentlyScanned(null)
      }, 3000)

    } catch (err: any) {
      setErrorMessage(err.message || "Failed to scan badge.")
      setTimeout(() => setErrorMessage(''), 4000)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!exhibitor) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Verifying Access...</div>

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 font-sans text-white pb-20">
      
      <div className="w-full max-w-[400px] mb-6 flex justify-between items-center mt-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-white hover:bg-white/10 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full transition-all">
             ← Back to Hub
          </Button>
          <div className="text-right">
              <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest">Stall {exhibitor.stall_number}</p>
          </div>
      </div>

      <Card className="w-full max-w-[400px] border-0 shadow-2xl overflow-hidden rounded-[2.5rem] bg-slate-800 relative">
        <CardHeader className="bg-[#0b3d41] p-6 text-center border-b border-teal-800">
          <CardTitle className="text-xl font-black uppercase tracking-tight text-white">Lead Scanner</CardTitle>
          <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest mt-1 opacity-80">Point camera at Visitor Badge</p>
        </CardHeader>
        
        <CardContent className="p-0 relative">
          
          {successMessage && (
            <div className="absolute inset-0 z-20 bg-green-500/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md animate-in fade-in duration-300">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl">
                    <span className="text-green-500 text-4xl font-bold">✓</span>
                </div>
                <p className="text-white font-black uppercase tracking-widest text-sm leading-relaxed">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="absolute inset-0 z-20 bg-red-600/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md animate-in fade-in duration-300">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl">
                    <span className="text-red-600 text-4xl font-bold">✗</span>
                </div>
                <p className="text-white font-black uppercase tracking-widest text-[11px] leading-relaxed px-4">{errorMessage}</p>
            </div>
          )}

          {isProcessing && !successMessage && !errorMessage && (
            <div className="absolute inset-0 z-20 bg-slate-900/80 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-teal-400 font-black uppercase tracking-widest text-[10px]">Processing...</p>
            </div>
          )}

          <div className="w-full aspect-square bg-black relative overflow-hidden">
            <Scanner
                onScan={(res) => { if (res && res.length > 0) handleScan(res[0].rawValue) }}
                onError={(err) => console.log(err)}
            />
            <div className="absolute inset-0 pointer-events-none border-[50px] border-slate-900/40"></div>
            <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-teal-500/40 m-12 rounded-3xl animate-pulse"></div>
          </div>
          
        </CardContent>
        
        <div className="bg-slate-800 p-8 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                Scan visitor passes to build your lead database.
            </p>
        </div>
      </Card>

    </div>
  )
}