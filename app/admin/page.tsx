'use client'

import { useEffect, useState } from 'react'
import { useFormState } from 'react-dom'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createExhibitorAction } from './actions'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

const initialState = { success: false, message: '' }

export default function AdminPanel() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [exhibitors, setExhibitors] = useState<any[]>([])
  const [visitorCount, setVisitorCount] = useState(0)

  const [state, formAction] = useFormState(createExhibitorAction, initialState)

  useEffect(() => { checkAdmin() }, [])

  useEffect(() => {
    if (state.message) {
      alert(state.message)
      if (state.success) fetchDashboardData()
    }
  }, [state])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      fetchDashboardData()
      setLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    const { data: exData } = await supabase.from('exhibitors').select('*').order('created_at', { ascending: false })
    setExhibitors(exData || [])

    const { count: visCount } = await supabase.from('visitors').select('*', { count: 'exact', head: true })
    setVisitorCount(visCount || 0)
  }

  const deleteExhibitor = async (id: string) => {
    if(!confirm("Delete this profile?")) return;
    await supabase.from('exhibitors').delete().eq('id', id)
    fetchDashboardData()
  }

  const exportMasterList = () => {
    if (exhibitors.length === 0) return alert("No exhibitors to export.")
    const dataToExport = exhibitors.map(ex => ({
      'Registration Date': new Date(ex.created_at).toLocaleDateString(),
      'Exhibitor Name': ex.full_name || 'N/A',
      'Company Name': ex.company_name,
      'Stall Number': ex.stall_number,
      'Category': ex.category,
      'Contact Email': ex.email || 'N/A'
    }))
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Master List")
    XLSX.writeFile(workbook, `GGE_Exhibitors_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (loading) return <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest text-sm">Verifying Access...</div>

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase text-[#0b3d41] tracking-tighter italic">Command Center</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Super Admin Access</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* NEW ANALYTICS & LOG BUTTONS */}
            <Button onClick={() => router.push('/admin/analytics')} className="bg-[#ef6c33] hover:bg-[#d45a27] font-black text-[10px] uppercase px-4 rounded-xl shadow-md">
                Scan Analytics 📈
            </Button>
            <Button onClick={() => router.push('/admin/visitor-log')} className="bg-[#0b3d41] hover:bg-slate-800 font-black text-[10px] uppercase px-4 rounded-xl">
                Live Scan Logs 📊
            </Button>
            <Button variant="outline" className="font-bold border-2 text-[10px] uppercase rounded-xl" onClick={() => router.push('/dashboard')}>Exit</Button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-[#0b3d41] text-white border-0 shadow-md">
                <CardContent className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 text-blue-200">Total Exhibitors</p>
                    <p className="text-4xl font-black tracking-tighter mt-1">{exhibitors.length}</p>
                </CardContent>
            </Card>
            <Card className="bg-[#ef6c33] text-white border-0 shadow-md">
                <CardContent className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 text-orange-100">Registered Visitors</p>
                    <p className="text-4xl font-black tracking-tighter mt-1">{visitorCount}</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          <Card className="md:col-span-5 border-0 shadow-md h-fit">
            <CardHeader className="bg-slate-900 text-white rounded-t-xl">
              <CardTitle className="uppercase italic tracking-tight text-lg">Onboard Exhibitor</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Exhibitor Person Name</Label>
                  <Input name="full_name" placeholder="Full name of contact person" className="font-medium bg-slate-50 border-0" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Company Name</Label>
                    <Input name="company_name" placeholder="Firm Name" className="font-medium bg-slate-50 border-0" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Stall Number</Label>
                    <Input name="stall_number" placeholder="A-101" className="font-medium bg-slate-50 border-0" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Category</Label>
                  <Input name="category" placeholder="Product category" className="font-medium bg-slate-50 border-0" required />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Login Email</Label>
                  <Input name="email" type="email" placeholder="official@company.com" className="font-medium bg-slate-50 border-0" required />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Password</Label>
                  <Input name="password" type="text" defaultValue="Expo@2026" className="font-medium bg-slate-50 border-0" required />
                </div>
                <Button type="submit" className="w-full bg-[#ef6c33] hover:bg-[#d45a27] font-black uppercase tracking-widest mt-4 py-7 rounded-2xl shadow-lg shadow-orange-100">
                  + Create Account
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="md:col-span-7 border-0 shadow-md flex flex-col h-[650px]">
            <CardHeader className="bg-white border-b py-4 px-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-800">Directory</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="font-bold text-[10px] uppercase" onClick={fetchDashboardData}>Refresh</Button>
                  <Button size="sm" className="bg-[#0b3d41] hover:bg-slate-800 font-bold text-[10px] uppercase px-4" onClick={exportMasterList}>Export</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto bg-slate-50">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-200 text-slate-600 font-black uppercase text-[9px] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 px-6">Name & Company</th>
                    <th className="p-4 hidden sm:table-cell">Stall Info</th>
                    <th className="p-4 text-right px-6">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {exhibitors.map((ex) => (
                    <tr key={ex.id} className="hover:bg-white transition-colors">
                      <td className="p-4 px-6">
                        <p className="font-black text-slate-900 uppercase">{ex.full_name || 'Individual'}</p>
                        <p className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">{ex.company_name}</p>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="bg-[#0b3d41] text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter">STALL: {ex.stall_number}</span>
                      </td>
                      <td className="p-4 text-right px-6">
                        <Button variant="destructive" size="sm" onClick={() => deleteExhibitor(ex.id)} className="h-7 text-[9px] font-black px-3 rounded-lg">REMOVE</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}