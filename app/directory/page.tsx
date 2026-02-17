'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DirectoryPage() {
  const router = useRouter()
  const [exhibitors, setExhibitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExhibitors = async () => {
      const { data } = await supabase
        .from('exhibitors')
        .select('*')
        .order('stall_number', { ascending: true }) // Sort by Stall A-Z
      
      if (data) setExhibitors(data)
      setLoading(false)
    }
    fetchExhibitors()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-black text-slate-900 uppercase">Exhibitor List</h1>
           <p className="text-sm text-slate-500">Find stalls and locations</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>Back</Button>
      </div>

      {/* CLEAN LIST */}
      {loading ? (
        <div className="text-center text-slate-400 mt-10 italic">Loading directory...</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {exhibitors.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <p className="text-slate-500">No exhibitors found.</p>
            </div>
          ) : (
            exhibitors.map((exhibitor) => (
              <Card key={exhibitor.id} className="shadow-sm border-l-4 border-l-orange-500 bg-white">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase leading-tight">
                      {exhibitor.company_name || exhibitor.name || "Company"}
                    </h2>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                      {exhibitor.contact_person || 'Exhibitor'}
                    </p>
                  </div>
                  
                  {exhibitor.stall_number && (
                    <div className="text-right">
                      <Badge className="bg-slate-900 text-white font-black text-lg px-3 py-1">
                        {exhibitor.stall_number}
                      </Badge>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Stall Number</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}