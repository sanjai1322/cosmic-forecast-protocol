
import axios from 'axios';

// API endpoints
const NOAA_SOLAR_WIND_API = 'https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json';
const NOAA_ALERTS_API = 'https://services.swpc.noaa.gov/json/alerts.json';
const NASA_DONKI_API = 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/CME';

// Types
export interface SolarWindData {
  time_tag: string;
  density: number;
  speed: number;
  temperature: number;
  bx: number;
  by: number;
  bz: number;
  bt: number;
  lat: number;
  lon: number;
  status: number;
}

export interface SpaceWeatherAlert {
  messageType: string;
  messageID: string;
  issueTime: string;
  alertSerial: string;
  message: string;
  products: any[];
}

export interface CMEEvent {
  activityID: string;
  catalog: string;
  startTime: string;
  sourceLocation: string;
  activeRegionNum: number;
  link: string;
  note: string;
  instruments: string[];
  cmeAnalyses: any[];
}

// Fetch real-time solar wind data
export const fetchSolarWindData = async (): Promise<SolarWindData[]> => {
  try {
    const response = await axios.get(NOAA_SOLAR_WIND_API);
    return response.data;
  } catch (error) {
    console.error('Error fetching solar wind data:', error);
    return [];
  }
};

// Fetch space weather alerts
export const fetchSpaceWeatherAlerts = async (): Promise<SpaceWeatherAlert[]> => {
  try {
    const response = await axios.get(NOAA_ALERTS_API);
    return response.data;
  } catch (error) {
    console.error('Error fetching space weather alerts:', error);
    return [];
  }
};

// Fetch NASA DONKI CME events
export const fetchCMEEvents = async (startDate: string, endDate: string): Promise<CMEEvent[]> => {
  try {
    const response = await axios.get(`${NASA_DONKI_API}?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching CME events:', error);
    return [];
  }
};

// Get the most recent solar wind data
export const getMostRecentSolarWindData = async (): Promise<SolarWindData | null> => {
  const data = await fetchSolarWindData();
  return data.length > 0 ? data[0] : null;
};

// Process solar wind data for our application's needs
export const processSolarWindData = (data: SolarWindData | null) => {
  if (!data) return null;
  
  // Calculate activity level based on solar wind parameters
  const activityLevel = calculateActivityLevel(data);
  
  return {
    timestamp: data.time_tag,
    solarWindSpeed: data.speed,
    solarWindDensity: data.density,
    magneticFieldBz: data.bz,
    xRayFlux: 2.3e-6, // Default value as it's not in the solar wind data
    kpIndex: calculateKpIndex(data),
    activityLevel
  };
};

// Calculate Kp index from solar wind parameters (simplified estimation)
const calculateKpIndex = (data: SolarWindData): number => {
  // This is a simplified estimation - in reality, Kp is derived from ground-based magnetometers
  const bz = Math.abs(data.bz);
  const speed = data.speed;
  
  let kpEstimate = 1;
  
  if (speed > 500) kpEstimate += 1;
  if (speed > 700) kpEstimate += 2;
  
  if (bz > 5) kpEstimate += 1;
  if (bz > 10) kpEstimate += 2;
  if (bz > 15) kpEstimate += 3;
  
  return Math.min(9, kpEstimate);
};

// Calculate solar activity level based on solar wind parameters
const calculateActivityLevel = (data: SolarWindData): 'low' | 'moderate' | 'high' | 'severe' => {
  const kp = calculateKpIndex(data);
  
  if (kp >= 7) return 'severe';
  if (kp >= 5) return 'high';
  if (kp >= 3) return 'moderate';
  return 'low';
};
