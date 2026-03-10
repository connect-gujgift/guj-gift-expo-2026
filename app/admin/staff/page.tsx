'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { QRCodeSVG } from 'qrcode.react'

export default function StaffDeptPage() {
  const router = useRouter()
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Registration Modal State
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newStaff, setNewStaff] = useState({ full_name: '', phone: '', role: 'Event Volunteer' })

  // Digital Pass Modal State
  const [selectedStaff, setSelectedStaff] = useState<any>(null)

  useEffect(() => {
    checkAdmin()
    fetchStaff()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const allowedEmails = ['maulikshah.13@gmail.com', 'connect@shreebalajievent.com']
    
    if (!user || !allowedEmails.includes(user.email || '')) {
      router.push('/login')
    } else {
      setLoading(false)
    }
  }

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('exhibitors')
      .select('*')
      .eq('is_staff', true)
      .order('full_name', { ascending: true })
    
    if (!error) setStaff(data || [])
  }

  const handleRegisterInternalStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const staffRecord = {
      full_name: newStaff.full_name,
      phone: newStaff.phone,
      company_name: newStaff.role, 
      stall_number: ['ORG-TEAM'],
      stall_tier: 'Organizer',
      is_staff: true,
      payment_status: 'Fully Paid' 
    }

    const { error } = await supabase.from('exhibitors').insert([staffRecord])

    if (error) {
      alert("Error generating staff badge: " + error.message)
    } else {
      await fetchStaff() 
      setShowModal(false)
      setNewStaff({ full_name: '', phone: '', role: 'Event Volunteer' }) 
    }
    setIsSubmitting(false)
  }

  const deleteStaff = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${name}? Their QR code will stop working immediately.`)) return
    const { error } = await supabase.from('exhibitors').delete().eq('id', id)
    if (!error) fetchStaff()
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-amber-500 uppercase tracking-widest text-[10px] animate-pulse">Accessing Staff Database...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-20 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-[2rem] shadow-sm border-b-4 border-amber-500 gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase text-amber-600 tracking-tighter italic leading-none">Staff Dept.</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">
              Manage internal event personnel & exhibitor staff
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <Button onClick={() => setShowModal(true)} className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl px-6 h-10 shadow-md transition-all">
               + Register Internal Staff
             </Button>
             <Button variant="outline" onClick={() => router.push('/admin')} className="w-full md:w-auto font-bold border-2 text-[10px] uppercase rounded-xl px-6 h-10 text-amber-700 hover:bg-amber-50">
               ← Hub
             </Button>
          </div>
        </div>

        {/* DATA TABLE */}
        <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span>👷</span> Registered Personnel ({staff.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-auto max-h-[700px]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                <tr className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="p-4 px-8">Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Role/Company</th>
                  <th className="p-4 text-center">QR Pass</th>
                  <th className="p-4 text-right px-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 px-8 font-black text-slate-900 uppercase text-sm">{s.full_name}</td>
                    <td className="p-4 text-[10px] font-bold text-slate-500 tracking-widest">{s.phone}</td>
                    <td className="p-4">
                      <Badge variant="outline" className={`uppercase text-[8px] font-black tracking-widest ${
                        s.stall_tier === 'Organizer' 
                          ? 'bg-amber-50 border-amber-200 text-amber-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        {s.company_name || 'Event Staff'}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         onClick={() => setSelectedStaff(s)}
                         className="text-[9px] font-black uppercase tracking-widest text-slate-500 h-8 rounded-lg"
                       >
                         View
                       </Button>
                    </td>
                    <td className="p-4 text-right px-8">
                       <Button variant="ghost" size="sm" onClick={() => deleteStaff(s.id, s.full_name)} className="h-8 text-slate-400 hover:text-red-600 font-black text-[9px] uppercase hover:bg-red-50 transition-all rounded-lg">
                         Revoke
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {staff.length === 0 && (
              <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px] italic">
                No staff members registered yet.
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* REGISTRATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border-0 shadow-2xl rounded-[2rem] overflow-hidden animate-in fade-in zoom-in duration-300">
            <CardHeader className="bg-amber-500 text-white p-6 border-b-4 border-amber-700">
              <CardTitle className="text-sm font-black uppercase tracking-widest">Register Internal Staff</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleRegisterInternalStaff} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                    <Input required value={newStaff.full_name} onChange={e => setNewStaff({...newStaff, full_name: e.target.value})} placeholder="e.g. Amit Patel" className="font-bold h-12 rounded-xl bg-slate-50"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</label>
                    <Input required value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} placeholder="+91" className="font-bold h-12 rounded-xl bg-slate-50"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Internal Role</label>
                    <select value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 font-bold text-sm outline-none focus:border-amber-500">
                      <option value="Event Manager">Event Manager</option>
                      <option value="Security Personnel">Security Personnel</option>
                      <option value="Registration Desk">Registration Desk</option>
                      <option value="Event Volunteer">Event Volunteer</option>
                      <option value="Shree Balaji Event LLP">Shree Balaji Event Core Team</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <Button type="button" onClick={() => setShowModal(false)} variant="outline" className="w-full font-black uppercase tracking-widest rounded-xl h-12">Cancel</Button>
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest rounded-xl h-12 shadow-lg">
                      {isSubmitting ? 'Generating...' : 'Add Staff'}
                    </Button>
                  </div>
                </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PREMIUM DIGITAL PASS MODAL */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 relative border-4 border-amber-500">
            
            {/* Logo Section */}
            <div className="bg-white pt-6 pb-4 flex justify-center">
              <img src="/event-logo.png" alt="Guj Gift Expo" className="h-16 object-contain" />
            </div>

            {/* Badge Label */}
            <div className="flex justify-center -mt-5 relative z-10">
              <div className="bg-amber-500 text-white px-6 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-4 border-white shadow-sm">
                Official Staff Pass
              </div>
            </div>

            {/* Body Section */}
            <div className="px-6 pt-6 pb-6 bg-white flex flex-col gap-5 text-center items-center">
              
              {/* QR Code */}
              <div className="p-3 border-[3px] border-amber-500 rounded-2xl bg-white inline-block shadow-sm">
                <QRCodeSVG value={`GGE2026-STAFF-${selectedStaff.id}`} size={140} level="H" includeMargin={false} fgColor="#0f172a" />
              </div>

              {/* Name & Role */}
              <div className="flex flex-col items-center space-y-1">
                <h2 className="text-2xl font-black text-slate-900 uppercase leading-none tracking-tighter break-words">
                  {selectedStaff.full_name}
                </h2>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                  {selectedStaff.company_name}
                </p>
              </div>
              
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Scan at Secure Entry</p>
            </div>

            {/* Footer Details */}
            <div className="bg-amber-500 text-white flex px-6 py-4 w-full">
              <div className="w-1/2 pr-3 border-r border-amber-600 text-left">
                <p className="text-[8px] font-bold uppercase tracking-widest text-amber-200 mb-0.5">Date</p>
                <p className="text-[9px] font-black uppercase tracking-widest leading-none">12-24 Aug 2026</p>
              </div>
              <div className="w-1/2 pl-4 text-left">
                <p className="text-[8px] font-bold uppercase tracking-widest text-amber-200 mb-0.5">Location</p>
                <p className="text-[9px] font-black uppercase tracking-widest leading-none">GMDC Hall, Ahmedabad</p>
              </div>
            </div>

            {/* Organizer */}
            <div className="bg-slate-50 px-6 py-4 flex flex-col items-center justify-center gap-1.5">
              <div className="text-center">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Organized By</p>
                <p className="text-[9px] font-black text-slate-900 uppercase tracking-wide">Shree Balaji Event LLP</p>
              </div>
            </div>

            {/* Action Footer */}
            <div className="bg-white p-4 text-center">
               <Button onClick={() => setSelectedStaff(null)} className="w-full bg-slate-900 text-white font-black uppercase tracking-widest rounded-xl h-12 shadow-md hover:bg-black transition-all">Close Pass</Button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}