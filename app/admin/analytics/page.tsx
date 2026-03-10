'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  
  const [tierData, setTierData] = useState<any[]>([])
  const [trafficData, setTrafficData] = useState<any[]>([])

  useEffect(() => {
    checkAdmin()
    fetchAnalytics()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'maulikshah.13@gmail.com') {
      router.push('/login')
    } else {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    // 1. Fetch Exhibitor Tiers for the Bar Chart
    const { data: exhibitors } = await supabase.from('exhibitors').select('stall_tier').eq('is_staff', false)
    
    let diamond = 0, gold = 0, silver = 0;
    if (exhibitors) {
      exhibitors.forEach(e => {
        if (e.stall_tier === 'Diamond') diamond++
        else if (e.stall_tier === 'Gold') gold++
        else silver++
      })
    }
    
    setTierData([
      { name: 'DIAMOND', count: diamond, fill: '#06b6d4' }, 
      { name: 'GOLD', count: gold, fill: '#fbbf24' },    
      { name: 'SILVER', count: silver, fill: '#94a3b8' }  
    ])

    // 2. Fetch Visitor Registration Trends
    const { data: visitors } = await supabase.from('visitors').select('created_at')
    
    if (visitors && visitors.length > 0) {
      const dates = visitors.reduce((acc: any, visitor) => {
        const date = new Date(visitor.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})

      const formattedTraffic = Object.keys(dates).map(date => ({
        time: date,
        visitors: dates[date]
      }))
      setTrafficData(formattedTraffic)
    } else {
      // Fallback dummy data if no visitors exist yet
      setTrafficData([
        { time: 'Aug 10', visitors: 12 },
        { time: 'Aug 11', visitors: 45 },
        { time: 'Aug 12', visitors: 120 },
        { time: 'Aug 13', visitors: 310 }
      ])
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-[#0b3d41] uppercase tracking-widest text-[10px] animate-pulse">Compiling Data...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-[2rem] shadow-sm border-b-4 border-orange-500 gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase text-[#0b3d41] tracking-tighter italic leading-none flex items-center gap-3">
              Scan Analytics 📈
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">
              GGE 2026 Traffic Insights
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold border-2 text-[10px] uppercase rounded-xl px-6 h-10 w-full md:w-auto">
            ← Back to Control
          </Button>
        </div>

        {/* CHARTS GRID */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* TRAFFIC TREND CHART */}
          <Card className="border-0 shadow-lg rounded-[2rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-orange-500">
                Visitor Registration Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    labelStyle={{ fontWeight: 'black', color: '#0b3d41', textTransform: 'uppercase' }}
                  />
                  <Line type="monotone" dataKey="visitors" stroke="#ef6c33" strokeWidth={4} dot={{ r: 6, fill: '#ef6c33', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* EXHIBITOR TIER CHART */}
          <Card className="border-0 shadow-lg rounded-[2rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-teal-400">
                Exhibitor Tiers (Live)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierData} margin={{ top: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} dy={10} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}