# ✅ Presentation Checklist

## Pre-Presentation Setup

### 1. Backend Service
- [ ] Start ML service: `python app.py`
- [ ] Verify it's running on `http://localhost:5000`
- [ ] Test endpoint: `curl http://localhost:5000/status`

### 2. Frontend
- [ ] Install dependencies: `cd web-platform && npm install`
- [ ] Start dev server: `npm run dev`
- [ ] Verify it's running on `http://localhost:3000`
- [ ] Check browser console for errors

### 3. Firebase
- [ ] Verify Firebase credentials in `.env.local`
- [ ] Test database connection (should see reports)
- [ ] Test storage connection (should upload images)
- [ ] Check Firebase console for data

### 4. Test Data
- [ ] Create at least 3-5 sample reports
- [ ] Ensure reports have different types (plastic, glass, etc.)
- [ ] Ensure reports have images
- [ ] Ensure reports are in different locations

### 5. Browser
- [ ] Use Chrome or Firefox (best compatibility)
- [ ] Clear cache if needed
- [ ] Check browser console is clear of errors
- [ ] Test in incognito mode to verify fresh state

---

## Button Functionality Test

### Dashboard Buttons
- [ ] "Detect Waste Now" → Opens modal
- [ ] "Filters" → Toggles filter panel
- [ ] Filter type buttons → Filter reports correctly
- [ ] Sort buttons → Sort reports correctly
- [ ] "Show Drift" → Shows drift lines on map
- [ ] "Hide Drift" → Hides drift lines
- [ ] Report cards → Center map on location
- [ ] "Open Cleanup Planner" → Opens planner
- [ ] "Hide Planner" → Closes planner
- [ ] Planner timeframe buttons (24h/48h/72h) → Change timeframe
- [ ] Planner sort buttons → Sort recommendations
- [ ] Planner recommendations → Center map on predicted location

### Sidebar
- [ ] Mobile toggle (hamburger) → Opens/closes sidebar
- [ ] Overlay click → Closes sidebar on mobile
- [ ] Dashboard link → Navigates to dashboard
- [ ] Report Waste link → Navigates to report page
- [ ] Analytics link → Navigates to analytics
- [ ] Help link → Navigates to help
- [ ] Logout button → Signs out and redirects

### Waste Detection Modal
- [ ] File upload → Shows preview
- [ ] "Get Current Location" → Gets GPS coordinates
- [ ] "Find" (address) → Geocodes address
- [ ] "Change" (location) → Resets location
- [ ] "Detect & Save Waste" → Submits report
- [ ] "Detect Another" → Resets form
- [ ] Close (X) → Closes modal

### Report Page
- [ ] File upload → Shows preview
- [ ] "Get Current Location" → Gets GPS coordinates
- [ ] "Find" (address) → Geocodes address
- [ ] "Submit Report" → Submits report
- [ ] "Report Another" → Resets form
- [ ] "View Dashboard" → Navigates to dashboard
- [ ] "← Back to Home" → Returns to home

---

## Feature Functionality Test

### Real-time Updates
- [ ] New report appears automatically on dashboard
- [ ] Statistics update automatically
- [ ] Map updates with new markers
- [ ] Reports list updates

### Drift Analysis
- [ ] Click "Show Drift" → Drift lines appear (wait 5-10 seconds)
- [ ] Drift speed markers show on map
- [ ] Click drift marker → Shows popup with speed info
- [ ] Click arrow markers → Shows predicted positions
- [ ] Popups show correct data (wind, current, speed)

### NGO Cleanup Planner
- [ ] Opens without errors
- [ ] Shows loading state while calculating
- [ ] Displays recommendations with priority colors
- [ ] Timeframe buttons work (24h/48h/72h)
- [ ] Sort buttons work (Urgency/Speed/Distance)
- [ ] Click recommendation → Centers map on location
- [ ] Shows drift speeds correctly
- [ ] Shows urgency scores correctly

### Search & Filter
- [ ] Search bar filters reports
- [ ] Filter buttons filter by type
- [ ] Sort buttons sort correctly
- [ ] Multiple filters work together

### Map
- [ ] Map loads without errors
- [ ] Markers show correct colors by type
- [ ] Click marker → Shows popup with details
- [ ] Map centers on location when clicking report
- [ ] Map centers on predicted location from planner

---

## Layout & Responsiveness Test

### Desktop (>= 1024px)
- [ ] Sidebar is visible and open
- [ ] Main content has proper margin (lg:ml-72)
- [ ] All sections fit on screen
- [ ] Planner doesn't overlap sidebar
- [ ] Map is visible and interactive

### Mobile (< 1024px)
- [ ] Sidebar is hidden by default
- [ ] Hamburger menu appears
- [ ] Click hamburger → Sidebar opens
- [ ] Click overlay → Sidebar closes
- [ ] Content is full width
- [ ] All buttons are accessible
- [ ] Map is responsive

---

## Error Handling Test

### Network Errors
- [ ] ML service down → Shows error but saves report
- [ ] Firebase down → Shows error message
- [ ] No internet → Shows appropriate error

### User Errors
- [ ] No image selected → Button disabled
- [ ] No location → Button disabled
- [ ] Invalid image → Shows error
- [ ] Invalid address → Shows error

---

## Performance Test

- [ ] Page loads in < 3 seconds
- [ ] Map loads in < 5 seconds
- [ ] Drift analysis loads in < 10 seconds (depends on API)
- [ ] Planner calculations complete in < 15 seconds
- [ ] No lag when clicking buttons
- [ ] Smooth animations

---

## Final Verification

- [ ] All buttons work
- [ ] All links work
- [ ] All forms submit correctly
- [ ] Real-time updates work
- [ ] Drift analysis works
- [ ] NGO planner works
- [ ] Sidebar works on mobile and desktop
- [ ] No console errors
- [ ] No visual glitches
- [ ] Everything is responsive

---

## Quick Fixes if Something Breaks

### If buttons don't work:
1. Check browser console for errors
2. Refresh the page
3. Clear browser cache
4. Check if backend is running

### If map doesn't load:
1. Check internet connection
2. Check browser console
3. Try different browser
4. Check Leaflet CSS is loaded

### If drift doesn't show:
1. Wait 10-15 seconds (API calls take time)
2. Check internet connection
3. Check browser console
4. Try refreshing

### If reports don't appear:
1. Check Firebase connection
2. Check browser console
3. Verify database has data
4. Check Firebase rules

### If planner doesn't open:
1. Check browser console
2. Wait for calculations to complete
3. Try refreshing
4. Check if reports exist

---

## Presentation Tips

1. **Start with backend running** - Don't forget `python app.py`
2. **Have sample data ready** - Create reports before presentation
3. **Test drift analysis** - It needs internet, test beforehand
4. **Use Chrome** - Best compatibility
5. **Full screen** - Use F11 for full screen mode
6. **Have backup plan** - Screenshots if live demo fails
7. **Practice flow** - Run through once before presentation
8. **Check internet** - Drift analysis needs internet

---

## Success Criteria

✅ All buttons work
✅ All features functional
✅ No errors in console
✅ Smooth user experience
✅ Responsive on mobile and desktop
✅ Real-time updates work
✅ Drift analysis works
✅ NGO planner works
✅ Sidebar works properly

---

**Last Updated**: Before presentation
**Status**: Ready for presentation ✅

