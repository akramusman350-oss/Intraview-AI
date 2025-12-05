"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, ChevronDown, ChevronUp, Edit2 } from "lucide-react"
import { SidebarLayout } from "@/components/SidebarLayout"

interface ProfileSetupProps {
  onStartInterview?: (profileData: ProfileFormData) => void
}

export interface ProfileFormData {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    currentJobTitle: string
    location: string
    linkedinUrl: string
  }
  education: Array<{
    institutionName: string
    degreeCertificate: string
    fieldOfStudy: string
    startYear: string
    endYear: string
  }>
  experience: Array<{
    companyName: string
    jobTitle: string
    startDate: string
    endDate: string
    description: string
  }>
  skills: Array<{
    name: string
    proficiency: "Beginner" | "Intermediate" | "Expert"
  }>
  projects: Array<{
    title: string
    techStack: string
    description: string
    link: string
  }>
}

export function ProfileSetup({ onStartInterview }: ProfileSetupProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      currentJobTitle: "",
      location: "",
      linkedinUrl: "",
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
  })

  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    education: true,
    experience: true,
    skills: true,
    projects: true,
  })

  const [skillInput, setSkillInput] = useState("")
  const [skillProficiency, setSkillProficiency] = useState<"Beginner" | "Intermediate" | "Expert">("Intermediate")

  const calculateCompletion = () => {
    let filled = 0
    let total = 0

    total += 6
    if (formData.personalInfo.fullName && formData.personalInfo.email && formData.personalInfo.currentJobTitle) {
      filled += 3
    }
    filled += Object.values(formData.personalInfo).filter((v) => v).length

    total += 5
    filled += Math.min(formData.skills.length, 5)

    total += 3
    filled += Math.min(formData.education.length, 3)

    total += 3
    filled += Math.min(formData.experience.length, 3)

    total += 3
    filled += Math.min(formData.projects.length, 3)

    return Math.round((filled / total) * 100)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, { name: skillInput.trim(), proficiency: skillProficiency }],
      }))
      setSkillInput("")
    }
  }

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { institutionName: "", degreeCertificate: "", fieldOfStudy: "", startYear: "", endYear: "" },
      ],
    }))
  }

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }))
  }

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [...prev.experience, { companyName: "", jobTitle: "", startDate: "", endDate: "", description: "" }],
    }))
  }

  const removeExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }))
  }

  const addProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [...prev.projects, { title: "", techStack: "", description: "", link: "" }],
    }))
  }

  const removeProject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }))
  }

  const isProfileComplete =
    formData.personalInfo.fullName &&
    formData.personalInfo.email &&
    formData.personalInfo.currentJobTitle &&
    formData.skills.length > 0

  const completion = calculateCompletion()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleNavigation = (page: string) => {
    console.log("Navigate to:", page)
  }

  return (
    <SidebarLayout userName={formData.personalInfo.fullName || "Candidate"} onNavigate={handleNavigation}>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header Card */}
          <Card className="mb-8 border-slate-200 shadow-sm bg-white">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <span className="text-2xl font-bold text-blue-800">{getInitials(formData.personalInfo.fullName) || "JD"}</span>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">{formData.personalInfo.fullName || "Your Name"}</h1>
                    <p className="text-slate-600 mb-3">{formData.personalInfo.email || "your@email.com"}</p>
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Profile Completeness</span>
                        <span className="text-sm font-bold text-blue-800">{completion}%</span>
                      </div>
                      <div className="flex w-full h-2 gap-0">
                        <div
                          className="bg-black rounded-l-full transition-all duration-300"
                          style={{ width: `${completion}%` }}
                        />
                        <div className="flex-1 bg-slate-300 rounded-r-full" />
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-slate-300 gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Your Profile</h2>
            <p className="text-slate-600">Add your professional information to get personalized interview questions</p>
          </div>

          {/* Personal Information Section */}
          <Card className="mb-6 border-slate-200 shadow-sm bg-white">
            <div
              onClick={() => toggleSection("personal")}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition cursor-default"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-800 bg-transparent gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                {expandedSections.personal ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            {expandedSections.personal && (
              <CardContent className="space-y-6 border-t border-slate-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-900 font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Abdul Rehman"
                      value={formData.personalInfo.fullName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, fullName: e.target.value },
                        }))
                      }
                      className="border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-900 font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.personalInfo.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, email: e.target.value },
                        }))
                      }
                      className="border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-900 font-medium">Phone Number</Label>
                    <Input
                      placeholder="+1 (555) 123-4567"
                      value={formData.personalInfo.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, phone: e.target.value },
                        }))
                      }
                      className="border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-900 font-medium">
                      Current Job Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Senior Software Engineer"
                      value={formData.personalInfo.currentJobTitle}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, currentJobTitle: e.target.value },
                        }))
                      }
                      className="border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-900 font-medium">Location</Label>
                    <Input
                      placeholder="San Francisco, CA"
                      value={formData.personalInfo.location}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, location: e.target.value },
                        }))
                      }
                      className="border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-900 font-medium">LinkedIn URL</Label>
                    <Input
                      placeholder="linkedin.com/in/johndoe"
                      value={formData.personalInfo.linkedinUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, linkedinUrl: e.target.value },
                        }))
                      }
                      className="border-slate-300"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Education Section */}
          <Card className="mb-6 border-slate-200 shadow-sm">
            <div
              onClick={() => toggleSection("education")}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition cursor-default"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Education</h2>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-800 bg-transparent gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                {expandedSections.education ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            {expandedSections.education && (
              <CardContent className="space-y-6 border-t border-slate-200 pt-6">
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-lg relative">
                    <button
                      onClick={() => removeEducation(idx)}
                      className="absolute top-3 right-3 p-1 hover:bg-red-100 rounded transition"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Institution Name</Label>
                        <Input
                          placeholder="Stanford University"
                          value={edu.institutionName}
                          onChange={(e) => {
                            const updated = [...formData.education]
                            updated[idx].institutionName = e.target.value
                            setFormData((prev) => ({ ...prev, education: updated }))
                          }}
                          className="border-slate-300 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Degree/Certificate</Label>
                        <Input
                          placeholder="Bachelor of Science"
                          value={edu.degreeCertificate}
                          onChange={(e) => {
                            const updated = [...formData.education]
                            updated[idx].degreeCertificate = e.target.value
                            setFormData((prev) => ({ ...prev, education: updated }))
                          }}
                          className="border-slate-300 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Field of Study</Label>
                        <Input
                          placeholder="Computer Science"
                          value={edu.fieldOfStudy}
                          onChange={(e) => {
                            const updated = [...formData.education]
                            updated[idx].fieldOfStudy = e.target.value
                            setFormData((prev) => ({ ...prev, education: updated }))
                          }}
                          className="border-slate-300 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Start Year</Label>
                          <Input
                            type="number"
                            placeholder="2018"
                            value={edu.startYear}
                            onChange={(e) => {
                              const updated = [...formData.education]
                              updated[idx].startYear = e.target.value
                              setFormData((prev) => ({ ...prev, education: updated }))
                            }}
                            className="border-slate-300 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">End Year</Label>
                          <Input
                            type="number"
                            placeholder="2022"
                            value={edu.endYear}
                            onChange={(e) => {
                              const updated = [...formData.education]
                              updated[idx].endYear = e.target.value
                              setFormData((prev) => ({ ...prev, education: updated }))
                            }}
                            className="border-slate-300 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  onClick={addEducation}
                  variant="outline"
                  className="w-full text-blue-800 border-blue-600 bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Experience Section */}
          <Card className="mb-6 border-slate-200 shadow-sm">
            <div
              onClick={() => toggleSection("experience")}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition cursor-default"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Professional Experience</h2>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-800 bg-transparent gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                {expandedSections.experience ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            {expandedSections.experience && (
              <CardContent className="space-y-6 border-t border-slate-200 pt-6">
                {formData.experience.map((exp, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-lg relative">
                    <button
                      onClick={() => removeExperience(idx)}
                      className="absolute top-3 right-3 p-1 hover:bg-red-100 rounded transition"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Company Name</Label>
                        <Input
                          placeholder="Acme Corporation"
                          value={exp.companyName}
                          onChange={(e) => {
                            const updated = [...formData.experience]
                            updated[idx].companyName = e.target.value
                            setFormData((prev) => ({ ...prev, experience: updated }))
                          }}
                          className="border-slate-300 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Job Title</Label>
                        <Input
                          placeholder="Senior Engineer"
                          value={exp.jobTitle}
                          onChange={(e) => {
                            const updated = [...formData.experience]
                            updated[idx].jobTitle = e.target.value
                            setFormData((prev) => ({ ...prev, experience: updated }))
                          }}
                          className="border-slate-300 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Start Date</Label>
                        <Input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => {
                            const updated = [...formData.experience]
                            updated[idx].startDate = e.target.value
                            setFormData((prev) => ({ ...prev, experience: updated }))
                          }}
                          className="border-slate-300 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">End Date</Label>
                        <Input
                          type="month"
                          placeholder="Present"
                          value={exp.endDate}
                          onChange={(e) => {
                            const updated = [...formData.experience]
                            updated[idx].endDate = e.target.value
                            setFormData((prev) => ({ ...prev, experience: updated }))
                          }}
                          className="border-slate-300 text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm font-medium">Description</Label>
                      <Textarea
                        placeholder="Describe your responsibilities and achievements..."
                        value={exp.description}
                        onChange={(e) => {
                          const updated = [...formData.experience]
                          updated[idx].description = e.target.value
                          setFormData((prev) => ({ ...prev, experience: updated }))
                        }}
                        className="border-slate-300 text-sm resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  onClick={addExperience}
                  variant="outline"
                  className="w-full text-blue-800 border-blue-600 bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Skills Section */}
          <Card className="mb-6 border-slate-200 shadow-sm">
            <div
              onClick={() => toggleSection("skills")}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition cursor-default"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Hard Skills</h2>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-800 bg-transparent gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                {expandedSections.skills ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            {expandedSections.skills && (
              <CardContent className="space-y-6 border-t border-slate-200 pt-6">
                <div className="flex gap-3">
                  <Input
                    placeholder="e.g., React, Python, AWS, System Design"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    className="border-slate-300 flex-1"
                  />
                  <select
                    value={skillProficiency}
                    onChange={(e) => setSkillProficiency(e.target.value as typeof skillProficiency)}
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Expert</option>
                  </select>
                  <Button onClick={addSkill} size="sm" className="bg-blue-800 hover:bg-blue-900">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Skill
                  </Button>
                </div>

                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-900 rounded-full text-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-xs opacity-75">{skill.proficiency}</span>
                        </div>
                        <button onClick={() => removeSkill(idx)} className="ml-1 hover:opacity-70 transition">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Projects Section */}
          <Card className="mb-8 border-slate-200 shadow-sm">
            <div
              onClick={() => toggleSection("projects")}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition cursor-default"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-800 bg-transparent gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                {expandedSections.projects ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            {expandedSections.projects && (
              <CardContent className="space-y-6 border-t border-slate-200 pt-6">
                {formData.projects.map((proj, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-lg relative">
                    <button
                      onClick={() => removeProject(idx)}
                      className="absolute top-3 right-3 p-1 hover:bg-red-100 rounded transition"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Project Title</Label>
                        <Input
                          placeholder="E-commerce Platform"
                          value={proj.title}
                          onChange={(e) => {
                            const updated = [...formData.projects]
                            updated[idx].title = e.target.value
                            setFormData((prev) => ({ ...prev, projects: updated }))
                          }}
                          className="border-slate-300 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tech Stack</Label>
                        <Input
                          placeholder="React, Node.js, MongoDB"
                          value={proj.techStack}
                          onChange={(e) => {
                            const updated = [...formData.projects]
                            updated[idx].techStack = e.target.value
                            setFormData((prev) => ({ ...prev, projects: updated }))
                          }}
                          className="border-slate-300 text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm font-medium">Description</Label>
                      <Textarea
                        placeholder="Describe your project..."
                        value={proj.description}
                        onChange={(e) => {
                          const updated = [...formData.projects]
                          updated[idx].description = e.target.value
                          setFormData((prev) => ({ ...prev, projects: updated }))
                        }}
                        className="border-slate-300 text-sm resize-none"
                        rows={2}
                      />
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm font-medium">GitHub / Live Link</Label>
                      <Input
                        placeholder="https://github.com/user/project"
                        value={proj.link}
                        onChange={(e) => {
                          const updated = [...formData.projects]
                          updated[idx].link = e.target.value
                          setFormData((prev) => ({ ...prev, projects: updated }))
                        }}
                        className="border-slate-300 text-sm"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  onClick={addProject}
                  variant="outline"
                  className="w-full text-blue-800 border-blue-600 bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Footer with Actions */}
          <div className="flex gap-4 justify-end mt-8">
            <Button variant="outline" className="border-slate-300 bg-transparent">
              Save Profile
            </Button>
            <Button
              onClick={() => onStartInterview?.(formData)}
              disabled={!isProfileComplete}
              className="bg-blue-800 hover:bg-blue-900 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start AI Interview
            </Button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
