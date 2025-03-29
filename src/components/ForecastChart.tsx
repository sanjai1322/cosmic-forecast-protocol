
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export type ForecastDataPoint = {
  period: string;
  kpIndex: number;
  solarWindSpeed: number;
  solarFlaresProbability: number;
  geomagneticStormProbability: number;
  radiationStormProbability: number;
  predictionConfidence: number;
  activityLevel: 'low' | 'moderate' | 'high' | 'severe';
};

interface ForecastChartProps {
  data?: ForecastDataPoint[];
  className?: string;
}

// Mock data for default display
const mockForecastData: ForecastDataPoint[] = [
  { 
    period: 'Jun 12, 10AM', 
    kpIndex: 2.5, 
    solarWindSpeed: 380, 
    solarFlaresProbability: 0.2, 
    geomagneticStormProbability: 0.15, 
    radiationStormProbability: 0.1,
    predictionConfidence: 0.85,
    activityLevel: 'low'
  },
  { 
    period: 'Jun 12, 2PM', 
    kpIndex: 3.2, 
    solarWindSpeed: 420, 
    solarFlaresProbability: 0.25, 
    geomagneticStormProbability: 0.3, 
    radiationStormProbability: 0.15,
    predictionConfidence: 0.8,
    activityLevel: 'moderate'
  },
  { 
    period: 'Jun 12, 6PM', 
    kpIndex: 4.1, 
    solarWindSpeed: 480, 
    solarFlaresProbability: 0.3, 
    geomagneticStormProbability: 0.4, 
    radiationStormProbability: 0.25,
    predictionConfidence: 0.75,
    activityLevel: 'moderate'
  },
  { 
    period: 'Jun 12, 10PM', 
    kpIndex: 4.8, 
    solarWindSpeed: 550, 
    solarFlaresProbability: 0.4, 
    geomagneticStormProbability: 0.5, 
    radiationStormProbability: 0.35,
    predictionConfidence: 0.7,
    activityLevel: 'moderate'
  },
  { 
    period: 'Jun 13, 2AM', 
    kpIndex: 5.2, 
    solarWindSpeed: 620, 
    solarFlaresProbability: 0.45, 
    geomagneticStormProbability: 0.6, 
    radiationStormProbability: 0.4,
    predictionConfidence: 0.65,
    activityLevel: 'high'
  },
  { 
    period: 'Jun 13, 6AM', 
    kpIndex: 4.5, 
    solarWindSpeed: 580, 
    solarFlaresProbability: 0.35, 
    geomagneticStormProbability: 0.45, 
    radiationStormProbability: 0.3,
    predictionConfidence: 0.6,
    activityLevel: 'moderate'
  },
];

const ForecastChart: React.FC<ForecastChartProps> = ({ 
  data = mockForecastData,
  className 
}) => {
  // Get the minimum and maximum values for the Kp Index to set the domain
  const minKp = Math.floor(Math.min(...data.map(d => d.kpIndex)));
  const maxKp = Math.ceil(Math.max(...data.map(d => d.kpIndex)));
  
  // Format the tooltip content
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="cosmos-tooltip p-2 rounded">
          <p className="text-xs font-medium">{label}</p>
          <div className="text-xs grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
            <span>Kp Index:</span>
            <span className="font-medium">{data.kpIndex.toFixed(1)}</span>
            
            <span>Wind Speed:</span>
            <span className="font-medium">{data.solarWindSpeed.toFixed(0)} km/s</span>
            
            <span>Flare Prob.:</span>
            <span className="font-medium">{(data.solarFlaresProbability * 100).toFixed(0)}%</span>
            
            <span>Storm Prob.:</span>
            <span className="font-medium">{(data.geomagneticStormProbability * 100).toFixed(0)}%</span>
            
            <span>Confidence:</span>
            <span className="font-medium">{(data.predictionConfidence * 100).toFixed(0)}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`cosmos-card ${className}`}>
      <CardHeader className="px-6 pt-4 pb-2">
        <CardTitle className="text-lg font-medium">48-Hour Forecast</CardTitle>
      </CardHeader>
      <CardContent className="p-1">
        <div className="pt-2 px-2 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 25, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 10 }} 
                tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              />
              <YAxis 
                yAxisId="left"
                domain={[minKp > 0 ? minKp - 1 : 0, maxKp + 1]} 
                tick={{ fontSize: 10 }} 
                tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }} 
                label={{ 
                  value: 'Kp Index', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 10, textAnchor: 'middle' },
                  dy: 50
                }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                tick={{ fontSize: 10 }} 
                tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                label={{ 
                  value: 'Probability', 
                  angle: 90, 
                  position: 'insideRight',
                  style: { fontSize: 10, textAnchor: 'middle' },
                  dy: -30
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={30} />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="kpIndex" 
                name="Kp Index" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="geomagneticStormProbability" 
                name="G-Storm Prob." 
                stroke="#ff7300"
                strokeWidth={2} 
                dot={{ strokeWidth: 2, r: 3 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="solarFlaresProbability" 
                name="Flare Prob." 
                stroke="#82ca9d" 
                strokeWidth={2}
                dot={{ strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastChart;
