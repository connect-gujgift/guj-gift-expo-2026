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
  const [showMyQR, setShowMyQR] = useState(false)
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

    // Identify Role
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

  // --- 2. DATA FETCHING (Resilient Logic) ---
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
    // We use a flexible join to ensure the card appears even if the exhibitor profile is incomplete
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
    
    // Safety check to prevent crashing on null values
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
      if (error.code === '23505') alert("You are already connected!")
      else alert("Scan failed: " + error.message)
    } else {
      alert("✅ CONNECTION SAVED")
      role === 'exhibitor' ? fetchExhibitorLeads(user.id) : fetchVisitorConnections(user.id)
    }
  }

  // --- 5. NOTE SAVING (With Verification) ---
  const saveNote = async (id: string) => {
    const table = role === 'exhibitor' ? 'leads' : 'exhibitor_connections'
    
    // .select() asks the DB to confirm the update actually happened
    const { data, error } = await supabase
      .from(table)
      .update({ notes: noteText })
      .eq('id', id)
      .select()

    if (error) {
      alert("Error: " + error.message)
    } else if (!data || data.length === 0) {
      alert("❌ SAVE FAILED: Database permission denied. Please run the SQL Policies.")
    } else {
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
    XLSX.writeFile(workbook, `Expo_Data_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (loading) return <div className="p-12 text-center font-black uppercase text-slate-400">Loading Dashboard...</div>

  return (
    // MAIN WRAPPER: Optimized for Mobile Safe Areas
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans text-slate-900 overflow-x-hidden touch-pan-y" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
      
      {/* HEADER with Super Admin Button */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900">
            {role === 'exhibitor' ? 'Lead Manager' : 'Visitor Hub'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live System</p>
          </div>
        </div>
        
        <div className="flex gap-2">
            {/* SUPER ADMIN BUTTON (Visible only to you) */}
            {/* CHANGE 'admin@test.com' TO YOUR ACTUAL EMAIL */}
            {user?.email === 'super@gmail.com' && (
                <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => router.push('/admin')} 
                    className="font-bold text-[10px] shadow-md animate-pulse px-2"
                >
                    ADMIN
                </Button>
            )}

            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} 
                className="font-bold border-2 border-slate-200 text-xs bg-white shadow-sm"
            >
                LOGOUT
            </Button>
        </div>
      </div>

      {/* EXHIBITOR QR TOGGLE */}
      {role === 'exhibitor' && (
        <div className="mb-4">
          {!showMyQR ? (
            <Button onClick={() => setShowMyQR(true)} className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-lg uppercase italic text-sm">
              Show My QR Code 📱
            </Button>
          ) : (
            <Card className="border-4 border-slate-900 bg-white shadow-2xl p-6 flex flex-col items-center animate-in zoom-in duration-300">
              <div className="flex justify-between w-full mb-4">
                <span className="text-[10px] font-black uppercase text-slate-400">Let Visitor Scan This</span>
                <Button variant="ghost" size="sm" onClick={() => setShowMyQR(false)} className="h-6 text-[10px] font-black text-red-500 uppercase">Close</Button>
              </div>
              <div className="p-4 bg-white border-2 border-slate-50 rounded-3xl mb-2">
                <QRCode value={user.id} size={200} level="H" />
              </div>
              <p className="text-[10px] font-bold text-blue-600 uppercase text-center">Stall ID: {user.id.substring(0,8)}...</p>
            </Card>
          )}
        </div>
      )}

      {/* MAIN SCAN BUTTON */}
      {!scanning && (
        <Card className={`border-0 shadow-xl mb-4 text-white active:scale-95 transition-all cursor-pointer ${role === 'exhibitor' ? 'bg-blue-600' : 'bg-orange-600'}`} onClick={() => setScanning(true)}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase italic leading-none">Scan {role === 'exhibitor' ? 'Visitor' : 'Exhibitor'}</h2>
              <p className="text-[9px] font-bold uppercase opacity-80 mt-1">Tap to open camera</p>
            </div>
            <span className="text-3xl">📷</span>
          </CardContent>
        </Card>
      )}

      {/* SEARCH BAR */}
      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder={role === 'exhibitor' ? "Search Name or Firm..." : "Search Exhibitor or Stall..."}
          className="w-full p-4 pl-12 bg-white shadow-sm rounded-2xl text-sm outline-none border-0 focus:ring-2 focus:ring-slate-200 font-medium" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
      </div>

      {/* CAMERA MODAL (Full Screen Overlay) */}
      {scanning && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm aspect-square bg-slate-900 rounded-[3rem] overflow-hidden relative border-4 border-white/20 shadow-2xl">
            <Scanner 
              onScan={(res) => {
                if (res && res.length > 0) handleScan(res[0].rawValue)
              }} 
              constraints={{ facingMode: 'environment' }} 
            />
            <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none"></div>
          </div>
          <Button variant="destructive" className="mt-8 px-12 py-6 text-lg font-black rounded-full" onClick={() => setScanning(false)}>CLOSE CAMERA</Button>
        </div>
      )}

      {/* CONNECTIONS LIST */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saved ({filteredData.length})</h2>
          {filteredData.length > 0 && (
            <Button onClick={exportToExcel} variant="ghost" size="sm" className="h-6 text-[9px] font-black uppercase text-green-600 bg-green-50 px-3">
              Download Excel
            </Button>
          )}
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
            <p className="text-slate-400 font-bold uppercase text-xs">No connections found</p>
          </div>
        ) : (
          filteredData.map((item) => (
            <Card key={item.id} className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden mb-3">
              <div className="p-5">
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white ${role === 'exhibitor' ? 'bg-blue-600' : 'bg-orange-600'}`}>
                    {(role === 'exhibitor' ? item.visitors?.full_name : item.exhibitors?.company_name)?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-800 uppercase text-sm truncate leading-tight">
                      {/* FALLBACK LOGIC: Shows ID if name is missing */}
                      {role === 'exhibitor' ? (item.visitors?.full_name || "Unknown Visitor") : (item.exhibitors?.company_name || "Exhibitor Saved")}
                    </h3>
                    <p className="text-[10px] text-blue-600 font-black uppercase truncate">
                      {/* FALLBACK LOGIC: Shows ID if stall is missing */}
                      {role === 'exhibitor' ? item.visitors?.company_name : (item.exhibitors?.stall_number ? `Stall: ${item.exhibitors.stall_number}` : `ID: ${item.exhibitor_id?.substring(0,8)}...`)}
                    </p>
                  </div>
                </div>

                {/* NOTES DISPLAY */}
                {item.notes && !editingId && (
                  <div className="bg-slate-50 p-3 rounded-xl text-[11px] font-medium text-slate-600 italic mb-3 border-l-4 border-blue-200">
                    "{item.notes}"
                  </div>
                )}

                {/* NOTES EDITOR */}
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <textarea 
                      className="w-full p-3 text-xs border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-400 min-h-[80px]" 
                      placeholder="Add details..."
                      value={noteText} 
                      onChange={(e) => setNoteText(e.target.value)} 
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveNote(item.id)} className="font-bold px-6 bg-blue-600">SAVE</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="font-bold">CANCEL</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <span className="text-[10px] font-black text-green-600 uppercase">
                      {role === 'exhibitor' ? `📞 ${item.visitors?.phone || 'No Phone'}` : '⭐ SAVED'}
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-4 rounded-full" onClick={() => { setEditingId(item.id); setNoteText(item.notes || ''); }}>
                      {item.notes ? 'Edit Note' : '+ Add Note'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}