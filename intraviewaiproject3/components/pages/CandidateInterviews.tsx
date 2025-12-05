"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Video, Code } from "lucide-react"
import { SidebarLayout } from "@/components/SidebarLayout"
import { useUserName } from "@/hooks/useUserName"

interface CandidateInterviewsProps {
  onNavigate: (page: string) => void
  onLogout: () => void
  setInterviewType: (type: "behavioral" | "coding") => void
}

export function CandidateInterviews({ onNavigate, onLogout, setInterviewType }: CandidateInterviewsProps) {
  const handleBehavioral = () => {
    setInterviewType("behavioral")
    onNavigate("system-check")
  }

  const handleCoding = () => {
    setInterviewType("coding")
    onNavigate("system-check")
  }

  const userName = useUserName()

  return (
    <SidebarLayout userName={userName} onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-8">Choose Interview Type</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          {/* Behavioral Interview */}
          <Card className="p-8 border-2 border-dashed border-slate-300 hover:border-blue-600 transition">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-blue-800" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Behavioral Interview</h3>
                <p className="text-slate-600 text-sm mt-1">Soft skills and experience assessment</p>
              </div>
            </div>
            <p className="text-slate-700 mb-6">
              Practice answering behavioral questions with AI feedback on your communication, confidence, and
              engagement.
            </p>
            <Button onClick={handleBehavioral} className="w-full">
              Start Interview
            </Button>
          </Card>

          {/* Coding Interview */}
          <Card className="p-8 border-2 border-dashed border-slate-300 hover:border-green-400 transition">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Coding Interview</h3>
                <p className="text-slate-600 text-sm mt-1">Technical assessment and problem solving</p>
              </div>
            </div>
            <p className="text-slate-700 mb-6">
              Solve coding problems in your preferred language with real-time feedback on code quality and efficiency.
            </p>
            <Button onClick={handleCoding} className="w-full bg-green-600 hover:bg-green-700">
              Start Interview
            </Button>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}
