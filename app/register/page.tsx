'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import QRCode from "react-qr-code"

export default function PublicRegistration() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [visitorPass, setVisitorPass] = useState<any>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    phone: '',
    email: ''
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: existingUser } = await supabase
      .from('visitors')
      .select('id')
      .eq('phone', formData.phone)
      .single()

    if (existingUser) {
      setError('This phone number is already registered! Please log in via the Visitor Portal.')
      setLoading(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('visitors')
      .insert([formData])
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
    } else {
      setVisitorPass(data)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-900 pb-20">
      
      {/* Back Button */}
      <div className="w-full max-w-[450px] mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/login')}
          className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-[#ef6c33]"
        >
          ← Back to Main Hub
        </Button>
      </div>

      {!visitorPass ? (
        /* REGISTRATION FORM */
        <Card className="w-full max-w-[450px] border-0 shadow-2xl overflow-hidden rounded-[2rem] bg-white">
          <CardHeader className="bg-[#0b3d41] text-white p-8 text-center">
            <img src="/event-logo.png" alt="GGE 2026" className="h-16 mx-auto mb-4 object-contain" />
            <CardTitle className="text-xl font-black uppercase tracking-tight italic">Visitor Registration</CardTitle>
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-70">Guj Gift Expo 2026</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase leading-tight">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name *</Label>
                <Input 
                  required 
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  placeholder="e.g. Rahul Sharma" 
                  className="bg-slate-50 border-0 h-12 font-medium" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Company / Firm Name *</Label>
                <Input 
                  required 
                  value={formData.company_name}
                  onChange={e => setFormData({...formData, company_name: e.target.value})}
                  placeholder="e.g. Shree Balaji Event LLP" 
                  className="bg-slate-50 border-0 h-12 font-medium" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mobile Number *</Label>
                  <Input 
                    required 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="10-digit number" 
                    className="bg-slate-50 border-0 h-12 font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email (Optional)</Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="visitor@email.com" 
                    className="bg-slate-50 border-0 h-12 font-medium" 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#ef6c33] hover:bg-[#d45a27] h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-100 transition-all text-white mt-4"
              >
                {loading ? 'Processing...' : 'Generate Digital Pass'}
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Already registered?{' '}
                    <span 
                        className="text-[#0b3d41] cursor-pointer hover:underline"
                        onClick={() => router.push('/visitor')}
                    >
                        Retrieve Pass Here
                    </span>
                </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* SUCCESS SCREEN & DIGITAL PASS - Finalized Design */
        <div className="w-full max-w-[350px] flex flex-col items-center">
          <div className="bg-green-100 text-green-700 p-4 rounded-2xl mb-6 w-full text-center border border-green-200 shadow-sm">
             <p className="font-black uppercase tracking-widest text-xs">✅ Registration Successful!</p>
             <p className="text-[10px] font-bold opacity-80 mt-1">Please save or screenshot your pass below.</p>
          </div>

          <Card className="w-full border-0 shadow-2xl overflow-hidden rounded-[2.5rem] bg-white relative">
            
            {/* Close button */}
            <Button variant="ghost" className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-800" onClick={() => setVisitorPass(null)}>✕</Button>
            
            {/* 1. TOP EVENT LOGO - Clean background */}
            <div className="bg-white pt-6 pb-4 flex justify-center">
              <img src="/event-logo.png" alt="Guj Gift Expo" className="h-20 object-contain" />
            </div>

            {/* 2. OVERLAPPING PILL */}
            <div className="flex justify-center -mt-5 relative z-10">
              <div className="bg-[#ef6c33] text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-4 border-white shadow-sm">
                Valued Visitor
              </div>
            </div>

            {/* 3. MIDDLE BODY (QR & NAME) */}
            <div className="px-6 pt-8 pb-6 bg-white flex-col flex gap-6 text-center items-center">
              {/* QR Code bordered box */}
              <div className="p-2 border-[3px] border-[#ef6c33] rounded-2xl bg-white inline-block">
                <QRCode value={visitorPass.id} size={130} fgColor="#0b3d41" level="H" />
              </div>
              
              {/* Name & Role */}
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-black text-[#0b3d41] uppercase leading-none tracking-tighter break-words">
                  {visitorPass.full_name}
                </h2>
                <p className="text-sm font-black text-[#ef6c33] uppercase tracking-widest mt-1">
                  Visitor
                </p>
              </div>

              {/* Company / Firm */}
              <div className="border-t border-slate-100 w-full pt-4">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Company / Firm</p>
                <p className="text-lg font-black text-[#0b3d41] uppercase leading-tight">
                  {visitorPass.company_name || 'Individual'}
                </p>
              </div>
            </div>

            {/* 4. DARK TEAL EVENT INFO STRIP */}
            <div className="bg-[#0b3d41] text-white flex px-6 py-4 w-full">
              <div className="w-1/2 pr-3 border-r border-teal-700/50 text-left">
                <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Date</p>
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">12-14 Aug 2026</p>
              </div>
              <div className="w-1/2 pl-4 text-left">
                <p className="text-[8px] font-bold uppercase tracking-widest text-teal-200/60 mb-1">Location</p>
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">GMDC UNIVERSITY GROUND, AHMEDABAD</p>
              </div>
            </div>

            {/* 5. BOTTOM ORGANIZER FOOTER - Centered Layout */}
            <div className="bg-slate-50 px-6 py-4 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                <img src="/organizer-logo.png" alt="Organizer Logo" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
              <div className="text-center">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Organized By</p>
                <p className="text-[10px] font-black text-[#0b3d41] uppercase tracking-wide">Shree Balaji Event LLP</p>
              </div>
            </div>
          </Card>

          {/* Action Button */}
          <div className="w-full mt-6">
              <Button 
                  onClick={() => window.open(`/badge/print?id=${visitorPass.id}`, '_blank')}
                  className="w-full bg-[#0b3d41] hover:bg-slate-800 h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all text-white"
              >
                  Save / Print Digital Pass
              </Button>
          </div>
        </div>
      )}
    </div>
  )
}