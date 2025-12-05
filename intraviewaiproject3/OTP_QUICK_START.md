# OTP Email Verification - Quick Start

## ✅ What's Implemented

Your candidate signup now uses a **3-step OTP-based email verification system**:

### Step 1️⃣: Enter Details
- User provides email and full name
- System generates 6-digit OTP
- OTP is sent via email (intraviewwai@gmail.com)
- User sees 5-minute countdown timer

### Step 2️⃣: Verify OTP  
- User enters OTP from email
- System validates code and expiry
- OTP is deleted after verification

### Step 3️⃣: Create Password
- User creates strong password (8+ chars, uppercase, lowercase, number, special char)
- Password is hashed with bcryptjs
- User account is created in MongoDB
- User is logged in and redirected to dashboard

## 📦 What Was Installed

```
✅ nodemailer@7.0.11      - Email delivery via Gmail
✅ bcryptjs@3.0.3         - Password hashing
✅ mongoose@9.0.0         - MongoDB ORM
✅ mongodb@7.0.0          - MongoDB driver
✅ @types/nodemailer      - TypeScript support
```

## 📁 Files Created/Modified

### Backend (New)
- `lib/emailService.ts` - OTP generation, email sending, verification
- `lib/models.ts` - MongoDB User & OTP schemas
- `lib/mongodb.ts` - Database connection management
- `app/api/auth/send-otp/route.ts` - OTP API endpoint
- `app/api/auth/verify-otp/route.ts` - Verification API endpoint
- `app/api/auth/register/route.ts` - Account creation endpoint
- `.env.local` - Environment configuration

### Frontend (Modified)
- `components/pages/SignupPage.tsx` - New 3-step signup form

## 🚀 How to Test

### 1. Start MongoDB
```powershell
mongod
```

### 2. Start Dev Server
```powershell
cd c:\Users\Abdul Rehman\Desktop\intraviewaiproject3
pnpm dev
```

### 3. Test Signup Flow
1. Go to http://localhost:3000/login
2. Click "Don't have an account? Sign up here"
3. Enter email and name → Click "Send OTP to Email"
4. Check email for 6-digit OTP
5. Enter OTP → Click "Verify OTP"
6. Enter password (8+ chars, uppercase, number, special char)
7. Confirm password → Click "Create Account"
8. ✅ You're logged in!

## 🔐 Security Features

- ✅ **OTP Valid 5 Minutes Only** - Auto-deletes after expiry
- ✅ **One-Time Use** - OTP deleted after verification
- ✅ **Strong Password Hashing** - bcryptjs with 10 salt rounds
- ✅ **Email Uniqueness** - Prevents duplicate registrations
- ✅ **Password Requirements** - 8+ chars with uppercase, lowercase, number, special char

## 📧 Email Configuration

**File:** `.env.local`
```env
MONGODB_URI=mongodb://localhost:27017/intraview-ai
NODEMAILER_EMAIL=intraviewwai@gmail.com
NODEMAILER_PASSWORD=brdv mund etjf qzqp
```

## 🛠️ API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/send-otp` | Generate & send OTP |
| POST | `/api/auth/verify-otp` | Validate OTP code |
| POST | `/api/auth/register` | Create user account |

## 📊 Database Collections

**users** - User accounts
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  password: "$2a$10$...", // bcryptjs hash
  name: "John Doe",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**otps** - Temporary OTP records (auto-deletes after 5 min)
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  code: "457829",
  expiresAt: ISODate,
  createdAt: ISODate
}
```

## ⚡ Next Steps

1. **Test the OTP flow** - Follow "How to Test" section above
2. **Check emails** - Verify OTP arrives correctly
3. **Monitor MongoDB** - Use MongoDB Compass to verify data
4. **Check logs** - Watch server console for any errors

## 🐛 Troubleshooting

**Email not arriving?**
- Check spam folder
- Verify `.env.local` has correct Gmail credentials
- Check server console for errors

**OTP expired?**
- OTP valid for exactly 5 minutes
- Click "Back" and request new OTP
- System will auto-delete expired OTPs from database

**MongoDB connection failed?**
- Ensure MongoDB is running: `mongod`
- Check `.env.local` has correct MONGODB_URI
- Default: `mongodb://localhost:27017/intraview-ai`

**Password validation issues?**
- Must be 8+ characters
- Must have 1 uppercase letter (A-Z)
- Must have 1 lowercase letter (a-z)
- Must have 1 number (0-9)
- Must have 1 special character (!@#$%^&*)

## 📚 Full Documentation

See `OTP_IMPLEMENTATION_GUIDE.md` for complete documentation including:
- Detailed architecture
- API specifications
- Database schemas
- Comprehensive testing guide
- Security considerations
- Troubleshooting tips

## ✨ Features Implemented

- [x] 6-digit OTP generation
- [x] Email sending via Gmail
- [x] 5-minute OTP expiry
- [x] One-time use OTP
- [x] OTP verification
- [x] Strong password validation
- [x] Password hashing with bcryptjs
- [x] User account creation
- [x] MongoDB integration
- [x] Multi-step signup form
- [x] Real-time password strength indicator
- [x] OTP countdown timer
- [x] Error handling & user feedback

---

**Status:** ✅ Ready for Testing
**Version:** 1.0.0
**Last Updated:** 2024
