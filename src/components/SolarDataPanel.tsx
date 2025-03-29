
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MetricCard from './MetricCard';
import { SolarData } from '@/utils/spaceWeatherData';

interface SolarDataPanelProps {
  data: SolarData;
  className?: string;
}

const SolarDataPanel: React.FC<SolarDataPanelProps> = ({ 
  data,
  className 
}) => {
  // Helper functions to determine status levels
  const getSolarWindStatus = (speed: number) => {
    if (speed > 700) return 'high';
    if (speed > 500) return 'moderate';
    return 'low';
  };
  
  const getMagneticFieldStatus = (bz: number) => {
    if (bz < -10) return 'high';
    if (bz < -5) return 'moderate';
    return 'low';
  };
  
  const getXRayStatus = (flux: number) => {
    if (flux > 1e-5) return 'high'; // M-class or higher
    if (flux > 1e-6) return 'moderate'; // C-class
    return 'low'; // B-class or lower
  };
  
  const getFormattedTime = (timestamp: string) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Safely render values with null checks to prevent "cannot read property of undefined" errors
  const renderSafeValue = (value: any, decimals: number = 1, unit: string = ''): string => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number') return `${value.toFixed(decimals)}${unit}`;
    return String(value);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="cosmos-card">
        <CardHeader className="pb-2 pt-4 px-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">Solar Activity Parameters</CardTitle>
            <span className="text-xs text-muted-foreground">
              Last Updated: {getFormattedTime(data?.timestamp || '')}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Solar Wind Speed"
              value={data?.solarWindSpeed ? `${Math.round(data.solarWindSpeed)} km/s` : 'N/A'}
              description="Current solar wind velocity"
              status={data?.solarWindSpeed ? getSolarWindStatus(data.solarWindSpeed) : 'low'}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-solar">
                  <path d="M17.45 2.88a9 9 0 1 0 9.82 14.58"/>
                  <path d="M9.01 21.12a9 9 0 1 0-9.82-14.58"/>
                  <circle cx="12" cy="12" r="2.12"/>
                </svg>
              }
            />
            
            <MetricCard
              title="Particle Density"
              value={data?.solarWindDensity !== undefined ? `${renderSafeValue(data.solarWindDensity, 1)} p/cm³` : 'N/A'}
              description="Solar wind plasma density"
              status={data?.solarWindDensity !== undefined ? (data.solarWindDensity > 8 ? 'moderate' : 'low') : 'low'}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cosmic-radiation">
                  <path d="M20.2 2H3.8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16.4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/>
                  <path d="M8 8v8"/>
                  <path d="M16 8v8"/>
                  <path d="M12 11v5"/>
                </svg>
              }
            />
            
            <MetricCard
              title="Magnetic Field Bz"
              value={data?.magneticFieldBz !== undefined ? `${renderSafeValue(data.magneticFieldBz, 1)} nT` : 'N/A'}
              description="North-south IMF component"
              status={data?.magneticFieldBz !== undefined ? getMagneticFieldStatus(data.magneticFieldBz) : 'low'}
              trend={data?.magneticFieldBz !== undefined ? (data.magneticFieldBz < -2 ? 'down' : 'stable') : undefined}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cosmic-storm">
                  <path d="M12 2v8"/>
                  <path d="m4.93 10.93 1.41 1.41"/>
                  <path d="M2 18h2"/>
                  <path d="M20 18h2"/>
                  <path d="m19.07 10.93-1.41 1.41"/>
                  <path d="M22 22H2"/>
                  <path d="m16 16-4 4-4-4"/>
                  <path d="M12 16V10"/>
                </svg>
              }
            />
            
            <MetricCard
              title="X-Ray Flux"
              value={data?.xRayFlux !== undefined ? renderSafeValue(data.xRayFlux, null, '') : 'N/A'}
              description="Solar X-ray emission level"
              status={data?.xRayFlux !== undefined ? getXRayStatus(data.xRayFlux) : 'low'}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-solar-active">
                  <path d="m8 18 4-14 4 14"/>
                  <path d="M18 9 7 15"/>
                  <path d="m7 9 11 6"/>
                </svg>
              }
            />
            
            <MetricCard
              title="Kp Index"
              value={data?.kpIndex !== undefined ? renderSafeValue(data.kpIndex, 1) : 'N/A'}
              description="Geomagnetic activity (0-9)"
              status={data?.activityLevel || 'low'}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-alert-moderate">
                  <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
                  <path d="M12 8v8"/>
                  <path d="m8.5 14 7-4"/>
                  <path d="m8.5 10 7 4"/>
                </svg>
              }
            />
            
            <MetricCard
              title="Activity Level"
              value={data?.activityLevel ? data.activityLevel.toUpperCase() : 'N/A'}
              description="Overall space weather status"
              status={data?.activityLevel || 'low'}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-alert-moderate">
                  <path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SolarDataPanel;
