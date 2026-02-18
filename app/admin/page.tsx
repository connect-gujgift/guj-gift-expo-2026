'use client'

import { useEffect, useState } from 'react'
import { useFormState } from 'react-dom'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createExhibitorAction } from './actions' // Imports the file we made in Step 2

const initialState = {
  success: false,
  message: '',
}

export default function AdminPanel() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [exhibitors, setExhibitors] = useState<any[]>([])

  // Server Action Hook
  const [state, formAction] = useFormState(createExhibitorAction, initialState)

  useEffect(() => {
    checkAdmin()
  }, [])

  useEffect(() => {
    if (state.message) {
      alert(state.message)
      if (state.success) fetchExhibitors() // Refresh list on success
    }
  }, [state])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      // You can add logic here to check if email == 'admin@yourdomain.com'
      fetchExhibitors()
      setLoading(false)
    }
  }

  const fetchExhibitors = async () => {
    const { data } = await supabase.from('exhibitors').select('*').order('created_at', { ascending: false })
    setExhibitors(data || [])
  }

  const deleteExhibitor = async (id: string) => {
    if(!confirm("Delete this exhibitor profile? (Note: Login must be deleted in Supabase Dashboard)")) return;
    await supabase.from('exhibitors').delete().eq('id', id)
    fetchExhibitors()
  }

  if (loading) return <div className="p-10 text-center font-bold">Loading Admin Panel...</div>

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-black uppercase text-slate-900">Super Admin</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Guj Gift Expo 2026</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to App</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* CREATE FORM */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-blue-600 text-white rounded-t-xl">
              <CardTitle className="uppercase italic tracking-tight">Create Exhibitor</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form action={formAction} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input name="company_name" placeholder="Shourya Stitch" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Stall Number</Label>
                    <Input name="stall_number" placeholder="A-101" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input name="category" placeholder="Luggage, Bags..." required />
                </div>

                <div className="space-y-2">
                  <Label>Login Email</Label>
                  <Input name="email" type="email" placeholder="official@company.com" required />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input name="password" type="text" defaultValue="Expo@2026" required />
                </div>

                <Button type="submit" className="w-full bg-slate-900 font-bold uppercase mt-4">
                  Create Account
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* LIST */}
          <Card className="border-0 shadow-md h-[500px] flex flex-col">
            <CardHeader className="bg-white border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg uppercase text-slate-800">Exhibitors ({exhibitors.length})</CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchExhibitors}>Refresh</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] sticky top-0">
                  <tr>
                    <th className="p-3">Company</th>
                    <th className="p-3">Stall</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {exhibitors.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{ex.company_name}</td>
                      <td className="p-3 text-slate-500">{ex.stall_number}</td>
                      <td className="p-3">
                        <button onClick={() => deleteExhibitor(ex.id)} className="text-red-500 font-bold text-[10px] uppercase">
                          Remove
                        </button>
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