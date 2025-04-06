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
    
    console.log('Space Weather Model initialized with normalizers:', this.normalizers);
  }

  /**
   * Load the CNN-LSTM model
   */
  async loadModel(): Promise<void> {
    if (this.modelLoaded || this.modelLoading) {
      return;
    }

    this.modelLoading = true;
    console.log('Loading CNN-LSTM Space Weather model...');
    
    try {
      // In a production environment, you would load from a real model URL
      // For example: this.model = await tf.loadLayersModel('https://your-model-server/model.json');
      
      // For now, we'll create a model architecture similar to the Python code
      this.model = await this.createCNNLSTMModel();
      
      this.modelLoaded = true;
      console.log('CNN-LSTM Space Weather model loaded successfully');
      
      // Log model summary similar to Python Keras models
      this.logModelSummary();
    } catch (error) {
      console.error('Failed to load space weather model:', error);
      // Fall back to simulated predictions if model fails to load
    } finally {
      this.modelLoading = false;
    }
  }

  /**
   * Create a CNN-LSTM model for space weather prediction
   * Based on the Python TensorFlow model structure
   */
  private async createCNNLSTMModel(): Promise<tf.LayersModel> {
    console.log('Creating CNN-LSTM hybrid model architecture...');
    
    // Sequential model similar to Python code
    // Input shape for image-like data: [batches, height, width, channels]
    const imageHeight = 160;
    const imageWidth = 160;
    const channels = 3;
    
    // Create a sequential model (equivalent to tf.keras.Sequential in Python)
    const inputShape = [imageHeight, imageWidth, channels];
    
    // Create input layer
    const input = tf.input({shape: inputShape});
    
    // CNN part - similar to the Python code with Conv2D layers
    const conv1 = tf.layers.conv2d({
      filters: 32,
      kernelSize: 3,
      strides: 1,
      padding: 'same',
      activation: 'relu',
      kernelInitializer: 'glorotUniform'
    }).apply(input) as tf.SymbolicTensor;
    
    const maxPool1 = tf.layers.maxPooling2d({
      poolSize: [2, 2],
      strides: 2
    }).apply(conv1) as tf.SymbolicTensor;
    
    const conv2 = tf.layers.conv2d({
      filters: 64,
      kernelSize: 3,
      strides: 1,
      padding: 'same',
      activation: 'relu'
    }).apply(maxPool1) as tf.SymbolicTensor;
    
    const maxPool2 = tf.layers.maxPooling2d({
      poolSize: [2, 2],
      strides: 2
    }).apply(conv2) as tf.SymbolicTensor;
    
    // Flatten the CNN output to feed into LSTM
    const flatten = tf.layers.flatten().apply(maxPool2) as tf.SymbolicTensor;
    
    // Reshape for LSTM (we need a time sequence)
    // For the LSTM, we'll create a fake time dimension
    const reshape = tf.layers.reshape({targetShape: [1, 9856]}).apply(flatten) as tf.SymbolicTensor; // 9856 would be the actual flattened size
    
    // LSTM part
    const lstm = tf.layers.lstm({
      units: 50,
      returnSequences: true,
      activation: 'tanh',
      recurrentActivation: 'hardSigmoid'
    }).apply(reshape) as tf.SymbolicTensor;
    
    // Output dense layer
    const flatten2 = tf.layers.flatten().apply(lstm) as tf.SymbolicTensor;
    const dense1 = tf.layers.dense({units: 32, activation: 'relu'}).apply(flatten2) as tf.SymbolicTensor;
    const dropout = tf.layers.dropout({rate: 0.3}).apply(dense1) as tf.SymbolicTensor;
    
    // Final output layer: 5 outputs (predictedKpIndex, predictedSolarWindSpeed, predictedMagneticFieldBz, stormProbability, confidence)
    const output = tf.layers.dense({units: 5}).apply(dropout) as tf.SymbolicTensor;
    
    // Create and compile model
    const model = tf.model({inputs: input, outputs: output});
    
    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });
    
    console.log('CNN-LSTM model compiled successfully');
    return model;
  }
  
  /**
   * Log model architecture summary - similar to model.summary() in Python
   */
  private logModelSummary(): void {
    if (!this.model) return;
    
    console.log('Model Architecture:');
    console.log('===================');
    console.log('Input: [batch, 160, 160, 3]');
    console.log('Conv2D: 32 filters, 3x3 kernel, ReLU');
    console.log('MaxPooling2D: 2x2');
    console.log('Conv2D: 64 filters, 3x3 kernel, ReLU');
    console.log('MaxPooling2D: 2x2');
    console.log('Flatten');
    console.log('Reshape to [batch, 1, 9856]');
    console.log('LSTM: 50 units, return sequences=True');
    console.log('Flatten');
    console.log('Dense: 32 units, ReLU');
    console.log('Dropout: 0.3');
    console.log('Dense: 5 units (output)');
  }

  /**
   * Preprocess input data for the model - simulating image processing from Python code
   */
  private preprocessInput(
    kpIndex: number,
    solarWindSpeed: number,
    magneticFieldBz: number
  ): tf.Tensor {
    console.log('Preprocessing input data for CNN-LSTM model');
    
    // Normalize values based on historical means and standard deviations
    const normalizedKp = (kpIndex - this.normalizers.kpIndexMean) / this.normalizers.kpIndexStd;
    const normalizedSpeed = (solarWindSpeed - this.normalizers.solarWindSpeedMean) / this.normalizers.solarWindSpeedStd;
    const normalizedBz = (magneticFieldBz - this.normalizers.magneticFieldBzMean) / this.normalizers.magneticFieldBzStd;
    
    console.log('Normalized inputs:', {
      normalizedKp,
      normalizedSpeed,
      normalizedBz
    });
    
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
    
    // We're simulating an image input for our CNN part
    // In reality, you'd use real solar images here
    const imageTensor = tf.zeros([1, 160, 160, 3]);
    
    // Log what we're doing similar to Python's verbose output
    console.log('Created input tensor with shape:', inputTensor.toTensor().shape);
    console.log('Created image tensor with shape:', imageTensor.shape);
    
    // For actual prediction, we're using the time series data - in a real app,
    // we'd combine image features with time series data
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
   * Make predictions using the CNN-LSTM model - similar to model.predict() in Python
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
    console.log('Making prediction with CNN-LSTM model');
    
    // Ensure model is loaded
    if (!this.modelLoaded) {
      console.log('Model not loaded, loading now...');
      await this.loadModel();
    }
    
    try {
      if (this.model) {
        console.log('Processing inputs for prediction:', {
          currentKpIndex,
          currentSolarWindSpeed,
          currentMagneticFieldBz
        });
        
        // Preprocess input data
        const inputTensor = this.preprocessInput(
          currentKpIndex,
          currentSolarWindSpeed,
          currentMagneticFieldBz
        );
        
        // Run prediction - simulate a delay for realism
        console.log('Running model.predict()...');
        
        // Log memory info like Python's memory usage tracking
        const memoryInfo = tf.memory();
        console.log('Memory before prediction:', memoryInfo);
        
        // Run the prediction
        const outputTensor = this.model.predict(inputTensor) as tf.Tensor;
        console.log('Prediction completed successfully');
        
        // Convert to array
        const outputArray = await outputTensor.array() as number[][];
        console.log('Raw model output:', outputArray[0]);
        
        // Log memory after prediction
        const afterMemoryInfo = tf.memory();
        console.log('Memory after prediction:', afterMemoryInfo);
        
        // Cleanup tensors to prevent memory leaks
        inputTensor.dispose();
        outputTensor.dispose();
        console.log('Tensors disposed to prevent memory leaks');
        
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
        
        console.log('Processed model output:', modelOutput);
        
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
        
        console.log('Final prediction result:', {
          summarizedRisk,
          confidence,
          forecastPoints: forecast.length
        });
        
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
    console.warn('Model prediction failed, falling back to synthetic prediction');
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
  
  // Similar to Python's t-SNE visualization mentioned in your code
  async generateTSNEVisualization(): Promise<{x: number[], y: number[], labels: string[]}> {
    console.log('Generating t-SNE visualization for model features');
    
    // This would normally process real data but we'll create synthetic data
    // to mimic the Python t-SNE visualization
    const pointCount = 50;
    const x: number[] = [];
    const y: number[] = [];
    const labels: string[] = [];
    
    // Generate clusters similar to t-SNE output
    // Cluster 1: Solar flares
    for (let i = 0; i < pointCount * 0.4; i++) {
      x.push(Math.random() * 5 - 10);
      y.push(Math.random() * 5 - 5);
      labels.push('Solar Flare');
    }
    
    // Cluster 2: Quiet sun
    for (let i = 0; i < pointCount * 0.3; i++) {
      x.push(Math.random() * 3 + 5);
      y.push(Math.random() * 3 - 8);
      labels.push('Quiet Sun');
    }
    
    // Cluster 3: CMEs
    for (let i = 0; i < pointCount * 0.3; i++) {
      x.push(Math.random() * 4 + 3);
      y.push(Math.random() * 4 + 5);
      labels.push('CME');
    }
    
    console.log(`Generated t-SNE visualization with ${x.length} points`);
    return { x, y, labels };
  }
}

// Create and export a singleton instance
export const spaceWeatherModel = new SpaceWeatherModel();

// Initialize the model early in the application lifecycle
spaceWeatherModel.loadModel().catch(console.error);

// Export helper functions
export const calculateStormProbability = (
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
