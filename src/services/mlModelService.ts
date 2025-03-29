
// This is a mock service that simulates a CNN-LSTM model for space weather predictions
// In a real application, this would connect to a trained model

type ForecastPoint = {
  time: string;
  kpIndex: number;
  confidence: number;
  solarWindSpeed: number;
  magneticFieldBz: number;
  geomagneticStormProbability: number;
};

type ActivityLevel = 'low' | 'moderate' | 'high' | 'severe';

// Mock CNN-LSTM model prediction
export const predictSpaceWeather = (
  currentKpIndex: number,
  currentSolarWindSpeed: number,
  currentMagneticFieldBz: number
): {forecast: ForecastPoint[], summarizedRisk: ActivityLevel, confidence: number} => {
  // Simplified model: In reality, this would be a trained CNN-LSTM network
  // that takes current conditions and predicts future conditions
  
  const forecast: ForecastPoint[] = [];
  const now = new Date();
  
  // Generate forecast for the next 24 hours (6 points, 4 hours apart)
  for (let i = 0; i < 6; i++) {
    const forecastTime = new Date(now.getTime() + (i * 4 * 60 * 60 * 1000));
    
    // Simulate how values might evolve (this is just for demonstration)
    // In a real model, these would be actual predictions from the neural network
    const timeFactor = Math.sin(i / 2) * 0.5 + 0.5; // Oscillating factor
    const randomVariation = 0.8 + Math.random() * 0.4;
    
    // Generate plausible future values based on current conditions
    const kpIndex = Math.min(9, Math.max(0, currentKpIndex + (timeFactor - 0.5) * 3 * randomVariation));
    const solarWindSpeed = currentSolarWindSpeed * (0.8 + timeFactor * 0.4) * randomVariation;
    const magneticFieldBz = currentMagneticFieldBz * (0.7 + timeFactor * 0.6) * randomVariation;
    
    // Calculate storm probability based on these values
    const stormProbability = calculateStormProbability(kpIndex, solarWindSpeed, magneticFieldBz);
    
    forecast.push({
      time: forecastTime.toISOString(),
      kpIndex,
      confidence: 0.9 - (i * 0.1), // Confidence decreases with time
      solarWindSpeed,
      magneticFieldBz,
      geomagneticStormProbability: stormProbability
    });
  }
  
  // Calculate the overall risk level based on the forecast
  const maxStormProbability = Math.max(...forecast.map(f => f.geomagneticStormProbability));
  let summarizedRisk: ActivityLevel = 'low';
  
  if (maxStormProbability > 0.7) {
    summarizedRisk = 'severe';
  } else if (maxStormProbability > 0.4) {
    summarizedRisk = 'high';
  } else if (maxStormProbability > 0.2) {
    summarizedRisk = 'moderate';
  }
  
  // Overall confidence in the prediction
  const averageConfidence = forecast.reduce((sum, point) => sum + point.confidence, 0) / forecast.length;
  
  return {
    forecast,
    summarizedRisk,
    confidence: averageConfidence
  };
};

// Helper function to calculate geomagnetic storm probability
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
