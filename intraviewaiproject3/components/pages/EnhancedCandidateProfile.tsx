"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Plus, X } from "lucide-react"

interface EnhancedCandidateProfileProps {
  onNavigate: (page: string) => void
  onStartInterview: (profileData: ProfileData) => void
}

interface ProfileData {
  name: string
  title: string
  skills: string[]
  education: string
  projects: string
}

export function EnhancedCandidateProfile({ onNavigate, onStartInterview }: EnhancedCandidateProfileProps) {
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    title: "",
    skills: [],
    education: "",
    projects: "",
  })
  const [skillInput, setSkillInput] = useState("")

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }))
      setSkillInput("")
    }
  }

  const handleRemoveSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  const handleStartInterview = () => {
    if (formData.name && formData.title && formData.skills.length > 0) {
      onStartInterview(formData)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Candidate Profile Setup</h1>
          <p className="text-muted-foreground">Complete your profile to customize your interview experience</p>
        </div>

        {/* Personal Info Section */}
        <Card className="mb-6 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-primary">Personal Information</CardTitle>
            <CardDescription>Tell us about yourself</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="Abdul Rehman"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="border-slate-300 dark:border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">
                Current Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., Senior Software Engineer, Product Manager"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="border-slate-300 dark:border-slate-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack Section */}
        <Card className="mb-6 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-primary">Tech Stack</CardTitle>
            <CardDescription>Add your technical skills (determines interview questions)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Python, React, TypeScript"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                className="border-slate-300 dark:border-slate-600"
              />
              <Button onClick={handleAddSkill} className="bg-primary hover:bg-accent text-primary-foreground">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Skills Tags */}
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button onClick={() => handleRemoveSkill(index)} className="hover:text-primary transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Experience Section */}
        <Card className="mb-8 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-primary">Experience</CardTitle>
            <CardDescription>Share your background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="education" className="text-foreground">
                Education
              </Label>
              <Input
                id="education"
                placeholder="e.g., Bachelor of Science in Computer Science, MIT"
                value={formData.education}
                onChange={(e) => setFormData((prev) => ({ ...prev, education: e.target.value }))}
                className="border-slate-300 dark:border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projects" className="text-foreground">
                Notable Projects
              </Label>
              <Input
                id="projects"
                placeholder="e.g., Built a real-time chat app, Led team to 2x performance"
                value={formData.projects}
                onChange={(e) => setFormData((prev) => ({ ...prev, projects: e.target.value }))}
                className="border-slate-300 dark:border-slate-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* CTA Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleStartInterview}
            disabled={!formData.name || !formData.title || formData.skills.length === 0}
            className="flex-1 bg-primary hover:bg-accent text-primary-foreground text-lg py-6 rounded-lg"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Save & Start Interview
          </Button>
        </div>
      </div>
    </div>
  )
}
