"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function CreateLinkModal({ projectId, isOpen, onClose }: { projectId: string, isOpen: boolean, onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const url = formData.get('url') as string

    try {
      const { error } = await supabase.from('project_links').insert([{ project_id: projectId, title, url }])
      if (error) throw new Error(error.message)
      
      router.refresh()
      onClose()
    } catch (error: any) {
      alert("Gagal menyimpan link: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-zinc-900" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h3 className="text-lg font-bold">Tambah Resource / Link</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Nama Dokumen</label>
              <input name="title" required placeholder="Contoh: PRD AMS Tracker" className="w-full h-9 text-sm border border-zinc-200 rounded-md px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" autoFocus />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">URL / Link Drive</label>
              <input name="url" type="url" required placeholder="https://docs.google.com/..." className="w-full h-9 text-sm border border-zinc-200 rounded-md px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
            </div>
          </div>
          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors">Batal</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50">
              {isLoading ? "Menyimpan..." : "Simpan Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}