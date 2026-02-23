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
    const sessionData = localStorage.getItem('activeExhibitor')
    if (sessionData) {
      setExhibitor(JSON.parse(sessionData))
    } else {
      router.push('/dashboard')
    }
  }, [router])

  const handleScan = async (scannedText: string) => {
    if (isProcessing || scannedText === recentlyScanned) return;

    setIsProcessing(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const { data: visitor, error: visitorError } = await supabase
        .from('visitors')
        .select('id, full_name, company_name')
        .eq('id', scannedText)
        .single()

      if (visitorError || !visitor) {
        throw new Error("Invalid QR Code or Visitor Not Found.")
      }

      const { error: insertError } = await supabase
        .from('leads')
        .insert([{
          exhibitor_id: exhibitor.id,
          visitor_id: visitor.id
        }])

      if (insertError) {
        if (insertError.code === '23505') { 
          throw new Error(`You have already scanned ${visitor.full_name}.`)
        }
        throw insertError
      }

      setSuccessMessage(`Successfully captured lead: ${visitor.full_name} from ${visitor.company_name || 'Individual'}`)
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

  if (!exhibitor) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold uppercase text-xs tracking-widest">Verifying Access...</div>

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 font-sans text-white pb-20">
      
      <div className="w-full max-w-[400px] mb-6 flex justify-between items-center mt-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-white hover:bg-white/10 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full">
             ← Exit Scanner
          </Button>
          <div className="text-right">
              <p className="text-[10px] text-teal-300 font-black uppercase tracking-widest">Stall {exhibitor.stall_number}</p>
          </div>
      </div>

      <Card className="w-full max-w-[400px] border-0 shadow-2xl overflow-hidden rounded-[2rem] bg-slate-800 relative">
        <CardHeader className="bg-[#0b3d41] p-6 text-center border-b border-teal-700">
          <CardTitle className="text-xl font-black uppercase tracking-tight text-white">Lead Scanner</CardTitle>
          <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest mt-1 opacity-80">Point camera at Visitor Badge</p>
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
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-teal-400 font-black uppercase tracking-widest text-xs">Processing Scan...</p>
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
            <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-teal-500/50 m-10 rounded-3xl"></div>
          </div>
          
        </CardContent>
        
        <div className="bg-slate-800 p-6 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                Scan a visitor's pass to instantly add them to your stall's lead database.
            </p>
        </div>
      </Card>

    </div>
  )
}