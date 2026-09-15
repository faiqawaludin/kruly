"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function SidebarUserProfile({ 
  user, 
  initialProfile,
  userRole = "Member" 
}: { 
  user: any, 
  initialProfile: any,
  userRole?: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // State untuk Tab Modal
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')
  
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const [fullName, setFullName] = useState(initialProfile?.full_name || "")
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || "")
  
  // State untuk form ganti password
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwdError, setPwdError] = useState("")
  const [pwdSuccess, setPwdSuccess] = useState("")
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const userEmail = user?.email || ""
  const displayLetter = fullName ? fullName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase()
  const displayName = fullName || userEmail.split('@')[0]

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error: any) {
      alert("Gagal logout: " + error.message)
      setIsLoggingOut(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      
      if (file.size > 1 * 1024 * 1024) {
        alert("Peringatan: Ukuran foto terlalu besar! Maksimal 1 MB.")
        if (fileInputRef.current) fileInputRef.current.value = ""
        return
      }

      setIsUploading(true)

      if (avatarUrl) {
        const oldFileName = avatarUrl.split('/').pop()
        if (oldFileName) {
          await supabase.storage.from('avatars').remove([oldFileName])
        }
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}` 

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      setAvatarUrl(data.publicUrl) 
      
    } catch (error: any) {
      alert("Gagal upload foto: " + error.message)
    } finally {
      setIsUploading(false)
    }
  }

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

  // 🔴 FUNGSI GANTI PASSWORD DARI DALAM MODAL
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setPwdError("")
    setPwdSuccess("")

    if (newPassword !== confirmPassword) {
      setPwdError("Password baru dan konfirmasi tidak cocok!")
      setIsSaving(false)
      return
    }

    if (newPassword.length < 6) {
      setPwdError("Password minimal harus 6 karakter.")
      setIsSaving(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      setPwdError(error.message)
    } else {
      setPwdSuccess("Password berhasil diperbarui!")
      setNewPassword("")
      setConfirmPassword("")
    }
    
    setIsSaving(false)
  }

  // Fungsi utilitas untuk reset form saat tutup modal
  const handleCloseModal = () => {
    setIsOpen(false)
    setActiveTab('profile')
    setPwdError("")
    setPwdSuccess("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="relative w-full">
      
      {isMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
      )}

      {isMenuOpen && (
        <div className="absolute bottom-full left-4 mb-2 w-56 bg-zinc-800 border border-zinc-700 shadow-2xl rounded-xl py-1.5 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="px-4 py-3 border-b border-zinc-700/50 mb-1 bg-zinc-800/50">
            <p className="text-sm font-bold text-white truncate">{displayName}</p>
            <p className="text-[10px] text-zinc-400 truncate mt-0.5">{userEmail}</p>
          </div>
          
          <button 
            onClick={() => { setIsMenuOpen(false); setIsOpen(true); setActiveTab('profile'); }}
            className="w-full text-left px-4 py-2 hover:bg-zinc-700/50 text-xs font-medium text-zinc-300 flex items-center gap-2.5 transition-colors"
          >
            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Pengaturan Profil
          </button>
          
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-xs font-medium text-red-400 flex items-center gap-2.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {isLoggingOut ? "Keluar..." : "Keluar (Logout)"}
          </button>
        </div>
      )}

      <div 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-4 border-t border-zinc-900 cursor-pointer hover:bg-zinc-900 transition-colors group relative z-50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-9 h-9 rounded-full object-cover shrink-0 border border-zinc-700 group-hover:border-indigo-500 transition-colors" />
            ) : (
              <div className="w-9 h-9 rounded-full shrink-0 bg-indigo-600 flex items-center justify-center font-bold text-sm text-white group-hover:bg-indigo-500 transition-colors">
                {displayLetter}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{displayName}</p>
              <p className={`text-[10px] font-bold uppercase tracking-widest truncate mt-0.5 ${userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'super_admin' ? 'text-indigo-400' : 'text-zinc-500'}`}>
                {userRole.replace('_', ' ')}
              </p>
            </div>
          </div>
          <svg className={`w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
        </div>
      </div>

      {/* 🔴 MODAL PROFIL & SETTINGS */}
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-zinc-900" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="text-lg font-bold tracking-tight">Akun Saya</h3>
              <button onClick={handleCloseModal} className="text-zinc-400 hover:text-zinc-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* TAB NAVIGASI */}
            <div className="flex border-b border-zinc-100 px-6 pt-2">
              <button 
                onClick={() => setActiveTab('profile')} 
                className={`pb-3 text-sm font-semibold transition-colors border-b-2 mr-6 ${activeTab === 'profile' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
              >
                Data Profil
              </button>
              <button 
                onClick={() => setActiveTab('security')} 
                className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'security' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
              >
                Keamanan
              </button>
            </div>

            {/* ISI TAB: DATA PROFIL */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="animate-in fade-in duration-200">
                <div className="p-6 flex flex-col items-center space-y-6">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()} title="Klik untuk ubah foto (Maks 1 MB)">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-zinc-100 shadow-sm group-hover:opacity-75 transition-opacity" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-black border-4 border-zinc-100 shadow-sm group-hover:bg-indigo-200 transition-colors">
                        {displayLetter}
                      </div>
                    )}
                    
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
                        className="w-full h-10 text-sm border border-zinc-300 rounded-md px-3 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" 
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors">Batal</button>
                  <button type="submit" disabled={isSaving || isUploading} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50">
                    {isSaving ? "Menyimpan..." : "Simpan Profil"}
                  </button>
                </div>
              </form>
            )}

            {/* 🔴 ISI TAB: KEAMANAN (GANTI PASSWORD) */}
            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword} className="animate-in fade-in duration-200">
                <div className="p-6 flex flex-col space-y-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Password Baru</label>
                    <input 
                      required
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full h-10 text-sm border border-zinc-300 rounded-md px-3 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Konfirmasi Password</label>
                    <input 
                      required
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang password baru"
                      className="w-full h-10 text-sm border border-zinc-300 rounded-md px-3 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" 
                    />
                  </div>

                  {pwdError && <p className="text-[12px] font-semibold text-red-500 bg-red-50 p-2 rounded border border-red-100 mt-2">{pwdError}</p>}
                  {pwdSuccess && <p className="text-[12px] font-semibold text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-100 mt-2">{pwdSuccess}</p>}
                  
                </div>

                <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors">Batal</button>
                  <button type="submit" disabled={isSaving || !newPassword || !confirmPassword} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50">
                    {isSaving ? "Menyimpan..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  )
}