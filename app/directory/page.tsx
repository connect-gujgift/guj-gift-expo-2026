'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

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
    // Select everything from the table
    const { data, error } = await supabase
      .from('exhibitors')
      .select('*')
    
    if (data) setExhibitors(data)
    setLoading(false)
  }

  const handleRequestMeeting = async () => {
    if (!meetingTime) return alert("Please select a valid date and time.")
    setSending(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    // Format the date to look nice (e.g., "Aug 12, 2:00 PM")
    const dateObj = new Date(meetingTime)
    const formattedTime = dateObj.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    })

    const { error } = await supabase
      .from('meetings')
      .insert([
        {
          visitor_id: user.id,
          exhibitor_id: selectedExhibitor.id,
          requested_time: formattedTime, // Saves as readable text
          status: 'pending'
        }
      ])

    setSending(false)
    if (error) {
      alert("Error sending request. Please try again.")
      console.error(error)
    } else {
      alert(`Meeting requested for ${formattedTime}!`)
      setSelectedExhibitor(null)
      setMeetingTime('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-black text-slate-900 uppercase">Exhibitor Directory</h1>
           <p className="text-sm text-slate-500">Book meetings with top suppliers</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>Back</Button>
      </div>

      {/* EXHIBITOR LIST */}
      {loading ? (
        <div className="text-center text-slate-400 mt-10 italic">Loading companies...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exhibitors.length === 0 ? (
            <div className="col-span-full text-center py-10 bg-white rounded-xl border border-dashed">
              <p className="text-slate-500">No exhibitors found yet.</p>
            </div>
          ) : (
            exhibitors.map((exhibitor) => (
              <Card key={exhibitor.id} className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-blue-600 bg-white">
                <CardContent className="p-5 flex flex-col gap-3">
                  <div>
                    {/* ROBUST NAME CHECK: Tries company_name, then name, then fallback */}
                    <h2 className="text-lg font-black text-slate-900 uppercase leading-tight">
                      {exhibitor.company_name || exhibitor.name || "Company Name Missing"}
                    </h2>
                    
                    {exhibitor.stall_number && (
                      <Badge variant="secondary" className="mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100">
                        📍 Stall: {exhibitor.stall_number}
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-slate-900 hover:bg-slate-800 font-bold mt-auto"
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

      {/* BOOKING MODAL */}
      {selectedExhibitor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-black mb-1 text-slate-900">
              Meet {selectedExhibitor.company_name || selectedExhibitor.name}
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-bold uppercase tracking-wide">
              Schedule Your Visit
            </p>
            
            {/* SMART DATE PICKER */}
            <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">
              Select Time (Aug 12 - 14)
            </label>
            <Input 
              type="datetime-local"
              min="2026-08-12T10:00"
              max="2026-08-14T18:00"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              className="mb-6 h-12 text-lg"
            />

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 py-6 font-bold"
                onClick={() => setSelectedExhibitor(null)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-6 font-bold shadow-lg shadow-blue-200"
                onClick={handleRequestMeeting}
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Confirm Request'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}