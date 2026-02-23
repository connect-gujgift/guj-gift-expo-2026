'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function VisitorScannerPage() {
  const router = useRouter()
  const [visitor, setVisitor] = useState<any>(null)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [recentlyScanned, setRecentlyScanned] = useState<string | null>(null)

  useEffect(() => {
    const sessionData = localStorage.getItem('activeVisitor')
    if (!sessionData) {
      router.push('/visitor') 
      return
    }
    setVisitor(JSON.parse(sessionData))
  }, [router])

  const handleScan = async (scannedText: string) => {
    if (isProcessing || scannedText === recentlyScanned || !visitor) return;

    setIsProcessing(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      let parsedId = scannedText.trim()
      if (parsedId.includes('?id=')) {
        parsedId = parsedId.split('?id=')[1].split('&')[0]
      } else if (parsedId.includes('/')) {
        parsedId = parsedId.split('/').pop() || parsedId
      }

      const { data: exhibitor, error: exhibitorError } = await supabase
        .from('exhibitors')
        .select('id, company_name, stall_number')
        .eq('id', parsedId)
        .single()

      if (exhibitorError || !exhibitor) throw new Error("Exhibitor not found.")

      const { error: insertError } = await supabase
        .from('exhibitor_connections')
        .insert([{
          visitor_id: visitor.id,
          exhibitor_id: exhibitor.id
        }])

      if (insertError) {
        console.error("Insert Error:", insertError)
        // If we hit the Foreign Key error again, we'll give a helpful fix
        if (insertError.code === '23503') {
           throw new Error("Session Mismatch. Please Logout and Log back in to sync your pass.")
        }
        if (insertError.code === '23505') throw new Error(`Already saved ${exhibitor.company_name}.`)
        throw new Error(`Save failed: ${insertError.message}`)
      }

      setSuccessMessage(`Saved: ${exhibitor.company_name}`)
      setRecentlyScanned(scannedText)

      setTimeout(() => {
        setSuccessMessage('')
        setRecentlyScanned(null)
      }, 3000)

    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process scan.")
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!visitor) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold uppercase text-[10px] bg-slate-900">Checking Session...</div>

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 font-sans text-white pb-20">
      <div className="w-full max-w-[400px] mb-6 flex justify-between items-center mt-4">
          <Button variant="ghost" onClick={() => router.push('/visitor')} className="text-white hover:bg-white/10 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full">← Back to Hub</Button>
          <div className="text-right"><p className="text-[10px] text-blue-300 font-black uppercase tracking-widest">Visitor Mode</p></div>
      </div>

      <Card className="w-full max-w-[400px] border-0 shadow-2xl overflow-hidden rounded-[2rem] bg-slate-800 relative">
        <CardHeader className="bg-blue-600 p-6 text-center border-b border-blue-700">
          <CardTitle className="text-xl font-black uppercase tracking-tight text-white">Exhibitor Scanner</CardTitle>
          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-80">Point camera at Exhibitor Badge</p>
        </CardHeader>
        
        <CardContent className="p-0 relative">
          {successMessage && (
            <div className="absolute inset-0 z-20 bg-green-500/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg"><span className="text-green-500 text-3xl">✓</span></div>
                <p className="text-white font-black uppercase tracking-widest text-sm">{successMessage}</p>
            </div>
          )}
          {errorMessage && (
            <div className="absolute inset-0 z-20 bg-red-600/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg"><span className="text-red-600 text-3xl">✗</span></div>
                <p className="text-white font-black uppercase tracking-widest text-[11px] leading-relaxed px-4">{errorMessage}</p>
            </div>
          )}
          <div className="w-full aspect-square bg-black relative overflow-hidden flex items-center justify-center">
            <Scanner onScan={(res) => { if (res && res.length > 0) handleScan(res[0].rawValue) }} />
            <div className="absolute inset-0 pointer-events-none border-[40px] border-slate-900/40"></div>
          </div>
        </CardContent>
        <div className="bg-slate-800 p-6 text-center"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Scan exhibitors to save their info.</p></div>
      </Card>
    </div>
  )
}