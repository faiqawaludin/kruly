"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createTask } from "./actions"

export default function CreateTaskModal({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Fungsi untuk menangani submit form
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createTask(projectId, formData)
      setIsOpen(false) // Tutup modal setelah sukses
    })
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>+ Tambah Task</Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-900">Task Baru</h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form action={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Task <span className="text-red-500">*</span></Label>
                  <Input id="name" name="name" placeholder="Contoh: Desain Mockup UI" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <textarea 
                    id="description" 
                    name="description" 
                    rows={3}
                    className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                    placeholder="Detail tugas..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select id="status" name="status" className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Approved">Approved</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioritas</Label>
                    <select id="priority" name="priority" className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Tenggat Waktu (Due Date)</Label>
                  <Input id="due_date" name="due_date" type="date" />
                </div>
              </div>

              <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Simpan Task"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}