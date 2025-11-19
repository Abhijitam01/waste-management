# Presentation Flow Guide - OceanCleanup Connect

## 🎯 Quick Start Flow

### 1. **Landing Page** (`/`)
   - **Purpose**: Introduction and quick access
   - **Key Actions**:
     - Click "Detect Waste Now" → Opens modal for quick detection
     - Click "View Dashboard" → Goes to dashboard (requires login)
     - Click "Report Waste" → Goes to full report page
     - Click "Get Started" → Goes to login

### 2. **Login** (`/login`)
   - Enter email and password
   - Click "Sign In" button
   - Redirects to Dashboard automatically

### 3. **Dashboard** (`/dashboard`) - MAIN PRESENTATION PAGE
   
   **Layout**:
   - **Left Sidebar**: Navigation menu (auto-opens on desktop, toggle on mobile)
   - **Main Content**: Stats, Map, Reports, NGO Tools

   **Key Features to Demo**:

   #### A. **Statistics Cards** (Top Section)
   - Shows: Total Reports, Nearby (50km), High Confidence, Active
   - Updates automatically when new reports are added

   #### B. **Search & Filters**
   - **Search Bar**: Type to search by waste type
   - **Filters Button**: Click to show/hide filter panel
     - Filter by Type: All, Plastic, Glass, Metal, Paper, Cardboard, Trash
     - Sort by: Distance, Confidence, Recent

   #### C. **Map Section** (Left Side)
   - Shows all waste locations as colored markers
   - **"Show Drift" Button**: 
     - Click to enable drift analysis
     - Shows blue dashed lines with predicted movement
     - Displays drift speed markers (km/h)
     - Click markers to see detailed drift info
   - **Click any marker** to see waste details in popup

   #### D. **Reports List** (Right Side)
   - Shows top 10 filtered reports
   - **Click any report card** → Centers map on that location
   - Shows: Type, Image, Location, Distance, Confidence, Time

   #### E. **NGO Cleanup Planner** (Bottom Section)
   - **"Open Cleanup Planner" Button**: 
     - Opens full planner with all reports
     - Shows drift speeds and predicted locations
     - Priority scoring (High/Medium/Low)
     - Timeframe selection: 24h, 48h, 72h
     - Sort by: Urgency, Speed, Distance
   - **Click any recommendation** → Centers map on predicted location
   - **"Hide Planner" Button**: Closes the planner

   #### F. **"Detect Waste Now" Button** (Top Right)
   - Opens modal to upload image and detect waste
   - Requires location (auto or manual)
   - Saves to Firebase automatically
   - Shows AI classification results

### 4. **Report Page** (`/report`)
   - Full-page waste reporting form
   - Upload image
   - Get location (auto or manual address)
   - Submit report
   - Shows success with classification results
   - Button to go back to dashboard

### 5. **Analytics** (`/analytics`)
   - Charts showing waste distribution
   - Statistics by type
   - Trends over time

### 6. **Help** (`/help`)
   - User guide
   - Feature explanations
   - Tips for using the platform

---

## 🎬 Presentation Demo Flow (Recommended Order)

### **Step 1: Landing Page** (30 seconds)
1. Show the hero section
2. Explain the platform purpose
3. Click "View Dashboard" to proceed

### **Step 2: Login** (10 seconds)
1. Enter demo credentials
2. Click "Sign In"
3. Auto-redirects to dashboard

### **Step 3: Dashboard Overview** (1 minute)
1. **Point out Statistics Cards**: "These update in real-time"
2. **Show Map**: "All waste locations are marked here"
3. **Show Reports List**: "Recent reports with details"

### **Step 4: Search & Filter Demo** (30 seconds)
1. Type in search bar: "plastic"
2. Click "Filters" button
3. Select "Plastic" filter
4. Show filtered results
5. Change sort to "Confidence"
6. Reset filters

### **Step 5: Map Interaction** (1 minute)
1. **Click a report card** → Map centers on location
2. **Click "Show Drift"** → Drift lines appear
3. **Click drift speed marker** → Show popup with speed info
4. **Click arrow markers** → Show predicted positions
5. Explain: "This helps NGOs plan cleanup routes"

### **Step 6: NGO Cleanup Planner** (2 minutes) ⭐ KEY FEATURE
1. Scroll to "For NGOs" section
2. **Click "Open Cleanup Planner"**
3. Wait for drift calculations (shows loading)
4. **Explain the planner**:
   - Priority scoring (High/Medium/Low)
   - Drift speeds in km/h
   - Predicted locations at 24h, 48h, 72h
   - Urgency scores
5. **Change timeframe**: Click "48h" button
6. **Change sort**: Click "Speed" to sort by drift speed
7. **Click a recommendation** → Map centers on predicted location
8. Explain: "NGOs can use this to plan efficient cleanup operations"

### **Step 7: Detect Waste** (1 minute)
1. **Click "Detect Waste Now"** button (top right)
2. Upload a sample image
3. Get location (auto or manual)
4. Click "Detect & Save Waste"
5. Show processing
6. Show success with classification results
7. Explain: "Report is automatically saved to Firebase"

### **Step 8: Real-time Updates** (30 seconds)
1. Show that new reports appear automatically
2. Statistics update
3. Map updates with new markers

---

## 🔘 All Buttons & Their Functions

