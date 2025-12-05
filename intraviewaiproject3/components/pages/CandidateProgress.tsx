"use client"

import { Card } from "@/components/ui/card"
import { LineChart, TrendingUp } from "lucide-react"
import { SidebarLayout } from "@/components/SidebarLayout"
import { useUserName } from "@/hooks/useUserName"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

interface CandidateProgressProps {
  onNavigate: (page: string) => void
  onLogout: () => void
}

export function CandidateProgress({ onNavigate, onLogout }: CandidateProgressProps) {
  const progressData = [
    { week: "Week 1", score: 65, communication: 60, problemSolving: 70, technical: 65 },
    { week: "Week 2", score: 72, communication: 68, problemSolving: 75, technical: 72 },
    { week: "Week 3", score: 78, communication: 75, problemSolving: 82, technical: 78 },
    { week: "Week 4", score: 85, communication: 82, problemSolving: 88, technical: 85 },
    { week: "Week 5", score: 88, communication: 86, problemSolving: 90, technical: 88 },
  ]

  const skillData = [
    { skill: "Communication", value: 86, fullMark: 100 },
    { skill: "Problem Solving", value: 90, fullMark: 100 },
    { skill: "Technical Skills", value: 88, fullMark: 100 },
    { skill: "Time Management", value: 82, fullMark: 100 },
    { skill: "Confidence", value: 84, fullMark: 100 },
  ]

  const userName = useUserName()

  return (
    <SidebarLayout userName={userName} onNavigate={onNavigate} onLogout={onLogout}>
      <div>
          {/* Overall Score Trend */}
          <Card className="p-6 bg-white border-slate-200 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-blue-800" />
              Overall Score Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ fill: "#2563eb", r: 6 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </Card>

          {/* Skill Radar Chart */}
          <Card className="p-6 bg-white border-slate-200 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Current Skills Assessment
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Score" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Skill Breakdown */}
          <Card className="p-6 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Skills Breakdown</h3>
            <div className="space-y-4">
              {skillData.map((skill, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">{skill.skill}</span>
                    <span className="text-lg font-bold text-blue-800">{skill.value}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-blue-800 h-3 rounded-full transition-all" style={{ width: `${skill.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
      </div>
    </SidebarLayout>
  )
}
