'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"

export default function SuperAdminHub() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState('')
  const [stats, setStats] = useState({ visitors: 0, exhibitors: 0, staff: 0, connections: 0 })

  const allowedAdmins = ['maulikshah.13@gmail.com', 'connect@shreebalajievent.com']

  useEffect(() => {
    const initAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !user.email || !allowedAdmins.includes(user.email)) {
        await supabase.auth.signOut()
        router.push('/login')
        return
      }
      setAdminEmail(user.email)
      await fetchStats()
      setLoading(false)
    }
    initAdmin()
  }, [router])

  const fetchStats = async () => {
    const { count: visitorCount } = await supabase.from('visitors').select('*', { count: 'exact', head: true })
    const { count: exhibitorCount } = await supabase.from('exhibitors').select('*', { count: 'exact', head: true }).neq('is_staff', true)
    const { count: staffCount } = await supabase.from('exhibitors').select('*', { count: 'exact', head: true }).eq('is_staff', true)
    const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true })
    const { count: visitorScansCount } = await supabase.from('visitor_scans').select('*', { count: 'exact', head: true })

    setStats({
      visitors: visitorCount || 0,
      exhibitors: exhibitorCount || 0,
      staff: staffCount || 0,
      connections: (leadsCount || 0) + (visitorScansCount || 0)
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const exportMasterVisitorList = async () => {
    const { data: visitors } = await supabase.from('visitors').select('*').order('created_at', { ascending: false })
    if (!visitors || visitors.length === 0) return alert("No visitors registered yet.")

    const headers = ["Registration Date", "Full Name", "Company", "Designation", "Phone", "Email", "City", "Business Type"]
    const rows = visitors.map(v => [
      new Date(v.created_at).toLocaleDateString(),
      `"${v.full_name || ''}"`,
      `"${v.company_name || ''}"`,
      `"${v.designation || ''}"`,
      `"${v.phone || ''}"`,
      `"${v.email || ''}"`,
      `"${v.city || ''}"`,
      `"${v.business_type || ''}"`
    ])

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `GGE2026_Master_Visitor_List.csv`
    link.click()
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-[#0b3d41] uppercase tracking-widest text-[10px] animate-pulse">Verifying Admin Access...</div>

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP HEADER */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase text-slate-900 tracking-tighter italic leading-none">
              Super Admin Hub
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
              Welcome Back, {adminEmail.split('@')[0]} • Guj Gift Expo 2026
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => window.open('/', '_blank')} variant="outline" className="text-[10px] font-black uppercase tracking-widest rounded-xl h-10 border-slate-200">
              View Live Site
            </Button>
            <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl px-6 h-10 shadow-md transition-all">
              Secure Logout
            </Button>
          </div>
        </div>

        {/* STATUS BAR */}
        <div className="bg-[#0b3d41] rounded-2xl p-4 flex justify-between items-center text-white shadow-md">
          <div className="flex items-center gap-2">
             <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">All Core Systems Operational</span>
          </div>
          <span className="text-[10px] font-bold text-teal-200 uppercase tracking-widest">Lead Management System V2.1</span>
        </div>

        {/* LIVE STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox title="Registered Visitors" count={stats.visitors} color="text-orange-500" />
          <StatBox title="Exhibiting Companies" count={stats.exhibitors} color="text-teal-600" />
          <StatBox title="Staff Badges" count={stats.staff} color="text-amber-500" />
          <StatBox title="B2B Connections" count={stats.connections} color="text-emerald-500" />
        </div>

        {/* MODULAR GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          
          <ModuleCard 
            title="Visitor Database" 
            desc="View registered attendees, manage leads, and export to CSV." 
            icon="👥" borderColor="border-orange-500" 
            action={exportMasterVisitorList} actionText="DOWNLOAD MASTER CSV →" 
          />
          
          <ModuleCard 
            title="Exhibitor Dept." 
            desc="Manage stall assignments, tiers, and payment statuses." 
            icon="🏢" borderColor="border-teal-500" 
            action={() => alert("Exhibitor management module coming soon!")} 
          />
          
          <ModuleCard 
            title="Registration Desk" 
            desc="Rapid iPad interface to register walk-in attendees at the door." 
            icon="📝" borderColor="border-emerald-500" 
            action={() => window.open('/desk', '_blank')} 
          />
          
          <ModuleCard 
            title="Security Scanner" 
            desc="Mobile-first QR terminal for Gate Entry verification." 
            icon="📸" borderColor="border-slate-800" 
            action={() => alert("Gate Scanner module coming next!")} 
          />
          
          <ModuleCard 
            title="Staff Dept." 
            desc="Monitor registered internal personnel and vendor teams." 
            icon="👷" borderColor="border-amber-500" 
            action={() => alert("Staff module coming soon!")} 
          />
          
          <ModuleCard 
            title="Live Floor Plan" 
            desc="Interactive 4-tier visual map of the GMDC ground." 
            icon="🗺️" borderColor="border-purple-500" 
            action={() => router.push('/floor-plan')} 
          />
          
          <ModuleCard 
            title="Scan Analytics" 
            desc="Real-time charts showing traffic trends and tier ratios." 
            icon="📈" borderColor="border-blue-500" 
            action={() => fetchStats()} actionText="REFRESH LIVE DATA →" 
          />
          
          <ModuleCard 
            title="Broadcast Center" 
            desc="Push live announcements to specific user groups." 
            icon="📢" borderColor="border-pink-500" 
            action={() => alert("Broadcast module coming soon!")} 
          />

        </div>

      </div>
    </div>
  )
}

function StatBox({ title, count, color }: { title: string, count: number, color: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
      <span className={`text-3xl font-black tracking-tighter ${color}`}>{count}</span>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{title}</span>
    </div>
  )
}

function ModuleCard({ title, desc, icon, borderColor, action, actionText = "ACCESS MODULE →" }: any) {
  return (
    <div className={`bg-white rounded-[2rem] p-6 shadow-sm border-t-4 ${borderColor} hover:shadow-xl transition-all flex flex-col h-full`}>
      <div className="text-3xl mb-4 bg-slate-50 w-14 h-14 flex items-center justify-center rounded-2xl">{icon}</div>
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-2">{title}</h3>
      <p className="text-xs font-medium text-slate-500 leading-relaxed flex-1 mb-6">{desc}</p>
      <button onClick={action} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 text-left transition-colors">
        {actionText}
      </button>
    </div>
  )
}