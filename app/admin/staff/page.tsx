'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function StaffManagementPage() {
  const router = useRouter()
  const [staffList, setStaffList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form State
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('Event Management')
  const [role, setRole] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    checkAdmin()
    fetchStaff()
  }, [])

  // Security Check
  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'maulikshah.13@gmail.com') {
      router.push('/login')
    } else {
      setLoading(false)
    }
  }

  // Fetch only users flagged as staff
  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('exhibitors')
      .select('*')
      .eq('is_staff', true)
      .order('created_at', { ascending: false })
    
    if (!error) setStaffList(data || [])
  }

  // Register a new staff member
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const { error } = await supabase
      .from('exhibitors')
      .insert([{ 
        full_name: fullName, 
        company_name: department, 
        designation: role,
        phone: phone,
        email: email,
        is_staff: true,           
        stall_number: 'STAFF',
        payment_status: 'Fully Paid'
      }])

    if (error) {
      alert(error.message)
    } else {
      setFullName(''); setRole(''); setPhone(''); setEmail('');
      fetchStaff()
    }
    setSaving(false)
  }

  // Remove a staff member
  const deleteStaff = async (id: string, name: string) => {
    if (!confirm(`Revoke credentials and remove ${name} from the staff registry?`)) return
    const { error } = await supabase.from('exhibitors').delete().eq('id', id)
    if (!error) fetchStaff()
  }

  if (loading) return <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest text-sm bg-slate-50 min-h-screen">Verifying Clearance...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-6 rounded-2xl shadow-sm gap-4 border-b-4 border-amber-500">
          <div>
            <h1 className="text-3xl font-black uppercase text-amber-600 italic leading-none">Staff Dept.</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Internal Team Management</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold border-2 text-[10px] uppercase rounded-xl px-6">
            ← Back to Hub
          </Button>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          
          {/* REGISTRATION FORM */}
          <Card className="md:col-span-4 border-0 shadow-md rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-amber-500 text-white p-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <span>👷</span> Issue Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddStaff} className="space-y-4">
                
                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Full Name</Label>
                  <Input placeholder="E.g. John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="font-black bg-slate-50 border-0 h-12 rounded-xl" />
                </div>

                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Department / Agency</Label>
                  <Input placeholder="E.g. Security, Media, Core Team" value={department} onChange={(e) => setDepartment(e.target.value)} required className="bg-slate-50 border-0 font-bold h-12 rounded-xl" />
                </div>
                
                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Role / Designation</Label>
                  <Input placeholder="E.g. Gate Manager" value={role} onChange={(e) => setRole(e.target.value)} required className="bg-slate-50 border-0 font-bold h-12 rounded-xl" />
                </div>

                <div className="space-y-1">
                  <Label className="font-bold text-[10px] uppercase text-slate-400">Phone Number</Label>
                  <Input type="tel" placeholder="+91..." value={phone} onChange={(e) => setPhone(e.target.value)} required className="font-bold bg-slate-50 border-0 h-12 rounded-xl" />
                </div>

                <Button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-slate-800 h-14 font-black uppercase text-white rounded-2xl shadow-lg mt-4 transition-all">
                  {saving ? 'Registering...' : 'Add Team Member'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* ACTIVE STAFF LIST */}
          <Card className="md:col-span-8 border-0 shadow-md flex flex-col h-[700px] rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-800 text-amber-500 border-b p-6">
               <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                 <span>📋</span> Active Roster
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto bg-slate-50">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-200 text-slate-600 font-black uppercase text-[9px] sticky top-0 z-10">
                  <tr>
                    <th className="p-4 px-6">Personnel</th>
                    <th className="p-4">Assignment</th>
                    <th className="p-4 text-right px-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {staffList.map((s) => (
                    <tr key={s.id} className="hover:bg-amber-50 transition-colors">
                      <td className="p-4 px-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-black text-lg border-2 border-amber-200">
                          👷
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase text-sm">{s.full_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{s.phone}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-amber-600 uppercase text-xs">{s.company_name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{s.designation || 'Staff'}</p>
                      </td>
                      <td className="p-4 text-right px-6">
                        <Button variant="ghost" size="sm" onClick={() => deleteStaff(s.id, s.full_name)} className="h-8 text-slate-400 hover:text-red-600 font-black text-[9px] uppercase hover:bg-red-50 rounded-lg">
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {staffList.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest italic bg-slate-50">
                        No active staff members registered.
                      </td>
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