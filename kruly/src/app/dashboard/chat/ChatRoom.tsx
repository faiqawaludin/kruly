"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"

export default function ChatRoom({ currentUser, initialMessages, mentionList }: any) {
  const [messages, setMessages] = useState<any[]>(initialMessages)
  const [text, setText] = useState("")
  
  // State untuk fitur @mention
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionCursorIndex, setMentionCursorIndex] = useState(0)
  
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  // Auto-scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime Listener
  useEffect(() => {
    const channel = supabase.channel('global-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
        async (payload) => {
          // Ambil nama pengirim dari tabel profiles karena payload DB hanya bawa sender_id
          const { data: senderProfile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', payload.new.sender_id).single()
          
          const newMessage = { ...payload.new, sender: senderProfile }
          setMessages(prev => [...prev, newMessage])
        }
      ).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Fungsi menangani ketikan & mendeteksi @
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setText(val)

    // Logika Mendeteksi Mention (@)
    const cursorPosition = e.target.selectionStart
    const textBeforeCursor = val.slice(0, cursorPosition)
    
    // Regex: Mencari tanda @ yang diikuti huruf/angka tanpa spasi tepat sebelum kursor
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/)

    if (match) {
      setShowMentions(true)
      setMentionQuery(match[1].toLowerCase()) // Kata setelah @
      setMentionCursorIndex(match.index!) // Posisi index tanda @
    } else {
      setShowMentions(false)
    }
  }

  // Fungsi saat user memilih nama dari popup mention
  const insertMention = (user: any) => {
    const textBeforeMention = text.slice(0, mentionCursorIndex)
    const textAfterCursor = text.slice(inputRef.current?.selectionStart || 0)
    
    // Sisipkan format mention yang solid
    const newText = `${textBeforeMention}@${user.full_name} ${textAfterCursor}`
    
    setText(newText)
    setShowMentions(false)
    inputRef.current?.focus()
  }

  // Fungsi Kirim Pesan
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!text.trim()) return

    const messageContent = text
    setText("") // Langsung kosongkan input agar terasa responsif
    setShowMentions(false)

    try {
      // 1. Simpan pesan ke DB
      await supabase.from('messages').insert({
        sender_id: currentUser.id,
        content: messageContent
      })

      // 2. 🔴 FITUR DEWA: DETEKSI SIAPA YANG DI-TAG UNTUK NOTIFIKASI
      mentionList.forEach(async (member: any) => {
        // Jika nama lengkap member ada di dalam pesan setelah tanda @
        if (messageContent.includes(`@${member.full_name}`)) {
          await supabase.from('notifications').insert({
            user_id: member.id,
            title: 'Kamu Di-tag di Global Chat 💬',
            message: `${currentUser.full_name} menyebutmu: "${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}"`,
            link: '/dashboard/chat'
          })
        }
      })

    } catch (error) {
      console.error("Gagal mengirim pesan", error)
    }
  }

  // Filter daftar user yang muncul di popup berdasarkan ketikan setelah @
  const filteredMentions = mentionList.filter((m: any) => 
    (m.full_name || '').toLowerCase().includes(mentionQuery)
  )

  // Helper untuk mewarnai teks yang mengandung @nama
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(@[a-zA-Z0-9_\s]+)/g)
    return parts.map((part, i) => {
      // Cek apakah part ini berawalan @ dan namanya ada di mentionList
      const isMention = part.startsWith('@') && mentionList.some((m:any) => part.includes(m.full_name))
      
      // Jika user yang login yang di-tag, warnanya beda (lebih menyala)
      const isMeMentioned = part.startsWith('@') && part.includes(currentUser.full_name)

      if (isMeMentioned) {
        return <span key={i} className="bg-amber-100 text-amber-700 font-bold px-1 rounded-sm mx-0.5">{part}</span>
      } else if (isMention) {
        return <span key={i} className="bg-indigo-100 text-indigo-700 font-bold px-1 rounded-sm mx-0.5">{part}</span>
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-50 relative">
      
      {/* AREA PESAN (SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUser.id
          
          return (
            <div key={msg.id || i} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end group`}>
              
              {/* AVATAR */}
              <div className="shrink-0 mb-1">
                {msg.sender?.avatar_url ? (
                  <img src={msg.sender.avatar_url} className="w-8 h-8 rounded-full object-cover border border-zinc-200" alt="Avatar" />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${isMe ? 'bg-indigo-600 text-white' : 'bg-white border border-zinc-200 text-zinc-600'}`}>
                    {(msg.sender?.full_name || 'U').substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* BUBBLE CHAT */}
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-[11px] font-bold text-zinc-700">{isMe ? 'Kamu' : msg.sender?.full_name}</span>
                  <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider">{new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-sm'}`}>
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            </div>
          )
        })}
        {/* Anchor untuk auto-scroll */}
        <div ref={bottomRef} />
      </div>

      {/* AREA INPUT CHAT */}
      <div className="shrink-0 p-6 bg-white border-t border-zinc-200 relative">
        
        {/* 🔴 POPUP @MENTION */}
        {showMentions && filteredMentions.length > 0 && (
          <div className="absolute bottom-full left-6 mb-2 w-64 bg-white border border-zinc-200 shadow-xl rounded-xl py-2 flex flex-col z-50 animate-in slide-in-from-bottom-2 duration-100">
            <div className="px-4 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Tag Members</div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              {filteredMentions.map((user: any) => (
                <button 
                  key={user.id} 
                  type="button"
                  onClick={() => insertMention(user)}
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[9px] font-bold text-zinc-600 shrink-0">
                    {user.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-zinc-800 truncate">{user.full_name}</span>
                    <span className="text-[9px] text-zinc-400 uppercase font-medium">{user.global_role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* INPUT BOX */}
        <form onSubmit={handleSendMessage} className="relative flex items-end gap-3">
          <textarea 
            ref={inputRef}
            value={text}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              // Jika tekan Enter (tanpa shift), langsung kirim
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Ketik pesan atau ketik @ untuk nge-tag rekan tim..."
            className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all rounded-2xl px-5 py-3.5 text-sm resize-none outline-none custom-scrollbar min-h-[52px] max-h-[120px]"
            rows={1}
            style={{ height: 'auto' }}
          />
          <button 
            type="submit" 
            disabled={!text.trim()}
            className="shrink-0 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 text-white rounded-full flex items-center justify-center transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </form>
        <p className="text-[10px] text-zinc-400 font-medium mt-2 px-2 text-center">Tekan <kbd className="bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-500 font-mono">Enter</kbd> untuk mengirim pesan. Shift + Enter untuk garis baru.</p>
      </div>

    </div>
  )
}