'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  
  // High-level stats for the dashboard
  const [stats, setStats] = useState({ stalls: 0, visitors: 0 })

  useEffect(() => {
    const initAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Security Check: Only Maulik Shah can access this hub
      if (!user || user.email !== 'maulikshah.13@gmail.com') {
        router.push('/login')
        return
      }
      
      // Fetch quick overview stats (fails safely if tables are empty)
      const { count: stallCount } = await supabase.from('stalls').select('*', { count: 'exact', head: true })
      const { count: visitorCount } = await supabase.from('visitors').select('*', { count: 'exact', head: true })
      
      setStats({ 
        stalls: stallCount || 0, 
        visitors: visitorCount || 0 
      })
      
      setLoading(false)
    }
    initAdmin()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-400 uppercase tracking-widest text-[10px]">Authorizing Command Center...</div>

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2rem] shadow-sm border-b-4 border-[#0b3d41] gap-6">
          <div className="flex items-center gap-6">
            <img src="/event-logo.png" alt="GGE 2026" className="h-16 object-contain hidden sm:block" />
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase text-[#0b3d41] italic tracking-tighter leading-none">Super Admin Hub</h1>
              <p className="text-[10px] md:text-xs font-bold text-[#ef6c33] uppercase tracking-[0.2em] mt-2">Guj Gift Expo 2026 • Master Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black uppercase text-slate-400">System Admin</p>
              <p className="text-xs font-bold text-slate-800">maulikshah.13@gmail.com</p>
            </div>
            <Button onClick={handleLogout} variant="destructive" className="font-black uppercase tracking-widest text-[10px] rounded-xl px-6 h-12 w-full md:w-auto shadow-lg">
              Secure Logout
            </Button>
          </div>
        </div>

        {/* QUICK STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md rounded-[1.5rem] bg-white">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl mb-2">🎪</span>
              <p className="text-3xl font-black text-[#0b3d41]">{stats.stalls}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stalls Booked</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-[1.5rem] bg-white">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl mb-2">👥</span>
              <p className="text-3xl font-black text-teal-600">{stats.visitors}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pre-Registrations</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-[1.5rem] bg-[#ef6c33] text-white">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl mb-2 opacity-80">🗺️</span>
              <p className="text-xl font-black uppercase italic mt-1 leading-tight">Live<br/>Map</p>
              <Button onClick={() => router.push('/floor-plan')} variant="secondary" size="sm" className="mt-3 text-[9px] font-black uppercase rounded-full px-6 text-[#ef6c33]">View</Button>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-[1.5rem] bg-slate-900 text-white">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl mb-2 opacity-80">📊</span>
              <p className="text-xl font-black uppercase italic mt-1 leading-tight">Event<br/>Reports</p>
              <Button onClick={() => router.push('/admin/analytics')} variant="secondary" size="sm" className="mt-3 text-[9px] font-black uppercase rounded-full px-6 text-slate-900">View</Button>
            </CardContent>
          </Card>
        </div>

        {/* MAIN DEPARTMENT GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          
          {/* EXHIBITOR MANAGEMENT (Built) */}
          <Card onClick={() => router.push('/admin/stalls')} className="cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all rounded-[2rem] bg-white overflow-hidden group">
            <div className="h-2 bg-teal-600 w-full"></div>
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🏢</div>
              <h2 className="text-xl font-black uppercase text-[#0b3d41] mb-2">Exhibitor Dept.</h2>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Manage stall registry, allocate space tiers (Diamond, Gold, Silver), track payments, and set badge quotas.</p>
            </CardContent>
          </Card>

          {/* VISITOR MANAGEMENT */}
          <Card onClick={() => router.push('/admin/visitors')} className="cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all rounded-[2rem] bg-white overflow-hidden group">
            <div className="h-2 bg-blue-500 w-full"></div>
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🎟️</div>
              <h2 className="text-xl font-black uppercase text-[#0b3d41] mb-2">Visitor Dept.</h2>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">View all pre-registered visitors, edit profiles, block unauthorized access, and export master data.</p>
            </CardContent>
          </Card>

          {/* REGISTRATION DESK */}
          <Card onClick={() => router.push('/admin/registration-desk')} className="cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all rounded-[2rem] bg-white overflow-hidden group">
            <div className="h-2 bg-purple-500 w-full"></div>
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🖨️</div>
              <h2 className="text-xl font-black uppercase text-[#0b3d41] mb-2">Reg Desk (G1)</h2>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">On-site tool for the G1 Entrance. Quickly search visitors by phone, verify details, and print 4x6 entry badges.</p>
            </CardContent>
          </Card>

          {/* STAFF MANAGEMENT */}
          <Card onClick={() => router.push('/admin/staff')} className="cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all rounded-[2rem] bg-white overflow-hidden group">
            <div className="h-2 bg-amber-500 w-full"></div>
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">👷</div>
              <h2 className="text-xl font-black uppercase text-[#0b3d41] mb-2">Staff Dept.</h2>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Register event volunteers, assign specific roles (e.g., Gate Keeper, Help Desk), and generate Staff Badges.</p>
            </CardContent>
          </Card>

          {/* SECURITY MANAGEMENT */}
          <Card onClick={() => router.push('/admin/security')} className="cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all rounded-[2rem] bg-white overflow-hidden group">
            <div className="h-2 bg-red-600 w-full"></div>
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🛡️</div>
              <h2 className="text-xl font-black uppercase text-[#0b3d41] mb-2">Security Dept.</h2>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Manage VIP Lounge access, track real-time gate entry scans, and review security incident logs.</p>
            </CardContent>
          </Card>

          {/* COMMUNICATIONS & BROADCAST */}
          <Card onClick={() => router.push('/admin/broadcast')} className="cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all rounded-[2rem] bg-white overflow-hidden group">
            <div className="h-2 bg-indigo-500 w-full"></div>
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">📢</div>
              <h2 className="text-xl font-black uppercase text-[#0b3d41] mb-2">Broadcast Center</h2>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Send mass announcements, schedule WhatsApp alerts, and push live updates to the Exhibitor Dashboards.</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}