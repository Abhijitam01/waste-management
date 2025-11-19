# 📁 Ocean Waste Detection - File Structure Documentation

This document provides a comprehensive overview of every file in the project and explains what each file does.

---

## 🗂️ Project Structure Overview

```
ocean-waste-detection-method/
├── Backend (Python/Flask)
├── Frontend (Next.js/React)
├── Machine Learning (TensorFlow)
├── Configuration & Scripts
├── Documentation
└── Training Data & Models
```

---

## 🔧 Backend Files (Python/Flask)

### `app.py`
**Purpose**: Main Flask application server that provides REST API endpoints for waste classification.

**What it does**:
- Initializes Flask application with CORS support
- Loads the `WasteClassifier` model on startup
- Provides `/detect` endpoint for image classification (POST)
- Provides `/status` endpoint for health checks (GET)
- Handles image data in various formats (raw bytes, base64, data URIs)
- Validates image size (max 10MB)
- Returns JSON responses with classification results and confidence scores
- Includes error handling for 404 and 500 errors

**Key Features**:
- CORS enabled for cross-origin requests
- Automatic base64 decoding
- Image validation
- Comprehensive logging

---

### `service.py`
**Purpose**: Raspberry Pi camera service for continuous monitoring and automatic waste detection.

**What it does**:
- Captures images using Raspberry Pi camera module
- Sends captured images to ML service for classification
- Runs continuous capture loop with configurable intervals
- Handles camera initialization and image capture
- Base64 encodes images before sending to API
- Includes error handling for camera failures and network issues

**Key Features**:
- Optional camera support (gracefully handles missing picamera module)
- Configurable capture intervals
- Automatic retry on errors
- Logging for debugging

---

### `waste_classifier.py`
**Purpose**: Core machine learning module that handles TensorFlow model loading and image classification.

**What it does**:
- Loads TensorFlow model graph from `.pb` file
- Loads label mappings from text file
- Creates TensorFlow session for inference
- Classifies images and returns confidence scores for all waste categories
- Provides `classify()` method for batch processing
- Provides `get_top_prediction()` for single best result
- Handles model initialization errors gracefully

**Key Features**:
- Singleton pattern for model loading
- Thread-safe session management
- Returns predictions as dictionary mapping labels to scores
- Automatic resource cleanup

---

### `classify.py`
**Purpose**: Standalone command-line script for testing image classification.

**What it does**:
- Accepts image path as command-line argument
- Uses `WasteClassifier` to classify the image
- Prints formatted results to console
- Shows all predictions with confidence percentages
- Highlights top prediction

**Usage**:
```bash
python classify.py testing.png
```

---

### `classify_original.py`
**Purpose**: Original TensorFlow classification script (legacy code).

**What it does**:
- Direct TensorFlow implementation without wrapper classes
- Loads model and labels directly
- Performs inference on test images
- Legacy code kept for reference

**Note**: This is deprecated in favor of `waste_classifier.py` and `classify.py`

---

### `retrain.py`
**Purpose**: TensorFlow script for transfer learning and model retraining.

**What it does**:
- Downloads Inception v3 pre-trained model if not present
- Creates bottleneck features from training images
- Trains new classification layer on top of Inception v3
- Splits dataset into training/validation/testing sets
- Supports data augmentation (flips, crops, scaling, brightness)
- Generates retrained model graph (`.pb` file)
- Generates labels file (`.txt` file)
- Provides TensorBoard summaries for visualization
- Evaluates model accuracy on test set

**Key Features**:
- Transfer learning from ImageNet pre-trained model
- Configurable training parameters (steps, learning rate, batch size)
- Automatic dataset splitting
- Bottleneck caching for faster training
- Data augmentation options

**Usage**:
```bash
python retrain.py --image_dir=training_dataset --output_graph=tf_files/retrained_graph.pb
```

---

### `firebase.py`
**Purpose**: Firebase integration module for database operations and authentication.

**What it does**:
- Authenticates with Firebase using email/password
- Initializes Firebase database and storage connections
- Pushes classification results to Firebase Realtime Database
- Handles authentication token management
- Provides `push()` method for saving data to Firebase

**Key Features**:
- Automatic authentication on first use
- Error handling for network issues
- Configurable database paths
- Timestamp tracking for updates

---

### `config.py`
**Purpose**: Centralized configuration management using environment variables.

**What it does**:
- Loads configuration from environment variables
- Provides default values for development
- Manages Flask server settings (host, port, debug)
- Manages model paths (graph, labels)
- Manages Firebase credentials
- Sets TensorFlow environment variables
- Validates required configuration

**Key Features**:
- Environment variable support
- Type-safe configuration access
- Validation methods
- Firebase config dictionary builder

---

### `env.py`
**Purpose**: Deprecated configuration file (backward compatibility only).

