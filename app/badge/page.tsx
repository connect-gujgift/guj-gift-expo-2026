'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function VisitorBadge() {
  const [visitor, setVisitor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVisitorData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Find the visitor record that matches the logged-in email
        const { data, error } = await supabase
          .from('visitors')
          .select('*')
          .eq('id', user.id) // Assuming Supabase Auth ID matches Visitors ID
          .single()
        
        if (data) setVisitor(data)
      }
      setLoading(false)
    }
    fetchVisitorData()
  }, [])

  if (loading) return <div className="p-10 text-center">Generating your badge...</div>
  if (!visitor) return <div className="p-10 text-center">Visitor record not found. Please contact support.</div>

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-sm bg-white shadow-2xl border-t-8 border-orange-600 overflow-hidden">
        <CardHeader className="text-center bg-white pb-2">
          <div className="flex justify-center mb-2">
             <div className="bg-orange-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                Visitor Pass
             </div>
          </div>
          <CardTitle className="text-2xl font-black text-gray-900 uppercase">
            {visitor.full_name}
          </CardTitle>
          <p className="text-orange-600 font-bold text-sm">{visitor.company_name}</p>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center p-8 bg-white">
          {/* THE QR CODE */}
          <div className="p-4 bg-white border-4 border-gray-100 rounded-2xl shadow-inner mb-6">
            <QRCodeSVG value={visitor.id} size={200} />
          </div>
          
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-400 font-bold uppercase">Designation</p>
            <p className="text-gray-800 font-medium">{visitor.designation || 'Visitor'}</p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 w-full text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              GUJ GIFT EXPO 2026 • GMDC Ground
            </p>
          </div>
        </CardContent>
      </Card>
      
      <p className="mt-6 text-gray-500 text-xs text-center px-10">
        Please show this QR code at the entry gate for scanning.
      </p>
    </div>
  )
}