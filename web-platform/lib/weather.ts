export interface WindData {
  speed: number; // m/s
  direction: number; // degrees
  lat: number;
  lng: number;
}

export interface OceanCurrentData {
  velocity: number; // m/s
  direction: number; // degrees
  lat: number;
  lng: number;
}

export async function getWindData(lat: number, lng: number): Promise<WindData | null> {
  try {
    // Using Open-Meteo (free, no API key needed)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=wind_speed_10m,wind_direction_10m`
    );
    const data = await response.json();
    
    if (data.current) {
      return {
        speed: data.current.wind_speed_10m / 3.6, // Convert km/h to m/s
        direction: data.current.wind_direction_10m,
        lat,
        lng,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching wind data:', error);
    return null;
  }
}

export async function getOceanCurrentData(lat: number, lng: number): Promise<OceanCurrentData | null> {
  try {
    // Using Open-Meteo Marine API (free)
    const response = await fetch(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=ocean_current_velocity,ocean_current_direction`
    );
    const data = await response.json();
    
    if (data.current) {
      return {
        velocity: data.current.ocean_current_velocity || 0,
        direction: data.current.ocean_current_direction || 0,
        lat,
        lng,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching ocean current data:', error);
    return null;
  }
}

export interface DriftSpeed {
  speed: number; // m/s
  speedKmh: number; // km/h
  direction: number; // degrees
  windContribution: number; // m/s
  currentContribution: number; // m/s
}

/**
 * Calculate the drift speed and direction based on wind and ocean currents
 */
export function calculateDriftSpeed(
  windSpeed: number,
  windDirection: number,
  currentVelocity: number,
  currentDirection: number
): DriftSpeed {
  // Convert wind and current to velocity components
  const windRadians = (windDirection * Math.PI) / 180;
  const currentRadians = (currentDirection * Math.PI) / 180;
  
  // Wind factor (10% of wind speed affects surface drift)
  const windFactor = 0.1;
  const windVelocity = windSpeed * windFactor;
  
  // Calculate velocity components
  const windVelocityX = windVelocity * Math.sin(windRadians);
  const windVelocityY = windVelocity * Math.cos(windRadians);
  const currentVelocityX = currentVelocity * Math.sin(currentRadians);
  const currentVelocityY = currentVelocity * Math.cos(currentRadians);
  
  // Total velocity components
  const totalVelocityX = windVelocityX + currentVelocityX;
  const totalVelocityY = windVelocityY + currentVelocityY;
  
  // Calculate total drift speed (magnitude)
  const totalSpeed = Math.sqrt(totalVelocityX * totalVelocityX + totalVelocityY * totalVelocityY);
  
  // Calculate drift direction (in degrees, 0-360)
  let driftDirection = (Math.atan2(totalVelocityX, totalVelocityY) * 180) / Math.PI;
  if (driftDirection < 0) {
    driftDirection += 360;
  }
  
  // Calculate contributions
  const windContribution = windVelocity;
  const currentContribution = currentVelocity;
  
  return {
    speed: totalSpeed, // m/s
    speedKmh: totalSpeed * 3.6, // km/h
    direction: driftDirection,
    windContribution,
    currentContribution,
  };
}

export function calculateDriftPosition(
  currentLat: number,
  currentLng: number,
  windSpeed: number,
  windDirection: number,
  currentVelocity: number,
  currentDirection: number,
  hours: number = 24
): { lat: number; lng: number } {
  // Simple drift calculation
  // Convert wind and current to velocity components
  const windRadians = (windDirection * Math.PI) / 180;
  const currentRadians = (currentDirection * Math.PI) / 180;
  
  // Wind factor (10% of wind speed affects surface drift)
  const windFactor = 0.1;
  const windVelocity = windSpeed * windFactor;
  
  // Calculate total velocity components
  const totalVelocityX = 
    windVelocity * Math.sin(windRadians) + 
    currentVelocity * Math.sin(currentRadians);
  const totalVelocityY = 
    windVelocity * Math.cos(windRadians) + 
    currentVelocity * Math.cos(currentRadians);
  
  // Calculate displacement in meters
  const displacementX = totalVelocityX * hours * 3600; // seconds
  const displacementY = totalVelocityY * hours * 3600;
  
  // Convert to lat/lng (approximate)
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 111320 * Math.cos((currentLat * Math.PI) / 180);
  
  const newLat = currentLat + (displacementY / metersPerDegreeLat);
  const newLng = currentLng + (displacementX / metersPerDegreeLng);
  
  return { lat: newLat, lng: newLng };
}

/**
 * Calculate predicted position with drift speed information
 */
export function calculateDriftWithSpeed(
  currentLat: number,
  currentLng: number,
  windSpeed: number,
  windDirection: number,
  currentVelocity: number,
  currentDirection: number,
  hours: number = 24
): { lat: number; lng: number; driftSpeed: DriftSpeed; distance: number } {
  const driftSpeed = calculateDriftSpeed(windSpeed, windDirection, currentVelocity, currentDirection);
  const position = calculateDriftPosition(currentLat, currentLng, windSpeed, windDirection, currentVelocity, currentDirection, hours);
  
  // Calculate distance traveled in meters
  const distance = driftSpeed.speed * hours * 3600; // meters
  
  return {
    ...position,
    driftSpeed,
    distance,
  };
}
