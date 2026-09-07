"use client"

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Selamat datang di Kruly!</h1>
      <p className="text-gray-600 mb-8">Ini adalah area Dashboard yang diproteksi.</p>
      <Button onClick={handleLogout} variant="destructive">
        Logout
      </Button>
    </div>
  )
}
