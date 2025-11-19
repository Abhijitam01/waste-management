# Drift Analysis Feature - Implementation Guide

## Overview
The drift analysis feature predicts how ocean waste will move based on real-time wind and ocean current data. This helps NGOs plan strategic cleanup operations by anticipating where waste will drift over the next 24-72 hours.

## How It Works

### 1. Data Sources (Free APIs)
- **Wind Data**: Open-Meteo Weather API
  - Provides wind speed and direction at 10m height
  - No API key required
  - Updates hourly
  
- **Ocean Currents**: Open-Meteo Marine API
  - Provides ocean current velocity and direction
  - No API key required
  - Marine-specific data

### 2. Drift Calculation
The system uses a simplified physics model:

```
Total Drift = (Wind Effect × 10%) + Ocean Current Effect
```

**Wind Factor**: 10% of wind speed affects surface drift (standard oceanographic approximation)

**Time Predictions**: 24, 48, and 72 hours into the future

**Formula**:
- Convert wind/current to velocity components (X, Y)
- Calculate displacement over time
- Convert meters to lat/lng coordinates

### 3. Visualization
- **Dashed Blue Lines**: Show predicted drift path
- **Arrow Markers**: Indicate direction and time intervals
- **Popups**: Display wind speed, current velocity, and prediction time

## Usage

### On Dashboard
1. Navigate to `/dashboard`
2. Click "Show Drift Analysis" button (top-right of map)
3. Wait for drift lines to appear (fetches weather data)
4. Click arrow markers to see prediction details
5. Click "Hide Drift Analysis" to remove visualization

### Technical Details

**Performance Optimization**:
- Limited to 20 waste reports (prevents API rate limiting)
- Caches drift lines until toggle changes
- Removes layers when disabled

**API Calls**:
- 2 API calls per waste location (wind + current)
- Max 40 API calls when drift is enabled
- Free tier limits: 10,000 calls/day (Open-Meteo)

## Files Created

### `/lib/weather.ts`
- `getWindData()`: Fetches wind data for coordinates
- `getOceanCurrentData()`: Fetches ocean current data
- `calculateDriftPosition()`: Physics-based drift calculation

### `/components/DriftLayer.tsx`
- React component for Leaflet map
- Manages drift line rendering
- Handles API calls and state

### Updated Files
- `/components/WasteMap.tsx`: Added `showDrift` prop and DriftLayer integration
- `/app/dashboard/page.tsx`: Added drift toggle button and state management

## Example Output

When drift analysis is enabled, you'll see:
```
Waste Location (Plastic)
  ↓ (24h drift)
  → Predicted Position
  ↓ (48h drift)
  → Predicted Position
  ↓ (72h drift)
  → Predicted Position
```

## Limitations

1. **Simplified Model**: Real ocean drift is more complex (Coriolis effect, depth, debris type)
2. **Surface Only**: Assumes waste floats on surface
3. **Static Conditions**: Uses current weather, doesn't predict weather changes
4. **Coastal Effects**: Doesn't account for coastline, reefs, or obstacles

## Future Enhancements

- **Historical Tracking**: Show where waste has been
- **Confidence Intervals**: Display prediction uncertainty
- **Multiple Scenarios**: Best/worst case drift paths
- **Cleanup Routing**: Suggest optimal NGO deployment based on drift
- **Alerts**: Notify NGOs when waste drifts toward sensitive areas

## Testing

To test the feature:
1. Start ML service: `python app.py`
2. Start frontend: `cd web-platform && npm run dev`
3. Login to dashboard
4. Enable drift analysis
5. Verify blue dashed lines appear from waste markers
6. Click arrows to see prediction details

## API Documentation

**Open-Meteo Weather API**:
```
https://api.open-meteo.com/v1/forecast
?latitude={lat}&longitude={lng}
&current=wind_speed_10m,wind_direction_10m
```

**Open-Meteo Marine API**:
```
https://marine-api.open-meteo.com/v1/marine
?latitude={lat}&longitude={lng}
&current=ocean_current_velocity,ocean_current_direction
```

Both APIs are free, open-source, and require no authentication.
