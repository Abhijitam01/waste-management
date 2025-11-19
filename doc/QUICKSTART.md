# OceanCleanup Connect - Quick Start Guide

## 🚀 Running the Platform

### Prerequisites
- Python 3.x with virtual environment
- Node.js 18+ (Node 20+ recommended)
- Modern web browser

### Step 1: Start ML Service
```bash
cd /home/abhijitam/Desktop/ocean-waste-detection-method
source venv/bin/activate
python app.py
```
**Service will run on**: `http://localhost:5000`

### Step 2: Start Frontend
```bash
cd web-platform
npm run dev
```
**Application will run on**: `http://localhost:3000`

### Step 3: Access the Platform
Open your browser and navigate to: `http://localhost:3000`

## 📋 User Flow

1. **Landing Page** → Click "View Dashboard" or "Get Started"
2. **Login/Signup** → Create account or sign in
3. **Dashboard** → View waste reports, statistics, and map
4. **Report Waste** → Upload image, enable location, submit
5. **View Results** → See AI classification and report on map
6. **Analytics** → Check statistics and trends
7. **Help** → Learn how to use the platform

## 🎯 Key Features

- **AI Classification**: 85.8% accuracy on 6 waste types
- **Interactive Map**: Color-coded markers with details
- **Drift Analysis**: Predict waste movement (24-72 hours)
- **Real-time Updates**: Firebase integration
- **Mobile Responsive**: Works on all devices
- **Premium UI**: Smooth animations and transitions

## 🔧 Troubleshooting

**ML Service not starting?**
- Ensure virtual environment is activated
- Check if port 5000 is available

**Frontend build errors?**
- Run `npm install` in web-platform directory
- Check Node.js version (should be 18+)

**Map not loading?**
- Check browser console for errors
- Ensure internet connection (for map tiles)

**Classification failing?**
- Verify ML service is running
- Check `.env.local` has correct API_URL

## 📞 Support

For issues, check:
- Help page (`/help`)
- Walkthrough documentation
- Console logs for error messages
