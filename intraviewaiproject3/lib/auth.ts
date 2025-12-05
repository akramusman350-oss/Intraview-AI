export function setAuthToken(token: string, role: string, email?: string, name?: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token)
    localStorage.setItem("userRole", role)
    if (email) {
      localStorage.setItem("userEmail", email)
    }
    if (name) {
      localStorage.setItem("userName", name)
    }
  }
}

export function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken")
  }
  return null
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userId")
    sessionStorage.clear()
  }
}

/**
 * Handles logout by clearing all auth data and redirecting to login page
 * Uses window.location.replace() to completely prevent going back to previous page
 */
export function handleLogout(redirectPath: string = "/login") {
  // Clear all auth data first
  clearAuthToken()

  if (typeof window !== "undefined") {
    // Use window.location.replace() which completely replaces the history entry
    // This prevents users from going back to the previous page using browser back button
    // The replace() method removes the current page from the session history
    window.location.replace(redirectPath)
  }
}