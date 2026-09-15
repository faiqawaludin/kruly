import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import ChatRoom from "./ChatRoom"

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Ambil profil user yang sedang login
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Ambil semua user di sistem untuk dijadikan daftar @mention
  const { data: allUsers } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, global_role')
    .order('full_name', { ascending: true })

  // Ambil riwayat pesan terakhir (misal 50 pesan)
  const { data: initialMessages } = await supabase
    .from('messages')
    .select('*, sender:profiles(full_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(50)

  // Balikkan urutannya agar yang terbaru ada di paling bawah
  const sortedMessages = (initialMessages || []).reverse()

  return (
    <div className="h-full flex flex-col -m-8 relative bg-zinc-50">
      {/* Header Chat */}
      <div className="h-16 border-b border-zinc-200 bg-white flex items-center px-6 shrink-0 z-10 shadow-sm">
        <div>
          <h2 className="font-black text-xl text-zinc-900 tracking-tight flex items-center gap-2">
            <span className="text-zinc-400">#</span> Global_Lounge
          </h2>
          <p className="text-[11px] text-zinc-500 font-medium">Tempat diskusi dan santai seluruh anggota tim.</p>
        </div>
      </div>

      {/* Lempar data ke Client Component */}
      <ChatRoom 
        currentUser={currentUserProfile} 
        initialMessages={sortedMessages} 
        mentionList={allUsers || []} 
      />
    </div>
  )
}