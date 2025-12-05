import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
        }

        // Connect to MongoDB
        await connectDB()

        // Find user by email (include password field)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
        }

        // Return user data without password
        const userResponse = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
        }

        return NextResponse.json(
            {
                message: 'Login successful',
                user: userResponse,
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
    }
}
