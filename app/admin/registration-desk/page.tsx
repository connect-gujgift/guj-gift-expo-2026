'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

function DeskContent() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLive, setIsLive] = useState(true) // Controls the auto-refresh
  const [results, setResults] = useState<{
    visitors: any[],
    exhibitors: any[],
    staff: any[]
  }>({ visitors: [], exhibitors: [], staff: [] })

  useEffect(() => {
    checkAdmin()
    fetchRecentData()

    // --- AUTO-REFRESH LOGIC (Every 30 Seconds) ---
    // This allows the VIP counter to see new pre-registrations instantly
    const interval = setInterval(() => {
      if (isLive && !searchTerm) {
        fetchRecentData()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isLive, searchTerm])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    // Restricting access to Super Admin
    if (!user || user.email !== 'maulikshah.13@gmail.com') {
      router.push('/login')
    }
  }

  // Fetches the latest 8 registrations for the "Live Feed"
  const fetchRecentData = async () => {
    const { data: recentVisitors } = await supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8)

    if (recentVisitors) {
      setResults(prev => ({ ...prev, visitors: recentVisitors }))
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      fetchRecentData()
      return
    }
    setLoading(true)

    // Cross-table search for Name, Phone, or Email
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

  const printBadge = (id: string, type: string) => {
    // Opens the specialized printing template in a new tab
    window.open(`/badge/print?id=${id}&type=${type}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-600">
          <div>
            <h1 className="text-2xl font-black uppercase text-blue-900 italic tracking-tight">Registration Desk</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 {isLive ? 'Live Sync Active' : 'Auto-Refresh Paused'}
               </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsLive(!isLive)} className="text-[9px] font-black uppercase rounded-xl border-2">
               {isLive ? 'Pause' : 'Resume'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold border-2 text-[10px] uppercase rounded-xl px-4">← Back</Button>
          </div>
        </div>

        {/* UNIFIED SEARCH BAR */}
        <Card className="border-0 shadow-lg rounded-[1.5rem] overflow-hidden">
          <CardContent className="p-6 bg-[#0b3d41]">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <Input 
                placeholder="Search Visitor Phone or Exhibitor Email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 bg-white/10 border-0 text-white placeholder:text-white/40 font-bold px-6 rounded-xl focus-visible:ring-0"
              />
              <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 h-14 px-10 rounded-xl font-black uppercase text-[10px] text-white">
                {loading ? 'Searching...' : 'Find User'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* LIVE RESULTS FEED */}
        <div className="space-y-4">
          {!searchTerm && (
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Recent Registrations</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Updates every 30s</p>
            </div>
          )}
          
          {/* Display Visitors with VIP Logic */}
          {results.visitors.map(v => (
            <ResultCard 
              key={v.id} 
              name={v.full_name} 
              info={v.company_name} 
              subInfo={v.phone} 
              type="visitor" 
              isVip={v.is_vip} // Specifically highlights VIP Pre-registrations
              onPrint={() => printBadge(v.id, 'visitor')} 
            />
          ))}

          {results.exhibitors.map(e => (
            <ResultCard 
              key={e.id} 
              name={e.full_name} 
              info={e.company_name} 
              subInfo={`Stall: ${e.stall_number}`} 
              type="exhibitor" 
              onPrint={() => printBadge(e.id, 'exhibitor')} 
            />
          ))}

          {results.staff.map(s => (
            <ResultCard 
              key={s.id} 
              name={s.full_name} 
              info={s.company_name} 
              subInfo="Management Team" 
              type="staff" 
              onPrint={() => printBadge(s.id, 'staff')} 
            />
          ))}

          {searchTerm && !loading && results.visitors.length === 0 && results.exhibitors.length === 0 && results.staff.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
               <p className="text-slate-400 font-bold uppercase text-xs tracking-widest italic">No matching records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Sub-component for individual search result rows
function ResultCard({ name, info, subInfo, type, isVip, onPrint }: any) {
  const colors: any = { visitor: 'bg-orange-500', exhibitor: 'bg-[#0b3d41]', staff: 'bg-blue-600' }
  
  return (
    <Card className={`border-0 shadow-sm overflow-hidden rounded-2xl bg-white hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 ${isVip ? 'border-l-8 border-teal-500 ring-2 ring-teal-500/10' : ''}`}>
      <div className="flex items-center p-4 gap-4">
        <div className={`w-12 h-12 ${isVip ? 'bg-teal-600' : colors[type]} rounded-xl flex items-center justify-center text-white text-xl shadow-inner`}>
          {isVip ? '🌟' : (type === 'visitor' ? '👤' : type === 'exhibitor' ? '🎪' : '🛡️')}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-black uppercase text-slate-900 tracking-tight leading-none">{name}</h4>
            {isVip && <Badge className="bg-teal-600 text-[7px] h-4 font-black uppercase tracking-widest">VIP PASS</Badge>}
            <Badge className={`${colors[type]} text-[7px] h-4 font-black uppercase tracking-widest`}>{type.toUpperCase()}</Badge>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 italic tracking-tight">{info} • {subInfo}</p>
        </div>
        <Button 
          onClick={onPrint} 
          className={`${isVip ? 'bg-teal-600' : 'bg-slate-900'} hover:opacity-90 text-white font-black text-[9px] uppercase px-6 h-10 rounded-xl shadow-lg transition-transform active:scale-95`}
        >
          {isVip ? 'Print VIP Badge ⎙' : 'Print Pass ⎙'}
        </Button>
      </div>
    </Card>
  )
}

// WRAP IN SUSPENSE TO FIX VERCEL PRERENDER ERRORS
export default function RegistrationDeskPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400 font-bold uppercase text-[10px] tracking-widest italic animate-pulse">Syncing Registration Feed...</div>}>
      <DeskContent />
    </Suspense>
  )
}