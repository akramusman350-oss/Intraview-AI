"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Eye, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"

interface DetailedReportProps {
  sessionData?: {
    profileData: {
      name: string
      title: string
      skills: string[]
    }
    verbalscore: number
    technicalScore: number
    completedAt: string
  }
  onNavigate: (page: string) => void
}

export function DetailedInterviewReport({ sessionData, onNavigate }: DetailedReportProps) {
  const reportDate = sessionData?.completedAt
    ? new Date(sessionData.completedAt).toLocaleDateString()
    : new Date().toLocaleDateString()

  const confidenceScore = sessionData?.verbalscore || 78
  const technicalScore = sessionData?.technicalScore || 72

  const videoAnalysisData = [
    { name: "Eye Contact", value: 80, fill: "#3b82f6" },
    { name: "Articulation", value: 75, fill: "#0ea5e9" },
    { name: "Clarity", value: 85, fill: "#06b6d4" },
  ]

  const codeAnalysisData = [
    { name: "Test 1", passed: true, time: "234ms" },
    { name: "Test 2", passed: true, time: "156ms" },
    { name: "Test 3", passed: false, time: "timeout" },
    { name: "Test 4", passed: true, time: "189ms" },
    { name: "Test 5", passed: false, time: "runtime error" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Interview Summary</h1>
          <p className="text-muted-foreground">Session completed on {reportDate}</p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Confidence Score */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Confidence Score
              </CardTitle>
              <CardDescription>Behavioral Analysis</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeDasharray={`${(confidenceScore / 100) * 283} 283`}
                    strokeLinecap="round"
                    style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                  />
                  <text x="50" y="50" textAnchor="middle" dy="0.3em" className="text-3xl font-bold fill-primary">
                    {Math.round(confidenceScore)}%
                  </text>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Technical Accuracy */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Technical Accuracy
              </CardTitle>
              <CardDescription>Code Performance</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="8"
                    strokeDasharray={`${(technicalScore / 100) * 283} 283`}
                    strokeLinecap="round"
                    style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                  />
                  <text x="50" y="50" textAnchor="middle" dy="0.3em" className="text-3xl font-bold fill-accent">
                    {Math.round(technicalScore)}%
                  </text>
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Video Analysis */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-primary">Video Analysis</CardTitle>
              <CardDescription>Behavioral Metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={videoAnalysisData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-muted-foreground">
                  You maintained eye contact 80% of the time. Try to engage more with the camera.
                </p>
                <p className="text-muted-foreground">
                  Your articulation was clear. Consider adding more examples to strengthen your responses.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Code Analysis */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-primary">Code Analysis</CardTitle>
              <CardDescription>Test Case Results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {codeAnalysisData.map((test, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      {test.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium">{test.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{test.time}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Passed 3/5 test cases. Focus on edge case handling for arrays.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights */}
        <Card className="mb-8 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-blue-800 font-bold">•</span>
                <span>
                  <strong>Strength:</strong> You demonstrated solid knowledge of React hooks and performance
                  optimization patterns.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <span>
                  <strong>Area to Improve:</strong> Dynamic programming concepts need more practice. Consider revisiting
                  classic DP problems.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-500 font-bold">•</span>
                <span>
                  <strong>Next Step:</strong> Work on system design fundamentals to round out your technical interview
                  skills.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Code Snippet */}
        <Card className="mb-8 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-primary">Your Code Solution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-slate-100 font-mono text-sm">
                {`function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* CTA Button */}
        <div className="flex gap-3">
          <Button
            onClick={() => onNavigate("candidate-progress")}
            className="flex-1 bg-primary hover:bg-accent text-primary-foreground text-lg py-6 rounded-lg"
          >
            View Personalized Recommendations
            <TrendingUp className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
