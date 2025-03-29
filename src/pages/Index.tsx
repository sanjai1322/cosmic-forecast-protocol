
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import SolarVisualization from '@/components/SolarVisualization';
import ForecastChart, { ForecastDataPoint } from '@/components/ForecastChart';
import SolarDataPanel from '@/components/SolarDataPanel';
import AIPrediction from '@/components/AIPrediction';
import Starfield from '@/components/Starfield';
import { SolarData, getCurrentSolarData, subscribeToSolarData } from '@/utils/spaceWeatherData';
import { fetchSolarWindData, fetchSpaceWeatherAlerts, getMostRecentSolarWindData, processSolarWindData } from '@/services/solarDataService';
import { predictSpaceWeather } from '@/services/mlModelService';
import axios from 'axios';

const Index = () => {
  const { toast } = useToast();
  const [solarData, setSolarData] = useState<SolarData>(getCurrentSolarData());
  const [realTimeData, setRealTimeData] = useState<SolarData | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mlPrediction, setMlPrediction] = useState<any>(null);
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);

  useEffect(() => {
    // Initial data load from mock data (backup)
    setSolarData(getCurrentSolarData());
    
    // Load real-time data from NOAA API
    const fetchRealTimeData = async () => {
      try {
        setLoading(true);
        
        // Fetch solar wind data
        const recentData = await getMostRecentSolarWindData();
        const processedData = processSolarWindData(recentData);
        
        if (processedData) {
          setSolarData({
            ...solarData,
            ...processedData
          });
          setRealTimeData(processedData);
          
          // Generate ML prediction based on current data
          const prediction = predictSpaceWeather(
            processedData.kpIndex,
            processedData.solarWindSpeed,
            processedData.magneticFieldBz
          );
          setMlPrediction(prediction);
          
          // Process forecast data for the chart
          if (prediction && prediction.forecast) {
            const chartData = prediction.forecast.map((point: any) => {
              // Determine activity level based on kpIndex
              let activityLevel: 'low' | 'moderate' | 'high' | 'severe' = 'low';
              if (point.kpIndex >= 7) {
                activityLevel = 'severe';
              } else if (point.kpIndex >= 5) {
                activityLevel = 'high';
              } else if (point.kpIndex >= 3) {
                activityLevel = 'moderate';
              }
              
              return {
                period: new Date(point.time).toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: 'numeric'
                }),
                kpIndex: point.kpIndex,
                solarWindSpeed: point.solarWindSpeed,
                solarFlaresProbability: point.confidence * 0.3,
                geomagneticStormProbability: point.geomagneticStormProbability,
                radiationStormProbability: point.geomagneticStormProbability * 0.7,
                predictionConfidence: point.confidence,
                activityLevel
              } as ForecastDataPoint;
            });
            
            setForecastData(chartData);
          }
          
          toast({
            title: "Data updated",
            description: "Real-time solar data has been loaded",
          });
        }
        
        // Fetch alerts
        try {
          const alertsData = await fetchSpaceWeatherAlerts();
          if (alertsData && alertsData.length > 0) {
            const formattedAlerts = alertsData.slice(0, 4).map(alert => {
              // Determine severity level based on message content
              let level: 'low' | 'moderate' | 'high' | 'severe' = 'low';
              if (alert.message && alert.message.includes('WARNING')) level = 'high';
              else if (alert.message && alert.message.includes('WATCH')) level = 'moderate';
              
              // Format the time
              const issueTime = new Date(alert.issueTime || new Date());
              const timeAgo = getTimeAgo(issueTime);
              
              return {
                time: timeAgo,
                event: alert.message ? (alert.message.split('\n')[0] || 'Space weather alert') : 'Space weather alert',
                level
              };
            });
            setAlerts(formattedAlerts);
          }
        } catch (alertError) {
          console.error('Error fetching space weather alerts:', alertError);
          // Continue with the app even if alerts fail to load
        }
        
      } catch (error) {
        console.error('Error loading real-time data:', error);
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "Could not load real-time data. Using backup data instead.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchRealTimeData();
    
    // Subscribe to periodic updates (every 5 minutes)
    const intervalId = setInterval(fetchRealTimeData, 5 * 60 * 1000);
    
    // Backup data subscription
    const unsubscribe = subscribeToSolarData((newData) => {
      // Only use if we don't have real data
      if (!realTimeData) {
        setSolarData(newData);
      }
    }, 30000);
    
    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, []);

  // Helper function to format time ago
  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };

  // Safely render values with null checks to prevent "cannot read property of undefined" errors
  const renderSafeValue = (value: any, decimals: number = 1): string => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number') return value.toFixed(decimals);
    return String(value);
  };

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
                solarActivityLevel={solarData.activityLevel || 'moderate'}
              />
              <AIPrediction
                className="md:col-span-1"
                data={mlPrediction ? {
                  timestamp: new Date().toISOString(),
                  prediction: `${mlPrediction.summarizedRisk?.toUpperCase() || 'MODERATE'} geomagnetic activity in the next 24-48 hours`,
                  confidence: mlPrediction.confidence || 0.65,
                  analysisFactors: [
                    `Current Kp index: ${solarData.kpIndex ? renderSafeValue(solarData.kpIndex) : 'N/A'}`,
                    `Solar wind speed: ${solarData.solarWindSpeed ? renderSafeValue(solarData.solarWindSpeed, 0) : 'N/A'} km/s`,
                    `Magnetic field Bz: ${solarData.magneticFieldBz ? renderSafeValue(solarData.magneticFieldBz) : 'N/A'} nT`,
                    "CNN-LSTM neural network prediction"
                  ],
                  riskLevel: mlPrediction.summarizedRisk || 'moderate'
                } : undefined}
              />
            </div>
            
            <SolarDataPanel data={solarData} />
          </div>
          
          {/* Right column */}
          <div className="lg:col-span-1 space-y-6">
            <ForecastChart data={forecastData} />
            
            <div className="cosmos-card p-4">
              <h3 className="text-lg font-medium mb-3">Recent Space Weather Events</h3>
              <div className="space-y-3">
                {(alerts.length > 0 ? alerts : [
                  { time: '2 hours ago', event: 'C3.2 class solar flare detected on the eastern limb', level: 'low' },
                  { time: '6 hours ago', event: 'Increased solar wind speed (580 km/s) from coronal hole', level: 'moderate' },
                  { time: '1 day ago', event: 'Southward turning of IMF Bz (-8.5 nT)', level: 'moderate' },
                  { time: '2 days ago', event: 'M1.5 class solar flare with radio blackout', level: 'high' }
                ]).map((item, idx) => (
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
