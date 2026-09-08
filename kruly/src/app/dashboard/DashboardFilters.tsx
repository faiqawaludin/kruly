"use client"

import { useRouter, useSearchParams } from "next/navigation"

export default function DashboardFilters({ isAdmin, userId }: { isAdmin: boolean, userId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 1. Dapatkan Tahun Saat Ini secara Real-time (TODAY)
  const todayYear = new Date().getFullYear() // Akan otomatis 2026
  
  // 2. Buat array 5 tahun (2 tahun ke belakang, tahun ini, 2 tahun ke depan)
  const years = Array.from({length: 5}, (_, i) => todayYear - 2 + i)

  // 3. Set default value ke Tahun Ini jika tidak ada parameter di URL
  const currentYear = searchParams.get('year') || todayYear.toString()
  const currentPic = searchParams.get('pic') || ""

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-zinc-500 uppercase mr-1">Filter:</span>
      
      {/* FILTER TAHUN DINAMIS */}
      <select 
        value={currentYear} 
        onChange={(e) => updateFilter('year', e.target.value)}
        className="h-8 text-sm border-zinc-200 text-zinc-700 bg-white rounded-md pl-3 pr-8 focus:ring-2 focus:ring-indigo-500"
      >
        {years.map((y) => (
          <option key={y} value={y}>Tahun {y}</option>
        ))}
      </select>

      {/* FILTER PIC (Hanya Admin) */}
      {isAdmin && (
        <select 
          value={currentPic} 
          onChange={(e) => updateFilter('pic', e.target.value)}
          className="h-8 text-sm border-zinc-200 text-zinc-700 bg-white rounded-md pl-3 pr-8 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Semua Anggota</option>
          <option value={userId}>Tugas Saya Sendiri</option>
        </select>
      )}
    </div>
  )
}