"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Mic, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import type { InterviewData } from "./InterviewInterface"

interface InterviewReportProps {
  interviewData: InterviewData
  onNavigateToLearning: () => void
}

const mockMetrics = {
  confidenceScore: 78,
  technicalAccuracy: 85,
  eyeContact: 72,
  articulation: 81,
  clarity: 76,
  testsPassed: 2,
  testsTotal: 3,
}

const performanceTrend = [
  { date: "Week 1", score: 65 },
  { date: "Week 2", score: 68 },
  { date: "Week 3", score: 72 },
  { date: "Week 4", score: 78 },
]

const skillBalance = [
  { skill: "Coding", value: 85 },
  { skill: "System Design", value: 62 },
  { skill: "Behavioral", value: 78 },
  { skill: "Communication", value: 81 },
  { skill: "Problem Solving", value: 79 },
]

export function InterviewReport({ interviewData, onNavigateToLearning }: InterviewReportProps) {
  const passPercentage = (mockMetrics.testsPassed / mockMetrics.testsTotal) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Session Report</h1>
          <p className="text-slate-600">
            {new Date(interviewData.timestamp).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Confidence Score */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-700">Confidence Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      strokeDasharray={`${(mockMetrics.confidenceScore / 100) * 282.7} 282.7`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-blue-600">{mockMetrics.confidenceScore}%</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-slate-600">Good confidence level</p>
            </CardContent>
          </Card>

          {/* Technical Accuracy */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-700">Technical Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeDasharray={`${(mockMetrics.technicalAccuracy / 100) * 282.7} 282.7`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-green-600">{mockMetrics.technicalAccuracy}%</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-slate-600">Strong technical skills</p>
            </CardContent>
          </Card>

          {/* Code Tests */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-700">Code Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {mockMetrics.testsPassed}/{mockMetrics.testsTotal}
                    </div>
                    <p className="text-sm text-slate-600">Tests Passed</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${passPercentage}%` }} />
                </div>
                <p className="text-center text-xs text-slate-600">{passPercentage.toFixed(0)}% Success Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Video Analysis */}
        <Card className="border-slate-200 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Video Analysis</CardTitle>
            <CardDescription>AI-powered eye contact and communication metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Eye Contact */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-slate-900">Eye Contact</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${mockMetrics.eyeContact}%` }} />
                </div>
                <p className="text-sm text-slate-600">{mockMetrics.eyeContact}% Consistent</p>
                <p className="text-xs text-slate-500">Good eye contact maintained during responses</p>
              </div>

              {/* Articulation */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Mic className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-slate-900">Articulation</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${mockMetrics.articulation}%` }} />
                </div>
                <p className="text-sm text-slate-600">{mockMetrics.articulation}% Clarity</p>
                <p className="text-xs text-slate-500">Clear and well-articulated responses</p>
              </div>

              {/* Overall Clarity */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Mic className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-slate-900">Overall Clarity</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${mockMetrics.clarity}%` }} />
                </div>
                <p className="text-sm text-slate-600">{mockMetrics.clarity}% Clear</p>
                <p className="text-xs text-slate-500">Communication could be slightly clearer</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Analysis */}
        <Card className="border-slate-200 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Code Analysis</CardTitle>
            <CardDescription>Test case execution results and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Passed Test */}
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Test Case 1: Basic Example</p>
                  <p className="text-sm text-green-700 font-mono">Input: [2,7,11,15], target=9</p>
                  <p className="text-sm text-green-700 font-mono">Output: [0,1] ✓</p>
                </div>
              </div>

              {/* Passed Test */}
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Test Case 2: Edge Case</p>
                  <p className="text-sm text-green-700 font-mono">Input: [3,2,4], target=6</p>
                  <p className="text-sm text-green-700 font-mono">Output: [1,2] ✓</p>
                </div>
              </div>

              {/* Failed Test */}
              <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">Test Case 3: Duplicate Values</p>
                  <p className="text-sm text-red-700 font-mono">Input: [3,3], target=6</p>
                  <p className="text-sm text-red-700 font-mono">Expected: [0,1], Got: [1,0]</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card className="border-slate-200 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Key Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-900 mb-2">Strengths</p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Strong understanding of data structures and algorithms</li>
                <li>Good communication and explanation skills</li>
                <li>Consistent eye contact and professional demeanor</li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="font-medium text-amber-900 mb-2">Areas for Improvement</p>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Handle edge cases more thoroughly before submission</li>
                <li>Practice system design problems more</li>
                <li>Work on staying calm under pressure during challenging questions</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex gap-4 justify-end mb-8">
          <Button variant="outline" className="border-slate-300 bg-transparent">
            Download Report
          </Button>
          <Button onClick={onNavigateToLearning} className="bg-blue-600 hover:bg-blue-700 text-white">
            View Learning Path
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
