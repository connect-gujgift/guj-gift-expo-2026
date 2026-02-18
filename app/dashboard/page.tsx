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
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<'visitor' | 'exhibitor' | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [showMyQR, setShowMyQR] = useState(false)
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

  // --- DATA FETCHING (Using phone column and notes column) ---
  const fetchExhibitorLeads = async (id: string) => {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        id, 
        notes, 
        created_at, 
        visitors (full_name, company_name, phone)
      `)
      .eq('exhibitor_id', id)
      .order('created_at', { ascending: false })
    
    if (error) console.error("Exhibitor Fetch Error:", error.message)
    else setConnections(data || [])
  }

  const fetchVisitorConnections = async (id: string) => {
    const { data, error } = await supabase
      .from('exhibitor_connections')
      .select(`
        id, 
        notes, 
        created_at, 
        exhibitor_id,
        exhibitors (company_name, stall_number)
      `)
      .eq('visitor_id', id)
      .order('created_at', { ascending: false })
    
    if (error) console.error("Visitor Fetch Error:", error.message)
    else setConnections(data || [])
  }

  // --- SEARCH FILTER ---
  const filteredData = connections.filter((item) => {
    const mainText = role === 'exhibitor' ? item.visitors?.full_name : item.exhibitors?.company_name
    const subText = role === 'exhibitor' ? item.visitors?.company_name : item.exhibitors?.stall_number
    const query = searchQuery.toLowerCase()
    return mainText?.toLowerCase().includes(query) || subText?.toLowerCase().includes(query)
  })

  // --- SCANNING & SAVING ---
  const handleScan = async (scannedId: string) => {
    setScanning(false)
    const table = role === 'exhibitor' ? 'leads' : 'exhibitor_connections'
    const payload = role === 'exhibitor' 
      ? { exhibitor_id: user.id, visitor_id: scannedId } 
      : { visitor_id: user.id, exhibitor_id: scannedId }

    const { error } = await supabase.from(table).insert([payload])
    if (error) alert("Already connected!")
    else {
      alert("✅ CONNECTION SAVED")
      role === 'exhibitor' ? fetchExhibitorLeads(user.id) : fetchVisitorConnections(user.id)
    }
  }

  const saveNote = async (id: string) => {
    const table = role === 'exhibitor' ? 'leads' : 'exhibitor_connections'
    const { error } = await supabase.from(table).update({ notes: noteText }).eq('id', id)
    if (!error) {
      alert("Note Saved")
      setEditingId(null)
      role === 'exhibitor' ? fetchExhibitorLeads(user.id) : fetchVisitorConnections(user.id)
    }
  }

  const exportToExcel = () => {
    const dataToExport = filteredData.map(item => ({
      'Date': new Date(item.created_at).toLocaleDateString(),
      'Name/Firm': role === 'exhibitor' ? item.visitors?.full_name : item.exhibitors?.company_name,
      'Contact/Stall': role === 'exhibitor' ? item.visitors?.phone : item.exhibitors?.stall_number,
      'Notes': item.notes || ''
    }))
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Connections")
    XLSX.writeFile(workbook, `Expo_Leads_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (loading) return <div className="p-12 text-center font-black uppercase text-slate-400">Loading Dashboard...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans text-slate-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-black uppercase tracking-tighter italic">
          {role === 'exhibitor' ? 'Lead Hub' : 'Visitor Hub'}
        </h1>
        <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="font-bold border-2 border-slate-200">EXIT</Button>
      </div>

      {/* EXHIBITOR QR DISPLAY */}
      {role === 'exhibitor' && (
        <div className="mb-4">
          {!showMyQR ? (
            <Button onClick={() => setShowMyQR(true)} className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-lg uppercase italic text-sm">
              Show My QR to Visitor 📱
            </Button>
          ) : (
            <Card className="border-4 border-slate-900 bg-white shadow-2xl p-6 flex flex-col items-center animate-in zoom-in duration-300">
              <div className="flex justify-between w-full mb-4">
                <span className="text-[10px] font-black uppercase text-slate-400">Scan to save Shourya Stitch</span>
                <Button variant="ghost" size="sm" onClick={() => setShowMyQR(false)} className="h-6 text-[10px] font-black text-red-500 uppercase">Close</Button>
              </div>
              <div className="p-4 bg-white border-2 border-slate-50 rounded-3xl"><QRCode value={user.id} size={200} level="H" /></div>
            </Card>
          )}
        </div>
      )}

      {/* COMMON SCAN BUTTON */}
      {!scanning && (
        <Card className={`border-0 shadow-xl mb-4 text-white active:scale-95 transition-all ${role === 'exhibitor' ? 'bg-blue-600' : 'bg-orange-600'}`} onClick={() => setScanning(true)}>
          <CardContent className="p-6 flex items-center justify-between">
            <h2 className="text-lg font-black uppercase italic">Scan {role === 'exhibitor' ? 'Visitor' : 'Exhibitor'}</h2>
            <span className="text-2xl">📷</span>
          </CardContent>
        </Card>
      )}

      {/* SEARCH */}
      <input type="text" placeholder="Search saved connections..." className="w-full p-4 mb-6 bg-white shadow-sm rounded-2xl text-sm outline-none border-0 focus:ring-2 focus:ring-slate-200" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

      {/* SCANNER MODAL */}
      {scanning && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm aspect-square bg-slate-900 rounded-[3rem] overflow-hidden relative border-4 border-white/10">
            <Scanner onScan={(res) => res?.[0] && handleScan(res[0].rawValue)} constraints={{ facingMode: 'environment' }} />
          </div>
          <Button variant="destructive" className="mt-8 px-12 py-6 text-lg font-black rounded-full" onClick={() => setScanning(false)}>EXIT</Button>
        </div>
      )}

      {/* LIST SECTION */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saved ({filteredData.length})</h2>
          {filteredData.length > 0 && <Button onClick={exportToExcel} variant="ghost" size="sm" className="h-6 text-[9px] font-black uppercase text-green-600 bg-green-50 px-3 italic">Export</Button>}
        </div>

        {filteredData.map((item) => (
          <Card key={item.id} className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white ${role === 'exhibitor' ? 'bg-blue-600' : 'bg-orange-600'}`}>
                  {(role === 'exhibitor' ? item.visitors?.full_name : item.exhibitors?.company_name)?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-800 uppercase text-sm truncate">
                    {role === 'exhibitor' ? (item.visitors?.full_name || "Unknown Visitor") : (item.exhibitors?.company_name || "Exhibitor Saved")}
                  </h3>
                  <p className="text-[10px] text-blue-600 font-bold uppercase truncate">
                    {role === 'exhibitor' ? item.visitors?.company_name : (item.exhibitors?.stall_number ? `Stall: ${item.exhibitors.stall_number}` : `ID: ${item.exhibitor_id.substring(0,8)}...`)}
                  </p>
                </div>
              </div>

              {item.notes && !editingId && <p className="bg-slate-50 p-3 rounded-xl text-[10px] text-slate-500 italic mb-2">"{item.notes}"</p>}

              {editingId === item.id ? (
                <div className="space-y-2">
                  <textarea className="w-full p-3 text-xs border rounded-2xl" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                  <div className="flex gap-2"><Button size="sm" onClick={() => saveNote(item.id)} className="h-7 text-[9px] font-bold">SAVE</Button><Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-[9px] font-bold">CANCEL</Button></div>
                </div>
              ) : (
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                  <span className="text-[10px] font-black text-green-600 uppercase">
                    {role === 'exhibitor' ? `📞 ${item.visitors?.phone || 'No Phone'}` : 'CONNECTION SAVED'}
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black text-blue-600 uppercase bg-blue-50 px-4 rounded-full" onClick={() => { setEditingId(item.id); setNoteText(item.notes || ''); }}>{item.notes ? 'Edit' : '+ Note'}</Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}