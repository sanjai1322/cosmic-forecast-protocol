
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { useIsMobile } from '@/hooks/use-mobile';

interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
}

const MLModelTrainingVisualizer = ({ 
  isTraining = false,
  totalEpochs = 100,
  className = ""
}: { 
  isTraining?: boolean;
  totalEpochs?: number;
  className?: string;
}) => {
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [metrics, setMetrics] = useState<TrainingMetrics[]>([]);
  const [progress, setProgress] = useState(0);
  const trainingInterval = useRef<number | null>(null);
  const isMobile = useIsMobile();

  // Simulate the training process
  useEffect(() => {
    if (isTraining) {
      setCurrentEpoch(0);
      setMetrics([]);
      setProgress(0);
      
      const intervalTime = 600; // Update every 600ms for a smooth animation
      
      trainingInterval.current = window.setInterval(() => {
        setCurrentEpoch(epoch => {
          const newEpoch = epoch + 1;
          if (newEpoch > totalEpochs) {
            if (trainingInterval.current) clearInterval(trainingInterval.current);
            return totalEpochs;
          }
          return newEpoch;
        });
        
        setMetrics(prevMetrics => {
          const newMetric = generateTrainingMetrics(prevMetrics.length);
          return [...prevMetrics, newMetric];
        });
        
        setProgress(prog => {
          const newProgress = prog + (100 / totalEpochs);
          return Math.min(newProgress, 100);
        });
      }, intervalTime);
    }
    
    return () => {
      if (trainingInterval.current) clearInterval(trainingInterval.current);
    };
  }, [isTraining, totalEpochs]);
  
  // Generate realistic training metrics that improve over time
  const generateTrainingMetrics = (epoch: number): TrainingMetrics => {
    // Start with higher loss that decreases over epochs
    const baseLoss = 1.2 * Math.exp(-epoch / (totalEpochs * 0.25));
    // Add some noise for realism
    const noise = () => (Math.random() - 0.5) * 0.1;
    
    // Loss decreases over time with oscillations
    const loss = Math.max(0.05, baseLoss + noise());
    
    // Validation loss follows training loss but is slightly higher
    const valLoss = loss * (1 + Math.abs(noise()) * 0.5);
    
    // Accuracy increases as training progresses (inverse of loss)
    const baseAccuracy = 1 - baseLoss * 0.8;
    const accuracy = Math.min(0.98, baseAccuracy + noise() * 0.5);
    
    // Validation accuracy follows but is slightly lower
    const valAccuracy = accuracy * (1 - Math.abs(noise()) * 0.3);
    
    return {
      epoch,
      loss,
      accuracy,
      valLoss,
      valAccuracy
    };
  };
  
  // Render the training metrics in a console-like format
  const renderTrainingLog = () => {
    if (metrics.length === 0) return null;
    
    // Only show the latest 3 records on mobile, 5 on desktop
    const recentMetrics = metrics.slice(-1 * (isMobile ? 3 : 5));
    
    return (
      <div className="font-mono text-xs bg-black text-green-400 p-3 rounded-md h-32 overflow-y-auto">
        {recentMetrics.map((metric, index) => (
          <div key={index} className="mb-1">
            {isMobile ? (
              // Simplified display for mobile
              <>
                Epoch {metric.epoch}/{totalEpochs} - 
                loss: {metric.loss.toFixed(4)} - 
                acc: {metric.accuracy.toFixed(4)}
              </>
            ) : (
              // Full display for desktop
              <>
                Epoch {metric.epoch}/{totalEpochs} - 
                loss: {metric.loss.toFixed(4)} - 
                accuracy: {metric.accuracy.toFixed(4)} - 
                val_loss: {metric.valLoss.toFixed(4)} - 
                val_accuracy: {metric.valAccuracy.toFixed(4)}
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className={`pb-2 ${isMobile ? 'px-3' : 'px-6'}`}>
        <CardTitle className="flex items-center gap-2 text-base">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          CNN-LSTM Model Training
        </CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? 'px-3 py-2' : ''}>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <div className="font-medium">Training Progress</div>
            <div>{Math.round(progress)}%</div>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="text-sm text-muted-foreground">
            Current Epoch: {currentEpoch}/{totalEpochs}
          </div>
          
          {renderTrainingLog()}
          
          <div className="text-xs text-muted-foreground mt-2">
            CNN-LSTM hybrid model trained on solar imagery and time series data
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MLModelTrainingVisualizer;
