"use client"

import { useState } from "react"
import { inviteUserToKruly } from "@/app/actions/userActions"

export default function InviteUserModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const result = await inviteUserToKruly(email)

    if (result.success) {
      setMessage({ text: "Undangan berhasil dikirim ke email tersebut!", type: 'success' })
      setEmail("")
      // Opsional: Tutup modal otomatis setelah 2 detik
      setTimeout(() => {
        setIsOpen(false)
        setMessage(null)
      }, 2000)
    } else {
      setMessage({ text: result.message || "Terjadi kesalahan.", type: 'error' })
    }
    
    setIsSubmitting(false)
  }

  return (
    <>
      {/* TOMBOL TRIGGER (Tampil di Header) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Invite User
      </button>

      {/* MODAL POPUP */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()} // Mencegah modal tertutup saat area dalam di-klik
          >
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="text-base font-bold text-zinc-900 tracking-tight">Invite New User</h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-6">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide block mb-2">
                Alamat Email
              </label>
              <input 
                type="email" 
                required 
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rekan.kerja@perusahaan.com" 
                className="w-full h-11 border border-zinc-300 rounded-md px-4 text-sm focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500 transition-all bg-white mb-4" 
              />

              {message && (
                <div className={`p-3 rounded-md text-sm mb-4 font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {message.text}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !email} 
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Sending...
                    </>
                  ) : "Kirim Undangan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}