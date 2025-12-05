"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Calendar, CheckCircle, TrendingUp } from "lucide-react"
import { SidebarLayout } from "@/components/SidebarLayout"
import { api } from "@/lib/api"

interface CandidateDashboardProps {
  userName: string
  onNavigate: (page: string) => void
  onLogout: () => void
}

interface DashboardStats {
  upcoming_interviews: number
  completed_interviews: number
  success_rate: number
  recent_activity: Array<{
    title: string
    status: string
    time: string
    score: string | null
  }>
}

export function CandidateDashboard({ userName, onNavigate, onLogout }: CandidateDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    upcoming_interviews: 0,
    completed_interviews: 0,
    success_rate: 0,
    recent_activity: []
  })
  const [loading, setLoading] = useState(true)
  const [showInterviewDialog, setShowInterviewDialog] = useState(false)
  const [showReportsDialog, setShowReportsDialog] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get("/users/me/stats")
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
        // Keep default values (all zeros)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <SidebarLayout userName={userName} currentPage="candidate-dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      {/* Content */}
      <div>
          <p className="text-slate-600 mb-8">Here's your interview performance overview</p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-white border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Upcoming Interviews</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.upcoming_interviews}</p>
                  <p className="text-blue-800 text-sm mt-2">Active sessions</p>
                </div>
                <Calendar className="w-12 h-12 text-blue-200" />
              </div>
            </Card>
            <Card className="p-6 bg-white border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Completed Interviews</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.completed_interviews}</p>
                  <p className="text-green-600 text-sm mt-2">Total completed</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-100" />
              </div>
            </Card>
            <Card className="p-6 bg-white border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.success_rate}%</p>
                  <p className="text-purple-600 text-sm mt-2">Average score</p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-100" />
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {loading ? (
                <div className="p-6 text-center text-slate-600">Loading...</div>
              ) : stats.recent_activity.length > 0 ? (
                stats.recent_activity.map((item, i) => (
                  <div key={i} className="p-6 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-600 mt-1">{item.time}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${item.status === "Completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-800"}`}
                        >
                          {item.status}
                        </span>
                        {item.score && <p className="text-sm font-bold text-slate-900 mt-1">{item.score}</p>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-600">No recent activity. Start your first interview!</div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button onClick={() => setShowInterviewDialog(true)} size="lg">
              Start New Interview
            </Button>
            <Button onClick={() => setShowReportsDialog(true)} variant="outline" size="lg">
              View Reports
            </Button>
          </div>
      </div>

      {/* Interview Dialog */}
      <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feature Coming Soon</DialogTitle>
            <DialogDescription>
              This feature will be implemented in the 8th Semester.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowInterviewDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feature Coming Soon</DialogTitle>
            <DialogDescription>
              This feature will be implemented in the 8th Semester.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowReportsDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  )
}
