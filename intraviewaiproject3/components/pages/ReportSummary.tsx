"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import { Home, Settings, User, Video, LogOut, Download } from "lucide-react"

interface ReportSummaryProps {
  onNavigate: (page: string) => void
  onLogout: () => void
}

export function ReportSummary({ onNavigate, onLogout }: ReportSummaryProps) {
  const radarData = [
    { category: "Problem Solving", value: 85 },
    { category: "Code Quality", value: 80 },
    { category: "Communication", value: 75 },
    { category: "Algorithms", value: 82 },
    { category: "System Design", value: 70 },
    { category: "Testing", value: 78 },
  ]

  const barData = [
    { name: "Technical Skills", value: 82 },
    { name: "Soft Skills", value: 75 },
    { name: "Domain Knowledge", value: 78 },
    { name: "Cultural Fit", value: 80 },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="font-bold text-lg text-slate-900">IntraView AI</span>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => onNavigate("candidate-dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => onNavigate("candidate-profile")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <User className="w-5 h-5" />
            Profile
          </button>
          <button
            onClick={() => onNavigate("candidate-interviews")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Video className="w-5 h-5" />
            Interviews
          </button>
          <button
            onClick={() => onNavigate("candidate-settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Technical Interview Report</h1>
            <p className="text-slate-600 text-sm mt-1">November 30, 2025 • 45 minutes</p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>

        <div className="p-8 max-w-6xl">
          {/* Overall Score */}
          <Card className="p-8 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Overall Score</p>
                <p className="text-5xl font-bold text-slate-900">78/100</p>
                <p className="text-slate-600 mt-2">
                  Status: <span className="font-semibold text-green-600">Passed</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-600 text-sm font-medium">Performance Level</p>
                <p className="text-3xl font-bold text-slate-900">Above Average</p>
                <p className="text-slate-600 mt-2">Top 25% of candidates</p>
              </div>
            </div>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6 bg-white border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Skills Assessment</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis />
                  <Radar name="Score" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Category Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card className="p-6 bg-green-50 border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">✓ Strengths</h3>
              <ul className="space-y-2 text-green-800">
                <li>• Excellent problem-solving approach</li>
                <li>• Clean, well-documented code</li>
                <li>• Strong algorithmic thinking</li>
                <li>• Good communication skills</li>
              </ul>
            </Card>

            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">⚠ Areas for Improvement</h3>
              <ul className="space-y-2 text-yellow-800">
                <li>• Edge case handling</li>
                <li>• Time complexity optimization</li>
                <li>• Speaking pace (occasionally fast)</li>
                <li>• System design depth</li>
              </ul>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={() => onNavigate("detailed-report")} size="lg">
              View Detailed Report
            </Button>
            <Button onClick={() => onNavigate("candidate-dashboard")} variant="outline" size="lg">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
