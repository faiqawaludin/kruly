import { createClient } from "@/utils/supabase/server"
import SidebarSpaces from "./SidebarSpaces"
import SidebarNav from "./SidebarNav"
import CreateSpaceModal from "./CreateSpaceModal"

// 🔴 MANTRA ANTI-CACHE SIDEBAR
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // PERBAIKAN: Memastikan 'category' ditarik dari Database
  const { data: workspaceMembers } = await supabase
    .from('workspace_members')
    .select(`role, workspaces ( id, name, projects ( id, name, category ) )`)
    .eq('user_id', user?.id)

  const rawData = workspaceMembers?.map((wm: any) => wm.workspaces).filter(Boolean) || []
  const sidebarData = Array.from(new Map(rawData.map((item: any) => [item.id, item])).values())

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans">
      
      {/* SIDEBAR KIRI */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 font-black text-2xl tracking-tighter text-white border-b border-zinc-900">
          Kruly.
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          
          <div className="mb-8">
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider px-2 mb-2">Home</div>
            <SidebarNav />
          </div>
          
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Spaces</div>
              <CreateSpaceModal />
            </div>
            
            <SidebarSpaces spaces={sidebarData} />
          </div>

        </div>

        {/* USER PROFILE */}
        <div className="p-4 border-t border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-zinc-400 truncate">Workspace Member</p>
            </div>
          </div>
        </div>
      </aside>

      {/* AREA KONTEN UTAMA */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden text-zinc-900">
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>

    </div>
  )
}