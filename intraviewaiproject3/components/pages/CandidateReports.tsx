"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"
import { SidebarLayout } from "@/components/SidebarLayout"
import { useUserName } from "@/hooks/useUserName"
import { api } from "@/lib/api"

interface CandidateReportsProps {
  onNavigate: (page: string) => void
  onLogout: () => void
}

interface Report {
  id: string
  title: string
  date: string
  duration: string
  score: number | null
  type: string
  status: string
}

export function CandidateReports({ onNavigate, onLogout }: CandidateReportsProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const userName = useUserName()

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const stats = await api.get("/users/me/stats")
        // Convert recent_activity to reports format
        const reportsData: Report[] = stats.recent_activity
          .filter((activity: any) => activity.status === "Completed")
          .map((activity: any, index: number) => ({
            id: `report-${index}`,
            title: activity.title,
            date: new Date().toLocaleDateString("en-US", { 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            }),
            duration: "N/A",
            score: activity.score ? parseInt(activity.score.replace("%", "")) : null,
            type: activity.title.split(" ")[0] || "Combined",
            status: activity.status,
          }))
        setReports(reportsData)
      } catch (error) {
        console.error("Failed to fetch reports:", error)
        setReports([])
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  return (
    <SidebarLayout userName={userName} onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">All Reports</h2>
        <p className="text-slate-600 mb-8">View your interview session reports</p>
        {loading ? (
          <div className="text-center text-slate-600 py-8">Loading...</div>
        ) : reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="p-6 bg-white border-slate-200 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{report.title}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {report.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-slate-600 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {report.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {report.duration}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {report.score !== null ? (
                      <div className="text-3xl font-bold text-slate-900 mb-2">{report.score}%</div>
                    ) : (
                      <div className="text-3xl font-bold text-slate-400 mb-2">N/A</div>
                    )}
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      {report.status}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onNavigate("detailed-report")}>
                    View Detail Report
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-600 py-8">
            <p>No reports available. Complete an interview to see your reports here.</p>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}
