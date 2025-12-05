"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Play, BookOpen, Code, Target, TrendingUp } from "lucide-react"

interface LearningHubProps {
  onNavigate: (page: string) => void
}

const performanceData = [
  { date: "Session 1", score: 65 },
  { date: "Session 2", score: 68 },
  { date: "Session 3", score: 72 },
  { date: "Session 4", score: 78 },
  { date: "Session 5", score: 82 },
  { date: "Session 6", score: 85 },
]

const skillBalance = [
  { skill: "Coding", value: 85 },
  { skill: "System Design", value: 62 },
  { skill: "Behavioral", value: 78 },
  { skill: "Communication", value: 81 },
  { skill: "Problem Solving", value: 79 },
]

const recommendations = [
  {
    id: 1,
    type: "Problem",
    title: "Dynamic Programming Fundamentals",
    description: "Master DP patterns starting with coin change and knapsack problems",
    difficulty: "Medium",
    timeEstimate: "4-5 hours",
    icon: Code,
  },
  {
    id: 2,
    type: "Video",
    title: "System Design Patterns",
    description: "Learn scalability patterns for distributed systems",
    difficulty: "Hard",
    timeEstimate: "3-4 hours",
    icon: BookOpen,
  },
  {
    id: 3,
    type: "Article",
    title: "Behavioral Interview Guide",
    description: "STAR method and storytelling techniques for tech interviews",
    difficulty: "Easy",
    timeEstimate: "30 mins",
    icon: BookOpen,
  },
  {
    id: 4,
    type: "Problem",
    title: "Graph Algorithms Practice",
    description: "Practice BFS, DFS, shortest path, and topological sort",
    difficulty: "Medium",
    timeEstimate: "3 hours",
    icon: Code,
  },
  {
    id: 5,
    type: "Video",
    title: "Database Design Deep Dive",
    description: "Relational databases, indexing, and query optimization",
    difficulty: "Hard",
    timeEstimate: "2-3 hours",
    icon: BookOpen,
  },
  {
    id: 6,
    type: "Article",
    title: "Mock Interview Best Practices",
    description: "Tips for getting the most from practice interviews",
    difficulty: "Easy",
    timeEstimate: "15 mins",
    icon: BookOpen,
  },
]

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return "bg-green-100 text-green-800"
    case "Medium":
      return "bg-amber-100 text-amber-800"
    case "Hard":
      return "bg-red-100 text-red-800"
    default:
      return "bg-slate-100 text-slate-800"
  }
}

const getDifficultyBadgeVariant = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return "default"
    case "Medium":
      return "secondary"
    case "Hard":
      return "destructive"
    default:
      return "outline"
  }
}

export function LearningHub({ onNavigate }: LearningHubProps) {
  const [targetRole, setTargetRole] = useState("Senior Backend Engineer")
  const [expandedGoal, setExpandedGoal] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Your Learning Path & Growth</h1>
          <p className="text-slate-600">Track your progress and get personalized recommendations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-800 mb-1">6</p>
                <p className="text-sm text-slate-600">Total Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 mb-1">+20pts</p>
                <p className="text-sm text-slate-600">Score Improvement</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600 mb-1">85%</p>
                <p className="text-sm text-slate-600">Current Level</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600 mb-1">3</p>
                <p className="text-sm text-slate-600">Weak Areas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Trend */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Performance Trend</CardTitle>
              <CardDescription>Your score improvement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    dot={{ fill: "#3b82f6", r: 5 }}
                    activeDot={{ r: 7 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Skill Balance */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Skill Balance</CardTitle>
              <CardDescription>Your current competency across areas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={skillBalance}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="skill" stroke="#64748b" />
                  <PolarRadiusAxis stroke="#64748b" />
                  <Radar name="Competency" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", color: "#fff" }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Goal Setting */}
        <Card className="border-slate-200 shadow-sm mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">Career Goal</CardTitle>
                <CardDescription>Target role readiness tracking</CardDescription>
              </div>
              <button
                onClick={() => setExpandedGoal(!expandedGoal)}
                className="text-blue-800 hover:text-blue-800 font-medium text-sm"
              >
                {expandedGoal ? "Edit" : "Change"}
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {expandedGoal ? (
              <div>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Target className="w-5 h-5 text-blue-800" />
                <div className="flex-1">
                  <p className="font-medium text-blue-800">{targetRole}</p>
                  <p className="text-sm text-blue-800">70% ready • Next session will improve by ~2%</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Focus Areas */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Recommended Focus Areas
          </h2>
          <p className="text-slate-600 mb-6">
            Based on your interview performance, focus on these areas to improve your scores
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => {
              const IconComponent = rec.icon
              return (
                <Card key={rec.id} className="border-slate-200 shadow-sm hover:shadow-md transition">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <IconComponent className="w-5 h-5 text-blue-800" />
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-1">
                            {rec.type}
                          </Badge>
                          <CardTitle className="text-base font-semibold text-slate-900">{rec.title}</CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">{rec.description}</p>

                    <div className="flex items-center gap-4 py-3 border-y border-slate-200">
                      <Badge className={`${getDifficultyColor(rec.difficulty)} text-xs`}>{rec.difficulty}</Badge>
                      <span className="text-xs text-slate-500">≈ {rec.timeEstimate}</span>
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Play className="w-4 h-4 mr-2" />
                      Start Practice
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
