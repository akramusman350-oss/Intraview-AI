"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, Home, User, Video, FileText, BarChart3, Settings, LogOut, Lightbulb } from "lucide-react"
import { handleLogout } from "@/lib/auth"
import { api } from "@/lib/api"

interface SidebarLayoutProps {
  userName: string
  currentPage?: string
  onNavigate?: (page: string) => void
  onLogout?: () => void
  children: React.ReactNode
}

export function SidebarLayout({ userName, currentPage = "", onNavigate = () => {}, onLogout = () => {}, children }: SidebarLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)

  // Fetch profile photo
  useEffect(() => {
    // Check if we have a token before making API calls
    const token = localStorage.getItem("authToken")
    if (!token) {
      return // Don't fetch if no token
    }

    let currentPhotoUrl: string | null = null
    
    const fetchProfilePhoto = async () => {
      try {
        const data = await api.get("/users/me")
        if (data?.profile_info?.photo_filename) {
          const photoUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/users/me/photo`
          const currentToken = localStorage.getItem("authToken")
          if (!currentToken) return // Token might have been cleared
          
          try {
            const response = await fetch(photoUrl, {
              headers: {
                "Authorization": `Bearer ${currentToken}`,
              },
            })
            if (response.ok) {
              const blob = await response.blob()
              const url = URL.createObjectURL(blob)
              currentPhotoUrl = url
              setProfilePhoto(url)
            }
          } catch (error) {
            console.error("Failed to load photo:", error)
            setProfilePhoto(null)
          }
        } else {
          setProfilePhoto(null)
        }
      } catch (error: any) {
        // If 401/403, don't log error - redirect will happen
        if (error?.status !== 401 && error?.status !== 403) {
          console.error("Failed to fetch profile:", error)
        }
        setProfilePhoto(null)
      }
    }
    fetchProfilePhoto()
    
    // Cleanup on unmount or when pathname changes
    return () => {
      if (currentPhotoUrl) {
        URL.revokeObjectURL(currentPhotoUrl)
      }
    }
  }, [pathname]) // Refetch when route changes

  const navItems = [
    { id: "candidate-dashboard", label: "Dashboard", icon: Home, href: "/candidate/dashboard" },
    { id: "candidate-profile", label: "Profile", icon: User, href: "/candidate/profile" },
    { id: "candidate-interviews", label: "Interviews", icon: Video, href: "/candidate/interviews" },
    { id: "candidate-reports", label: "Reports", icon: FileText, href: "/candidate/reports" },
    { id: "candidate-progress", label: "Progress", icon: BarChart3, href: "/candidate/progress" },
    { id: "candidate-recommendations", label: "Recommendations", icon: Lightbulb, href: "/candidate/recommendations" },
    { id: "candidate-settings", label: "Settings", icon: Settings, href: "/candidate/settings" },
  ]

  const handleNavigation = (item: typeof navItems[0]) => {
    onNavigate(item.id)
    router.push(item.href)
    setSidebarOpen(false)
  }

  // Determine active page based on current pathname
  const getActivePageId = () => {
    if (pathname === "/candidate/dashboard") return "candidate-dashboard"
    if (pathname === "/candidate/profile") return "candidate-profile"
    if (pathname === "/candidate/interviews") return "candidate-interviews"
    if (pathname === "/candidate/reports") return "candidate-reports"
    if (pathname === "/candidate/progress") return "candidate-progress"
    if (pathname === "/candidate/recommendations") return "candidate-recommendations"
    if (pathname === "/candidate/settings") return "candidate-settings"
    return currentPage
  }

  const activePageId = getActivePageId()

  return (
    <div className="h-screen bg-slate-50 flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 hover:bg-slate-100 rounded-lg transition"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r border-slate-200 p-6 flex flex-col z-30 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Image src="/logo-01.png" alt="IntraView AI" width={32} height={32} className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg text-slate-900">IntraView AI</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {navItems.slice(0, 6).map((item) => {
            const Icon = item.icon
            const isActive = activePageId === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-2 border-t border-slate-200 pt-4">
          {/* Settings */}
          <button
            onClick={() => handleNavigation(navItems.find((item) => item.id === "candidate-settings")!)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activePageId === "candidate-settings"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              // Call logout handler first
              onLogout()
              
              // Use centralized logout function (clears auth and redirects)
              // window.location.replace() prevents going back to previous page
              handleLogout("/login")
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full flex flex-col h-full">
        {/* Topbar - Only show welcome message on dashboard */}
        {currentPage === "candidate-dashboard" ? (
          <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between z-10">
            <h1 className="text-lg md:text-2xl font-bold text-slate-900">Welcome {userName}</h1>
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-end z-10">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </div>
    </div>
  )
}
