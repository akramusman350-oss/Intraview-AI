"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Play, Settings, Clock, CheckCircle, Lock, AlertCircle, X } from "lucide-react"
import { format } from "date-fns"
import { IntraViewSidebar } from "../../IntraViewSidebar"

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

interface InterviewsPageProps {
  profileData: ProfileData
  scheduledInterviews: ScheduledInterview[]
  onScheduleInterview: (date: Date) => void
  onStartInterview: (interviewId: string) => void
  onEditProfile: () => void
  onNavigate?: (view: any) => void
  profileCompleted?: boolean
}

export function InterviewsPage({
  profileData,
  scheduledInterviews,
  onScheduleInterview,
  onStartInterview,
  onEditProfile,
  onNavigate,
  profileCompleted,
}: InterviewsPageProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>("09:00")
  const [showProfileAlert, setShowProfileAlert] = useState(false)

  const handleSchedule = () => {
    if (selectedDate) {
      const [hours, minutes] = selectedTime.split(":").map(Number)
      const scheduledDateTime = new Date(selectedDate)
      scheduledDateTime.setHours(hours, minutes)
      onScheduleInterview(scheduledDateTime)
      setShowDatePicker(false)
      setSelectedDate(null)
      setSelectedTime("09:00")
    }
  }

  const handleScheduleClick = () => {
    if (!profileCompleted) {
      setShowProfileAlert(true)
      return
    }
    setShowDatePicker(!showDatePicker)
  }

  const handleStartClick = (interviewId: string) => {
    if (!profileCompleted) {
      setShowProfileAlert(true)
      return
    }
    onStartInterview(interviewId)
  }

  const upcomingInterviews = scheduledInterviews
    .filter((i) => i.status === "scheduled" && i.scheduledDate > new Date())
    .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())

  const completedInterviews = scheduledInterviews
    .filter((i) => i.status === "completed")
    .sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime())

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <IntraViewSidebar
        currentView="interviews"
        onNavigate={onNavigate || (() => {})}
        profileCompleted={profileCompleted}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Completion Alert */}
          {showProfileAlert && (
            <Card className="mb-6 p-4 border-l-4 border-l-destructive bg-destructive/10">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Profile Incomplete</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete your profile to schedule or start interviews.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setShowProfileAlert(false)
                    onEditProfile()
                  }}
                  className="ml-4"
                >
                  Go to Profile
                </Button>
                <button
                  onClick={() => setShowProfileAlert(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </Card>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Interviews</h1>
            <p className="text-muted-foreground">Schedule and manage your interview sessions</p>
            <div className="flex items-center justify-end mt-4">
              <Button variant="outline" onClick={onEditProfile}>
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Interview Card (Blurred) */}
          <Card className="p-8 mb-8 relative overflow-hidden bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800">
            <div className="absolute inset-0 backdrop-blur-sm bg-black/5 dark:bg-black/20" />
            <div className="relative z-10 flex flex-col items-center justify-center text-center py-12">
              <Lock className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Schedule Your Interview</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Choose a convenient date and time to start your technical interview practice session.
              </p>
              <Button size="lg" onClick={handleScheduleClick} className="bg-primary hover:bg-primary/90">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
            </div>

            {/* Date/Time Picker Modal */}
            {showDatePicker && (
              <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur flex items-center justify-center p-4 rounded-lg">
                <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Schedule Interview</h3>

                  {/* Date Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">Select Date</label>
                    <input
                      type="date"
                      value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                      onChange={(e) => setSelectedDate(e.target.valueAsDate)}
                      min={format(new Date(), "yyyy-MM-dd")}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    />
                  </div>

                  {/* Time Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-2">Select Time</label>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setShowDatePicker(false)
                        setSelectedDate(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={handleSchedule} disabled={!selectedDate}>
                      Confirm Schedule
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Upcoming Interviews */}
          {upcomingInterviews.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Upcoming Interviews</h2>
              <div className="space-y-3">
                {upcomingInterviews.map((interview) => (
                  <Card key={interview.id} className="p-4 flex items-center justify-between hover:bg-accent transition">
                    <div className="flex items-center gap-4">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {format(interview.scheduledDate, "EEEE, MMMM d, yyyy")}
                        </p>
                        <p className="text-sm text-muted-foreground">{format(interview.scheduledDate, "h:mm a")}</p>
                      </div>
                    </div>
                    <Button onClick={() => handleStartClick(interview.id)} className="bg-primary hover:bg-primary/90">
                      <Play className="w-4 h-4 mr-2" />
                      Start Interview
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed Interviews */}
          {completedInterviews.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Completed Interviews</h2>
              <div className="space-y-3">
                {completedInterviews.map((interview) => (
                  <Card key={interview.id} className="p-4 flex items-center justify-between opacity-75">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {format(interview.scheduledDate, "EEEE, MMMM d, yyyy")}
                        </p>
                        <p className="text-sm text-muted-foreground">{format(interview.scheduledDate, "h:mm a")}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tech Skills Display */}
          <div className="mt-8 p-4 bg-secondary rounded-lg">
            <p className="text-sm font-medium text-foreground mb-3">Interview Topics</p>
            <div className="flex flex-wrap gap-2">
              {profileData.techSkills.map((skill) => (
                <Badge key={skill} variant="primary" className="bg-primary text-primary-foreground">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
