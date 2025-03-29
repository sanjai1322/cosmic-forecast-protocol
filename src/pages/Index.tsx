
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SolarVisualization from '@/components/SolarVisualization';
import ForecastChart from '@/components/ForecastChart';
import SolarDataPanel from '@/components/SolarDataPanel';
import AIPrediction from '@/components/AIPrediction';
import Starfield from '@/components/Starfield';
import { SolarData, getCurrentSolarData, subscribeToSolarData } from '@/utils/spaceWeatherData';

const Index = () => {
  const [solarData, setSolarData] = useState<SolarData>(getCurrentSolarData());

  useEffect(() => {
    // Initial data load
    setSolarData(getCurrentSolarData());
    
    // Subscribe to updates
    const unsubscribe = subscribeToSolarData((newData) => {
      setSolarData(newData);
    }, 15000); // Update every 15 seconds
    
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen space-gradient">
      <Starfield />
      
      <Header />
      
      <main className="dashboard-container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SolarVisualization 
                className="md:col-span-1" 
                solarActivityLevel={solarData.activityLevel}
              />
              <AIPrediction className="md:col-span-1" />
            </div>
            
            <SolarDataPanel data={solarData} />
          </div>
          
          {/* Right column */}
          <div className="lg:col-span-1 space-y-6">
            <ForecastChart />
            
            <div className="cosmos-card p-4">
              <h3 className="text-lg font-medium mb-3">Recent Space Weather Events</h3>
              <div className="space-y-3">
                {[
                  { time: '2 hours ago', event: 'C3.2 class solar flare detected on the eastern limb', level: 'low' },
                  { time: '6 hours ago', event: 'Increased solar wind speed (580 km/s) from coronal hole', level: 'moderate' },
                  { time: '1 day ago', event: 'Southward turning of IMF Bz (-8.5 nT)', level: 'moderate' },
                  { time: '2 days ago', event: 'M1.5 class solar flare with radio blackout', level: 'high' }
                ].map((item, idx) => (
                  <div key={idx} className="glass-panel p-3 flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      item.level === 'low' ? 'bg-alert-low' : 
                      item.level === 'moderate' ? 'bg-alert-moderate' : 
                      'bg-alert-high'
                    }`} />
                    <div>
                      <p className="text-sm">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-4 border-t border-border/40">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Cosmic Forecast Protocol • Space Weather Prediction System
          </div>
          <div className="text-xs text-muted-foreground">
            Data sources: NOAA SWPC, NASA OMNI, GOES, SDO
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
