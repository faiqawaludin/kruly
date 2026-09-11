"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const supabase = createClient()
  const router = useRouter()

  const unreadCount = notifications.filter(n => !n.is_read).length

  const checkAndGenerateReminders = async (userId: string) => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('assignee_id', userId) 
      .neq('status', 'Completed')
      .not('due_date', 'is', null)

    if (!tasks) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const task of tasks) {
      const dueDate = new Date(task.due_date)
      dueDate.setHours(0, 0, 0, 0)

      const diffTime = dueDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let reminderType = ''
      if (diffDays === 7) reminderType = 'H-7'
      else if (diffDays === 3) reminderType = 'H-3'
      else if (diffDays === 2) reminderType = 'H-2'
      else if (diffDays === 1) reminderType = 'H-1'
      else if (diffDays === 0) reminderType = 'Hari H'

      if (reminderType) {
        const notifTitle = `Deadline ${reminderType} ⏰`
        // 🔴 FIX: Memakai task.title (bukan task.name)
        const notifMessage = `Task "${task.title}" jatuh tempo pada ${reminderType === 'Hari H' ? 'hari ini' : reminderType}!`

        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('title', notifTitle)
          .ilike('message', `%${task.title}%`) 
          .single()

        if (!existingNotif) {
          await supabase.from('notifications').insert({
            user_id: userId,
            title: notifTitle,
            message: notifMessage,
            link: `/dashboard/projects/${task.project_id}?tab=list` // 🔴 FIX: Arahkan ke tab List
          })
        }
      }
    }
  }

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (data) setNotifications(data)
  }

  useEffect(() => {
    let channel: any;
    let isMounted = true; // 🔴 FIX: Flag penanda komponen aktif

    const initBell = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Lanjut HANYA jika komponen belum dimatikan (unmounted) oleh Next.js
      if (user && isMounted) {
        
        await checkAndGenerateReminders(user.id)
        if (!isMounted) return; // Cek lagi setelah proses async pertama
        
        await fetchNotifications(user.id)
        if (!isMounted) return; // Cek lagi setelah proses async kedua

        // Jika lolos sampai sini, berarti ini proses yang aman!
        channel = supabase.channel(`notifs-${user.id}`)
          .on('postgres_changes', { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'notifications',
              filter: `user_id=eq.${user.id}` 
            }, 
            (payload) => {
              setNotifications(prev => [payload.new, ...prev])
            }
          ).subscribe()
      }
    }

    initBell()

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      isMounted = false; // 🔴 FIX: Matikan flag saat komponen di-unmount
      if (channel) supabase.removeChannel(channel)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleNotifClick = async (notif: any) => {
    if (!notif.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id)
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
    }
    setIsOpen(false)
    if (notif.link) router.push(notif.link)
  }

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* 🔴 FIX SCROLLBAR: Memaksa Scrollbar Webkit Muncul */}
      <style>{`
        .notif-scrollbar::-webkit-scrollbar { width: 6px; }
        .notif-scrollbar::-webkit-scrollbar-track { background: #f4f4f5; border-radius: 10px; }
        .notif-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
        .notif-scrollbar::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }
      `}</style>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-zinc-950 animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 left-10 w-[340px] bg-white rounded-xl shadow-2xl border border-zinc-200 z-[100] flex flex-col animate-in fade-in slide-in-from-top-4 duration-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <h4 className="text-sm font-black text-zinc-900">Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider">Mark all read</button>
            )}
          </div>

          {/* 🔴 FIX: Class notif-scrollbar ditambahkan di sini */}
          <div className="max-h-[380px] overflow-y-auto notif-scrollbar flex flex-col">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-zinc-400">
                <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                <span className="text-xs font-medium">All caught up!</span>
              </div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {notifications.map(notif => (
                  <button key={notif.id} onClick={() => handleNotifClick(notif)} className={`w-full text-left p-4 transition-colors hover:bg-zinc-50 flex gap-3 items-start ${notif.is_read ? 'opacity-60' : 'bg-indigo-50/30'}`}>
                    <div className="mt-1 shrink-0">
                      {!notif.is_read ? <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200"></div> : <div className="w-2.5 h-2.5 rounded-full bg-zinc-200"></div>}
                    </div>
                    <div className="flex flex-col min-w-0 gap-1">
                      <span className={`text-xs font-bold truncate ${notif.is_read ? 'text-zinc-600' : 'text-zinc-900'}`}>{notif.title}</span>
                      <span className={`text-[11px] leading-relaxed ${notif.title.includes('Deadline') ? 'text-amber-600 font-medium' : 'text-zinc-500'}`}>{notif.message}</span>
                      <span className="text-[9px] text-zinc-400 mt-1 uppercase font-semibold tracking-wider">{new Date(notif.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute:'2-digit' })}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}