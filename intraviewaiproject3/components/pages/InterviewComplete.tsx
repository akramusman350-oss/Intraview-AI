"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Award, Code, MessageSquare, Brain } from "lucide-react"

interface InterviewCompleteProps {
  onNavigate: (page: string) => void
  interviewType: "behavioral" | "coding"
}

export function InterviewComplete({ onNavigate, interviewType }: InterviewCompleteProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-12 bg-white border-slate-200">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Interview Completed!</h1>
          <p className="text-lg text-slate-600">
            Great job! Your {interviewType === "behavioral" ? "behavioral" : "coding"} interview has been submitted
            successfully.
          </p>
          <p className="text-slate-600 mt-2">
            Our AI is generating your detailed report. This usually takes 2-3 minutes.
          </p>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
            <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">78</p>
            <p className="text-slate-600 text-sm">Overall Score</p>
          </div>
          {interviewType === "behavioral" ? (
            <>
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-900">75</p>
                <p className="text-slate-600 text-sm">Communication</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-900">80</p>
                <p className="text-slate-600 text-sm">Problem Solving</p>
              </div>
              <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-200">
                <svg className="w-8 h-8 text-orange-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <p className="text-3xl font-bold text-slate-900">82</p>
                <p className="text-slate-600 text-sm">Confidence</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <Code className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-900">82</p>
                <p className="text-slate-600 text-sm">Code Quality</p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-900">80</p>
                <p className="text-slate-600 text-sm">Algorithm</p>
              </div>
              <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-200">
                <svg className="w-8 h-8 text-orange-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7H7v6h6V7z" />
                </svg>
                <p className="text-3xl font-bold text-slate-900">10/12</p>
                <p className="text-slate-600 text-sm">Tests Passed</p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => onNavigate("report-summary")} size="lg" className="flex-1">
            View Full Report
          </Button>
          <Button onClick={() => onNavigate("candidate-dashboard")} variant="outline" size="lg" className="flex-1">
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  )
}
