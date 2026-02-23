'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function StallManagementPage() {
  const router = useRouter()
  const [stalls, setStalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form State
  const [stallNumber, setStallNumber] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [badgeLimit, setBadgeLimit] = useState('5') // NEW: Badge Allotment
  const [isPaid, setIsPaid] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    checkAdmin()
    fetchStalls()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'maulikshah.13@gmail.com') {
      router.push('/login')
    } else {
      setLoading(false)
    }
  }

  const fetchStalls = async () => {
    const { data, error } = await supabase
      .from('stalls')
      .select('*')
      .order('stall_number', { ascending: true })
    
    if (!error) setStalls(data || [])
  }

  const handleAddStall = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const { error } = await supabase
      .from('stalls')
      .insert([{ 
        stall_number: stallNumber.toUpperCase(), 
        company_name: companyName, 
        badge_limit: parseInt(badgeLimit), // Save allotment
        is_paid: isPaid 
      }])

    if (error) {
      alert(error.message)
    } else {
      setStallNumber('')
      setCompanyName('')
      setBadgeLimit('5')
      setIsPaid(false)
      fetchStalls()
    }
    setSaving(false)
  }

  const togglePaymentStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('stalls')
      .update({ is_paid: !currentStatus })
      .eq('id', id)
    
    if (!error) fetchStalls()
  }

  const deleteStall = async (id: string) => {
    if (!confirm("Remove this stall from registry?")) return
    const { error } = await supabase.from('stalls').delete().eq('id', id)
    if (!error) fetchStalls()
  }

  if (loading) return <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest text-sm">Loading Stalls...</div>

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-6 rounded-2xl shadow-sm gap-4 border-b-4 border-teal-600">
          <div>
            <h1 className="text-3xl font-black uppercase text-teal-700 tracking-tighter italic leading-none">Stall Registry</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Exhibitor Inventory Management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold border-2 text-[10px] uppercase rounded-xl px-6 bg-white hover:bg-slate-50">
              ← Back to Admin Hub
            </Button>
            <Button variant="destructive" size="sm" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="font-bold text-[10px] uppercase rounded-xl">
              Logout
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          
          {/* FORM CARD */}
          <Card className="md:col-span-4 border-0 shadow-md h-fit rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-teal-700 text-white p-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight">Register New Stall</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddStall} className="space-y-4">
                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Stall Number</Label>
                  <Input placeholder="e.g. A-101" value={stallNumber} onChange={(e) => setStallNumber(e.target.value)} required className="font-black bg-slate-50 border-0 uppercase" />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Company Name</Label>
                  <Input placeholder="Firm Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="font-medium bg-slate-50 border-0" />
                </div>
                
                {/* NEW BADGE ALLOTMENT FIELD */}
                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Badge Allotment</Label>
                  <Input type="number" value={badgeLimit} onChange={(e) => setBadgeLimit(e.target.value)} required className="font-black bg-slate-50 border-0" />
                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Number of passes included with this stall</p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <input type="checkbox" id="isPaid" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} className="w-5 h-5 accent-teal-600" />
                  <Label htmlFor="isPaid" className="font-black text-[10px] uppercase cursor-pointer">Mark as Fully Paid</Label>
                </div>
                <Button type="submit" disabled={saving} className="w-full bg-teal-600 hover:bg-teal-700 font-black uppercase tracking-widest py-6 rounded-2xl shadow-lg transition-all">
                  {saving ? 'Registering...' : 'Register Stall'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* INVENTORY TABLE CARD */}
          <Card className="md:col-span-8 border-0 shadow-md flex flex-col h-[700px] rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-white border-b p-6">
               <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-400">Inventory Status</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto bg-slate-50">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-200 text-slate-600 font-black uppercase text-[9px] sticky top-0 z-10">
                  <tr>
                    <th className="p-4 px-6">Stall #</th>
                    <th className="p-4">Firm Name</th>
                    <th className="p-4 text-center">Badges</th> {/* NEW COLUMN */}
                    <th className="p-4">Payment</th>
                    <th className="p-4 text-right px-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {stalls.map((s) => (
                    <tr key={s.id} className="hover:bg-white transition-colors bg-white/50">
                      <td className="p-4 px-6">
                        <span className="font-black text-teal-700 text-sm">{s.stall_number}</span>
                      </td>
                      <td className="p-4 font-bold text-slate-700 uppercase">{s.company_name}</td>
                      <td className="p-4 text-center">
                        <span className="bg-slate-100 px-3 py-1 rounded-md font-black text-slate-500">{s.badge_limit || 0}</span>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => togglePaymentStatus(s.id, s.is_paid)}
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${s.is_paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                        >
                          {s.is_paid ? 'PAID ✓' : 'UNPAID ✗'}
                        </button>
                      </td>
                      <td className="p-4 text-right px-6">
                        <Button variant="ghost" size="sm" onClick={() => deleteStall(s.id)} className="h-7 text-slate-300 hover:text-red-500 font-black text-[9px] uppercase">
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}