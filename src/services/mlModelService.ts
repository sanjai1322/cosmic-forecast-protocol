import { spaceWeatherModel, ActivityLevel, ForecastPoint } from './realMlModel';

// The exported function now uses our real CNN-LSTM model
export const predictSpaceWeather = async (
  currentKpIndex: number,
  currentSolarWindSpeed: number,
  currentMagneticFieldBz: number
): Promise<{forecast: ForecastPoint[], summarizedRisk: ActivityLevel, confidence: number}> => {
  return await spaceWeatherModel.predict(
    currentKpIndex,
    currentSolarWindSpeed,
    currentMagneticFieldBz
  );
};

// Keep the helper function for backward compatibility
const calculateStormProbability = (
  kpIndex: number,
  solarWindSpeed: number,
  magneticFieldBz: number
): number => {
  // Simplified model:
  // - High Kp Index increases storm probability
  // - Fast solar wind increases storm probability
  // - Strong southward Bz (negative) increases storm probability
  
  let probability = 0;
  
  // Kp index contribution (0-9 scale)
  probability += kpIndex / 18; // Max contribution of 0.5
  
  // Solar wind speed contribution (typically 300-800 km/s)
  probability += Math.min(0.3, (solarWindSpeed - 300) / 1500);
  
  // Bz contribution (negative Bz is more geoeffective)
  probability += Math.min(0.3, Math.max(0, -magneticFieldBz / 30));
  
  return Math.min(1, Math.max(0, probability));
};

// Export the helper function for use in other parts of the application if needed
export { calculateStormProbability };
