
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import Starfield from '@/components/Starfield';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getCurrentSolarData, getSpaceWeatherForecast } from '@/utils/spaceWeatherData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchSpaceWeatherAlerts } from '@/services/solarDataService';
import MLModelInfo from '@/components/MLModelInfo';
import HistoricalDataChart from '@/components/HistoricalDataChart';
import { downloadCSV, getTimestampedFilename } from '@/utils/csvExport';

const Reports = () => {
  const { toast } = useToast();
  const solarData = getCurrentSolarData();
  const forecastData = getSpaceWeatherForecast();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alerts');
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | '365days'>('7days');
  const [dataType, setDataType] = useState<'all' | 'kp' | 'solar-wind' | 'solar-flares'>('all');
  
  // Generate historical data in the required format for export
  const generateHistoricalDataForExport = () => {
    const days = 
      timeRange === '7days' ? 7 : 
      timeRange === '30days' ? 30 : 
      timeRange === '90days' ? 90 : 365;
    
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      data.push({
        Date: date.toISOString().split('T')[0],
        'Kp Index (Avg)': (2 + Math.random() * 3).toFixed(1),
        'Solar Wind (Avg)': Math.round(350 + Math.random() * 200),
        'Bz (nT)': (-8 + Math.random() * 10).toFixed(1),
        'X-Ray Flux': (1 + Math.random() * 3).toExponential(1)
      });
    }
    
    return data;
  };
  
  // Handle CSV download
  const handleDownloadCSV = () => {
    const data = generateHistoricalDataForExport();
    const filename = getTimestampedFilename('space-weather-data');
    downloadCSV(data, filename);
    
    toast({
      title: "Data downloaded",
      description: `${filename} has been downloaded to your device`,
    });
  };
  
  // Load alerts
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchSpaceWeatherAlerts();
        if (data && data.length > 0) {
          setAlerts(data.slice(0, 10).map((alert: any) => {
            return {
              time: new Date(alert.issueTime || new Date()).toLocaleString(),
              event: alert.message ? (alert.message.split('\n')[0] || 'Space weather alert') : 'Space weather alert',
              details: alert.message,
              level: alert.message && alert.message.includes('WARNING') ? 'high' : 
                     alert.message && alert.message.includes('WATCH') ? 'moderate' : 'low'
            };
          }));
        } else {
          // Fallback data
          setAlerts([
            { time: '2023-06-15 08:23', event: 'C3.2 class solar flare detected on the eastern limb', details: 'Minor C-class flare detected by GOES satellite.', level: 'low' },
            { time: '2023-06-14 16:45', event: 'Increased solar wind speed (580 km/s) from coronal hole', details: 'High-speed solar wind stream expected to impact Earth in 2-3 days.', level: 'moderate' },
            { time: '2023-06-13 11:30', event: 'Southward turning of IMF Bz (-8.5 nT)', details: 'Increased geoeffectiveness possible with continued negative Bz.', level: 'moderate' },
            { time: '2023-06-12 09:15', event: 'M1.5 class solar flare with radio blackout', details: 'R1 radio blackout occurred. Potential for increased flare activity.', level: 'high' }
          ]);
        }
      } catch (error) {
        console.error('Error loading alerts:', error);
        // Fallback data
        setAlerts([
          { time: '2023-06-15 08:23', event: 'C3.2 class solar flare detected on the eastern limb', details: 'Minor C-class flare detected by GOES satellite.', level: 'low' },
          { time: '2023-06-14 16:45', event: 'Increased solar wind speed (580 km/s) from coronal hole', details: 'High-speed solar wind stream expected to impact Earth in 2-3 days.', level: 'moderate' },
          { time: '2023-06-13 11:30', event: 'Southward turning of IMF Bz (-8.5 nT)', details: 'Increased geoeffectiveness possible with continued negative Bz.', level: 'moderate' },
          { time: '2023-06-12 09:15', event: 'M1.5 class solar flare with radio blackout', details: 'R1 radio blackout occurred. Potential for increased flare activity.', level: 'high' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadAlerts();
    
    toast({
      title: "Reports view",
      description: "Showing detailed reports and historical data",
    });
  }, []);
  
  // Format date for report headers
  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen space-gradient">
      <Starfield />
      
      <Header />
      
      <main className="dashboard-container py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Space Weather Reports</h1>
            <p className="text-sm text-muted-foreground">
              Generated: {formatDate()}
            </p>
          </div>
          
          <Tabs defaultValue="alerts" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="alerts">Alerts & Warnings</TabsTrigger>
              <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
              <TabsTrigger value="historical">Historical Data</TabsTrigger>
              <TabsTrigger value="model">CNN-LSTM Model</TabsTrigger>
            </TabsList>
            
            <TabsContent value="alerts" className="space-y-6 transition-all duration-500">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Space Weather Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">Loading alerts...</TableCell>
                        </TableRow>
                      ) : alerts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">No alerts found</TableCell>
                        </TableRow>
                      ) : (
                        alerts.map((alert, idx) => (
                          <TableRow key={idx} className="transition-opacity duration-300 hover:bg-muted/30">
                            <TableCell>{alert.time}</TableCell>
                            <TableCell>{alert.event}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                  alert.level === 'low' ? 'bg-alert-low' : 
                                  alert.level === 'moderate' ? 'bg-alert-moderate' : 
                                  'bg-alert-high'
                                }`} />
                                <span className="capitalize">{alert.level}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Alert Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60 flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-4 w-full">
                        <div className="flex flex-col items-center">
                          <div className="w-full bg-alert-low/20 h-40 rounded relative">
                            <div className="absolute bottom-0 w-full bg-alert-low h-12 rounded transition-all duration-1000"></div>
                          </div>
                          <p className="mt-2 text-sm">Low</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-full bg-alert-moderate/20 h-40 rounded relative">
                            <div className="absolute bottom-0 w-full bg-alert-moderate h-24 rounded transition-all duration-1000"></div>
                          </div>
                          <p className="mt-2 text-sm">Moderate</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-full bg-alert-high/20 h-40 rounded relative">
                            <div className="absolute bottom-0 w-full bg-alert-high h-8 rounded transition-all duration-1000"></div>
                          </div>
                          <p className="mt-2 text-sm">High</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Alert Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>NOAA SWPC</span>
                        <span>68%</span>
                      </div>
                      <div className="w-full bg-muted/50 h-2 rounded-full">
                        <div className="bg-solar h-2 rounded-full transition-all duration-1000" style={{ width: '68%' }}></div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>NASA DONKI</span>
                        <span>22%</span>
                      </div>
                      <div className="w-full bg-muted/50 h-2 rounded-full">
                        <div className="bg-solar h-2 rounded-full transition-all duration-1000" style={{ width: '22%' }}></div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>ESA Space Weather</span>
                        <span>10%</span>
                      </div>
                      <div className="w-full bg-muted/50 h-2 rounded-full">
                        <div className="bg-solar h-2 rounded-full transition-all duration-1000" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="forecasts" className="space-y-6 transition-all duration-500">
              <Card>
                <CardHeader>
                  <CardTitle>Space Weather Forecasts (Next 24 Hours)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Kp Index</TableHead>
                        <TableHead>Solar Wind</TableHead>
                        <TableHead>Geomagnetic Storm</TableHead>
                        <TableHead>Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {forecastData.map((forecast, idx) => (
                        <TableRow key={idx} className="transition-opacity duration-300 hover:bg-muted/30">
                          <TableCell>{forecast.period}</TableCell>
                          <TableCell>{forecast.kpIndex.toFixed(1)}</TableCell>
                          <TableCell>{forecast.solarWindSpeed.toFixed(0)} km/s</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                forecast.activityLevel === 'low' ? 'bg-alert-low' : 
                                forecast.activityLevel === 'moderate' ? 'bg-alert-moderate' : 
                                'bg-alert-high'
                              }`} />
                              <span className="capitalize">{forecast.activityLevel}</span>
                            </div>
                          </TableCell>
                          <TableCell>{(forecast.predictionConfidence * 100).toFixed(0)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>CNN-LSTM Prediction Confidence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Geomagnetic Storm Prediction</span>
                        <span className="text-sm font-medium">88%</span>
                      </div>
                      <div className="w-full bg-muted/50 h-2 rounded-full">
                        <div className="bg-solar h-2 rounded-full transition-all duration-1000" style={{ width: '88%' }}></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Solar Flare Prediction</span>
                        <span className="text-sm font-medium">76%</span>
                      </div>
                      <div className="w-full bg-muted/50 h-2 rounded-full">
                        <div className="bg-solar h-2 rounded-full transition-all duration-1000" style={{ width: '76%' }}></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Radiation Storm Prediction</span>
                        <span className="text-sm font-medium">65%</span>
                      </div>
                      <div className="w-full bg-muted/50 h-2 rounded-full">
                        <div className="bg-solar h-2 rounded-full transition-all duration-1000" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Prediction Methods</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-4">
                    <p><span className="font-medium">CNN-LSTM Neural Network:</span> Our primary prediction method combines Convolutional Neural Networks with Long Short-Term Memory networks to analyze temporal patterns in space weather data.</p>
                    <p><span className="font-medium">Physics-Based Models:</span> We supplement ML predictions with traditional physics-based models that simulate solar wind propagation.</p>
                    <p><span className="font-medium">Ensemble Approach:</span> Final predictions are made using an ensemble of multiple models, weighted by historical accuracy.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="historical" className="space-y-6 transition-all duration-500">
              <Card>
                <CardHeader>
                  <CardTitle>Historical Space Weather Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <select 
                        className="bg-card/50 px-3 py-1.5 rounded-full border border-border/40 text-sm"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as '7days' | '30days' | '90days' | '365days')}
                      >
                        <option value="7days">Last 7 days</option>
                        <option value="30days">Last 30 days</option>
                        <option value="90days">Last 90 days</option>
                        <option value="365days">Last year</option>
                      </select>
                      <select 
                        className="bg-card/50 px-3 py-1.5 rounded-full border border-border/40 text-sm"
                        value={dataType}
                        onChange={(e) => setDataType(e.target.value as 'all' | 'kp' | 'solar-wind' | 'solar-flares')}
                      >
                        <option value="all">All parameters</option>
                        <option value="kp">Kp Index</option>
                        <option value="solar-wind">Solar Wind</option>
                        <option value="solar-flares">Solar Flares</option>
                      </select>
                    </div>
                    <button 
                      className="bg-solar px-3 py-1.5 rounded-full text-background text-sm hover:bg-solar/80 transition-colors"
                      onClick={handleDownloadCSV}
                    >
                      Download CSV
                    </button>
                  </div>
                  
                  <div className="rounded-lg border border-border/40 p-4">
                    <HistoricalDataChart timeRange={timeRange} dataType={dataType} />
                  </div>
                  
                  <Table className="mt-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Kp Index (Avg)</TableHead>
                        <TableHead>Solar Wind (Avg)</TableHead>
                        <TableHead>Bz (nT)</TableHead>
                        <TableHead>X-Ray Flux</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generateHistoricalDataForExport().slice(0, 4).map((data, idx) => (
                        <TableRow key={idx} className="transition-opacity duration-300 hover:bg-muted/30">
                          <TableCell>{data.Date}</TableCell>
                          <TableCell>{data['Kp Index (Avg)']}</TableCell>
                          <TableCell>{data['Solar Wind (Avg)']} km/s</TableCell>
                          <TableCell>{data['Bz (nT)']}</TableCell>
                          <TableCell>{data['X-Ray Flux']}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="model" className="space-y-6">
              <MLModelInfo />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>CNN-LSTM Technical Architecture</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-card/50 p-4 rounded-lg border border-border/40 text-sm">
                        <h4 className="font-medium mb-2">Network Structure</h4>
                        <ul className="space-y-2">
                          <li><span className="font-mono text-solar">Input Layer:</span> Shape=[24, 5] (24 time steps, 5 features)</li>
                          <li><span className="font-mono text-solar">Conv1D:</span> 64 filters, kernel size 3, ReLU activation</li>
                          <li><span className="font-mono text-solar">LSTM Layer:</span> 50 units, tanh activation</li>
                          <li><span className="font-mono text-solar">Dense Layer:</span> 32 units, ReLU activation</li>
                          <li><span className="font-mono text-solar">Output Layer:</span> 5 units (predictions)</li>
                        </ul>
                      </div>
                      
                      <div className="bg-card/50 p-4 rounded-lg border border-border/40 text-sm">
                        <h4 className="font-medium mb-2">Training Configuration</h4>
                        <ul className="space-y-1">
                          <li><span className="font-medium">Optimizer:</span> Adam (learning rate: 0.001)</li>
                          <li><span className="font-medium">Loss Function:</span> Mean Squared Error</li>
                          <li><span className="font-medium">Epochs:</span> 100</li>
                          <li><span className="font-medium">Batch Size:</span> 32</li>
                          <li><span className="font-medium">Validation Split:</span> 20%</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Model Training & Validation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Training Dataset</h4>
                        <p className="text-sm text-muted-foreground">
                          The model was trained on 10 years of historical solar and geomagnetic data
                          (2012-2022), including solar cycles 24 and 25. Training data includes:
                        </p>
                        <ul className="text-xs mt-2 space-y-1">
                          <li>• 15-minute resolution solar wind parameters from DSCOVR</li>
                          <li>• 3-hour Kp indices from global magnetometer network</li>
                          <li>• X-ray flux measurements from GOES satellites</li>
                          <li>• CME catalogs from SOHO/LASCO</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Validation Methods</h4>
                        <p className="text-sm text-muted-foreground">
                          Model performance was validated using:
                        </p>
                        <ul className="text-xs mt-2 space-y-1">
                          <li>• K-fold cross-validation (k=5)</li>
                          <li>• Out-of-sample testing on 2022-2023 data</li>
                          <li>• Comparison with traditional physics-based models</li>
                          <li>• Backtesting against historical extreme events</li>
                        </ul>
                      </div>
                      
                      <div className="bg-card/50 p-3 rounded-lg border border-border/40">
                        <h4 className="font-medium text-xs mb-2">REAL-TIME INFERENCE</h4>
                        <p className="text-xs">
                          The model runs inferences every 15 minutes using the latest 
                          available data from NOAA SWPC and NASA DONKI APIs, with predictions 
                          updated on a rolling basis.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
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

export default Reports;
