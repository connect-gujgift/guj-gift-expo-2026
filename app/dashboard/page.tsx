'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Scanner } from '@yudiel/react-qr-scanner'
import * as XLSX from 'xlsx'
import QRCode from "react-qr-code"

export default function Dashboard() {
  const router = useRouter()
  
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<'visitor' | 'exhibitor' | null>(null)
  const [loading, setLoading] = useState(true)
  
  // UI States
  const [scanning, setScanning] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Data States
  const [connections, setConnections] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  // --- 1. INITIALIZATION ---
  useEffect(() => { checkUser() }, [router])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')
    setUser(user)

    // Check for Exhibitor Role first
    const { data: exhibitor } = await supabase.from('exhibitors').select('*').eq('id', user.id).single()
    
    if (exhibitor) {
      setRole('exhibitor')
      // Exhibitors have a dedicated leads page, so we don't strictly need to load them here, 
      // but we keep the fetch just in case you ever want to show a "Total Scans" counter later.
      fetchExhibitorLeads(user.id)
    } else {
      setRole('visitor')
      fetchVisitorConnections(user.id)
    }
    setLoading(false)
  }

  // --- 2. DATA FETCHING ---
  const fetchExhibitorLeads = async (id: string) => {
    const { data, error } = await supabase
      .from('leads')
      .select('id, notes, created_at, visitors(full_name, company_name, phone)')
      .eq('exhibitor_id', id)
      .order('created_at', { ascending: false })
    
    if (error) console.error("Lead Fetch Error:", error.message)
    else setConnections(data || [])
  }

  const fetchVisitorConnections = async (id: string) => {
    const { data, error } = await supabase
      .from('exhibitor_connections')
      .select('id, notes, created_at, exhibitor_id, exhibitors(company_name, stall_number)')
      .eq('visitor_id', id)
      .order('created_at', { ascending: false })
    
    if (error) console.error("Connection Fetch Error:", error.message)
    else setConnections(data || [])
  }

  // --- 3. SEARCH & FILTER ---
  const filteredData = connections.filter((item) => {
    const mainText = role === 'exhibitor' ? item.visitors?.full_name : item.exhibitors?.company_name
    const subText = role === 'exhibitor' ? item.visitors?.company_name : item.exhibitors?.stall_number
    const query = searchQuery.toLowerCase()
    return (mainText || '').toLowerCase().includes(query) || (subText || '').toLowerCase().includes(query)
  })

  // --- 4. SCANNING ACTION ---
  const handleScan = async (scannedId: string) => {
    if (!scannedId) return
    setScanning(false)
    
    const table = role === 'exhibitor' ? 'leads' : 'exhibitor_connections'
    const payload = role === 'exhibitor' 
      ? { exhibitor_id: user.id, visitor_id: scannedId } 
      : { visitor_id: user.id, exhibitor_id: scannedId }

    const { error } = await supabase.from(table).insert([payload])
    
    if (error) {
      if (error.code === '23505') alert("Already connected!")
      else alert("Scan failed: " + error.message)
    } else {
      alert("✅ CONNECTION SAVED")
      role === 'exhibitor' ? fetchExhibitorLeads(user.id) : fetchVisitorConnections(user.id)
    }
  }

  // --- 5. NOTE SAVING ---
  const saveNote = async (id: string) => {
    const table = role === 'exhibitor' ? 'leads' : 'exhibitor_connections'
    const { error } = await supabase
      .from(table)
      .update({ notes: noteText })
      .eq('id', id)

    if (error) alert("Error: " + error.message)
    else {
      alert("✅ NOTE SAVED")
      setEditingId(null)
      role === 'exhibitor' ? fetchExhibitorLeads(user.id) : fetchVisitorConnections(user.id)
    }
  }

  // --- 6. EXCEL EXPORT ---
  const exportToExcel = () => {
    if (filteredData.length === 0) return alert("No data to export.")
    const dataToExport = filteredData.map(item => ({
      'Date': new Date(item.created_at).toLocaleDateString(),
      'Name/Firm': role === 'exhibitor' ? (item.visitors?.full_name || 'Unknown') : (item.exhibitors?.company_name || 'Unknown'),
      'Contact/Stall': role === 'exhibitor' ? (item.visitors?.phone || 'N/A') : (item.exhibitors?.stall_number || 'N/A'),
      'Notes': item.notes || ''
    }))
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Connections")
    XLSX.writeFile(workbook, `GGE_Leads_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (loading) return <div className="p-12 text-center font-black uppercase text-slate-400">Loading Dashboard...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans text-slate-900" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
      
      {/* HEADER WITH LOGOUT */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">
            {role === 'exhibitor' ? 'Exhibitor Hub' : 'Visitor Hub'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live System</p>
          </div>
        </div>
        
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="font-bold border-2 text-xs bg-white">LOGOUT</Button>
        </div>
      </div>

      {/* --- UNIVERSAL BADGE CARD: Visible to both Visitors & Exhibitors --- */}
      {!scanning && (
        <Card 
          className="border-0 shadow-xl bg-[#0b3d41] text-white mb-4 active:scale-95 transition-all cursor-pointer overflow-hidden relative" 
          onClick={() => router.push('/badge')}
        >
          <CardContent className="p-6 flex items-center justify-between">
            <div className="z-10">
              <h2 className="text-xl font-black uppercase italic leading-none">
                {role === 'exhibitor' ? 'Exhibitor Pass' : 'My Entry Pass'}
              </h2>
              <p className="text-[10px] font-bold uppercase text-orange-400 mt-2 tracking-widest">View & Download QR Badge</p>
            </div>
            <div className="text-4xl opacity-40">🎫</div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-600 rounded-full blur-3xl opacity-30"></div>
          </CardContent>
        </Card>
      )}

      {/* --- EXHIBITOR QUICK ACTIONS --- */}
      {!scanning && role === 'exhibitor' && (
        <div className="flex gap-3 mb-4">
            <Button 
                onClick={() => router.push('/exhibitors/scanner')}
                className="flex-1 bg-[#ef6c33] hover:bg-[#d45a27] h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-100 transition-all text-white text-[10px] flex gap-2 items-center justify-center"
            >
                <span className="text-lg">📷</span> Scan Lead
            </Button>
            
            <Button 
                onClick={() => router.push('/exhibitors/leads')}
                className="flex-1 bg-white hover:bg-slate-50 text-[#0b3d41] border-2 border-slate-200 h-14 font-black uppercase tracking-widest rounded-2xl shadow-sm transition-all text-[10px] flex gap-2 items-center justify-center"
            >
                <span className="text-lg">📊</span> View Leads
            </Button>
        </div>
      )}

      {/* EXISTING SCAN ACTION CARD (VISITOR) */}
      {!scanning && role === 'visitor' && (
        <Card className={`border-0 shadow-xl mb-4 text-white active:scale-95 transition-all cursor-pointer bg-blue-600`} onClick={() => setScanning(true)}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase italic leading-none text-white">Scan Exhibitor</h2>
              <p className="text-[9px] font-bold uppercase opacity-80 mt-1">Tap to open camera</p>
            </div>
            <span className="text-3xl">📷</span>
          </CardContent>
        </Card>
      )}

      {/* CAMERA MODAL */}
      {scanning && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm aspect-square bg-slate-900 rounded-[3rem] overflow-hidden relative border-4 border-white/20">
            <Scanner onScan={(res) => { if (res && res.length > 0) handleScan(res[0].rawValue) }} />
          </div>
          <Button variant="destructive" className="mt-8 px-12 py-6 text-lg font-black rounded-full" onClick={() => setScanning(false)}>CLOSE CAMERA</Button>
        </div>
      )}

      {/* ========================================== */}
      {/* THE FOLLOWING SECTIONS ARE ONLY FOR VISITORS */}
      {/* ========================================== */}

      {role === 'visitor' && (
        <>
          {/* SEARCH BAR */}
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="Search Exhibitor or Stall..."
              className="w-full p-4 pl-12 bg-white shadow-sm rounded-2xl text-sm outline-none border-0 font-medium" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
          </div>

          {/* CONNECTIONS LIST */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saved ({filteredData.length})</h2>
              {filteredData.length > 0 && <Button onClick={exportToExcel} variant="ghost" size="sm" className="h-6 text-[9px] font-black text-green-600 bg-green-50">Download Excel</Button>}
            </div>

            {filteredData.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl"><p className="text-slate-400 font-bold uppercase text-xs">No connections found</p></div>
            ) : (
              filteredData.map((item) => (
                <Card key={item.id} className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden mb-3">
                  <div className="p-5">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white bg-blue-600`}>
                        {item.exhibitors?.company_name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-800 uppercase text-sm truncate">{item.exhibitors?.company_name || "Exhibitor"}</h3>
                        <p className="text-[10px] text-blue-600 font-black uppercase">{`Stall: ${item.exhibitors?.stall_number || 'N/A'}`}</p>
                      </div>
                    </div>
                    {item.notes && !editingId && <div className="bg-slate-50 p-3 rounded-xl text-[11px] font-medium text-slate-600 italic mb-3 border-l-4 border-blue-200">"{item.notes}"</div>}
                    {editingId === item.id ? (
                      <div className="space-y-3">
                        <textarea className="w-full p-3 text-xs border-2 rounded-2xl outline-none" placeholder="Add details..." value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                        <div className="flex gap-2"><Button size="sm" onClick={() => saveNote(item.id)} className="font-bold bg-blue-600">SAVE</Button><Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>CANCEL</Button></div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                        <span className="text-[10px] font-black text-green-600 uppercase">⭐ SAVED</span>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-4 rounded-full" onClick={() => { setEditingId(item.id); setNoteText(item.notes || ''); }}>{item.notes ? 'Edit Note' : '+ Add Note'}</Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}

    </div>
  )
}