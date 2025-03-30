
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MLModelInfoProps {
  className?: string;
}

const MLModelInfo: React.FC<MLModelInfoProps> = ({ className }) => {
  return (
    <Card className={`cosmos-card ${className}`}>
      <CardHeader className="pb-2 pt-4 px-6">
        <CardTitle className="text-lg font-medium">CNN-LSTM Model Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-1">MODEL ARCHITECTURE</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our prediction system uses a combined Convolutional Neural Network (CNN) and Long Short-Term Memory (LSTM) 
              architecture to forecast space weather conditions. The CNN layers extract spatial features from solar data, 
              while the LSTM layers model temporal dependencies.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card/50 p-3 rounded-lg border border-border/40">
              <h5 className="font-medium text-xs mb-1">CNN COMPONENT</h5>
              <ul className="text-xs space-y-1">
                <li>• Extracts spatial patterns</li>
                <li>• Processes multiple data streams</li>
                <li>• Identifies correlated features</li>
              </ul>
            </div>
            
            <div className="bg-card/50 p-3 rounded-lg border border-border/40">
              <h5 className="font-medium text-xs mb-1">LSTM COMPONENT</h5>
              <ul className="text-xs space-y-1">
                <li>• Models temporal sequences</li>
                <li>• Captures long-term dependencies</li>
                <li>• Predicts future trends</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-1">DATA SOURCES</h4>
            <p className="text-sm text-muted-foreground">
              The model is trained on historical data from NOAA SWPC, NASA DONKI, DSCOVR satellite, and ACE satellite.
              It processes multiple parameters including:
            </p>
            <div className="grid grid-cols-2 mt-2 gap-y-1">
              <div className="text-xs flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-solar"></span>
                <span>Kp Index</span>
              </div>
              <div className="text-xs flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-solar"></span>
                <span>Solar Wind Speed</span>
              </div>
              <div className="text-xs flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-solar"></span>
                <span>Magnetic Field Bz</span>
              </div>
              <div className="text-xs flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-solar"></span>
                <span>Proton Flux Levels</span>
              </div>
              <div className="text-xs flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-solar"></span>
                <span>X-Ray Flux Levels</span>
              </div>
              <div className="text-xs flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-solar"></span>
                <span>Sunspot Number</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-1">MODEL PERFORMANCE</h4>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Geomagnetic Storm Prediction (G1-G5)</span>
                  <span>88% accuracy</span>
                </div>
                <div className="w-full h-1.5 bg-muted/30 rounded-full">
                  <div className="bg-solar h-1.5 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Kp Index Forecast (±1)</span>
                  <span>82% accuracy</span>
                </div>
                <div className="w-full h-1.5 bg-muted/30 rounded-full">
                  <div className="bg-solar h-1.5 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Solar Wind Speed (±50 km/s)</span>
                  <span>76% accuracy</span>
                </div>
                <div className="w-full h-1.5 bg-muted/30 rounded-full">
                  <div className="bg-solar h-1.5 rounded-full" style={{ width: '76%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MLModelInfo;
