import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation" 
import SidebarSpaces from "./SidebarSpaces"
import SidebarNav from "./SidebarNav"
import CreateSpaceModal from "./CreateSpaceModal"
import SidebarUserProfile from "./SidebarUserProfile"
import SidebarWrapper from "./SidebarWrapper" // 🔴 IMPORT WRAPPER BARU

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: workspaceMembers } = await supabase
    .from('workspace_members')
    .select(`role, workspaces ( id, name, projects ( id, name, category ) )`)
    .eq('user_id', user.id)

  const rawData = workspaceMembers?.map((wm: any) => wm.workspaces).filter(Boolean) || []
  const sidebarData = Array.from(new Map(rawData.map((item: any) => [item.id, item])).values())

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userProfile?.full_name) {
    redirect('/set-password')
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans">
      
      {/* 🔴 MENGGUNAKAN WRAPPER CLIENT-SIDE BARU KITA */}
      <SidebarWrapper userProfile={userProfile}>
        {/* SEMUA ISI SIDEBAR YANG LAMA DILEMPARKAN SEBAGAI "CHILDREN" */}
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

        {/* Profil lengkap hanya tampil kalau Sidebar TIDAK di-collapse */}
        <div className="mt-auto pt-6">
          <SidebarUserProfile 
            user={user} 
            initialProfile={userProfile} 
            userRole={workspaceMembers?.[0]?.role || 'Member'} 
          />
        </div>
      </SidebarWrapper>

      {/* AREA KONTEN UTAMA */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden text-zinc-900 min-w-0">
        <div className="flex-1 overflow-auto p-8 relative">
          {children}
        </div>
      </main>

    </div>
  )
}