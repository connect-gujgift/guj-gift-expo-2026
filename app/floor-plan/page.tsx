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
    
    const highlight = isMatch ? 'ring-4 ring-[#ef6c33] z-10 scale-125 shadow-2xl transition-all' : 'transition-all'

    if (!data) return `${highlight} bg-white border-slate-200 text-slate-400 hover:bg-slate-50`
    
    // GGE 2026 Tier Colors
    switch(data.stall_type) {
      case 'Diamond': return `${highlight} bg-purple-600 border-purple-800 text-white`
      case 'Gold': return `${highlight} bg-amber-500 border-amber-700 text-white`
      default: return `${highlight} bg-[#0b3d41] border-[#082a2d] text-white`
    }
  }

  // Helper to generate stall arrays
  const getStalls = (start: number, end: number, reverse = false) => {
    const arr = []
    for (let i = start; i <= end; i++) arr.push(`T-${i}`)
    return reverse ? arr.reverse() : arr
  }

  // The Stall UI Component
  const StallBox = ({ id, className = "w-12 h-12" }: { id: string, className?: string }) => {
    const info = occupancy[id]
    return (
      <div title={info ? `${id}: ${info.company_name}` : `${id}: Available`} className={`border rounded-md flex flex-col items-center justify-center p-1 cursor-pointer ${className} ${getStallStyle(id)}`}>
        <span className="text-[8px] font-black">{id}</span>
        {info && <span className="text-[5px] font-bold uppercase truncate w-full text-center mt-0.5 px-0.5">{info.company_name}</span>}
      </div>
    )
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase text-[10px] bg-slate-50">Calibrating Floor Plan...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER & SEARCH */}
        <div className="text-center py-8 bg-white rounded-[2.5rem] shadow-sm border-b-4 border-[#0b3d41]">
          <h1 className="text-3xl font-black uppercase italic text-[#0b3d41] tracking-tighter">Live Floor Plan</h1>
          <p className="text-[10px] font-bold uppercase text-[#ef6c33] tracking-[0.3em] mt-1 mb-6">Guj Gift Expo 2026 • GMDC Ground</p>
          
          <div className="relative max-w-md mx-auto px-4">
            <Input placeholder="Search Exhibitor or Stall Number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-12 rounded-xl border-2 shadow-sm px-6 font-bold text-sm bg-slate-50 focus:ring-0 focus:border-[#ef6c33]" />
          </div>
        </div>

        {/* MAP CONTAINER */}
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl overflow-x-auto border-2 border-slate-100">
           {/* Setting a strict min-width ensures the complex grid never squishes on mobile */}
           <div className="min-w-[1200px] flex flex-col gap-8">
              
              {/* TOP PERIMETER: 1 to 21 */}
              <div className="flex justify-center gap-1.5">
                {getStalls(1, 21).map(id => <StallBox key={id} id={id} />)}
              </div>

              {/* MIDDLE SECTIONS */}
              <div className="flex justify-between gap-4">
                
                {/* LEFT WALL: 164 down to 153 */}
                <div className="flex flex-col gap-1.5">
                  {getStalls(153, 164, true).map(id => <StallBox key={id} id={id} className="w-14 h-12" />)}
                </div>

                {/* LEFT ISLAND BLOCKS */}
                <div className="flex flex-col gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <StallBox id="P4" className="w-14 h-[100px]" />
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5">{getStalls(97, 104, true).map(id => <StallBox key={id} id={id} />)}</div>
                      <div className="flex gap-1.5">{getStalls(105, 112).map(id => <StallBox key={id} id={id} />)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StallBox id="P5" className="w-14 h-[100px]" />
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5">{getStalls(113, 120, true).map(id => <StallBox key={id} id={id} />)}</div>
                      <div className="flex gap-1.5">{getStalls(121, 128).map(id => <StallBox key={id} id={id} />)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StallBox id="P6" className="w-14 h-[100px]" />
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5">{getStalls(129, 136, true).map(id => <StallBox key={id} id={id} />)}</div>
                      <div className="flex gap-1.5">{getStalls(137, 144).map(id => <StallBox key={id} id={id} />)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-14"></div>{/* Spacer */}
                    <div className="flex gap-1.5">{getStalls(145, 152, true).map(id => <StallBox key={id} id={id} />)}</div>
                  </div>
                </div>

                {/* MAIN CENTRAL WALKING AISLE */}
                <div className="w-12 flex items-center justify-center">
                   <div className="h-full border-l-2 border-dashed border-slate-100"></div>
                </div>

                {/* RIGHT ISLAND BLOCKS */}
                <div className="flex flex-col gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5">{getStalls(88, 96, true).map(id => <StallBox key={id} id={id} />)}</div>
                      <div className="flex gap-1.5">{getStalls(79, 87).map(id => <StallBox key={id} id={id} />)}</div>
                    </div>
                    <StallBox id="P1" className="w-14 h-[100px]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5">{getStalls(70, 78, true).map(id => <StallBox key={id} id={id} />)}</div>
                      <div className="flex gap-1.5">{getStalls(61, 69).map(id => <StallBox key={id} id={id} />)}</div>
                    </div>
                    <StallBox id="P2" className="w-14 h-[100px]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5">{getStalls(52, 60, true).map(id => <StallBox key={id} id={id} />)}</div>
                      <div className="flex gap-1.5">{getStalls(43, 51).map(id => <StallBox key={id} id={id} />)}</div>
                    </div>
                    <StallBox id="P3" className="w-14 h-[100px]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">{getStalls(34, 42, true).map(id => <StallBox key={id} id={id} />)}</div>
                  </div>
                </div>

                {/* RIGHT WALL & VIP LOUNGE */}
                <div className="flex flex-col items-end gap-1.5">
                  <div className="w-[200px] h-[80px] bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-[10px] font-black uppercase text-slate-400">VIP LOUNGE</span>
                  </div>
                  {getStalls(22, 31).map(id => <StallBox key={id} id={id} className="w-14 h-12" />)}
                </div>

              </div>

              {/* BOTTOM PERIMETER & ENTRY G1 */}
              <div className="flex justify-between items-end mt-4">
                <div className="flex gap-1.5">
                  <StallBox id="T-166" /><StallBox id="T-165" />
                </div>
                
                <div className="bg-green-50 text-green-600 px-16 py-4 rounded-3xl border-4 border-green-200 font-black uppercase italic tracking-tighter text-2xl shadow-inner">
                  ↑ MAIN ENTRANCE G1
                </div>

                <div className="flex gap-1.5">
                  <StallBox id="T-33" /><StallBox id="T-32" />
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