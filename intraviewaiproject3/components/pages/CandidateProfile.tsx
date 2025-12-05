"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SidebarLayout } from "@/components/SidebarLayout"
import { api } from "@/lib/api"
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Edit2,
  FileText,
  Download,
  FolderKanban,
  Code,
  Link as LinkIcon,
} from "lucide-react"

interface CandidateProfileProps {
  userName: string
  onNavigate: (page: string) => void
  onLogout: () => void
}

export function CandidateProfile({ userName, onNavigate, onLogout }: CandidateProfileProps) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)

  const fetchProfile = async () => {
    // Check if we have a token before making API calls
    const token = localStorage.getItem("authToken")
    if (!token) {
      setLoading(false)
      return // Don't fetch if no token
    }

    try {
      setLoading(true)
      const data = await api.get("/users/me")
      console.log("Profile data fetched:", data)
      console.log("Profile info:", data?.profile_info)
      console.log("Bio:", data?.profile_info?.bio)
      console.log("CV filename:", data?.profile_info?.cv_filename)
      setProfile(data)
      
      // Load profile photo if exists
      if (data?.profile_info?.photo_filename) {
        const photoUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/users/me/photo`
        const token = localStorage.getItem("authToken")
        try {
          const response = await fetch(photoUrl, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          })
          if (response.ok) {
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            setProfilePhoto((prev) => {
              if (prev) {
                URL.revokeObjectURL(prev)
              }
              return url
            })
          }
        } catch (error) {
          console.error("Failed to load photo:", error)
          setProfilePhoto((prev) => {
            if (prev) {
              URL.revokeObjectURL(prev)
            }
            return null
          })
        }
      } else {
        setProfilePhoto((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev)
          }
          return null
        })
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    
    // Cleanup on unmount
    return () => {
      setProfilePhoto((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev)
        }
        return null
      })
    }
  }, [])

  if (loading) {
    return (
      <SidebarLayout userName={userName} currentPage="candidate-profile" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </SidebarLayout>
    )
  }

  const profileInfo = profile?.profile_info || {}
  const displayName = profileInfo?.name || profile?.name || userName || "Your Name"
  const displayEmail = profile?.email || "your@email.com"
  const phone = profileInfo?.phone || ""
  const location = profileInfo?.location || ""
  const linkedin = profileInfo?.linkedin || ""
  const github = profileInfo?.github || ""
  const bio = profileInfo?.bio || ""
  const skills = profileInfo?.skills || []
  const education = profileInfo?.education || []
  const work_experience = profileInfo?.work_experience || []
  const projects = profileInfo?.projects || []
  const cvFilename = profileInfo?.cv_filename || null
  const cvOriginalName = profileInfo?.cv_original_name || profileInfo?.cv_filename || null

  // Debug logging
  console.log("Rendering profile - Bio:", bio, "CV:", cvFilename)

  // Calculate profile completeness
  const totalFields = 10
  let filledFields = 0
  
  if (displayName && displayName.trim() !== "") filledFields++
  if (displayEmail && displayEmail.trim() !== "") filledFields++
  if (phone && phone.trim() !== "") filledFields++
  if (location && location.trim() !== "") filledFields++
  if (bio && bio.trim() !== "") filledFields++
  if (linkedin && linkedin.trim() !== "") filledFields++
  if (github && github.trim() !== "") filledFields++
  if (education.length > 0) filledFields++
  if (work_experience.length > 0) filledFields++
  if (skills.length > 0) filledFields++
  
  const completeness = Math.round((filledFields / totalFields) * 100)

  return (
    <SidebarLayout userName={userName} currentPage="candidate-profile" onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        {/* Topbar */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <Button onClick={() => onNavigate("candidate-profile-edit")} variant="outline">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 max-w-4xl space-y-6">
          {/* Profile Header */}
          <Card className="p-6 md:p-8 bg-white border-slate-200">
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-800 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">{displayName}</h2>
                <p className="text-slate-600 mb-2">{displayEmail}</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">Profile Completeness</span>
                    <span className="text-sm font-medium text-blue-800">{completeness}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-800 h-2 rounded-full transition-all"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6 md:p-8 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-700 font-medium">Email</span>
                </div>
                <p className="text-slate-900">{displayEmail || "Not provided"}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-700 font-medium">Phone</span>
                </div>
                <p className="text-slate-900">{phone || "Not provided"}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-700 font-medium">Location</span>
                </div>
                <p className="text-slate-900">{location || "Not provided"}</p>
              </div>
            </div>
          </Card>

          {/* Educational Details */}
          <Card className="p-6 md:p-8 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Educational Details
            </h3>
            {education.length > 0 ? (
              <div className="space-y-4">
                {education.map((edu: any, index: number) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{edu.institution || "Institution"}</h4>
                        <p className="text-slate-700 mt-1">
                          {edu.degree && <span>{edu.degree}</span>}
                          {edu.degree && edu.field && <span> - </span>}
                          {edu.field && <span>{edu.field}</span>}
                        </p>
                        {(edu.start_date || edu.end_date) && (
                          <p className="text-sm text-slate-600 mt-1">
                            {edu.start_date} {edu.start_date && edu.end_date && " - "} {edu.end_date}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No educational details added yet.</p>
            )}
          </Card>

          {/* Work Experience */}
          <Card className="p-6 md:p-8 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Work Experience
            </h3>
            {work_experience.length > 0 ? (
              <div className="space-y-4">
                {work_experience.map((exp: any, index: number) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{exp.title || "Job Title"}</h4>
                        <p className="text-slate-700 mt-1">{exp.company || "Company"}</p>
                        {(exp.start_date || exp.end_date || exp.location) && (
                          <p className="text-sm text-slate-600 mt-1">
                            {exp.start_date} {exp.start_date && exp.end_date && " - "} {exp.end_date}
                            {exp.location && <span className="ml-2">• {exp.location}</span>}
                          </p>
                        )}
                        {exp.description && (
                          <p className="text-slate-700 mt-2 whitespace-pre-wrap">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No work experience added yet.</p>
            )}
          </Card>

          {/* Projects */}
          <Card className="p-6 md:p-8 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <FolderKanban className="w-5 h-5" />
              Projects
            </h3>
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project: any, index: number) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{project.title || "Project Title"}</h4>
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-800 hover:underline"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        {(project.start_date || project.end_date) && (
                          <p className="text-sm text-slate-600 mb-2">
                            {project.start_date} {project.start_date && project.end_date && " - "} {project.end_date}
                          </p>
                        )}
                        {project.technologies && (
                          <p className="text-sm text-slate-600 mb-2">Technologies: {project.technologies}</p>
                        )}
                        {project.description && (
                          <p className="text-slate-700 mt-2 whitespace-pre-wrap">{project.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No projects added yet.</p>
            )}
          </Card>

          {/* Technical Skills */}
          <Card className="p-6 md:p-8 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Technical Skills
            </h3>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, i: number) => (
                  <div key={i} className="px-3 py-2 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
                    {skill}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No technical skills added yet.</p>
            )}
          </Card>

          {/* Social Profiles */}
          <Card className="p-6 md:p-8 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Social Profiles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-slate-700 font-medium block mb-2">LinkedIn</span>
                {linkedin ? (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-800 hover:underline"
                  >
                    {linkedin}
                  </a>
                ) : (
                  <p className="text-slate-500">Not provided</p>
                )}
              </div>
              <div>
                <span className="text-slate-700 font-medium block mb-2">GitHub</span>
                {github ? (
                  <a
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-800 hover:underline"
                  >
                    {github}
                  </a>
                ) : (
                  <p className="text-slate-500">Not provided</p>
                )}
              </div>
            </div>
          </Card>

          {/* About You / Bio */}
          <Card className="p-6 md:p-8 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">About You</h3>
            {bio && bio.trim() !== "" ? (
              <p className="text-slate-900 whitespace-pre-wrap">{bio}</p>
            ) : (
              <p className="text-slate-500 text-center py-4">No bio added yet.</p>
            )}
          </Card>

          {/* CV/Resume */}
          <Card className="p-6 md:p-8 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">CV/Resume</h3>
            {cvFilename && cvFilename.trim() !== "" ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-800" />
                  <div>
                    <p className="font-medium text-slate-900">{cvOriginalName || cvFilename}</p>
                    <p className="text-sm text-slate-600">CV uploaded</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
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
                      a.download = cvOriginalName || cvFilename || "cv.pdf"
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                    } catch (error) {
                      console.error("Failed to download CV:", error)
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No CV/Resume uploaded yet.</p>
            )}
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}
