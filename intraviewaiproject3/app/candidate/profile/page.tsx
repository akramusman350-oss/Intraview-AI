"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { CandidateProfile } from "@/components/pages/CandidateProfile"
import { handleLogout } from "@/lib/auth"
import { useUserName } from "@/hooks/useUserName"

export default function CandidateProfilePage() {
  const router = useRouter()
  const pathname = usePathname()
  const userName = useUserName()
  const [refreshKey, setRefreshKey] = useState(0)

  // Refresh when navigating back to this page
  useEffect(() => {
    const handleRouteChange = () => {
      if (pathname === "/candidate/profile") {
        setRefreshKey(prev => prev + 1)
      }
    }
    handleRouteChange()
  }, [pathname])

  const handleNavigate = (page: string) => {
    const routes: { [key: string]: string } = {
      "candidate-dashboard": "/candidate/dashboard",
      "candidate-profile": "/candidate/profile",
      "candidate-interviews": "/candidate/interviews",
      "candidate-reports": "/candidate/reports",
      "candidate-progress": "/candidate/progress",
      "candidate-recommendations": "/candidate/recommendations",
      "candidate-settings": "/candidate/settings",
      "candidate-profile-edit": "/candidate/profile/edit",
    }
    if (page === "candidate-profile") {
      // Force refresh when navigating back to profile
      setRefreshKey(prev => prev + 1)
    }
    router.push(routes[page] || "/candidate/dashboard")
  }

  const handleLogoutClick = () => {
    handleLogout("/login")
  }

  return <CandidateProfile key={refreshKey} userName={userName} onNavigate={handleNavigate} onLogout={handleLogoutClick} />
}
