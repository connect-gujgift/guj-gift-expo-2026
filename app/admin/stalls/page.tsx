'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SuperAdminCommandCenter() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stalls, setStalls] = useState<any[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form State
  const [newStall, setNewStall] = useState({
    stall_number: '',
    company_name: '',
    badge_limit: 2,
    is_paid: false
  })

  // 1. Authenticate Super Admin
  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Replace this with your exact admin email!
    if (!user || user.email !== 'maulikshah.13@gmail.com') {
      router.push('/login')
      return
    }
    
    fetchStalls()
  }

  // 2. Fetch All Stalls
  const fetchStalls = async () => {
    try {
      const { data, error } = await supabase
        .from('stalls')
        .select('*')
        .order('stall_number', { ascending: true })

      if (error) throw error
      setStalls(data || [])
    } catch (err: any) {
      console.error(err)
      setError('Failed to load stalls.')
    } finally {
      setLoading(false)
    }
  }

  // 3. Add a New Stall
  const handleAddStall = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const formattedStallNo = newStall.stall_number.trim().toUpperCase()

    try {
      const { error } = await supabase
        .from('stalls')
        .insert([{
          stall_number: formattedStallNo,
          company_name: newStall.company_name,
          badge_limit: newStall.badge_limit,
          is_paid: newStall.is_paid
        }])

      if (error) {
        if (error.code === '23505') throw new Error(`Stall ${formattedStallNo} already exists!`)
        throw error
      }

      setSuccess(`Stall ${formattedStallNo} successfully added!`)
      setNewStall({ stall_number: '', company_name: '', badge_limit: 2, is_paid: false })
      fetchStalls() // Refresh the list

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to add stall.')
    }
  }

  // 4. Toggle Payment Status
  const togglePaymentStatus = async (stallNumber: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('stalls')
        .update({ is_paid: !currentStatus })
        .eq('stall_number', stallNumber)

      if (error) throw error
      fetchStalls() // Refresh the list to show new status
    } catch (err: any) {
      alert("Failed to update payment status: " + err.message)
    }
  }

  // 5. Delete Stall
  const deleteStall = async (stallNumber: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete Stall ${stallNumber}? This will prevent exhibitors from generating passes.`)) return;

    try {
      const { error } = await supabase
        .from('stalls')
        .delete()
        .eq('stall_number', stallNumber)

      if (error) throw error
      fetchStalls()
    } catch (err: any) {
      alert("Failed to delete stall: " + err.message)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#0b3d41] font-black uppercase tracking-widest text-xs">Loading Command Center...</div>

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-900 pb-20">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 mt-2 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic text-[#0b3d41]">
            Super Admin
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Stall & Exhibitor Management</p>
        </div>
        
        <Button 
            variant="outline" 
            onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} 
            className="font-bold border-2 border-slate-300 text-xs bg-white text-slate-600 rounded-xl"
        >
            LOGOUT SECURELY
        </Button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Add Stall Form */}
        <div className="lg:col-span-1">
            <Card className="border-0 shadow-2xl overflow-hidden rounded-[2rem] bg-white sticky top-8">
                <CardHeader className="bg-[#0b3d41] text-white p-6 text-center">
                    <CardTitle className="text-xl font-black uppercase tracking-tight">Add New Stall</CardTitle>
                    <p className="text-[9px] font-bold text-teal-200 uppercase tracking-widest mt-1 opacity-80">Authorize exhibitor passes</p>
                </CardHeader>
                
                <CardContent className="p-6">
                    <form onSubmit={handleAddStall} className="space-y-5">
                        
                        {error && <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase leading-tight">{error}</div>}
                        {success && <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-[10px] font-black uppercase leading-tight">{success}</div>}

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Stall Number *</Label>
                            <Input 
                                required 
                                value={newStall.stall_number}
                                onChange={(e) => setNewStall({...newStall, stall_number: e.target.value})}
                                placeholder="e.g. A-101" 
                                className="bg-slate-50 border-slate-200 h-12 font-black uppercase text-[#0b3d41]" 
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Company Name *</Label>
                            <Input 
                                required 
                                value={newStall.company_name}
                                onChange={(e) => setNewStall({...newStall, company_name: e.target.value})}
                                placeholder="e.g. Shourya Stitch Pvt Ltd" 
                                className="bg-slate-50 border-slate-200 h-12 font-bold" 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pass Limit</Label>
                                <Input 
                                    required 
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={newStall.badge_limit}
                                    onChange={(e) => setNewStall({...newStall, badge_limit: parseInt(e.target.value)})}
                                    className="bg-slate-50 border-slate-200 h-12 font-black text-center text-lg text-[#ef6c33]" 
                                />
                            </div>

                            <div className="space-y-2 flex flex-col justify-end">
                                <Button 
                                    type="button"
                                    onClick={() => setNewStall({...newStall, is_paid: !newStall.is_paid})}
                                    className={`h-12 w-full font-black uppercase tracking-widest text-[10px] rounded-xl transition-all ${newStall.is_paid ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-500'}`}
                                >
                                    {newStall.is_paid ? '✅ PAID' : '⏳ PENDING'}
                                </Button>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full mt-4 bg-[#ef6c33] hover:bg-[#d45a27] h-14 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-100 transition-all text-white"
                        >
                            + Register Stall
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>

        {/* RIGHT COLUMN: Stalls List */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-[2rem] shadow-xl p-6 min-h-[500px]">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <h2 className="text-xl font-black uppercase tracking-tight text-[#0b3d41]">Active Stalls ({stalls.length})</h2>
                </div>

                {stalls.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
                        <span className="text-4xl opacity-50 mb-4 block">🎪</span>
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No stalls registered yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {stalls.map((stall) => (
                            <div key={stall.stall_number} className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                                
                                <div className="flex justify-between items-start mb-3">
                                    <div className="bg-orange-50 text-[#ef6c33] px-3 py-1 rounded-lg font-black text-lg uppercase tracking-tighter border border-orange-100">
                                        {stall.stall_number}
                                    </div>
                                    <button onClick={() => deleteStall(stall.stall_number)} className="text-slate-300 hover:text-red-500 transition-colors">
                                        🗑️
                                    </button>
                                </div>
                                
                                <h3 className="font-black text-[#0b3d41] uppercase text-sm leading-tight mb-4 pr-4">
                                    {stall.company_name}
                                </h3>
                                
                                <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-auto">
                                    <div className="text-center">
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Passes</p>
                                        <p className="text-sm font-black text-[#0b3d41]">{stall.badge_limit}</p>
                                    </div>
                                    
                                    <Button 
                                        size="sm"
                                        onClick={() => togglePaymentStatus(stall.stall_number, stall.is_paid)}
                                        className={`h-8 px-4 font-black uppercase tracking-widest text-[9px] rounded-lg transition-all ${stall.is_paid ? 'bg-green-100 hover:bg-green-200 text-green-700' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}
                                    >
                                        {stall.is_paid ? '✅ PAID' : '⚠️ PENDING'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  )
}