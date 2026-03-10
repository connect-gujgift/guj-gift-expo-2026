'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function AdminHubPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState('Admin')

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const allowedEmails = ['maulikshah.13@gmail.com', 'connect@shreebalajievent.com']
    
    if (!user || !allowedEmails.includes(user.email || '')) {
      router.push('/login')
    } else {
      // Personalize the greeting based on the login email
      setAdminName(user.email === 'maulikshah.13@gmail.com' ? 'Maulik' : 'Balaji Team')
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const adminModules = [
    { 
      title: 'Visitor Database', icon: '👥', link: '/admin/visitors', color: 'bg-orange-500', 
      desc: 'View registered attendees, manage leads, and export to CSV.' 
    },
    { 
      title: 'Exhibitor Dept.', icon: '🎪', link: '/admin/stalls', color: 'bg-teal-600', 
      desc: 'Manage stall assignments, tiers, and payment statuses.' 
    },
    { 
      title: 'Security Scanner', icon: '📷', link: '/admin/scanner', color: 'bg-slate-900', 
      desc: 'Mobile-first QR terminal for Gate Entry verification.' 
    },
    { 
      title: 'Staff Dept.', icon: '👷', link: '/admin/staff', color: 'bg-amber-500', 
      desc: 'Monitor registered internal personnel and vendor teams.' 
    },
    { 
      title: 'Live Floor Plan', icon: '🗺️', link: '/floor-plan', color: 'bg-indigo-600', 
      desc: 'Interactive 4-tier visual map of the GMDC ground.' 
    },
    { 
      title: 'Scan Analytics', icon: '📈', link: '/admin/analytics', color: 'bg-blue-600', 
      desc: 'Real-time charts showing traffic trends and tier ratios.' 
    },
    { 
      title: 'Broadcast Center', icon: '📢', link: '/admin/broadcast', color: 'bg-purple-600', 
      desc: 'Push live announcements to specific user groups.' 
    }
  ]

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-[#0b3d41] uppercase tracking-widest text-[10px] animate-pulse">Initializing Hub...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-20 selection:bg-[#0b3d41] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HUB HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] shadow-sm border-b-4 border-[#0b3d41] gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase text-[#0b3d41] tracking-tighter italic leading-none">
              Super Admin Hub
            </h1>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
              Welcome back, {adminName} • Guj Gift Expo 2026
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <Button variant="outline" onClick={() => router.push('/')} className="font-bold border-2 border-slate-200 text-slate-600 text-[10px] uppercase rounded-xl h-12 px-6 flex-1 md:flex-none">
               View Live Site
             </Button>
             <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl h-12 px-6 shadow-md transition-all flex-1 md:flex-none">
               Secure Logout
             </Button>
          </div>
        </div>

        {/* SYSTEM STATUS BANNER */}
        <div className="bg-[#0b3d41] rounded-2xl p-4 flex items-center justify-between text-white shadow-lg overflow-hidden relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
           <div className="flex items-center gap-3 relative z-10">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">All Core Systems Operational</span>
           </div>
           <span className="text-[9px] font-bold tracking-widest opacity-60 relative z-10 hidden md:block">Lead Management System V2.1</span>
        </div>

        {/* MODULES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((mod, idx) => (
            <Card 
              key={idx} 
              onClick={() => router.push(mod.link)}
              className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-[2rem] overflow-hidden bg-white cursor-pointer group"
            >
              <div className={`h-2 w-full ${mod.color}`}></div>
              <CardHeader className="p-6 pb-2 flex flex-row items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${mod.color} text-white group-hover:scale-110 transition-transform`}>
                  {mod.icon}
                </div>
                <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-900 group-hover:text-[#0b3d41] transition-colors">
                  {mod.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  {mod.desc}
                </p>
                <div className="mt-4 flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-orange-500 transition-colors">
                  Access Module <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  )
}