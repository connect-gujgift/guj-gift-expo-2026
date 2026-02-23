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
  
  // Scanner States
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [recentlyScanned, setRecentlyScanned] = useState<string | null>(null)

  useEffect(() => {
    // Check for the active Visitor session in localStorage
    const sessionData = localStorage.getItem('activeVisitor')
    if (!sessionData) {
      router.push('/visitor') // Kick them back to login if no session is found
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
      // Step A: Look up the Exhibitor by the ID hidden in their QR code
      const { data: exhibitor, error: exhibitorError } = await supabase
        .from('exhibitors')
        .select('id, company_name, stall_number')
        .eq('id', scannedText)
        .single()

      if (exhibitorError || !exhibitor) {
        throw new Error("Invalid QR Code or Exhibitor Not Found.")
      }

      // Step B: Save the connection using the secure Visitor ID
      const { error: insertError } = await supabase
        .from('exhibitor_connections')
        .insert([{
          visitor_id: visitor.id,
          exhibitor_id: exhibitor.id
        }])

      if (insertError) {
        if (insertError.code === '23505') { 
          throw new Error(`You have already saved ${exhibitor.company_name}.`)
        }
        throw insertError
      }

      // Step C: Show Success
      setSuccessMessage(`Saved: ${exhibitor.company_name} (Stall ${exhibitor.stall_number || 'N/A'})`)
      setRecentlyScanned(scannedText)

      setTimeout(() => {
        setSuccessMessage('')
        setRecentlyScanned(null)
      }, 3000)

    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message || "Failed to scan badge.")
      
      setTimeout(() => {
        setErrorMessage('')
      }, 3000)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!visitor) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold uppercase text-xs tracking-widest bg-slate-900">Verifying Access...</div>

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 font-sans text-white pb-20">
      
      <div className="w-full max-w-[400px] mb-6 flex justify-between items-center mt-4">
          <Button variant="ghost" onClick={() => router.push('/visitor')} className="text-white hover:bg-white/10 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full">
             ← Back to Hub
          </Button>
          <div className="text-right">
              <p className="text-[10px] text-blue-300 font-black uppercase tracking-widest">Visitor Mode</p>
          </div>
      </div>

      <Card className="w-full max-w-[400px] border-0 shadow-2xl overflow-hidden rounded-[2rem] bg-slate-800 relative">
        <CardHeader className="bg-blue-600 p-6 text-center border-b border-blue-700">
          <CardTitle className="text-xl font-black uppercase tracking-tight text-white">Exhibitor Scanner</CardTitle>
          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-80">Point camera at Exhibitor Badge</p>
        </CardHeader>
        
        <CardContent className="p-0 relative">
          
          {successMessage && (
            <div className="absolute inset-0 z-20 bg-green-500/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                    <span className="text-green-500 text-3xl">✓</span>
                </div>
                <p className="text-white font-black uppercase tracking-widest text-sm leading-relaxed">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="absolute inset-0 z-20 bg-red-500/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                    <span className="text-red-500 text-3xl">✗</span>
                </div>
                <p className="text-white font-black uppercase tracking-widest text-sm leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {isProcessing && !successMessage && !errorMessage && (
            <div className="absolute inset-0 z-20 bg-slate-900/80 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-blue-400 font-black uppercase tracking-widest text-xs">Processing Scan...</p>
            </div>
          )}

          <div className="w-full aspect-square bg-black relative overflow-hidden flex items-center justify-center">
            <Scanner
                onScan={(detectedCodes) => {
                    if (detectedCodes && detectedCodes.length > 0) {
                        handleScan(detectedCodes[0].rawValue);
                    }
                }}
                onError={(error: any) => console.log(error?.message || error)}
            />
            
            <div className="absolute inset-0 pointer-events-none border-[40px] border-slate-900/40"></div>
            <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-blue-500/50 m-10 rounded-3xl"></div>
          </div>
          
        </CardContent>
        
        <div className="bg-slate-800 p-6 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                Scan an exhibitor's pass to instantly save their stall and contact info.
            </p>
        </div>
      </Card>
    </div>
  )
}