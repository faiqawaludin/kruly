"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { deleteUserAccountMFA } from "@/app/actions/userActions"

const formatLogTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([])
  const [allWorkspaces, setAllWorkspaces] = useState<any[]>([])
  const [allProjects, setAllProjects] = useState<any[]>([])
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([])
  const [projectMembers, setProjectMembers] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  
  const [initialGlobalRole, setInitialGlobalRole] = useState("")
  const [tempGlobalRole, setTempGlobalRole] = useState("")
  const [tempWorkspaces, setTempWorkspaces] = useState<Set<string>>(new Set())
  const [tempProjects, setTempProjects] = useState<Set<string>>(new Set())
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState('users')

  // 🔴 STATE UNTUK SISTEM 2FA (MFA)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mfaState, setMfaState] = useState<'idle' | 'checking' | 'setup' | 'verify' | 'verified'>('idle')
  const [qrCodeSvg, setQrCodeSvg] = useState('')
  const [mfaFactorId, setMfaFactorId] = useState('')
  const [mfaCode, setMfaCode] = useState('')

  const supabase = createClient()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3000)
  }

  const fetchData = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: currProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setCurrentUserProfile(currProfile)
    }

    const [
      { data: profiles }, { data: workspaces }, { data: projects },
      { data: wMembers }, { data: pMembers }, { data: logs }
    ] = await Promise.all([
      supabase.from('profiles').select('*').order('full_name', { ascending: true }),
      supabase.from('workspaces').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('workspace_members').select('*'),
      supabase.from('project_members').select('*'),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false })
    ])

    if (profiles) setUsers(profiles)
    if (workspaces) setAllWorkspaces(workspaces)
    if (projects) setAllProjects(projects)
    if (wMembers) setWorkspaceMembers(wMembers)
    if (pMembers) setProjectMembers(pMembers)
    if (logs) setAuditLogs(logs)
      
    setIsLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const getWorkspaceCount = (userId: string) => workspaceMembers.filter(wm => wm.user_id === userId).length

  const openModal = (user: any) => {
    setSelectedUser(user); 
    setTempGlobalRole(user.global_role || 'member'); 
    setInitialGlobalRole(user.global_role || 'member')
    setIsRoleDropdownOpen(false) 
    setMfaState('idle') // Reset state modal ke tampilan Manage Access
    setMfaCode('')
    
    setTempWorkspaces(new Set(workspaceMembers.filter(wm => wm.user_id === user.id).map(wm => wm.workspace_id)))
    setTempProjects(new Set(projectMembers.filter(pm => pm.user_id === user.id).map(pm => pm.project_id)))
  }

  const closeModal = () => { setSelectedUser(null); setIsRoleDropdownOpen(false); setMfaState('idle') }

  const toggleWorkspace = (workspaceId: string) => {
    const newSet = new Set(tempWorkspaces); if (newSet.has(workspaceId)) newSet.delete(workspaceId); else newSet.add(workspaceId); setTempWorkspaces(newSet)
  }

  const toggleProject = (projectId: string) => {
    const newSet = new Set(tempProjects); if (newSet.has(projectId)) newSet.delete(projectId); else newSet.add(projectId); setTempProjects(newSet)
  }

  const handleSaveAkses = async () => {
    if (!selectedUser) return
    setIsSaving(true)
    try {
      if (tempGlobalRole !== initialGlobalRole) {
        await supabase.from('audit_logs').insert({ action: 'Update Role', executor_id: currentUserProfile?.id, executor_name: currentUserProfile?.full_name, target_user_id: selectedUser.id, target_user_name: selectedUser.full_name, details: `Changed role from '${initialGlobalRole}' to '${tempGlobalRole}'` })
      }
      await supabase.from('profiles').update({ global_role: tempGlobalRole }).eq('id', selectedUser.id)
      await supabase.from('workspace_members').delete().eq('user_id', selectedUser.id)
      if (tempWorkspaces.size > 0) {
        const newWkMembers = Array.from(tempWorkspaces).map(id => ({ user_id: selectedUser.id, workspace_id: id, role: 'member' }))
        await supabase.from('workspace_members').insert(newWkMembers)
      }
      await supabase.from('project_members').delete().eq('user_id', selectedUser.id)
      if (tempProjects.size > 0) {
        const newPrjMembers = Array.from(tempProjects).map(id => ({ user_id: selectedUser.id, project_id: id, role: 'member' }))
        await supabase.from('project_members').insert(newPrjMembers)
      }
      await supabase.from('audit_logs').insert({ action: 'Update Access', executor_id: currentUserProfile?.id, executor_name: currentUserProfile?.full_name, target_user_id: selectedUser.id, target_user_name: selectedUser.full_name, details: `Granted access to ${tempWorkspaces.size} workspaces & ${tempProjects.size} projects.` })
      await fetchData(); closeModal(); showToast(`Access updated for ${selectedUser.full_name}`, 'success')
    } catch (error: any) { showToast("Error: " + error.message, 'error') } finally { setIsSaving(false) }
  }

  const initiateDelete = async () => {
    setMfaState('checking')
    setMfaCode('')

    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    
    if (aalData?.currentLevel === 'aal2') {
      setMfaState('verified')
    } else if (aalData?.nextLevel === 'aal2') {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      if (factors?.totp?.[0]) {
        setMfaFactorId(factors.totp[0].id)
        setMfaState('verify')
      }
    } else {
      const { data: enrollData, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (!error && enrollData) {
        setMfaFactorId(enrollData.id)
        setQrCodeSvg(enrollData.totp.qr_code) // Supabase mengembalikan Data URI URL
        setMfaState('setup')
      } else {
        showToast("Failed to initialize 2FA system", 'error'); setMfaState('idle')
      }
    }
  }

  const verifyMfaAndExecute = async () => {
    setIsDeleting(true)
    try {
      if (mfaState !== 'verified') {
        const { data: challengeData } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId })
        const verifyRes = await supabase.auth.mfa.verify({
          factorId: mfaFactorId, challengeId: challengeData!.id, code: mfaCode
        })
        if (verifyRes.error) throw new Error("Invalid Authenticator Code!")
      }

      const result = await deleteUserAccountMFA(selectedUser.id)
      
      if (result.success) {
        showToast(`User ${selectedUser.full_name} successfully deleted.`, 'success')
        closeModal(); fetchData()
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      showToast(error.message, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const roleOptions = [
    { id: 'member', name: 'Member', desc: 'Standard access to assigned spaces.' },
    { id: 'admin', name: 'Admin', desc: 'Can manage users and system content.' }
  ]
  const isAdminOrSuperAdmin = currentUserProfile?.global_role === 'admin' || currentUserProfile?.global_role === 'super_admin'

  if (isLoading) return <div className="p-10 flex justify-center text-zinc-400">Loading management data...</div>

  return (
    <div className="max-w-6xl mx-auto w-full relative pb-20">
      
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[100] px-5 py-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-bottom-8 duration-300 ${toast.type === 'success' ? 'bg-zinc-900 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          )}
          {toast.message}
        </div>
      )}

      {/* HEADER & TABS */}
      <div className="border-b border-zinc-200 pb-2 mb-8 relative z-10 -mx-6 px-6 -mt-6 pt-6 bg-white">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">User Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage team members, global roles, and workspace access.</p>
        </div>
        <div className="flex gap-6 text-sm font-medium">
          <button onClick={() => setActiveTab('users')} className={`pb-3 border-b-2 transition-colors ${activeTab === 'users' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}>Users</button>
          {isAdminOrSuperAdmin && (
            <button onClick={() => setActiveTab('logs')} className={`pb-3 border-b-2 transition-colors ${activeTab === 'logs' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}>Security Logs</button>
          )}
        </div>
      </div>

      <div className="pt-2 w-full px-2">
        
        {/* --- TAB 1: USERS --- */}
        {activeTab === 'users' && (
          <div className="animate-in fade-in duration-300">
            <div className="grid grid-cols-12 gap-4 border-b border-zinc-200 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <div className="col-span-4 pl-2">Name</div><div className="col-span-3">Role</div><div className="col-span-3">Access</div><div className="col-span-2 text-right pr-2">Action</div>
            </div>

            <div className="flex flex-col">
              {users.map((user) => (
                <div key={user.id} className="grid grid-cols-12 gap-4 py-3.5 items-center border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                  <div className="col-span-4 pl-2 flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-zinc-800 truncate">{user.full_name || 'Unnamed'}</span>
                    <span className="text-[10px] text-zinc-400 font-mono mt-0.5">{user.id.substring(0, 8)}</span>
                  </div>
                  <div className="col-span-3">
                    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider ${user.global_role === 'super_admin' ? 'text-amber-600' : user.global_role === 'admin' ? 'text-indigo-600' : 'text-zinc-500'}`}>{user.global_role || 'member'}</span>
                  </div>
                  <div className="col-span-3 text-xs text-zinc-500"><span className="font-semibold text-zinc-700">{getWorkspaceCount(user.id)}</span> Workspaces</div>
                  
                  <div className="col-span-2 flex justify-end pr-2">
                    {/* 🔴 TOMBOL MANAGE TUNGGAL */}
                    <button onClick={() => openModal(user)} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wide">
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 2: LOGS --- */}
        {activeTab === 'logs' && isAdminOrSuperAdmin && (
          <div className="animate-in fade-in duration-300">
             <div className="grid grid-cols-12 gap-4 border-b border-zinc-200 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <div className="col-span-2 pl-2">Time</div><div className="col-span-2">Action</div><div className="col-span-3">Target User</div><div className="col-span-5 pr-2">Details</div>
            </div>
            {auditLogs.length === 0 ? <div className="py-10 text-center text-sm text-zinc-400">No logs found.</div> : (
              <div className="flex flex-col">
                {auditLogs.map((log) => (
                  <div key={log.id} className="grid grid-cols-12 gap-4 py-3.5 items-center border-b border-zinc-100 text-sm">
                    <div className="col-span-2 pl-2 text-[11px] text-zinc-500">{formatLogTime(log.created_at)}</div>
                    <div className="col-span-2"><span className={`text-[10px] font-bold uppercase tracking-wider ${log.action.includes('Role') ? 'text-amber-600' : 'text-indigo-600'}`}>{log.action}</span></div>
                    <div className="col-span-3 flex flex-col"><span className="font-semibold text-zinc-800">{log.target_user_name || 'Anonymous'}</span><span className="text-[10px] text-zinc-400">by: {log.executor_name}</span></div>
                    <div className="col-span-5 pr-2 text-zinc-600 text-[12px] leading-tight truncate">{log.details}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* --- UNIFIED MODAL (MANAGE & DELETE) --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-zinc-900">
                {mfaState === 'idle' ? `Manage Access: ${selectedUser.full_name}` : 'Security Check'}
              </h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-700 p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-7 custom-scrollbar relative">
              
              {/* 🔴 TAMPILAN MANAGE ACCESS BIASA */}
              {mfaState === 'idle' && (
                <div className="space-y-7 animate-in fade-in duration-300">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Global System Role</label>
                    {selectedUser.global_role === 'super_admin' ? (
                      <div className="w-full h-11 border border-amber-200 bg-amber-50 rounded-xl px-4 flex items-center text-sm text-amber-700 cursor-not-allowed">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" clipRule="evenodd" /></svg>
                        <span className="font-bold mr-1">Super Admin</span> (Database change required)
                      </div>
                    ) : (
                      <div className="relative">
                        <button type="button" onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)} className={`w-full h-11 border bg-white rounded-xl px-4 flex items-center justify-between text-sm transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/10 ${isRoleDropdownOpen ? 'border-indigo-500 shadow-sm' : 'border-zinc-200 hover:border-zinc-300'}`}>
                          <span className="font-semibold text-zinc-900">{roleOptions.find(r => r.id === tempGlobalRole)?.name || 'Select Role...'}</span>
                          <svg className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180 text-indigo-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {isRoleDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsRoleDropdownOpen(false)}></div>
                            <div className="absolute z-50 w-full mt-2 bg-white border border-zinc-100 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 py-1">
                              {roleOptions.map((role) => (
                                <button key={role.id} type="button" onClick={() => { setTempGlobalRole(role.id); setIsRoleDropdownOpen(false) }} className={`w-full text-left px-4 py-2.5 hover:bg-zinc-50 transition-colors flex flex-col ${tempGlobalRole === role.id ? 'bg-indigo-50/50' : ''}`}>
                                  <div className="flex items-center justify-between">
                                    <span className={`text-sm font-semibold ${tempGlobalRole === role.id ? 'text-indigo-700' : 'text-zinc-800'}`}>{role.name}</span>
                                    {tempGlobalRole === role.id && <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                  </div>
                                  <span className="text-[11px] text-zinc-500 mt-0.5">{role.desc}</span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-3">Workspace & Project Access</label>
                    {allWorkspaces.length === 0 ? <p className="text-sm text-zinc-500 italic">No workspaces available.</p> : (
                      <div className="space-y-4">
                        {allWorkspaces.map(wk => {
                          const projectsInWk = allProjects.filter(p => p.workspace_id === wk.id)
                          const isWkChecked = tempWorkspaces.has(wk.id)
                          return (
                            <div key={wk.id} className="border border-zinc-100 rounded-xl p-4 bg-zinc-50/50 transition-colors">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={isWkChecked} onChange={() => toggleWorkspace(wk.id)} className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                                <span className="font-semibold text-zinc-800 text-sm">{wk.name}</span>
                              </label>
                              {projectsInWk.length > 0 && (
                                <div className="mt-3 ml-7 space-y-2.5 border-l-2 border-zinc-200 pl-4 py-0.5">
                                  {projectsInWk.map(prj => (
                                    <label key={prj.id} className="flex items-center gap-2.5 cursor-pointer group">
                                      <input type="checkbox" checked={tempProjects.has(prj.id)} onChange={() => toggleProject(prj.id)} className="w-3.5 h-3.5 rounded border-zinc-300 text-amber-500 focus:ring-amber-500 cursor-pointer" />
                                      <span className="text-sm text-zinc-600 group-hover:text-zinc-800 transition-colors">{prj.name} <span className="text-[10px] text-zinc-400 font-medium px-1.5 py-0.5 bg-white border border-zinc-100 rounded ml-1.5">{prj.category}</span></span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 🔴 TAMPILAN 2FA / DELETE VERIFICATION */}
              {mfaState !== 'idle' && (
                <div className="text-center animate-in slide-in-from-right-8 duration-300">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  
                  {mfaState === 'checking' && <p className="text-sm text-zinc-500 mb-6">Checking security constraints...</p>}

                  {mfaState === 'setup' && (
                    <div className="mb-6">
                      <p className="text-xs text-zinc-500 mb-4 px-2">Scan this QR code with <strong>Google Authenticator</strong> or <strong>Authy</strong> to secure your Admin account before deleting users.</p>
                      {/* 🔴 FIX QR CODE: Memakai tag <img> karena Supabase mereturn Data URI Image */}
                      <div className="w-48 h-48 mx-auto bg-white border border-zinc-200 p-3 rounded-xl shadow-sm mb-6 flex items-center justify-center">
                        {qrCodeSvg ? (
                          <img src={qrCodeSvg} alt="2FA QR Code" className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                      <input type="text" placeholder="6-Digit Code" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} className="w-full h-11 border border-zinc-200 rounded-xl px-4 text-center tracking-[0.5em] font-mono font-bold focus:outline-none focus:border-indigo-500" />
                    </div>
                  )}

                  {mfaState === 'verify' && (
                    <div className="mb-6">
                      <p className="text-xs text-zinc-500 mb-4">Enter the 6-digit code from your Authenticator app.</p>
                      <input type="text" autoFocus placeholder="••••••" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-center text-lg tracking-[0.5em] font-mono font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                    </div>
                  )}

                  {mfaState === 'verified' && (
                    <p className="text-sm text-zinc-600 mb-6">
                      2FA Verified. Are you sure you want to permanently delete <strong>{selectedUser.full_name}</strong>?
                    </p>
                  )}
                </div>
              )}

            </div>

            {/* 🔴 FOOTER MODAL */}
            <div className="px-6 py-4 border-t border-zinc-100 bg-white flex justify-between items-center rounded-b-2xl">
              
              {/* Kiri: Tombol Delete User (Hanya muncul saat mfaState === 'idle') */}
              <div className="flex-1">
                {mfaState === 'idle' && isAdminOrSuperAdmin && currentUserProfile?.id !== selectedUser.id && (
                  <button onClick={initiateDelete} className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wide">
                    Delete User
                  </button>
                )}
              </div>

              {/* Kanan: Action Buttons */}
              <div className="flex gap-3">
                {mfaState === 'idle' ? (
                  <>
                    <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors">Cancel</button>
                    <button onClick={handleSaveAkses} disabled={isSaving} className="px-5 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50 flex items-center shadow-sm">
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setMfaState('idle')} className="px-4 py-2 text-sm font-semibold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors">Back</button>
                    <button onClick={verifyMfaAndExecute} disabled={isDeleting || (mfaState !== 'verified' && mfaCode.length < 6)} className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm">
                      {isDeleting ? "Processing..." : mfaState === 'verified' ? "Confirm Delete" : "Verify & Delete"}
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}