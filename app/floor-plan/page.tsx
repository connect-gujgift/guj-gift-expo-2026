'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
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
          const stalls = Array.isArray(exhibitor.stall_number) ? exhibitor.stall_number : [exhibitor.stall_number]
          stalls.forEach((num: string) => { mapping[num.toUpperCase()] = exhibitor })
        })
        setOccupancy(mapping)
      }
      setLoading(false)
    }
    fetchOccupancy()
  }, [])

  const getStallStyle = (stallId: string) => {
    const data = occupancy[stallId]
    const isMatch = searchQuery && data && (
      data.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stallId.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    const highlight = isMatch ? 'ring-4 ring-[#ef6c33] z-10 scale-110 shadow-2xl transition-all' : 'transition-all'

    if (!data) return `${highlight} bg-white border-slate-200 text-slate-400 hover:bg-slate-50`
    
    // NEW 4-TIER COLOR MAPPING
    switch(data.stall_type) {
      case 'Platinum': return `${highlight} bg-indigo-600 border-indigo-800 text-white shadow-lg`
      case 'Diamond': return `${highlight} bg-purple-600 border-purple-800 text-white shadow-md`
      case 'Gold': return `${highlight} bg-amber-500 border-amber-700 text-white`
      default: return `${highlight} bg-[#0b3d41] border-[#082a2d] text-white` // Silver
    }
  }

  // Generate arrays based on new numbering (no 'T-' prefix needed as numbers are raw now)
  const getStalls = (start: number, end: number, reverse = false) => {
    const arr = []
    for (let i = start; i <= end; i++) arr.push(i.toString())
    return reverse ? arr.reverse() : arr
  }
  const getCustomStalls = (prefix: string, start: number, end: number, reverse = false) => {
    const arr = []
    for (let i = start; i <= end; i++) arr.push(`${prefix}${i}`)
    return reverse ? arr.reverse() : arr
  }

  // Dynamic Stall Box that scales based on Tier Dimensions
  const StallBox = ({ id, type = 'Silver', customClass = '' }: { id: string, type?: 'Silver'|'Gold'|'Diamond'|'Platinum'|'Custom', customClass?: string }) => {
    const info = occupancy[id]
    
    // Base sizing reflecting relative area differences
    let sizeClass = 'w-12 h-12' // Silver 9sqm
    if (type === 'Gold') sizeClass = 'w-24 h-24' // Gold 36sqm
    if (type === 'Diamond') sizeClass = 'w-32 h-24' // Diamond 54sqm
    if (type === 'Platinum') sizeClass = 'w-40 h-24' // Platinum 72sqm
    if (customClass) sizeClass = customClass

    return (
      <div title={info ? `${id}: ${info.company_name}` : `${id}: Available`} className={`border rounded-md flex flex-col items-center justify-center p-1 cursor-pointer ${sizeClass} ${getStallStyle(id)}`}>
        <span className={`font-black ${type === 'Silver' ? 'text-[8px]' : 'text-sm'}`}>{id}</span>
        {info && <span className="text-[6px] font-bold uppercase truncate w-full text-center mt-0.5 px-0.5">{info.company_name}</span>}
      </div>
    )
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase text-[10px] bg-slate-50">Syncing New Layout...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* HEADER & NEW LEGEND */}
        <div className="text-center py-8 bg-white rounded-[2.5rem] shadow-sm border-b-4 border-[#0b3d41]">
          <h1 className="text-3xl font-black uppercase italic text-[#0b3d41] tracking-tighter">Live Floor Plan</h1>
          <p className="text-[10px] font-bold uppercase text-[#ef6c33] tracking-[0.3em] mt-1 mb-6">Guj Gift Expo 2026 • Updated Zones</p>
          
          <div className="relative max-w-md mx-auto px-4 mb-6">
            <Input placeholder="Search Exhibitor or Stall Number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-12 rounded-xl border-2 shadow-sm px-6 font-bold text-sm bg-slate-50 focus:ring-0 focus:border-[#ef6c33]" />
          </div>

          {/* NEW 4-TIER LEGEND */}
          <div className="flex flex-wrap justify-center gap-6 text-[9px] font-black uppercase tracking-widest py-2">
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-[#0b3d41] rounded"></span> Silver (9m²)</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-amber-500 rounded"></span> Gold (36m²)</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-purple-600 rounded"></span> Diamond (54m²)</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-indigo-600 rounded"></span> Platinum (72m²)</div>
          </div>
        </div>

        {/* REBUILT MAP CONTAINER */}
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl overflow-x-auto border-2 border-slate-100">
           <div className="min-w-[1200px] flex flex-col gap-10 p-4">
              
              {/* TOP ROW: P1, Entry, 1-19, Exit, P6 */}
              <div className="flex justify-between items-start gap-4 border-b-2 border-dashed border-slate-200 pb-8">
                <StallBox id="P1" type="Platinum" />
                <div className="bg-green-50 text-green-600 px-8 py-2 rounded-xl border-2 border-green-200 font-black uppercase tracking-widest text-sm self-center">ENTRY</div>
                <div className="flex flex-wrap gap-1.5 justify-center max-w-3xl">
                  {getStalls(1, 19).map(id => <StallBox key={id} id={id} />)}
                </div>
                <div className="bg-red-50 text-red-600 px-8 py-2 rounded-xl border-2 border-red-200 font-black uppercase tracking-widest text-sm self-center">EXIT</div>
                <StallBox id="P6" type="Platinum" />
              </div>

              {/* MAIN BODY GRID */}
              <div className="flex justify-between gap-8">
                
                {/* LEFT FLANK: Platinum Blocks & Silver */}
                <div className="flex flex-col gap-8">
                  <div className="flex gap-4 items-center">
                    <StallBox id="P2" type="Platinum" customClass="w-24 h-48" />
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5">{getStalls(20, 24, true).map(id => <StallBox key={id} id={id} />)}</div>
                      <div className="flex gap-1.5">{getStalls(25, 29).map(id => <StallBox key={id} id={id} />)}</div>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <StallBox id="P3" type="Platinum" customClass="w-24 h-48" />
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5">{getStalls(30, 34, true).map(id => <StallBox key={id} id={id} />)}</div>
                      <div className="flex gap-1.5">{getStalls(35, 39).map(id => <StallBox key={id} id={id} />)}</div>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <StallBox id="P4" type="Platinum" customClass="w-24 h-48" />
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5">{getStalls(40, 44, true).map(id => <StallBox key={id} id={id} />)}</div>
                      <div className="flex gap-1.5">{getStalls(45, 49).map(id => <StallBox key={id} id={id} />)}</div>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <StallBox id="P5" type="Platinum" customClass="w-24 h-48" />
                  </div>
                </div>

                {/* CENTRAL PREMIUM HUB: Gold & Diamond */}
                <div className="flex flex-col gap-10 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="grid grid-cols-2 gap-2">
                      {getCustomStalls('G', 1, 1).map(id => <StallBox key={id} id={id} type="Gold" />)}
                      {getCustomStalls('G', 6, 7).map(id => <StallBox key={id} id={id} type="Gold" />)}
                      {getCustomStalls('G', 12, 12).map(id => <StallBox key={id} id={id} type="Gold" />)}
                    </div>
                    <StallBox id="D1" type="Diamond" customClass="w-32 h-[200px]" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="grid grid-cols-2 gap-2">
                      {getCustomStalls('G', 2, 2).map(id => <StallBox key={id} id={id} type="Gold" />)}
                      {getCustomStalls('G', 5, 5).map(id => <StallBox key={id} id={id} type="Gold" />)}
                      {getCustomStalls('G', 8, 8).map(id => <StallBox key={id} id={id} type="Gold" />)}
                      {getCustomStalls('G', 11, 11).map(id => <StallBox key={id} id={id} type="Gold" />)}
                    </div>
                    <StallBox id="D2" type="Diamond" customClass="w-32 h-[200px]" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="grid grid-cols-2 gap-2">
                      {getCustomStalls('G', 3, 4).map(id => <StallBox key={id} id={id} type="Gold" />)}
                      {getCustomStalls('G', 9, 10).map(id => <StallBox key={id} id={id} type="Gold" />)}
                    </div>
                    <StallBox id="D3" type="Diamond" customClass="w-32 h-[200px]" />
                  </div>
                </div>

                {/* RIGHT FLANK: Silver */}
                <div className="flex flex-col gap-8 items-end">
                   <div className="flex gap-1.5">{getStalls(87, 90, true).map(id => <StallBox key={id} id={id} />)}</div>
                   <div className="flex gap-1.5">{getStalls(83, 86).map(id => <StallBox key={id} id={id} />)}</div>
                   <div className="flex gap-1.5">{getStalls(79, 82, true).map(id => <StallBox key={id} id={id} />)}</div>
                   <div className="flex gap-1.5">{getStalls(75, 78).map(id => <StallBox key={id} id={id} />)}</div>
                   <div className="flex gap-1.5">{getStalls(71, 74, true).map(id => <StallBox key={id} id={id} />)}</div>
                   <div className="flex gap-1.5">{getStalls(67, 70).map(id => <StallBox key={id} id={id} />)}</div>
                   <div className="flex flex-wrap gap-1.5 justify-end max-w-[200px]">{getStalls(59, 66, true).map(id => <StallBox key={id} id={id} />)}</div>
                </div>

              </div>

              {/* BOTTOM ROW: P7, Silver 50-58, VIP Lounge */}
              <div className="flex justify-between items-end border-t-2 border-dashed border-slate-200 pt-8 mt-4">
                <div className="flex gap-4 items-end">
                  <StallBox id="P7" type="Platinum" customClass="w-48 h-24" />
                  <div className="flex gap-1.5 flex-wrap max-w-[400px]">
                    {getStalls(50, 58, true).map(id => <StallBox key={id} id={id} />)}
                  </div>
                </div>
                
                {/* VIP LOUNGE */}
                <div className="bg-slate-800 text-amber-500 border-4 border-amber-500 w-[250px] h-[100px] rounded-2xl flex flex-col items-center justify-center shadow-xl">
                  <span className="text-xl font-black uppercase tracking-widest">VIP LOUNGE</span>
                  <span className="text-[8px] uppercase tracking-[0.3em] text-slate-400 mt-1">Authorized Access Only</span>
                </div>
              </div>

           </div>
        </div>

        <Button onClick={() => router.push('/dashboard')} className="w-full h-16 bg-[#0b3d41] text-white font-black uppercase tracking-widest rounded-[1.5rem] shadow-xl hover:bg-black transition-all">
          Back to Dashboard
        </Button>

      </div>
    </div>
  )
}

export default function InteractiveFloorPlan() {
  return <Suspense fallback={<div>Loading Map...</div>}><FloorPlanContent /></Suspense>
}