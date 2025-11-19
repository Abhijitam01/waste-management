/**
 * Get the API URL for the ML service
 * Automatically detects the current host and uses appropriate URL
 * Works from any IP/network - uses the same hostname as the frontend
 */
export function getApiUrl(): string {
  // If explicitly set in environment, use that
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // If running in browser, use current hostname with port 5000
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // Always use the same hostname as the frontend
    // This makes it work from any IP/network automatically
    return `${protocol}//${hostname}:5000`;
  }

  // Fallback for server-side
  return 'http://localhost:5000';
}

