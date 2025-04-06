
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { spaceWeatherModel } from '@/services/realMlModel';

interface Point {
  x: number;
  y: number;
  label: string;
}

const TSNEVisualization = ({ className = "" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get t-SNE data from our model
        const result = await spaceWeatherModel.generateTSNEVisualization();
        
        // Convert the data to points
        const newPoints = result.x.map((x, i) => ({
          x,
          y: result.y[i],
          label: result.labels[i]
        }));
        
        setPoints(newPoints);
      } catch (error) {
        console.error('Error generating t-SNE visualization:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (points.length === 0 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Find min/max values for scaling
    const xValues = points.map(p => p.x);
    const yValues = points.map(p => p.y);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    
    // Add padding
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const paddedXMin = xMin - xRange * 0.1;
    const paddedXMax = xMax + xRange * 0.1;
    const paddedYMin = yMin - yRange * 0.1;
    const paddedYMax = yMax + yRange * 0.1;
    
    // Scale points to canvas
    const scaleX = (x: number) => 
      ((x - paddedXMin) / (paddedXMax - paddedXMin)) * canvas.width;
    const scaleY = (y: number) => 
      (1 - (y - paddedYMin) / (paddedYMax - paddedYMin)) * canvas.height;
    
    // Draw axes
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, scaleY(0));
    ctx.lineTo(canvas.width, scaleY(0));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(scaleX(0), 0);
    ctx.lineTo(scaleX(0), canvas.height);
    ctx.stroke();
    
    // Draw points
    points.forEach(point => {
      // Color based on label
      if (point.label === 'Solar Flare') {
        ctx.fillStyle = '#f87171'; // Red
      } else if (point.label === 'Quiet Sun') {
        ctx.fillStyle = '#60a5fa'; // Blue
      } else {
        ctx.fillStyle = '#fbbf24'; // Yellow
      }
      
      const x = scaleX(point.x);
      const y = scaleY(point.y);
      
      // Draw circle
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw title and labels similar to matplotlib
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Solar Event t-SNE Visualization', canvas.width / 2, 20);
    
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Feature 1', canvas.width - 10, canvas.height / 2);
    
    ctx.textAlign = 'center';
    ctx.fillText('Feature 2', canvas.width / 2, canvas.height - 10);
    
  }, [points]);
  
  // Draw legend
  const renderLegend = () => {
    return (
      <div className="flex flex-wrap gap-4 mt-2 justify-center">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
          <span className="text-xs">Solar Flares</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-400 mr-1"></div>
          <span className="text-xs">Quiet Sun</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></div>
          <span className="text-xs">CMEs</span>
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="3"></circle>
            <circle cx="6" cy="18" r="3"></circle>
            <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
            <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
            <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
          </svg>
          t-SNE Feature Visualization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <div className="h-8 w-8 rounded-full border-4 border-t-solar border-r-solar/30 border-b-solar/10 border-l-solar/30 animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-2">
              <canvas 
                ref={canvasRef} 
                width={320} 
                height={200} 
                className="bg-black/50 rounded-md"
              />
              {renderLegend()}
              <div className="text-xs text-center text-muted-foreground mt-2">
                t-SNE projection of solar event features extracted by CNN
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TSNEVisualization;
