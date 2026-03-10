'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function ExhibitorDirectory() {
  const [exhibitors, setExhibitors] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExhibitors = async () => {
      const { data, error } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('is_staff', false) // Hide staff members from the public directory
        .order('company_name', { ascending: true })
      
      if (!error && data) setExhibitors(data)
      setLoading(false)
    }
    fetchExhibitors()
  }, [])

  const filteredExhibitors = exhibitors.filter(ex => 
    (ex.company_name && ex.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (ex.category && ex.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (ex.stall_number && ex.stall_number.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-[#0b3d41] uppercase tracking-widest text-[10px] animate-pulse">Loading Directory...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* DIRECTORY HEADER */}
        <div className="text-center py-10 bg-white rounded-[3rem] shadow-sm border-b-4 border-orange-500 px-6">
          <h1 className="text-4xl md:text-5xl font-black uppercase italic text-[#0b3d41] tracking-tighter mb-2">
            Exhibitor Directory
          </h1>
          <p className="text-[10px] md:text-xs font-bold uppercase text-slate-400 tracking-[0.3em] mb-8">
            Guj Gift Expo 2026 • Find Your Next Partner
          </p>

          {/* SEARCH BAR */}
          <div className="max-w-2xl mx-auto relative">
            <Input 
              placeholder="Search by company, category, or stall number..." 
              className="h-16 rounded-2xl border-2 shadow-lg px-8 font-bold text-sm bg-slate-50 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-all text-center"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-6 top-5 text-xl opacity-50">🔍</div>
          </div>
        </div>

        {/* RESULTS GRID */}
        {filteredExhibitors.length === 0 && !loading ? (
          <div className="text-center p-20 text-slate-400 font-black uppercase tracking-widest text-xs">
            No exhibitors found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExhibitors.map((ex) => (
              <Card key={ex.id} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-[2rem] bg-white overflow-hidden group cursor-pointer">
                <div className={`h-2 w-full ${
                    ex.stall_tier === 'Platinum' ? 'bg-indigo-600' :
                    ex.stall_tier === 'Diamond' ? 'bg-purple-600' :
                    ex.stall_tier === 'Gold' ? 'bg-amber-500' : 'bg-[#0b3d41]'
                  }`}></div>
                <CardHeader className="pb-4 pt-6 px-6">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl font-black uppercase tracking-tight text-[#0b3d41] group-hover:text-orange-600 transition-colors leading-tight">
                      {ex.company_name}
                    </CardTitle>
                    <div className="bg-slate-100 border-2 border-slate-200 text-slate-700 text-[10px] px-3 py-2 rounded-xl font-black uppercase tracking-widest flex-shrink-0 shadow-sm">
                      {ex.stall_number || 'TBA'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                  <div>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-slate-200">
                      {ex.category || 'General Gifting'}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-500 line-clamp-3 leading-relaxed">
                    {ex.description || 'Premium corporate gifting supplier exhibiting at Guj Gift Expo 2026.'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}