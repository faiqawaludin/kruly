import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import CreateProjectModal from "./CreateProjectModal"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // 1. Ambil data user yang sedang login
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Ambil Workspace di mana user ini bergabung
  const { data: workspaces } = await supabase
    .from('workspace_members')
    .select(`
      role,
      workspaces ( id, name )
    `)
    .eq('user_id', user?.id)

  // 3. Ambil daftar Project di mana user ini menjadi member
  const { data: projects } = await supabase
    .from('project_members')
    .select(`
      role,
      projects ( id, name, description, year, status )
    `)
    .eq('user_id', user?.id)
    .order('project_id', { ascending: false })

  const activeWorkspace = workspaces?.[0]?.workspaces
  const availableWorkspaces = workspaces?.map((wm: any) => wm.workspaces).filter(Boolean) || []

  return (
    <div className="space-y-8"> {/* Container Utama: Memberi jarak vertikal */}
      
      {/* BAGIAN HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Selamat datang, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-zinc-500 mt-2">
            Anda berada di workspace: <strong className="text-zinc-800">{activeWorkspace?.name || "Belum ada"}</strong>
          </p>
        </div>
        
        {/* Tombol Modal diletakkan di sudut kanan atas */}
        <CreateProjectModal workspaces={availableWorkspaces} />
      </div>

      {/* BAGIAN DAFTAR PROYEK (GRID) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects?.length === 0 ? (
          <div className="col-span-full p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            <p className="text-zinc-500 mb-4">Belum ada proyek yang ditugaskan kepada Anda.</p>
            {/* Tombol dummy diubah menjadi fungsi modal asli */}
            <CreateProjectModal workspaces={availableWorkspaces} />
          </div>
        ) : (
          projects?.map((item: any) => {
            const project = item.projects
            if (!project) return null
            
            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      project.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      {project.status.toUpperCase()}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mt-2 text-sm text-zinc-500">
                    <span>Tahun: {project.year}</span>
                    <span className="capitalize">Role: {item.role}</span>
                  </div>
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <Button className="w-full mt-4" variant="secondary">
                      Buka Proyek
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}