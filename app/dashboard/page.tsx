'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Scanner } from '@yudiel/react-qr-scanner'

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

  // DATA FETCHING
  const fetchExhibitorLeads = async (id: string) => {
    const { data } = await supabase.from('leads').select('id, notes, created_at, visitors!inner(full_name, company_name, phone)').eq('exhibitor_id', id).order('created_at', { ascending: false })
    setConnections(data || [])
  }

  const fetchVisitorConnections = async (id: string) => {
    const { data } = await supabase.from('exhibitor_connections').select('id, notes, created_at, exhibitors!inner(company_name, stall_number, category)').eq('visitor_id', id).order('created_at', { ascending: false })
    setConnections(data || [])
  }

  // SEARCH LOGIC
  const filteredData = connections.filter((item) => {
    const mainText = role === 'exhibitor' ? item.visitors?.full_name : item.exhibitors?.company_name
    const subText = role === 'exhibitor' ? item.visitors?.company_name : item.exhibitors?.stall_number
    const query = searchQuery.toLowerCase()
    return mainText?.toLowerCase().includes(query) || subText?.toLowerCase().includes(query)
  })

  // SCANNING & SAVING
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
    await supabase.from(table).update({ notes: noteText }).eq('id', id)
    setEditingId(null)
    role === 'exhibitor' ? fetchExhibitorLeads(user.id) : fetchVisitorConnections(user.id)
  }

  if (loading) return <div className="p-8 text-center font-black uppercase">Syncing...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans text-slate-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-black uppercase tracking-tighter italic">
          {role === 'exhibitor' ? 'Lead Manager' : 'Visitor Hub'}
        </h1>
        <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="font-bold">EXIT</Button>
      </div>

      {/* COMMON SCANNER BUTTON */}
      {!scanning && (
        <Card className={`border-0 shadow-xl mb-4 text-white overflow-hidden active:scale-95 transition-all ${role === 'exhibitor' ? 'bg-blue-600' : 'bg-orange-600'}`} onClick={() => setScanning(true)}>
          <CardContent className="p-6 flex items-center justify-between">
            <h2 className="text-lg font-black uppercase italic">Scan {role === 'exhibitor' ? 'Visitor' : 'Exhibitor'}</h2>
            <span className="text-2xl">📷</span>
          </CardContent>
        </Card>
      )}

      {/* SEARCH */}
      <input type="text" placeholder="Search saved connections..." className="w-full p-4 mb-6 bg-white shadow-sm rounded-2xl text-sm outline-none focus:ring-2 focus:ring-slate-200" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

      {/* SCANNER MODAL */}
      {scanning && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm aspect-square bg-slate-900 rounded-3xl overflow-hidden relative border-4 border-white/20">
            <Scanner onScan={(res) => res?.[0] && handleScan(res[0].rawValue)} constraints={{ facingMode: 'environment' }} />
          </div>
          <Button variant="destructive" className="mt-8 px-12 py-6 text-lg font-black rounded-full" onClick={() => setScanning(false)}>CANCEL</Button>
        </div>
      )}

      {/* CONNECTIONS LIST */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">My Saved Connections ({filteredData.length})</h2>
        {filteredData.map((item) => (
          <Card key={item.id} className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white ${role === 'exhibitor' ? 'bg-blue-600' : 'bg-orange-600'}`}>
                  {(role === 'exhibitor' ? item.visitors?.full_name : item.exhibitors?.company_name)?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-800 uppercase text-sm truncate">
                    {role === 'exhibitor' ? item.visitors?.full_name : item.exhibitors?.company_name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase truncate">
                    {role === 'exhibitor' ? item.visitors?.company_name : `Stall: ${item.exhibitors?.stall_number}`}
                  </p>
                </div>
              </div>

              {item.notes && !editingId && <p className="bg-slate-50 p-2 rounded-lg text-[10px] text-slate-500 italic mb-2">"{item.notes}"</p>}

              {editingId === item.id ? (
                <div className="space-y-2">
                  <textarea className="w-full p-2 text-xs border rounded-xl" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                  <div className="flex gap-2"><Button size="sm" onClick={() => saveNote(item.id)} className="h-7 text-[9px] font-bold">SAVE</Button><Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-[9px] font-bold">CANCEL</Button></div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black text-blue-600 uppercase" onClick={() => { setEditingId(item.id); setNoteText(item.notes || ''); }}>{item.notes ? 'Edit Note' : '+ Add Note'}</Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}