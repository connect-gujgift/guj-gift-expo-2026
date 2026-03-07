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
    
    // Highlight effect for the Search Bar
    const highlight = isMatch ? 'ring-4 ring-[#ef6c33] z-10 scale-110 shadow-2xl transition-all' : 'transition-all'

    if (!data) return `${highlight} bg-white border-slate-300 text-slate-400 hover:bg-slate-50`
    
    // Internal Map uses Tier Colors to easily spot premium vs standard blocks
    switch(data.stall_type) {
      case 'Platinum': return `${highlight} bg-indigo-600 border-indigo-800 text-white shadow-lg`
      case 'Diamond': return `${highlight} bg-purple-600 border-purple-800 text-white shadow-md`
      case 'Gold': return `${highlight} bg-amber-500 border-amber-700 text-white`
      default: return `${highlight} bg-[#0b3d41] border-[#082a2d] text-white` // Silver
    }
  }

  const getStalls = (start: number, end: number, reverse = false) => {
    const arr = []
    for (let i = start; i <= end; i++) arr.push(i.toString())
    return reverse ? arr.reverse() : arr
  }

  // Pixel-perfect sizing based on your layout image gaps
  const StallBox = ({ id, type = 'Silver', customClass = '' }: { id: string, type?: 'Silver'|'Gold'|'Diamond'|'Platinum', customClass?: string }) => {
    const info = occupancy[id]
    
    let sizeClass = 'w-10 h-10' // Silver (1x1)
    if (type === 'Gold') sizeClass = 'w-[84px] h-[84px]' // Gold (2x2)
    if (type === 'Diamond') sizeClass = 'w-[128px] h-[84px]' // Diamond (3x2)
    if (type === 'Platinum') sizeClass = 'w-[172px] h-[84px]' // Platinum (4x2)
    if (customClass) sizeClass = customClass

    return (
      <div title={info ? `${id}: ${info.company_name}` : `${id}: Available`} className={`border-2 flex flex-col items-center justify-center p-1 cursor-pointer transition-all duration-300 ${sizeClass} ${getStallStyle(id)}`}>
        <span className={`font-black ${type === 'Silver' ? 'text-[9px]' : 'text-sm'}`}>{id}</span>
        {info && <span className="text-[5px] font-bold uppercase truncate w-full text-center mt-0.5 px-0.5 leading-none">{info.company_name}</span>}
      </div>
    )
  }

  // Helpers for generating the central islands
  const LeftIsland = ({ lg, rg, ts, te, bs, be }: any) => (
    <div className="flex gap-1 border-[3px] border-slate-100 p-1 bg-slate-50">
       <StallBox id={lg} type="Gold" />
       <div className="flex flex-col gap-1">
          <div className="flex gap-1">{getStalls(ts, te, true).map(id => <StallBox key={id} id={id} />)}</div>
          <div className="flex gap-1">{getStalls(bs, be).map(id => <StallBox key={id} id={id} />)}</div>
       </div>
       <StallBox id={rg} type="Gold" />
    </div>
  )

  const RightIsland = ({ lg, rg, ts, te, bs, be }: any) => (
    <div className="flex gap-1 border-[3px] border-slate-100 p-1 bg-slate-50">
       <StallBox id={lg} type="Gold" />
       <div className="flex flex-col gap-1">
          <div className="flex gap-1">{getStalls(ts, te, true).map(id => <StallBox key={id} id={id} />)}</div>
          <div className="flex gap-1">{getStalls(bs, be).map(id => <StallBox key={id} id={id} />)}</div>
       </div>
       <StallBox id={rg} type="Gold" />
    </div>
  )

  const IconBox = () => (
    <div className="w-12 h-12 bg-slate-100 border-2 border-slate-200 text-slate-400 flex items-center justify-center text-xl shadow-inner">
      ⚙️
    </div>
  )

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase text-[10px] bg-slate-50">Calibrating Layout...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* ADMIN HEADER & SEARCH */}
        <div className="text-center py-8 bg-white rounded-[2.5rem] shadow-sm border-b-4 border-[#0b3d41]">
          <h1 className="text-3xl font-black uppercase italic text-[#0b3d41] tracking-tighter">Internal Floor Plan</h1>
          <p className="text-[10px] font-bold uppercase text-[#ef6c33] tracking-[0.3em] mt-1 mb-6">Guj Gift Expo 2026 • GMDC Ground</p>
          
          {/* SEARCH BAR */}
          <div className="relative max-w-md mx-auto px-4 mb-6">
            <Input placeholder="Search Exhibitor or Stall Number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-12 rounded-xl border-2 shadow-sm px-6 font-bold text-sm bg-slate-50 focus:ring-0 focus:border-[#ef6c33]" />
          </div>

          {/* INTERNAL 4-TIER LEGEND */}
          <div className="flex flex-wrap justify-center gap-6 text-[9px] font-black uppercase tracking-widest py-2 bg-slate-50 mx-4 md:mx-auto max-w-fit px-8 rounded-full border border-slate-200">
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-[#0b3d41] rounded"></span> Silver (9m²)</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-amber-500 rounded"></span> Gold (36m²)</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-purple-600 rounded"></span> Diamond (54m²)</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-indigo-600 rounded"></span> Platinum (72m²)</div>
          </div>
        </div>

        {/* MAP CONTAINER */}
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl overflow-x-auto border-2 border-slate-100">
           <div className="min-w-[1250px] flex flex-col gap-8">
              
              {/* TOP ROW */}
              <div className="flex justify-between items-center px-6">
                <div className="bg-pink-100 text-pink-700 px-8 py-3 rounded-lg border-2 border-pink-300 font-black uppercase tracking-widest text-lg shadow-sm">ENTRY</div>
                <div className="flex gap-1 bg-slate-200 p-1">
                  {getStalls(1, 19).map(id => <StallBox key={id} id={id} />)}
                </div>
                <div className="bg-pink-100 text-pink-700 px-8 py-3 rounded-lg border-2 border-pink-300 font-black uppercase tracking-widest text-lg shadow-sm">EXIT</div>
              </div>

              {/* MAIN BODY GRID */}
              <div className="flex justify-between gap-6 px-4">
                
                {/* LEFT FLANK */}
                <div className="flex flex-col justify-between gap-6">
                  <StallBox id="P1" type="Platinum" />
                  <StallBox id="P2" type="Platinum" />
                  <StallBox id="P3" type="Platinum" />
                  <StallBox id="P4" type="Platinum" />
                  <StallBox id="P5" type="Platinum" />
                  <div className="bg-purple-100 text-purple-800 border-4 border-purple-300 w-[172px] h-[84px] flex flex-col items-center justify-center shadow-md">
                    <span className="text-xl font-black uppercase tracking-widest">VIP</span>
                    <span className="text-xs font-black uppercase tracking-widest">LOUNGE</span>
                  </div>
                </div>

                {/* LEFT CENTER ISLANDS */}
                <div className="flex flex-col justify-between gap-8">
                  <LeftIsland lg="G1" rg="G6" ts={87} te={90} bs={83} be={86} />
                  <LeftIsland lg="G2" rg="G5" ts={79} te={82} bs={75} be={78} />
                  <LeftIsland lg="G3" rg="G4" ts={71} te={74} bs={67} be={70} />
                </div>

                {/* RIGHT CENTER ISLANDS */}
                <div className="flex flex-col justify-between gap-8">
                  <RightIsland lg="G7" rg="G12" ts={20} te={24} bs={25} be={29} />
                  <RightIsland lg="G8" rg="G11" ts={30} te={34} bs={35} be={39} />
                  <RightIsland lg="G9" rg="G10" ts={40} te={44} bs={45} be={49} />
                </div>

                {/* RIGHT FLANK */}
                <div className="flex flex-col justify-between gap-6 items-end">
                  <StallBox id="P6" type="Platinum" />
                  <StallBox id="D1" type="Diamond" />
                  <StallBox id="D2" type="Diamond" />
                  <StallBox id="D3" type="Diamond" />
                  <StallBox id="P7" type="Platinum" />
                </div>
              </div>

              {/* BOTTOM ROW */}
              <div className="flex justify-center items-center gap-4 mt-2">
                 <IconBox />
                 <div className="flex gap-1 bg-slate-200 p-1">
                   {getStalls(59, 66, true).map(id => <StallBox key={id} id={id} />)}
                 </div>
                 <IconBox />
                 <div className="flex gap-1 bg-slate-200 p-1">
                   {getStalls(50, 58, true).map(id => <StallBox key={id} id={id} />)}
                 </div>
                 <IconBox />
              </div>

           </div>
        </div>

        <Button onClick={() => router.push('/admin')} className="w-full h-16 bg-slate-900 text-white font-black uppercase tracking-widest rounded-[1.5rem] shadow-xl hover:bg-black transition-all">
          Back to Admin Hub
        </Button>

      </div>
    </div>
  )
}

export default function InteractiveFloorPlan() {
  return <Suspense fallback={<div>Loading Map...</div>}><FloorPlanContent /></Suspense>
}