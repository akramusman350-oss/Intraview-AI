"use client"

import { useState } from "react"
import { ProfileSetup } from "./IntraView/ProfileSetup"
import { InterviewRoom } from "./IntraView/InterviewRoom"
import { Recommendations } from "./IntraView/Recommendations"
import { InterviewsPage } from "./IntraView/InterviewsPage"

export type DashboardView = "profile" | "interviews" | "interview-active" | "recommendations"

interface ProfileData {
  personalInfo: {
    name: string
    email: string
    title: string
    location: string
  }
  education: Array<{
    institution: string
    degree: string
    field: string
  }>
  techSkills: string[]
}

interface ScheduledInterview {
  id: string
  scheduledDate: Date
  status: "scheduled" | "completed" | "cancelled"
}

interface InterviewSessionData {
  confidenceScore: number
  technicalAccuracy: number
  videoAnalysis: {
    eyeContact: number
    articulation: number
    clarity: number
  }
  codeTestResults: {
    testsPassed: number
    totalTests: number
    executionTime: string
  }
  feedback: {
    strengths: string[]
    improvements: string[]
  }
}

export default function IntraViewDashboard() {
  const [currentView, setCurrentView] = useState<DashboardView>("profile")
  const [profileData, setProfileData] = useState<ProfileData | null>({
    personalInfo: {
      name: "Abdul Rehman",
      email: "john@example.com",
      title: "Software Engineer",
      location: "San Francisco, CA",
    },
    education: [
      {
        institution: "Stanford University",
        degree: "Bachelor's",
        field: "Computer Science",
      },
    ],
    techSkills: ["Python", "React", "Node.js", "PostgreSQL"],
  })
  const [profileCompleted, setProfileCompleted] = useState(true)
  const [sessionData, setSessionData] = useState<InterviewSessionData | null>(null)
  const [scheduledInterviews, setScheduledInterviews] = useState<ScheduledInterview[]>([
    {
      id: "1",
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "scheduled",
    },
  ])
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(null)

  const handleProfileComplete = (data: ProfileData) => {
    setProfileData(data)
    setProfileCompleted(true)
    setCurrentView("interviews")
  }

  const handleProfileUpdate = (data: ProfileData) => {
    setProfileData(data)
    setProfileCompleted(true)
    setCurrentView("interviews")
  }

  const handleScheduleInterview = (date: Date) => {
    const newInterview: ScheduledInterview = {
      id: Date.now().toString(),
      scheduledDate: date,
      status: "scheduled",
    }
    setScheduledInterviews([...scheduledInterviews, newInterview])
  }

  const handleStartInterview = (interviewId: string) => {
    setActiveInterviewId(interviewId)
    setCurrentView("interview-active")
  }

  const handleInterviewComplete = (data: InterviewSessionData) => {
    setSessionData(data)
    if (activeInterviewId) {
      setScheduledInterviews(
        scheduledInterviews.map((interview) =>
          interview.id === activeInterviewId ? { ...interview, status: "completed" as const } : interview,
        ),
      )
    }
    setCurrentView("recommendations")
  }

  const handleBackToInterviews = () => {
    setActiveInterviewId(null)
    setCurrentView("interviews")
  }

  const handleNavigateToProfile = () => {
    setCurrentView("profile")
  }

  const handleRestartFlow = () => {
    setCurrentView("interviews")
    setSessionData(null)
    setActiveInterviewId(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {currentView === "profile" && (
        <ProfileSetup
          onComplete={handleProfileComplete}
          existingData={profileData}
          onUpdate={handleProfileUpdate}
          onNavigate={setCurrentView}
          profileCompleted={profileCompleted}
        />
      )}
      {currentView === "interviews" && profileData && (
        <InterviewsPage
          profileData={profileData}
          scheduledInterviews={scheduledInterviews}
          onScheduleInterview={handleScheduleInterview}
          onStartInterview={handleStartInterview}
          onEditProfile={handleNavigateToProfile}
          onNavigate={setCurrentView}
          profileCompleted={profileCompleted}
        />
      )}
      {currentView === "interview-active" && profileData && (
        <InterviewRoom profileData={profileData} onComplete={handleInterviewComplete} onExit={handleBackToInterviews} />
      )}
      {currentView === "recommendations" && (
        <Recommendations sessionData={sessionData} onRestart={handleRestartFlow} onNavigate={setCurrentView} />
      )}
    </div>
  )
}
