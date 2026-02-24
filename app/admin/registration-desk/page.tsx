'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function RegistrationDeskPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    visitors: any[],
    exhibitors: any[],
    staff: any[]
  }>({ visitors: [], exhibitors: [], staff: [] })

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'maulikshah.13@gmail.com') {
      router.push('/login')
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    setLoading(true)

    // Search across all three categories simultaneously
    const [visRes, exhRes] = await Promise.all([
      supabase.from('visitors').select('*').or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`),
      supabase.from('exhibitors').select('*').or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    ])

    setResults({
      visitors: visRes.data || [],
      exhibitors: (exhRes.data || []).filter(e => !e.is_staff),
      staff: (exhRes.data || []).filter(e => e.is_staff)
    })
    setLoading(false)
  }

  const printBadge = (id: string, type: 'visitor' | 'exhibitor' | 'staff') => {
    // Routes to your existing badge printing templates
    window.open(`/badge/print?id=${id}&type=${type}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-600">
          <div>
            <h1 className="text-2xl font-black uppercase text-blue-900 italic tracking-tight">Registration Desk</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Onsite Badge Printing Station</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold border-2 text-[10px] uppercase rounded-xl">← Back</Button>
        </div>

        {/* Search Bar */}
        <Card className="border-0 shadow-lg rounded-[1.5rem] overflow-hidden">
          <CardContent className="p-6 bg-[#0b3d41]">
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input 
                placeholder="Search by Name, Phone, or Email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 bg-white/10 border-0 text-white placeholder:text-white/40 font-bold px-6 rounded-xl focus-visible:ring-offset-0 focus-visible:ring-blue-400"
              />
              <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 h-14 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest text-white">
                {loading ? 'Searching...' : 'Find User'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Sections */}
        <div className="space-y-4">
          
          {/* Visitors */}
          {results.visitors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Visitors Found</h3>
              {results.visitors.map(v => (
                <ResultCard key={v.id} name={v.full_name} info={v.company_name} subInfo={v.phone} type="visitor" onPrint={() => printBadge(v.id, 'visitor')} />
              ))}
            </div>
          )}

          {/* Exhibitors */}
          {results.exhibitors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Exhibitors Found</h3>
              {results.exhibitors.map(e => (
                <ResultCard key={e.id} name={e.full_name} info={e.company_name} subInfo={`Stall: ${e.stall_number}`} type="exhibitor" onPrint={() => printBadge(e.id, 'exhibitor')} />
              ))}
            </div>
          )}

          {/* Staff */}
          {results.staff.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Staff Members</h3>
              {results.staff.map(s => (
                <ResultCard key={s.id} name={s.full_name} info={s.company_name} subInfo="Internal Team" type="staff" onPrint={() => printBadge(s.id, 'staff')} />
              ))}
            </div>
          )}

          {searchTerm && !loading && results.visitors.length === 0 && results.exhibitors.length === 0 && results.staff.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
               <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No matching records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultCard({ name, info, subInfo, type, onPrint }: any) {
  const colors: any = {
    visitor: 'bg-orange-500',
    exhibitor: 'bg-[#0b3d41]',
    staff: 'bg-blue-600'
  }

  return (
    <Card className="border-0 shadow-sm overflow-hidden rounded-2xl bg-white hover:shadow-md transition-all">
      <div className="flex items-center p-4 gap-4">
        <div className={`w-12 h-12 ${colors[type]} rounded-xl flex items-center justify-center text-white text-xl`}>
          {type === 'visitor' ? '👤' : type === 'exhibitor' ? '🎪' : '🛡️'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-black uppercase text-slate-900 tracking-tight leading-none">{name}</h4>
            <Badge className={`${colors[type]} text-[8px] h-4 font-black`}>{type.toUpperCase()}</Badge>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{info} • {subInfo}</p>
        </div>
        <Button onClick={onPrint} className="bg-slate-900 hover:bg-black text-white font-black text-[9px] uppercase px-6 h-10 rounded-xl">
          Print Badge ⎙
        </Button>
      </div>
    </Card>
  )
}