'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [myMeetings, setMyMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)

      // 2. Fetch the meetings I requested
      // We join the 'connections' table with the 'exhibitors' table to get company names
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          exhibitors (
            company_name,
            stall_number,
            contact_email
          )
        `)
        .eq('visitor_id', user.id)

      if (error) console.error(error)
      else setMyMeetings(data || [])
      
      setLoading(false)
    }
    getData()
  }, [router])

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.email}</p>
        </div>

        {/* Meeting Requests List */}
        <h2 className="text-xl font-semibold mb-4">My Meeting Requests</h2>
        
        {myMeetings.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg border border-dashed">
            <p className="text-gray-500 mb-2">No meetings requested yet.</p>
            <p className="text-sm text-blue-600 cursor-pointer hover:underline" onClick={() => router.push('/exhibitors')}>
              Browse the Directory to find suppliers.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {myMeetings.map((meeting) => (
              <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <h3 className="text-lg font-bold">{meeting.exhibitors?.company_name}</h3>
                    <p className="text-sm text-gray-500">Stall: {meeting.exhibitors?.stall_number}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={meeting.status === 'confirmed' ? 'default' : 'secondary'}>
                      {meeting.status?.toUpperCase() || 'REQUESTED'}
                    </Badge>
                    <div className="text-xs text-gray-400">
                      Sent on: {new Date(meeting.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}