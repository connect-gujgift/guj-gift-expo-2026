'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function StallDirectory() {
  const router = useRouter()
  const [exhibitors, setExhibitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchExhibitors()
  }, [])

  const fetchExhibitors = async () => {
    const { data, error } = await supabase
      .from('exhibitors')
      .select('company_name, stall_number, category')
      .order('stall_number', { ascending: true })
    
    if (error) console.error("Error fetching directory:", error.message)
    else setExhibitors(data || [])
    setLoading(false)
  }

  const filteredExhibitors = exhibitors.filter(ex => 
    ex.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.stall_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <div className="p-12 text-center font-black uppercase text-slate-400">Loading Directory...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 font-sans text-slate-900">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6 pt-2">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Stall Directory</h1>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Guj Gift Expo 2026</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()} className="font-black border-2 text-xs">BACK</Button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder="Search Company, Stall, or Category..."
          className="w-full p-4 pl-12 bg-white shadow-md rounded-2xl text-sm outline-none border-0 focus:ring-2 focus:ring-blue-400 font-medium" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-xl">🔍</span>
      </div>

      {/* DIRECTORY LIST */}
      <div className="space-y-3">
        {filteredExhibitors.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase text-xs">No stalls found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredExhibitors.map((ex, index) => (
            <Card key={index} className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden border-l-8 border-l-blue-600">
              <CardContent className="p-5 flex justify-between items-center">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-black text-slate-800 uppercase text-base truncate leading-tight mb-1">
                    {ex.company_name}
                  </h3>
                  <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-1 rounded-md uppercase">
                    {ex.category || 'General'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Stall No.</p>
                  <p className="text-xl font-black text-blue-600 tracking-tighter">{ex.stall_number}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <p className="text-center mt-10 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
        Total Exhibitors: {filteredExhibitors.length}
      </p>
    </div>
  )
}