import mongoose, { Schema, Document } from 'mongoose'

// User interface
export interface IUser extends Document {
  email: string
  password: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

// OTP interface
export interface IOTP extends Document {
  email: string
  code: string
  expiresAt: Date
  createdAt: Date
}

// User Schema
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// OTP Schema
const otpSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'OTP code is required'],
      length: 6,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry time is required'],
      index: { expireAfterSeconds: 0 }, // Auto-delete expired OTPs
    },
  },
  {
    timestamps: true,
  }
)

// Create or retrieve models
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)
const OTP = mongoose.models.OTP || mongoose.model<IOTP>('OTP', otpSchema)

export { User, OTP }
