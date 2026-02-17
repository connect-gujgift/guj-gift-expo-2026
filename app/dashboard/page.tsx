'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<'visitor' | 'exhibitor' | null>(null)
  const [loading, setLoading] = useState(true)
  const [meetings, setMeetings] = useState<any[]>([])

  useEffect(() => {
    const checkUser = async () => {
      // 1. Get Current User
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // 2. Check if Exhibitor
      const { data: exhibitor } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('id', user.id)
        .single()

      if (exhibitor) {
        setRole('exhibitor')
        fetchExhibitorMeetings(user.id)
      } else {
        setRole('visitor')
      }
      setLoading(false)
    }

    checkUser()
  }, [router])

  // FUNCTION: Fetch Meeting Requests for this Exhibitor
  const fetchExhibitorMeetings = async (exhibitorId: string) => {
    // Fetch meetings AND the visitor details associated with them
    const { data, error } = await supabase
      .from('meetings')
      .select(`
        *,
        visitors (
          full_name,
          company_name,
          designation,
          email
        )
      `)
      .eq('exhibitor_id', exhibitorId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching meetings:', error)
    } else {
      setMeetings(data || [])
    }
  }

  // FUNCTION: Handle Accept/Reject
  const updateStatus = async (meetingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('meetings')
      .update({ status: newStatus })
      .eq('id', meetingId)

    if (!error) {
      // Refresh the list locally to show the change immediately
      setMeetings(meetings.map(m => 
        m.id === meetingId ? { ...m, status: newStatus } : m
      ))
    }
  }

  // LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="p-8 text-center font-bold text-slate-400">Loading Dashboard...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">
            {role === 'exhibitor' ? 'Exhibitor Panel' : 'My Dashboard'}
          </h1>
          <p className="text-sm text-slate-500 font-medium">Welcome back, {user?.email}</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="text-xs h-8">
          Sign Out
        </Button>
      </div>

      {/* --- VISITOR VIEW --- */}
      {role === 'visitor' && (
        <div className="grid gap-4">
          <Card className="border-l-4 border-orange-500 shadow-sm">
            <CardHeader>
              <CardTitle>My Entry Pass</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-orange-600 font-bold hover:bg-orange-700" onClick={() => router.push('/badge')}>
                VIEW BADGE
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Exhibitor Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">Find companies and schedule meetings.</p>
              <Button variant="secondary" className="w-full font-bold" onClick={() => router.push('/directory')}>
                BROWSE DIRECTORY
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- EXHIBITOR VIEW --- */}
      {role === 'exhibitor' && (
        <div className="space-y-6">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
              <h3 className="text-3xl font-black text-blue-600">{meetings.length}</h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Total Requests</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
              <h3 className="text-3xl font-black text-green-600">
                {meetings.filter(m => m.status === 'accepted').length}
              </h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Confirmed</p>
            </div>
          </div>

          {/* Meeting Requests List */}
          <div>
            <h2 className="text-lg font-black text-slate-900 mb-4 uppercase">Incoming Requests</h2>
            
            {meetings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-400 font-bold">No requests yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.map((meeting) => (
                  <Card key={meeting.id} className="overflow-hidden border-slate-200 shadow-sm">
                    <div className="p-4">
                      {/* TOP ROW: Status & Time */}
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant={meeting.status === 'accepted' ? 'default' : meeting.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {meeting.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs font-black text-slate-500 uppercase tracking-tight">
                          {/* FIX: Formats the time to be readable (e.g. Aug 12, 2:00 PM) */}
                          {meeting.meeting_time ? new Date(meeting.meeting_time).toLocaleString('en-US', {
                             month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                          }) : 'Time N/A'}
                        </span>
                      </div>

                      {/* MIDDLE ROW: Visitor Details */}
                      <div className="mb-4">
                        <h3 className="text-lg font-black text-slate-900 leading-tight">
                          {meeting.visitors?.full_name || 'Unknown Visitor'}
                        </h3>
                        <p className="text-sm text-blue-600 font-bold uppercase tracking-wide">
                          {meeting.visitors?.company_name}
                        </p>
                        <p className="text-xs text-slate-400 italic font-medium">
                          {meeting.visitors?.designation}
                        </p>
                      </div>

                      {/* BOTTOM ROW: Actions (Only if Pending) */}
                      {meeting.status === 'pending' && (
                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            variant="outline" 
                            className="border-red-100 text-red-600 hover:bg-red-50 font-bold"
                            onClick={() => updateStatus(meeting.id, 'rejected')}
                          >
                            Decline
                          </Button>
                          <Button 
                            className="bg-green-600 hover:bg-green-700 text-white font-bold"
                            onClick={() => updateStatus(meeting.id, 'accepted')}
                          >
                            Accept
                          </Button>
                        </div>
                      )}
                      
                      {meeting.status === 'accepted' && (
                        <div className="bg-green-50 text-green-800 text-xs font-bold p-3 text-center rounded-lg border border-green-200">
                          ✅ Meeting Confirmed
                        </div>
                      )}

                      {meeting.status === 'rejected' && (
                        <div className="bg-red-50 text-red-800 text-xs font-bold p-3 text-center rounded-lg border border-red-200">
                          ❌ Request Declined
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}