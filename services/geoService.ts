export interface GeoData {
  ip: string;
  city: string;
  region: string;
  country: string;
  postal: string;
  timezone: string;
}

/**
 * Fetches geolocation data based on the current user's IP address.
 * Uses ipapi.co (Free tier)
 */
export async function getGeoData(): Promise<GeoData | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch geo data');
    const data = await response.json();
    
    return {
      ip: data.ip || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      country: data.country_name || 'Unknown',
      postal: data.postal || 'Unknown',
      timezone: data.timezone || 'UTC'
    };
  } catch (error) {
    console.error('GeoData lookup failed:', error);
    return null;
  }
}

/**
 * Helper to mask IP address for privacy
 */
export function maskIp(ip: string): string {
  if (!ip || ip === 'Unknown') return 'N/A';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.X.X`;
  }
  return ip;
}
