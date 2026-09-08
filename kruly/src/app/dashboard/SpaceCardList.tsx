"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SpaceCardList({ workspaces }: { workspaces: any[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="col-span-full p-8 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50">
        <p className="text-zinc-500">Anda belum tergabung dalam Space (Workspace) apapun.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((item: any) => {
        const ws = item.workspaces
        if (!ws) return null
        const isExpanded = expanded[ws.id]

        return (
          <Card key={ws.id} className="border-zinc-200 hover:shadow-md transition-all flex flex-col">
            <CardHeader className="pb-3 border-b border-zinc-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-base">{ws.name}</CardTitle>
                    <span className="text-xs text-zinc-500 capitalize">Role: {item.role}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4 flex-1 flex flex-col">
              {/* Tombol Expand untuk melihat Proyek */}
              <button 
                onClick={() => toggleExpand(ws.id)}
                className="flex items-center justify-between w-full text-sm font-medium text-zinc-700 hover:text-indigo-600 mb-2 transition-colors"
              >
                <span>{ws.projects?.length || 0} Proyek Tersedia</span>
                <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Daftar Proyek (Muncul jika di-expand) */}
              {isExpanded && (
                <div className="space-y-1 mb-4 mt-2 animate-in slide-in-from-top-2 duration-200">
                  {ws.projects?.length === 0 ? (
                    <div className="text-xs text-zinc-500 italic px-2 py-1">Belum ada proyek</div>
                  ) : (
                    ws.projects?.map((proj: any) => (
                      <Link key={proj.id} href={`/dashboard/projects/${proj.id}`} className="block px-3 py-2 text-sm text-zinc-600 bg-zinc-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-md truncate transition-colors">
                        • {proj.name}
                      </Link>
                    ))
                  )}
                </div>
              )}

              {/* Tombol Menuju Dashboard Space */}
              <div className="mt-auto pt-4">
                <Link href={`/dashboard/spaces/${ws.id}`}>
                  <Button className="w-full text-xs h-8" variant="default">
                    Buka Dashboard Space
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}