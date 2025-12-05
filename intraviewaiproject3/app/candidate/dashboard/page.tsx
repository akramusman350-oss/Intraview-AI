"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { CandidateDashboard } from "@/components/pages/CandidateDashboard"
import { handleLogout } from "@/lib/auth"
import { useUserName } from "@/hooks/useUserName"
import { api } from "@/lib/api"

export default function CandidateDashboardPage() {
  const router = useRouter()
  const userName = useUserName()
  const [fullName, setFullName] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if we have a token before making API calls
    const token = localStorage.getItem("authToken")
    if (!token) {
      setLoading(false)
      return // Don't fetch if no token
    }

    // Fetch full name from database
    const fetchFullName = async () => {
      setLoading(true)
      try {
        const userProfile = await api.get("/users/me")
        console.log("[DASHBOARD] User profile from API:", userProfile)
        
        // Extract name from profile_info.name (stored during signup)
        let name = ""
        if (userProfile?.profile_info?.name) {
          name = userProfile.profile_info.name
        } else if (userProfile?.name) {
          name = userProfile.name
        }
        
        // If name is still empty, try to get from localStorage as fallback
        if (!name || name.trim() === "") {
          const storedName = localStorage.getItem("userName")
          if (storedName && storedName.trim() !== "" && storedName !== "Candidate") {
            name = storedName
          } else {
            name = userName || "Candidate"
          }
        }
        
        // Get first name only (before space) for "Welcome Usman" format
        const firstName = name.split(" ")[0].trim()
        if (firstName && firstName !== "" && firstName !== "Candidate") {
          console.log("[DASHBOARD] Setting name to:", firstName)
          setFullName(firstName)
        } else {
          console.log("[DASHBOARD] Empty or invalid name, using fallback")
          // Try to get from localStorage one more time
          const storedName = localStorage.getItem("userName")
          if (storedName && storedName.trim() !== "" && storedName !== "Candidate") {
            const fallbackFirstName = storedName.split(" ")[0].trim()
            setFullName(fallbackFirstName || "Candidate")
          } else {
            setFullName("Candidate")
          }
        }
      } catch (error) {
        console.error("[DASHBOARD] Failed to fetch user profile:", error)
        // Fallback: get first name from localStorage
        const storedName = localStorage.getItem("userName")
        if (storedName && storedName.trim() !== "" && storedName !== "Candidate") {
          const firstName = storedName.split(" ")[0].trim()
          setFullName(firstName || "Candidate")
        } else {
          setFullName(userName || "Candidate")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchFullName()
  }, [userName])

  const handleNavigate = (page: string) => {
    const routes: { [key: string]: string } = {
      "candidate-dashboard": "/candidate/dashboard",
      "candidate-profile": "/candidate/profile",
      "candidate-interviews": "/candidate/interviews",
      "candidate-reports": "/candidate/reports",
      "candidate-progress": "/candidate/progress",
      "candidate-settings": "/candidate/settings",
    }
    router.push(routes[page] || "/candidate/dashboard")
  }

  const handleLogoutClick = () => {
    handleLogout("/login")
  }

  // Use the fetched full name (first name only), or fallback to userName
  const displayName = fullName || userName || "Candidate"
  
  return (
    <CandidateDashboard
      userName={displayName}
      onNavigate={handleNavigate}
      onLogout={handleLogoutClick}
    />
  )
}
