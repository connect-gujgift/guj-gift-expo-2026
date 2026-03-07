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

  // Traffic Light Sales Colors
  const getStallStyle = (stallId: string) => {
    const data = occupancy[stallId]
    
    // 1. Available (White with green border)
    if (!data) return 'bg-white border-green-500 text-green-700 hover:bg-green-50 shadow-sm'
    
    // 2. On Hold / Unpaid (Yellow/Amber)
    if (data.payment_status === 'Advance / On Hold' || data.payment_status === 'Unpaid') {
      return 'bg-amber-400 border-amber-600 text-amber-950 shadow-md opacity-90'
    }
    
    // 3. Fully Booked (Slate/Dark)
    return 'bg-slate-800 border-slate-900 text-white shadow-lg'
  }

  const getStallLabel = (stallId: string) => {
    const data = occupancy[stallId]
    if (!data) return 'AVAILABLE'
    if (data.payment_status === 'Advance / On Hold' || data.payment_status === 'Unpaid') return 'ON HOLD'
    return 'BOOKED'
  }

  // Array Generators
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

  // Dynamic Stall Box Component
  const StallBox = ({ id, type = 'Silver', customClass = '' }: { id: string, type?: 'Silver'|'Gold'|'Diamond'|'Platinum'|'Custom', customClass?: string }) => {
    const status = getStallLabel(id)
    
    // Dimensions based on Tier
    let sizeClass = 'w-12 h-12' // Silver 9sqm
    if (type === 'Gold') sizeClass = 'w-24 h-24' // Gold 36sqm
    if (type === 'Diamond') sizeClass = 'w-32 h-24' // Diamond 54sqm
    if (type === 'Platinum') sizeClass = 'w-40 h-24' // Platinum 72sqm
    if (customClass) sizeClass = customClass

    return (
      <div title={`${id}: ${status}`} className={`border-2 rounded-md flex flex-col items-center justify-center p-1 cursor-default transition-all duration-500 ${sizeClass} ${getStallStyle(id)}`}>
        <span className={`font-black ${type === 'Silver' ? 'text-[8px]' : 'text-sm'}`}>{id}</span>
        {status !== 'AVAILABLE' && <span className="text-[5px] font-bold uppercase mt-1 opacity-70 tracking-widest leading-none text-center px-1">{status}</span>}
      </div>
    )
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase text-[10px] bg-slate-50">Loading Live Inventory...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* PUBLIC HEADER */}
        <div className="text-center py-8 bg-white rounded-[2.5rem] shadow-sm border-b-4 border-green-600">
          <img src="/event-logo.png" className="h-14 mx-auto mb-3" alt="GGE 2026" />
          <h1 className="text-3xl font-black uppercase italic text-[#0b3d41] tracking-tighter">Live Availability Map</h1>
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.3em] mt-1 mb-6">Real-Time Inventory • GMDC Ground</p>
          
          {/* SALES LEGEND */}
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-widest py-2 bg-slate-50 mx-4 md:mx-auto max-w-fit px-8 rounded-full border border-slate-200">
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-white border-2 border-green-500 rounded-full shadow-sm"></span> Available</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-amber-400 border border-amber-600 rounded-full shadow-sm"></span> On Hold</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-slate-800 rounded-full shadow-sm"></span> Booked</div>
          </div>
        </div>

        {/* REBUILT PUBLIC MAP CONTAINER */}
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl overflow-x-auto border-2 border-slate-100">
           <div className="min-w-[1200px] flex flex-col gap-10 p-4">
              
              {/* TOP ROW */}
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
                
                {/* LEFT FLANK */}
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

                {/* CENTRAL PREMIUM HUB */}
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

                {/* RIGHT FLANK */}
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

              {/* BOTTOM ROW */}
              <div className="flex justify-between items-end border-t-2 border-dashed border-slate-200 pt-8 mt-4">
                <div className="flex gap-4 items-end">
                  <StallBox id="P7" type="Platinum" customClass="w-48 h-24" />
                  <div className="flex gap-1.5 flex-wrap max-w-[400px]">
                    {getStalls(50, 58, true).map(id => <StallBox key={id} id={id} />)}
                  </div>
                </div>
                
                <div className="bg-slate-800 text-amber-500 border-4 border-amber-500 w-[250px] h-[100px] rounded-2xl flex flex-col items-center justify-center shadow-xl">
                  <span className="text-xl font-black uppercase tracking-widest">VIP LOUNGE</span>
                  <span className="text-[8px] uppercase tracking-[0.3em] text-slate-400 mt-1">Authorized Access Only</span>
                </div>
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