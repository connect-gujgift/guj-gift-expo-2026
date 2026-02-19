'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

export default function VisitorLog() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    // Fetch leads and join with both exhibitors and visitors
    const { data, error } = await supabase
      .from('leads')
      .select(`
        id,
        created_at,
        notes,
        exhibitors (company_name, stall_number),
        visitors (full_name, company_name, phone)
      `)
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else setLogs(data || [])
    setLoading(false)
  }

  const exportLogs = () => {
    const dataToExport = logs.map(log => ({
      'Scan Time': new Date(log.created_at).toLocaleString(),
      'Exhibitor': log.exhibitors?.company_name,
      'Stall': log.exhibitors?.stall_number,
      'Visitor Name': log.visitors?.full_name,
      'Visitor Company': log.visitors?.company_name,
      'Visitor Phone': log.visitors?.phone,
      'Notes': log.notes || ''
    }))
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "GGE 2026 Scan Logs")
    XLSX.writeFile(workbook, `GGE_Visitor_Log_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const filteredLogs = logs.filter(log => 
    log.exhibitors?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.visitors?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest text-sm">Loading Live Scan Feed...</div>

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase text-[#0b3d41] tracking-tighter italic">Live Visitor Log</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time networking data</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold text-xs uppercase">Back to Admin</Button>
            <Button onClick={exportLogs} className="bg-green-600 hover:bg-green-700 font-bold text-xs uppercase px-6">Export All Scans</Button>
          </div>
        </div>

        {/* LOG TABLE */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-white border-b p-4">
            <input 
              type="text" 
              placeholder="Search by Exhibitor or Visitor Name..." 
              className="w-full p-3 bg-slate-50 rounded-xl text-sm outline-none border-0 font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardHeader>
          <CardContent className="p-0 overflow-auto max-h-[700px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-200 text-slate-600 font-black uppercase text-[9px] sticky top-0 z-10">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Exhibitor (Stall)</th>
                  <th className="p-4">Visitor Details</th>
                  <th className="p-4">Scan Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 bg-white transition-colors">
                    <td className="p-4 text-slate-400 font-medium">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4">
                      <p className="font-black text-[#0b3d41] uppercase">{log.exhibitors?.company_name}</p>
                      <p className="text-[9px] font-bold text-blue-600 uppercase">Stall: {log.exhibitors?.stall_number}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-slate-900 uppercase">{log.visitors?.full_name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{log.visitors?.company_name}</p>
                    </td>
                    <td className="p-4 italic text-slate-500">
                      {log.notes || '---'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}