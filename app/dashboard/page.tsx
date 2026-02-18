'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Scanner } from '@yudiel/react-qr-scanner'
import * as XLSX from 'xlsx'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<'visitor' | 'exhibitor' | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [connections, setConnections] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  useEffect(() => { checkUser() }, [router])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')
    setUser(user)

    const { data: exhibitor } = await supabase.from('exhibitors').select('*').eq('id', user.id).single()
    if (exhibitor) {
      setRole('exhibitor')
      fetchExhibitorLeads(user.id)
    } else {
      setRole('visitor')
      fetchVisitorConnections(user.id)
    }
    setLoading(false)
  }

  // DATA FETCHING (Using your specific column names: phone and notes)
  const fetchExhibitorLeads = async (id: string) => {
    const { data } = await supabase
      .from('leads')
      .select('id, notes, created_at, visitors!inner(full_name, company_name, phone)')
      .eq('exhibitor_id', id)
      .order('created_at', { ascending: false })
    setConnections(data || [])
  }

  const fetchVisitorConnections = async (id: string) => {
    const { data } = await supabase
      .from('exhibitor_connections')
      .select('id, notes, created_at, exhibitors!inner(company_name, stall_number, category)')
      .eq('visitor_id', id)
      .order('created_at', { ascending: false })
    setConnections(data || [])
  }

  // SEARCH LOGIC (Filters by Name or Firm Name)
  const filteredData = connections.filter((item) => {
    const mainText = role === 'exhibitor' ? item.visitors?.full_name : item.exhibitors?.company_name
    const subText = role === 'exhibitor' ? item.visitors?.company_name : item.exhibitors?.stall_number
    const query = searchQuery.toLowerCase()
    return mainText?.toLowerCase().includes(query) || subText?.toLowerCase().includes(query)
  })

  // EXCEL EXPORT
  const exportToExcel = () => {
    if (filteredData.length === 0) return alert("No leads to export!")
    const dataToExport = filteredData.map(item => ({
      'Date': new Date(item.created_at).toLocaleDateString(),
      'Name/Firm': role === 'exhibitor' ? item.visitors?.full_name : item.exhibitors?.company_name,
      'Company/Stall': role === 'exhibitor' ? item.visitors?.company_name : item.exhibitors?.stall_number,
      'Contact/Phone': role === 'exhibitor' ? item.visitors?.phone : 'N/A',
      'Notes': item.notes || ''
    }))
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Connections")
    XLSX.writeFile(workbook, `Connections_Export_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // SCANNING & SAVING
  const handleScan = async (scannedId: string) => {
    setScanning(false)
    const table = role === 'exhibitor' ? 'leads' : 'exhibitor_connections'
    const payload = role === 'exhibitor' 
      ? { exhibitor_id: user.id, visitor_id: scannedId } 
      : { visitor_id: user.id, exhibitor_id: scannedId }

    const { error } = await supabase.from(table).insert([payload])
    if (error) alert("You are already connected!")
    else {
      alert("✅ CONNECTION SAVED")
      role === 'exhibitor' ? fetchExhibitorLeads(user.id) : fetchVisitorConnections(user.id)
    }
  }

  const saveNote = async (id: string) => {
    const table = role === 'exhibitor' ? 'leads' : 'exhibitor_connections'
    const { error } = await supabase.from(table).update({ notes: noteText }).eq('id', id)
    if (error) alert("Error saving: " + error.message)
    else {
      alert("✅ NOTE UPDATED")
      setEditingId(null)
      role === 'exhibitor' ? fetchExhibitorLeads(user.id) : fetchVisitorConnections(user.id)
    }
  }

  if (loading) return <div className="p-12 text-center font-black uppercase text-slate-400">Loading Dashboard...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans text-slate-900">
      <div className="flex justify-between items-center mb-6 px-1">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter italic">
            {role === 'exhibitor' ? 'Lead Manager' : 'Visitor Hub'}
          </h1>
          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Guj Gift Expo 2026</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="font-bold border-2">LOGOUT</Button>
      </div>

      {/* DUAL-SCANNER BUTTON */}
      {!scanning && (
        <Card className={`border-0 shadow-xl mb-4 text-white overflow-hidden active:scale-95 transition-all ${role === 'exhibitor' ? 'bg-blue-600' : 'bg-orange-600'}`} onClick={() => setScanning(true)}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-black uppercase italic leading-none">Scan {role === 'exhibitor' ? 'Visitor' : 'Exhibitor'}</h2>
                <p className="text-[9px] font-bold uppercase opacity-70 mt-1">Tap to open camera</p>
            </div>
            <span className="text-3xl">📷</span>
          </CardContent>
        </Card>
      )}

      {/* SEARCH BOX */}
      <div className="relative mb-6">
        <input 
            type="text" 
            placeholder={role === 'exhibitor' ? "Search Name or Firm..." : "Search Exhibitor or Stall..."}
            className="w-full p-4 pl-12 bg-white shadow-sm rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100 font-medium" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20">🔍</span>
      </div>

      {/* SCANNER VIEW */}
      {scanning && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm aspect-square bg-slate-900 rounded-[3rem] overflow-hidden relative border-4 border-white/10">
            <Scanner onScan={(res) => res?.[0] && handleScan(res[0].rawValue)} constraints={{ facingMode: 'environment' }} />
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none"></div>
          </div>
          <Button variant="destructive" className="mt-12 px-16 py-7 text-lg font-black rounded-full" onClick={() => setScanning(false)}>EXIT CAMERA</Button>
        </div>
      )}

      {/* CONNECTIONS LIST */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Saved ({filteredData.length})</h2>
            {filteredData.length > 0 && (
                <Button onClick={exportToExcel} variant="ghost" size="sm" className="h-6 text-[9px] font-black uppercase text-green-600 bg-green-50 px-3">Download Excel</Button>
            )}
        </div>

        {filteredData.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-slate-300 font-bold uppercase text-[10px]">No records found</p>
            </div>
        ) : filteredData.map((item) => (
          <Card key={item.id} className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white ${role === 'exhibitor' ? 'bg-blue-600' : 'bg-orange-600'}`}>
                  {(role === 'exhibitor' ? item.visitors?.full_name : item.exhibitors?.company_name)?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-800 uppercase text-sm truncate leading-tight">
                    {role === 'exhibitor' ? item.visitors?.full_name : item.exhibitors?.company_name}
                  </h3>
                  <p className="text-[10px] text-blue-600 font-black uppercase truncate">
                    {role === 'exhibitor' ? item.visitors?.company_name : `Stall: ${item.exhibitors?.stall_number}`}
                  </p>
                </div>
              </div>

              {item.notes && !editingId && (
                <div className="bg-slate-50 p-3 rounded-xl text-[11px] font-medium text-slate-600 italic mb-3 border-l-4 border-blue-200">
                    "{item.notes}"
                </div>
              )}

              {editingId === item.id ? (
                <div className="space-y-3">
                  <textarea 
                    className="w-full p-3 text-xs border-2 border-slate-50 rounded-2xl outline-none focus:border-blue-400 min-h-[80px]" 
                    placeholder="Enter follow-up details..."
                    value={noteText} 
                    onChange={(e) => setNoteText(e.target.value)} 
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveNote(item.id)} className="font-bold px-6">SAVE</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="font-bold">CANCEL</Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                  <span className="text-[10px] font-black text-green-600 uppercase">
                    {role === 'exhibitor' ? `📞 ${item.visitors?.phone || 'No Phone'}` : '⭐ SAVED'}
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-4 rounded-full" onClick={() => { setEditingId(item.id); setNoteText(item.notes || ''); }}>
                    {item.notes ? 'Edit Notes' : '+ Add Notes'}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}