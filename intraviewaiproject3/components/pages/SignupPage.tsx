"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertCircle, CheckCircle, Loader, Eye, EyeOff } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { validatePassword } from "@/lib/passwordValidation"
import { API_URL } from "@/lib/api"

interface SignupPageProps {
  onSignup: (name: string) => void
  onBack: () => void
}

type SignupStep = "details" | "otp"

export function SignupPage({ onSignup, onBack }: SignupPageProps) {
  const [step, setStep] = useState<SignupStep>("details")
  const [fullName, setFullName] = useState("")
  const [fullNameError, setFullNameError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordMismatch, setPasswordMismatch] = useState("")
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)

  // Validate full name (only alphabets and spaces)
  const validateFullName = (name: string): boolean => {
    if (!name.trim()) {
      setFullNameError("Full name is required")
      return false
    }
    // Only alphabets and spaces allowed, no numbers or special characters
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      setFullNameError("Full name can only contain alphabets")
      return false
    }
    if (name.trim().length < 2) {
      setFullNameError("Full name must be at least 2 characters")
      return false
    }
    setFullNameError("")
    return true
  }

  // Step 1: Proceed to OTP with filled details
  const handleProceedToOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setFullNameError("")

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    // Validate full name
    if (!validateFullName(fullName)) {
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email")
      return
    }

    const validation = validatePassword(password)
    if (!validation.isValid) {
      setPasswordError(validation.errors[0])
      return
    }

    if (password !== confirmPassword) {
      setPasswordMismatch("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to send OTP")
        setLoading(false)
        return
      }

      setStep("otp")
      setOtpTimer(300) // 5 minutes in seconds

      // Start countdown timer
      const interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      setLoading(false)
    } catch (err) {
      setError("Network error. Please try again.")
      console.error(err)
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    setError("")

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to verify OTP")
        setLoading(false)
        return
      }

      // OTP verified, now create account via FastAPI
      console.log('[SIGNUP] Creating account for:', email)
      const registerResponse = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: fullName.trim() }),
      })

      const registerData = await registerResponse.json().catch((err) => {
        console.error('[SIGNUP] Failed to parse register response:', err)
        return {}
      })

      console.log('[SIGNUP] Register response status:', registerResponse.status)
      console.log('[SIGNUP] Register response data:', registerData)

      if (!registerResponse.ok) {
        const errorMsg = registerData.detail || registerData.error || "Failed to create account"
        console.error('[SIGNUP] Account creation failed:', errorMsg)
        setError(errorMsg)
        // If it's a password validation error, also set password error
        if (errorMsg.includes("Password") || errorMsg.includes("password")) {
          setPasswordError(errorMsg)
          setStep("details") // Go back to details step to show password error
        }
        setLoading(false)
        return
      }

      console.log('[SIGNUP] Account created successfully:', registerData)

      // Login to get JWT token
      console.log('[SIGNUP] Logging in user:', email)
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: email.toLowerCase().trim(), // Use lowercase email for login
          password: password,
        }),
      })

      const loginData = await loginResponse.json().catch((err) => {
        console.error('[SIGNUP] Failed to parse login response:', err)
        return {}
      })

      console.log('[SIGNUP] Login response status:', loginResponse.status)
      console.log('[SIGNUP] Login response data:', loginData)

      if (!loginResponse.ok) {
        const errorMsg = loginData.detail || "Account created but login failed. Please login manually."
        console.error('[SIGNUP] Login failed:', errorMsg)
        setError(errorMsg)
        setLoading(false)
        return
      }

      // Set auth token and user info
      localStorage.setItem("authToken", loginData.access_token)
      localStorage.setItem("userRole", "candidate")
      localStorage.setItem("userName", fullName.trim())
      localStorage.setItem("userEmail", email)
      localStorage.setItem("userId", registerData.id || registerData._id || "")

      // Call onSignup callback which will redirect to candidate dashboard
      onSignup(fullName.trim())
    } catch (err) {
      setError("Network error. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (value) {
      const validation = validatePassword(value)
      if (validation.isValid) {
        setPasswordError("")
      } else {
        // Show the first error message
        setPasswordError(validation.errors[0] || "Password does not meet requirements")
      }
    } else {
      setPasswordError("")
    }

    if (confirmPassword && value !== confirmPassword) {
      setPasswordMismatch("Passwords do not match")
    } else {
      setPasswordMismatch("")
    }
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    if (value && password !== value) {
      setPasswordMismatch("Passwords do not match")
    } else {
      setPasswordMismatch("")
    }
  }

  const isPasswordValid = password ? validatePassword(password).isValid : false

  return (
    <div className="h-screen bg-linear-to-br from-slate-50 to-slate-50 flex items-center justify-center p-4 overflow-hidden">
      <Card className="w-full max-w-md p-4 border-slate-200 max-h-[95vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Header */}
        <div className="flex items-center gap-4 mb-3">
          <button onClick={step === "details" ? onBack : () => setStep("details")} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <Image src="/logo-01.png" alt="IntraView AI" width={28} height={28} className="w-7 h-7 object-contain" />
            <span className="font-bold text-base text-slate-900">IntraView AI</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-3 flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {step === "details" ? (
          <>
            <h1 className="text-lg font-bold text-slate-900 mb-0.5 text-center">Create Account</h1>
            <p className="text-slate-600 mb-3 text-center text-xs">Step 1 of 2: Enter your details</p>

            <form onSubmit={handleProceedToOTP} className="space-y-2.5">
              {/* Full Name */}
              <div>
                <Label htmlFor="name" className="text-slate-700 font-medium mb-1 block text-sm">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Usman Akram"
                  value={fullName}
                  onChange={(e) => {
                    const value = e.target.value
                    setFullName(value)
                    if (value) {
                      validateFullName(value)
                    } else {
                      setFullNameError("")
                    }
                  }}
                  className={`w-full h-9 ${fullNameError ? "border-red-500" : ""}`}
                  required
                />
                {fullNameError && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fullNameError}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-slate-700 font-medium mb-1 block text-sm">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-slate-700 font-medium mb-1 block text-sm">
                  New Password
                </Label>
                <TooltipProvider>
                  <Tooltip open={passwordFocused && !password}>
                    <TooltipTrigger asChild>
                      <div className="relative w-full">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
                          className={`w-full pr-10 h-9 ${passwordError ? "border-red-500" : ""}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition z-10"
                        >
                          {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-slate-900 text-white text-xs px-3 py-2 max-w-xs">
                      <p>Password must be 8 characters with uppercase, lowercase, numbers, and special character.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {password && (
                  <div className="mt-1">
                    {isPasswordValid ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">Password is strong</span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          <span className="text-xs text-red-600 font-medium">{passwordError}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 ml-4 space-y-0.5">
                          {(() => {
                            const validation = validatePassword(password)
                            return validation.errors.slice(0, 3).map((err, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <span className="text-red-500">•</span>
                                <span>{err}</span>
                              </div>
                            ))
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword" className="text-slate-700 font-medium mb-1 block text-sm">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    className={`w-full pr-10 h-9 ${passwordMismatch ? "border-red-500" : ""}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition"
                  >
                    {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="mt-1 flex items-center gap-1.5">
                    {!passwordMismatch ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-red-600" />
                        <span className="text-xs text-red-600">{passwordMismatch}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Proceed to OTP Button */}
              <Button
                type="submit"
                className="w-full h-9 mt-3"
                disabled={loading || !fullName || !!fullNameError || !email || !isPasswordValid || !confirmPassword || !!passwordMismatch}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Proceed to OTP"
                )}
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-lg font-bold text-slate-900 mb-0.5 text-center">Verify OTP</h1>
            <p className="text-slate-600 mb-3 text-center text-xs">Step 2 of 2: Check your email for OTP code</p>

            <form className="space-y-2.5">
              {/* OTP Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="otp" className="text-slate-700 font-medium block text-sm">
                    OTP Code
                  </Label>
                  <span className="text-xs text-slate-600">
                    {otpTimer > 0 ? (
                      <span>
                        Expires in <span className="font-semibold text-blue-800">{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, "0")}</span>
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">OTP Expired</span>
                    )}
                  </span>
                </div>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full text-center text-xl tracking-widest h-9"
                  maxLength={6}
                  required
                />
              </div>

              {/* Verify OTP Button */}
              <Button
                type="button"
                onClick={handleVerifyOTP}
                className="w-full h-9"
                disabled={loading || otp.length !== 6 || otpTimer === 0}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Verifying OTP...
                  </>
                ) : (
                  "Verify OTP & Create Account"
                )}
              </Button>

              {/* Request New OTP Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-9"
                onClick={() => {
                  setStep("details")
                  setOtp("")
                  setOtpTimer(0)
                  setError("")
                }}
                disabled={loading}
              >
                Request New OTP
              </Button>
            </form>
          </>
        )}

        {/* Login Link */}
        <div className="mt-3 text-center">
          <p className="text-slate-600 text-xs">
            Already have an account?{" "}
            <button onClick={onBack} className="text-blue-800 hover:text-blue-900 font-medium">
              Sign in
            </button>
          </p>
        </div>
      </Card>
    </div>
  )
}
