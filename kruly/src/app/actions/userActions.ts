"use server"

import { createClient } from "@supabase/supabase-js"

// ==========================================
// FUNGSI 1: MENGHAPUS USER (MFA / 2FA)
// ==========================================
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

// ==========================================
// FUNGSI 2: MENGUNDANG USER BARU
// ==========================================
export async function inviteUserToKruly(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return { success: false, message: "Server Error: SUPABASE_SERVICE_ROLE_KEY belum diatur." }
  }

  // Buat koneksi Supabase menggunakan Kunci Dewa (Service Role)
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  try {
    // Eksekusi pengiriman undangan via email bawaan Supabase
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)
    
    if (error) throw error
    
    return { success: true }
    
  } catch (error: any) {
    return { success: false, message: "Gagal mengirim undangan: " + error.message }
  }
}

// ==========================================
// FUNGSI 3: MENGAMBIL DAFTAR LENGKAP USER (TERMASUK YANG PENDING)
// ==========================================
export async function getAdminUsersList() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return { success: false, message: "Kunci server belum diatur", data: [] }
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  try {
    // 1. Ambil data asli dari brankas Authentication (termasuk yang baru di-invite)
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.listUsers()
    if (authErr) throw authErr
    
    // 2. Ambil data dari tabel Profiles (untuk yang sudah punya nama)
    const { data: profiles, error: profErr } = await supabaseAdmin.from('profiles').select('*')
    if (profErr) throw profErr
    
    // 3. Gabungkan datanya!
    const mergedUsers = authData.users.map(u => {
      const prof = profiles.find(p => p.id === u.id)
      
      // Jika user belum pernah login sama sekali, statusnya berarti masih "Pending Invite"
      const isPending = !u.last_sign_in_at

      return {
        id: u.id,
        email: u.email,
        full_name: prof?.full_name || '',
        global_role: prof?.global_role || 'member',
        avatar_url: prof?.avatar_url || '',
        isPending: isPending
      }
    })
    
    return { success: true, data: mergedUsers }
  } catch (error: any) {
    return { success: false, message: error.message, data: [] }
  }
}