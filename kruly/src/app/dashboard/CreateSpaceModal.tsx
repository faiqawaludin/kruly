"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CreateSpaceModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    setIsLoading(true)

    try {
      // Panggil fungsi database (RPC) yang baru saja kita buat
      const { error: rpcError } = await supabase.rpc('create_new_workspace', {
        workspace_name: name
      })

      if (rpcError) throw new Error("Gagal membuat workspace: " + rpcError.message)

      // Sukses! Tutup modal dan refresh Sidebar
      setIsOpen(false)
      setName("")
      router.refresh() 
      
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-zinc-500 hover:text-white transition-colors" 
        title="Tambah Space Baru"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-zinc-900">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Buat Space Baru</h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Space</Label>
                  <Input 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Intern UTPE 2026" 
                    required 
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  Space adalah wadah tertinggi untuk mengelompokkan berbagai proyek tahunan.
                </p>
              </div>

              <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Buat Space"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}