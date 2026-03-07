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
  
  const [stallInput, setStallInput] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [badgeLimit, setBadgeLimit] = useState('5')
  const [stallType, setStallType] = useState('Silver')
  const [paymentStatus, setPaymentStatus] = useState('Fully Paid')
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
      .order('created_at', { ascending: false })
    if (!error) setStalls(data || [])
  }

  const handleAddStall = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const stallArray = stallInput.split(',').map(s => s.trim().toUpperCase())
    
    const { error } = await supabase
      .from('stalls')
      .insert([{ 
        stall_number: stallArray, 
        company_name: companyName, 
        badge_limit: parseInt(badgeLimit), 
        stall_type: stallType,
        payment_status: paymentStatus 
      }])

    if (error) {
      alert(error.message)
    } else {
      setStallInput(''); setCompanyName(''); setBadgeLimit('5'); setPaymentStatus('Fully Paid');
      fetchStalls()
    }
    setSaving(false)
  }

  const cyclePaymentStatus = async (id: string, currentStatus: string) => {
    let nextStatus = 'Fully Paid'
    if (currentStatus === 'Fully Paid') nextStatus = 'Advance / On Hold'
    else if (currentStatus === 'Advance / On Hold') nextStatus = 'Unpaid'

    const { error } = await supabase.from('stalls').update({ payment_status: nextStatus }).eq('id', id)
    if (!error) fetchStalls()
  }

  const deleteStall = async (id: string) => {
    if (!confirm("Delete this registry?")) return
    const { error } = await supabase.from('stalls').delete().eq('id', id)
    if (!error) fetchStalls()
  }

  if (loading) return <div className="p-10 text-center font-black text-slate-400 uppercase text-sm bg-slate-100 min-h-screen">Verifying Access...</div>

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-6 rounded-2xl shadow-sm gap-4 border-b-4 border-teal-600">
          <div>
            <h1 className="text-3xl font-black uppercase text-teal-700 italic leading-none">Stall Registry</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Updated 4-Tier Layout Support</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold border-2 text-[10px] uppercase rounded-xl px-6">← Back</Button>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          <Card className="md:col-span-4 border-0 shadow-md rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-teal-700 text-white p-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight">Register Exhibitor</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddStall} className="space-y-4">
                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Stall Numbers (e.g. 15, G2, P1)</Label>
                  <Input placeholder="15, G2" value={stallInput} onChange={(e) => setStallInput(e.target.value)} required className="font-black bg-slate-50 border-0" />
                </div>
                
                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Firm Name</Label>
                  <Input placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="bg-slate-50 border-0 font-bold" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="font-bold text-[10px] uppercase text-slate-400">Badges</Label>
                    <Input type="number" value={badgeLimit} onChange={(e) => setBadgeLimit(e.target.value)} required className="font-black bg-slate-50 border-0" />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-bold text-[10px] uppercase text-slate-400">Tier / Size</Label>
                    {/* UPDATED TIERS BASED ON NEW PDF */}
                    <select value={stallType} onChange={(e) => setStallType(e.target.value)} className="w-full bg-slate-50 border-0 font-bold text-[10px] uppercase h-10 rounded-md px-2 outline-none">
                      <option value="Silver">Silver (9m²)</option>
                      <option value="Gold">Gold (36m²)</option>
                      <option value="Diamond">Diamond (54m²)</option>
                      <option value="Platinum">Platinum (72m²)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Booking Status</Label>
                  <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="w-full bg-slate-50 border-0 font-bold text-xs uppercase h-12 rounded-xl px-4 outline-none">
                    <option value="Fully Paid">✅ Fully Paid (Confirmed)</option>
                    <option value="Advance / On Hold">⏳ Advance / On Hold</option>
                    <option value="Unpaid">❌ Unpaid (Booked)</option>
                  </select>
                </div>
                
                <Button type="submit" disabled={saving} className="w-full bg-teal-600 h-14 font-black uppercase text-white rounded-2xl shadow-lg mt-2">
                  {saving ? 'Saving...' : 'Register Stall'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="md:col-span-8 border-0 shadow-md flex flex-col h-[700px] rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-white border-b p-6">
               <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-400">Live Inventory</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto bg-slate-50">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-200 text-slate-600 font-black uppercase text-[9px] sticky top-0 z-10">
                  <tr>
                    <th className="p-4 px-6">Stalls</th>
                    <th className="p-4">Firm</th>
                    <th className="p-4">Tier</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right px-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {stalls.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(s.stall_number) ? s.stall_number.map((num: string) => (
                            <span key={num} className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-black text-[9px] border border-teal-100">{num}</span>
                          )) : <span className="font-black text-teal-700">{s.stall_number}</span>}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-700 uppercase">{s.company_name}</td>
                      <td className="p-4 font-black text-[9px] uppercase italic text-slate-400">{s.stall_type || 'Silver'}</td>
                      <td className="p-4">
                        <button onClick={() => cyclePaymentStatus(s.id, s.payment_status || 'Fully Paid')} className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase shadow-sm transition-all ${
                          s.payment_status === 'Fully Paid' ? 'bg-green-100 text-green-700 border border-green-200' : 
                          s.payment_status === 'Advance / On Hold' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {s.payment_status || 'Fully Paid'} ↻
                        </button>
                      </td>
                      <td className="p-4 text-right px-6">
                        <Button variant="ghost" size="sm" onClick={() => deleteStall(s.id)} className="h-7 text-slate-300 hover:text-red-500 font-black text-[9px] uppercase">Delete</Button>
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