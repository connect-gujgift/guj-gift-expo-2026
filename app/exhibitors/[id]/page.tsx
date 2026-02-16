'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ExhibitorProfile() {
  const { id } = useParams()
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [requestStatus, setRequestStatus] = useState('idle') // 'idle', 'sending', 'sent'

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

  // NEW: Function to handle the connection request
  const handleConnect = async () => {
    setRequestStatus('sending')

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert("Please login or register to request a meeting.")
      window.location.href = '/register' // Send them to sign up
      return
    }

    // 2. Save the connection to the database
    const { error } = await supabase
      .from('connections')
      .insert([
        { 
          visitor_id: user.id, 
          exhibitor_id: company.id, 
          status: 'requested',
          message: 'I am interested in your products.'
        }
      ])

    if (error) {
      alert(error.message)
      setRequestStatus('idle')
    } else {
      setRequestStatus('sent')
      alert("Request Sent! The exhibitor will contact you.")
    }
  }

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>
  if (!company) return <div className="p-10 text-center">Company not found.</div>

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{company.company_name}</h1>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-lg px-3 py-1">Stall {company.stall_number}</Badge>
              <span className="text-gray-500">{company.category}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
             {/* Dynamic Button */}
             {requestStatus === 'sent' ? (
                <Button className="bg-green-600 hover:bg-green-700" disabled>
                  ✓ Request Sent
                </Button>
             ) : (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700" 
                  onClick={handleConnect}
                  disabled={requestStatus === 'sending'}
                >
                  {requestStatus === 'sending' ? 'Sending...' : 'Request Meeting'}
                </Button>
             )}
          </div>
        </div>

        {/* Content Section (Same as before) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>About Us</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{company.description || "No description provided."}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{company.contact_email || "Not available"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Website</p>
                  <a href={company.website_url} target="_blank" className="text-blue-600 underline">
                    {company.website_url}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}