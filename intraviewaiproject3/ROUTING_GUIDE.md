# Complete Website Routing Structure

## Main Landing & Authentication Routes

- **`/`** - Landing Page (main homepage with navigation)
- **`/login`** - Candidate Login Page
- **`/signup`** - Signup Page
- **`/admin/login`** - Admin Login Page

## Candidate Routes

### Dashboard & Main Pages
- **`/candidate/dashboard`** - Candidate Main Dashboard
- **`/candidate/profile`** - Enhanced Candidate Profile
- **`/candidate/interviews`** - Candidate Interviews List
- **`/candidate/reports`** - Candidate Reports
- **`/candidate/progress`** - Candidate Progress Tracking
- **`/candidate/settings`** - Candidate Settings

### Interview & Assessment Routes
- **`/candidate/system-check`** - System Check Page (before interview)
- **`/candidate/combined-interview`** - Combined Behavioral + Coding Interview
- **`/candidate/profile-setup`** - Profile Setup for Interview
- **`/candidate/interview-interface`** - Live Interview Interface
- **`/candidate/interview-complete`** - Interview Completion Page
- **`/candidate/interview-report`** - Interview Results & Report
- **`/candidate/learning-hub`** - Learning Hub & Recommendations
- **`/candidate/intraview-dashboard`** - IntraView Dashboard

## Admin Routes

### Dashboard & Management Pages
- **`/admin/login`** - Admin Login Page
- **`/admin/dashboard`** - Admin Main Dashboard
- **`/admin/questions`** - Manage Interview Questions
- **`/admin/testcases`** - Manage Test Cases
- **`/admin/candidates`** - View & Manage Candidates
- **`/admin/sessions`** - View & Manage Interview Sessions
- **`/admin/rubrics`** - Manage Grading Rubrics
- **`/admin/analytics`** - View Analytics & Reports
- **`/admin/settings`** - Admin Settings

## How Navigation Works

### From Landing Page
- Click "Get Started" → `/login` (Candidate Login)
- Click "How It Works" → Scrolls to #how-it-works section
- Click "Features" → Scrolls to #features section

### From Candidate Login
- Enter credentials and click "Sign In" → `/candidate/dashboard`
- Click "Sign up" link → `/signup`
- Click "Admin Login" link → `/admin/login`

### From Candidate Dashboard
- Click "Profile" (sidebar) → `/candidate/profile`
- Click "Interviews" (sidebar) → `/candidate/interviews`
- Click "Reports" (sidebar) → `/candidate/reports`
- Click "Progress" (sidebar) → `/candidate/progress`
- Click "Settings" (sidebar) → `/candidate/settings`
- Click "Start New Interview" → `/candidate/combined-interview`
- Logout → `/`

### From Admin Login
- Enter credentials and click "Sign In" → `/admin/dashboard`
- Click "Candidate Login" link → `/login`

### From Admin Dashboard
- Click "Questions" (sidebar) → `/admin/questions`
- Click "Test Cases" (sidebar) → `/admin/testcases`
- Click "Candidates" (sidebar) → `/admin/candidates`
- Click "Sessions" (sidebar) → `/admin/sessions`
- Click "Rubrics" (sidebar) → `/admin/rubrics`
- Click "Analytics" (sidebar) → `/admin/analytics`
- Click "Settings" (sidebar) → `/admin/settings`
- Logout → `/`

## Features Implemented

✅ URL-based routing using Next.js App Router
✅ Proper navigation between all pages
✅ Separate login routes for candidates and admins
✅ Landing page with anchor links
✅ Sidebar navigation with URL updates
✅ Logout functionality returns to home
✅ All pages linked together for complete user flow
