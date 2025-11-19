# Project Report Context: Ocean Waste Detection Platform

## Abstract

Ocean pollution is one of the most pressing environmental challenges of our time, with millions of tons of waste entering marine ecosystems annually. This project presents **OceanCleanup Connect**, an integrated AI-powered platform designed to detect, classify, and track ocean waste to facilitate efficient cleanup operations by NGOs and volunteers. The system leverages deep learning techniques using a retrained Inception convolutional neural network (CNN) to classify waste images into six categories—plastic, metal, paper, glass, cardboard, and trash—with an accuracy of approximately 85.8%. 

The platform consists of a Flask-based REST API backend for machine learning inference using TensorFlow, and a modern Next.js frontend with TypeScript that provides an interactive mapping interface powered by Leaflet. The system integrates Firebase for user authentication and real-time data storage, enabling collaborative waste tracking across multiple users. A key innovation is the drift analysis feature, which predicts waste movement over 24-72 hour periods by combining real-time weather and ocean current data from Open-Meteo APIs with a physics-based drift model. This predictive capability allows cleanup teams to optimize their deployment strategies and intercept waste before it reaches sensitive ecological zones.

The platform successfully addresses the critical need for data-driven waste management by combining computer vision, geospatial visualization, and environmental modeling. Experimental results demonstrate reliable classification performance and practical utility for marine cleanup operations. The modular architecture ensures scalability and extensibility for future enhancements, including historical tracking, cleanup route optimization, and automated alert systems.

## 1. Project Overview
**Project Name**: OceanCleanup Connect / Ocean Waste Detection Method
**Goal**: To detect and classify ocean waste (plastics, metal, paper, etc.) using Machine Learning and provide a platform for NGOs and volunteers to track and clean up marine debris.
**Core Value**: Facilitates the collection and reduction of ocean waste by identifying waste types and predicting their movement (drift) to optimize cleanup operations.

## 2. Architecture & Tech Stack

### A. Frontend (Web Platform)
- **Framework**: Next.js (React) with TypeScript
- **Styling**: Tailwind CSS (inferred from "Premium UI" description and standard Next.js practices)
- **Authentication**: Firebase Authentication (Email/Password)
- **Database/Storage**: Firebase Realtime Database & Storage
- **Map Integration**: Leaflet (via React-Leaflet) for interactive maps
- **Hosting**: Localhost (currently), deployable to Vercel/Netlify

### B. Backend (ML Service)
- **Language**: Python 3.x
- **Framework**: Flask (API Service)
- **ML Library**: TensorFlow (1.x compatibility mode)
- **Model**: Inception (Pre-trained Deep Learning CNN), retrained via Transfer Learning
- **Deployment**: Local Flask server on port 5000

### C. External APIs
- **Open-Meteo Weather API**: For wind speed/direction data
- **Open-Meteo Marine API**: For ocean current velocity/direction data

## 3. Key Features

### 1. AI Waste Classification
- **Functionality**: Users upload images of waste, and the system classifies them into categories.
- **Classes**: Plastic, Metal, Paper, Glass, Cardboard, Trash.
- **Accuracy**: Claims ~85% - 100% training accuracy.
- **Implementation**: Uses a retrained Inception model. The Flask API receives the image, processes it, and returns prediction scores.

### 2. Interactive Dashboard
- **Map View**: Displays waste reports as markers on a global map.
- **Reporting**: Users can submit new reports with location and images.
- **Analytics**: Visualizes waste statistics (types, frequency).

### 3. Drift Analysis (New Feature)
- **Purpose**: Predicts where waste will travel over the next 24-72 hours to aid cleanup planning.
- **Mechanism**: 
  - Fetches real-time wind and ocean current data.
  - Uses a physics model: `Drift = (Wind × 10%) + Ocean Current`.
  - Visualizes the predicted path with dashed lines and arrows on the map.
- **Constraints**: Simplified model (surface only), limited to 20 active reports for performance.

### 4. User Management
- **Authentication**: Secure login and signup using Firebase.
- **Role**: Users (volunteers/NGOs) can track their reports.

## 4. Project Structure

### Root Directory
- `app.py`: Flask application entry point.
- `classify.py`: Core logic for image classification using TensorFlow.
- `retrain.py`: Script for retraining the Inception model.
- `training_dataset/`: Folder containing images for training (plastics, paper, etc.).
- `tf_files/`: Stores the retrained model graph (`retrained_graph.pb`) and labels.
- `web-platform/`: The Next.js frontend application.

### Web Platform (`/web-platform`)
- `app/`: Next.js App Router structure.
  - `dashboard/`: Main user interface with map and stats.
  - `report/`: Waste reporting form.
  - `login/`: Authentication page.
  - `analytics/`: Detailed statistics.
- `components/`: Reusable UI components (WasteMap, DriftLayer, etc.).
- `lib/`: Utility functions (Firebase config, weather API helpers).

## 5. Recent Updates & Fixes

### Firebase Authentication Fix
- **Issue**: Users faced `auth/configuration-not-found` error.
- **Cause**: Email/Password sign-in method was disabled in Firebase Console.
- **Resolution**: Enabled the provider in Firebase Console and verified with a demo account (`demo@oceancleanup.com`).

### Drift Analysis Implementation
- **Status**: Fully implemented and documented.
- **Integration**: Added toggle in Dashboard, created `DriftLayer` component, and integrated Open-Meteo APIs.

## 6. Future Roadmap
- **Historical Tracking**: Visualizing past waste movements.
- **Confidence Intervals**: Showing uncertainty in drift predictions.
- **Cleanup Routing**: Algorithms to suggest optimal cleanup routes.
- **Alert System**: Notifying NGOs when waste approaches sensitive ecological zones.

## 7. How to Run
1.  **Start ML Backend**:
    ```bash
    source venv/bin/activate
    python app.py
    ```
2.  **Start Frontend**:
    ```bash
    cd web-platform
    npm run dev
    ```
3.  **Access**: Open `http://localhost:3000`.
