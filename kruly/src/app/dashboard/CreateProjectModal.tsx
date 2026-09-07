"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Tambahkan prop isSidebarButton
export default function CreateProjectModal({ 
  workspaces, 
  isSidebarButton = false 
}: { 
  workspaces: any[],
  isSidebarButton?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const year = parseInt(formData.get('year') as string)
    const workspace_id = formData.get('workspace_id') as string

    try {
      const { error } = await supabase.rpc('create_new_project', {
        p_workspace_id: workspace_id,
        p_name: name,
        p_description: description,
        p_year: year
      })

      if (error) throw new Error(error.message)

      setIsOpen(false)
      router.refresh() 
    } catch (error: any) {
      alert("Gagal membuat proyek: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <Button disabled variant="outline" title="Buat Workspace (Space) terlebih dahulu di Sidebar">
        Buat Proyek Baru
      </Button>
    )
  }

  return (
    <>
      {/* RENDER TOMBOL BERBEDA TERGANTUNG LOKASINYA */}
      {isSidebarButton ? (
        <button 
          onClick={(e) => { 
            e.stopPropagation(); // Mencegah akordeon terbuka saat tombol plus diklik
            setIsOpen(true); 
          }} 
          className="text-zinc-500 hover:text-white p-1 transition-colors"
          title="Tambah Proyek di Space ini"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      ) : (
        <Button onClick={() => setIsOpen(true)}>Buat Proyek Baru</Button>
      )}

      {/* MODAL (Tetap sama persis) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-zinc-900">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Buat Proyek Baru</h3>
              <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-zinc-400 hover:text-zinc-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                
                {/* LOGIKA BARU: Tampilkan dropdown hanya jika bukan dari Sidebar */}
                {isSidebarButton ? (
                  // Jika dipanggil dari Sidebar, sembunyikan input tapi tetap kirim ID-nya
                  <input type="hidden" name="workspace_id" value={workspaces[0]?.id} />
                ) : (
                  // Jika dipanggil dari tempat lain (seperti Dashboard utama/MyTasks), tampilkan dropdown
                  <div className="space-y-2">
                    <Label htmlFor="workspace_id">Pilih Space (Workspace)</Label>
                    <select id="workspace_id" name="workspace_id" required className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">
                      {workspaces.map((ws) => (
                        <option key={ws.id} value={ws.id}>{ws.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Nama Proyek</Label>
                  <Input id="name" name="name" placeholder="Contoh: AMS Tracker" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi Singkat</Label>
                  <textarea id="description" name="description" rows={2} placeholder="Sistem pelacakan aset manufaktur..." className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Tahun Pelaksanaan</Label>
                  <Input id="year" name="year" type="number" defaultValue={new Date().getFullYear()} required />
                </div>
              </div>

              <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>Batal</Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Buat Proyek"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}