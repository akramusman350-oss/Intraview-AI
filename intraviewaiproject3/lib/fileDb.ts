import fs from 'fs'
import path from 'path'

const dbDir = path.join(process.cwd(), '.data')
const usersFile = path.join(dbDir, 'users.json')
const otpsFile = path.join(dbDir, 'otps.json')

// Ensure directory exists
export function ensureDbDir() {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
}

// User operations
export interface User {
  id: string
  email: string
  password: string
  name: string
  createdAt: string
}

export function getUsers(): User[] {
  ensureDbDir()
  if (!fs.existsSync(usersFile)) {
    return []
  }
  try {
    const data = fs.readFileSync(usersFile, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function findUserByEmail(email: string): User | null {
  const users = getUsers()
  return users.find((u) => u.email === email.toLowerCase()) || null
}

export function saveUser(user: Omit<User, 'id'>): User {
  const users = getUsers()
  const newUser: User = {
    ...user,
    id: Date.now().toString(),
  }
  users.push(newUser)
  ensureDbDir()
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
  return newUser
}

// OTP operations
export interface OTPRecord {
  id: string
  email: string
  code: string
  expiresAt: number
  createdAt: string
}

export function getOTPs(): OTPRecord[] {
  ensureDbDir()
  if (!fs.existsSync(otpsFile)) {
    return []
  }
  try {
    const data = fs.readFileSync(otpsFile, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function findOTPByEmail(email: string): OTPRecord | null {
  const otps = getOTPs()
  return otps.find((o) => o.email === email.toLowerCase()) || null
}

export function saveOTP(email: string, code: string, expiresAt: number): OTPRecord {
  const otps = getOTPs()
  // Remove any existing OTP for this email
  const filtered = otps.filter((o) => o.email !== email.toLowerCase())
  
  const newOTP: OTPRecord = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    code,
    expiresAt,
    createdAt: new Date().toISOString(),
  }
  filtered.push(newOTP)
  ensureDbDir()
  fs.writeFileSync(otpsFile, JSON.stringify(filtered, null, 2))
  return newOTP
}

export function deleteOTP(id: string): void {
  const otps = getOTPs()
  const filtered = otps.filter((o) => o.id !== id)
  ensureDbDir()
  fs.writeFileSync(otpsFile, JSON.stringify(filtered, null, 2))
}

export function deleteOTPByEmail(email: string): void {
  const otps = getOTPs()
  const filtered = otps.filter((o) => o.email !== email.toLowerCase())
  ensureDbDir()
  fs.writeFileSync(otpsFile, JSON.stringify(filtered, null, 2))
}

export function cleanExpiredOTPs(): void {
  const otps = getOTPs()
  const now = Date.now()
  const filtered = otps.filter((o) => o.expiresAt > now)
  ensureDbDir()
  fs.writeFileSync(otpsFile, JSON.stringify(filtered, null, 2))
}
