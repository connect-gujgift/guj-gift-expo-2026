'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function VIPRegistrationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ full_name: '', company_name: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Insert as a Visitor but with a VIP flag for the desk to see
    const { data, error } = await supabase
      .from('visitors')
      .insert([{ 
        ...formData, 
        is_vip: true, // Tagging them for the dedicated desk
        source: 'VIP_PRE_REG' 
      }])
      .select()
      .single()

    if (error) {
      alert("Error: " + error.message)
    } else {
      // Save session so they are logged into their hub immediately
      localStorage.setItem('activeVisitor', JSON.stringify(data))
      localStorage.setItem('visitorLoginTime', new Date().getTime().toString())
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen bg-[#0b3d41] flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mb-6 text-3xl">✓</div>
      <h1 className="text-3xl font-black uppercase italic tracking-tighter">Registration Successful!</h1>
      <p className="mt-4 text-teal-200 font-bold uppercase text-[10px] tracking-widest max-w-xs">Your VIP Digital Pass is ready. Please show this at the Dedicated VIP Counter for instant printing.</p>
      <Button onClick={() => router.push('/visitor')} className="mt-8 bg-[#ef6c33] px-10 h-14 rounded-2xl font-black uppercase tracking-widest">View My Digital Pass</Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-[#0b3d41] text-white p-10 text-center border-b-8 border-[#ef6c33]">
          <img src="/event-logo.png" className="h-16 mx-auto mb-4" />
          <CardTitle className="text-2xl font-black uppercase tracking-tighter italic">VIP Pre-Registration</CardTitle>
          <p className="text-[10px] font-bold text-teal-300 uppercase tracking-widest mt-2">Skip the Line • GGE 2026</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-slate-400">Full Name</Label>
              <Input placeholder="Your Name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-slate-400">Company Name</Label>
              <Input placeholder="Firm Name" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-slate-400">Mobile Number</Label>
              <Input placeholder="10-digit number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-16 bg-[#0b3d41] hover:bg-black text-white font-black uppercase tracking-widest rounded-2xl mt-4">
              {loading ? 'Processing VIP Pass...' : 'Get VIP Pass Now'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}