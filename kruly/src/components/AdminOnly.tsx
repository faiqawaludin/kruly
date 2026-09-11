import { createClient } from "@/utils/supabase/server"

export default async function AdminOnly({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('global_role')
    .eq('id', user.id)
    .single()

  // Jika BUKAN admin atau super_admin, jangan render apapun (kembalikan null)
  if (profile?.global_role !== 'admin' && profile?.global_role !== 'super_admin') {
    return null
  }

  // Jika dia admin/super_admin, tampilkan isi (children)-nya
  return <>{children}</>
}