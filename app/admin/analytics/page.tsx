'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient' // This fixes "Cannot find name 'supabase'"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

export default function ScanAnalytics() {
  const router = useRouter()
  
  // These state declarations allow the functions below to find the names
  const [loading, setLoading] = useState(true)
  const [hourlyData, setHourlyData] = useState<any[]>([])
  const [topExhibitors, setTopExhibitors] = useState<any[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  // This function is now inside the component to access state setters
  const fetchAnalytics = async () => {
    setLoading(true)
    
    // Fetch leads and join with exhibitors
    const { data, error } = await supabase
      .from('leads')
      .select('created_at, exhibitors(company_name, stall_number)')

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    // Use 'as any[]' to prevent property errors on the joined data
    const leads = data as any[]

    // 1. Process Busiest Hours
    const hourMap: Record<number, number> = {}
    leads.forEach(lead => {
      const hour = new Date(lead.created_at).getHours()
      hourMap[hour] = (hourMap[hour] || 0) + 1
    })
    
    const fullHourly = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      count: hourMap[i] || 0
    })).filter(h => h.count > 0 || (parseInt(h.hour) >= 9 && parseInt(h.hour) <= 18))

    // 2. Process Top Performing Exhibitors
    const exhibitorMap: Record<string, { name: string; stall: string; count: number }> = {}
    leads.forEach(lead => {
      const name = lead.exhibitors?.company_name || 'Unknown'
      const stall = lead.exhibitors?.stall_number || 'N/A'
      
      if (!exhibitorMap[name]) {
        exhibitorMap[name] = { name, stall, count: 0 }
      }
      exhibitorMap[name].count++
    })

    const topList = Object.values(exhibitorMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Updating the state
    setHourlyData(fullHourly)
    setTopExhibitors(topList)
    setLoading(false)
  }

  if (loading) return <div className="p-20 text-center font-black uppercase text-slate-400">Analyzing Expo Trends...</div>

  const maxScans = Math.max(...hourlyData.map(h => h.count), 1)

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase text-[#0b3d41] tracking-tighter italic">Scan Analytics 📈</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">GGE 2026 Traffic Insights</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold text-xs uppercase rounded-xl">Back to Control</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* HOURLY TRAFFIC CHART */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase text-slate-500">Traffic by Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hourlyData.map((data, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 w-10">{data.hour}</span>
                    <div className="flex-1 bg-slate-100 h-6 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#ef6c33] h-full transition-all duration-1000" 
                        style={{ width: `${(data.count / maxScans) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-black text-[#0b3d41] w-8 text-right">{data.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* TOP PERFORMERS */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase text-slate-500">Top Exhibitors</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {topExhibitors.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black text-slate-200">#{i + 1}</span>
                      <div>
                        <p className="font-black text-[#0b3d41] uppercase text-xs">{ex.name}</p>
                        <p className="text-[9px] font-bold text-blue-600 uppercase">Stall: {ex.stall}</p>
                      </div>
                    </div>
                    <div className="bg-orange-50 text-[#ef6c33] px-3 py-1 rounded-full font-black text-[11px]">
                      {ex.count} Scans
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}