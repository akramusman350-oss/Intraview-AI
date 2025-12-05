"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SidebarLayout } from "@/components/SidebarLayout"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  FolderKanban,
  Code,
  Link as LinkIcon,
  X,
  Save,
  ArrowLeft,
  Upload,
  FileText,
  Download,
  Plus,
  Sparkles,
} from "lucide-react"

interface EditCandidateProfileProps {
  userName: string
  onNavigate: (page: string) => void
  onLogout: () => void
}

interface Education {
  institution: string
  degree: string
  field: string
  start_date: string
  end_date: string
}

interface WorkExperience {
  company: string
  title: string
  description: string
  start_date: string
  end_date: string
  location: string
}

interface Project {
  title: string
  description: string
  technologies: string
  github_url: string
  start_date: string
  end_date: string
}

export function EditCandidateProfile({ userName, onNavigate, onLogout }: EditCandidateProfileProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    bio: "",
    education: [] as Education[],
    work_experience: [] as WorkExperience[],
    projects: [] as Project[],
    skills: [] as string[],
  })
  const [newSkill, setNewSkill] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [uploadingCv, setUploadingCv] = useState(false)
  const [parsingCv, setParsingCv] = useState(false)
  const [cvInfo, setCvInfo] = useState<{ filename: string; original_name: string } | null>(null)

  useEffect(() => {
    // Check if we have a token before making API calls
    const token = localStorage.getItem("authToken")
    if (!token) {
      setLoading(false)
      return // Don't fetch if no token
    }

    const fetchProfile = async () => {
      try {
        const data = await api.get("/users/me")
        const profileInfo = data?.profile_info || {}
        setProfile({
          name: profileInfo?.name || data?.name || userName || "",
          email: data?.email || "",
          phone: profileInfo?.phone || "",
          location: profileInfo?.location || "",
          linkedin: profileInfo?.linkedin || "",
          github: profileInfo?.github || "",
          bio: profileInfo?.bio || "",
          education: profileInfo?.education || [],
          work_experience: profileInfo?.work_experience || [],
          projects: profileInfo?.projects || [],
          skills: profileInfo?.skills || [],
        })
        
        // Set CV info if exists
        if (profileInfo?.cv_filename) {
          setCvInfo({
            filename: profileInfo.cv_filename,
            original_name: profileInfo.cv_original_name || profileInfo.cv_filename,
          })
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [userName, toast])

  const handleAddSkill = () => {
    if (newSkill && !profile.skills.includes(newSkill)) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill],
      })
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skill),
    })
  }

  const handleAddEducation = () => {
    setProfile({
      ...profile,
      education: [...profile.education, {
        institution: "",
        degree: "",
        field: "",
        start_date: "",
        end_date: "",
      }],
    })
  }

  const handleRemoveEducation = (index: number) => {
    setProfile({
      ...profile,
      education: profile.education.filter((_, i) => i !== index),
    })
  }

  const handleUpdateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...profile.education]
    updated[index] = { ...updated[index], [field]: value }
    setProfile({ ...profile, education: updated })
  }

  const handleAddWorkExperience = () => {
    setProfile({
      ...profile,
      work_experience: [...profile.work_experience, {
        company: "",
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        location: "",
      }],
    })
  }

  const handleRemoveWorkExperience = (index: number) => {
    setProfile({
      ...profile,
      work_experience: profile.work_experience.filter((_, i) => i !== index),
    })
  }

  const handleUpdateWorkExperience = (index: number, field: keyof WorkExperience, value: string) => {
    const updated = [...profile.work_experience]
    updated[index] = { ...updated[index], [field]: value }
    setProfile({ ...profile, work_experience: updated })
  }

  const handleAddProject = () => {
    setProfile({
      ...profile,
      projects: [...profile.projects, {
        title: "",
        description: "",
        technologies: "",
        github_url: "",
        start_date: "",
        end_date: "",
      }],
    })
  }

  const handleRemoveProject = (index: number) => {
    setProfile({
      ...profile,
      projects: profile.projects.filter((_, i) => i !== index),
    })
  }

  const handleUpdateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...profile.projects]
    updated[index] = { ...updated[index], [field]: value }
    setProfile({ ...profile, projects: updated })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, or DOCX file",
          variant: "destructive",
        })
        return
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 10MB",
          variant: "destructive",
        })
        return
      }
      
      setCvFile(file)
    }
  }

  const handleUploadCv = async (parse: boolean = false) => {
    if (!cvFile) return
    
    setUploadingCv(true)
    if (parse) setParsingCv(true)
    
    try {
      const formData = new FormData()
      formData.append("file", cvFile)
      
      const token = localStorage.getItem("authToken")
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/users/me/upload-cv?parse=${parse}`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to upload CV")
      }
      
      const result = await response.json()
      setCvInfo({
        filename: result.filename,
        original_name: result.original_name,
      })
      
      // If parsed, update profile with parsed data
      if (parse && result.parsed_data) {
        const parsed = result.parsed_data
        setProfile(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          phone: parsed.phone || prev.phone,
          location: parsed.location || prev.location,
          linkedin: parsed.linkedin || prev.linkedin,
          github: parsed.github || prev.github,
          bio: parsed.bio || prev.bio,
          education: parsed.education?.length > 0 ? parsed.education : prev.education,
          work_experience: parsed.work_experience?.length > 0 ? parsed.work_experience : prev.work_experience,
          projects: parsed.projects?.length > 0 ? parsed.projects : prev.projects,
          skills: parsed.skills?.length > 0 ? [...prev.skills, ...parsed.skills.filter((s: string) => !prev.skills.includes(s))] : prev.skills,
        }))
        
        toast({
          title: "Success",
          description: "CV uploaded and parsed successfully. Please review and edit the extracted information.",
        })
      } else {
        toast({
          title: "Success",
          description: "CV uploaded successfully",
        })
      }
      
      setCvFile(null)
      const fileInput = document.getElementById("cv-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error: any) {
      console.error("Failed to upload CV:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload CV",
        variant: "destructive",
      })
    } finally {
      setUploadingCv(false)
      setParsingCv(false)
    }
  }

  const handleDownloadCv = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/users/me/download-cv`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        throw new Error("Failed to download CV")
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = cvInfo?.original_name || "cv.pdf"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      console.error("Failed to download CV:", error)
      toast({
        title: "Error",
        description: "Failed to download CV",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const profileInfo = {
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        linkedin: profile.linkedin,
        github: profile.github,
        bio: profile.bio,
        education: profile.education,
        work_experience: profile.work_experience,
        projects: profile.projects,
        skills: profile.skills,
      }

      await api.put("/users/me", {
        profile_info: profileInfo,
      })

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      // Navigate back to profile page
      setTimeout(() => {
        onNavigate("candidate-profile")
      }, 500)
    } catch (error: any) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <SidebarLayout userName={userName} currentPage="candidate-profile" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout userName={userName} currentPage="candidate-profile" onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        {/* Topbar */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("candidate-profile")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 max-w-4xl space-y-6">
          {/* CV/Resume Upload */}
          <Card className="p-6 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              CV/Resume
            </h3>
            <div className="space-y-4">
              {cvInfo ? (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-800" />
                    <div>
                      <p className="font-medium text-slate-900">{cvInfo.original_name}</p>
                      <p className="text-sm text-slate-600">CV uploaded</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDownloadCv}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg">
                  <p className="text-sm text-slate-600 mb-3">No CV uploaded yet</p>
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <Label className="text-slate-700 font-medium mb-2 block">
                    Upload CV/Resume (PDF, DOC, DOCX - Max 10MB)
                  </Label>
                  <Input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="border-slate-300"
                  />
                </div>
                {cvFile && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-900">{cvFile.name}</span>
                        <span className="text-xs text-slate-500">
                          ({(cvFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUploadCv(false)}
                        disabled={uploadingCv}
                        variant="outline"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingCv ? "Uploading..." : "Upload Only"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUploadCv(true)}
                        disabled={uploadingCv || parsingCv}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {parsingCv ? "Parsing..." : "Upload & Parse CV"}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                      "Upload & Parse CV" will automatically extract information from your CV and fill the profile fields.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-700 font-medium mb-2 block">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Usman Akram"
                  className="border-slate-300"
                />
              </div>
              <div>
                <Label className="text-slate-700 font-medium mb-2 block flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  value={profile.email}
                  disabled
                  className="border-slate-300 bg-slate-50"
                />
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <Label className="text-slate-700 font-medium mb-2 block flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="92309-0314669"
                  className="border-slate-300"
                />
              </div>
              <div>
                <Label className="text-slate-700 font-medium mb-2 block flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Input
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="Islamabad, Pakistan"
                  className="border-slate-300"
                />
              </div>
            </div>
          </Card>

          {/* Educational Details */}
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Educational Details
              </h3>
              <Button size="sm" onClick={handleAddEducation} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            </div>
            <div className="space-y-4">
              {profile.education.map((edu, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-900">Education #{index + 1}</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveEducation(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-700 font-medium mb-2 block">Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => handleUpdateEducation(index, "institution", e.target.value)}
                        placeholder="Comsats University, Wah, Pakistan"
                        className="border-slate-300"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-medium mb-2 block">Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(index, "degree", e.target.value)}
                        placeholder="Bachelor's"
                        className="border-slate-300"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-medium mb-2 block">Field of Study</Label>
                      <Input
                        value={edu.field}
                        onChange={(e) => handleUpdateEducation(index, "field", e.target.value)}
                        placeholder="Computer Science (Specialization: Data Science)"
                        className="border-slate-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-700 font-medium mb-2 block">Start Date</Label>
                        <Input
                          value={edu.start_date}
                          onChange={(e) => handleUpdateEducation(index, "start_date", e.target.value)}
                          placeholder="Sep 2022"
                          className="border-slate-300"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 font-medium mb-2 block">End Date</Label>
                        <Input
                          value={edu.end_date}
                          onChange={(e) => handleUpdateEducation(index, "end_date", e.target.value)}
                          placeholder="Jun 2026"
                          className="border-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {profile.education.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No education entries. Click "Add Education" to add one.</p>
              )}
            </div>
          </Card>

          {/* Work Experience */}
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Work Experience
              </h3>
              <Button size="sm" onClick={handleAddWorkExperience} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </div>
            <div className="space-y-4">
              {profile.work_experience.map((exp, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-900">Experience #{index + 1}</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveWorkExperience(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-700 font-medium mb-2 block">Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => handleUpdateWorkExperience(index, "company", e.target.value)}
                        placeholder="Saturn Solutions"
                        className="border-slate-300"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-medium mb-2 block">Job Title</Label>
                      <Input
                        value={exp.title}
                        onChange={(e) => handleUpdateWorkExperience(index, "title", e.target.value)}
                        placeholder="Python Developer"
                        className="border-slate-300"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-medium mb-2 block">Location</Label>
                      <Input
                        value={exp.location}
                        onChange={(e) => handleUpdateWorkExperience(index, "location", e.target.value)}
                        placeholder="Islamabad"
                        className="border-slate-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-700 font-medium mb-2 block">Start Date</Label>
                        <Input
                          value={exp.start_date}
                          onChange={(e) => handleUpdateWorkExperience(index, "start_date", e.target.value)}
                          placeholder="Jun 2025"
                          className="border-slate-300"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 font-medium mb-2 block">End Date</Label>
                        <Input
                          value={exp.end_date}
                          onChange={(e) => handleUpdateWorkExperience(index, "end_date", e.target.value)}
                          placeholder="Present"
                          className="border-slate-300"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-slate-700 font-medium mb-2 block">Description</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => handleUpdateWorkExperience(index, "description", e.target.value)}
                        placeholder="Developing backend systems and AI-powered chatbots using Python and FastAPI..."
                        rows={3}
                        className="border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {profile.work_experience.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No work experience entries. Click "Add Experience" to add one.</p>
              )}
            </div>
          </Card>

          {/* Projects */}
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FolderKanban className="w-5 h-5" />
                Projects
              </h3>
              <Button size="sm" onClick={handleAddProject} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>
            <div className="space-y-4">
              {profile.projects.map((project, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-900">Project #{index + 1}</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveProject(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-700 font-medium mb-2 block">Project Title</Label>
                      <Input
                        value={project.title}
                        onChange={(e) => handleUpdateProject(index, "title", e.target.value)}
                        placeholder="Power BI Sales Dashboard"
                        className="border-slate-300"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-medium mb-2 block flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        GitHub URL
                      </Label>
                      <Input
                        value={project.github_url}
                        onChange={(e) => handleUpdateProject(index, "github_url", e.target.value)}
                        placeholder="https://github.com/username/project"
                        className="border-slate-300"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-medium mb-2 block">Technologies</Label>
                      <Input
                        value={project.technologies}
                        onChange={(e) => handleUpdateProject(index, "technologies", e.target.value)}
                        placeholder="Python, FastAPI, MongoDB"
                        className="border-slate-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-700 font-medium mb-2 block">Start Date</Label>
                        <Input
                          value={project.start_date}
                          onChange={(e) => handleUpdateProject(index, "start_date", e.target.value)}
                          placeholder="Apr 2025"
                          className="border-slate-300"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 font-medium mb-2 block">End Date</Label>
                        <Input
                          value={project.end_date}
                          onChange={(e) => handleUpdateProject(index, "end_date", e.target.value)}
                          placeholder="May 2025"
                          className="border-slate-300"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-slate-700 font-medium mb-2 block">Description</Label>
                      <Textarea
                        value={project.description}
                        onChange={(e) => handleUpdateProject(index, "description", e.target.value)}
                        placeholder="Created an interactive dashboard to analyze monthly sales trends..."
                        rows={3}
                        className="border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {profile.projects.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No projects. Click "Add Project" to add one.</p>
              )}
            </div>
          </Card>

          {/* Technical Skills */}
          <Card className="p-6 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Technical Skills
            </h3>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add a skill (e.g., Python, Java, React)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                className="border-slate-300"
              />
              <Button onClick={handleAddSkill} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-blue-200 text-blue-800 rounded-full">
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)} className="hover:text-blue-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {profile.skills.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No skills added. Add skills above.</p>
            )}
          </Card>

          {/* Social Profiles */}
          <Card className="p-6 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Social Profiles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-700 font-medium mb-2 block">LinkedIn Profile</Label>
                <Input
                  value={profile.linkedin}
                  onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="border-slate-300"
                />
              </div>
              <div>
                <Label className="text-slate-700 font-medium mb-2 block">GitHub Profile</Label>
                <Input
                  value={profile.github}
                  onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                  placeholder="https://github.com/username"
                  className="border-slate-300"
                />
              </div>
            </div>
          </Card>

          {/* About You / Bio */}
          <Card className="p-6 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">About You</h3>
            <Textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Python Developer with experience in developing backend systems and AI-powered chatbots using Python and FastAPI. Focused on API development, automation tools, and creating intelligent solutions to enhance product scalability and user interaction."
              rows={5}
              className="border-slate-300"
            />
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}
