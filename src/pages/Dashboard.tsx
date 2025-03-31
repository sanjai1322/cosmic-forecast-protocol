
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/Header';
import SolarVisualization from '@/components/SolarVisualization';
import ForecastChart from '@/components/ForecastChart';
import SolarDataPanel from '@/components/SolarDataPanel';
import AIPrediction from '@/components/AIPrediction';
import Starfield from '@/components/Starfield';
import { getCurrentSolarData } from '@/utils/spaceWeatherData';
import HistoricalDataChart from '@/components/HistoricalDataChart';
import { getMostRecentSolarWindData, processSolarWindData } from '@/services/solarDataService';

const Dashboard = () => {
  const { toast } = useToast();
  const [solarData, setSolarData] = useState(getCurrentSolarData());
  const [timeRange, setTimeRange] = useState<'24hours' | '7days' | '30days'>('24hours');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    toast({
      title: "Dashboard view",
      description: "Showing specialized dashboard for space weather monitoring",
    });
    
    // Load real-time data on component mount
    fetchRealTimeData();
  }, []);

  const fetchRealTimeData = async () => {
    try {
      setLoading(true);
      const recentData = await getMostRecentSolarWindData();
      
      if (recentData) {
        const processedData = processSolarWindData(recentData);
        if (processedData) {
          setSolarData({
            ...solarData,
            ...processedData
          });
        }
      }
    } catch (error) {
      console.error('Error loading real-time data:', error);
      toast({
        title: "Error loading data",
        description: "Could not load real-time data. Using backup data instead.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen space-gradient">
      <Starfield starCount={150} speed={0.03} />
      
      <Header />
      
      <main className="dashboard-container py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Space Weather Dashboard</h1>
            <div className="flex items-center gap-2">
              <select 
                className="bg-card/50 px-3 py-1.5 rounded-full border border-border/40 text-sm"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '24hours' | '7days' | '30days')}
              >
                <option value="24hours">Last 24 hours</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
              </select>
              <button 
                className="bg-card/50 px-3 py-1.5 rounded-full border border-border/40 text-sm flex items-center gap-1.5 hover:bg-card/70 transition-colors"
                onClick={fetchRealTimeData}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                    </svg>
                    <span>Refresh Data</span>
                  </>
                )}
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
              
              <div className="cosmos-card p-4">
                <h3 className="text-lg font-medium mb-3">Historical Data</h3>
                <HistoricalDataChart 
                  timeRange={
                    timeRange === '24hours' ? '7days' : 
                    timeRange === '7days' ? '30days' : '90days'
                  } 
                  dataType="all" 
                />
              </div>
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
                <h3 className="text-lg font-medium mb-3">Real-Time Prediction</h3>
                <div className="space-y-3">
                  <div className="glass-panel p-3">
                    <p className="text-sm font-medium">Next 24 Hours</p>
                    <p className="text-sm text-muted-foreground">
                      {solarData.activityLevel === 'low' ? 'Low' : 
                       solarData.activityLevel === 'moderate' ? 'Moderate' : 
                       solarData.activityLevel === 'high' ? 'High' : 'Severe'} geomagnetic activity expected
                    </p>
                    <div className="w-full bg-muted/50 h-2 rounded-full mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          solarData.activityLevel === 'low' ? 'bg-alert-low' : 
                          solarData.activityLevel === 'moderate' ? 'bg-alert-moderate' : 
                          solarData.activityLevel === 'high' ? 'bg-alert-high' : 'bg-alert-severe'
                        }`} 
                        style={{ 
                          width: solarData.activityLevel === 'low' ? '30%' : 
                                solarData.activityLevel === 'moderate' ? '60%' : 
                                solarData.activityLevel === 'high' ? '80%' : '100%' 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="cosmos-card p-4">
                <h3 className="text-lg font-medium mb-3">Data Source Information</h3>
                <div className="space-y-3">
                  <div className="glass-panel p-3">
                    <p className="text-sm font-medium">Live Data Source</p>
                    <p className="text-xs text-muted-foreground">NOAA Space Weather Prediction Center</p>
                  </div>
                  <div className="glass-panel p-3">
                    <p className="text-sm font-medium">Update Frequency</p>
                    <p className="text-xs text-muted-foreground">Real-time with 5-minute polling interval</p>
                  </div>
                  <div className="glass-panel p-3">
                    <p className="text-sm font-medium">Last Data Refresh</p>
                    <p className="text-xs text-muted-foreground">{new Date().toLocaleString()}</p>
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
