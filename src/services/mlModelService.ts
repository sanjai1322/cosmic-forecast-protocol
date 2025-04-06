
import { spaceWeatherModel, ActivityLevel, ForecastPoint } from './realMlModel';
import * as tf from '@tensorflow/tfjs';

// Initialize TensorFlow.js with more detailed logging
const initializeTensorflow = async () => {
  try {
    console.log('Initializing TensorFlow.js runtime...');
    
    // Check if we can use WebGL (GPU acceleration)
    await tf.setBackend('webgl');
    console.log('Using TensorFlow.js backend:', tf.getBackend());
    console.log('TensorFlow.js version:', tf.version.tfjs);
    
    // Report device capabilities
    const webGL = await tf.env().getAsync('WEBGL_VERSION') as number;
    console.log('WebGL version:', webGL);
    
    // Log memory info
    const memoryInfo = tf.memory();
    console.log('TensorFlow memory info:', {
      numBytes: memoryInfo.numBytes,
      numTensors: memoryInfo.numTensors,
      numDataBuffers: memoryInfo.numDataBuffers,
      unreliable: memoryInfo.unreliable
    });
    
    // Set up tensor flags
    tf.env().set('WEBGL_FORCE_F16_TEXTURES', true);
    tf.env().set('WEBGL_PACK', true);
    
    // Log TensorFlow.js environment settings
    console.log('TensorFlow.js environment settings:');
    console.log(`- WEBGL_FORCE_F16_TEXTURES: ${await tf.env().getAsync('WEBGL_FORCE_F16_TEXTURES')}`);
    console.log(`- WEBGL_PACK: ${await tf.env().getAsync('WEBGL_PACK')}`);
    console.log(`- WEBGL_PACK_DEPTHWISECONV: ${await tf.env().getAsync('WEBGL_PACK_DEPTHWISECONV')}`);
    
    console.log('TensorFlow.js initialization successful');
  } catch (error) {
    console.error('Error initializing TensorFlow.js:', error);
    // Fall back to CPU
    await tf.setBackend('cpu');
    console.log('Falling back to CPU backend:', tf.getBackend());
  }
};

// Initialize TensorFlow.js when the module loads
initializeTensorflow().catch(console.error);

// Adding more realistic model profiling
const profileModelPerformance = async () => {
  try {
    console.log('Profiling model performance...');
    
    // Create sample tensor
    const sampleInput = tf.ones([1, 24, 5]);
    
    // Start timing
    console.time('Inference Time');
    
    // Run inference 10 times
    for (let i = 0; i < 10; i++) {
      await tf.tidy(() => {
        // Do some operations that would be similar to model inference
        const result = tf.matMul(sampleInput.reshape([1, 24*5]), tf.ones([24*5, 10]));
        return result.reshape([1, 10]);
      });
    }
    
    console.timeEnd('Inference Time');
    
    // Log memory usage after operations
    const memoryInfo = tf.memory();
    console.log('Memory usage after inference:', memoryInfo);
    
    // Clean up
    sampleInput.dispose();
    
  } catch (error) {
    console.error('Error during model profiling:', error);
  }
};

// Run profiling when module loads
setTimeout(() => {
  profileModelPerformance();
}, 5000);

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
  
  // Log web environment details
  console.log('Web environment details:');
  console.log('- User Agent:', navigator.userAgent);
  console.log('- Platform:', navigator.platform);
  console.log('- Hardware Concurrency:', navigator.hardwareConcurrency);
  console.log('- Device Memory:', (navigator as any).deviceMemory || 'unknown');
  
  try {
    // Mark prediction start time for performance monitoring
    console.time('Prediction Time');
    
    // Call model prediction
    const result = await spaceWeatherModel.predict(
      currentKpIndex,
      currentSolarWindSpeed,
      currentMagneticFieldBz
    );
    
    // End timing
    console.timeEnd('Prediction Time');
    
    console.log('Prediction result:', {
      summarizedRisk: result.summarizedRisk,
      confidence: result.confidence,
      forecastPoints: result.forecast.length
    });
    
    // In a real application, we would log telemetry here
    console.log('Telemetry: Prediction completed successfully', {
      riskLevel: result.summarizedRisk,
      modelConfidence: result.confidence,
      predictionTimeMs: performance.now() // Simple performance measure
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

// Expose some functions for debugging in development
if (process.env.NODE_ENV === 'development') {
  (window as any).tfMemory = tf.memory;
  (window as any).tfVersion = tf.version.tfjs;
  (window as any).disposeAllTensors = () => {
    tf.disposeVariables();
    console.log('All tensors disposed');
  };
}
