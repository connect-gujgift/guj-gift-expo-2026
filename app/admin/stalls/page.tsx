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
      .eq('is_staff', false) // Exclude staff from stall list
      .order('stall_number', { ascending: true })
    
    if (!error) setStalls(data || [])
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

        {/* TIER STATS QUICK-VIEW */}
        <div className="grid grid-cols-3 gap-4">
           <TierStat label="Diamond" count={stalls.filter(s => s.stall_tier === 'Diamond').length} color="bg-cyan-500" />
           <TierStat label="Gold" count={stalls.filter(s => s.stall_tier === 'Gold').length} color="bg-amber-400" />
           <TierStat label="Silver" count={stalls.filter(s => s.stall_tier === 'Silver').length} color="bg-slate-400" />
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
                        {s.stall_number}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-slate-900 uppercase text-sm leading-none">{s.company_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{s.full_name} • {s.phone}</p>
                    </td>
                    <td className="p-4">
                      <Badge className={`uppercase text-[8px] font-black tracking-widest px-3 py-1 rounded-full border-0 ${
                        s.stall_tier === 'Diamond' ? 'bg-cyan-500 text-white' :
                        s.stall_tier === 'Gold' ? 'bg-amber-400 text-slate-900' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {s.stall_tier || 'Silver'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-black uppercase ${s.payment_status === 'Fully Paid' ? 'text-emerald-500' : 'text-orange-500'}`}>
                        {s.payment_status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right px-8">
                       <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase text-blue-600 hover:bg-blue-50 rounded-lg">
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