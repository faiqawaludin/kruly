import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import ProjectView from "./ProjectView"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const projectId = resolvedParams.id
  const supabase = await createClient()

  // 1. Ambil Data Project & Nama Workspace
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*, workspaces(name)') 
    .eq('id', projectId)
    .single()

  if (projectError || !project) notFound()

  // 2. Ambil Tasks & Links
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  const { data: links } = await supabase
    .from('project_links')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  // 3. Ambil Anggota Workspace (Hanya berisi Role dan User ID)
  const { data: workspaceMembers } = await supabase
    .from('workspace_members')
    .select('role, user_id')
    .eq('workspace_id', project.workspace_id)

  // 🔴 4. TRIK SULAP: Ambil Nama Asli & Foto dari tabel Profiles!
  const userIds = workspaceMembers?.map(m => m.user_id) || []
  let profiles: any[] = []
  
  if (userIds.length > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url') // Mengambil nama dan foto!
      .in('id', userIds)
    profiles = data || []
  }

  // 5. Gabungkan data Anggota dengan Profil-nya
  const membersWithProfiles = workspaceMembers?.map(m => {
    const profile = profiles.find(p => p.id === m.user_id)
    return {
      ...m,
      full_name: profile?.full_name || `User ${m.user_id.substring(0,4)}`,
      avatar_url: profile?.avatar_url || null
    }
  })

  return (
    <div className="pb-10 min-h-screen">
      <ProjectView 
        project={project} 
        tasks={tasks || []} 
        links={links || []} 
        members={membersWithProfiles || []} // <-- Kirim data yang sudah lengkap dengan Foto & Nama ke ProjectView!
      />
    </div>
  )
}