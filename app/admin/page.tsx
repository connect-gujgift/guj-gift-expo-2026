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
  const [users, setUsers] = useState<any[]>([])
  const [visitorCount, setVisitorCount] = useState(0)
  
  // Tab states for both the Form and the Directory
  const [activeTab, setActiveTab] = useState<'exhibitors' | 'staff'>('exhibitors')
  const [formType, setFormType] = useState<'exhibitor' | 'staff'>('exhibitor')

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
    const { data: userData } = await supabase
        .from('exhibitors')
        .select('*')
        .order('created_at', { ascending: false })
    setUsers(userData || [])

    const { count: visCount } = await supabase
        .from('visitors')
        .select('*', { count: 'exact', head: true })
    setVisitorCount(visCount || 0)
  }

  const deleteUser = async (id: string) => {
    if(!confirm("Delete this profile permanently?")) return;
    await supabase.from('exhibitors').delete().eq('id', id)
    fetchDashboardData()
  }

  const exportList = () => {
    const filtered = users.filter(u => activeTab === 'staff' ? u.is_staff : !u.is_staff)
    if (filtered.length === 0) return alert("No data to export.")
    
    const dataToExport = filtered.map(u => ({
      'Name': u.full_name || 'N/A',
      'Email': u.email || 'N/A',
      'Company/Role': u.company_name || (u.is_staff ? 'Registration Staff' : 'N/A'),
      'Stall': u.stall_number || 'N/A'
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab.toUpperCase())
    XLSX.writeFile(workbook, `GGE_2026_${activeTab}_List.xlsx`)
  }

  if (loading) return <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest text-sm">Verifying Admin...</div>

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-6 rounded-2xl shadow-sm gap-4 border-b-4 border-[#0b3d41]">
          <div>
            <h1 className="text-3xl font-black uppercase text-[#0b3d41] tracking-tighter italic leading-none">Command Center</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Super Admin Access</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* NEW: Manage Stalls Button */}
            <Button onClick={() => router.push('/admin/stalls')} className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] uppercase px-4 rounded-xl shadow-md border-2 border-teal-500">Manage Stalls 🎪</Button>
            
            <Button onClick={() => router.push('/admin/registration-desk')} className="bg-blue-600 hover:bg-blue-700 font-bold text-[10px] uppercase px-4 rounded-xl shadow-md">Desk 🖨️</Button>
            <Button onClick={() => router.push('/admin/analytics')} className="bg-[#ef6c33] hover:bg-[#d45a27] font-bold text-[10px] uppercase px-4 rounded-xl shadow-md">Analytics 📈</Button>
            <Button onClick={() => router.push('/admin/visitor-log')} className="bg-[#0b3d41] hover:bg-slate-800 font-bold text-[10px] uppercase px-4 rounded-xl">Logs 📊</Button>
            <Button variant="outline" className="font-bold border-2 text-[10px] uppercase rounded-xl" onClick={() => router.push('/dashboard')}>Exit</Button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-[#0b3d41] text-white border-0 shadow-md">
                <CardContent className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 text-blue-200">Exhibitors</p>
                    <p className="text-4xl font-black tracking-tighter mt-1">{users.filter(u => !u.is_staff).length}</p>
                </CardContent>
            </Card>
            <Card className="bg-blue-500 text-white border-0 shadow-md">
                <CardContent className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Staff Members</p>
                    <p className="text-4xl font-black tracking-tighter mt-1">{users.filter(u => u.is_staff).length}</p>
                </CardContent>
            </Card>
            <Card className="bg-[#ef6c33] text-white border-0 shadow-md col-span-2">
                <CardContent className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 text-orange-100">Total Visitors</p>
                    <p className="text-4xl font-black tracking-tighter mt-1">{visitorCount}</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          
          {/* DYNAMIC ONBOARDING FORM */}
          <Card className="md:col-span-5 border-0 shadow-md h-fit overflow-hidden">
            <div className="flex bg-slate-900 text-white">
              <button 
                onClick={() => setFormType('exhibitor')}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${formType === 'exhibitor' ? 'bg-[#ef6c33]' : 'hover:bg-slate-800'}`}
              >
                + Add Exhibitor
              </button>
              <button 
                onClick={() => setFormType('staff')}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${formType === 'staff' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
              >
                + Add Staff
              </button>
            </div>
            
            <CardContent className="p-6">
              <form action={formAction} className="space-y-4">
                
                {/* Hidden input to tell the server action which role we are creating */}
                <input type="hidden" name="is_staff" value={formType === 'staff' ? 'true' : 'false'} />

                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Full Name</Label>
                  <Input name="full_name" placeholder="Person's Name" className="font-medium bg-slate-50 border-0" required />
                </div>

                {/* Conditional Fields based on selection */}
                {formType === 'exhibitor' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="font-bold text-[10px] uppercase text-slate-400">Company Name</Label>
                      <Input name="company_name" placeholder="Firm Name" className="font-medium bg-slate-50 border-0" required />
                    </div>
                    <div className="space-y-1">
                      <Label className="font-bold text-[10px] uppercase text-slate-400">Stall Number</Label>
                      <Input name="stall_number" placeholder="e.g. A-101" className="font-medium bg-slate-50 border-0" required />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label className="font-bold text-[10px] uppercase text-slate-400">Assigned Role / Dept</Label>
                    <Input name="company_name" placeholder="e.g. Registration Desk" className="font-medium bg-slate-50 border-0" required />
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Login Email</Label>
                  <Input name="email" type="email" placeholder="user@email.com" className="font-medium bg-slate-50 border-0" required />
                </div>
                
                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Password</Label>
                  <Input name="password" type="text" defaultValue="Expo@2026" className="font-medium bg-slate-50 border-0" required />
                </div>

                <Button 
                  type="submit" 
                  className={`w-full font-black uppercase tracking-widest mt-4 py-7 rounded-2xl shadow-lg ${formType === 'staff' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-[#ef6c33] hover:bg-[#d45a27] shadow-orange-100'}`}
                >
                  Create {formType === 'staff' ? 'Staff' : 'Exhibitor'} Account
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* TABS DIRECTORY */}
          <Card className="md:col-span-7 border-0 shadow-md flex flex-col h-[650px]">
            <CardHeader className="bg-white border-b py-2 px-6">
              <div className="flex justify-between items-center">
                <div className="flex border-b">
                   <button 
                     onClick={() => setActiveTab('exhibitors')}
                     className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'exhibitors' ? 'border-[#ef6c33] text-[#ef6c33]' : 'border-transparent text-slate-400'}`}
                   >
                     Exhibitors ({users.filter(u => !u.is_staff).length})
                   </button>
                   <button 
                     onClick={() => setActiveTab('staff')}
                     className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'staff' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400'}`}
                   >
                     Staff ({users.filter(u => u.is_staff).length})
                   </button>
                </div>
                <Button size="sm" variant="ghost" className="font-bold text-[10px] uppercase text-slate-400" onClick={exportList}>Export Excel</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto bg-slate-50">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-200 text-slate-600 font-black uppercase text-[9px] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 px-6">{activeTab === 'staff' ? 'Staff Name' : 'Exhibitor Name'}</th>
                    <th className="p-4 hidden sm:table-cell">{activeTab === 'staff' ? 'Role' : 'Stall'}</th>
                    <th className="p-4 text-right px-6">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.filter(u => activeTab === 'staff' ? u.is_staff : !u.is_staff).map((u) => (
                    <tr key={u.id} className="hover:bg-white transition-colors bg-white/50">
                      <td className="p-4 px-6">
                        <p className="font-black text-slate-900 uppercase leading-none">{u.full_name || 'No Name'}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{u.email}</p>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${activeTab === 'staff' ? 'bg-blue-100 text-blue-600' : 'bg-[#0b3d41] text-white'}`}>
                          {activeTab === 'staff' ? (u.company_name || 'Registration Team') : (u.stall_number || 'TBD')}
                        </span>
                      </td>
                      <td className="p-4 text-right px-6">
                        <Button variant="destructive" size="sm" onClick={() => deleteUser(u.id)} className="h-7 text-[9px] font-black px-3 rounded-lg">REMOVE</Button>
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