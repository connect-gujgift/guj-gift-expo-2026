'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QRCodeSVG } from 'qrcode.react'

export default function RetrievePassPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Pass State
  const [passData, setPassData] = useState<any>(null)
  const [passType, setPassType] = useState<'Visitor' | 'Staff' | null>(null)

  const handleRetrieve = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPassData(null)
    setPassType(null)

    const searchPhone = phone.trim()

    // 1. Check if they are Staff/Exhibitor first
    const { data: staffData } = await supabase
      .from('exhibitors')
      .select('*')
      .eq('phone', searchPhone)
      .eq('is_staff', true)
      .single()

    if (staffData) {
      setPassData(staffData)
      setPassType('Staff')
      setLoading(false)
      return
    }

    // 2. If not Staff, check if they are a Visitor
    const { data: visitorData } = await supabase
      .from('visitors')
      .select('*')
      .eq('phone', searchPhone)
      .single()

    if (visitorData) {
      setPassData(visitorData)
      setPassType('Visitor')
      setLoading(false)
      return
    }

    // 3. If neither, show error
    setError('No registration found for this phone number. Please check the number or register at the desk.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900 pb-20 selection:bg-[#0b3d41] selection:text-white">
      
      {/* HEADER / BACK BUTTON */}
      <div className="w-full max-w-sm mb-6 flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.push('/')} className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-[#0b3d41]">
          ← Back to Home
        </Button>
      </div>

      {!passData ? (
        <Card className="w-full max-w-sm border-0 shadow-2xl overflow-hidden rounded-[2.5rem] bg-white animate-in fade-in zoom-in duration-300">
          <CardHeader className="bg-[#0b3d41] text-white p-8 text-center border-b-4 border-orange-500">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
              🎟️
            </div>
            <CardTitle className="text-2xl font-black uppercase tracking-tight italic">Retrieve Pass</CardTitle>
            <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest mt-2">Guj Gift Expo 2026</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleRetrieve} className="space-y-6">
              
              <div className="text-center mb-6">
                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                  Enter your registered phone number to instantly fetch your digital entry pass.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Registered Phone</Label>
                <Input 
                  required 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="+91" 
                  className="bg-slate-50 border-2 border-slate-100 h-14 font-bold text-lg rounded-xl text-center focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-all" 
                />
              </div>
              
              <Button type="submit" disabled={loading} className="w-full bg-[#0b3d41] hover:bg-slate-800 h-14 font-black uppercase tracking-widest rounded-xl shadow-xl transition-all text-white mt-4 active:scale-95">
                {loading ? 'Searching...' : 'Find My Pass →'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* DIGITAL PASS DISPLAY */
        <div className="w-full max-w-sm flex flex-col items-center animate-in zoom-in duration-300">
          <div className="bg-emerald-100 text-emerald-700 p-4 rounded-2xl mb-6 w-full text-center border border-emerald-200 shadow-sm">
             <p className="font-black uppercase tracking-widest text-[10px]">✅ Pass Retrieved</p>
          </div>

          <div className={`w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 ${passType === 'Staff' ? 'border-amber-500' : 'border-[#0b3d41]'}`}>
            <div className={`${passType === 'Staff' ? 'bg-amber-500' : 'bg-[#0b3d41]'} text-white text-center py-6 px-4`}>
               <h2 className="text-2xl font-black uppercase tracking-widest italic">{passType} Pass</h2>
               <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1">Guj Gift Expo 2026</p>
            </div>

            <div className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="space-y-1 w-full border-b border-slate-100 pb-6">
                <p className="text-2xl font-black text-slate-900 uppercase leading-none">{passData.full_name}</p>
                <p className="text-sm font-bold text-slate-500 mt-1 uppercase">
                  {passData.designation || passData.company_name}
                </p>
              </div>

              {/* THE QR CODE */}
              <div className="bg-white p-4 rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] border-2 border-slate-100">
                <QRCodeSVG 
                  value={passType === 'Staff' ? `GGE2026-STAFF-${passData.id}` : `GGE2026-VISITOR-${passData.id}`} 
                  size={200} 
                  level="H" 
                  includeMargin={false}
                  fgColor="#0f172a" 
                />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                Screenshot & Show at Entry
              </p>
            </div>
          </div>
          
          <Button variant="ghost" onClick={() => {setPassData(null); setPhone('');}} className="mt-8 font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-800">
            Search Another Number
          </Button>
        </div>
      )}
    </div>
  )
}