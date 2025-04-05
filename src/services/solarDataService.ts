
import axios from 'axios';

// API endpoints with CORS proxy to prevent browser blocking
const CORS_PROXY = 'https://corsproxy.io/?';
const NOAA_SOLAR_WIND_API = `${CORS_PROXY}https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json`;
const NOAA_ALERTS_API = `${CORS_PROXY}https://services.swpc.noaa.gov/json/alerts.json`;
const NASA_DONKI_API = `${CORS_PROXY}https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/CME`;
const NOAA_SOLAR_EVENTS_API = `${CORS_PROXY}https://services.swpc.noaa.gov/json/solar_events/last_7_days.json`;

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

export interface SolarEvent {
  event_id: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string | null;
  peak_time: string | null;
  linked_events: string[];
  active_region: {
    ar_num: number;
    latitude: string;
    longitude: string;
  };
  classifiers: {
    type: string;
    value: string;
  }[];
}

// Fetch real-time solar wind data
export const fetchSolarWindData = async (): Promise<SolarWindData[]> => {
  try {
    console.log('Fetching solar wind data...');
    const response = await axios.get(NOAA_SOLAR_WIND_API, {
      timeout: 5000 // 5 seconds timeout for better UX
    });
    console.log('Solar wind data fetched successfully');
    return response.data;
  } catch (error) {
    console.error('Error fetching solar wind data:', error);
    // Return mock data as fallback
    return generateMockSolarWindData(10);
  }
};

// Fetch space weather alerts
export const fetchSpaceWeatherAlerts = async (): Promise<SpaceWeatherAlert[]> => {
  try {
    console.log('Fetching space weather alerts...');
    const response = await axios.get(NOAA_ALERTS_API, {
      timeout: 5000
    });
    console.log('Space weather alerts fetched successfully');
    return response.data;
  } catch (error) {
    console.error('Error fetching space weather alerts:', error);
    // Return mock data as fallback
    return generateMockSpaceWeatherAlerts(4);
  }
};

// Fetch NASA DONKI CME events
export const fetchCMEEvents = async (startDate: string, endDate: string): Promise<CMEEvent[]> => {
  try {
    console.log(`Fetching CME events from ${startDate} to ${endDate}...`);
    const response = await axios.get(`${NASA_DONKI_API}?startDate=${startDate}&endDate=${endDate}`, {
      timeout: 8000
    });
    console.log('CME events fetched successfully');
    return response.data;
  } catch (error) {
    console.error('Error fetching CME events:', error);
    // Return mock data as fallback
    return generateMockCMEEvents(5);
  }
};

