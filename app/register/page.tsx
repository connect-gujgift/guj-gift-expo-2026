'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QRCodeSVG } from 'qrcode.react'

export default function PublicRegistration() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [visitorPass, setVisitorPass] = useState<any>(null)

  const [formData, setFormData] = useState({ 
    full_name: '', 
    company_name: '', 
    phone: '', 
    email: '',
    designation: '',
    city: '',
    business_type: 'Corporate Buyer'
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // 1. Check for Duplicate Phone Numbers
    const { data: existingUser } = await supabase.from('visitors').select('id').eq('phone', formData.phone).single()
    if (existingUser) {
      setError('This phone number is already registered! Please log in via the Visitor Portal to retrieve your pass.')
      setLoading(false)
      return
    }

    // 2. Insert New Visitor
    const { data, error: insertError } = await supabase.from('visitors').insert([formData]).select().single()
    if (insertError) {
      setError(insertError.message)
    } else {
      setVisitorPass(data)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      
      {/* PUBLIC HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 py-4 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-[#0b3d41] rounded-lg flex items-center justify-center text-white font-black italic shadow-inner">
             GGE
           </div>
           <span className="font-black uppercase tracking-widest text-[#0b3d41] text-sm hidden md:block">
             Guj Gift Expo 2026
           </span>
        </div>
        <Button variant="outline" onClick={() => router.push('/')} className="font-black uppercase tracking-widest text-[10px] rounded-xl border-2">
          ← Back to Home
        </Button>
      </header>

      <div className="flex-1 p-4 md:p-8 flex items-center justify-center pb-20">
        <div className="w-full max-w-4xl">
          
          {!visitorPass ? (
            <div className="grid md:grid-cols-5 gap-8 bg-white rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white">
              
              {/* LEFT SIDE: BRANDING PANEL */}
              <div className="md:col-span-2 bg-[#0b3d41] p-10 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 space-y-6">
                  <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
                    Visitor <br/><span className="text-orange-500">Registration</span>
                  </h1>
                  <p className="text-teal-100 font-medium text-sm leading-relaxed">
                    Join Gujarat's premier B2B gifting exhibition. Pre-register now to receive your fast-track digital entry pass.
                  </p>
                </div>

                <div className="relative z-10 mt-12 space-y-4">
                   <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                     <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">Date</p>
                     <p className="font-black tracking-wide text-sm">12 - 24 August 2026</p>
                   </div>
                   <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                     <p className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-1">Venue</p>
                     <p className="font-black tracking-wide text-sm">GMDC University Hall, Ahmedabad</p>
                   </div>
                </div>
              </div>

              {/* RIGHT SIDE: THE FORM */}
              <div className="md:col-span-3 p-8 md:p-12">
                <form onSubmit={handleRegister} className="space-y-6">
                  
                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-red-100">
                      ⚠️ {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name *</Label>
                      <Input required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Rahul Patel" className="h-12 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus-visible:ring-orange-500"/>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile Number *</Label>
                      <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91" className="h-12 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus-visible:ring-orange-500"/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                    <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="buyer@company.com" className="h-12 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus-visible:ring-orange-500"/>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company Name *</Label>
                      <Input required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} placeholder="Enterprise Ltd" className="h-12 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus-visible:ring-orange-500"/>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Designation</Label>
                      <Input value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="Purchase Manager" className="h-12 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus-visible:ring-orange-500"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">City</Label>
                      <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Ahmedabad" className="h-12 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus-visible:ring-orange-500"/>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Business Type</Label>
                      <select 
                        value={formData.business_type} 
                        onChange={e => setFormData({...formData, business_type: e.target.value})}
                        className="w-full h-12 rounded-xl bg-slate-50 border-2 border-slate-100 px-4 font-bold text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="Corporate Buyer">Corporate Buyer</option>
                        <option value="Retailer / Wholesaler">Retailer / Wholesaler</option>
                        <option value="Distributor">Distributor</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full h-14 bg-[#0b3d41] hover:bg-[#082a2d] text-white font-black uppercase tracking-widest rounded-xl shadow-xl mt-4 text-sm transition-all active:scale-95">
                    {loading ? 'Processing...' : 'Secure My Entry Pass →'}
                  </Button>
                </form>
              </div>
            </div>

          ) : (

            /* SUCCESS STATE: THE DIGITAL PASS */
            <div className="max-w-md mx-auto animate-in zoom-in duration-500">
              <div className="text-center mb-6">
                 <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">✅</div>
                 <h2 className="text-2xl font-black uppercase tracking-tighter text-[#0b3d41]">Registration Complete!</h2>
                 <p className="text-xs font-bold text-slate-500 mt-2">Please take a screenshot of your pass below.</p>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-[#0b3d41] relative">
                <div className="bg-[#0b3d41] text-white text-center py-6 px-4">
                   <h2 className="text-2xl font-black uppercase tracking-widest italic">Visitor Pass</h2>
                   <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest mt-1">Guj Gift Expo 2026</p>
                </div>

                <div className="p-8 flex flex-col items-center text-center space-y-6">
                  <div className="space-y-1 w-full border-b border-slate-100 pb-6">
                    <p className="text-2xl font-black text-slate-900 uppercase leading-none">{visitorPass.full_name}</p>
                    <p className="text-sm font-bold text-slate-500">{visitorPass.designation || 'Visitor'}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Organization</p>
                    <p className="text-xl font-black text-orange-500 uppercase leading-none">{visitorPass.company_name}</p>
                  </div>

                  {/* UPGRADED QR CODE LOGIC FOR THE NEW SCANNER */}
                  <div className="bg-white p-4 rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] border-2 border-slate-100">
                    <QRCodeSVG 
                      value={`GGE2026-VISITOR-${visitorPass.id}`} 
                      size={200} 
                      level="H" 
                      includeMargin={false}
                      fgColor="#0b3d41" 
                    />
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scan at Express Entry</p>
                </div>
              </div>
              
              <div className="mt-8 text-center space-y-4">
                <Button onClick={() => window.location.reload()} className="w-full bg-[#0b3d41] hover:bg-slate-800 h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all text-white">
                  Register Another Visitor
                </Button>
                <Button variant="ghost" onClick={() => router.push('/')} className="font-black uppercase tracking-widest text-[10px] rounded-xl text-slate-500 hover:text-slate-900">
                  Return to Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}