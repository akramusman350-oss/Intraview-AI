import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { OTP } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    // Connect to MongoDB
    await connectDB()

    // Find OTP record
    const otpRecord = await OTP.findOne({ email: email.toLowerCase() })

    if (!otpRecord) {
      return NextResponse.json({ error: 'OTP not found. Please request a new OTP.' }, { status: 400 })
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id })
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    // Verify OTP
    if (otpRecord.code !== otp) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    // Delete OTP after successful verification
    await OTP.deleteOne({ _id: otpRecord._id })

    return NextResponse.json(
      { message: 'OTP verified successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}
