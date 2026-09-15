"use client"

import { useState, useEffect } from "react"
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
  const supabase = createClient()

  // 🔴 FIX 1: PENCEGAT LINK UNDANGAN (CARA BRUTE FORCE YANG AMAN)
  useEffect(() => {
    const handleRedirects = async () => {
      // 1. Ambil hash (semua teks setelah tanda #)
      const hash = window.location.hash
      if (!hash) return

      // 2. Jika link kedaluwarsa
      if (hash.includes("error_code=otp_expired")) {
        window.history.replaceState(null, '', window.location.pathname)
        setErrorMsg("Link undangan/reset sudah kedaluwarsa atau pernah dipakai. Silakan minta link baru.")
        return
      }

      // 3. JIKA ADA TOKEN SAKTI (Invite / Recovery)
      if (hash.includes("access_token")) {
        // Tampilkan teks loading agar user tahu sistem sedang bekerja
        setLoading(true)
        setSuccessMsg("Memproses tautan aman... Mohon tunggu sebentar.")

        // Cek sesi secara paksa. Jika null, kita coba 3 kali setiap 500ms
        let sessionData = null
        for (let i = 0; i < 3; i++) {
          const { data } = await supabase.auth.getSession()
          if (data.session) {
            sessionData = data.session
            break
          }
          // Tunggu 500ms sebelum mencoba lagi
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        // 4. JIKA SESI BERHASIL DITANGKAP
        if (sessionData) {
          // Sapu bersih token dari URL SEKARANG
          window.history.replaceState(null, '', window.location.pathname)

          // Lempar ke halaman Set Password
          if (hash.includes("type=invite") || hash.includes("type=recovery")) {
            router.push("/set-password")
          } else {
            router.push("/dashboard")
          }
        } else {
          // Jika sudah 3x dicek tapi gagal (Sangat jarang terjadi)
          setLoading(false)
          setSuccessMsg("")
          setErrorMsg("Gagal memproses sesi login. Silakan refresh halaman atau coba klik link lagi.")
        }
      }
    }

    handleRedirects()
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("") 
    setSuccessMsg("")
    
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

  // 🔴 FIX 2: FUNGSI RESET PASSWORD
  const handleResetPassword = async () => {
    if (!email) {
      setErrorMsg("Please enter your email address first to reset your password.")
      return
    }
    
    setLoading(true)
    setErrorMsg("")
    setSuccessMsg("")

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Supabase akan melempar kembali ke halaman ini dengan hash type=recovery
      redirectTo: `${window.location.origin}/login`, 
    })

    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccessMsg("Password reset link sent! Please check your email.")
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
              {/* 🔴 FIX 3: TOMBOL FORGOT PASSWORD DI SEBELAH LABEL */}
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button 
                  type="button" 
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50"
                >
                  Forgot Password?
                </button>
              </div>
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