# OceanCleanup Connect - Sections Guide

This document explains what each section of the OceanCleanup Connect platform does and how to use it.

## 🏠 Home Page (`/`)

**Purpose**: Landing page that introduces the platform and provides quick access to key features.

**Features**:
- **Hero Section**: Main introduction to OceanCleanup Connect with call-to-action buttons
- **"Detect Waste Now" Button**: Opens a modal to immediately detect waste in an image and save coordinates to Firebase
- **"View Dashboard" Button**: Navigates to the dashboard to see all waste reports
- **"Report Waste" Button**: Navigates to the full report page for detailed waste reporting
- **Features Section**: Highlights key platform capabilities (Smart Proximity, Drift Analysis, NGO Network)
- **CTA Section**: Encourages users to get started with a link to login

**How to Use**:
1. Click "Detect Waste Now" to quickly detect and save waste from the home page
2. Click "View Dashboard" to see all waste reports on a map
3. Click "Report Waste" for a more detailed reporting experience
4. Click "Get Started" to login or create an account

---

## 📊 Dashboard (`/dashboard`)

**Purpose**: Main control center showing all waste reports, statistics, and an interactive map.

**Features**:
- **Statistics Cards**: 
  - Total Reports: Count of all waste reports
  - Nearby: Reports within 50km radius
  - High Confidence: Reports with >80% AI confidence
  - Active: Ongoing cleanup operations
- **Interactive Map**: Shows all waste locations with color-coded markers by type
- **Drift Analysis Toggle**: Enable/disable prediction of waste movement based on wind and ocean currents
- **Search & Filters**: 
  - Search reports by waste type
  - Filter by type (plastic, glass, metal, paper, cardboard, trash)
  - Sort by distance, confidence, or recency
- **Recent Reports List**: Shows the 10 most relevant reports with details

**How to Use**:
1. View statistics at the top to understand overall waste situation
2. Use the map to see waste locations geographically
3. Toggle "Show Drift" to see predicted waste movement over 24-72 hours
4. Use search and filters to find specific waste types
5. Click on map markers or list items to see report details

**Data Storage**: All waste reports with coordinates are stored in Firebase Realtime Database under `waste_reports` node.

---

## 📤 Report Waste (`/report`)

**Purpose**: Detailed page for reporting ocean waste with AI-powered classification.

**Features**:
- **Image Upload**: Upload or take a photo of waste (up to 10MB)
- **Location Capture**: Get GPS coordinates automatically
- **AI Classification**: Automatically identifies waste type (plastic, glass, metal, paper, cardboard, trash)
- **Confidence Scores**: Shows top 3 predictions with confidence percentages
- **Firebase Storage**: Images are stored in Firebase Storage
- **Coordinate Storage**: Location coordinates are saved to Firebase Realtime Database

**How to Use**:
1. Click to upload an image or take a photo
2. Click "Get Current Location" to capture GPS coordinates
3. Click "Submit Report" to process the image
4. Review AI classification results
5. Report is automatically saved with coordinates to Firebase

**Data Flow**:
- Image → ML API (`/detect` endpoint) → Classification results
- Image → Firebase Storage → Image URL
- Coordinates + Classification → Firebase Realtime Database → `waste_reports`

---

## 📈 Analytics (`/analytics`)

**Purpose**: Track waste collection trends, statistics, and insights.

**Features**:
- **Total Reports**: Overall count of waste reports
- **Average Confidence**: Mean AI confidence score across all reports
- **Waste Types Count**: Number of different waste types detected
- **Waste Distribution Chart**: Visual breakdown of waste by type with percentages
- **Recent Activity**: Timeline of recent waste reports

**How to Use**:
1. View summary statistics at the top
2. Check waste distribution to see which types are most common
3. Review recent activity to track cleanup progress
4. Use data to prioritize cleanup efforts

---

## ❓ Help (`/help`)

**Purpose**: Step-by-step guide on how to use the platform effectively.

**Features**:
- **5-Step Guide**: 
  1. Report Waste - How to upload and classify images
  2. AI Classification - Understanding confidence scores
  3. View on Map - Using the interactive map
  4. Drift Analysis - Understanding waste movement predictions
  5. Track Progress - Monitoring statistics and trends
- **Tips**: Best practices for each step
- **Support Links**: Contact support and view dashboard

**How to Use**:
1. Read through each step to understand platform features
2. Follow tips for best results
3. Use support links if you need help

---

## 🔐 Login (`/login`)

**Purpose**: Authentication page for NGOs to access the platform.

**Features**:
- **Login Mode**: Sign in with existing credentials
- **Sign Up Mode**: Create new NGO account
- **Email/Password Authentication**: Uses Firebase Authentication
- **NGO Name Field**: For new registrations

**How to Use**:
1. Enter email and password
2. Toggle to "Sign Up" if creating new account
3. Enter NGO name for new accounts
4. Click "Sign In" or "Sign Up" to authenticate

---

## 🔧 Technical Details

### Data Storage

**Firebase Realtime Database** (`waste_reports`):
```json
{
  "reportId": {
    "lat": 20.5937,
    "lng": 78.9629,
    "type": "plastic",
    "confidence": 0.95,
    "timestamp": 1234567890,
    "imageUrl": "https://...",
    "predictions": { "plastic": 0.95, "glass": 0.03, ... }
  }
}
```

**Firebase Storage** (`waste_images/`):
- Stores uploaded waste images
- Images are accessible via download URLs

### API Integration

**ML Service** (`/detect` endpoint):
- Accepts: Base64 encoded image data
- Returns: Classification predictions with confidence scores
- Location: Configured via `NEXT_PUBLIC_API_URL` environment variable

### Buttons & Navigation

All buttons are functional:
- ✅ Home page: "Detect Waste Now" opens modal
- ✅ Home page: "View Dashboard" navigates to dashboard
- ✅ Home page: "Report Waste" navigates to report page
- ✅ Home page: "Get Started" navigates to login
- ✅ Dashboard: All filter and sort buttons work
- ✅ Report page: Upload, location, and submit buttons work
- ✅ Help page: Support and dashboard links work
- ✅ Sidebar: All navigation links work
- ✅ Sidebar: Logout button works

---

## 🎯 Quick Start Workflow

1. **First Time User**:
   - Visit home page
   - Click "Get Started" to create account
   - Login with credentials

2. **Report Waste**:
   - Click "Detect Waste Now" on home page (quick) OR
   - Go to "Report Waste" page (detailed)
   - Upload image → Get location → Submit
   - Coordinates automatically saved to Firebase

3. **View Reports**:
   - Go to Dashboard
   - See all reports on map
   - Filter and search as needed
   - Enable drift analysis for predictions

4. **Track Progress**:
   - Check Analytics page for statistics
   - Review waste distribution
   - Monitor recent activity

---

## 📝 Notes

- All coordinates are stored in Firebase Realtime Database
- Images are stored in Firebase Storage
- ML service must be running for waste detection to work
- Location services must be enabled for coordinate capture
- Reports are automatically sorted by distance on dashboard
- Drift analysis requires internet connection for weather data

