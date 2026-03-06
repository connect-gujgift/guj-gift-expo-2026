'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StallManagementPage() {
  const router = useRouter()
  const [stalls, setStalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form State
  const [stallInput, setStallInput] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [badgeLimit, setBadgeLimit] = useState('5')
  const [stallType, setStallType] = useState('Silver')
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
      .order('created_at', { ascending: false })
    if (!error) setStalls(data || [])
  }

  const handleAddStall = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    // Convert comma-separated string to array for multiple stalls [cite: 2026-03-06]
    const stallArray = stallInput.split(',').map(s => s.trim().toUpperCase())
    
    const { error } = await supabase
      .from('stalls')
      .insert([{ 
        stall_number: stallArray, 
        company_name: companyName, 
        badge_limit: parseInt(badgeLimit), 
        stall_type: stallType,
        is_paid: isPaid 
      }])

    if (error) {
      alert(error.message)
    } else {
      setStallInput(''); setCompanyName(''); setBadgeLimit('5'); setIsPaid(false);
      fetchStalls()
    }
    setSaving(false)
  }

  const togglePaymentStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('stalls').update({ is_paid: !currentStatus }).eq('id', id)
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
        
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-6 rounded-2xl shadow-sm gap-4 border-b-4 border-teal-600">
          <div>
            <h1 className="text-3xl font-black uppercase text-teal-700 italic tracking-tighter leading-none">Finalized Stall Registry</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Supporting Combined Stall Units</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold border-2 text-[10px] uppercase rounded-xl px-6">← Back to Hub</Button>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          
          {/* FORM: Registration with Multi-Stall Support */}
          <Card className="md:col-span-4 border-0 shadow-md rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-teal-700 text-white p-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight">Register Exhibitor</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddStall} className="space-y-4">
                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Stall Numbers (Comma Separated)</Label>
                  <Input placeholder="e.g. T-101, T-102" value={stallInput} onChange={(e) => setStallInput(e.target.value)} required className="font-black bg-slate-50 border-0" />
                  <p className="text-[7px] text-slate-400 font-bold uppercase mt-1">Separate multiple stalls with commas</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Firm Name</Label>
                  <Input placeholder="Exhibitor Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="bg-slate-50 border-0" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="font-bold text-[10px] uppercase text-slate-400">Badge Quota</Label>
                    <Input type="number" value={badgeLimit} onChange={(e) => setBadgeLimit(e.target.value)} required className="font-black bg-slate-50 border-0" />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-bold text-[10px] uppercase text-slate-400">Space Tier</Label>
                    <Select onValueChange={setStallType} defaultValue={stallType}>
                      <SelectTrigger className="bg-slate-50 border-0 font-bold text-xs uppercase h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Silver">Silver (9m²)</SelectItem>
                        <SelectItem value="Gold">Gold (18m²)</SelectItem>
                        <SelectItem value="Diamond">Diamond (36m²)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <input type="checkbox" id="isPaid" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} className="w-5 h-5 accent-teal-600" />
                  <Label htmlFor="isPaid" className="font-black text-[10px] uppercase">Payment Received</Label>
                </div>
                <Button type="submit" disabled={saving} className="w-full bg-teal-600 h-14 font-black uppercase tracking-widest rounded-2xl text-white shadow-lg">
                  {saving ? 'Processing...' : 'Sync Registry'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* TABLE: Dynamic Array Display */}
          <Card className="md:col-span-8 border-0 shadow-md flex flex-col h-[700px] rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-white border-b p-6">
               <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-400">Live Inventory</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto bg-slate-50">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-200 text-slate-600 font-black uppercase text-[9px] sticky top-0 z-10">
                  <tr>
                    <th className="p-4 px-6">Stall Block</th>
                    <th className="p-4">Firm</th>
                    <th className="p-4">Tier</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4 text-right px-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {stalls.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(s.stall_number) ? s.stall_number.map((num: string) => (
                            <span key={num} className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-black text-[10px] border border-teal-100">{num}</span>
                          )) : <span className="font-black text-teal-700">{s.stall_number}</span>}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-700 uppercase">{s.company_name}</td>
                      <td className="p-4 font-black text-[9px] uppercase italic text-slate-400">{s.stall_type || 'Silver'}</td>
                      <td className="p-4">
                        <button onClick={() => togglePaymentStatus(s.id, s.is_paid)} className={`px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-sm ${s.is_paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {s.is_paid ? 'PAID' : 'UNPAID'}
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