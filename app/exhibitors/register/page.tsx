'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ExhibitorRegistrationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // The Complete Form State including the new 'phone' field
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    stall_number: '',
    phone: '',
    email: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Basic frontend validation
    if (!formData.full_name || !formData.company_name || !formData.phone) {
      setError('Please fill in all required fields.')
      setLoading(false)
      return
    }

    try {
      // 1. Insert the new exhibitor into Supabase
      const { data, error: supabaseError } = await supabase
        .from('exhibitors')
        .insert([
          {
            full_name: formData.full_name,
            company_name: formData.company_name,
            stall_number: formData.stall_number,
            phone: formData.phone,
            email: formData.email,
            is_staff: false // Default to standard exhibitor
          }
        ])
        .select()
        .single()

      if (supabaseError) throw supabaseError

      // 2. Save session to local storage (Powers our new Self-Healing Badge Page)
      localStorage.setItem('activeExhibitor', JSON.stringify(data))

      // 3. Send them directly to their newly generated pass!
      router.push(`/badge?id=${data.id}`)
      
    } catch (err: any) {
      console.error('Registration Error:', err)
      setError(err.message || 'Failed to register. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-900 py-12 pb-20">
      
      {/* Top Event Logo */}
      <div className="w-full max-w-[400px] mb-6 flex justify-center opacity-80">
          <img src="/event-logo.png" alt="Guj Gift Expo" className="h-16 object-contain" />
      </div>

      <Card className="w-full max-w-[400px] border-0 shadow-2xl overflow-hidden rounded-[2rem] bg-white">
        
        {/* Sleek Dark Header */}
        <CardHeader className="bg-[#0b3d41] text-white p-8 text-center relative overflow-hidden">
          <CardTitle className="text-2xl font-black uppercase tracking-tight relative z-10">
            Exhibitor Portal
          </CardTitle>
          <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest mt-1 relative z-10">
            Official Pass Registration
          </p>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error Message Display */}
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase leading-tight">
                {error}
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name *</Label>
              <Input 
                required 
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Shourya Shah" 
                className="bg-slate-50 border-slate-200 h-12 font-medium" 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Company / Firm Name *</Label>
              <Input 
                required 
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="e.g. Shourya Stitch Industries" 
                className="bg-slate-50 border-slate-200 h-12 font-medium uppercase" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Stall No.</Label>
                <Input 
                  name="stall_number"
                  value={formData.stall_number}
                  onChange={handleChange}
                  placeholder="e.g. A-12" 
                  className="bg-slate-50 border-slate-200 h-12 font-black uppercase text-[#0b3d41]" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mobile No. *</Label>
                <Input 
                  required 
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit number" 
                  className="bg-slate-50 border-slate-200 h-12 font-medium" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</Label>
              <Input 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@company.com" 
                className="bg-slate-50 border-slate-200 h-12 font-medium" 
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-[#ef6c33] hover:bg-[#d45a27] h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-100 transition-all text-white"
            >
              {loading ? 'Registering...' : 'Generate Pass'}
            </Button>

          </form>
        </CardContent>
      </Card>

      {/* Organizer Footer */}
      <div className="mt-8 opacity-60 flex flex-col items-center">
         <img src="/organizer-logo.png" alt="Organizer" className="h-8 grayscale mb-2" onError={(e) => e.currentTarget.style.display = 'none'} />
         <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Organized by Shree Balaji Event LLP</p>
      </div>

    </div>
  )
}