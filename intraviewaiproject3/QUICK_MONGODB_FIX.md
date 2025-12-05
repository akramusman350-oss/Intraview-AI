# MongoDB Setup - Quickest Solution

## Your Current Situation
✅ OTP system is fully built and ready
✅ Email service configured
❌ MongoDB is not installed/running on your computer

## Quickest Fix (5 minutes)

### Use MongoDB Atlas (Free Cloud Database)

**Step 1:** Go to https://www.mongodb.com/cloud/atlas

**Step 2:** Click "Try Free"

**Step 3:** Sign up with your email (use intraviewwai@gmail.com or your email)

**Step 4:** Create a cluster:
- Select "M0 Free" (completely free forever)
- Choose your region (Asia/Middle East if available)
- Click "Create"
- Wait 2-3 minutes

**Step 5:** Click "Connect" button:
- Select "Drivers"
- Choose "Node.js"
- Copy the connection string that looks like:
  ```
  mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```

**Step 6:** Update your `.env.local` file:
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/intraview-ai?retryWrites=true&w=majority
NODEMAILER_EMAIL=intraviewwai@gmail.com
NODEMAILER_PASSWORD=brdv mund etjf qzqp
```

**Step 7:** Restart dev server:
```powershell
# Press Ctrl+C in the terminal running pnpm dev
pnpm dev
```

**Step 8:** Test signup at http://localhost:3000/login

---

## MongoDB Atlas Free Account Features
- **Free Forever** M0 tier
- 512 MB storage (enough for testing)
- Easy scaling later
- 99.99% uptime SLA
- Built-in security
- No credit card needed (optional for upgrading)

---

## After Setup Works

Your OTP flow will be:

1. **User signs up**:
   - Enters Name: "Abdul Rehman"
   - Enters Email: "abdul@example.com"
   - Clicks "Send OTP to Email"

2. **Backend**:
   - Generates random 6-digit OTP: "457829"
   - Saves to MongoDB OTP collection with 5-min expiry
   - Sends email via Gmail SMTP

3. **User verifies**:
   - Checks email inbox for OTP
   - Enters "457829"
   - Clicks "Verify OTP"

4. **If correct**:
   - Password fields appear
   - User creates password: "MyPass123!"
   - Clicks "Create Account"

5. **Account created**:
   - Password hashed with bcryptjs
   - User saved to MongoDB
   - User logged in

6. **Database state**:
   - OTP record deleted (one-time use)
   - User record stored with hashed password

---

## All Your OTP Files Ready

✅ `/lib/emailService.ts` - Email + OTP logic
✅ `/lib/models.ts` - MongoDB schemas
✅ `/lib/mongodb.ts` - Connection manager
✅ `/app/api/auth/send-otp/route.ts` - Generate OTP endpoint
✅ `/app/api/auth/verify-otp/route.ts` - Verify OTP endpoint
✅ `/app/api/auth/register/route.ts` - Create user endpoint
✅ `/components/pages/SignupPage.tsx` - Single-page signup form
✅ `/.env.local` - Configuration file

---

## Troubleshooting Commands

**Check if MongoDB Atlas is connected:**
```powershell
# Look at the terminal output when you click "Send OTP"
# Should show: "Database connected successfully"
# Should NOT show: "ECONNREFUSED"
```

**If still not working:**
1. Double-check `.env.local` connection string (no typos)
2. Verify MongoDB Atlas cluster is "Running" (green check in dashboard)
3. Check username and password are correct in connection string
4. Allow your IP in MongoDB Atlas firewall: 
   - Go to MongoDB Atlas → Security → Network Access
   - Add "0.0.0.0/0" for testing (or your IP)

---

## Your Next Action

1. **Open browser**: https://www.mongodb.com/cloud/atlas
2. **Sign up** (takes 2 minutes)
3. **Create free cluster** (takes 3 minutes)
4. **Copy connection string**
5. **Update `.env.local`**
6. **Restart `pnpm dev`**
7. **Test signup** at http://localhost:3000/login

**That's it! Your OTP system will work.**

---

Need help with any step? The error message in your terminal will guide you.
