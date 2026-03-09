'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function BroadcastCenterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  // Message Form State
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState<'ALL' | 'VISITORS' | 'EXHIBITORS' | 'STAFF'>('ALL')

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'maulikshah.13@gmail.com') {
      router.push('/login')
    } else {
      setLoading(false)
    }
  }

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    
    setSending(true)
    
    const newLog = {
      id: Date.now(),
      message,
      target,
      timestamp: new Date(),
      status: 'Sent Successfully'
    }

    // Update local history
    setHistory(prev => [newLog, ...prev])
    
    // Simulate API Delay for Broadcast
    setTimeout(() => {
      alert(`Broadcast sent to all ${target.toLowerCase()}!`)
      setMessage('')
      setSending(false)
    }, 1500)
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-indigo-500 uppercase tracking-widest text-[10px] animate-pulse">Connecting to Satellite...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-[2rem] shadow-sm gap-4 border-b-4 border-indigo-600">
          <div>
            <h1 className="text-3xl font-black uppercase text-indigo-600 tracking-tighter italic leading-none">Broadcast Center</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Official GGE Announcement Hub</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold border-2 text-[10px] uppercase rounded-xl px-6 h-10 w-full md:w-auto">
            ← Hub
          </Button>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          
          {/* COMPOSE AREA */}
          <div className="md:col-span-12">
            <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="bg-indigo-600 text-white p-8">
                <CardTitle className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                  <span>📢</span> Create Announcement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                
                {/* TARGET SELECTOR */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Select Audience</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['ALL', 'VISITORS', 'EXHIBITORS', 'STAFF'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTarget(t as any)}
                        className={`h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                          target === t 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105' 
                          : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* MESSAGE AREA */}
                <form onSubmit={handleBroadcast} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Message Content</label>
                    <Textarea 
                      placeholder="Type your event announcement here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[150px] bg-slate-50 border-0 rounded-[1.5rem] p-6 text-lg font-bold placeholder:text-slate-300 focus-visible:ring-indigo-500"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={sending || !message}
                    className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all active:scale-95 text-sm"
                  >
                    {sending ? 'Broadcasting...' : '🚀 Blast Message'}
                  </Button>
                </form>

              </CardContent>
            </Card>
          </div>

          {/* HISTORY LOG */}
          <div className="md:col-span-12">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-4">Broadcast History</h3>
            <div className="space-y-3">
              {history.map((log) => (
                <Card key={log.id} className="border-0 shadow-sm rounded-2xl bg-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">{log.target}</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{log.timestamp.toLocaleString()}</span>
                    </div>
                    <p className="font-bold text-slate-700 leading-relaxed">{log.message}</p>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {log.status}
                  </div>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}