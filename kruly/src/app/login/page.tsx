"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  
  const router = useRouter()
  // Panggil client supabase di dalam komponen
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("Error")
    
    if (!email || !password) {
      setErrorMsg("Email and Password are required")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      // Refresh router untuk memastikan middleware berjalan, lalu pindah halaman
      router.refresh()
      router.push("/dashboard")
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setErrorMsg("You must enter your email address to send an invite link")
      return
    }
    
    setLoading(true)
    setErrorMsg("")
    setSuccessMsg("")

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccessMsg("The Invite Link has been sent! Please check your email.")
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-black">Kruly.</CardTitle>
          <CardDescription className="text-center">
            Log in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@gmail.com" 
                className="placeholder:italic text-sm border p-2 rounded" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="......."
                className="placeholder:italic text-sm border p-2 rounded" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            {errorMsg && (
              <p className="text-sm text-red-500 font-medium">{errorMsg}</p>
            )}
            {successMsg && (
              <p className="text-sm text-green-600 font-medium">{successMsg}</p>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Logging in..." : "Log in"}
              </Button>
              
              <div className="relative text-center text-sm my-2">
                <span className="bg-white px-2 text-zinc-500">OR</span>
                <div className="absolute inset-0 flex items-center -z-10">
                  <div className="w-full border-t border-zinc-200"></div>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleMagicLink}
                disabled={loading}
                className="w-full"
              >
                Send Invite Link
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}