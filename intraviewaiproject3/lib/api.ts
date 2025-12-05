const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

type RequestOptions = RequestInit & {
  parseJson?: boolean
}

function getAuthToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

async function request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  // Check if we're on a protected route without a token
  if (typeof window !== "undefined") {
    const token = getAuthToken()
    const currentPath = window.location.pathname
    const protectedRoutes = ["/candidate", "/admin"]
    const isProtectedRoute = protectedRoutes.some((route) => currentPath.startsWith(route))
    const publicEndpoints = ["/auth/login", "/auth/signup", "/auth/send-otp", "/auth/verify-otp", "/auth/check-email"]
    const isPublicEndpoint = publicEndpoints.some((ep) => endpoint.startsWith(ep))
    
    // If on protected route without token and not a public endpoint, redirect immediately
    if (isProtectedRoute && !token && !isPublicEndpoint) {
      // Clear any stale data
      localStorage.removeItem("authToken")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userName")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userId")
      sessionStorage.clear()
      
      const redirectPath = currentPath.startsWith("/admin") ? "/admin/login" : "/login"
      window.location.replace(redirectPath)
      // Return a rejected promise to prevent further execution
      return Promise.reject(new Error("Unauthorized - redirecting to login"))
    }
  }

  const url = `${API_URL}${endpoint}`
  const headers = new Headers(options.headers || {})

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const token = getAuthToken()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  let data: any = null
  const shouldParse = options.parseJson ?? true

  if (shouldParse && response.status !== 204) {
    try {
      const text = await response.text()
      if (text) {
        data = JSON.parse(text)
      }
    } catch (err) {
      console.error("Failed to parse response", err)
      // If JSON parsing fails, try to get the text as error message
      try {
        const text = await response.text()
        if (text) {
          data = { detail: text }
        }
      } catch (e) {
        // Ignore
      }
    }
  }

  if (!response.ok) {
    // Handle unauthorized/forbidden - clear auth and redirect to login
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== "undefined") {
        // Clear auth data
        localStorage.removeItem("authToken")
        localStorage.removeItem("userRole")
        localStorage.removeItem("userName")
        localStorage.removeItem("userEmail")
        localStorage.removeItem("userId")
        sessionStorage.clear()
        
        // Determine redirect path based on current route
        const currentPath = window.location.pathname
        const redirectPath = currentPath.startsWith("/admin") ? "/admin/login" : "/login"
        
        // Only redirect if we're on a protected route
        const protectedRoutes = [
          "/candidate",
          "/admin",
        ]
        const isProtectedRoute = protectedRoutes.some((route) => currentPath.startsWith(route))
        
        if (isProtectedRoute) {
          window.location.replace(redirectPath)
        }
      }
    }
    
    const message = data?.detail || data?.error || data?.message || response.statusText
    const error = new Error(message || "Request failed")
    // Attach status code and full response for debugging
    ;(error as any).status = response.status
    ;(error as any).response = data || {}
    console.error(`[API] Request failed: ${endpoint}`, { status: response.status, data, message })
    throw error
  }

  return data as T
}

export const api = {
  get: <T = unknown>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T = unknown>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      parseJson: !(body instanceof FormData),
    }),
  put: <T = unknown>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  patch: <T = unknown>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: <T = unknown>(endpoint: string) =>
    request<T>(endpoint, {
      method: "DELETE",
    }),
}

export { API_URL }


