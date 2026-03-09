'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function DeskContent() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLive, setIsLive] = useState(true)
  const [results, setResults] = useState<{
    visitors: any[],
    exhibitors: any[],
    staff: any[]
  }>({ visitors: [], exhibitors: [], staff: [] })
  
  const [printTarget, setPrintTarget] = useState<any | null>(null)
  const [printType, setPrintType] = useState<string>('VISITOR')

  useEffect(() => {
    checkAdmin()
    fetchRecentData()

    const interval = setInterval(() => {
      if (isLive && !searchTerm) {
        fetchRecentData()
      }
    }, 30000)

    const handleAfterPrint = () => setPrintTarget(null)
    window.addEventListener('afterprint', handleAfterPrint)

    return () => {
      clearInterval(interval)
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [isLive, searchTerm])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'maulikshah.13@gmail.com') {
      router.push('/login')
    }
  }

  const fetchRecentData = async () => {
    const { data: recentVisitors } = await supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8)

    if (recentVisitors) {
      setResults(prev => ({ ...prev, visitors: recentVisitors }))
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      fetchRecentData()
      return
    }
    setLoading(true)

    const [visRes, exhRes] = await Promise.all([
      supabase.from('visitors').select('*').or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`),
      supabase.from('exhibitors').select('*').or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    ])

    setResults({
      visitors: visRes.data || [],
      exhibitors: (exhRes.data || []).filter(e => !e.is_staff),
      staff: (exhRes.data || []).filter(e => e.is_staff)
    })
    setLoading(false)
  }

  const handlePrint = (person: any, type: string) => {
    setPrintType(type.toUpperCase())
    setPrintTarget(person)
    // 500ms delay gives the QR code image time to fully download before printing
    setTimeout(() => {
      window.print()
    }, 500)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* ------------------------------------------------------------------------- */}
      {/* INSTANT PRINT LAYOUT - BULLETPROOF ISOLATION */}
      {/* ------------------------------------------------------------------------- */}
      {printTarget && (
        <>
          <style type="text/css" media="print">
            {`
              /* Force the printer size and remove default browser margins */
              @page { size: 4in 6in; margin: 0; }
              
              /* HIDE EVERYTHING ON THE WEBSITE (including AppHeader and AppFooter) */
              body * { visibility: hidden !important; }
              
              /* SHOW ONLY THE PRINT AREA */
              #print-area, #print-area * { visibility: visible !important; }
              
              /* Position the print area strictly at the top left of the paper */
              #print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 4in;
                height: 6in;
                display: flex;
                flex-direction: column;
                align-items: center;
                /* PUSHES TEXT DOWN INTO THE BLANK SPACE BELOW YOUR PRE-PRINTED LOGO */
                padding-top: 1.8in; 
                background-color: white;
                margin: 0;
              }
            `}
          </style>

          <div id="print-area" className="hidden print:flex flex-col z-50 bg-white">
            <div className="w-full flex flex-col items-center text-center px-4">
               
               <h2 className="text-3xl font-black uppercase leading-tight text-black break-words w-full">
                 {printTarget.full_name}
               </h2>
               
               <p className="text-xl font-bold text-black uppercase mt-1">
                 {printTarget.company_name || 'Independent'}
               </p>
               
               <p className="text-sm font-bold text-gray-800 uppercase tracking-widest mt-1">
                 {printTarget.designation || (printType === 'EXHIBITOR' ? `Stall ${printTarget.stall_number}` : 'Attendee')}
               </p>

               <div className="mt-6">
                 <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${printTarget.id}&margin=0`} 
                   alt="QR Code" 
                   className="w-32 h-32"
                 />
               </div>

            </div>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* SCREEN UI (Hidden during printing) */}
      {/* ------------------------------------------------------------------------- */}
      <div className="p-4 pb-20 max-w-5xl mx-auto space-y-6 print:hidden">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-[2rem] shadow-sm border-b-4 border-blue-600 gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase text-blue-900 tracking-tighter italic leading-none">Registration Desk</h1>
            <div className="flex items-center gap-2 mt-2">
               <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                 {isLive ? 'G1 Gate • Live Sync Active' : 'Auto-Refresh Paused'}
               </p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" size="sm" onClick={() => setIsLive(!isLive)} className="text-[9px] font-black uppercase rounded-xl border-2 h-10 w-full md:w-auto">
               {isLive ? 'Pause Sync' : 'Resume Sync'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold border-2 text-[10px] uppercase rounded-xl px-4 h-10 w-full md:w-auto">← Hub</Button>
          </div>
        </div>

        <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden">
          <CardContent className="p-6 bg-[#0b3d41]">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <Input 
                autoFocus
                placeholder="Search Attendee Phone, Name, or Email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 bg-white/10 border-0 text-white placeholder:text-white/50 font-bold px-6 rounded-xl focus-visible:ring-0 text-lg"
              />
              <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 h-14 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] text-white shadow-md">
                {loading ? 'Searching...' : 'Find Pass'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!searchTerm && (
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Recent Pre-Registrations</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Updates every 30s</p>
            </div>
          )}
          
          {results.visitors.map(v => (
            <ResultCard key={v.id} data={v} type="visitor" onPrint={() => handlePrint(v, 'visitor')} />
          ))}

          {results.exhibitors.map(e => (
            <ResultCard key={e.id} data={e} type="exhibitor" onPrint={() => handlePrint(e, 'exhibitor')} />
          ))}

          {results.staff.map(s => (
            <ResultCard key={s.id} data={s} type="staff" onPrint={() => handlePrint(s, 'staff')} />
          ))}

          {searchTerm && !loading && results.visitors.length === 0 && results.exhibitors.length === 0 && results.staff.length === 0 && (
            <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
               <span className="text-4xl block mb-2">🤷‍♂️</span>
               <h3 className="text-lg font-black uppercase text-slate-800">No Records Found</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Verify the phone number or ask them to register online.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultCard({ data, type, onPrint }: { data: any, type: string, onPrint: () => void }) {
  const isVip = data.is_vip
  const themes = {
    visitor: { bg: 'bg-orange-500', icon: '👤', label: 'VISITOR' },
    exhibitor: { bg: 'bg-[#0b3d41]', icon: '🎪', label: 'EXHIBITOR' },
    staff: { bg: 'bg-amber-500', icon: '👷', label: 'STAFF' }
  }
  const theme = themes[type as keyof typeof themes] || themes.visitor
  
  return (
    <Card className={`border-0 shadow-sm overflow-hidden rounded-[1.5rem] bg-white hover:shadow-md transition-all ${isVip ? 'border-l-8 border-teal-500 ring-2 ring-teal-500/10' : ''}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center p-5 gap-4">
        <div className={`w-14 h-14 ${isVip ? 'bg-teal-600' : theme.bg} rounded-2xl flex shrink-0 items-center justify-center text-white text-2xl shadow-inner`}>
          {isVip ? '🌟' : theme.icon}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xl font-black uppercase text-slate-900 tracking-tight leading-none">{data.full_name}</h4>
            {isVip && <span className="bg-teal-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">VIP PASS</span>}
            <span className={`${theme.bg} text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest`}>{theme.label}</span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1.5 tracking-widest">
            {data.company_name || 'Independent'} • {type === 'exhibitor' ? `Stall: ${data.stall_number}` : data.phone}
          </p>
        </div>
        <Button onClick={onPrint} className={`w-full sm:w-auto ${isVip ? 'bg-teal-600 hover:bg-teal-700' : 'bg-slate-900 hover:bg-slate-800'} text-white font-black text-[10px] uppercase px-8 h-12 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2`}>
          <span className="text-lg">🖨️</span> {isVip ? 'Print VIP' : 'Print Badge'}
        </Button>
      </div>
    </Card>
  )
}

export default function RegistrationDeskPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold uppercase text-[10px] tracking-widest italic animate-pulse">Syncing G1 Gate...</div>}>
      <DeskContent />
    </Suspense>
  )
}