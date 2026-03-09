'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function BroadcastCenterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState<any[]>([])
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
    setHistory(prev => [newLog, ...prev])
    
    setTimeout(() => {
      alert(`Broadcast sent to ${target}!`)
      setMessage('')
      setSending(false)
    }, 1500)
  }

  if (loading) return <div className="p-10 text-slate-400 font-bold uppercase text-[10px] animate-pulse">Syncing...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border-b-4 border-indigo-600">
          <h1 className="text-3xl font-black uppercase text-indigo-600 italic">Broadcast Center</h1>
          <Button variant="outline" onClick={() => router.push('/admin')} className="font-bold border-2 text-[10px] uppercase rounded-xl h-10">← Hub</Button>
        </div>

        <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-indigo-600 text-white p-8">
            <CardTitle className="text-xl font-black uppercase tracking-widest">📢 Create Announcement</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Audience</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['ALL', 'VISITORS', 'EXHIBITORS', 'STAFF'].map((t) => (
                  <button key={t} onClick={() => setTarget(t as any)} className={`h-12 rounded-xl text-[10px] font-black uppercase border-2 ${target === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message Content</label>
                <Textarea 
                  placeholder="Type message..." 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  className="min-h-[150px] bg-slate-50 border-0 rounded-[1.5rem] p-6 font-bold focus-visible:ring-indigo-500"
                />
              </div>
              <Button type="submit" disabled={sending || !message} className="w-full h-16 bg-slate-900 text-white font-black uppercase rounded-2xl shadow-2xl transition-all active:scale-95">
                {sending ? 'Broadcasting...' : '🚀 Blast Message'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}