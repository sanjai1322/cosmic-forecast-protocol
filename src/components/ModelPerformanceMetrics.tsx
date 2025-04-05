
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HybridModelPerformance } from '../models/HybridCNNLSTMModel';
import { LSTMModelPerformance } from '../models/LSTMModel';
import { CNNModelPerformance } from '../models/CNNModel';

interface ModelPerformanceMetricsProps {
  className?: string;
}

const ModelPerformanceMetrics: React.FC<ModelPerformanceMetricsProps> = ({ className }) => {
  return (
    <Card className={`cosmos-card ${className}`}>
      <CardHeader className="pb-2 pt-4 px-6">
        <CardTitle className="text-lg font-medium">Model Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">ROOT MEAN SQUARED ERROR (RMSE)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-card/50 p-3 rounded-lg border border-border/40">
                <h5 className="font-medium text-xs mb-2">HYBRID CNN-LSTM MODEL</h5>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Kp Index Prediction</span>
                      <span>{HybridModelPerformance.rootMeanSquaredError.kpIndex}</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted/30 rounded-full">
                      <div 
                        className="bg-solar h-1.5 rounded-full" 
                        style={{ width: `${Math.min(100, (1 - HybridModelPerformance.rootMeanSquaredError.kpIndex/2) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Solar Wind Speed</span>
                      <span>{HybridModelPerformance.rootMeanSquaredError.solarWindSpeed} km/s</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted/30 rounded-full">
                      <div 
                        className="bg-solar h-1.5 rounded-full" 
                        style={{ width: `${Math.min(100, (1 - HybridModelPerformance.rootMeanSquaredError.solarWindSpeed/100) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Overall RMSE</span>
                      <span>{HybridModelPerformance.rootMeanSquaredError.overall}</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted/30 rounded-full">
                      <div 
                        className="bg-solar h-1.5 rounded-full" 
                        style={{ width: `${Math.min(100, (1 - HybridModelPerformance.rootMeanSquaredError.overall/2) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-card/50 p-3 rounded-lg border border-border/40">
                <h5 className="font-medium text-xs mb-2">SUB-MODELS</h5>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>CNN Component RMSE</span>
                      <span>{CNNModelPerformance.rootMeanSquaredError}</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted/30 rounded-full">
                      <div 
                        className="bg-purple-500 h-1.5 rounded-full" 
                        style={{ width: `${Math.min(100, (1 - CNNModelPerformance.rootMeanSquaredError/2) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>LSTM Component RMSE</span>
                      <span>{LSTMModelPerformance.rootMeanSquaredError}</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted/30 rounded-full">
                      <div 
                        className="bg-green-500 h-1.5 rounded-full" 
                        style={{ width: `${Math.min(100, (1 - LSTMModelPerformance.rootMeanSquaredError/2) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-2">FORECAST ACCURACY</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-card/50 p-3 rounded-lg border border-border/40">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-solar">{(LSTMModelPerformance.forecastAccuracy['24h'] * 100).toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">24 Hour</div>
                </div>
              </div>
              <div className="bg-card/50 p-3 rounded-lg border border-border/40">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-solar">{(LSTMModelPerformance.forecastAccuracy['48h'] * 100).toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">48 Hour</div>
                </div>
              </div>
              <div className="bg-card/50 p-3 rounded-lg border border-border/40">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-solar">{(LSTMModelPerformance.forecastAccuracy['72h'] * 100).toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">72 Hour</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>
              <strong>About RMSE:</strong> Root Mean Square Error (RMSE) measures the standard deviation of the 
              prediction errors (residuals), which are a measure of how far from the regression line data points are.
            </p>
            <p className="mt-1">
              Lower values indicate better model performance. Our model is continuously retrained 
              on new data to maintain and improve prediction accuracy.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelPerformanceMetrics;
