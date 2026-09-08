import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import ProjectView from "./ProjectView"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const projectId = resolvedParams.id
  const supabase = await createClient()

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (projectError || !project) notFound()

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

  const { data: workspaceMembers } = await supabase
    .from('workspace_members')
    .select('role, user_id')
    .eq('workspace_id', project.workspace_id)

  return (
    // Halaman dibiarkan mengalir bebas tanpa kotak/border!
    <div className="pb-10 min-h-screen">
      <ProjectView 
        project={project} 
        tasks={tasks || []} 
        links={links || []} 
        members={workspaceMembers || []} 
      />
    </div>
  )
}