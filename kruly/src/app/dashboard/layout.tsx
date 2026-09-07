import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import CreateSpaceModal from "./CreateSpaceModal"
import SidebarSpaces from "./SidebarSpaces"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Ambil data Workspaces
  const { data: workspaceMembers } = await supabase
    .from('workspace_members')
    .select(`workspaces ( id, name )`)
    .eq('user_id', user?.id)

  // 2. Ambil data Projects (Hanya yang berstatus 'active')
  const { data: projectMembers } = await supabase
    .from('project_members')
    .select(`projects ( id, name, workspace_id, status )`)
    .eq('user_id', user?.id)
    .eq('projects.status', 'active') 

  // 3. Format dan Grouping data agar mudah di-render
  const workspaces = workspaceMembers?.map((wm: any) => wm.workspaces).filter(Boolean) || []
  const projects = projectMembers?.map((pm: any) => pm.projects).filter(Boolean) || []

  const sidebarData = workspaces.map((ws: any) => ({
    ...ws,
    projects: projects.filter((p: any) => p.workspace_id === ws.id)
  }))

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar Kiri */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 hidden md:flex flex-col text-zinc-300">
        <div className="flex h-16 items-center px-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold text-white tracking-tight">Kruly.</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Bagian Home (Menu Utama) */}
          <div>
            <div className="text-xs font-semibold text-zinc-500 mb-2 px-2 uppercase tracking-wider">
              Home
            </div>
            <div className="space-y-1">
              <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                Dashboard
              </Link>
              <Link href="/dashboard/projects" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Semua Proyek
              </Link>
            </div>
          </div>

          {/* Bagian Spaces (Hirarki Workspace & Project) */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Spaces
              </div>
              <CreateSpaceModal />
            </div>
            <SidebarSpaces spaces={sidebarData} />
          </div>
        </nav>

        {/* Info User di Bawah Sidebar */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-white truncate">
                {user?.email?.split('@')[0]}
              </span>
              <span className="text-xs text-zinc-500 truncate">Workspace Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Area Konten Kanan */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar Sementara (Nanti akan dinamis di halaman Project) */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8">
          <h2 className="text-lg font-medium text-zinc-800">Kruly Overview</h2>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}