**What it does**:
- Provides backward compatibility for old code
- Redirects to `config.py`
- Shows deprecation warnings

**Note**: This file is deprecated. Use `config.py` instead.

---

### `testing.py`
**Purpose**: Simple test script for quick image classification testing.

**What it does**:
- Tests image classification with a single image
- Prints formatted results
- Uses `classify.py` module internally
- Provides command-line interface

**Usage**:
```bash
python testing.py testing.png
```

---

### `service_localtest.py`
**Purpose**: Local testing service for ML API and Firebase integration.

**What it does**:
- Tests ML service with local image files
- Tests Firebase push functionality
- Validates end-to-end workflow
- Useful for development and debugging

---

## 🎨 Frontend Files (Next.js/React/TypeScript)

### Web Platform Root Files

#### `web-platform/package.json`
**Purpose**: Node.js package configuration and dependencies.

**What it contains**:
- Project metadata and scripts
- Dependencies: Next.js, React, TypeScript, Firebase, Leaflet, Framer Motion
- Dev dependencies: ESLint, Tailwind CSS
- Scripts: `dev`, `dev:mobile`, `build`, `start`, `lint`

---

### App Pages (`web-platform/app/`)

#### `app/page.tsx`
**Purpose**: Landing/home page of the application.

**What it does**:
- Displays welcome screen
- Shows project overview
- Provides navigation to main features
- May include QR code for mobile access

---

#### `app/layout.tsx`
**Purpose**: Root layout component for the entire application.

**What it does**:
- Wraps all pages with providers (Theme, Firebase)
- Sets up global metadata
- Configures fonts and global styles
- Manages authentication state
- Provides navigation structure

---

#### `app/globals.css`
**Purpose**: Global CSS styles and theme variables.

**What it contains**:
- CSS custom properties for theming
- Dark/light mode color definitions
- Global utility classes
- Tailwind CSS imports
- Animation definitions

---

#### `app/login/page.tsx`
**Purpose**: User authentication page.

**What it does**:
- Provides login form
- Handles Firebase authentication
- Redirects authenticated users
- Shows error messages
- Supports email/password login

---

#### `app/dashboard/page.tsx`
**Purpose**: Main dashboard showing all waste reports.

**What it does**:
- Displays list of waste reports from Firebase
- Shows proximity-based sorting
- Provides filters and search
- Shows statistics (total reports, confidence metrics)
- Integrates with map component
- Handles report selection and details

---

#### `app/report/page.tsx`
**Purpose**: Page for creating new waste reports.

**What it does**:
- Provides image upload interface
- Captures or allows manual location input
- Sends image to ML API for classification
- Displays classification results
- Saves report to Firebase
- Shows upload progress
- Handles errors gracefully

---

#### `app/analytics/page.tsx`
**Purpose**: Analytics and insights page.

**What it does**:
- Displays waste type distribution charts
- Shows trends over time
- Provides statistics and metrics
- Visualizes cleanup progress
- May include export functionality

---

#### `app/help/page.tsx`
**Purpose**: Help and documentation page.

**What it does**:
- Provides user guide
- Shows FAQ section
- Explains features
- Provides contact information

---

### Components (`web-platform/components/`)

#### `components/WasteMap.tsx`
**Purpose**: Interactive map component showing waste locations.

**What it does**:
- Renders Leaflet map with markers
- Displays waste report locations
- Shows marker clustering for multiple reports
- Provides popup information on marker click
- Supports zoom and pan
- Integrates with drift analysis layer
- Handles location permissions

---

#### `components/WasteDetectionModal.tsx`
**Purpose**: Modal component for waste detection workflow.

**What it does**:
- Provides image upload interface
- Shows camera capture option
- Displays classification results
- Shows confidence scores
- Allows location selection
- Handles form submission
- Provides preview of uploaded image

---

#### `components/NGOCleanupPlanner.tsx`
**Purpose**: Component for planning cleanup operations.

**What it does**:
- Displays cleanup suggestions
- Shows route optimization
- Provides scheduling interface
- Integrates with map for planning
- May include resource allocation

---

#### `components/DriftLayer.tsx`
**Purpose**: Map layer showing predicted waste drift paths.

**What it does**:
- Visualizes predicted waste movement
- Uses wind and current data
- Shows drift paths on map
- Updates predictions over time
- Integrates with weather API

---

#### `components/Sidebar.tsx`
**Purpose**: Navigation sidebar component.

**What it does**:
- Provides navigation links
- Shows user information
- Includes theme toggle
- Handles mobile menu
- Shows active route highlighting

---

#### `components/ThemeProvider.tsx`
**Purpose**: Theme context provider for dark/light mode.

**What it does**:
- Manages theme state
- Provides theme toggle functionality
- Persists theme preference
- Detects system preference
- Applies theme to all components

