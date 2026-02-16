'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input" // <--- Import Input for search

export default function ExhibitorDirectory() {
  const router = useRouter()
  const [exhibitors, setExhibitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('') // <--- State for search text

  useEffect(() => {
    const fetchExhibitors = async () => {
      const { data, error } = await supabase
        .from('exhibitors')
        .select('*')
        .order('company_name', { ascending: true }) // Sort A-Z
      
      if (error) console.error('Error:', error)
      else setExhibitors(data || [])
      setLoading(false)
    }

    fetchExhibitors()
  }, [])

  // Filter Logic: Check if name OR category matches search
  const filteredExhibitors = exhibitors.filter(company => 
    company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="p-10 text-center">Loading Directory...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header & Search */}
      <div className="max-w-6xl mx-auto mb-10 text-center space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">Exhibitor Directory</h1>
          <p className="text-lg text-gray-500">Discover the best corporate gifting partners at Guj Gift Expo.</p>
        </div>

        {/* SEARCH BAR */}
        <div className="max-w-md mx-auto">
          <Input 
            placeholder="Search by company or category..." 
            className="text-lg p-6 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="max-w-6xl mx-auto mb-4 text-gray-500 text-sm">
        Showing {filteredExhibitors.length} results
      </div>

      {/* Grid of Companies */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExhibitors.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold">{company.company_name}</CardTitle>
                  <CardDescription className="text-sm font-medium text-blue-600 mt-1">
                    Stall: {company.stall_number}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{company.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm line-clamp-3">
                {company.description || "No description available."}
              </p>
            </CardContent>
            <CardFooter>
               <Button 
                 className="w-full bg-orange-600 hover:bg-orange-700" 
                 onClick={() => router.push(`/exhibitors/${company.id}`)}
               >
                 View Profile
               </Button>
            </CardFooter>
          </Card>
        ))}

        {filteredExhibitors.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            No companies found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  )
}