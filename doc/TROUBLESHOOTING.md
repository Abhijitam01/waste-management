# Troubleshooting Guide

## Common Errors and Solutions

### 1. CORS Error: "Cross-Origin Request Blocked"

**Error Message:**
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at http://localhost:5000/detect
```

**Solution:**

1. **Ensure Flask backend is running:**
   ```bash
   cd /home/abhijitam/Desktop/ocean-waste-detection-method
   python3 app.py
   ```
   Or if using a virtual environment:
   ```bash
   source venv/bin/activate
   python app.py
   ```

2. **Install flask-cors if not installed:**
   ```bash
   pip install flask-cors
   ```
   Or install all requirements:
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify the backend is accessible:**
   - Open browser and go to: `http://localhost:5000/status`
   - You should see: `{"status": "running", "service": "OceanCleanup ML Service", "model_loaded": true}`

4. **Check environment variable:**
   - In `web-platform/.env.local` or `.env`, ensure:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:5000
     ```

5. **If still having issues, check firewall/port:**
   - Ensure port 5000 is not blocked
   - Try accessing `http://127.0.0.1:5000/status` instead

### 2. Geolocation Errors

**Error Message:**
```
GeolocationPositionError { code: 2, message: "Unknown error acquiring position" }
```

**Solution:**

This is **expected behavior** and has been handled:

1. **Automatic Fallback:** When GPS fails, the app automatically shows an address input field
2. **Manual Entry:** Users can enter an address (e.g., "Mumbai, India") and the system will geocode it
3. **No Action Needed:** The errors are now suppressed in the console and won't affect functionality

**To use manual address entry:**
- Click "Get Current Location"
- If it fails, an address input will appear
- Enter address and click "Find"
- Coordinates will be automatically converted and saved

### 3. Font Preload Warning

**Warning Message:**
```
The resource at "...woff2" preloaded with link preload was not used within a few seconds
```

**Solution:**
- This is a **harmless warning** from Next.js
- It doesn't affect functionality
- Can be safely ignored
- Related to font optimization and doesn't impact the app

### 4. Scroll Behavior Warning

**Warning Message:**
```
Detected `scroll-behavior: smooth` on the `<html>` element. To disable smooth scrolling during route transitions...
```

**Solution:**
- ✅ **Already Fixed:** Added `data-scroll-behavior="smooth"` to the HTML element
- This warning should no longer appear
- If it does, it's harmless and doesn't affect functionality

## Quick Start Checklist

Before using the app, ensure:

- [ ] Flask backend is running on port 5000
- [ ] `flask-cors` is installed (`pip install flask-cors`)
- [ ] ML model files are in `tf_files/` directory
- [ ] Firebase credentials are configured in `.env.local`
- [ ] Next.js dev server is running (`npm run dev` in `web-platform/`)

## Testing the Backend

1. **Check if backend is running:**
   ```bash
   curl http://localhost:5000/status
   ```
   Should return: `{"status":"running",...}`

2. **Test CORS:**
   ```bash
   curl -X OPTIONS http://localhost:5000/detect \
     -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -v
   ```
   Should include CORS headers in response

## Environment Variables

Create `web-platform/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Still Having Issues?

1. **Check browser console** for specific error messages
2. **Verify both servers are running:**
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:3000`
3. **Check network tab** in browser dev tools to see request/response details
4. **Restart both servers** if changes were made