// Fetch solar events from NOAA
export const fetchSolarEvents = async (): Promise<SolarEvent[]> => {
  try {
    console.log('Fetching solar events...');
    const response = await axios.get(NOAA_SOLAR_EVENTS_API, {
      timeout: 5000
    });
    console.log('Solar events fetched successfully');
    return response.data;
  } catch (error) {
    console.error('Error fetching solar events:', error);
    // Return mock data as fallback
    return generateMockSolarEvents(6);
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

// Format solar events into alerts format
export const formatSolarEventsAsAlerts = async () => {
  try {
    const events = await fetchSolarEvents();
    const formattedEvents = events.slice(0, 6).map(event => {
      // Determine level based on event type
      let level: 'low' | 'moderate' | 'high' | 'severe' = 'low';
      
      if (event.event_type === 'FLR' || event.event_type === 'XRA') {
        // Check if there are classifiers and get the value
        const flareClass = event.classifiers?.find(c => c.type === 'FL_GOE')?.value || '';
        
        if (flareClass.startsWith('X')) {
          level = 'severe';
        } else if (flareClass.startsWith('M')) {
          level = 'high';
        } else if (flareClass.startsWith('C')) {
          level = 'moderate';
        }
      } else if (event.event_type === 'CME') {
        level = 'high';
      } else if (event.event_type === 'SEP' || event.event_type === 'RBE') {
        level = 'severe';
      } else if (event.event_type === 'CPS') {
        level = 'moderate';
      }
      
      // Format event description
      let eventDescription = 'Space weather event detected';
      
      if (event.event_type === 'FLR' || event.event_type === 'XRA') {
        const flareClass = event.classifiers?.find(c => c.type === 'FL_GOE')?.value || '';
        eventDescription = `${flareClass} class solar flare`;
        if (event.active_region && event.active_region.ar_num) {
          eventDescription += ` from region AR${event.active_region.ar_num}`;
        }
      } else if (event.event_type === 'CME') {
        eventDescription = 'Coronal Mass Ejection detected';
        if (event.active_region && event.active_region.ar_num) {
          eventDescription += ` from region AR${event.active_region.ar_num}`;
        }
      } else if (event.event_type === 'RBE') {
        eventDescription = 'Radio Blackout Event detected';
      } else if (event.event_type === 'SEP') {
        eventDescription = 'Solar Energetic Particle Event detected';
      } else if (event.event_type === 'CPS') {
        eventDescription = 'Coronal Plasma Stream detected';
      }
      
      // Format time
      const startTime = new Date(event.start_time);
      
      return {
        time: startTime.toISOString(),
        event: eventDescription,
        level
      };
    });
    
    return formattedEvents;
  } catch (error) {
    console.error('Error formatting solar events:', error);
    return [];
  }
};

// Generate mock solar wind data (for fallback)
const generateMockSolarWindData = (count: number): SolarWindData[] => {
  const data: SolarWindData[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const timeOffset = i * 60 * 1000; // 1 minute intervals
    const timeTag = new Date(now.getTime() - timeOffset);
    
    data.push({
      time_tag: timeTag.toISOString(),
      density: 5 + Math.random() * 5,
      speed: 400 + Math.random() * 200,
      temperature: 100000 + Math.random() * 50000,
      bx: Math.random() * 10 - 5,
      by: Math.random() * 10 - 5,
      bz: Math.random() * 10 - 5,
      bt: Math.random() * 15,
      lat: Math.random() * 10 - 5,
      lon: Math.random() * 360,
      status: 1
    });
  }
  
  return data;
};

// Generate mock space weather alerts (for fallback)
const generateMockSpaceWeatherAlerts = (count: number): SpaceWeatherAlert[] => {
  const alerts: SpaceWeatherAlert[] = [];
  const now = new Date();
  const alertTypes = ['WATCH', 'WARNING', 'ALERT', 'SUMMARY'];
  const categories = ['RADIATION', 'GEOMAGNETIC', 'SOLAR FLARE', 'RADIO BLACKOUT'];
  
  for (let i = 0; i < count; i++) {
    const timeOffset = i * 3600 * 1000 * 4; // 4 hour intervals
    const issueTime = new Date(now.getTime() - timeOffset);
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    alerts.push({
      messageType: 'ALERT',
      messageID: `SWPC_${alertType}_${Date.now()}${i}`,
      issueTime: issueTime.toISOString(),
      alertSerial: `${category}_${i + 1}`,
      message: `${alertType}: ${category} ${alertType} issued at ${issueTime.toLocaleString()}\nExpect increased ${category.toLowerCase()} activity.`,
      products: []
    });
  }
  
  return alerts;
};

// Generate mock CME events (for fallback)
const generateMockCMEEvents = (count: number): CMEEvent[] => {
  const events: CMEEvent[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const timeOffset = i * 24 * 3600 * 1000; // 1 day intervals
    const startTime = new Date(now.getTime() - timeOffset);
    
    events.push({
      activityID: `CME_${Date.now()}${i}`,
      catalog: 'SOHO LASCO',
      startTime: startTime.toISOString(),
      sourceLocation: `${Math.floor(Math.random() * 90)}${Math.random() > 0.5 ? 'N' : 'S'} ${Math.floor(Math.random() * 180)}${Math.random() > 0.5 ? 'E' : 'W'}`,
      activeRegionNum: 12000 + Math.floor(Math.random() * 1000),
      link: 'https://example.com/cme',
      note: 'This is a simulated CME event for testing purposes.',
      instruments: ['LASCO', 'STEREO'],
      cmeAnalyses: []
    });
  }
  
  return events;
};

// Generate mock solar events (for fallback)
const generateMockSolarEvents = (count: number): SolarEvent[] => {
  const events: SolarEvent[] = [];
  const now = new Date();
  const eventTypes = ['FLR', 'CME', 'XRA', 'SEP', 'RBE', 'CPS'];
  const flareClasses = ['B1.2', 'C3.4', 'M1.5', 'M5.2', 'X1.1', 'X2.8'];
  
  for (let i = 0; i < count; i++) {
    const timeOffset = i * 12 * 3600 * 1000; // 12 hour intervals
    const startTime = new Date(now.getTime() - timeOffset);
    const peakTime = new Date(startTime.getTime() + 1000 * 60 * 15); // 15 minutes after start
    const endTime = new Date(startTime.getTime() + 1000 * 60 * 30);  // 30 minutes after start
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const flareClass = flareClasses[Math.floor(Math.random() * flareClasses.length)];
    
    events.push({
      event_id: `${eventType}_${Date.now()}${i}`,
      event_type: eventType,
      event_date: startTime.toISOString().split('T')[0],
      start_time: startTime.toISOString(),
      peak_time: peakTime.toISOString(),
      end_time: endTime.toISOString(),
      linked_events: [],
      active_region: {
        ar_num: 13000 + Math.floor(Math.random() * 999),
        latitude: `${Math.floor(Math.random() * 60) - 30}`,
        longitude: `${Math.floor(Math.random() * 180) - 90}`
      },
      classifiers: [
        {
          type: 'FL_GOE',
          value: flareClass
        }
      ]
    });
  }
  
  return events;
};
