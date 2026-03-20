'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QRCodeSVG } from 'qrcode.react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function RetrievePassPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Hub State
  const [passData, setPassData] = useState<any>(null)
  const [passType, setPassType] = useState<'Visitor' | 'Staff' | null>(null)
  const [activeTab, setActiveTab] = useState<'pass' | 'scan' | 'suppliers'>('pass')
  
  // Scanner & Data State
  const [scanResult, setScanResult] = useState<{ status: 'success' | 'error' | 'duplicate', message: string } | null>(null)
  const [savedSuppliers, setSavedSuppliers] = useState<any[]>([])
  
  // Notes State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [tempNote, setTempNote] = useState('')

  const handleRetrieve = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPassData(null)
    setPassType(null)

    const searchPhone = phone.trim()

    // 1. Check if Staff first
    const { data: staffData } = await supabase.from('exhibitors').select('*').eq('phone', searchPhone).eq('is_staff', true).single()
    if (staffData) {
      setPassData(staffData)
      setPassType('Staff')
      setLoading(false)
      return
    }

    // 2. Check if Visitor
    const { data: visitorData } = await supabase.from('visitors').select('*').eq('phone', searchPhone).single()
    if (visitorData) {
      setPassData(visitorData)
      setPassType('Visitor')
      fetchSavedSuppliers(visitorData.id)
      setLoading(false)
      return
    }

    setError('No registration found for this phone number. Please check the number or register at the desk.')
    setLoading(false)
  }

  const fetchSavedSuppliers = async (visitorId: string) => {
    const { data } = await supabase
      .from('visitor_scans')
      .select(`
        id,
        created_at,
        notes,
        exhibitors (
          company_name,
          full_name,
          phone,
          stall_number,
          stall_tier
        )
      `)
      .eq('visitor_id', visitorId)
      .order('created_at', { ascending: false })
    
    if (data) setSavedSuppliers(data)
  }

  // Camera Scanner Logic for Visitors
  useEffect(() => {
    if (activeTab !== 'scan' || !passData || passType !== 'Visitor') return

    const scanner = new Html5QrcodeScanner("visitor-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false)
    
    scanner.render(async (decodedText) => {
      scanner.pause(true)
      
      // Look for Exhibitor Staff Badges
      if (!decodedText.startsWith('GGE2026-STAFF-')) {
        setScanResult({ status: 'error', message: 'Invalid QR. Scan an Exhibitor Badge.' })
        setTimeout(() => { setScanResult(null); scanner.resume() }, 3000)
        return
      }

      const exhibitorId = decodedText.replace('GGE2026-STAFF-', '')

      const { error } = await supabase.from('visitor_scans').insert([{
        visitor_id: passData.id,
        exhibitor_id: exhibitorId
      }])

      if (error) {
        if (error.code === '23505') {
           setScanResult({ status: 'duplicate', message: 'Stall Already Saved!' })
        } else {
           setScanResult({ status: 'error', message: 'Failed to save stall.' })
        }
      } else {
        setScanResult({ status: 'success', message: '✅ Exhibitor Saved to Diary!' })
        fetchSavedSuppliers(passData.id) // Refresh list
      }

      setTimeout(() => { setScanResult(null); scanner.resume() }, 2500)
    }, () => {})

    return () => { scanner.clear().catch(e => console.error(e)) }
  }, [activeTab])

  // Save Note Function
  const saveNote = async (scanId: string) => {
    const { error } = await supabase
      .from('visitor_scans')
      .update({ notes: tempNote })
      .eq('id', scanId)

    if (!error) {
      setSavedSuppliers(prev => prev.map(s => s.id === scanId ? { ...s, notes: tempNote } : s))
      setEditingNoteId(null)
    } else {
      alert("Could not save note: " + error.message)
    }
  }

  // Export CSV Function
  const exportSuppliersCSV = () => {
    if (savedSuppliers.length === 0) return alert("No suppliers saved yet.")
    const headers = ["Scan Date", "Company", "Contact Person", "Phone", "Stall Number", "My Notes"]
    
    const rows = savedSuppliers.map(scan => [
      new Date(scan.created_at).toLocaleDateString(),
      `"${scan.exhibitors?.company_name || ''}"`,
      `"${scan.exhibitors?.full_name || ''}"`,
      `"${scan.exhibitors?.phone || ''}"`,
      `"${(scan.exhibitors?.stall_number || []).join(' & ')}"`,
      `"${scan.notes || ''}"` // Wrapped in quotes to prevent commas in notes from breaking the CSV
    ])
    
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `My_GGE2026_Suppliers.csv`
    link.click()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900 pb-20 selection:bg-[#0b3d41] selection:text-white">
      
      {!passData && (
        <div className="w-full max-w-sm mb-6 flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.push('/')} className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-[#0b3d41]">
            ← Back to Home
          </Button>
        </div>
      )}

      {/* LOGIN VIEW */}
      {!passData ? (
        <Card className="w-full max-w-sm border-0 shadow-2xl overflow-hidden rounded-[2.5rem] bg-white animate-in fade-in zoom-in duration-300">
          <CardHeader className="bg-[#0b3d41] text-white p-8 text-center border-b-4 border-orange-500">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">🎟️</div>
            <CardTitle className="text-2xl font-black uppercase tracking-tight italic">Retrieve Pass</CardTitle>
            <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest mt-2">Guj Gift Expo 2026</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleRetrieve} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                  Enter your registered phone number to fetch your pass and B2B tools.
                </p>
              </div>
              {error && <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest text-center">{error}</div>}
              <div className="space-y-2">
                <Input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="Registered Phone (+91)" className="bg-slate-50 border-2 border-slate-100 h-14 font-bold text-lg text-center focus-visible:ring-orange-500 rounded-xl" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#0b3d41] hover:bg-slate-800 h-14 font-black uppercase tracking-widest rounded-xl text-white shadow-xl mt-4">
                {loading ? 'Searching...' : 'Access My Hub →'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        
        /* HUB VIEW */
        <div className="w-full max-w-md animate-in zoom-in duration-300">
          
          <div className="flex justify-between items-center mb-6 px-2">
            <div>
              <h2 className="text-xl font-black uppercase italic text-[#0b3d41] leading-none">{passData.full_name}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{passType} Hub</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => {setPassData(null); setPhone('');}} className="text-[9px] font-black uppercase tracking-widest text-slate-400 h-8 rounded-lg">
              Sign Out
            </Button>
          </div>

          {/* VISITOR ONLY TABS */}
          {passType === 'Visitor' && (
            <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 mb-6">
              <button onClick={() => setActiveTab('pass')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pass' ? 'bg-[#0b3d41] text-white shadow-md' : 'text-slate-400 hover:text-slate-800'}`}>My Pass</button>
              <button onClick={() => setActiveTab('scan')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'scan' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-orange-500'}`}>Scan Stalls</button>
              <button onClick={() => setActiveTab('suppliers')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'suppliers' ? 'bg-[#0b3d41] text-white shadow-md' : 'text-slate-400 hover:text-slate-800'}`}>Diary ({savedSuppliers.length})</button>
            </div>
          )}

          {/* TAB 1: THE QR PASS (For both Staff and Visitors) */}
          {activeTab === 'pass' && (
            <div className={`w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 ${passType === 'Staff' ? 'border-amber-500' : 'border-[#0b3d41]'}`}>
              <div className={`${passType === 'Staff' ? 'bg-amber-500' : 'bg-[#0b3d41]'} text-white text-center py-6 px-4`}>
                 <h2 className="text-2xl font-black uppercase tracking-widest italic">{passType} Pass</h2>
                 <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1">Guj Gift Expo 2026</p>
              </div>
              <div className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="space-y-1 w-full border-b border-slate-100 pb-6">
                  <p className="text-2xl font-black text-slate-900 uppercase leading-none">{passData.full_name}</p>
                  <p className="text-sm font-bold text-slate-500 mt-1 uppercase">{passData.designation || passData.company_name}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-xl border-2 border-slate-100">
                  <QRCodeSVG value={passType === 'Staff' ? `GGE2026-STAFF-${passData.id}` : `GGE2026-VISITOR-${passData.id}`} size={200} level="H" includeMargin={false} fgColor="#0f172a" />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">Screenshot & Show at Entry</p>
              </div>
            </div>
          )}

          {/* TAB 2: VISITOR SCANNER */}
          {activeTab === 'scan' && passType === 'Visitor' && (
            <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl border-4 border-slate-800 text-center text-white">
              <h3 className="text-xl font-black uppercase italic mb-2 tracking-widest">Collect Supplier</h3>
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-6">Scan an Exhibitor's QR Badge</p>
              
              <div className="w-full bg-black rounded-3xl overflow-hidden border-2 border-slate-700">
                <div id="visitor-reader" className="w-full"></div>
              </div>

              {scanResult && (
                <div className={`mt-6 p-4 rounded-2xl text-center border-2 shadow-lg animate-in fade-in ${scanResult.status === 'success' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : scanResult.status === 'duplicate' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-red-500/20 border-red-500 text-red-400'}`}>
                   <p className="font-black uppercase tracking-widest text-sm">{scanResult.message}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED SUPPLIERS (DIARY WITH NOTES) */}
          {activeTab === 'suppliers' && passType === 'Visitor' && (
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col h-[550px]">
              
              {/* THE FIXED DIARY HEADER & EXPORT BUTTON */}
              <div className="bg-[#0b3d41] p-6 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-widest leading-none">My Diary</h3>
                  <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest mt-1">Saved Exhibitors</p>
                </div>
                <Button onClick={exportSuppliersCSV} className="bg-white hover:bg-slate-100 text-[#0b3d41] text-[9px] font-black uppercase tracking-widest h-10 px-4 rounded-xl shadow-sm border-0">
                  📥 Export
                </Button>
              </div>
              
              <div className="flex-1 overflow-auto p-0">
                {savedSuppliers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <span className="text-4xl mb-4 opacity-50">📱</span>
                    <p className="text-xs font-black uppercase tracking-widest">No suppliers saved yet.</p>
                    <p className="text-[10px] font-bold mt-2">Go to 'Scan Stalls' to build your network.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {savedSuppliers.map((scan) => (
                      <div key={scan.id} className="p-5 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-black text-slate-900 uppercase text-sm leading-tight">{scan.exhibitors?.company_name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Stall: {(scan.exhibitors?.stall_number || []).join(' & ')}</p>
                          </div>
                          <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border border-orange-100">
                            {scan.exhibitors?.stall_tier}
                          </span>
                        </div>
                        
                        <div className="pt-2 flex justify-between">
                           <p className="text-[10px] font-bold text-slate-500">{scan.exhibitors?.full_name}</p>
                           <p className="text-[10px] font-bold text-[#0b3d41]">{scan.exhibitors?.phone}</p>
                        </div>

                        {/* NOTES UI */}
                        {editingNoteId === scan.id ? (
                          <div className="mt-3 flex gap-2 animate-in fade-in">
                            <Input 
                              value={tempNote} 
                              onChange={e => setTempNote(e.target.value)} 
                              placeholder="Write a note about this supplier..." 
                              className="h-10 text-xs font-medium border-slate-200 bg-white"
                              autoFocus
                            />
                            <Button onClick={() => saveNote(scan.id)} className="h-10 px-4 bg-[#0b3d41] hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest">
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100 flex justify-between items-center group cursor-pointer" onClick={() => { setEditingNoteId(scan.id); setTempNote(scan.notes || ''); }}>
                            <p className={`text-xs ${scan.notes ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                              {scan.notes || "Tap to add a note..."}
                            </p>
                            <span className="text-slate-300 group-hover:text-orange-500 transition-colors ml-2">✎</span>
                          </div>
                        )}
                        
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}