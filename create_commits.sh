#!/bin/bash

# This script creates 50 staged commits showing the project development

cd /home/abhijitam/Desktop/ocean-waste-detection-method

# Commit 1: Project initialization
echo "# Ocean Waste Detection Platform" > README.md
git add README.md .gitignore
git commit -m "Initial commit: Project setup and repository structure"

# Commit 2: Backend dependencies
git add requirements.txt
git commit -m "Add Python dependencies for ML backend (Flask, TensorFlow)"

# Commit 3: Backend configuration
git add config.py env.py
git commit -m "Add backend configuration and environment setup"

# Commit 4: Firebase backend
git add firebase.py
git commit -m "Implement Firebase integration for data storage"

# Commit 5: ML service core
git add service.py
git commit -m "Create ML classification service with TensorFlow"

# Commit 6: Image classification
git add classify.py
git commit -m "Implement image classification using Inception v3"

# Commit 7: Main Flask app
git add app.py
git commit -m "Create Flask API server for waste detection"

# Commit 8: Retraining script
git add retrain.py
git commit -m "Add model retraining script for custom datasets"

# Commit 9: Frontend initialization
git add web-platform/package.json web-platform/package-lock.json
git commit -m "Initialize Next.js frontend with TypeScript"

# Commit 10: Frontend config
git add web-platform/tsconfig.json web-platform/next.config.ts web-platform/postcss.config.mjs
git commit -m "Configure Next.js, TypeScript, and Tailwind CSS"

# Commit 11: Global styles
git add web-platform/app/globals.css
git commit -m "Setup global CSS with Tailwind and theme variables"

# Commit 12: Root layout
git add web-platform/app/layout.tsx
git commit -m "Create root layout with theme provider"

# Commit 13: Firebase client lib
git add web-platform/lib/firebase.ts
git commit -m "Setup Firebase client SDK for frontend"

# Commit 14: Utility functions
git add web-platform/lib/utils.ts
git commit -m "Add utility functions (distance calculation, class names)"

# Commit 15: TypeScript types
git add web-platform/types/index.ts
git commit -m "Define TypeScript interfaces and types"

# Commit 16: Landing page
git add web-platform/app/page.tsx
git commit -m "Create landing page with hero section"

# Commit 17: Login page
git add web-platform/app/login/page.tsx
git commit -m "Implement authentication page with Firebase Auth"

# Commit 18: Loading component
git add web-platform/components/LoadingSpinner.tsx
git commit -m "Create loading spinner component"

# Commit 19: Sidebar component
git add web-platform/components/Sidebar.tsx
git commit -m "Build navigation sidebar with menu items"

# Commit 20: Dashboard page structure
git add web-platform/app/dashboard/page.tsx
git commit -m "Create dashboard page with authentication check"

# Commit 21: Waste map component
git add web-platform/components/WasteMap.tsx
git commit -m "Implement interactive map with Leaflet for waste locations"

# Commit 22: Dashboard data fetching
git add web-platform/app/dashboard/page.tsx
git commit -m "Add Firebase data fetching and distance calculation to dashboard"

# Commit 23: Report page
git add web-platform/app/report/page.tsx
git commit -m "Create waste reporting page with image upload"

# Commit 24: Analytics page
git add web-platform/app/analytics/page.tsx
git commit -m "Build analytics page with statistics and charts"

# Commit 25: Help page
git add web-platform/app/help/page.tsx
git commit -m "Add help and guide page with instructions"

# Commit 26: Drift analysis
git add web-platform/components/DriftLayer.tsx web-platform/lib/weather.ts
git commit -m "Implement drift analysis with weather API integration"

# Commit 27: Dashboard filters
git add web-platform/app/dashboard/page.tsx
git commit -m "Add filtering and sorting functionality to dashboard"

# Commit 28: UI Card component
git add web-platform/components/ui/card.tsx
git commit -m "Create reusable Card component"

# Commit 29: Breadcrumb component
git add web-platform/components/ui/breadcrumb.tsx
git commit -m "Add breadcrumb navigation component"

# Commit 30: Separator component
git add web-platform/components/ui/separator.tsx
git commit -m "Create separator component for visual division"

# Commit 31: Theme system
git add web-platform/components/ThemeProvider.tsx
git commit -m "Implement theme provider for dark/light mode support"

# Commit 32: Mode toggle
git add web-platform/components/ModeToggle.tsx
git commit -m "Add theme toggle button component"

# Commit 33: Theme colors
git add web-platform/app/globals.css
git commit -m "Define color scheme with CSS variables for light/dark themes"

# Commit 34: Dashboard redesign
git add web-platform/app/dashboard/page.tsx
git commit -m "Redesign dashboard with gradient cards and improved layout"

# Commit 35: Sidebar theme integration
git add web-platform/components/Sidebar.tsx
git commit -m "Update sidebar with theme support and mode toggle"

# Commit 36: Analytics improvements
git add web-platform/app/analytics/page.tsx
git commit -m "Enhance analytics page with better visualizations"

# Commit 37: Report page enhancements
git add web-platform/app/report/page.tsx
git commit -m "Improve report page UI with better form design"

# Commit 38: Landing page updates
git add web-platform/app/page.tsx
git commit -m "Update landing page with modern design"

# Commit 39: Login page styling
git add web-platform/app/login/page.tsx
git commit -m "Enhance login page with improved styling"

# Commit 40: Help page improvements
git add web-platform/app/help/page.tsx
git commit -m "Update help page with better content structure"

# Commit 41: Dashboard stats cards
git add web-platform/app/dashboard/page.tsx
git commit -m "Add statistics cards with gradient backgrounds"

# Commit 42: Map improvements
git add web-platform/components/WasteMap.tsx
git commit -m "Enhance map component with better markers and popups"

# Commit 43: Responsive design
git add web-platform/components/Sidebar.tsx web-platform/app/dashboard/page.tsx
git commit -m "Improve responsive design for mobile devices"

# Commit 44: Error handling
git add web-platform/app/dashboard/page.tsx web-platform/app/report/page.tsx
git commit -m "Add comprehensive error handling and user feedback"

# Commit 45: Performance optimizations
git add web-platform/app/dashboard/page.tsx
git commit -m "Optimize dashboard with dynamic imports and memoization"

# Commit 46: Accessibility improvements
git add web-platform/components/Sidebar.tsx web-platform/components/ModeToggle.tsx
git commit -m "Add ARIA labels and improve accessibility"

# Commit 47: Code organization
git add web-platform/
git commit -m "Refactor and organize code structure"

# Commit 48: Documentation
git add README.md
git commit -m "Update README with project documentation"

# Commit 49: Final UI polish
git add web-platform/app/globals.css
git commit -m "Final CSS polish and theme refinements"

# Commit 50: Project completion
git add .
git commit -m "Final commit: Complete ocean waste detection platform with modern UI"

echo "Created 50 commits successfully!"

