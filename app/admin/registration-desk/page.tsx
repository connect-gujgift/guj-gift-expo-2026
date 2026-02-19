'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// --- FIX: Prevents prerender errors during build ---
export const dynamic = 'force-dynamic'

export default function RegistrationDesk() {
  const router = useRouter()
  
  // UI & Search State
  const [searchTerm, setSearchTerm] = useState('')
  const [visitors, setVisitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Spot Registration Form State
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    checkAccess()
  }, [])

  // --- ACCESS CONTROL: Admins & Staff Only ---
  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    // Check if user is the main admin or has the staff flag
    const { data: profile } = await supabase
      .from('exhibitors')
      .select('is_staff')
      .eq('id', user.id)
      .single()

    // Replace with your actual admin email
    const isAdmin = user.email === 'super@gmail.com' 
    
    if (!profile?.is_staff && !isAdmin) {
      router.push('/dashboard')
    } else {
      setLoading(false)
    }
  }

  // --- SEARCH: Find pre-registered visitors by phone/name ---
  const handleSearch = async () => {
    if (!searchTerm) return
    setActionLoading(true)
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .or(`phone.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
      .limit(10)
    
    if (error) console.error(error)
    else setVisitors(data || [])
    setActionLoading(false)
  }

  // --- SPOT REGISTRATION: Register walk-ins ---
  const handleSpotRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    
    // Insert directly into visitors table for speed
    const { data, error } = await supabase
      .from('visitors')
      .insert([formData])
      .select()

    if (error) {
      alert("Registration Error: " + error.message)
    } else {
      alert("✅ Registration Successful!")
      setVisitors(data || []) // Show the new visitor in the list for printing
      setFormData({ full_name: '', company_name: '', phone: '', email: '' })
    }
    setActionLoading(false)
  }

  if (loading) return <div className="p-20 text-center font-black uppercase text-slate-400">Opening Desk...</div>

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-black uppercase text-[#0b3d41] tracking-tighter italic">Registration Desk</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Guj Gift Expo 2026 | On-site Pass Printing</p>
          </div>
          <Button variant="outline" onClick={() => router.back()} className="font-bold border-2 text-xs uppercase rounded-xl">Back</Button>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          
          {/* SEARCH SECTION */}
          <div className="md:col-span-7 space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-[#0b3d41] text-white rounded-t-xl py-4">
                <CardTitle className="text-xs uppercase tracking-widest font-black">Search Pre-Registered</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter Phone or Name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="bg-slate-50 border-0 h-12 font-medium"
                  />
                  <Button onClick={handleSearch} disabled={actionLoading} className="bg-[#0b3d41] h-12 px-8 font-black">SEARCH</Button>
                </div>

                <div className="mt-6 space-y-3">
                  {visitors.map(vis => (
                    <div key={vis.id} className="p-4 bg-white border rounded-2xl flex justify-between items-center hover:border-blue-200 transition-all">
                      <div>
                        <p className="font-black text-[#0b3d41] uppercase text-sm leading-tight">{vis.full_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">
                          {vis.company_name} | <span className="text-blue-600">{vis.phone}</span>
                        </p>
                      </div>
                      <Button 
                        onClick={() => window.open(`/badge/print?id=${vis.id}`, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase h-9 px-5 rounded-lg"
                      >
                        PRINT PASS 🖨️
                      </Button>
                    </div>
                  ))}
                  {visitors.length === 0 && !actionLoading && (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-3xl">
                        <p className="text-slate-300 font-bold uppercase text-[10px]">No records found. Perform a search or register walk-in.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SPOT REGISTRATION FORM */}
          <div className="md:col-span-5">
            <Card className="border-0 shadow-md sticky top-6 overflow-hidden">
              <CardHeader className="bg-[#ef6c33] text-white py-4">
                <CardTitle className="text-xs uppercase tracking-widest font-black">Spot Registration</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSpotRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Visitor Name</Label>
                    <Input 
                      required 
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                      placeholder="e.g. Rahul Sharma" className="bg-slate-50 border-0 h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Company Name</Label>
                    <Input 
                      required 
                      value={formData.company_name}
                      onChange={e => setFormData({...formData, company_name: e.target.value})}
                      placeholder="Firm Name" className="bg-slate-50 border-0 h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phone Number</Label>
                    <Input 
                      required 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="10-digit mobile" className="bg-slate-50 border-0 h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email (Optional)</Label>
                    <Input 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="visitor@email.com" className="bg-slate-50 border-0 h-11" 
                    />
                  </div>
                  <Button type="submit" disabled={actionLoading} className="w-full bg-[#ef6c33] hover:bg-[#d45a27] h-14 font-black uppercase tracking-widest mt-2 rounded-xl shadow-lg shadow-orange-100 transition-all">
                    {actionLoading ? 'Saving...' : 'Register & Print'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}