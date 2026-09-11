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
    setErrorMsg("")
    
    if (!email || !password) {
      setErrorMsg("Email dan password wajib diisi")
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
      setErrorMsg("Email wajib diisi untuk menggunakan Magic Link")
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
      setSuccessMsg("Magic Link telah dikirim! Silakan cek email Anda.")
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Kruly.</CardTitle>
          <CardDescription>
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
                placeholder="nama@perusahaan.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (Opsional untuk Magic Link)</Label>
              <Input 
                id="password" 
                type="password"
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
                {loading ? "Memproses..." : "Masuk dengan Password"}
              </Button>
              
              <div className="relative text-center text-sm my-2">
                <span className="bg-white px-2 text-zinc-500">ATAU</span>
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
                Kirim Magic Link
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}