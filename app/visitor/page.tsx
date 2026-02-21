import Image from 'next/image'

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import QRCode from "react-qr-code"

export default function VisitorPortal() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [visitorPass, setVisitorPass] = useState<any>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error || !data) {
      setError('No pass found for this number. Please register at the desk.')
    } else {
      setVisitorPass(data)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      
      {/* Back Button */}
      <div className="w-full max-w-[400px] mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/login')}
          className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-[#ef6c33]"
        >
          ← Back to Main Hub
        </Button>
      </div>

      {/* Lookup Form */}
      {!visitorPass ? (
        <Card className="w-full max-w-[400px] border-0 shadow-2xl overflow-hidden rounded-3xl bg-white">
          <CardHeader className="bg-[#0b3d41] text-white p-8 text-center">
            <img src="/event-logo.png" alt="GGE 2026" className="h-16 mx-auto mb-4 object-contain" />
            <CardTitle className="text-xl font-black uppercase tracking-tight italic">Visitor Portal</CardTitle>
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-70">Retrieve Digital Pass</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase leading-tight">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Registered Phone Number</Label>
                <Input 
                  type="text" 
                  placeholder="Enter 10-digit mobile number" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-slate-50 border-0 h-12 font-medium text-center tracking-widest"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#ef6c33] hover:bg-[#d45a27] h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-100 transition-all text-white"
              >
                {loading ? 'Searching...' : 'Find My Pass'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* The Digital Pass Display */
        <Card className="w-full max-w-[350px] border-0 shadow-2xl overflow-hidden rounded-3xl bg-white">
          <div className="bg-[#ef6c33] p-6 text-center text-white relative">
            <Button 
                variant="ghost" 
                className="absolute top-2 left-2 text-white/70 hover:text-white"
                onClick={() => setVisitorPass(null)}
            >
                ✕
            </Button>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Guj Gift Expo 2026</p>
            <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">{visitorPass.full_name}</h2>
            <p className="text-xs font-bold uppercase mt-2 opacity-90">{visitorPass.company_name || 'Visitor'}</p>
          </div>
          
          <CardContent className="p-8 flex flex-col items-center bg-slate-50">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-6">
              <QRCode value={visitorPass.id} size={180} fgColor="#0b3d41" />
            </div>
            
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-6">
              Present this QR code at <br/> exhibitor stalls to connect.
            </p>

            <Button 
              onClick={() => window.open(`/badge/print?id=${visitorPass.id}`, '_blank')}
              className="w-full bg-[#0b3d41] hover:bg-slate-800 h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all text-white"
            >
              Download / Print Pass
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}