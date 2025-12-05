import nodemailer from 'nodemailer'

// Initialize Nodemailer with Gmail using compatible settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL || 'intraviewwai@gmail.com',
    pass: (process.env.NODEMAILER_PASSWORD || '').replace(/\s/g, ''),
  },
})

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Get OTP expiry time (5 minutes from now in milliseconds)
 */
export function getOTPExpiryTime(): number {
  return Date.now() + 5 * 60 * 1000 // 5 minutes
}

/**
 * Send OTP email to user
 */
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL || 'intraviewwai@gmail.com',
      to: email,
      subject: 'IntraView AI - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; text-align: center;">IntraView AI</h2>
          <div style="background-color: #f0f9ff; border: 1px solid #e0f2fe; border-radius: 8px; padding: 30px; text-align: center;">
            <h3 style="color: #1e293b; margin-top: 0;">Email Verification</h3>
            <p style="color: #64748b; font-size: 16px;">Your One-Time Password (OTP) is:</p>
            <div style="background-color: #white; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              This OTP is valid for <strong>5 minutes</strong> only.
            </p>
            <p style="color: #64748b; font-size: 14px;">
              If you didn't request this OTP, please ignore this email.
            </p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
            IntraView AI - AI-Powered Interview Simulator
          </p>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('OTP email sent successfully:', result.messageId)
    return true
  } catch (error) {
    console.error('Error sending OTP email:', error)
    return false
  }
}

/**
 * Verify OTP by comparing with stored OTP and checking expiry
 */
export function verifyOTP(storedOTP: string, providedOTP: string, expiryTime: number): boolean {
  // Check if OTP is expired
  if (Date.now() > expiryTime) {
    return false
  }

  // Check if OTP matches
  return storedOTP === providedOTP
}
