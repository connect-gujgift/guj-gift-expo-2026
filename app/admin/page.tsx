'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function AdminPage() {
  const [formData, setFormData] = useState({
    company_name: '',
    stall_number: '',
    category: '',
    description: '',
    contact_email: '',
    website_url: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('exhibitors')
      .insert([formData])

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('Success! Company added.')
      setFormData({ company_name: '', stall_number: '', category: '', description: '', contact_email: '', website_url: '' }) // Clear form
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>👑 Admin Panel: Add Exhibitor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Company Name */}
            <div>
              <Label>Company Name</Label>
              <Input name="company_name" value={formData.company_name} onChange={handleChange} placeholder="e.g. Galaxy Gifts Pvt Ltd" required />
            </div>

            {/* Row 1: Stall & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stall Number</Label>
                <Input name="stall_number" value={formData.stall_number} onChange={handleChange} placeholder="A-101" required />
              </div>
              <div>
                <Label>Category</Label>
                <Input name="category" value={formData.category} onChange={handleChange} placeholder="Electronics, Leather, etc." required />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Input name="description" value={formData.description} onChange={handleChange} placeholder="Short description of products..." />
            </div>

            {/* Row 2: Email & Website */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Email</Label>
                <Input name="contact_email" value={formData.contact_email} onChange={handleChange} placeholder="sales@company.com" />
              </div>
              <div>
                <Label>Website</Label>
                <Input name="website_url" value={formData.website_url} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Adding...' : 'Add Exhibitor'}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}