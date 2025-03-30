
import { spaceWeatherModel, ActivityLevel, ForecastPoint } from './realMlModel';
import * as tf from '@tensorflow/tfjs';

// Initialize TensorFlow.js
const initializeTensorflow = async () => {
  try {
    // Check if we can use WebGL (GPU acceleration)
    await tf.setBackend('webgl');
    console.log('Using TensorFlow.js backend:', tf.getBackend());
    console.log('TensorFlow.js version:', tf.version.tfjs);
    
    // Report device capabilities
    const webGL = await tf.env().getAsync('WEBGL_VERSION') as number;
    console.log('WebGL version:', webGL);
    
    // Log memory info
    const memoryInfo = tf.memory();
    console.log('TensorFlow memory:', memoryInfo);
  } catch (error) {
    console.error('Error initializing TensorFlow.js:', error);
    // Fall back to CPU
    await tf.setBackend('cpu');
    console.log('Falling back to CPU backend:', tf.getBackend());
  }
};

// Initialize TensorFlow.js when the module loads
initializeTensorflow().catch(console.error);

// The exported function now uses our real CNN-LSTM model
export const predictSpaceWeather = async (
  currentKpIndex: number,
  currentSolarWindSpeed: number,
  currentMagneticFieldBz: number
): Promise<{forecast: ForecastPoint[], summarizedRisk: ActivityLevel, confidence: number}> => {
  console.log('Predicting space weather with parameters:', {
    currentKpIndex,
    currentSolarWindSpeed,
    currentMagneticFieldBz
  });
  
  try {
    const result = await spaceWeatherModel.predict(
      currentKpIndex,
      currentSolarWindSpeed,
      currentMagneticFieldBz
    );
    
    console.log('Prediction result:', {
      summarizedRisk: result.summarizedRisk,
      confidence: result.confidence,
      forecastPoints: result.forecast.length
    });
    
    return result;
  } catch (error) {
    console.error('Error during space weather prediction:', error);
    throw error;
  }
};

// Helper function for backward compatibility
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
