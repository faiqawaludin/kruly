import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation" // 🔴 IMPORT REDIRECT
import SidebarSpaces from "./SidebarSpaces"
import SidebarNav from "./SidebarNav"
import CreateSpaceModal from "./CreateSpaceModal"
import SidebarUserProfile from "./SidebarUserProfile"
import NotificationBell from "@/components/NotificationBell"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 🔴 PROTEKSI 1: Jika belum login sama sekali, tendang ke halaman Login!
  if (!user) {
    redirect('/login')
  }

  const { data: workspaceMembers } = await supabase
    .from('workspace_members')
    .select(`role, workspaces ( id, name, projects ( id, name, category ) )`)
    .eq('user_id', user.id)

  const rawData = workspaceMembers?.map((wm: any) => wm.workspaces).filter(Boolean) || []
  const sidebarData = Array.from(new Map(rawData.map((item: any) => [item.id, item])).values())

  // AMBIL DATA PROFIL USER YANG SEDANG LOGIN DARI TABEL PROFILES
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 🔴 PROTEKSI 2: Jika user masuk dari Invite Link (belum punya nama), tendang ke halaman Set Password!
  if (!userProfile?.full_name) {
    redirect('/set-password')
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans">
      
      {/* SIDEBAR KIRI */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col shrink-0">
        {/* SIDEBAR HEADER DENGAN LONCENG NOTIFIKASI */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-900 shrink-0">
          <div className="font-black text-2xl tracking-tighter text-white">Kruly.</div>
          <NotificationBell />
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <div className="mb-8">
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider px-2 mb-2">Home</div>
            <SidebarNav globalRole={userProfile?.global_role} />
          </div>
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Spaces</div>
              <CreateSpaceModal />
            </div>
            <SidebarSpaces spaces={sidebarData} />
          </div>
        </div>

        {/* MENGIRIMKAN DATA ROLE KE KOMPONEN PROFIL */}
        <SidebarUserProfile 
          user={user} 
          initialProfile={userProfile} 
          userRole={workspaceMembers?.[0]?.role || 'Member'} 
        />
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