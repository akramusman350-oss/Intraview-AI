"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, BookOpen, Code, ChevronRight, Plus, X } from "lucide-react"
import { IntraViewSidebar } from "../../IntraViewSidebar"

interface ProfileSetupProps {
  onComplete: (data: any) => void
  existingData?: any
  onUpdate?: (data: any) => void
  onNavigate?: (view: any) => void
  profileCompleted?: boolean
}

export function ProfileSetup({ onComplete, existingData, onUpdate, onNavigate, profileCompleted }: ProfileSetupProps) {
  const isEditing = !!existingData
  const [step, setStep] = useState<"personal" | "education" | "skills">("personal")
  const [personalInfo, setPersonalInfo] = useState(
    existingData?.personalInfo || {
      name: "",
      email: "",
      title: "",
      location: "",
    },
  )
  const [education, setEducation] = useState<Array<{ institution: string; degree: string; field: string }>>(
    existingData?.education || [],
  )
  const [currentEdu, setCurrentEdu] = useState({ institution: "", degree: "", field: "" })
  const [techSkills, setTechSkills] = useState<string[]>(existingData?.techSkills || [])
  const [skillInput, setSkillInput] = useState("")

  const handleAddEducation = () => {
    if (currentEdu.institution && currentEdu.degree && currentEdu.field) {
      setEducation([...education, currentEdu])
      setCurrentEdu({ institution: "", degree: "", field: "" })
    }
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !techSkills.includes(skillInput.trim())) {
      setTechSkills([...techSkills, skillInput.trim()])
      setSkillInput("")
    }
  }

  const handleComplete = () => {
    const data = {
      personalInfo,
      education,
      techSkills,
    }
    if (isEditing && onUpdate) {
      onUpdate(data)
    } else {
      onComplete(data)
    }
  }

  const isPersonalValid = personalInfo.name && personalInfo.email && personalInfo.title && personalInfo.location
  const isEducationValid = education.length > 0
  const isSkillsValid = techSkills.length > 0

  return (
    <div className="flex h-screen bg-background">
      <IntraViewSidebar
        currentView="profile"
        onNavigate={onNavigate || (() => {})}
        profileCompleted={profileCompleted}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen bg-background p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            {/* Progress Indicator */}
            <div className="flex gap-4 mb-8">
              {(["personal", "education", "skills"] as const).map((s, idx) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      step === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  {idx < 2 && <div className="w-8 h-0.5 bg-border" />}
                </div>
              ))}
            </div>

            {/* Content */}
            <Card className="p-6 md:p-8 mb-8">
              {/* Personal Information */}
              {step === "personal" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-semibold text-foreground">Personal Information</h2>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Usman Akram"
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Job Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Software Engineer"
                      value={personalInfo.title}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Location <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="San Francisco, CA"
                      value={personalInfo.location}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Education */}
              {step === "education" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-semibold text-foreground">Education</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Institution <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="University Name"
                        value={currentEdu.institution}
                        onChange={(e) => setCurrentEdu({ ...currentEdu, institution: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Degree <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Bachelor's, Master's, etc."
                        value={currentEdu.degree}
                        onChange={(e) => setCurrentEdu({ ...currentEdu, degree: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Field of Study <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Computer Science"
                        value={currentEdu.field}
                        onChange={(e) => setCurrentEdu({ ...currentEdu, field: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleAddEducation} variant="outline" className="w-full bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Education
                    </Button>
                  </div>

                  {/* Education List */}
                  {education.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h3 className="font-semibold text-foreground mb-3">Added Education</h3>
                      <div className="space-y-2">
                        {education.map((edu, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                            <div>
                              <p className="font-medium text-foreground">{edu.institution}</p>
                              <p className="text-sm text-muted-foreground">
                                {edu.degree} in {edu.field}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setEducation(education.filter((_, i) => i !== idx))
                              }}
                              className="text-muted-foreground hover:text-destructive transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tech Skills */}
              {step === "skills" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Code className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-semibold text-foreground">Tech Skills</h2>
                  </div>
                  <p className="text-muted-foreground">
                    Add your technical skills. These will customize your interview questions.
                  </p>

                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Python, React, Node.js"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddSkill()
                        }
                      }}
                    />
                    <Button onClick={handleAddSkill} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Skills Display */}
                  <div className="flex flex-wrap gap-2">
                    {techSkills.map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="px-3 py-2 text-sm hover:bg-destructive hover:text-destructive-foreground transition"
                        onClick={() => {
                          setTechSkills(techSkills.filter((_, i) => i !== idx))
                        }}
                      >
                        {skill}
                        <X className="w-3 h-3 ml-2" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              {step !== "personal" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (step === "education") setStep("personal")
                    else if (step === "skills") setStep("education")
                  }}
                >
                  Back
                </Button>
              )}
              <div className="flex-1" />
              {step === "personal" && (
                <Button onClick={() => setStep("education")} disabled={!isPersonalValid}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {step === "education" && (
                <Button onClick={() => setStep("skills")} disabled={!isEducationValid}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {step === "skills" && (
                <Button onClick={handleComplete} disabled={!isSkillsValid}>
                  {isEditing ? "Save Changes" : "Continue to Interviews"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
