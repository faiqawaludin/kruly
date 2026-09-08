"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function EditProjectModal({ 
  projectId, 
  isOpen, 
  onClose 
}: { 
  projectId: string | null, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    year: new Date().getFullYear(),
    category: "General"
  })

  // Tarik data proyek paling segar dari database saat modal dibuka!
  useEffect(() => {
    if (isOpen && projectId) {
      const fetchProject = async () => {
        setIsFetching(true)
        const { data } = await supabase.from('projects').select('*').eq('id', projectId).single()
        if (data) {
          setFormData({
            name: data.name || "",
            description: data.description || "",
            year: data.year || new Date().getFullYear(),
            category: data.category || "General"
          })
        }
        setIsFetching(false)
      }
      fetchProject()
    }
  }, [isOpen, projectId, supabase])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: formData.name,
          description: formData.description,
          year: formData.year,
          category: formData.category
        })
        .eq('id', projectId)

      if (error) throw new Error(error.message)

      router.refresh() 
      onClose()
    } catch (error: any) {
      alert("Gagal menyimpan perubahan: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-zinc-900" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h3 className="text-lg font-bold">Edit Detail Proyek</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {isFetching ? (
          <div className="p-10 flex justify-center items-center text-sm text-zinc-500 font-medium">Memuat data proyek...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Nama Proyek</label>
                <input 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full h-9 text-sm border border-zinc-200 rounded-md px-3 focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Deskripsi Singkat</label>
                <textarea 
                  rows={3} 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full text-sm border border-zinc-200 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" 
                  placeholder="Tambahkan deskripsi..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Tahun Pelaksanaan</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                    className="w-full h-9 text-sm border border-zinc-200 rounded-md px-3 focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Kategori Proyek</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full h-9 text-sm border border-zinc-200 rounded-md px-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-indigo-700"
                  >
                    <option value="General">General</option>
                    <option value="Corporate Planning">Corporate Planning</option>
                    <option value="Digitalisasi">Digitalisasi</option>
                  </select>
                </div>
              </div>

            </div>
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors">Batal</button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50">
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}