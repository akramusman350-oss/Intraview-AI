"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LineChart,
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
import { TrendingUp, Target, Book, ArrowRight, CheckCircle, AlertCircle, BarChart3 } from "lucide-react"
import { IntraViewSidebar } from "../../IntraViewSidebar"

interface RecommendationsProps {
  sessionData?: any
  onRestart?: () => void
  onNavigate?: (view: string) => void
}

export function Recommendations({ sessionData, onRestart, onNavigate }: RecommendationsProps) {
  const scoreHistory = [
    { session: 1, score: 65 },
    { session: 2, score: 72 },
    { session: 3, score: 68 },
    { session: 4, score: 78 },
    { session: 5, score: 82 },
  ]

  const skillsBalance = [
    { skill: "Coding", value: 82 },
    { skill: "System Design", value: 65 },
    { skill: "Behavioral", value: 78 },
    { skill: "Communication", value: 75 },
  ]

  const resources = [
    {
      title: "LeetCode - Array Problems",
      difficulty: "Medium",
      timeEstimate: "2 hours",
      topic: "Data Structures",
    },
    {
      title: "System Design Interview Course",
      difficulty: "Hard",
      timeEstimate: "8 hours",
      topic: "Architecture",
    },
    {
      title: "Communication Skills Workshop",
      difficulty: "Easy",
      timeEstimate: "1 hour",
      topic: "Soft Skills",
    },
    {
      title: "Advanced React Patterns",
      difficulty: "Hard",
      timeEstimate: "4 hours",
      topic: "Frontend",
    },
    {
      title: "Database Design Fundamentals",
      difficulty: "Medium",
      timeEstimate: "3 hours",
      topic: "Backend",
    },
    {
      title: "Behavioral Interview Guide",
      difficulty: "Easy",
      timeEstimate: "1.5 hours",
      topic: "Soft Skills",
    },
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/10 text-green-700 border-green-500/30"
      case "Medium":
        return "bg-amber-500/10 text-amber-700 border-amber-500/30"
      case "Hard":
        return "bg-red-500/10 text-red-700 border-red-500/30"
      default:
        return "bg-secondary"
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <IntraViewSidebar currentView="recommendations" onNavigate={onNavigate || (() => {})} profileCompleted={true} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen bg-background p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Recommendations</h1>
              <p className="text-muted-foreground">Track your progress and access personalized resources</p>
            </div>

            {/* Session Data - Only show if available */}
            {sessionData && (
              <>
                {/* Performance Scores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Confidence Score */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Confidence Score</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary">{sessionData.confidenceScore}%</span>
                      </div>
                      <p className="text-muted-foreground">Your confidence level during the interview</p>
                    </div>
                  </Card>

                  {/* Technical Accuracy */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Technical Accuracy</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary">{sessionData.technicalAccuracy}%</span>
                      </div>
                      <p className="text-muted-foreground">Accuracy of your technical responses</p>
                    </div>
                  </Card>
                </div>

                {/* Video Analysis */}
                <Card className="p-6 mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Video Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(sessionData.videoAnalysis).map(([key, value]) => (
                      <div key={key} className="space-y-3">
                        <p className="text-sm font-medium text-foreground capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </p>
                        <div className="w-full bg-secondary rounded-full h-3">
                          <div
                            className="bg-primary h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">{value}%</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Code Test Results */}
                <Card className="p-6 mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Code Test Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-secondary rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">Tests Passed</p>
                      <p className="text-2xl font-bold text-primary">
                        {sessionData.codeTestResults.testsPassed}/{sessionData.codeTestResults.totalTests}
                      </p>
                    </div>
                    <div className="bg-secondary rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
                      <p className="text-2xl font-bold text-primary">
                        {Math.round(
                          (sessionData.codeTestResults.testsPassed / sessionData.codeTestResults.totalTests) * 100,
                        )}
                        %
                      </p>
                    </div>
                    <div className="bg-secondary rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">Execution Time</p>
                      <p className="text-2xl font-bold text-primary">{sessionData.codeTestResults.executionTime}</p>
                    </div>
                  </div>
                </Card>

                {/* Feedback */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Strengths
                    </h3>
                    <ul className="space-y-3">
                      {sessionData.feedback.strengths.map((strength: string, idx: number) => (
                        <li key={idx} className="flex gap-3 text-sm text-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      Areas for Improvement
                    </h3>
                    <ul className="space-y-3">
                      {sessionData.feedback.improvements.map((improvement: string, idx: number) => (
                        <li key={idx} className="flex gap-3 text-sm text-foreground">
                          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </>
            )}

            {/* Score History */}
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Score History
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="session" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "0.625rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-primary)"
                    dot={{ fill: "var(--color-primary)", r: 6 }}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Skills Balance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Skills Balance
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={skillsBalance}>
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis dataKey="skill" stroke="var(--color-muted-foreground)" />
                    <PolarRadiusAxis stroke="var(--color-muted-foreground)" />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="var(--color-primary)"
                      fill="var(--color-primary)"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Total Sessions</p>
                  <p className="text-3xl font-bold text-primary">5</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Avg Score</p>
                  <p className="text-3xl font-bold text-primary">73</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Current Level</p>
                  <p className="text-3xl font-bold text-primary">6/10</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Weak Areas</p>
                  <p className="text-3xl font-bold text-primary">3</p>
                </Card>
              </div>
            </div>

            {/* Recommended Resources */}
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Book className="w-5 h-5 text-primary" />
                Recommended Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((resource, idx) => (
                  <Card key={idx} className="p-4 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-foreground text-sm leading-tight flex-1">{resource.title}</h4>
                    </div>
                    <Badge variant="outline" className="w-fit mb-3">
                      {resource.topic}
                    </Badge>
                    <p
                      className={`text-xs font-semibold mb-2 px-2 py-1 rounded border w-fit ${getDifficultyColor(
                        resource.difficulty,
                      )}`}
                    >
                      {resource.difficulty}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4 flex-1">⏱ {resource.timeEstimate}</p>
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      <ArrowRight className="w-3 h-3 mr-1" />
                      Learn
                    </Button>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            {onRestart && (
              <div className="flex justify-center">
                <Button size="lg" onClick={onRestart}>
                  Take Another Interview
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
