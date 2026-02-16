'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    designation: '',
    email: '',
    password: ''
  })

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 1. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (authError) {
      alert("Error: " + authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      // 2. Save their profile in the 'visitors' table
      const { error: profileError } = await supabase
        .from('visitors')
        .insert([
          {
            id: authData.user.id, // Link to the auth user
            full_name: formData.fullName,
            company_name: formData.companyName,
            designation: formData.designation
          }
        ])

      if (profileError) {
        alert("Error saving profile: " + profileError.message)
      } else {
        // SUCCESS! Send them to the Badge Page
        alert("Registration Successful! Generating your badge...")
        router.push('/badge') 
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-10">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-orange-600">Visitor Registration</CardTitle>
          <CardDescription>Get your entry pass for Guj Gift Expo 2026</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input name="fullName" placeholder="e.g. Rahul Sharma" required onChange={handleChange} />
            </div>

            {/* Company & Designation */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input name="companyName" placeholder="e.g. Sharma Gifts" required onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input name="designation" placeholder="e.g. Manager" required onChange={handleChange} />
              </div>
            </div>

            {/* Email & Password */}
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input name="email" type="email" placeholder="name@company.com" required onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Create Password</Label>
              <Input name="password" type="password" placeholder="******" required minLength={6} onChange={handleChange} />
            </div>

            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6" type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Get My Badge'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-500">
            Already registered? <Link href="/login" className="text-blue-600 hover:underline">Login here</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}