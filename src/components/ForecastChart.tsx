
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the forecast
const forecastData = [
  { time: '00:00', kpIndex: 2, probability: 0.1 },
  { time: '03:00', kpIndex: 2.3, probability: 0.2 },
  { time: '06:00', kpIndex: 3, probability: 0.3 },
  { time: '09:00', kpIndex: 5, probability: 0.7 },
  { time: '12:00', kpIndex: 6, probability: 0.8 },
  { time: '15:00', kpIndex: 4, probability: 0.6 },
  { time: '18:00', kpIndex: 3, probability: 0.3 },
  { time: '21:00', kpIndex: 2, probability: 0.2 },
  { time: '24:00', kpIndex: 1.5, probability: 0.1 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3">
        <p className="text-sm font-medium">{`Time: ${label}`}</p>
        <p className="text-xs font-medium text-primary">
          {`Kp-Index: ${payload[0].value}`}
        </p>
        <p className="text-xs font-medium text-accent">
          {`Storm Probability: ${payload[1].value * 100}%`}
        </p>
      </div>
    );
  }

  return null;
};

const ForecastChart: React.FC<{ className?: string }> = ({ className }) => {
  const getKpIndexSeverity = (kpIndex: number) => {
    if (kpIndex >= 5) return 'high';
    if (kpIndex >= 3) return 'moderate';
    return 'low';
  };

  // Calculate the max Kp index in the forecast
  const maxKpIndex = Math.max(...forecastData.map(d => d.kpIndex));
  const maxKpTime = forecastData.find(d => d.kpIndex === maxKpIndex)?.time || '';
  const severity = getKpIndexSeverity(maxKpIndex);

  return (
    <Card className={`cosmos-card ${className}`}>
      <CardHeader className="pb-2 pt-4 px-6 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-medium">Geomagnetic Storm Forecast</CardTitle>
        <span 
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            severity === 'low' ? 'bg-alert-low/20 text-alert-low' : 
            severity === 'moderate' ? 'bg-alert-moderate/20 text-alert-moderate' : 
            'bg-alert-high/20 text-alert-high'
          }`}
        >
          Max Kp: {maxKpIndex} at {maxKpTime}
        </span>
      </CardHeader>
      <CardContent className="p-6 pt-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={forecastData}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="kpIndex" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3d5afe" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3d5afe" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="probability" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d500f9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#d500f9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="time" 
                stroke="#888888" 
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis 
                yAxisId="kp"
                stroke="#888888" 
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(value) => `${value}`}
                domain={[0, 9]}
              />
              <YAxis 
                yAxisId="prob"
                orientation="right"
                stroke="#888888" 
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(value) => `${value * 100}%`}
                domain={[0, 1]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                yAxisId="kp"
                type="monotone" 
                dataKey="kpIndex" 
                stroke="#3d5afe" 
                fillOpacity={1}
                fill="url(#kpIndex)" 
                name="Kp Index"
              />
              <Area 
                yAxisId="prob"
                type="monotone" 
                dataKey="probability" 
                stroke="#d500f9" 
                fillOpacity={1}
                fill="url(#probability)"
                name="Storm Probability" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span>Kp-Index (0-9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent"></div>
            <span>Storm Probability</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastChart;
