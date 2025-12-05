"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
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
  Users2,
  TrendingUp,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

interface AdminDashboardProps {
  onNavigate: (page: string) => void
  onLogout: () => void
}

interface AdminStats {
  total_candidates: number
  active_sessions: number
  total_questions: number
  new_users_trend: { day: string; date: string; new_users: number }[]
  category_distribution: { name: string; value: number }[]
  recent_activity: { id: string; action: string; timestamp: string; admin_email?: string; metadata?: Record<string, any> }[]
}

export function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const { toast } = useToast()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get<AdminStats>("/admin/stats")
      setStats(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load dashboard data",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchStats()
    // Poll for updates every 10 seconds for recent activity
    const interval = setInterval(() => {
      fetchStats()
    }, 10000) // 10 seconds
    
    return () => clearInterval(interval)
  }, [fetchStats])

  const trendData = stats?.new_users_trend ?? []
  const categoryData = useMemo(() => {
    if (stats?.category_distribution?.length) {
      // Filter out zero values and sort by value descending for better visualization
      const filtered = stats.category_distribution.filter(item => item.value > 0)
      // If all are zero, return empty array to show empty state
      if (filtered.length === 0) {
        return []
      }
      return filtered.sort((a, b) => b.value - a.value)
    }
    return []
  }, [stats])

  // Map question categories to colors
  const getColorForCategory = (name: string) => {
    const colorMap: Record<string, string> = {
      "Behavioral": "#dc2626",      // red
      "Programming": "#2563eb",     // blue
      "System Design": "#16a34a",    // green
      "Technical": "#1e40af",        // dark blue
    }
    return colorMap[name] || "#6b7280" // default gray
  }

  const COLORS = categoryData.map(item => getColorForCategory(item.name))


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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 text-blue-800 font-medium"
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
        <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 text-sm mt-1">System overview and key metrics</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={fetchStats} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-white border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Candidates</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.total_candidates ?? 0}</p>
                  <p className="text-blue-800 text-sm mt-2">Total registered</p>
                </div>
                <Users2 className="w-12 h-12 text-blue-200" />
              </div>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Active Interviews</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.active_sessions ?? 0}</p>
                  <p className="text-green-600 text-sm mt-2">Live now</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">New Users (7d)</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {trendData.reduce((acc, day) => acc + day.new_users, 0)}
                  </p>
                  <p className="text-purple-600 text-sm mt-2">Registered in last week</p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-100" />
              </div>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Questions</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.total_questions ?? 0}</p>
                  <p className="text-orange-600 text-sm mt-2">Across all categories</p>
                </div>
                <FileText className="w-12 h-12 text-orange-100" />
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="lg:col-span-2 p-6 bg-white border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">New Users (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="new_users" stroke="#2563eb" strokeWidth={2} name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Questions</h3>
              {categoryData.length > 0 && categoryData.some(item => item.value > 0) ? (
                <div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={categoryData.filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={35}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getColorForCategory(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value} questions`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {categoryData.filter(item => item.value > 0).map((entry) => {
                      const total = categoryData.reduce((sum, item) => sum + item.value, 0)
                      const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0
                      return (
                        <div key={entry.name} className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: getColorForCategory(entry.name) }}
                          />
                          <span className="text-sm text-slate-700">
                            {entry.name}: {entry.value} ({percentage}%)
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-500">
                  <p>No questions available</p>
                </div>
              )}
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {stats?.recent_activity?.length ? (
                stats.recent_activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border-b border-slate-200 last:border-b-0"
                  >
                    <div>
                      <p className="text-slate-700 font-medium">{item.action}</p>
                      {item.metadata?.question_id && (
                        <p className="text-slate-500 text-sm">Question ID: {item.metadata.question_id}</p>
                      )}
                      {item.metadata?.title && (
                        <p className="text-slate-500 text-sm">Title: {item.metadata.title}</p>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm">
                      {item.timestamp
                        ? (() => {
                            const date = new Date(item.timestamp);
                            // Format in Pakistan timezone with DD/MM/YYYY format (date only, no time)
                            const formatter = new Intl.DateTimeFormat("en-GB", {
                              timeZone: "Asia/Karachi",
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            });
                            const parts = formatter.formatToParts(date);
                            const day = parts.find(p => p.type === "day")?.value || "00";
                            const month = parts.find(p => p.type === "month")?.value || "00";
                            const year = parts.find(p => p.type === "year")?.value || "0000";
                            return `${day}/${month}/${year}`;
                          })()
                        : "Unknown"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No recent activity</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
