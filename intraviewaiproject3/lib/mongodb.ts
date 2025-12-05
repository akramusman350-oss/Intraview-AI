import mongoose from 'mongoose'

// Force local MongoDB for OTP storage (temporary data)
// Use the same database name as FastAPI backend
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intraview_ai'

// Ensure we're using local MongoDB, not Atlas
const finalUri = MONGODB_URI.includes('mongodb.net') 
  ? 'mongodb://localhost:27017/intraview_ai' 
  : MONGODB_URI

interface CachedConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

let cached: CachedConnection = (global as any).mongoose || { conn: null, promise: null }

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(finalUri, {
        bufferCommands: false,
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000, // Reduced timeout for faster failure
        socketTimeoutMS: 45000,
        retryWrites: false, // Disable retry writes for local MongoDB
        w: 1, // Write concern for local MongoDB
      })
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully')
        return mongoose
      })
      .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message)
        throw err
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

// Extend global type for cached mongoose
declare global {
  var mongoose: CachedConnection
}
