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
import * as XLSX from 'xlsx' // Needed for Master Export

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
    // Fetch Exhibitors
    const { data: exData } = await supabase.from('exhibitors').select('*').order('created_at', { ascending: false })
    setExhibitors(exData || [])

    // Fetch Total Visitors (Count Only for speed)
    const { count: visCount } = await supabase.from('visitors').select('*', { count: 'exact', head: true })
    setVisitorCount(visCount || 0)
  }

  const deleteExhibitor = async (id: string) => {
    if(!confirm("Delete this profile? (Warning: This action is permanent)")) return;
    await supabase.from('exhibitors').delete().eq('id', id)
    fetchDashboardData()
  }

  // Master Export Function
  const exportMasterList = () => {
    if (exhibitors.length === 0) return alert("No exhibitors to export.")
    const dataToExport = exhibitors.map(ex => ({
      'Registration Date': new Date(ex.created_at).toLocaleDateString(),
      'Company Name': ex.company_name,
      'Stall Number': ex.stall_number,
      'Category': ex.category,
      'Contact Email': ex.email || 'N/A'
    }))
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Master Exhibitor List")
    XLSX.writeFile(workbook, `GGE_Exhibitor_Master_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (loading) return <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest">Verifying Admin Access...</div>

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase text-slate-900 tracking-tighter">Command Center</h1>
            <div className="flex items-center gap-2 mt-1">
             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Super Admin Access</p>
            </div>
          </div>
          <Button variant="outline" className="font-bold border-2" onClick={() => router.push('/dashboard')}>EXIT TO DASHBOARD</Button>
        </div>

        {/* LIVE STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-blue-600 text-white border-0 shadow-md">
                <CardContent className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Exhibitors</p>
                    <p className="text-4xl font-black tracking-tighter mt-1">{exhibitors.length}</p>
                </CardContent>
            </Card>
            <Card className="bg-orange-500 text-white border-0 shadow-md">
                <CardContent className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Registered Visitors</p>
                    <p className="text-4xl font-black tracking-tighter mt-1">{visitorCount}</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          
          {/* CREATE FORM (Takes up 5 columns on desktop) */}
          <Card className="md:col-span-5 border-0 shadow-md h-fit">
            <CardHeader className="bg-slate-900 text-white rounded-t-xl">
              <CardTitle className="uppercase italic tracking-tight">Onboard Exhibitor</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form action={formAction} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase text-slate-500">Company Name</Label>
                    <Input name="company_name" placeholder="e.g. Shourya Stitch" className="font-medium" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase text-slate-500">Stall Number</Label>
                    <Input name="stall_number" placeholder="e.g. A-101" className="font-medium" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase text-slate-500">Category</Label>
                  <Input name="category" placeholder="e.g. Luggage, Bags..." className="font-medium" required />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase text-slate-500">Login Email</Label>
                  <Input name="email" type="email" placeholder="official@company.com" className="font-medium" required />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase text-slate-500">Password</Label>
                  <Input name="password" type="text" defaultValue="Expo@2026" className="font-medium" required />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest mt-4 py-6">
                  + Create Account
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* LIST & EXPORT (Takes up 7 columns on desktop) */}
          <Card className="md:col-span-7 border-0 shadow-md flex flex-col h-[600px]">
            <CardHeader className="bg-white border-b py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-800">Master List</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="font-bold text-xs" onClick={fetchDashboardData}>Refresh</Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 font-bold text-xs" onClick={exportMasterList}>
                    Download Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto bg-slate-50">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-200 text-slate-600 font-black uppercase text-[10px] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4">Company Details</th>
                    <th className="p-4 hidden sm:table-cell">Category</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {exhibitors.map((ex) => (
                    <tr key={ex.id} className="hover:bg-white transition-colors">
                      <td className="p-4">
                        <p className="font-black text-slate-900 uppercase">{ex.company_name}</p>
                        <p className="text-xs font-bold text-blue-600 uppercase mt-1">Stall: {ex.stall_number}</p>
                      </td>
                      <td className="p-4 hidden sm:table-cell text-slate-600 font-medium text-xs">
                        {ex.category}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="destructive" size="sm" onClick={() => deleteExhibitor(ex.id)} className="h-7 text-[10px] font-bold px-3">
                          REMOVE
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {exhibitors.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-10 text-center text-slate-400 font-bold uppercase text-xs">No Exhibitors Found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}