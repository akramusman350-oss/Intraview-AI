# MongoDB Setup Guide

## Problem
MongoDB is required for the OTP and user account system but is not currently installed or running on your system.

## Solution Options

### Option 1: MongoDB Atlas (Recommended - Cloud-Based, No Installation)
This is the easiest solution as it requires no local installation.

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
2. **Create a Free Account**:
   - Sign up with your email
   - Create organization and project
   - Select "M0 Free" tier (completely free)

3. **Create Database Cluster**:
   - Click "Create a Deployment"
   - Choose "M0 Free" tier
   - Select your region (choose closest to your location)
   - Click "Create Deployment"
   - Wait 2-3 minutes for cluster to be ready

4. **Get Connection String**:
   - Click "Connect" button
   - Choose "Drivers" option
   - Select "Node.js" driver
   - Copy the connection string
   - Replace `<password>` with your database user password

5. **Update .env.local**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/intraview-ai?retryWrites=true&w=majority
   NODEMAILER_EMAIL=intraviewwai@gmail.com
   NODEMAILER_PASSWORD=brdv mund etjf qzqp
   ```

6. **Restart dev server**:
   ```powershell
   # Stop the dev server (Ctrl+C in terminal)
   # Run again
   pnpm dev
   ```

---

### Option 2: Docker (Local MongoDB Container)
If you have Docker installed, this is quick.

1. **Install Docker Desktop**: https://www.docker.com/products/docker-desktop

2. **Start MongoDB in Docker**:
   ```powershell
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

3. **Keep .env.local as is** (localhost connection will work)

4. **Restart dev server** and test OTP signup

---

### Option 3: Local MongoDB Installation (Windows)
Manual installation on Windows.

1. **Download MongoDB Community Edition**:
   - Visit: https://www.mongodb.com/try/download/community
   - Select Windows
   - Choose MSI version
   - Download and run installer

2. **During Installation**:
   - Select "Complete" installation
   - Check "Install MongoDB as a Service"
   - Keep all default paths

3. **MongoDB will start automatically** as a Windows service

4. **Test connection**:
   ```powershell
   mongosh
   ```
   If you see `test>` prompt, MongoDB is working

5. **Keep .env.local as is** (localhost connection will work)

6. **Restart dev server** and test OTP signup

---

## Quick Test After MongoDB Setup

1. Restart dev server:
   ```powershell
   cd c:\Users\Abdul Rehman\Desktop\intraviewaiproject3
   pnpm dev
   ```

2. Go to http://localhost:3000/login

3. Click "Don't have an account? Sign up here"

4. Enter:
   - Full Name: Test User
   - Email: test@example.com
   - Click "Send OTP to Email"

5. **Expected result**: OTP should be sent to your email within 5 seconds

6. Check your email inbox (including spam folder) for OTP code

7. Enter OTP code and create password to complete signup

---

## Troubleshooting

### Issue: Still getting "Failed to send OTP"
1. **Check MongoDB is running**:
   ```powershell
   # For Docker
   docker ps | grep mongodb
   
   # For local service
   Get-Service | grep mongo
   ```

2. **Check connection string in .env.local** is correct

3. **Restart dev server**: Stop (Ctrl+C) and run `pnpm dev` again

4. **Check server logs** for detailed error message

### Issue: Email not arriving
1. **Check spam/promotions folder**
2. **Verify email credentials** in `.env.local` are correct
3. **Gmail 2FA might be needed**:
   - Go to myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Use the generated 16-char password instead

### Issue: OTP expires before I enter it
- OTP is valid for 5 minutes
- Click "Request New OTP" button to get a new one

---

## Recommended: MongoDB Atlas Setup (Easiest)

**Step-by-step for MongoDB Atlas:**

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with email
4. Verify email
5. Create organization (use default "My Organization")
6. Create project (use default "My Project")
7. Create cluster:
   - Select "M0 Free" tier
   - Select your region
   - Click "Create Deployment"
   - Wait 2-3 minutes
8. Click "Connect" → "Drivers" → "Node.js"
9. Copy connection string
10. In `.env.local`, replace MONGODB_URI with your connection string
11. Restart `pnpm dev`
12. Test signup with OTP

**That's it! You're ready to test the OTP system.**

---

## File Structure Reference

After MongoDB setup, your project will have:

```
.env.local
├─ MONGODB_URI=...              (MongoDB connection string)
├─ NODEMAILER_EMAIL=...         (Gmail email)
└─ NODEMAILER_PASSWORD=...      (Gmail app password)

app/api/auth/
├─ send-otp/route.ts            (Generate & email OTP)
├─ verify-otp/route.ts          (Validate OTP code)
└─ register/route.ts            (Create user account)

lib/
├─ emailService.ts              (Nodemailer integration)
├─ models.ts                    (User & OTP MongoDB schemas)
└─ mongodb.ts                   (Database connection)

components/pages/
└─ SignupPage.tsx               (3-field signup with OTP)
```

---

## Next Steps

1. **Choose setup option** (Atlas recommended)
2. **Configure MongoDB**
3. **Update .env.local** with connection string
4. **Restart dev server**
5. **Test OTP signup flow**
6. **Verify data in MongoDB** (emails, hashed passwords)

---

**Need Help?** Check the detailed error message in your terminal when clicking "Send OTP to Email"
