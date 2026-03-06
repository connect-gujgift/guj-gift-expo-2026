'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'

function FloorPlanContent() {
  const router = useRouter()
  const [occupancy, setOccupancy] = useState<Record<string, any>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOccupancy() {
      const { data } = await supabase.from('stalls').select('*')
      if (data) {
        const mapping: Record<string, any> = {}
        data.forEach(exhibitor => {
          // Supporting the new array-based stall numbers [cite: 2026-03-06]
          const stalls = Array.isArray(exhibitor.stall_number) 
            ? exhibitor.stall_number 
            : [exhibitor.stall_number]
            
          stalls.forEach((num: string) => {
            mapping[num.toUpperCase()] = exhibitor
          })
        })
        setOccupancy(mapping)
      }
      setLoading(false)
    }
    fetchOccupancy()
  }, [])

  // Logic to highlight stalls based on search [cite: 2026-03-06]
  const getStallStyle = (stallId: string) => {
    const data = occupancy[stallId]
    if (!data) return 'bg-white border-slate-100 text-slate-200'
    
    const isMatch = searchQuery && (
      data.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stallId.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Highlight search matches with a glowing orange border
    const highlightClass = isMatch ? 'ring-4 ring-[#ef6c33] z-10 scale-105 shadow-xl' : ''

    switch(data.stall_type) {
      case 'Diamond': return `${highlightClass} bg-purple-600 border-purple-800 text-white`
      case 'Gold': return `${highlightClass} bg-amber-500 border-amber-700 text-white`
      default: return `${highlightClass} bg-[#0b3d41] border-[#082a2d] text-white` // Silver
    }
  }

  const renderStallBlock = (start: number, end: number) => {
    const stalls = []
    for (let i = start; i <= end; i++) {
      const id = `T-${i}`
      const info = occupancy[id]
      stalls.push(
        <div key={id} className={`h-16 border-2 rounded-xl flex flex-col items-center justify-center p-1 transition-all duration-300 ${getStallStyle(id)}`}>
          <span className="text-[9px] font-black">{id}</span>
          {info && <span className="text-[6px] font-bold uppercase truncate w-full text-center px-1">{info.company_name}</span>}
        </div>
      )
    }
    return stalls
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase text-[10px] bg-slate-50">Generating Map...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="text-center py-8 bg-white rounded-[2.5rem] shadow-sm border-b-4 border-[#0b3d41]">
          <img src="/event-logo.png" className="h-12 mx-auto mb-3" alt="GGE 2026" />
          <h1 className="text-3xl font-black uppercase italic text-[#0b3d41] tracking-tighter">Live Floor Plan</h1>
          <p className="text-[10px] font-bold uppercase text-[#ef6c33] tracking-[0.3em] mt-1">Guj Gift Expo 2026 • GMDC Ground</p>
        </div>

        {/* SEARCH BAR [cite: 2026-03-06] */}
        <div className="relative max-w-md mx-auto">
          <Input 
            placeholder="Search Company or Stall Number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 rounded-2xl border-0 shadow-lg px-6 font-bold text-sm bg-white focus:ring-2 focus:ring-[#ef6c33]"
          />
          <div className="absolute right-5 top-4 opacity-30 text-xl">🔍</div>
        </div>

        {/* LEGEND */}
        <div className="flex flex-wrap justify-center gap-6 text-[9px] font-black uppercase tracking-widest py-2">
          <div className="flex items-center gap-2"><span className="w-4 h-4 bg-[#0b3d41] rounded"></span> Silver</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 bg-amber-500 rounded"></span> Gold</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 bg-purple-600 rounded"></span> Diamond</div>
        </div>

        {/* MAP CONTENT: Based on finalized PDF blocks */}
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl overflow-x-auto border-2 border-slate-100">
           <div className="min-w-[1000px] space-y-12">
              
              {/* TOP PERIPHERAL & VIP */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Outer Block & VIP</h3>
                <div className="grid grid-cols-12 gap-2">
                  {renderStallBlock(1, 20)}
                  <div className="col-span-4 h-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                    <span className="text-[10px] font-black uppercase text-slate-300">VIP LOUNGE</span>
                  </div>
                </div>
              </div>

              {/* CENTRAL CLUSTER */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Central Exhibition Hall</h3>
                <div className="grid grid-cols-12 gap-2">
                  {renderStallBlock(88, 120)}
                </div>
              </div>

              {/* ENTRANCE */}
              <div className="flex justify-center pt-8">
                 <div className="bg-green-50 text-green-600 px-12 py-4 rounded-3xl border-4 border-green-100 font-black uppercase italic tracking-tighter text-xl">
                   ↑ MAIN ENTRANCE G1
                 </div>
              </div>

           </div>
        </div>

        <Button 
          onClick={() => router.push('/dashboard')}
          className="w-full h-16 bg-[#0b3d41] text-white font-black uppercase tracking-widest rounded-[1.5rem] shadow-xl hover:bg-black transition-all"
        >
          Back to Dashboard
        </Button>

      </div>
    </div>
  )
}

export default function InteractiveFloorPlan() {
  return (
    <Suspense fallback={<div>Loading Map...</div>}>
      <FloorPlanContent />
    </Suspense>
  )
}