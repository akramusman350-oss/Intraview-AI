"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader } from "lucide-react"

interface SystemCheckPageProps {
  onNavigate: (page: string) => void
  interviewType: "behavioral" | "coding"
}

type CheckStatus = "checking" | "success" | "failed"

export function SystemCheckPage({ onNavigate, interviewType }: SystemCheckPageProps) {
  const [checks, setChecks] = useState({
    camera: "checking" as CheckStatus,
    microphone: "checking" as CheckStatus,
    internet: "checking" as CheckStatus,
    browser: "checking" as CheckStatus,
  })

  useEffect(() => {
    // Simulate system checks
    const timings = [1000, 1500, 2000, 2500]
    const keys = ["camera", "microphone", "internet", "browser"] as const

    keys.forEach((key, i) => {
      setTimeout(() => {
        setChecks((prev) => ({
          ...prev,
          [key]: Math.random() > 0.2 ? "success" : "failed",
        }))
      }, timings[i])
    })
  }, [])

  const allPassed = Object.values(checks).every((check) => check === "success")

  const handleStartInterview = () => {
    if (interviewType === "behavioral") {
      onNavigate("behavioral-interview")
    } else {
      onNavigate("coding-interview")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-12 bg-white border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">System Check</h1>
        <p className="text-slate-600 mb-8">
          Please ensure all systems are working properly before starting your interview.
        </p>

        <div className="space-y-4 mb-12">
          {[
            { key: "camera", label: "Camera", icon: "📷" },
            { key: "microphone", label: "Microphone", icon: "🎤" },
            { key: "internet", label: "Internet Connection", icon: "📡" },
            { key: "browser", label: "Browser Compatibility", icon: "🌐" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  {checks[item.key as keyof typeof checks] === "success" && (
                    <p className="text-sm text-green-600">✓ Working properly</p>
                  )}
                  {checks[item.key as keyof typeof checks] === "failed" && (
                    <p className="text-sm text-red-600">✗ Issue detected</p>
                  )}
                </div>
              </div>
              <div>
                {checks[item.key as keyof typeof checks] === "checking" && (
                  <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                )}
                {checks[item.key as keyof typeof checks] === "success" && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {checks[item.key as keyof typeof checks] === "failed" && <XCircle className="w-5 h-5 text-red-600" />}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Button onClick={handleStartInterview} disabled={!allPassed} size="lg" className="flex-1">
            Start Interview
          </Button>
          <Button onClick={() => onNavigate("candidate-dashboard")} variant="outline" size="lg" className="flex-1">
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  )
}
