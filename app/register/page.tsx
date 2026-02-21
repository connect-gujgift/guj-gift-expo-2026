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

  // Notice: We removed password and added phone to match the DB
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

    // 1. Check if the phone number is already registered
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

    // 2. Insert the new visitor directly (No Auth/Password required)
    const { data, error: insertError } = await supabase
      .from('visitors')
      .insert([formData])
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
    } else {
      // 3. Show the success screen with their new pass
      setVisitorPass(data)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      
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
        <Card className="w-full max-w-[450px] border-0 shadow-2xl overflow-hidden rounded-3xl bg-white">
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
        /* SUCCESS SCREEN & DIGITAL PASS */
        <div className="w-full max-w-[400px] flex flex-col items-center">
          <div className="bg-green-100 text-green-700 p-4 rounded-2xl mb-6 w-full text-center border border-green-200">
             <p className="font-black uppercase tracking-widest text-xs">✅ Registration Successful!</p>
             <p className="text-[10px] font-bold opacity-80 mt-1">Please save or screenshot your pass below.</p>
          </div>

          <Card className="w-full border-0 shadow-2xl overflow-hidden rounded-3xl bg-white">
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
              <p className="text-xs font-bold uppercase mt-2 opacity-90">{visitorPass.company_name}</p>
            </div>
            
            <CardContent className="p-8 flex flex-col items-center bg-slate-50">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-6">
                <QRCode value={visitorPass.id} size={180} fgColor="#0b3d41" />
              </div>
              
              <Button 
                onClick={() => window.open(`/badge/print?id=${visitorPass.id}`, '_blank')}
                className="w-full bg-[#0b3d41] hover:bg-slate-800 h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all text-white"
              >
                Save / Print Pass
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}