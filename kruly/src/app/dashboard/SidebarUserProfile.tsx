"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function SidebarUserProfile({ 
  user, 
  initialProfile 
}: { 
  user: any, 
  initialProfile: any 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const [fullName, setFullName] = useState(initialProfile?.full_name || "")
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || "")
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const userEmail = user?.email || ""
  const displayLetter = fullName ? fullName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase()
  const displayName = fullName || userEmail.split('@')[0]

  // ==========================================
  // FUNGSI UPLOAD FOTO (MAX 1 MB + AUTO DELETE LAMA)
  // ==========================================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      
      // 🔴 1. VALIDASI UKURAN FILE (Maksimal 1 MB = 1048576 bytes)
      if (file.size > 1 * 1024 * 1024) {
        alert("Peringatan: Ukuran foto terlalu besar! Maksimal 1 MB.")
        // Reset input file agar bisa pilih ulang
        if (fileInputRef.current) fileInputRef.current.value = ""
        return
      }

      setIsUploading(true)

      // 🔴 2. HAPUS FOTO LAMA DARI BUCKET (Jika sebelumnya sudah ada foto)
      if (avatarUrl) {
        // Ekstrak nama file dari URL (contoh: url.com/.../avatars/namafile123.jpg -> ambil namafile123.jpg)
        const oldFileName = avatarUrl.split('/').pop()
        if (oldFileName) {
          // Eksekusi penghapusan di background
          await supabase.storage.from('avatars').remove([oldFileName])
        }
      }

      // 🔴 3. UPLOAD FOTO BARU
      const fileExt = file.name.split('.').pop()
      // Gunakan kombinasi User ID + Waktu sekarang agar namanya selalu unik dan browser tidak menyimpan cache foto lama
      const fileName = `${user.id}-${Date.now()}.${fileExt}` 

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Dapatkan URL publik dari foto tersebut
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      setAvatarUrl(data.publicUrl) // Langsung tampilkan di layar
      
    } catch (error: any) {
      alert("Gagal upload foto: " + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  // FUNGSI SIMPAN PROFIL
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })

      if (error) throw error

      setIsOpen(false)
      router.refresh() 
    } catch (error: any) {
      alert("Gagal menyimpan profil: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {/* TOMBOL PROFIL DI POJOK KIRI BAWAH SIDEBAR */}
      <div 
        onClick={() => setIsOpen(true)}
        className="p-4 border-t border-zinc-900 cursor-pointer hover:bg-zinc-900 transition-colors group"
      >
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-zinc-700 group-hover:border-indigo-500 transition-colors" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white group-hover:bg-indigo-500 transition-colors">
              {displayLetter}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{displayName}</p>
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Pengaturan Akun</p>
          </div>
        </div>
      </div>

      {/* MODAL PENGATURAN PROFIL */}
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-zinc-900" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="text-lg font-bold">Profil Akun</h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="p-6 flex flex-col items-center space-y-6">
                
                {/* UPLOAD FOTO */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()} title="Klik untuk ubah foto (Maks 1 MB)">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-zinc-100 shadow-sm group-hover:opacity-75 transition-opacity" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-black border-4 border-zinc-100 shadow-sm group-hover:bg-indigo-200 transition-colors">
                      {displayLetter}
                    </div>
                  )}
                  
                  {/* Overlay Ikon Kamera */}
                  <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploading ? (
                      <span className="text-white text-xs font-bold animate-pulse">Wait...</span>
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} disabled={isUploading} />
                </div>

                <div className="w-full space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Email (Login)</label>
                    <input disabled value={userEmail} className="w-full h-10 text-sm border border-zinc-200 bg-zinc-100 text-zinc-500 rounded-md px-3 outline-none cursor-not-allowed" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Nama Lengkap</label>
                    <input 
                      required autoFocus
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap..."
                      className="w-full h-10 text-sm border border-zinc-300 rounded-md px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" 
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors">Batal</button>
                <button type="submit" disabled={isSaving || isUploading} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50">
                  {isSaving ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}