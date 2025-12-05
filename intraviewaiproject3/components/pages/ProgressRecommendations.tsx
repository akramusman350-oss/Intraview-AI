"use client"

import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Zap, BookOpen, Code } from "lucide-react"
import { SidebarLayout } from "@/components/SidebarLayout"
import { useUserName } from "@/hooks/useUserName"

interface ProgressRecommendationsProps {
  onNavigate: (page: string) => void
  onLogout?: () => void
}

export function ProgressRecommendations({ onNavigate, onLogout = () => {} }: ProgressRecommendationsProps) {
  const scoreHistory = [
    { date: "Session 1", score: 65, technical: 58 },
    { date: "Session 2", score: 70, technical: 62 },
    { date: "Session 3", score: 72, technical: 68 },
    { date: "Session 4", score: 75, technical: 70 },
    { date: "Session 5", score: 78, technical: 75 },
  ]

  const skillGaps = [
    { skill: "Dynamic Programming", weakness: 45, filled: true },
    { skill: "System Design", weakness: 52, filled: true },
    { skill: "Database Design", weakness: 60, filled: true },
    { skill: "React Advanced", weakness: 72, filled: false },
    { skill: "TypeScript Generics", weakness: 68, filled: false },
  ]

  const recommendations = [
    {
      icon: Code,
      title: "LeetCode Medium Problems",
      description: "Focus on dynamic programming: Climb Stairs, Coin Change, Longest Substring",
      category: "Practice",
      difficulty: "High Priority",
    },
    {
      icon: BookOpen,
      title: "System Design Masterclass",
      description: "Learn to design scalable systems: Design Twitter, Design YouTube, Design Uber",
      category: "Learning",
      difficulty: "High Priority",
    },
    {
      icon: Zap,
      title: "React Performance Workshop",
      description: "Deep dive into memoization, code splitting, and lazy loading patterns",
      category: "Skill",
      difficulty: "Medium Priority",
    },
    {
      icon: Code,
      title: "Mock Interviews",
      description: "Practice with peers using our structured interview framework",
      category: "Practice",
      difficulty: "Medium Priority",
    },
  ]

  return (
    <SidebarLayout userName="Usman Akram" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Progress & Recommendations</h1>
          <p className="text-muted-foreground">Track your growth and get personalized learning paths</p>
        </div>

        {/* Score History Chart */}
        <Card className="mb-8 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Score History
            </CardTitle>
            <CardDescription>Your progress over recent interview sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  name="Confidence"
                />
                <Area
                  type="monotone"
                  dataKey="technical"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.1}
                  name="Technical"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Gaps Analysis */}
        <Card className="mb-8 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-primary">Skill Gaps Analysis</CardTitle>
            <CardDescription>Areas that need more focus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillGaps.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{item.skill}</span>
                    <span className="text-sm text-muted-foreground">{item.weakness}% coverage</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.weakness < 60 ? "bg-red-500" : item.weakness < 75 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${item.weakness}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Recommended Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec, idx) => {
              const IconComponent = rec.icon
              return (
                <Card
                  key={idx}
                  className="border-slate-200 dark:border-slate-700 hover:border-primary transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{rec.title}</CardTitle>
                          <CardDescription className="text-xs">{rec.category}</CardDescription>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          rec.difficulty === "High Priority"
                            ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"
                            : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200"
                        }`}
                      >
                        {rec.difficulty}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>
                    <Button
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent"
                    >
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-primary">Your Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-3xl font-bold text-primary">5</p>
                <p className="text-sm text-muted-foreground">Interviews Completed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent">+13pts</p>
                <p className="text-sm text-muted-foreground">Overall Growth</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-800">3</p>
                <p className="text-sm text-muted-foreground">Skills Mastered</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-500">78%</p>
                <p className="text-sm text-muted-foreground">Current Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Buttons */}
        <div className="mt-8 flex gap-3">
          <Button
            onClick={() => onNavigate("candidate-profile")}
            className="flex-1 bg-primary hover:bg-accent text-primary-foreground text-lg py-6 rounded-lg"
          >
            Take Another Interview
          </Button>
          <Button
            onClick={() => onNavigate("candidate-dashboard")}
            variant="outline"
            className="flex-1 border-primary text-primary hover:bg-primary/10 text-lg py-6 rounded-lg"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </SidebarLayout>
  )
}
