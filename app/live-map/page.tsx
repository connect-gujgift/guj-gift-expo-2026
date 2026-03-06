'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'

function PublicMapContent() {
  const [occupancy, setOccupancy] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOccupancy() {
      const { data } = await supabase.from('stalls').select('stall_number, payment_status')
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
    
    // Auto-refresh the map every 10 seconds so it's always live
    fetchOccupancy()
    const interval = setInterval(fetchOccupancy, 10000)
    return () => clearInterval(interval)
  }, [])

  const getStallStyle = (stallId: string) => {
    const data = occupancy[stallId]
    
    // 1. Available (White with green border)
    if (!data) return 'bg-white border-green-500 text-green-600 hover:bg-green-50'
    
    // 2. On Hold (Yellow/Amber)
    if (data.payment_status === 'Advance / On Hold' || data.payment_status === 'Unpaid') {
      return 'bg-amber-400 border-amber-600 text-amber-900 shadow-md opacity-90'
    }
    
    // 3. Fully Booked (Slate/Red)
    return 'bg-slate-800 border-slate-900 text-white shadow-lg'
  }

  const getStallLabel = (stallId: string) => {
    const data = occupancy[stallId]
    if (!data) return 'AVAILABLE'
    if (data.payment_status === 'Advance / On Hold' || data.payment_status === 'Unpaid') return 'ON HOLD'
    return 'BOOKED'
  }

  const getStalls = (start: number, end: number, reverse = false) => {
    const arr = []
    for (let i = start; i <= end; i++) arr.push(`T-${i}`)
    return reverse ? arr.reverse() : arr
  }

  const StallBox = ({ id, className = "w-12 h-12" }: { id: string, className?: string }) => {
    const status = getStallLabel(id)
    return (
      <div title={`${id}: ${status}`} className={`border-2 rounded-md flex flex-col items-center justify-center p-1 cursor-default transition-all duration-500 ${className} ${getStallStyle(id)}`}>
        <span className="text-[8px] font-black">{id}</span>
        {status !== 'AVAILABLE' && <span className="text-[5px] font-bold uppercase mt-1 opacity-70 tracking-widest">{status}</span>}
      </div>
    )
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase text-[10px] bg-slate-50">Loading Live Inventory...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* PUBLIC HEADER */}
        <div className="text-center py-8 bg-white rounded-[2.5rem] shadow-sm border-b-4 border-green-600">
          <img src="/event-logo.png" className="h-14 mx-auto mb-3" alt="GGE 2026" />
          <h1 className="text-3xl font-black uppercase italic text-[#0b3d41] tracking-tighter">Live Availability Map</h1>
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.3em] mt-1 mb-6">Real-Time Inventory • GMDC Ground</p>
          
          {/* SALES LEGEND */}
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-widest py-2 bg-slate-50 mx-4 md:mx-auto max-w-fit px-8 rounded-full border border-slate-200">
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-white border-2 border-green-500 rounded-full"></span> Available</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-amber-400 border border-amber-600 rounded-full"></span> On Hold</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-slate-800 rounded-full"></span> Booked</div>
          </div>
        </div>

        {/* MAP CONTAINER */}
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl overflow-x-auto border-2 border-slate-100">
           <div className="min-w-[1200px] flex flex-col gap-8">
              
              <div className="flex justify-center gap-1.5">
                {getStalls(1, 21).map(id => <StallBox key={id} id={id} />)}
              </div>

              <div className="flex justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  {getStalls(153, 164, true).map(id => <StallBox key={id} id={id} className="w-14 h-12" />)}
                </div>

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
                    <div className="w-14"></div>
                    <div className="flex gap-1.5">{getStalls(145, 152, true).map(id => <StallBox key={id} id={id} />)}</div>
                  </div>
                </div>

                <div className="w-12 flex items-center justify-center">
                   <div className="h-full border-l-2 border-dashed border-slate-100"></div>
                </div>

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

                <div className="flex flex-col items-end gap-1.5">
                  <div className="w-[200px] h-[80px] bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-[10px] font-black uppercase text-slate-400">VIP LOUNGE</span>
                  </div>
                  {getStalls(22, 31).map(id => <StallBox key={id} id={id} className="w-14 h-12" />)}
                </div>
              </div>

              <div className="flex justify-between items-end mt-4">
                <div className="flex gap-1.5"><StallBox id="T-166" /><StallBox id="T-165" /></div>
                <div className="bg-slate-50 text-slate-400 px-16 py-4 rounded-3xl border-4 border-slate-100 font-black uppercase italic tracking-tighter text-2xl">
                  ↑ MAIN ENTRANCE G1
                </div>
                <div className="flex gap-1.5"><StallBox id="T-33" /><StallBox id="T-32" /></div>
              </div>

           </div>
        </div>
      </div>
    </div>
  )
}

export default function LiveMapPage() {
  return <Suspense fallback={<div>Loading...</div>}><PublicMapContent /></Suspense>
}