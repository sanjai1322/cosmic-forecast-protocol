
import React from 'react';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import SolarVisualization from '@/components/SolarVisualization';
import ForecastChart from '@/components/ForecastChart';
import SolarDataPanel from '@/components/SolarDataPanel';
import AIPrediction from '@/components/AIPrediction';
import Starfield from '@/components/Starfield';
import { getCurrentSolarData } from '@/utils/spaceWeatherData';

const Dashboard = () => {
  const { toast } = useToast();
  const solarData = getCurrentSolarData();

  React.useEffect(() => {
    toast({
      title: "Dashboard view",
      description: "Showing specialized dashboard for space weather monitoring",
    });
  }, []);

  return (
    <div className="min-h-screen space-gradient">
      <Starfield />
      
      <Header />
      
      <main className="dashboard-container py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Space Weather Dashboard</h1>
            <div className="flex items-center gap-2">
              <select className="bg-card/50 px-3 py-1.5 rounded-full border border-border/40 text-sm">
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
              <button className="bg-card/50 px-3 py-1.5 rounded-full border border-border/40 text-sm">
                Refresh Data
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SolarVisualization 
                  className="md:col-span-1" 
                  solarActivityLevel={solarData.activityLevel || 'moderate'}
                />
                <div className="cosmos-card p-4">
                  <h3 className="text-lg font-medium mb-3">Solar Activity Metrics</h3>
                  <div className="space-y-3">
                    <div className="glass-panel p-3">
                      <p className="text-sm font-medium">Current Kp Index</p>
                      <p className="text-2xl font-bold">{solarData.kpIndex.toFixed(1)}</p>
                    </div>
                    <div className="glass-panel p-3">
                      <p className="text-sm font-medium">Solar Wind Speed</p>
                      <p className="text-2xl font-bold">{solarData.solarWindSpeed.toFixed(0)} km/s</p>
                    </div>
                    <div className="glass-panel p-3">
                      <p className="text-sm font-medium">Magnetic Field (Bz)</p>
                      <p className="text-2xl font-bold">{solarData.magneticFieldBz.toFixed(1)} nT</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <SolarDataPanel data={solarData} />
            </div>
            
            <div className="lg:col-span-1 space-y-6">
              <div className="cosmos-card p-4">
                <h3 className="text-lg font-medium mb-3">System Status</h3>
                <div className="space-y-3">
                  <div className="glass-panel p-3 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 bg-alert-low" />
                    <div>
                      <p className="text-sm">All systems operational</p>
                      <p className="text-xs text-muted-foreground">Last checked: 5 minutes ago</p>
                    </div>
                  </div>
                  <div className="glass-panel p-3 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 bg-alert-moderate" />
                    <div>
                      <p className="text-sm">Neural network processing at 87% capacity</p>
                      <p className="text-xs text-muted-foreground">10 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="cosmos-card p-4">
                <h3 className="text-lg font-medium mb-3">Recent Predictions</h3>
                <div className="space-y-3">
                  <div className="glass-panel p-3">
                    <p className="text-sm font-medium">Next 24 Hours</p>
                    <p className="text-sm text-muted-foreground">Moderate geomagnetic activity expected</p>
                    <div className="w-full bg-muted/50 h-2 rounded-full mt-2">
                      <div className="bg-alert-moderate h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <div className="glass-panel p-3">
                    <p className="text-sm font-medium">48-72 Hours</p>
                    <p className="text-sm text-muted-foreground">Low geomagnetic activity expected</p>
                    <div className="w-full bg-muted/50 h-2 rounded-full mt-2">
                      <div className="bg-alert-low h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                </div>
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

export default Dashboard;
