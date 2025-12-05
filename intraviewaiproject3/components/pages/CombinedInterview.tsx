"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Video, VideoOff, SkipForward, X } from "lucide-react"

interface CombinedInterviewProps {
  onNavigate: (page: string) => void
}

export function CombinedInterview({ onNavigate }: CombinedInterviewProps) {
  const [interviewPhase, setInterviewPhase] = useState<"behavioral" | "coding">("behavioral")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [timeLeft, setTimeLeft] = useState(300)

  const behavioralQuestions = [
    "Tell me about yourself and your background",
    "Describe a challenging project you've worked on",
    "How do you handle conflicts in a team?",
    "Tell me about your leadership experience",
  ]

  const codingProblems = [
    { title: "Two Sum", difficulty: "Medium", timeLimit: 30 },
    { title: "Reverse Linked List", difficulty: "Medium", timeLimit: 30 },
  ]

  const handleNextQuestion = () => {
    if (interviewPhase === "behavioral") {
      if (currentQuestion < behavioralQuestions.length) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        // Transition to coding
        setInterviewPhase("coding")
        setCurrentQuestion(1)
      }
    } else {
      if (currentQuestion < codingProblems.length) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        // Interview complete
        onNavigate("interview-complete")
      }
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-white font-semibold">
            {interviewPhase === "behavioral" ? "Behavioral Interview" : "Coding Interview"}
          </h2>
          <p className="text-slate-400 text-sm">
            {interviewPhase === "behavioral"
              ? `Question ${currentQuestion} of ${behavioralQuestions.length}`
              : `Problem ${currentQuestion} of ${codingProblems.length}`}
          </p>
        </div>
        <div className="text-white font-mono text-lg">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </div>
        <button onClick={() => onNavigate("candidate-dashboard")} className="ml-4 p-2 hover:bg-slate-800 rounded-lg">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 flex gap-6 p-6">
        {/* Video Section */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 bg-slate-900 border-slate-700 rounded-xl overflow-hidden">
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center mb-4 animate-pulse">
                <span className="text-4xl text-white">AI</span>
              </div>
              <p className="text-white text-lg">
                AI Avatar {interviewPhase === "behavioral" ? "Listening" : "Thinking"}
              </p>
              <p className="text-slate-400 text-sm mt-2">
                {interviewPhase === "behavioral" ? "Please answer the question" : "Analyzing your code"}
              </p>
            </div>
          </Card>
        </div>

        {/* Interview Panel */}
        <div className="w-96 flex flex-col gap-4">
          {/* Question/Problem Display */}
          <Card className="flex-1 bg-slate-900 border-slate-700 p-6 rounded-xl overflow-hidden flex flex-col">
            <h3 className="text-white font-semibold mb-4">
              {interviewPhase === "behavioral" ? "Question" : "Problem"}
            </h3>
            <div className="flex-1 overflow-y-auto">
              <p className="text-white mb-4">
                {interviewPhase === "behavioral"
                  ? behavioralQuestions[currentQuestion - 1]
                  : `Solve: ${codingProblems[currentQuestion - 1]?.title}`}
              </p>
              {interviewPhase === "coding" && (
                <div className="text-slate-400 text-sm">
                  <p>Difficulty: {codingProblems[currentQuestion - 1]?.difficulty}</p>
                  <p>Time Limit: {codingProblems[currentQuestion - 1]?.timeLimit} minutes</p>
                </div>
              )}
            </div>
          </Card>

          {/* Progress */}
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">Progress</span>
              <span className="text-slate-400 text-sm">
                {interviewPhase === "behavioral"
                  ? `${currentQuestion}/${behavioralQuestions.length}`
                  : `${currentQuestion}/${codingProblems.length}`}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(currentQuestion / (interviewPhase === "behavioral" ? behavioralQuestions.length : codingProblems.length)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg transition"
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg transition"
            >
              {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              {isVideoOff ? "Turn On" : "Turn Off"}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleNextQuestion} className="flex-1">
              <SkipForward className="w-4 h-4 mr-2" />
              {currentQuestion ===
              (interviewPhase === "behavioral" ? behavioralQuestions.length : codingProblems.length)
                ? interviewPhase === "behavioral"
                  ? "Start Coding"
                  : "Complete"
                : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
