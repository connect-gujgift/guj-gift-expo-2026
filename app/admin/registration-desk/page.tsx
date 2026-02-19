'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const dynamic = 'force-dynamic'

export default function RegistrationDesk() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [visitors, setVisitors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Spot Registration Form State
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    phone: '',
    email: ''
  })

  // 1. Search existing visitors
  const handleSearch = async () => {
    if (!searchTerm) return
    setLoading(true)
    const { data } = await supabase
      .from('visitors')
      .select('*')
      .or(`phone.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
    setVisitors(data || [])
    setLoading(false)
  }

  // 2. Handle Spot Registration
  const handleSpotRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Note: On-spot registration usually doesn't require a full Auth account 
    // to save time, we insert directly into the visitors table.
    const { data, error } = await supabase
      .from('visitors')
      .insert([formData])
      .select()

    if (error) {
      alert("Error: " + error.message)
    } else {
      alert("Registration Successful!")
      setVisitors(data || [])
      setFormData({ full_name: '', company_name: '', phone: '', email: '' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20 font-sans">
      <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-6">
        
        {/* LEFT: SEARCH & RESULTS */}
        <div className="md:col-span-7 space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-[#0b3d41] text-white rounded-t-xl">
              <CardTitle className="text-sm uppercase tracking-widest">Find Pre-Registered Visitor</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter Phone or Name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-50 border-0 h-12"
                />
                <Button onClick={handleSearch} className="bg-[#0b3d41] h-12 px-8">SEARCH</Button>
              </div>

              <div className="mt-6 divide-y">
                {visitors.map(vis => (
                  <div key={vis.id} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="font-black text-[#0b3d41] uppercase">{vis.full_name}</p>
                      <p className="text-xs text-slate-500 uppercase">{vis.company_name} | {vis.phone}</p>
                    </div>
                    {/* Link to a dedicated print-view */}
                    <Button 
                      variant="outline" 
                      className="border-2 font-bold text-xs"
                      onClick={() => window.open(`/badge/print?id=${vis.id}`, '_blank')}
                    >
                      PRINT PASS 🖨️
                    </Button>
                  </div>
                ))}
                {visitors.length === 0 && !loading && (
                  <p className="text-center py-10 text-slate-400 text-xs font-bold uppercase italic">No records found. Use spot registration →</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: SPOT REGISTRATION */}
        <div className="md:col-span-5">
          <Card className="border-0 shadow-md sticky top-6">
            <CardHeader className="bg-[#ef6c33] text-white rounded-t-xl">
              <CardTitle className="text-sm uppercase tracking-widest">Spot Registration</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSpotRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Visitor Full Name</Label>
                  <Input 
                    required 
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Enter Name" className="bg-slate-50 border-0" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Company Name</Label>
                  <Input 
                    required 
                    value={formData.company_name}
                    onChange={e => setFormData({...formData, company_name: e.target.value})}
                    placeholder="Enter Company" className="bg-slate-50 border-0" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Mobile Number</Label>
                  <Input 
                    required 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter Phone" className="bg-slate-50 border-0" 
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-[#ef6c33] h-14 font-black uppercase tracking-widest mt-2">
                  {loading ? 'Registering...' : 'Register & Print'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}