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
