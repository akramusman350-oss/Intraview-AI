"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff } from "lucide-react"

interface BehavioralInterviewProps {
  onNavigate: (page: string) => void
}

export function BehavioralInterview({ onNavigate }: BehavioralInterviewProps) {
  const [seconds, setSeconds] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const totalQuestions = 10

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    return `${mins}:${(secs % 60).toString().padStart(2, "0")}`
  }

  const questions = [
    "Tell me about yourself and your professional background.",
    "Describe a time when you faced a challenging project deadline.",
    "How do you handle conflict with team members?",
    "Tell me about a time you failed and what you learned.",
    "Describe your leadership experience.",
    "How do you stay updated with industry trends?",
    "Tell me about a project you are proud of.",
    "How do you prioritize when you have multiple tasks?",
    "Describe a time you had to learn something new quickly.",
    "Why are you interested in this position?",
  ]

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Video */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-black p-8">
        <div className="w-full max-w-md aspect-video bg-slate-800 rounded-lg flex items-center justify-center mb-8 border-2 border-slate-700">
          {isVideoOff ? (
            <div className="text-white text-center">
              <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Camera off</p>
            </div>
          ) : (
            <div className="text-white text-center">
              <p className="text-2xl font-bold">You</p>
              <p className="text-sm opacity-75">Camera on</p>
            </div>
          )}
        </div>

        {/* AI Avatar */}
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <div className="text-4xl">🤖</div>
        </div>
        <p className="text-white text-sm">AI Interviewer</p>
      </div>

      {/* Right Side - Questions & Controls */}
      <div className="w-96 bg-slate-900 border-l border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <div className="text-white">
              <p className="text-sm opacity-75">Time Elapsed</p>
              <p className="text-2xl font-bold">{formatTime(seconds)}</p>
            </div>
            <div className="text-white text-right">
              <p className="text-sm opacity-75">Question</p>
              <p className="text-2xl font-bold">
                {currentQuestion}/{totalQuestions}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-white text-lg font-semibold mb-4">Current Question</h2>
          <p className="text-white text-base leading-relaxed">"{questions[currentQuestion - 1]}"</p>

          {/* Real-time Metrics */}
          <div className="mt-8 space-y-3">
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-white text-sm opacity-75">Emotion Detection</p>
              <p className="text-white font-semibold">😊 Confident</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-white text-sm opacity-75">Voice Analysis</p>
              <p className="text-white font-semibold">Clear & Articulate</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-white text-sm opacity-75">Engagement</p>
              <p className="text-green-400 font-semibold">High</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-slate-700 space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                isMuted ? "bg-red-600 hover:bg-red-700 text-white" : "bg-slate-700 hover:bg-slate-600 text-white"
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                isVideoOff ? "bg-red-600 hover:bg-red-700 text-white" : "bg-slate-700 hover:bg-slate-600 text-white"
              }`}
            >
              {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              {isVideoOff ? "On" : "Off"}
            </button>
          </div>

          <Button
            onClick={() => setCurrentQuestion(Math.min(currentQuestion + 1, totalQuestions))}
            disabled={currentQuestion >= totalQuestions}
            className="w-full"
          >
            Next Question →
          </Button>

          {currentQuestion === totalQuestions && (
            <Button onClick={() => onNavigate("interview-complete")} className="w-full bg-green-600 hover:bg-green-700">
              Complete Interview ✓
            </Button>
          )}

          <Button
            onClick={() => {
              if (confirm("Are you sure you want to end this interview?")) {
                onNavigate("candidate-dashboard")
              }
            }}
            variant="destructive"
            className="w-full"
          >
            End Interview
          </Button>
        </div>
      </div>
    </div>
  )
}
