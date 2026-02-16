'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Create the user in Supabase Authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Link the Auth ID to the Visitors Table
        const { error: dbError } = await supabase
          .from('visitors')
          .insert([
            { 
              id: authData.user.id, // THE CRITICAL LINK
              full_name: formData.fullName,
              company_name: formData.companyName,
              designation: formData.designation,
              email: formData.email
            }
          ])

        if (dbError) throw dbError

        alert("Registration Successful! Please log in to view your badge.")
        router.push('/login')
      }
    } catch (error: any) {
      alert(error.message || "An error occurred during registration.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Visitor Registration</h1>
        <p className="text-orange-600 font-bold text-sm">GUJ GIFT EXPO 2026 • Ahmedabad</p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-orange-600">
        <CardHeader>
          <CardTitle className="text-lg text-center text-gray-700 uppercase tracking-wide">
            Create Your Digital Pass
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Enter your name" required onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" placeholder="Enter your business name" required onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" placeholder="e.g. Owner, Manager" required onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="email@example.com" required onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input id="password" type="password" placeholder="Minimum 6 characters" required onChange={handleChange} />
            </div>

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 py-6 text-lg font-bold shadow-md" disabled={loading}>
              {loading ? "Registering..." : "REGISTER & GET PASS"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already registered? <Link href="/login" className="text-orange-600 font-bold hover:underline">Log In</Link>
          </div>
        </CardContent>
      </Card>

      <p className="mt-8 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
        Organized by Shree Balaji Event LLP
      </p>
    </div>
  )
}