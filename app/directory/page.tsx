'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function DirectoryPage() {
  const router = useRouter()
  const [exhibitors, setExhibitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExhibitor, setSelectedExhibitor] = useState<any>(null)
  const [meetingTime, setMeetingTime] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchExhibitors()
  }, [])

  const fetchExhibitors = async () => {
    // Fetch all companies listed in the 'exhibitors' table
    const { data, error } = await supabase
      .from('exhibitors')
      .select('*')
    
    if (data) setExhibitors(data)
    setLoading(false)
  }

  const handleRequestMeeting = async () => {
    if (!meetingTime) return alert("Please enter a time")
    setSending(true)

    // 1. Get current Visitor ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    // 2. Send Request to Database
    const { error } = await supabase
      .from('meetings')
      .insert([
        {
          visitor_id: user.id,
          exhibitor_id: selectedExhibitor.id,
          requested_time: meetingTime,
          status: 'pending'
        }
      ])

    setSending(false)
    if (error) {
      alert("Error sending request")
    } else {
      alert(`Request sent to ${selectedExhibitor.name}!`)
      setSelectedExhibitor(null) // Close modal
      setMeetingTime('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-slate-900 uppercase">Exhibitor Directory</h1>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>Back</Button>
      </div>

      {/* LIST OF EXHIBITORS */}
      {loading ? (
        <div className="text-center text-slate-400 mt-10">Loading companies...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exhibitors.length === 0 ? (
            <p className="text-slate-500">No exhibitors found.</p>
          ) : (
            exhibitors.map((exhibitor) => (
              <Card key={exhibitor.id} className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-blue-500">
                <CardContent className="p-5">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-slate-900">{exhibitor.name}</h2>
                    {exhibitor.stall_number && (
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded mt-1">
                        Stall: {exhibitor.stall_number}
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-slate-900 hover:bg-slate-800"
                    onClick={() => setSelectedExhibitor(exhibitor)}
                  >
                    📅 Request Meeting
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* MEETING POPUP MODAL (Simple Overlay) */}
      {selectedExhibitor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-2">Meet with {selectedExhibitor.name}</h3>
            <p className="text-sm text-slate-500 mb-4">Suggest a time during the expo (Aug 12-14).</p>
            
            <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Preferred Time</label>
            <Input 
              placeholder="e.g. Aug 12th at 2:00 PM" 
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              className="mb-4"
            />

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setSelectedExhibitor(null)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleRequestMeeting}
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}