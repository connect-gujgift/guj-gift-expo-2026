'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function ExhibitorDirectory() {
  const [exhibitors, setExhibitors] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchExhibitors = async () => {
      const { data, error } = await supabase
        .from('exhibitors')
        .select('*')
        .order('company_name', { ascending: true })
      
      if (!error) setExhibitors(data)
    }
    fetchExhibitors()
  }, [])

  const filteredExhibitors = exhibitors.filter(ex => 
    ex.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Exhibitor Directory</h1>
        <p className="text-gray-500 mb-8 text-sm">Find partners for GUJ GIFT EXPO 2026</p>

        <Input 
          placeholder="Search by company or category..." 
          className="mb-8 p-6 text-lg shadow-sm border-orange-200 focus:border-orange-500"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExhibitors.map((ex) => (
            <Card key={ex.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl text-orange-700">{ex.company_name}</CardTitle>
                  <span className="bg-orange-100 text-orange-800 text-[10px] px-2 py-1 rounded font-bold uppercase">
                    Stall: {ex.stall_number || 'TBA'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  {ex.category || 'General'}
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {ex.description || 'No description available.'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}