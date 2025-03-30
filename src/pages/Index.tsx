
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/Header';
import SolarVisualization from '@/components/SolarVisualization';
import ForecastChart, { ForecastDataPoint } from '@/components/ForecastChart';
import SolarDataPanel from '@/components/SolarDataPanel';
import AIPrediction from '@/components/AIPrediction';
import Starfield from '@/components/Starfield';
import { SolarData, getCurrentSolarData, subscribeToSolarData } from '@/utils/spaceWeatherData';
import { fetchSolarWindData, fetchSpaceWeatherAlerts, getMostRecentSolarWindData, processSolarWindData } from '@/services/solarDataService';
import { predictSpaceWeather } from '@/services/mlModelService';
import { playNotificationSound, playActivityLevelSound } from '@/services/notificationService';
import MLModelInfo from '@/components/MLModelInfo';

// Define alert level type to ensure consistency
type AlertLevel = 'low' | 'moderate' | 'high' | 'severe';

const Index = () => {
  const { toast } = useToast();
  const [solarData, setSolarData] = useState<SolarData>(getCurrentSolarData());
  const [realTimeData, setRealTimeData] = useState<SolarData | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mlPrediction, setMlPrediction] = useState<any>(null);
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const [dataRefreshTime, setDataRefreshTime] = useState<Date>(new Date());
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

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
  
  // Function to show toast notifications with sound
  const showNotification = useCallback((title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    toast({
      title,
      description,
      variant,
    });
    
    // Play corresponding sound based on notification type
    if (isSoundEnabled) {
      if (variant === 'destructive') {
        playNotificationSound('error');
      } else {
        playNotificationSound('info');
      }
    }
  }, [toast, isSoundEnabled]);

  // Function to fetch and process forecast data
  const processForecastData = useCallback((prediction: any) => {
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
  }, []);

  // Function to fetch real-time data
  const fetchRealTimeData = useCallback(async () => {
    // Prevent multiple simultaneous refreshes
    if (isRefreshing) {
      console.log('Data refresh already in progress, skipping this request');
      return;
    }

    try {
      setIsRefreshing(true);
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
        setDataRefreshTime(new Date());
        
        // Play sound based on activity level if it changed
        if (isSoundEnabled && solarData.activityLevel !== processedData.activityLevel) {
          playActivityLevelSound(processedData.activityLevel);
        }
        
        // Generate ML prediction based on current data
        setModelLoading(true);
        const prediction = await predictSpaceWeather(
          processedData.kpIndex,
          processedData.solarWindSpeed,
          processedData.magneticFieldBz
        );
        setMlPrediction(prediction);
        setModelLoading(false);
        
        // Process forecast data for the chart
        processForecastData(prediction);
        
        showNotification(
          "Data updated",
          "Real-time solar data has been loaded",
        );
      }
      
      // Fetch alerts
      try {
        const alertsData = await fetchSpaceWeatherAlerts();
        if (alertsData && alertsData.length > 0) {
          const formattedAlerts = alertsData.slice(0, 4).map(alert => {
            // Determine severity level based on message content
            let level: AlertLevel = 'low';
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
          
          // Play alert sound if there's a high severity alert
          if (isSoundEnabled && formattedAlerts.some(alert => {
            // Use string literal comparison to avoid TypeScript errors
            return alert.level === 'high' || alert.level === 'severe' as AlertLevel;
          })) {
            playNotificationSound('alert');
          }
        }
      } catch (alertError) {
        console.error('Error fetching space weather alerts:', alertError);
        // Continue with the app even if alerts fail to load
      }
      
    } catch (error) {
      console.error('Error loading real-time data:', error);
      showNotification(
        "Error loading data",
        "Could not load real-time data. Using backup data instead.",
        "destructive"
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [solarData, showNotification, processForecastData, isSoundEnabled, isRefreshing]);

  // Toggle sound
  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    showNotification(
      "Sound " + (!isSoundEnabled ? "enabled" : "disabled"),
      "Notification sounds are now " + (!isSoundEnabled ? "enabled" : "disabled")
    );
  };
  
  useEffect(() => {
    // Initial fetch
    fetchRealTimeData();
    
    // Subscribe to periodic updates (every 15 minutes instead of 5)
    const intervalId = setInterval(fetchRealTimeData, 15 * 60 * 1000);
    
    // Backup data subscription
    const unsubscribe = subscribeToSolarData((newData) => {
      // Only use if we don't have real data
      if (!realTimeData) {
        setSolarData(newData);
      }
    }, 60000); // Slowed down from 30000ms to 60000ms
    
    // Welcome notification with sound
    setTimeout(() => {
      showNotification(
        "Welcome to Cosmic Forecast Protocol",
        "Using CNN-LSTM neural network for space weather prediction"
      );
    }, 2000); // Delayed welcome message to avoid overlap
    
    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [fetchRealTimeData, realTimeData, showNotification]);

  // Add data source information for display
  const dataSourceInfo = {
    real: "NOAA SWPC and NASA DONKI APIs with fallback to synthetic data",
    algorithm: "CNN-LSTM (Convolutional Neural Network-Long Short Term Memory) hybrid model",
    refreshInterval: "Every 15 minutes"
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
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                Last data refresh: {dataRefreshTime.toLocaleString()}
              </div>
              <div className="text-xs flex items-center justify-center gap-1.5 text-muted-foreground">
                <span>Data: {realTimeData ? "Live API" : "Synthetic"}</span>
              </div>
              <button 
                onClick={toggleSound}
                className="text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="lucide lucide-volume-2"
                >
                  {isSoundEnabled ? (
                    <>
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </>
                  ) : (
                    <>
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </>
                  )}
                </svg>
                {isSoundEnabled ? 'Sound On' : 'Sound Off'}
              </button>
              <button 
                onClick={fetchRealTimeData} 
                disabled={loading || isRefreshing}
                className="text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={`${loading ? 'animate-spin' : ''}`}
                >
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
          
          {/* Right column */}
          <div className="lg:col-span-1 space-y-6">
            {modelLoading ? (
              <div className="cosmos-card p-4 flex items-center justify-center h-[300px]">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full border-4 border-t-solar border-r-solar/30 border-b-solar/10 border-l-solar/30 animate-spin mb-3"></div>
                  <p className="text-sm">Loading CNN-LSTM Model...</p>
                </div>
              </div>
            ) : (
              <ForecastChart data={forecastData} />
            )}
            
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
            
            <div className="cosmos-card p-4">
              <h3 className="text-lg font-medium mb-2">Data Sources & Model</h3>
              <div className="space-y-2">
                <div className="glass-panel p-3">
                  <p className="text-sm font-medium">Data Source</p>
                  <p className="text-xs text-muted-foreground">{dataSourceInfo.real}</p>
                </div>
                <div className="glass-panel p-3">
                  <p className="text-sm font-medium">Algorithm</p>
                  <p className="text-xs text-muted-foreground">{dataSourceInfo.algorithm}</p>
                </div>
                <div className="glass-panel p-3">
                  <p className="text-sm font-medium">Refresh Interval</p>
                  <p className="text-xs text-muted-foreground">{dataSourceInfo.refreshInterval}</p>
                </div>
              </div>
            </div>
            
            <MLModelInfo className="hidden md:block" />
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
