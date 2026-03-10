'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function StallRegistryPage() {
  const router = useRouter()
  const [stalls, setStalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // State for the Edit Modal
  const [editingStall, setEditingStall] = useState<any>(null)
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
      .from('exhibitors')
      .select('*')
      .eq('is_staff', false)
      .order('stall_number', { ascending: true })
    
    if (!error) setStalls(data || [])
  }

  // Save changes to Supabase
  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('exhibitors')
      .update({
        stall_number: editingStall.stall_number,
        stall_tier: editingStall.stall_tier,
        payment_status: editingStall.payment_status
      })
      .eq('id', editingStall.id)

    if (!error) {
      await fetchStalls() // Refresh the table
      setEditingStall(null) // Close the modal
    } else {
      alert("Error saving: " + error.message)
    }
    setSaving(false)
  }

  const filteredStalls = stalls.filter(s => 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.stall_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-teal-600 uppercase tracking-widest text-[10px] animate-pulse">Accessing Registry...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-20 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-[2rem] shadow-sm border-b-4 border-teal-600 gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase text-teal-700 tracking-tighter italic leading-none">Exhibitor Dept.</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">
              GMDC University Hall • Aug 12-24, 2026
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Input 
              placeholder="Search Stall or Company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 bg-slate-100 border-0 font-bold rounded-xl text-xs w-full md:w-64"
            />
            <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold border-2 text-[10px] uppercase rounded-xl px-6 h-10">
              ← Hub
            </Button>
          </div>
        </div>

        {/* 4-TIER STATS QUICK-VIEW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <TierStat label="Platinum" count={stalls.filter(s => s.stall_tier === 'Platinum').length} color="bg-indigo-600" />
           <TierStat label="Diamond" count={stalls.filter(s => s.stall_tier === 'Diamond').length} color="bg-purple-600" />
           <TierStat label="Gold" count={stalls.filter(s => s.stall_tier === 'Gold').length} color="bg-amber-400" />
           <TierStat label="Silver" count={stalls.filter(s => (!s.stall_tier || s.stall_tier === 'Silver')).length} color="bg-[#0b3d41]" />
        </div>

        {/* MASTER REGISTRY TABLE */}
        <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span>🎪</span> Stall Booking Registry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-auto max-h-[600px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 sticky top-0 z-10">
                <tr className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="p-4 px-8">Stall</th>
                  <th className="p-4">Company & Contact</th>
                  <th className="p-4">Tier</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-right px-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStalls.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 px-8">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-inner">
                        {s.stall_number || 'TBA'}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-slate-900 uppercase text-sm leading-none">{s.company_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{s.full_name} • {s.phone}</p>
                    </td>
                    <td className="p-4">
                      <Badge className={`uppercase text-[8px] font-black tracking-widest px-3 py-1 rounded-full border-0 ${
                        s.stall_tier === 'Platinum' ? 'bg-indigo-600 text-white' :
                        s.stall_tier === 'Diamond' ? 'bg-purple-600 text-white' :
                        s.stall_tier === 'Gold' ? 'bg-amber-400 text-slate-900' :
                        'bg-[#0b3d41] text-white'
                      }`}>
                        {s.stall_tier || 'Silver'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${s.payment_status === 'Fully Paid' ? 'text-emerald-500' : 'text-orange-500'}`}>
                        {s.payment_status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right px-8">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => setEditingStall({...s})} 
                         className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                       >
                         Edit
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStalls.length === 0 && (
              <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px] italic">
                No matching exhibitor records found.
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* EDIT MODAL OVERLAY */}
      {editingStall && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border-0 shadow-2xl rounded-[2rem] overflow-hidden animate-in fade-in zoom-in duration-300">
            <CardHeader className="bg-teal-600 text-white p-6 border-b-4 border-teal-800">
              <CardTitle className="text-sm font-black uppercase tracking-widest">
                Edit Exhibitor Record
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company</label>
                <p className="font-black text-slate-900 uppercase">{editingStall.company_name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stall Number</label>
                <Input 
                  value={editingStall.stall_number || ''} 
                  onChange={e => setEditingStall({...editingStall, stall_number: e.target.value.toUpperCase()})}
                  placeholder="e.g. G5, P1, 88"
                  className="font-bold uppercase h-12 rounded-xl bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stall Tier</label>
                <select 
                  value={editingStall.stall_tier || 'Silver'} 
                  onChange={e => setEditingStall({...editingStall, stall_tier: e.target.value})}
                  className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 font-bold text-sm outline-none focus:border-teal-500"
                >
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Status</label>
                <select 
                  value={editingStall.payment_status || 'Pending'} 
                  onChange={e => setEditingStall({...editingStall, payment_status: e.target.value})}
                  className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 font-bold text-sm outline-none focus:border-teal-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Fully Paid">Fully Paid</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={() => setEditingStall(null)} variant="outline" className="w-full font-black uppercase tracking-widest rounded-xl h-12">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-widest rounded-xl h-12 shadow-lg">
                  {saving ? 'Saving...' : 'Save Updates'}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function TierStat({ label, count, color }: { label: string, count: number, color: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 flex items-center justify-between" style={{ borderLeftColor: color.includes('bg-') ? undefined : color }}>
      <div className={`w-2 h-10 rounded-full ${color}`}></div>
      <div className="text-right">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-none">{count}</p>
      </div>
    </div>
  )
}