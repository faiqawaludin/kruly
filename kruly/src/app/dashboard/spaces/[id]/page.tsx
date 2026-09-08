import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import SpaceView from "./SpaceView"

export default async function SpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const spaceId = resolvedParams.id
  const supabase = await createClient()

  // 1. Ambil detail Workspace
  const { data: space, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', spaceId)
    .single()

  if (error || !space) notFound()

  // 2. Ambil semua project di workspace ini
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .eq('workspace_id', spaceId)

  const projectIds = projects?.map(p => p.id) || []

  // 3. Ambil seluruh task & link gabungan dari semua project tersebut
    let tasks: any[] = []
    let links: any[] = [] // <-- Variabel baru untuk menampung link
    
    if (projectIds.length > 0) {
        // Fetch Task
        const { data: workspaceTasks } = await supabase
        .from('tasks')
        .select('*, projects(name)')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })
        tasks = workspaceTasks || []

        // Fetch Link
        const { data: workspaceLinks } = await supabase
        .from('project_links')
        .select('*')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })
        links = workspaceLinks || []
    }

    return (
        <div className="pb-10 min-h-screen">
        {/* Jangan lupa oper variabel 'links' ke komponen View */}
        <SpaceView space={space} projects={projects || []} tasks={tasks} links={links} />
        </div>
    )
}