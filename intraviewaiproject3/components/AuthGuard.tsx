"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getAuthToken, clearAuthToken } from "@/lib/auth"
import { API_URL } from "@/lib/api"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isValidating, setIsValidating] = useState(true)

  useEffect(() => {
    const validateSession = async () => {
      if (typeof window === "undefined") {
        setIsValidating(false)
        return
      }

      const authToken = getAuthToken()
      
      // List of public routes (no validation needed)
      const publicRoutes = ["/", "/login", "/signup", "/admin/login"]
      const isPublicRoute = publicRoutes.some((route) => pathname === route)
      
      // List of protected routes
      const protectedRoutes = [
        "/candidate/dashboard",
        "/candidate/profile",
        "/candidate/interviews",
        "/candidate/reports",
        "/candidate/progress",
        "/candidate/recommendations",
        "/candidate/settings",
        "/admin/dashboard",
        "/admin/questions",
        "/admin/testcases",
        "/admin/candidates",
        "/admin/sessions",
        "/admin/rubrics",
        "/admin/analytics",
        "/admin/settings",
      ]

      const isProtectedRoute = protectedRoutes.some((route) => pathname?.startsWith(route))
      
      // If accessing protected route without auth token, redirect to login immediately (before any rendering)
      if (isProtectedRoute && !authToken) {
        clearAuthToken()
        const redirectPath = pathname?.startsWith("/admin") ? "/admin/login" : "/login"
        // Use replace immediately to prevent any page rendering
        window.location.replace(redirectPath)
        return
      }
      
      // If on public route, no validation needed
      if (isPublicRoute) {
        setIsValidating(false)
        
        // Prevent back navigation after logout on login pages
        if (!authToken && (pathname === "/login" || pathname === "/admin/login")) {
          // Push a new state to prevent back navigation
          window.history.pushState(null, '', window.location.pathname)
          
          const handlePopState = (event: PopStateEvent) => {
            const currentAuthToken = getAuthToken()
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
        
        return
      }

      // If on protected route with token, validate it
      if (isProtectedRoute && authToken) {
        try {
          // Validate token by making a simple API call
          const userRole = localStorage.getItem("userRole")
          const validateEndpoint = userRole === "admin" ? "/admin/profile" : "/users/me"
          
          const response = await fetch(`${API_URL}${validateEndpoint}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) {
            // Token is invalid or expired
            if (response.status === 401 || response.status === 403) {
              clearAuthToken()
              setIsValidating(false)
              window.location.replace(pathname?.startsWith("/admin") ? "/admin/login" : "/login")
              return
            }
          }

          // Check if user is banned (for candidates)
          if (pathname?.startsWith("/candidate")) {
            const userData = await response.json().catch(() => null)
            if (userData?.status === "banned") {
              clearAuthToken()
              setIsValidating(false)
              window.location.replace("/login?banned=true")
              return
            }
          }
          
          // Validation successful
          setIsValidating(false)
        } catch (error) {
          // Network error or invalid response - clear auth and redirect
          console.error("Session validation error:", error)
          clearAuthToken()
          setIsValidating(false)
          window.location.replace(pathname?.startsWith("/admin") ? "/admin/login" : "/login")
          return
        }
      } else {
        // Not a protected route and not public - allow access
        setIsValidating(false)
      }
    }

    validateSession()
  }, [pathname, router])

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}
