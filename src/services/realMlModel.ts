
import * as tf from '@tensorflow/tfjs';

// Type definitions for our model inputs and outputs
export type ModelInput = {
  kpIndex: number;
  solarWindSpeed: number;
  magneticFieldBz: number;
  protonFlux: number;
  xRayFlux: number;
  timeFeatures: number[]; // [hour, day, month] encoded
};

export type ModelOutput = {
  predictedKpIndex: number;
  predictedSolarWindSpeed: number;
  predictedMagneticFieldBz: number;
  stormProbability: number;
  confidence: number;
};

export type ForecastPoint = {
  time: string;
  kpIndex: number;
  confidence: number;
  solarWindSpeed: number;
  magneticFieldBz: number;
  geomagneticStormProbability: number;
};

export type ActivityLevel = 'low' | 'moderate' | 'high' | 'severe';

class SpaceWeatherModel {
  private model: tf.LayersModel | null = null;
  private modelLoaded: boolean = false;
  private modelLoading: boolean = false;
  private normalizers: {
    kpIndexMean: number;
    kpIndexStd: number;
    solarWindSpeedMean: number;
    solarWindSpeedStd: number;
    magneticFieldBzMean: number;
    magneticFieldBzStd: number;
  };

  constructor() {
    // Initialize normalizers with default values based on historical data
    this.normalizers = {
      kpIndexMean: 2.5,
      kpIndexStd: 1.5,
      solarWindSpeedMean: 450,
      solarWindSpeedStd: 100,
      magneticFieldBzMean: 0,
      magneticFieldBzStd: 5
    };
  }

  /**
   * Load the CNN-LSTM model
   */
  async loadModel(): Promise<void> {
    if (this.modelLoaded || this.modelLoading) {
      return;
    }

    this.modelLoading = true;
    
    try {
      // In a production environment, you would load from a real model URL
      // For example: this.model = await tf.loadLayersModel('https://your-model-server/model.json');
      
      // For now, we'll create a simplified model architecture similar to what would be used
      // This is for demonstration - in production you'd load a properly trained model
      this.model = await this.createDemoModel();
      
      this.modelLoaded = true;
      console.log('CNN-LSTM Space Weather model loaded successfully');
    } catch (error) {
      console.error('Failed to load space weather model:', error);
      // Fall back to simulated predictions if model fails to load
    } finally {
      this.modelLoading = false;
    }
  }

