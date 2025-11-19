# 🌊 OceanCleanup Connect

> AI-Powered Ocean Waste Detection and Management Platform for NGOs

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green)](https://flask.palletsprojects.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange)](https://www.tensorflow.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.6-yellow)](https://firebase.google.com/)

OceanCleanup Connect is a comprehensive platform that empowers NGOs to identify, track, and coordinate ocean waste cleanup operations using AI-powered image classification and real-time drift analysis.

## ✨ Features

### 🤖 AI-Powered Detection
- **Image Classification**: Upload waste images and get instant AI-powered classification
- **Multiple Waste Types**: Detects plastic, glass, metal, paper, cardboard, and general trash
- **Confidence Scores**: Get detailed confidence percentages for each classification
- **Transfer Learning**: Built on Inception v3 model with custom training capabilities

### 🗺️ Interactive Mapping
- **Real-time Location Tracking**: View all waste reports on an interactive map
- **Proximity Detection**: Automatically calculates distances from your location
- **Drift Analysis**: Predict waste movement using wind and ocean current data
- **Marker Clustering**: Efficient visualization of multiple waste locations

### 📊 Analytics & Insights
- **Statistics Dashboard**: View total reports, confidence metrics, and waste distribution
- **Trend Analysis**: Track waste collection trends over time
- **Type Distribution**: Visual breakdown of waste types detected
- **Performance Metrics**: Monitor cleanup operations effectiveness

### 🎨 Modern UI/UX
- **Dark/Light Theme**: Seamless theme switching with system preference detection
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Gradient Cards**: Beautiful UI components with gradient borders
- **Smooth Animations**: Framer Motion powered transitions and interactions

### 🔐 Secure Authentication
- **Firebase Auth**: Secure user authentication and session management
- **NGO Accounts**: Dedicated accounts for organizations
- **Protected Routes**: Authentication-required pages for data security

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16.0 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with CSS Variables
- **UI Components**: Custom components with Radix UI primitives
- **Animations**: Framer Motion
- **Maps**: React Leaflet with Leaflet.js
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode

### Backend
- **API Server**: Flask (Python)
- **ML Framework**: TensorFlow 2.x
- **Model**: Inception v3 (Transfer Learning)
- **Image Processing**: PIL/Pillow

### Database & Storage
- **Realtime Database**: Firebase Realtime Database
- **File Storage**: Firebase Storage
- **Authentication**: Firebase Authentication

### APIs
- **Weather Data**: Open-Meteo API
- **Marine Data**: Marine API for ocean currents

## 📦 Installation

### Prerequisites
- Node.js 20.9+ (for frontend)
- Python 3.8+ (for backend)
- Firebase account and project
- TensorFlow compatible system

### Frontend Setup

```bash
cd web-platform
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Run the development server:

```bash
npm run dev
```

Visit `http://localhost:3000`

### Backend Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file:

```env
FIREBASE_CREDENTIALS_PATH=path/to/serviceAccountKey.json
MODEL_PATH=tf_files/retrained_graph.pb
LABELS_PATH=tf_files/retrained_labels.txt
PORT=5000
```

Run the Flask server:

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## 🎯 Usage

### For NGOs

1. **Sign Up/Login**: Create an account or login with existing credentials
2. **Report Waste**: Upload images of ocean waste with location data
3. **View Dashboard**: See all waste reports sorted by proximity
4. **Analyze Drift**: Enable drift analysis to predict waste movement
5. **Track Progress**: Monitor cleanup statistics and trends

### API Endpoints

#### Classify Image
```http
POST /detect
Content-Type: application/octet-stream

[Base64 encoded image data]
```

Response:
```json
{
  "success": true,
  "predictions": {
    "plastic": 0.85,
    "glass": 0.10,
    "metal": 0.05
  },
  "top_prediction": {
    "label": "plastic",
    "confidence": 0.85
  }
}
```

## 📁 Project Structure

```
ocean-waste-detection-method/
├── web-platform/              # Next.js frontend
│   ├── app/                   # App router pages
│   │   ├── dashboard/         # Main dashboard
│   │   ├── report/            # Waste reporting
│   │   ├── analytics/         # Analytics page
│   │   ├── help/              # Help & guide
│   │   └── login/             # Authentication
│   ├── components/            # React components
│   │   ├── ui/                # UI primitives
│   │   ├── WasteMap.tsx       # Map component
│   │   ├── Sidebar.tsx        # Navigation
│   │   └── ...
│   ├── lib/                    # Utilities
│   │   ├── firebase.ts        # Firebase config
│   │   ├── utils.ts           # Helper functions
│   │   └── weather.ts         # Weather API
│   └── types/                 # TypeScript types
├── app.py                     # Flask API server
├── service.py                 # ML service
├── classify.py                # Image classification
├── firebase.py                # Firebase backend
├── retrain.py                 # Model retraining
└── requirements.txt           # Python dependencies
```

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create Realtime Database
4. Set up Storage bucket
5. Download service account key
6. Update environment variables

### Model Training

To retrain the model with custom data:

```bash
python retrain.py \
  --image_dir=training_dataset \
  --output_graph=tf_files/retrained_graph.pb \
  --output_labels=tf_files/retrained_labels.txt \
  --bottleneck_dir=tf_files/bottlenecks
```

## 🎨 Theme Customization

The platform supports full theme customization through CSS variables:

```css
:root {
  --primary: #FF9933;
  --secondary: #D4AF37;
  --tertiary: #800020;
  /* ... more variables */
}
```

Dark mode is automatically supported with `.dark` class variants.

## 🧪 Testing

### Frontend
```bash
cd web-platform
npm run lint
```

### Backend
```bash
python testing.py
```

## 📈 Performance

- **Image Classification**: ~200-500ms per image
- **Map Rendering**: Optimized with marker clustering
- **Database Queries**: Real-time updates with Firebase
- **Bundle Size**: Optimized with Next.js code splitting

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TensorFlow Team** for the Inception v3 model
- **Firebase** for backend infrastructure
- **Next.js Team** for the amazing framework
- **Leaflet** for map functionality
- **Open-Meteo** for weather data

## 📚 Documentation

All project documentation is available in the [`doc/`](doc/) folder:

- **[FIREBASE_AUTH_FIX.md](doc/FIREBASE_AUTH_FIX.md)** - Firebase authentication setup and troubleshooting
- **[QUICKSTART.md](doc/QUICKSTART.md)** - Quick start guide for developers
- **[PROJECT_REPORT_CONTEXT.md](doc/PROJECT_REPORT_CONTEXT.md)** - Project context and architecture
- **[UI_FIXES_SUMMARY.md](doc/UI_FIXES_SUMMARY.md)** - UI improvements documentation
- **[CODE_CLEANUP_SUMMARY.md](doc/CODE_CLEANUP_SUMMARY.md)** - Code cleanup documentation
- **[CREATE_DEMO_USER.md](doc/CREATE_DEMO_USER.md)** - Guide for creating demo users
- **[DEMO_CREDENTIALS.md](doc/DEMO_CREDENTIALS.md)** - Demo account information
- **[DRIFT_ANALYSIS.md](doc/DRIFT_ANALYSIS.md)** - Drift analysis feature documentation

## 📞 Support

For support, email support@oceancleanup.connect or open an issue in the repository.

## 🔮 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced ML models (YOLO, Faster R-CNN)
- [ ] Multi-language support
- [ ] Real-time collaboration features
- [ ] Integration with cleanup scheduling
- [ ] Advanced analytics with ML insights
- [ ] API rate limiting and caching
- [ ] Webhook support for integrations

## 📊 Project Stats

- **Total Commits**: 54+
- **Languages**: TypeScript, Python, CSS
- **Frameworks**: Next.js, Flask, TensorFlow
- **Lines of Code**: 10,000+

---

Made with ❤️ for ocean conservation

**OceanCleanup Connect** - Empowering NGOs to clean our oceans, one detection at a time.
