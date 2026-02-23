'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import * as XLSX from 'xlsx'

export default function VisitorConnectionsPage() {
  const router = useRouter()
  const [visitor, setVisitor] = useState<any>(null)
  const [connections, setConnections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Note editing states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    // 1. Check for the active Visitor session in localStorage
    const sessionData = localStorage.getItem('activeVisitor')
    if (!sessionData) {
      router.push('/visitor') // Kick them back to login if no session is found
      return
    }
    
    const parsedVisitor = JSON.parse(sessionData)
    setVisitor(parsedVisitor)
    fetchConnections(parsedVisitor.id)
  }, [router])

  const fetchConnections = async (visitorId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('exhibitor_connections')
        .select(`
          id,
          notes,
          created_at,
          exhibitors (
            company_name,
            stall_number,
            full_name,
            phone,
            email
          )
        `)
        .eq('visitor_id', visitorId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setConnections(data || [])
    } catch (err: any) {
      console.error('Error fetching connections:', err)
      setError('Failed to load saved exhibitors.')
    } finally {
      setLoading(false)
    }
  }

  const saveNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exhibitor_connections')
        .update({ notes: noteText })
        .eq('id', id)

      if (error) throw error
      setEditingId(null)
      fetchConnections(visitor.id) // Refresh data
    } catch (err: any) {
      alert("Error saving note: " + err.message)
    }
  }

  const exportToExcel = () => {
    if (connections.length === 0) return

    const dataToExport = connections.map(item => ({
      'Date': new Date(item.created_at).toLocaleDateString(),
      'Exhibitor Company': item.exhibitors?.company_name || 'Unknown',
      'Stall Number': item.exhibitors?.stall_number || 'N/A',
      'Contact Person': item.exhibitors?.full_name || 'N/A',
      'Phone': item.exhibitors?.phone || 'N/A',
      'Email': item.exhibitors?.email || 'N/A',
      'My Private Notes': item.notes || ''
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Saved Exhibitors")
    XLSX.writeFile(workbook, `GGE_Saved_Exhibitors_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold uppercase text-xs tracking-widest bg-slate-50">Loading Connections...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans text-slate-900 pb-20">
      
      <div className="w-full max-w-2xl mb-6 flex justify-between items-center mt-4">
          <Button variant="ghost" onClick={() => router.push('/visitor')} className="text-slate-500 hover:text-blue-600 hover:bg-slate-200 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full transition-all">
             ← Back to Hub
          </Button>
          <img src="/event-logo.png" alt="GGE 2026" className="h-8 object-contain grayscale opacity-50" />
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-6">
        
        <Card className="border-0 shadow-lg overflow-hidden rounded-[1.5rem] bg-white">
          <CardHeader className="bg-blue-600 p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Saved Exhibitors</CardTitle>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-80">
                {connections.length} Connections
              </p>
            </div>
            <Button 
              onClick={exportToExcel}
              disabled={connections.length === 0}
              className="bg-white text-blue-600 hover:bg-slate-100 font-black uppercase tracking-widest text-[10px] px-6 py-5 rounded-xl shadow-lg transition-all w-full sm:w-auto"
            >
              📥 Export Data
            </Button>
          </CardHeader>
        </Card>

        {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase leading-tight rounded-r-xl">{error}</div>}

        <div className="flex flex-col gap-3">
          {connections.length === 0 && !error ? (
            <div className="text-center py-12 bg-white rounded-[1.5rem] border border-dashed border-slate-300">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No exhibitors saved.</p>
              <p className="text-slate-400 text-[10px] mt-2">Use the scanner to save stalls you visit.</p>
            </div>
          ) : (
            connections.map((item) => {
              const exhibitor = item.exhibitors || {}
              return (
                <Card key={item.id} className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5">
                    
                    {/* Header Info */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-800 uppercase leading-tight">
                          {exhibitor.company_name || 'Unknown Company'}
                        </h3>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                          Stall: {exhibitor.stall_number || 'N/A'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 sm:text-right text-[11px] font-bold text-slate-600">
                        <p>👤 {exhibitor.full_name || 'N/A'}</p>
                        <p>📞 {exhibitor.phone || 'N/A'}</p>
                        {exhibitor.email && <p>✉️ {exhibitor.email}</p>}
                      </div>
                    </div>

                    {/* Notes Section */}
                    {item.notes && !editingId && (
                      <div className="bg-slate-50 p-3 rounded-xl text-[11px] font-medium text-slate-600 italic mb-3 border-l-4 border-blue-200">
                        "{item.notes}"
                      </div>
                    )}

                    {/* Note Editor */}
                    {editingId === item.id ? (
                      <div className="space-y-3 mt-3 pt-3 border-t border-slate-100">
                        <textarea 
                          className="w-full p-3 text-xs border-2 rounded-xl outline-none focus:border-blue-400 transition-colors" 
                          placeholder="Add details about what you discussed..." 
                          value={noteText} 
                          onChange={(e) => setNoteText(e.target.value)} 
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveNote(item.id)} className="font-bold bg-blue-600 text-[10px] uppercase text-white hover:bg-blue-700">Save Note</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="font-bold text-[10px] uppercase text-slate-400">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center pt-3 border-t border-slate-50 mt-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          Scanned: {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-4 rounded-full hover:bg-blue-100" 
                          onClick={() => { setEditingId(item.id); setNoteText(item.notes || ''); }}
                        >
                          {item.notes ? 'Edit Note ✏️' : '+ Add Private Note'}
                        </Button>
                      </div>
                    )}

                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}