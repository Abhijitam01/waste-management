# Creating Demo User Account

Since Firebase Authentication requires actual signup through the app, here's how to create the demo account:

## Method 1: Through the Web Interface (Recommended)

1. **Start the application**:
   ```bash
   # Terminal 1
   cd /home/abhijitam/Desktop/ocean-waste-detection-method
   source venv/bin/activate
   python app.py
   
   # Terminal 2
   cd /home/abhijitam/Desktop/ocean-waste-detection-method/web-platform
   npm run dev
   ```

2. **Open browser**: Navigate to `http://localhost:3000`

3. **Go to login page**: Click "Get Started" or navigate to `/login`

4. **Sign up**:
   - Click "Don't have an account? Sign up"
   - Enter:
     - **NGO Name**: `Your Organization Name`
     - **Email**: `your-email@example.com` (Use your own email)
     - **Password**: `YourSecurePassword123!` (Use a strong password)
   - Click "Create Account"

5. **Done!** You can now use these credentials to login

## Method 2: Using Firebase Console (Alternative)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Authentication → Users
4. Click "Add User"
5. Enter:
   - Email: `your-email@example.com` (Use your own email)
   - Password: `YourSecurePassword123!` (Use a strong password)
6. Click "Add User"

## Example Credentials (For Testing Only)

⚠️ **Never use these in production!**

```
Email: demo@oceancleanup.com (Example only)
Password: Demo123! (Example only - change this!)
```

## Testing the Account

After creating the account:

1. **Login**: Go to `/login` and enter credentials
2. **Dashboard**: You'll see the main dashboard
3. **Report Waste**: Try uploading a test image
4. **Analytics**: View statistics
5. **Help**: Check the user guide

## Pre-populated Test Data

To make the demo more interesting, you can:

1. Report a few waste items using different images
2. Enable drift analysis to see predictions
3. Check analytics to see distribution charts

This will make the dashboard look more realistic for demonstrations!
