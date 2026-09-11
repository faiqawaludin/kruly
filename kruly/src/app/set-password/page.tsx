"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function SetPasswordPage() {
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 1. Dapatkan user yang sedang aktif (yang masuk dari Magic Link)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("You are not registered.")

      // 2. Set/Update Password-nya
      if (password) {
        const { error: pwdError } = await supabase.auth.updateUser({ password })
        if (pwdError) throw pwdError
      }

      // 3. Simpan Nama ke tabel profiles
      if (fullName) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: user.id,
          full_name: fullName,
          updated_at: new Date().toISOString()
        })
        if (profileError) throw profileError
      }

      // Jika semua sukses, lempar ke dashboard!
      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      alert("Failed to save: " + error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-zinc-200">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Welcome to Kruly.</h1>
          <p className="text-sm text-zinc-500 mt-2">One more step before you can start collaborating.</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide block mb-1">Name</label>
            <input 
              type="text" required autoFocus
              value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder=""
              className="w-full h-11 border border-zinc-300 rounded-lg px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide block mb-1">Create a Password</label>
            <input 
              type="password" required minLength={6}
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters..."
              className="w-full h-11 border border-zinc-300 rounded-lg px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
            />
            <p className="text-[10px] text-zinc-400 mt-1.5 italic">This password will be used the next time you log in.</p>
          </div>

          <button 
            type="submit" disabled={isLoading}
            className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold rounded-lg mt-4 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Sign Up"}
          </button>
        </form>

      </div>
    </div>
  )
}