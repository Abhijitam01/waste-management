# Fixing Firebase Authentication Error

## Error: `auth/configuration-not-found`

This error means Email/Password authentication is not enabled in your Firebase project.

## Solution: Enable Email/Password Authentication

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **plastic-detection-16524**

### Step 2: Enable Authentication
1. In the left sidebar, click **"Build"** → **"Authentication"**
2. Click **"Get Started"** (if you haven't set up authentication yet)
3. Go to the **"Sign-in method"** tab
4. Find **"Email/Password"** in the list
5. Click on it
6. Toggle **"Enable"** to ON
7. Click **"Save"**

### Step 3: Verify Settings
- Make sure "Email/Password" shows as "Enabled" in the sign-in methods list
- You don't need to enable "Email link (passwordless sign-in)" unless you want that feature

### Step 4: Test the Application
1. Restart your Next.js dev server:
   ```bash
   cd web-platform
   npm run dev
   ```

2. Go to `http://localhost:3000/login`

3. Try creating an account with:
   - Email: `demo@oceancleanup.com`
   - Password: `Demo123!`

## Alternative: Use Firebase CLI (Advanced)

If you prefer using the command line:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select Authentication and follow prompts
```

## Troubleshooting

### Still getting errors?

1. **Check API Key**: Verify your API key in `.env.local` is correct
2. **Check Project ID**: Ensure `plastic-detection-16524` is the correct project
3. **Clear Browser Cache**: Sometimes cached data causes issues
4. **Check Firebase Quotas**: Free tier has limits (10k verifications/month)

### Common Issues

**Error: "Invalid API key"**
- Your API key might be restricted. Check Firebase Console → Project Settings → API Keys

**Error: "Project not found"**
- Verify the project ID in your Firebase config

**Error: "Network request failed"**
- Check your internet connection
- Verify Firebase URLs are accessible

## Current Configuration

Your `.env.local` file has:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDpPvnqren6n2sWdUgbSZyXG6AR8hK3EEI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=plastic-detection-16524.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://plastic-detection-16524-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=plastic-detection-16524
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=plastic-detection-16524.firebasestorage.app
NEXT_PUBLIC_FIREBASE_APP_ID=1:295905497466:web:db8740568e4ee6459e46c3
```

This configuration looks correct. The issue is just that authentication needs to be enabled in the Firebase Console.

## Quick Fix Summary

**The main issue**: Email/Password authentication is not enabled in Firebase Console

**The solution**: 
1. Go to Firebase Console
2. Authentication → Sign-in method
3. Enable "Email/Password"
4. Save and restart your app

That's it! 🎉
