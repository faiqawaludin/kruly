"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function createTask(projectId: string, formData: FormData) {
  const supabase = await createClient()

  // Ambil data dari form
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const status = formData.get("status") as string
  const priority = formData.get("priority") as string
  const dueDate = formData.get("due_date") as string

  // Pastikan ada user yang sedang login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Insert data ke tabel tasks
  const { error } = await supabase.from('tasks').insert({
    project_id: projectId,
    name,
    description,
    status,
    priority,
    // Jika form tanggal kosong, biarkan null
    due_date: dueDate ? dueDate : null, 
  })

  if (error) {
    console.error("Gagal menambah task:", error)
    throw new Error("Gagal menambah task")
  }

  // Bersihkan cache agar daftar task langsung ter-update di layar!
  revalidatePath(`/dashboard/projects/${projectId}`)
}