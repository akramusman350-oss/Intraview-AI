"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, FileText, Code, Users, Video, Sliders, BarChart3, Settings, LogOut, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

interface AdminSessionsProps {
  onNavigate: (page: string) => void
  onLogout: () => void
}

interface LiveSession {
  id: string
  candidate_name: string
  interview_type: string
  start_time: string
  duration: string
  progress: number
  question: string
}

interface SessionHistory {
  id: string
  candidate_name: string
  interview_type: string
  date: string
  duration: string
  status: string
  score: string
}

interface SessionsResponse {
  items: LiveSession[] | SessionHistory[]
  total: number
  page: number
  limit: number
}

export function AdminSessions({ onNavigate, onLogout }: AdminSessionsProps) {
  const { toast } = useToast()
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([])
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([])
  const [liveLoading, setLiveLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [livePagination, setLivePagination] = useState({ page: 1, total: 0, limit: 10 })
  const [historyPagination, setHistoryPagination] = useState({ page: 1, total: 0, limit: 10 })

  const fetchLiveSessions = useCallback(async (page = livePagination.page) => {
    try {
      setLiveLoading(true)
      console.log(`[Sessions] Fetching live sessions: page=${page}, limit=${livePagination.limit}`)
      const data = await api.get<SessionsResponse>(`/admin/sessions/live?page=${page}&limit=${livePagination.limit}`)
      console.log(`[Sessions] Live sessions response:`, data)
      setLiveSessions(data.items as LiveSession[])
      setLivePagination({ page: data.page, total: data.total, limit: data.limit })
    } catch (error: any) {
      console.error(`[Sessions] Error fetching live sessions:`, error)
      toast({
        variant: "destructive",
        title: "Failed to load live sessions",
        description: error.message,
      })
    } finally {
      setLiveLoading(false)
    }
  }, [livePagination.limit, toast])

  const fetchSessionHistory = useCallback(async (page = historyPagination.page) => {
    try {
      setHistoryLoading(true)
      console.log(`[Sessions] Fetching session history: page=${page}, limit=${historyPagination.limit}`)
      const data = await api.get<SessionsResponse>(`/admin/sessions/history?page=${page}&limit=${historyPagination.limit}`)
      console.log(`[Sessions] History response:`, data)
      setSessionHistory(data.items as SessionHistory[])
      setHistoryPagination({ page: data.page, total: data.total, limit: data.limit })
    } catch (error: any) {
      console.error(`[Sessions] Error fetching session history:`, error)
      toast({
        variant: "destructive",
        title: "Failed to load session history",
        description: error.message,
      })
    } finally {
      setHistoryLoading(false)
    }
  }, [historyPagination.limit, toast])

  useEffect(() => {
    fetchLiveSessions(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchSessionHistory(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const liveTotalPages = useMemo(() => Math.max(1, Math.ceil(livePagination.total / livePagination.limit)), [livePagination])
  const historyTotalPages = useMemo(() => Math.max(1, Math.ceil(historyPagination.total / historyPagination.limit)), [historyPagination])

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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Users className="w-5 h-5" />
            Candidates
          </button>
          <button
            onClick={() => onNavigate("admin-sessions")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 text-blue-800 font-medium"
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
        <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-slate-900">Interview Sessions</h1>
          <p className="text-slate-600 text-sm mt-1">Monitor live interviews and view session history</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Live Sessions */}
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Live Sessions ({livePagination.total} Active)
            </h2>
            {liveLoading ? (
              <Card className="p-6 bg-white border-slate-200 text-center text-slate-500">
                Loading live sessions...
              </Card>
            ) : liveSessions.length > 0 ? (
              <>
                <div className="space-y-3">
                  {liveSessions.map((session) => (
                    <Card key={session.id} className="p-4 bg-white border-slate-200 border-l-4 border-l-green-500">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-sm text-slate-900">{session.candidate_name}</h3>
                          <p className="text-slate-600 text-xs mt-0.5">
                            Started at {session.start_time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-base font-bold text-slate-900">{session.duration}</p>
                          <p className="text-slate-600 text-xs mt-0.5">{session.question}</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${session.progress}%` }}></div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="gap-2 text-xs h-7">
                          <Eye className="w-3 h-3" />
                          Monitor
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                {/* Pagination for Live Sessions */}
                {livePagination.total > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Showing {(livePagination.page - 1) * livePagination.limit + 1} to{" "}
                      {Math.min(livePagination.page * livePagination.limit, livePagination.total)} of {livePagination.total} sessions
                    </p>
                    {liveTotalPages > 1 && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchLiveSessions(livePagination.page - 1)}
                          disabled={livePagination.page === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: liveTotalPages }, (_, i) => i + 1)
                            .filter((page) => {
                              return (
                                page === 1 ||
                                page === liveTotalPages ||
                                (page >= livePagination.page - 2 && page <= livePagination.page + 2)
                              )
                            })
                            .map((page, idx, arr) => {
                              const prevPage = arr[idx - 1]
                              const showEllipsis = prevPage && page - prevPage > 1
                              return (
                                <div key={page} className="flex items-center gap-1">
                                  {showEllipsis && <span className="px-2 text-slate-400">...</span>}
                                  <Button
                                    variant={livePagination.page === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => fetchLiveSessions(page)}
                                    className="min-w-[2.5rem]"
                                  >
                                    {page}
                                  </Button>
                                </div>
                              )
                            })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchLiveSessions(livePagination.page + 1)}
                          disabled={livePagination.page >= liveTotalPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                    {liveTotalPages === 1 && livePagination.total > 0 && (
                      <div className="text-sm text-slate-600">Page 1</div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <Card className="p-6 bg-white border-slate-200 text-center text-slate-500">
                No live sessions
              </Card>
            )}
          </div>

          {/* Session History */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Session History</h2>
            {historyLoading ? (
              <Card className="p-6 bg-white border-slate-200 text-center text-slate-500">
                Loading session history...
              </Card>
            ) : (
              <>
                <Card className="bg-white border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">ID</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Candidate</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date & Time</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Duration</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Score</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionHistory.length > 0 ? (
                          sessionHistory.map((session) => (
                            <tr key={session.id} className="border-b border-slate-200 hover:bg-slate-50">
                              <td className="px-6 py-4 font-mono text-sm text-slate-600">#{session.id.slice(-6)}</td>
                              <td className="px-6 py-4 font-medium text-slate-900">{session.candidate_name}</td>
                              <td className="px-6 py-4 text-slate-600 text-sm">{session.date}</td>
                              <td className="px-6 py-4 text-slate-600">{session.duration}</td>
                              <td className="px-6 py-4">
                                <Badge variant={session.status === "completed" ? "default" : "secondary"}>
                                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 font-semibold text-slate-900">{session.score}</td>
                              <td className="px-6 py-4">
                                <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                                  <Eye className="w-4 h-4" />
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="px-6 py-4 text-center text-slate-500">
                              No session history found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
                {/* Pagination for Session History */}
                {historyPagination.total > historyPagination.limit && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Showing {(historyPagination.page - 1) * historyPagination.limit + 1} to{" "}
                      {Math.min(historyPagination.page * historyPagination.limit, historyPagination.total)} of {historyPagination.total} sessions
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSessionHistory(historyPagination.page - 1)}
                        disabled={historyPagination.page === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: historyTotalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            return (
                              page === 1 ||
                              page === historyTotalPages ||
                              (page >= historyPagination.page - 2 && page <= historyPagination.page + 2)
                            )
                          })
                          .map((page, idx, arr) => {
                            const prevPage = arr[idx - 1]
                            const showEllipsis = prevPage && page - prevPage > 1
                            return (
                              <div key={page} className="flex items-center gap-1">
                                {showEllipsis && <span className="px-2 text-slate-400">...</span>}
                                <Button
                                  variant={historyPagination.page === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => fetchSessionHistory(page)}
                                  className="min-w-[2.5rem]"
                                >
                                  {page}
                                </Button>
                              </div>
                            )
                          })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSessionHistory(historyPagination.page + 1)}
                        disabled={historyPagination.page >= historyTotalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
