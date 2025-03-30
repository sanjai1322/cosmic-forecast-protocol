
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Sample historical data
const generateHistoricalData = (days: number) => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const kpIndex = 2 + Math.random() * 3;
    const solarWind = 350 + Math.random() * 200;
    const bz = -8 + Math.random() * 10;
    const xRayFlux = (1 + Math.random() * 3) * Math.pow(10, -6);
    
    data.push({
      date: date.toISOString().split('T')[0],
      kpIndex: parseFloat(kpIndex.toFixed(1)),
      solarWind: Math.round(solarWind),
      bz: parseFloat(bz.toFixed(1)),
      xRayFlux: parseFloat(xRayFlux.toExponential(1))
    });
  }
  
  return data;
};

interface HistoricalDataChartProps {
  timeRange: '7days' | '30days' | '90days' | '365days';
  dataType: 'all' | 'kp' | 'solar-wind' | 'solar-flares';
}

const HistoricalDataChart: React.FC<HistoricalDataChartProps> = ({ 
  timeRange, 
  dataType 
}) => {
  // Generate data based on time range
  const days = 
    timeRange === '7days' ? 7 : 
    timeRange === '30days' ? 30 : 
    timeRange === '90days' ? 90 : 365;
  
  const data = generateHistoricalData(days);
  
  // Determine which datasets to show based on dataType
  const showKp = dataType === 'all' || dataType === 'kp';
  const showSolarWind = dataType === 'all' || dataType === 'solar-wind';
  const showBz = dataType === 'all';
  const showXRayFlux = dataType === 'all' || dataType === 'solar-flares';
  
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => {
              if (days > 30) {
                return value.split('-').slice(1).join('-'); // MM-DD
              } else {
                return value.split('-')[2]; // DD
              }
            }}
          />
          <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(22, 27, 34, 0.9)',
              borderColor: '#30363d',
              fontSize: '12px',
              color: '#fff'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          
          {showKp && (
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="kpIndex"
              name="Kp Index"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
              animationDuration={2000}
            />
          )}
          
          {showSolarWind && (
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="solarWind"
              name="Solar Wind (km/s)"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.3}
              animationDuration={2000}
            />
          )}
          
          {showBz && (
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="bz"
              name="Bz (nT)"
              stroke="#ffc658"
              fill="#ffc658"
              fillOpacity={0.3}
              animationDuration={2000}
            />
          )}
          
          {showXRayFlux && (
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="xRayFlux"
              name="X-Ray Flux"
              stroke="#ff8042"
              fill="#ff8042"
              fillOpacity={0.3}
              animationDuration={2000}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoricalDataChart;