  /**
   * Create a simplified CNN-LSTM model for demonstration purposes
   * In production, you would load a pre-trained model instead
   */
  private async createDemoModel(): Promise<tf.LayersModel> {
    // Input shape: [samples, timesteps, features]
    // For example, 24 hours of data with 5 features per timestep
    const timeSteps = 24;
    const features = 5; // kpIndex, solarWindSpeed, magneticFieldBz, protonFlux, xRayFlux
    
    const input = tf.input({shape: [timeSteps, features]});
    
    // CNN layer to extract spatial features
    const conv = tf.layers.conv1d({
      filters: 64,
      kernelSize: 3,
      activation: 'relu'
    }).apply(input) as tf.SymbolicTensor;
    
    // LSTM layer to model temporal dependencies
    const lstm = tf.layers.lstm({
      units: 50,
      returnSequences: false
    }).apply(conv) as tf.SymbolicTensor;
    
    // Dense layers for prediction
    const dense1 = tf.layers.dense({units: 32, activation: 'relu'}).apply(lstm) as tf.SymbolicTensor;
    
    // Output layer with 5 units: predictedKpIndex, predictedSolarWindSpeed, predictedMagneticFieldBz, stormProbability, confidence
    const output = tf.layers.dense({units: 5}).apply(dense1) as tf.SymbolicTensor;
    
    const model = tf.model({inputs: input, outputs: output});
    
    // Compile the model
    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });
    
    // Initialize with random weights - in production this would be a trained model
    return model;
  }

  /**
   * Preprocess input data for the model
   */
  private preprocessInput(
    kpIndex: number,
    solarWindSpeed: number,
    magneticFieldBz: number
  ): tf.Tensor {
    // Normalize values based on historical means and standard deviations
    const normalizedKp = (kpIndex - this.normalizers.kpIndexMean) / this.normalizers.kpIndexStd;
    const normalizedSpeed = (solarWindSpeed - this.normalizers.solarWindSpeedMean) / this.normalizers.solarWindSpeedStd;
    const normalizedBz = (magneticFieldBz - this.normalizers.magneticFieldBzMean) / this.normalizers.magneticFieldBzStd;
    
    // Generate synthetic historical data (in production you would use real historical data)
    const timeSteps = 24;
    const features = 5;
    
    // Create a tensor with shape [1, timeSteps, features]
    // Where 1 is the batch size
    const inputTensor = tf.buffer([1, timeSteps, features]);
    
    // Fill tensor with synthetic data that oscillates around current values
    for (let i = 0; i < timeSteps; i++) {
      const timeFactor = Math.sin(i / 5) * 0.2;
      
      // Feature 0: normalized kpIndex with historical trend
      inputTensor.set(normalizedKp * (1 + timeFactor), 0, i, 0);
      
      // Feature 1: normalized solarWindSpeed with historical trend
      inputTensor.set(normalizedSpeed * (1 + timeFactor * 0.8), 0, i, 1);
      
      // Feature 2: normalized magneticFieldBz with historical trend
      inputTensor.set(normalizedBz * (1 - timeFactor * 0.5), 0, i, 2);
      
      // Feature 3: synthetic proton flux (would be real in production)
      inputTensor.set(0.5 * (1 + timeFactor * 1.2), 0, i, 3);
      
      // Feature 4: synthetic x-ray flux (would be real in production)
      inputTensor.set(0.3 * (1 + timeFactor), 0, i, 4);
    }
    
    return inputTensor.toTensor();
  }

  /**
   * Generate forecast points for the next 24 hours
   */
  private generateForecastPoints(
    currentTime: Date,
    output: ModelOutput
  ): ForecastPoint[] {
    const forecast: ForecastPoint[] = [];
    
    // Generate forecasts for 6 time points (4 hours apart)
    for (let i = 0; i < 6; i++) {
      const forecastTime = new Date(currentTime.getTime() + (i * 4 * 60 * 60 * 1000));
      
      // Simulate how values evolve over time using the model output as a base
      // This would be multiple outputs from the model in production
      const timeFactor = i / 5; // 0 to 1 as time progresses
      
      // Calculate predicted values with some temporal evolution
      // In a real model, each time step would have its own prediction
      const kpIndex = output.predictedKpIndex * (1 + (timeFactor - 0.5) * 0.4);
      const solarWindSpeed = output.predictedSolarWindSpeed * (1 + (timeFactor - 0.5) * 0.2);
      const magneticFieldBz = output.predictedMagneticFieldBz * (1 + (timeFactor - 0.5) * 0.3);
      
      // Calculate storm probability based on the model output and the evolved parameters
      const stormProbability = Math.min(
        1.0, 
        output.stormProbability * (1 + timeFactor * 0.2)
      );
      
      // Confidence decreases with time
      const confidence = Math.max(0.2, output.confidence * (1 - timeFactor * 0.4));
      
      forecast.push({
        time: forecastTime.toISOString(),
        kpIndex: Math.max(0, Math.min(9, kpIndex)), // Kp index is 0-9
        confidence,
        solarWindSpeed: Math.max(200, solarWindSpeed), // Wind speed has a minimum
        magneticFieldBz,
        geomagneticStormProbability: stormProbability
      });
    }
    
    return forecast;
  }

  /**
   * Make predictions using the CNN-LSTM model
   */
  async predict(
    currentKpIndex: number,
    currentSolarWindSpeed: number,
    currentMagneticFieldBz: number
  ): Promise<{
    forecast: ForecastPoint[],
    summarizedRisk: ActivityLevel,
    confidence: number
  }> {
    // Ensure model is loaded
    if (!this.modelLoaded) {
      await this.loadModel();
    }
    
    try {
      if (this.model) {
        // Preprocess input data
        const inputTensor = this.preprocessInput(
          currentKpIndex,
          currentSolarWindSpeed,
          currentMagneticFieldBz
        );
        
        // Run prediction
        const outputTensor = this.model.predict(inputTensor) as tf.Tensor;
        const outputArray = await outputTensor.array() as number[][];
        
        // Cleanup tensors to prevent memory leaks
        inputTensor.dispose();
        outputTensor.dispose();
        
        // Denormalize the outputs
        const predictedKpIndex = outputArray[0][0] * this.normalizers.kpIndexStd + this.normalizers.kpIndexMean;
        const predictedSolarWindSpeed = outputArray[0][1] * this.normalizers.solarWindSpeedStd + this.normalizers.solarWindSpeedMean;
        const predictedMagneticFieldBz = outputArray[0][2] * this.normalizers.magneticFieldBzStd + this.normalizers.magneticFieldBzMean;
        const stormProbability = Math.min(1, Math.max(0, outputArray[0][3]));
        const confidence = Math.min(1, Math.max(0, outputArray[0][4]));
        
        // Create model output object
        const modelOutput: ModelOutput = {
          predictedKpIndex,
          predictedSolarWindSpeed,
          predictedMagneticFieldBz,
          stormProbability,
          confidence
        };
        
        // Generate forecast points
        const forecast = this.generateForecastPoints(new Date(), modelOutput);
        
        // Determine risk level based on predicted Kp index and storm probability
        let summarizedRisk: ActivityLevel = 'low';
        
        if (predictedKpIndex >= 7 || stormProbability > 0.7) {
          summarizedRisk = 'severe';
        } else if (predictedKpIndex >= 5 || stormProbability > 0.4) {
          summarizedRisk = 'high';
        } else if (predictedKpIndex >= 3 || stormProbability > 0.2) {
          summarizedRisk = 'moderate';
        }
        
        return {
          forecast,
          summarizedRisk,
          confidence
        };
      }
    } catch (error) {
      console.error('Error making predictions:', error);
    }
    
    // Fall back to the mock prediction approach if the model fails
    return this.fallbackPrediction(currentKpIndex, currentSolarWindSpeed, currentMagneticFieldBz);
  }

  /**
   * Fallback prediction method when the model is not available
   */
  private fallbackPrediction(
    currentKpIndex: number,
    currentSolarWindSpeed: number,
    currentMagneticFieldBz: number
  ): {
    forecast: ForecastPoint[],
    summarizedRisk: ActivityLevel,
    confidence: number
  } {
    console.warn('Using fallback prediction method (no ML model)');
    
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
      const stormProbability = this.calculateStormProbability(kpIndex, solarWindSpeed, magneticFieldBz);
      
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
  }

  /**
   * Helper function to calculate geomagnetic storm probability
   */
  private calculateStormProbability(
    kpIndex: number,
    solarWindSpeed: number,
    magneticFieldBz: number
  ): number {
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
  }
}

// Create and export a singleton instance
export const spaceWeatherModel = new SpaceWeatherModel();

// Initialize the model early in the application lifecycle
spaceWeatherModel.loadModel().catch(console.error);
