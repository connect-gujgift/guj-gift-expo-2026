'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function ExhibitorProfile() {
  const { id } = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [meetingTime, setMeetingTime] = useState('')

  useEffect(() => {
    const fetchCompany = async () => {
      const { data, error } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) console.error(error)
      else setCompany(data)
      setLoading(false)
    }
    if (id) fetchCompany()
  }, [id])

  const handleRequestMeeting = async () => {
    setRequesting(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("Please login or register to request a meeting.")
      router.push('/register')
      return
    }

    // SAVING TO THE NEW 'meetings' TABLE
    const { error } = await supabase
      .from('meetings')
      .insert([
        { 
          visitor_id: user.id, 
          exhibitor_id: id,
          meeting_time: meetingTime,
          status: 'pending'
        }
      ])

    if (error) {
      alert("Error: " + error.message)
    } else {
      alert("Meeting request sent! You can check status on your dashboard.")
      router.push('/dashboard')
    }
    setRequesting(false)
  }

  if (loading) return <div className="p-10 text-center font-bold">Loading Exhibitor Profile...</div>
  if (!company) return <div className="p-10 text-center">Company not found.</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.push('/exhibitors')} className="mb-2">
          ← Back to Directory
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-xl shadow-sm border-t-4 border-orange-600">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase">{company.company_name}</h1>
            <div className="flex items-center gap-3">
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-none px-4 py-1 font-bold">
                STALL {company.stall_number}
              </Badge>
              <span className="text-gray-500 font-medium">{company.category}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader><CardTitle className="text-gray-800">About the Exhibitor</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {company.description || "Leading participant at GUJ GIFT EXPO 2026 showcasing innovative products."}
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-2 border-blue-100 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-blue-900 text-lg">Request B2B Meeting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-blue-700">Choose your preferred time to meet this exhibitor at the expo.</p>
                <Input 
                  placeholder="e.g. Day 2 - 2:00 PM" 
                  className="bg-white border-blue-200"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                />
                <Button 
                  onClick={handleRequestMeeting}
                  disabled={requesting || !meetingTime}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-6 shadow-md"
                >
                  {requesting ? "Sending..." : "🤝 REQUEST MEETING"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}