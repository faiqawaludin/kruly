import { createClient } from "@/utils/supabase/server"
import SidebarSpaces from "./SidebarSpaces"
import SidebarNav from "./SidebarNav"
import CreateSpaceModal from "./CreateSpaceModal"
import SidebarUserProfile from "./SidebarUserProfile" // 🔴 IMPORT KOMPONEN BARU

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: workspaceMembers } = await supabase
    .from('workspace_members')
    .select(`role, workspaces ( id, name, projects ( id, name, category ) )`)
    .eq('user_id', user?.id)

  const rawData = workspaceMembers?.map((wm: any) => wm.workspaces).filter(Boolean) || []
  const sidebarData = Array.from(new Map(rawData.map((item: any) => [item.id, item])).values())

  // 🔴 AMBIL DATA PROFIL USER YANG SEDANG LOGIN DARI TABEL PROFILES
  let userProfile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    userProfile = data;
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans">
      
      {/* SIDEBAR KIRI */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 font-black text-2xl tracking-tighter text-white border-b border-zinc-900 shrink-0">
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

        {/* 🔴 PASANG KOMPONEN PROFIL INTERAKTIF DI SINI */}
        {user && (
          <SidebarUserProfile user={user} initialProfile={userProfile} />
        )}
      </aside>

      {/* AREA KONTEN UTAMA */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden text-zinc-900 min-w-0">
        <div className="flex-1 overflow-auto p-8 relative">
          {children}
        </div>
      </main>

    </div>
  )
}