### **Dashboard Page**
- ✅ **"Detect Waste Now"** (Top Right) → Opens detection modal
- ✅ **"Filters"** → Toggles filter panel
- ✅ **Filter Type Buttons** → Filters reports by type
- ✅ **Sort Buttons** → Sorts reports (Distance/Confidence/Recent)
- ✅ **"Show Drift" / "Hide Drift"** → Toggles drift analysis on map
- ✅ **Report Cards** → Centers map on report location
- ✅ **"Open Cleanup Planner"** → Opens NGO planner
- ✅ **"Hide Planner"** → Closes NGO planner
- ✅ **NGO Planner Recommendations** → Centers map on predicted location
- ✅ **Timeframe Buttons (24h/48h/72h)** → Changes prediction timeframe
- ✅ **Sort Buttons in Planner** → Sorts by Urgency/Speed/Distance

### **Sidebar**
- ✅ **Menu Toggle** (Mobile) → Opens/closes sidebar
- ✅ **Dashboard** → Navigate to dashboard
- ✅ **Report Waste** → Navigate to report page
- ✅ **Analytics** → Navigate to analytics
- ✅ **Help** → Navigate to help
- ✅ **Logout** → Sign out and return to home

### **Waste Detection Modal**
- ✅ **"Get Current Location"** → Gets GPS location
- ✅ **"Find"** (Address) → Geocodes address
- ✅ **"Change"** (Location) → Resets location
- ✅ **"Detect & Save Waste"** → Submits report
- ✅ **"Detect Another"** → Resets form
- ✅ **"Close" (X)** → Closes modal

### **Report Page**
- ✅ **"Get Current Location"** → Gets GPS location
- ✅ **"Find"** (Address) → Geocodes address
- ✅ **"Submit Report"** → Submits report
- ✅ **"Report Another"** → Resets form
- ✅ **"View Dashboard"** → Goes to dashboard
- ✅ **"← Back to Home"** → Returns to home

---

## 🎨 Visual Flow

```
Home Page
    ↓
Login
    ↓
Dashboard
    ├── Stats Cards (Top)
    ├── Search & Filters
    ├── Map (Left) ←→ Reports List (Right)
    ├── NGO Planner Section (Bottom)
    └── Sidebar (Left, Fixed)
```

---

## ⚠️ Important Notes for Presentation

1. **Backend Service**: Ensure `python app.py` is running on port 5000 for ML classification
2. **Firebase**: Must be configured with valid credentials
3. **Internet**: Required for:
   - Firebase (database/storage)
   - Open-Meteo API (wind/current data)
   - Map tiles (OpenStreetMap)
4. **Browser**: Use Chrome/Firefox for best compatibility
5. **Mobile**: Sidebar auto-closes on mobile, toggle with hamburger menu

---

## 🐛 Troubleshooting

### If buttons don't work:
- Check browser console for errors
- Ensure all dependencies are installed: `npm install`
- Check Firebase configuration

### If map doesn't load:
- Check internet connection
- Verify Leaflet CSS is loaded
- Check browser console for errors

### If drift doesn't show:
- Wait a few seconds (API calls take time)
- Check internet connection (needs Open-Meteo API)
- Check browser console for errors

### If reports don't appear:
- Check Firebase connection
- Verify database rules allow read access
- Check browser console for errors

---

## 📝 Presentation Script (5 minutes)

**Opening** (30s):
"Today I'll demonstrate OceanCleanup Connect, an AI-powered platform for tracking and cleaning ocean waste. Let me show you how it works."

**Dashboard Overview** (1m):
"Here's the main dashboard. You can see statistics, a map of all waste locations, and recent reports. Everything updates in real-time."

**Search & Filter** (30s):
"You can search and filter reports by type, and sort by distance, confidence, or recency."

**Drift Analysis** (1m):
"One of our key features is drift analysis. When I enable it, you can see how waste moves based on wind and ocean currents. This shows predicted positions at 24, 48, and 72 hours, along with drift speeds."

**NGO Planner** (2m):
"For NGOs, we have a cleanup planner. It calculates drift speeds for all reports and provides prioritized recommendations. NGOs can see where waste will be in the future and plan efficient cleanup routes. You can sort by urgency, speed, or distance, and select different timeframes."

**Detection** (30s):
"Users can quickly detect waste by uploading an image. Our AI classifies it and saves the location automatically."

**Closing** (30s):
"This platform helps NGOs coordinate cleanup operations more efficiently by predicting waste movement and prioritizing locations."

---

## ✅ Pre-Presentation Checklist

- [ ] Backend service running (`python app.py`)
- [ ] Firebase configured and connected
- [ ] Internet connection active
- [ ] Browser console clear of errors
- [ ] At least 2-3 sample reports in database
- [ ] Test all buttons work
- [ ] Test drift analysis loads
- [ ] Test NGO planner opens and calculates
- [ ] Test detection modal works
- [ ] Test sidebar navigation
- [ ] Test on both desktop and mobile view

---

## 🎯 Key Points to Emphasize

1. **Real-time Updates**: Everything syncs automatically via Firebase
2. **AI-Powered**: Automatic waste classification
3. **Drift Prediction**: Uses real wind and ocean current data
4. **NGO Focus**: Tools specifically designed for cleanup planning
5. **User-Friendly**: Simple interface, works on mobile and desktop
6. **Scalable**: Can handle thousands of reports

