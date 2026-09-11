"use server"

import { createClient } from "@supabase/supabase-js"

export async function deleteUserAccountMFA(targetUserId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return { success: false, message: "Server Error: SUPABASE_SERVICE_ROLE_KEY belum diatur." }
  }

  // Buat koneksi Supabase menggunakan Kunci Dewa (Service Role)
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  try {
    // 1. AMANKAN AUDIT LOGS: Putuskan ikatan ID-nya, ubah jadi NULL (agar sejarah log tidak ikut terhapus)
    await supabaseAdmin.from('audit_logs').update({ target_user_id: null }).eq('target_user_id', targetUserId)
    await supabaseAdmin.from('audit_logs').update({ executor_id: null }).eq('executor_id', targetUserId)

    // 2. HAPUS AKSES RUANGAN: Hapus dia dari seluruh Workspace dan Project
    await supabaseAdmin.from('workspace_members').delete().eq('user_id', targetUserId)
    await supabaseAdmin.from('project_members').delete().eq('user_id', targetUserId)

    // 3. HAPUS KTP-NYA: Hapus data dia dari tabel Profiles
    await supabaseAdmin.from('profiles').delete().eq('id', targetUserId)

    // 4. TERAKHIR (STRIKE): Setelah semua bersih, hapus akun utamanya dari sistem Autentikasi
    const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)
    
    if (error) throw error
    
    return { success: true }
    
  } catch (error: any) {
    return { success: false, message: "DB Error: " + error.message }
  }
}