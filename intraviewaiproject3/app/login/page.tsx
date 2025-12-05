"use client"

import { useState, useEffect } from "react"
import { CandidateLogin } from "@/components/pages/CandidateLogin"
import { SignupPage } from "@/components/pages/SignupPage"
import { useRouter } from "next/navigation"

type Page = "login" | "signup"

export default function LoginPageWrapper() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState<Page>("login")
  const [bannedMessage, setBannedMessage] = useState("")

  // Check for banned status and prevent back navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if user was redirected due to ban
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('banned') === 'true') {
        setBannedMessage("Your account has been banned. Please contact the administrator.")
        // Clean URL
        window.history.replaceState({}, '', '/login')
      }
    }
    
    // Check if user is logged out (no auth token)
    const authToken = localStorage.getItem("authToken")
    if (!authToken && typeof window !== 'undefined') {
      // Push a new state to prevent back navigation
      window.history.pushState(null, '', window.location.pathname)
      
      const handlePopState = (event: PopStateEvent) => {
        // If user tries to go back, prevent it and redirect to login
        const currentAuthToken = localStorage.getItem("authToken")
        if (!currentAuthToken) {
          // Push state again to prevent navigation
          window.history.pushState(null, '', window.location.pathname)
          // Use replace to ensure we stay on login page
          window.location.replace(window.location.pathname)
        }
      }

      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [])

  const handleLogin = () => {
    // onLogin is called from CandidateLogin component after successful auth
    // which already sets all the localStorage values
    router.replace("/candidate/dashboard")
  }

  const handleSignup = (name: string) => {
    // User data is already stored in localStorage by SignupPage component
    router.replace("/candidate/dashboard")
  }

  const handleBack = () => {
    router.push("/")
  }

  const handleNavigateToSignup = () => {
    setCurrentPage("signup")
    router.push("/signup")
  }

  if (currentPage === "signup") {
    return <SignupPage onSignup={handleSignup} onBack={handleBack} />
  }

  return (
    <>
      {bannedMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          {bannedMessage}
        </div>
      )}
      <CandidateLogin
        onLogin={handleLogin}
        onBack={handleBack}
        onSignup={handleNavigateToSignup}
      />
    </>
  )
}