---

#### `components/ModeToggle.tsx`
**Purpose**: Button component for toggling dark/light mode.

**What it does**:
- Renders toggle button
- Updates theme on click
- Shows current theme icon
- Provides visual feedback

---

#### `components/LoadingSpinner.tsx`
**Purpose**: Loading indicator component.

**What it does**:
- Displays animated spinner
- Used during API calls
- Shows processing state
- Provides visual feedback

---

#### `components/Tooltip.tsx`
**Purpose**: Tooltip component for additional information.

**What it does**:
- Shows hover information
- Provides context help
- Displays on demand
- Positioned dynamically

---

#### `components/ui/` (UI Primitives)
**Purpose**: Reusable UI component library.

**Files**:
- `card.tsx`: Card container component
- `breadcrumb.tsx`: Breadcrumb navigation
- `separator.tsx`: Visual separator component

These are built on Radix UI primitives for accessibility.

---

### Library Files (`web-platform/lib/`)

#### `lib/api.ts`
**Purpose**: API client utilities for ML service communication.

**What it does**:
- Provides `getApiUrl()` function
- Automatically detects API URL based on current hostname
- Works across different networks (localhost, LAN, production)
- Handles environment variable configuration
- Ensures frontend and backend use same hostname

---

#### `lib/firebase.ts`
**Purpose**: Firebase client configuration and initialization.

**What it does**:
- Initializes Firebase app with credentials
- Configures authentication
- Sets up Realtime Database connection
- Configures Storage bucket
- Exports Firebase services (auth, db, storage)

---

#### `lib/utils.ts`
**Purpose**: Utility functions and helpers.

**What it does**:
- Provides common utility functions
- Includes `cn()` for className merging
- Date formatting helpers
- Data transformation functions
- Validation utilities

---

#### `lib/weather.ts`
**Purpose**: Weather API integration for drift analysis.

**What it does**:
- Fetches weather data from Open-Meteo API
- Gets wind speed and direction
- Retrieves ocean current data
- Calculates drift predictions
- Caches weather data

---

## 📊 Machine Learning Files

### Model Files

#### `tf_files/retrained_graph.pb`
**Purpose**: TensorFlow frozen graph of the retrained model.

**What it contains**:
- Complete neural network architecture
- Trained weights for waste classification
- Inception v3 base with custom top layer
- Optimized for inference

---

#### `tf_files/retrained_labels.txt`
**Purpose**: Text file containing waste category labels.

**What it contains**:
- One label per line
- Categories: plastic, glass, metal, paper, cardboard, trash
- Order matches model output indices

---

#### `tf_files/bottlenecks/`
**Purpose**: Cached bottleneck features for training images.

**What it contains**:
- Pre-computed feature vectors
- Organized by waste category
- Speeds up training process
- Generated during retraining

---

#### `tf_files/training_summaries/`
**Purpose**: TensorBoard summary logs for training visualization.

**What it contains**:
- Training loss curves
- Validation accuracy metrics
- Model graph visualization
- Can be viewed with TensorBoard

---

### Training Data

#### `training_dataset/`
**Purpose**: Training images organized by waste category.

**Structure**:
```
training_dataset/
├── plastic/
├── glass/
├── metal/
├── paper/
├── cardboard/
└── trash/
```

**What it contains**:
- Labeled images for each waste type
- Used for model retraining
- Should have balanced distribution
- Images should be diverse and representative

---

### Inception Model

#### `inception/`
**Purpose**: Pre-trained Inception v3 model files.

**What it contains**:
- `classify_image_graph_def.pb`: Pre-trained model graph
- `imagenet_synset_to_human_label_map.txt`: ImageNet label mappings
- `imagenet_2012_challenge_label_map_proto.pbtxt`: Label protobuf
- `inception-2015-12-05.tgz`: Original model archive

**Note**: These are downloaded automatically by `retrain.py` if not present.

---

## ⚙️ Configuration & Scripts

### `requirements.txt`
**Purpose**: Python package dependencies.

**What it contains**:
- Flask and Flask-CORS for web server
- TensorFlow for ML model
- NumPy for numerical operations
- Pyrebase4 for Firebase integration
- Requests for HTTP calls
- Python-dotenv for environment variables

---

### `train.sh`
**Purpose**: Shell script to run model retraining.

**What it does**:
- Executes `retrain.py` with predefined parameters
- Sets bottleneck directory
- Configures training steps (500)
- Sets output paths
- Specifies training dataset location

**Usage**:
```bash
bash train.sh
```

---

### `start-mobile.sh`
**Purpose**: Script to start application for mobile device access.

**What it does**:
- Detects local IP address
- Displays access URLs for frontend and backend
- Checks if services are running
- Provides instructions for mobile access
- Shows QR code information

