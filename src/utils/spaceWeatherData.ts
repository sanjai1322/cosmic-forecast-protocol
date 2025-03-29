
// Mock data utility for space weather information

export type SolarActivityLevel = 'low' | 'moderate' | 'high' | 'severe';

export interface SolarData {
  timestamp: string;
  solarWindSpeed: number; // km/s
  solarWindDensity: number; // particles/cm³
  magneticFieldBz: number; // nanoTesla (nT)
  xRayFlux: number; // W/m²
  kpIndex: number; // 0-9 scale
  activityLevel: SolarActivityLevel;
}

export interface SpaceWeatherForecast {
  period: string;
  kpIndex: number;
  solarWindSpeed: number;
  solarFlaresProbability: number;
  geomagneticStormProbability: number;
  radiationStormProbability: number;
  predictionConfidence: number;
  activityLevel: SolarActivityLevel;
}

// Mock current solar data
export const getCurrentSolarData = (): SolarData => {
  // Simulate slightly different data each time
  const randomFactor = () => 0.85 + Math.random() * 0.3;
  
  const baseData = {
    timestamp: new Date().toISOString(),
    solarWindSpeed: 450 * randomFactor(), // Normal range is 300-800 km/s
    solarWindDensity: 5 * randomFactor(), // Normal range is 3-10 particles/cm³
    magneticFieldBz: -5 * randomFactor(), // Negative values are more geoeffective
    xRayFlux: (2.3e-6) * randomFactor(), // C-class flare range
    kpIndex: 3 + Math.random() * 2, // Moderate activity
    activityLevel: 'moderate' as SolarActivityLevel
  };
  
  // Determine activity level based on Kp index
  if (baseData.kpIndex >= 5) {
    baseData.activityLevel = 'high';
  } else if (baseData.kpIndex >= 7) {
    baseData.activityLevel = 'severe';
  } else if (baseData.kpIndex <= 2) {
    baseData.activityLevel = 'low';
  }
  
  return baseData;
};

// Mock forecast data
export const getSpaceWeatherForecast = (): SpaceWeatherForecast[] => {
  const now = new Date();
  const forecast: SpaceWeatherForecast[] = [];
  
  // Generate 6 forecast periods (24 hours, in 4-hour increments)
  for (let i = 0; i < 6; i++) {
    const forecastDate = new Date(now.getTime() + (i * 4 * 60 * 60 * 1000));
    const kpIndex = 2 + Math.random() * 3; // Random Kp index between 2-5
    
    let activityLevel: SolarActivityLevel = 'low';
    if (kpIndex >= 5) {
      activityLevel = 'high';
    } else if (kpIndex >= 3) {
      activityLevel = 'moderate';
    }
    
    forecast.push({
      period: forecastDate.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric'
      }),
      kpIndex,
      solarWindSpeed: 350 + Math.random() * 300,
      solarFlaresProbability: Math.random() * 0.4,
      geomagneticStormProbability: Math.random() * (kpIndex / 9),
      radiationStormProbability: Math.random() * 0.2,
      predictionConfidence: 0.6 + Math.random() * 0.3,
      activityLevel
    });
  }
  
  return forecast;
};

// Simulates real-time data updates
export const subscribeToSolarData = (
  callback: (data: SolarData) => void, 
  interval: number = 10000
) => {
  const intervalId = setInterval(() => {
    callback(getCurrentSolarData());
  }, interval);
  
  return () => clearInterval(intervalId);
};
