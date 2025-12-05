import { NextRequest, NextResponse } from 'next/server'
import { generateOTP, getOTPExpiryTime, sendOTPEmail } from '@/lib/emailService'
import { connectDB } from '@/lib/mongodb'
import { OTP } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    console.log('Send OTP request received')

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if email already exists in database before sending OTP
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const emailToCheck = email.toLowerCase().trim()
    console.log(`[SEND-OTP] Checking if email exists: ${emailToCheck}`)
    
    try {
      const checkResponse = await fetch(`${API_URL}/auth/check-email?email=${encodeURIComponent(emailToCheck)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log(`[SEND-OTP] Check response status: ${checkResponse.status}`)
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json()
        console.log(`[SEND-OTP] Check response data:`, checkData)
        
        if (checkData.exists === true) {
          console.log(`[SEND-OTP] Email already exists, blocking OTP send`)
          return NextResponse.json(
            { error: 'This email is already registered. Please use a different email or sign in instead.' },
            { status: 400 }
          )
        }
      } else {
        const errorText = await checkResponse.text()
        console.error(`[SEND-OTP] Check email endpoint returned error: ${checkResponse.status} - ${errorText}`)
        // If check fails, we should still block to be safe
        return NextResponse.json(
          { error: 'Unable to verify email. Please try again later.' },
          { status: 500 }
        )
      }
    } catch (checkError) {
      console.error('[SEND-OTP] Error checking email existence:', checkError)
      // If check fails, block OTP sending to be safe
      return NextResponse.json(
        { error: 'Unable to verify email. Please try again later.' },
        { status: 500 }
      )
    }
    
    console.log(`[SEND-OTP] Email check passed, proceeding with OTP generation`)

    // Connect to MongoDB for OTP storage
    await connectDB()

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: email.toLowerCase() })

    // Generate OTP
    const otp = generateOTP()
    const expiryTime = getOTPExpiryTime()

    console.log(`Generated OTP for ${email}: ${otp}`)

    // Save OTP to MongoDB
    await OTP.create({
      email: email.toLowerCase(),
      code: otp,
      expiresAt: new Date(expiryTime),
    })
    console.log('OTP saved to MongoDB')

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp)

    if (!emailSent) {
      console.error('Failed to send OTP email')
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please check your email configuration.' },
        { status: 500 }
      )
    }

    console.log('OTP email sent successfully')

    return NextResponse.json(
      {
        message: 'OTP sent successfully',
        email: email.toLowerCase(),
        expiresIn: 300, // 5 minutes in seconds
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Send OTP error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to send OTP: ${errorMessage}` },
      { status: 500 }
    )
  }
}