**Usage**:
```bash
bash start-mobile.sh
```

---

### `nginx.conf`
**Purpose**: Nginx reverse proxy configuration.

**What it does**:
- Configures reverse proxy for frontend (port 3000)
- Configures reverse proxy for backend (port 5000)
- Sets up CORS headers
- Handles API routing (`/api/`, `/detect`)
- Provides health check endpoint
- Enables mobile network access

**Usage**:
```bash
nginx -c nginx.conf
```

---

## 📚 Documentation Files

All documentation is located in the `doc/` folder:

### `doc/README.md`
**Purpose**: Main project documentation and overview.

---

### `doc/QUICKSTART.md`
**Purpose**: Quick start guide for developers.

---

### `doc/PROJECT_REPORT_CONTEXT.md`
**Purpose**: Project context and architecture documentation.

---

### `doc/FIREBASE_AUTH_FIX.md`
**Purpose**: Firebase authentication setup and troubleshooting.

---

### `doc/FIREBASE_STORAGE_FIX.md`
**Purpose**: Firebase Storage configuration and fixes.

---

### `doc/UI_FIXES_SUMMARY.md`
**Purpose**: Documentation of UI improvements.

---

### `doc/CODE_CLEANUP_SUMMARY.md`
**Purpose**: Code cleanup and refactoring documentation.

---

### `doc/CREATE_DEMO_USER.md`
**Purpose**: Guide for creating demo users.

---

### `doc/DEMO_CREDENTIALS.md`
**Purpose**: Demo account information (if applicable).

---

### `doc/DRIFT_ANALYSIS.md`
**Purpose**: Drift analysis feature documentation.

---

### `doc/MOBILE_ACCESS.md`
**Purpose**: Mobile access setup guide.

---

### `doc/QUICK_START_MOBILE.md`
**Purpose**: Quick start guide for mobile access.

---

### `doc/PRESENTATION_CHECKLIST.md`
**Purpose**: Checklist for project presentations.

---

### `doc/PRESENTATION_FLOW.md`
**Purpose**: Presentation flow and structure guide.

---

### `doc/TROUBLESHOOTING.md`
**Purpose**: Common issues and solutions.

---

### `doc/MOBILE_RESPONSIVE_IMPROVEMENTS.md`
**Purpose**: Mobile responsive design improvements.

---

### `doc/SECTIONS_GUIDE.md`
**Purpose**: Guide for project sections.

---

## 🗄️ Other Files

### `index.html`
**Purpose**: Legacy HTML file (if present, may be from old version).

---

### `testing.png`
**Purpose**: Test image for classification testing.

---

### `write_test.png`
**Purpose**: Another test image file.

---

### `training_log.txt`
**Purpose**: Training log output from model retraining.

---

### `venv/`
**Purpose**: Python virtual environment directory.

**What it contains**:
- Isolated Python packages
- Should not be committed to git
- Created with `python3 -m venv venv`

---

### `__pycache__/`
**Purpose**: Python bytecode cache directory.

**What it contains**:
- Compiled `.pyc` files
- Automatically generated
- Should not be committed to git

---

## 🔄 Data Flow

### Image Classification Flow:
1. User uploads image → `app/report/page.tsx`
2. Image sent to API → `lib/api.ts` → `app.py` → `/detect` endpoint
3. Classification → `waste_classifier.py` → TensorFlow model
4. Results returned → JSON response → Frontend
5. Data saved → `firebase.py` → Firebase Realtime Database
6. Dashboard updates → `app/dashboard/page.tsx` → Firebase listener

### Model Training Flow:
1. Prepare dataset → `training_dataset/` organized by category
2. Run training → `train.sh` → `retrain.py`
3. Generate bottlenecks → `tf_files/bottlenecks/`
4. Train model → TensorFlow training loop
5. Save model → `tf_files/retrained_graph.pb` and `retrained_labels.txt`
6. Deploy → Update `config.py` model paths

---

## 🚀 Getting Started

1. **Backend Setup**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python app.py
   ```

2. **Frontend Setup**:
   ```bash
   cd web-platform
   npm install
   npm run dev
   ```

3. **Model Training** (optional):
   ```bash
   bash train.sh
   ```

---

## 📝 Notes

- All sensitive configuration should use environment variables
- Firebase credentials should never be committed
- Model files are large and may need Git LFS
- Training requires significant computational resources
- Mobile access requires both services running and network configuration

---

## 🔗 Related Documentation

- See `README.md` for project overview
- See `doc/` folder for detailed guides
- See `requirements.txt` for Python dependencies
- See `web-platform/package.json` for Node.js dependencies

---

**Last Updated**: 2024
**Project**: Ocean Waste Detection Platform
**Version**: 1.0

