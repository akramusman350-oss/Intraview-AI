"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Home,
  FileText,
  Code,
  Users,
  Video,
  Sliders,
  BarChart3,
  Settings,
  LogOut,
  Eye,
  EyeOff,
  Edit,
  Ban,
  Mail,
  Search,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

interface AdminCandidatesProps {
  onNavigate: (page: string) => void
  onLogout: () => void
}

interface Candidate {
  id: string
  email: string
  profile_info?: { name?: string; photo_filename?: string }
  status: string
  sessionsCount?: number
  avgScore?: number
  lastInterview?: string
  created_at?: string
}

interface InvitedCandidate {
  id: string
  email: string
  name: string
  invited_by: string
  invited_at: string
  status: string
}

export function AdminCandidates({ onNavigate, onLogout }: AdminCandidatesProps) {
  const { toast } = useToast()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [invitedCandidates, setInvitedCandidates] = useState<InvitedCandidate[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: "", name: "" })
  const [inviteLoading, setInviteLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"registered" | "invited">("registered")
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null)
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null)
  const [editForm, setEditForm] = useState({ name: "", status: "active", newPassword: "", showPassword: false })
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [candidatePhotoUrl, setCandidatePhotoUrl] = useState<string | null>(null)

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true)
      console.log("Fetching candidates from API...")
      const data = await api.get<any[]>("/admin/candidates")
      console.log("Raw fetched candidates:", data)
      console.log("Number of candidates received:", data?.length || 0)
      
      if (!data || !Array.isArray(data)) {
        console.error("Invalid data received:", data)
        setCandidates([])
        return
      }
      
      // Process candidates and ensure IDs are valid
      const validCandidates: Candidate[] = data
        .map((c: any) => {
          // Handle both _id and id fields
          let candidateId = c.id || c._id
          
          // If _id is an ObjectId, convert it
          if (candidateId && typeof candidateId === 'object' && candidateId.toString) {
            candidateId = candidateId.toString()
          }
          
          // Convert to string if not already
          if (candidateId) {
            candidateId = String(candidateId)
          }
          
          if (candidateId && candidateId !== "None" && candidateId !== "undefined" && candidateId !== "null") {
            const processed = {
              ...c,
              id: candidateId, // Ensure it's a string
            } as Candidate
            console.log("Processed candidate:", processed.email, "ID:", processed.id)
            return processed
          }
          console.warn("Candidate without valid ID:", c.email, "ID value:", candidateId)
          return null
        })
        .filter((c): c is Candidate => {
          if (!c) {
            return false
          }
          if (!c.id || c.id === "None" || c.id === "undefined" || c.id === "null" || c.id.length === 0) {
            console.warn("Filtered out candidate with invalid ID:", c.email, "ID:", c.id)
            return false
          }
          return true
        })
      
      console.log("Valid candidates after processing:", validCandidates.length)
      console.log("Valid candidates:", validCandidates)
      setCandidates(validCandidates)
      
      if (validCandidates.length === 0 && data.length > 0) {
        console.error("All candidates were filtered out! Raw data:", data)
        toast({
          variant: "destructive",
          title: "Warning",
          description: `Received ${data.length} candidates but all were filtered out. Check console for details.`,
        })
      }
    } catch (error: any) {
      console.error("Error fetching candidates:", error)
      toast({
        variant: "destructive",
        title: "Failed to load candidates",
        description: error.message || "Unable to fetch candidates",
      })
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchInvitedCandidates = useCallback(async () => {
    try {
      const data = await api.get<InvitedCandidate[]>("/admin/invited-candidates")
      setInvitedCandidates(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load invited candidates",
        description: error.message,
      })
    }
  }, [toast])

  useEffect(() => {
    fetchCandidates()
    fetchInvitedCandidates()
  }, [fetchCandidates, fetchInvitedCandidates])

  const filteredCandidates = useMemo(() => {
    if (!searchTerm) return candidates
    const term = searchTerm.toLowerCase()
    return candidates.filter(
      (c) =>
        c.email.toLowerCase().includes(term) ||
        c.profile_info?.name?.toLowerCase().includes(term) ||
        c.status.toLowerCase().includes(term)
    )
  }, [candidates, searchTerm])

  const handleStatusChange = async (candidate: Candidate) => {
    if (!candidate.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid candidate ID",
      })
      return
    }

    const nextStatus = candidate.status === "banned" ? "active" : "banned"
    const action = nextStatus === "banned" ? "ban" : "unban"
    
    if (!window.confirm(`Are you sure you want to ${action} ${candidate.email}?`)) {
      return
    }

    try {
      console.log(`${action}ing candidate:`, candidate.id, "to status:", nextStatus)
      console.log("Full candidate object:", candidate)
      await api.patch(`/users/${candidate.id}/status`, { status: nextStatus })
      toast({
        title: "Status updated",
        description: `${candidate.email} is now ${nextStatus}`,
      })
      fetchCandidates()
    } catch (error: any) {
      console.error("Error updating status:", error)
      console.error("Candidate ID that failed:", candidate.id)
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: error.message || "Unable to update candidate status",
      })
    }
  }

  const handleInviteCandidate = async () => {
    if (!inviteForm.email || !inviteForm.name) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Please fill in all fields",
      })
      return
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address",
      })
      return
    }

    // Validate name (only alphabets and spaces)
    if (!/^[a-zA-Z\s]+$/.test(inviteForm.name)) {
      toast({
        variant: "destructive",
        title: "Invalid name",
        description: "Name can only contain alphabets",
      })
      return
    }

    try {
      setInviteLoading(true)
      console.log("[INVITE] Sending invitation:", { email: inviteForm.email.trim().toLowerCase(), name: inviteForm.name.trim() })
      const response = await api.post("/admin/invite-candidate", {
        email: inviteForm.email.trim().toLowerCase(),
        name: inviteForm.name.trim(),
      })
      console.log("[INVITE] Success:", response)
      toast({
        title: "Invitation sent",
        description: `Invitation email sent to ${inviteForm.email}`,
      })
      setInviteDialogOpen(false)
      setInviteForm({ email: "", name: "" })
      await fetchInvitedCandidates()
    } catch (error: any) {
      console.error("[INVITE] Error details:", error)
      console.error("[INVITE] Error message:", error.message)
      console.error("[INVITE] Error response:", (error as any).response)
      const errorMessage = error.message || (error as any).response?.detail || "Please check your email configuration and try again"
      setInviteLoading(false) // Make sure to reset loading state
      
      // Check if it's an "already exists" error
      if (errorMessage.includes("already exists") || errorMessage.includes("already registered")) {
        toast({
          variant: "destructive",
          title: "Cannot invite this email",
          description: errorMessage,
        })
      } else if (errorMessage.includes("already been invited")) {
        toast({
          variant: "destructive",
          title: "Already invited",
          description: errorMessage,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Failed to send invitation",
          description: errorMessage,
        })
      }
    } finally {
      setInviteLoading(false)
    }
  }

  const handleDeleteInvitation = async (invite: InvitedCandidate) => {
    if (!confirm(`Are you sure you want to delete the invitation for ${invite.email}?`)) {
      return
    }

    try {
      await api.delete(`/admin/invited-candidates/${invite.id}`)
      toast({
        title: "Invitation deleted",
        description: `Invitation for ${invite.email} has been deleted`,
      })
      fetchInvitedCandidates()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete invitation",
        description: error.message,
      })
    }
  }

  const handleDelete = async (candidate: Candidate) => {
    if (!window.confirm(`Delete ${candidate.email}? This cannot be undone.`)) return
    try {
      await api.delete(`/users/${candidate.id}`)
      toast({ title: "Candidate deleted" })
      fetchCandidates()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete candidate",
        description: error.message,
      })
    }
  }

  const fetchCandidateDetail = async (candidateId: string) => {
    if (!candidateId || candidateId.length === 0) {
      throw new Error("Invalid candidate ID")
    }
    console.log("Fetching candidate detail for ID:", candidateId)
    return api.get<Candidate>(`/users/${candidateId}`)
  }

  const handleViewCandidate = async (candidate: Candidate) => {
    if (!candidate.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid candidate ID",
      })
      return
    }
    try {
      console.log("Viewing candidate:", candidate.id)
      const detail = await fetchCandidateDetail(candidate.id)
      setDetailCandidate(detail)
      
      // Load candidate photo if exists
      if (detail.profile_info?.photo_filename) {
        try {
          const token = localStorage.getItem("authToken")
          const photoResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/users/${candidate.id}/photo`,
            {
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            }
          )
          if (photoResponse.ok) {
            const blob = await photoResponse.blob()
            const url = URL.createObjectURL(blob)
            setCandidatePhotoUrl(url)
          }
        } catch (error) {
          console.error("Failed to load candidate photo:", error)
          setCandidatePhotoUrl(null)
        }
      } else {
        setCandidatePhotoUrl(null)
      }
      
      setViewDialogOpen(true)
    } catch (error: any) {
      console.error("Error viewing candidate:", error)
      toast({
        variant: "destructive",
        title: "Failed to load candidate",
        description: error.message || "Unable to load candidate details",
      })
    }
  }

  const handleEditCandidate = async (candidate: Candidate) => {
    if (!candidate.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid candidate ID",
      })
      return
    }
    try {
      console.log("Editing candidate:", candidate.id)
      const detail = await fetchCandidateDetail(candidate.id)
      setEditCandidate(detail)
      setEditForm({
        name: detail.profile_info?.name || "",
        status: detail.status || "active",
        newPassword: "",
        showPassword: false,
      })
      setEditDialogOpen(true)
    } catch (error: any) {
      console.error("Error editing candidate:", error)
      toast({
        variant: "destructive",
        title: "Failed to load candidate",
        description: error.message || "Unable to load candidate details",
      })
    }
  }

  const handleEditSave = async () => {
    if (!editCandidate) return
    
    // Validate password if provided
    if (editForm.newPassword && editForm.newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Invalid password",
        description: "Password must be at least 8 characters",
      })
      return
    }

    try {
      const updateData: any = {
        profile_info: { ...(editCandidate.profile_info || {}), name: editForm.name },
        status: editForm.status,
      }
      
      if (editForm.newPassword) {
        updateData.password = editForm.newPassword
      }

      await api.put(`/users/${editCandidate.id}`, updateData)
      toast({ title: "Candidate updated" })
      setEditDialogOpen(false)
      setEditForm({ name: "", status: "active", newPassword: "", showPassword: false })
      fetchCandidates()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update candidate",
        description: error.message,
      })
    }
  }

  const formatStatus = (status: string) => {
    if (!status) return "Unknown"
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const formatLastInterview = (candidate: Candidate) => {
    if (candidate.lastInterview) {
      return new Date(candidate.lastInterview).toLocaleDateString()
    }
    return "None"
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col h-full overflow-y-auto">
        <div className="flex items-center gap-2 mb-8">
          <Image src="/logo-01.png" alt="IntraView AI" width={32} height={32} className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg text-slate-900">IntraView AI</span>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => onNavigate("admin-dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => onNavigate("admin-questions")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <FileText className="w-5 h-5" />
            Question Bank
          </button>
          <button
            onClick={() => onNavigate("admin-testcases")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Code className="w-5 h-5" />
            Test Cases
          </button>
          <button
            onClick={() => onNavigate("admin-candidates")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 text-blue-800 font-medium"
          >
            <Users className="w-5 h-5" />
            Candidates
          </button>
          <button
            onClick={() => onNavigate("admin-sessions")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Video className="w-5 h-5" />
            Sessions
          </button>
          <button
            onClick={() => onNavigate("admin-rubrics")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Sliders className="w-5 h-5" />
            Rubrics
          </button>
          <button
            onClick={() => onNavigate("admin-analytics")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-2 border-t border-slate-200 pt-4">
          {/* Settings */}
          <button
            onClick={() => onNavigate("admin-settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Sticky Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Candidate Management</h1>
            <p className="text-slate-600 text-sm mt-1">{candidates.length} total candidates</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={fetchCandidates} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button className="gap-2" onClick={() => setInviteDialogOpen(true)}>
            <Mail className="w-4 h-4" />
            Invite Candidate
          </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("registered")}
              className={`px-4 py-2 font-medium transition ${
                activeTab === "registered"
                  ? "text-blue-800 border-b-2 border-blue-800"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Registered Candidates ({candidates.length})
            </button>
            <button
              onClick={() => setActiveTab("invited")}
              className={`px-4 py-2 font-medium transition ${
                activeTab === "invited"
                  ? "text-blue-800 border-b-2 border-blue-800"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Invited Candidates ({invitedCandidates.length})
            </button>
          </div>

          {/* Search and Filters */}
          <Card className="p-4 bg-white border-slate-200 mb-8">
            <div className="flex gap-4">
              <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={activeTab === "registered" ? "Search candidates..." : "Search invited candidates..."}
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {activeTab === "invited" && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="successful">Successful</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </Card>

          {/* Registered Candidates Table */}
          {activeTab === "registered" && (
          <Card className="bg-white border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Interviews</TableHead>
                  <TableHead>Avg Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Interview</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates
                  .filter((c) => c.id && c.id.length > 0)
                  .map((c) => (
                  <TableRow key={c.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">{c.profile_info?.name || c.email}</TableCell>
                    <TableCell className="text-slate-600">{c.email}</TableCell>
                    <TableCell className="text-slate-600">{c.sessionsCount ?? 0}</TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {typeof c.avgScore === "number" ? `${Math.round(c.avgScore)}%` : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                            c.status === "active"
                              ? "bg-green-100 text-green-700"
                              : c.status === "banned"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {formatStatus(c.status)}
                      </span>
                        {c.status === "banned" && (
                          <span className="text-xs text-slate-500">(Click to unban)</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">{formatLastInterview(c)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="p-2 hover:bg-slate-200 rounded transition"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log("View clicked, candidate object:", c)
                            console.log("Candidate ID:", c.id)
                            if (!c.id || c.id === "None" || c.id === "undefined") {
                              console.error("Invalid candidate ID:", c.id, "Full candidate:", c)
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: `Invalid candidate ID: ${c.id}. Please refresh the page.`,
                              })
                              return
                            }
                            handleViewCandidate(c)
                          }}
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-slate-200 rounded transition"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log("Edit clicked, candidate object:", c)
                            console.log("Candidate ID:", c.id)
                            if (!c.id || c.id === "None" || c.id === "undefined") {
                              console.error("Invalid candidate ID:", c.id, "Full candidate:", c)
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: `Invalid candidate ID: ${c.id}. Please refresh the page.`,
                              })
                              return
                            }
                            handleEditCandidate(c)
                          }}
                        >
                          <Edit className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-slate-200 rounded transition"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log("Ban clicked, candidate object:", c)
                            console.log("Candidate ID:", c.id)
                            if (!c.id || c.id === "None" || c.id === "undefined") {
                              console.error("Invalid candidate ID:", c.id, "Full candidate:", c)
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: `Invalid candidate ID: ${c.id}. Please refresh the page.`,
                              })
                              return
                            }
                            handleStatusChange(c)
                          }}
                          title={c.status === "banned" ? "Unban" : "Ban"}
                        >
                          <Ban className={`w-4 h-4 ${c.status === "banned" ? "text-green-600" : "text-red-600"}`} />
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-slate-200 rounded transition"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (!c.id || c.id === "None" || c.id === "undefined") {
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: `Invalid candidate ID: ${c.id}. Please refresh the page.`,
                              })
                              return
                            }
                            handleDelete(c)
                          }}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredCandidates.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-6">
                      {loading ? "Loading candidates..." : "No candidates found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
          )}

          {/* Invited Candidates Table */}
          {activeTab === "invited" && (
            <Card className="bg-white border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Invited At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitedCandidates
                    .filter((invite) => {
                      // Status filter
                      if (statusFilter !== "all" && invite.status !== statusFilter) {
                        return false
                      }
                      // Search filter
                      if (!searchTerm) return true
                      const term = searchTerm.toLowerCase()
                      return (
                        invite.email.toLowerCase().includes(term) ||
                        invite.name.toLowerCase().includes(term) ||
                        invite.invited_by.toLowerCase().includes(term)
                      )
                    })
                    .map((invite) => (
                      <TableRow key={invite.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-900">{invite.name}</TableCell>
                        <TableCell className="text-slate-600">{invite.email}</TableCell>
                        <TableCell className="text-slate-600">{invite.invited_by}</TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {new Date(invite.invited_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              invite.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : invite.status === "successful"
                                  ? "bg-blue-100 text-blue-800"
                                : invite.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                : invite.status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {invite.status === "accepted" 
                              ? "Accepted" 
                              : invite.status === "successful"
                                ? "Successful"
                              : invite.status === "pending" 
                                ? "Pending" 
                              : invite.status === "failed"
                                ? "Failed"
                                : "Expired"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <button
                            className="p-2 hover:bg-slate-200 rounded transition"
                            onClick={() => handleDeleteInvitation(invite)}
                            title="Delete Invitation"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  {invitedCandidates.filter((invite) => {
                    if (statusFilter !== "all" && invite.status !== statusFilter) {
                      return false
                    }
                    if (!searchTerm) return true
                    const term = searchTerm.toLowerCase()
                    return (
                      invite.email.toLowerCase().includes(term) ||
                      invite.name.toLowerCase().includes(term) ||
                      invite.invited_by.toLowerCase().includes(term)
                    )
                  }).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-500 py-6">
                        No invited candidates found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={(open) => {
        setViewDialogOpen(open)
        if (!open) {
          // Cleanup photo URL when dialog closes
          if (candidatePhotoUrl) {
            URL.revokeObjectURL(candidatePhotoUrl)
            setCandidatePhotoUrl(null)
          }
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Candidate Details</DialogTitle>
          </DialogHeader>
          {detailCandidate ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-slate-500 uppercase mb-1">Full Name</p>
                  <p className="text-slate-900 font-medium text-lg">{detailCandidate.profile_info?.name || "N/A"}</p>
                </div>
                {candidatePhotoUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={candidatePhotoUrl}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        setPhotoUrl(candidatePhotoUrl)
                        setPhotoDialogOpen(true)
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Email Address</p>
                <p className="text-slate-900 font-medium">{detailCandidate.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Status</p>
                  <p className="text-slate-900 font-medium">{formatStatus(detailCandidate.status)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Total Interviews</p>
                  <p className="text-slate-900 font-medium text-lg">{detailCandidate.sessionsCount ?? 0}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Average Score</p>
                  <p className="text-slate-900 font-medium">
                    {typeof detailCandidate.avgScore === "number" ? `${Math.round(detailCandidate.avgScore)}%` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Last Interview</p>
                  <p className="text-slate-900 font-medium">{formatLastInterview(detailCandidate)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Account Created</p>
                <p className="text-slate-900 font-medium">
                  {detailCandidate.created_at ? new Date(detailCandidate.created_at).toLocaleString() : "N/A"}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200">
                {detailCandidate.sessionsCount && detailCandidate.sessionsCount > 0 ? (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setViewDialogOpen(false)
                      // Navigate to reports page - you can customize this
                      onNavigate("reports")
                    }}
                  >
                    View All Reports
                  </Button>
                ) : (
                  <div className="w-full p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <p className="text-slate-600 text-sm">No reports to show</p>
                    <p className="text-slate-500 text-xs mt-1">This candidate has not completed any interviews yet.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No candidate selected</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profile Photo</DialogTitle>
          </DialogHeader>
          {photoUrl && (
            <div className="flex justify-center items-center p-4">
              <img
                src={photoUrl}
                alt="Profile Photo"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              if (photoUrl) {
                URL.revokeObjectURL(photoUrl)
                setPhotoUrl(null)
              }
              setPhotoDialogOpen(false)
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Candidate Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Candidate</DialogTitle>
            <DialogDescription>Send an invitation email to a new candidate.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Full Name</Label>
              <Input
                value={inviteForm.name}
                onChange={(e) => setInviteForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Usman Akram"
              />
              <p className="text-xs text-slate-500 mt-1">Only alphabets and spaces allowed</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Email Address</Label>
              <Input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="candidate@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)} disabled={inviteLoading}>
              Cancel
            </Button>
            <Button onClick={handleInviteCandidate} disabled={inviteLoading || !inviteForm.email || !inviteForm.name}>
              {inviteLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Candidate</DialogTitle>
            <DialogDescription>Update the candidate profile details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Candidate name"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Change Password</Label>
              <div className="relative">
                <Input
                  type={editForm.showPassword ? "text" : "password"}
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password (leave empty to keep current)"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setEditForm((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition"
                >
                  {editForm.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Minimum 8 characters. Leave empty to keep current password.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={!editCandidate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
