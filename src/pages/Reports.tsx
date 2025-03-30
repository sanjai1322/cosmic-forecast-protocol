
import React from 'react';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import Starfield from '@/components/Starfield';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getCurrentSolarData, getSpaceWeatherForecast } from '@/utils/spaceWeatherData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchSpaceWeatherAlerts } from '@/services/solarDataService';

const Reports = () => {
  const { toast } = useToast();
  const solarData = getCurrentSolarData();
  const forecastData = getSpaceWeatherForecast();
  const [alerts, setAlerts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Load alerts
  React.useEffect(() => {
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
          
          <Tabs defaultValue="alerts">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="alerts">Alerts & Warnings</TabsTrigger>
              <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
              <TabsTrigger value="historical">Historical Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="alerts" className="space-y-6">
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
                          <TableRow key={idx}>
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
                            <div className="absolute bottom-0 w-full bg-alert-low h-12 rounded"></div>
                          </div>
                          <p className="mt-2 text-sm">Low</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-full bg-alert-moderate/20 h-40 rounded relative">
                            <div className="absolute bottom-0 w-full bg-alert-moderate h-24 rounded"></div>
                          </div>
                          <p className="mt-2 text-sm">Moderate</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-full bg-alert-high/20 h-40 rounded relative">
                            <div className="absolute bottom-0 w-full bg-alert-high h-8 rounded"></div>
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
                        <div className="bg-solar h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>NASA DONKI</span>
                        <span>22%</span>
                      </div>
                      <div className="w-full bg-muted/50 h-2 rounded-full">
                        <div className="bg-solar h-2 rounded-full" style={{ width: '22%' }}></div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>ESA Space Weather</span>
                        <span>10%</span>
                      </div>
                      <div className="w-full bg-muted/50 h-2 rounded-full">
                        <div className="bg-solar h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="forecasts" className="space-y-6">
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
                        <TableRow key={idx}>
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
                        <div className="bg-solar h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Solar Flare Prediction</span>
                        <span className="text-sm font-medium">76%</span>
                      </div>
                      <div className="w-full bg-muted/50 h-2 rounded-full">
                        <div className="bg-solar h-2 rounded-full" style={{ width: '76%' }}></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Radiation Storm Prediction</span>
                        <span className="text-sm font-medium">65%</span>
                      </div>
                      <div className="w-full bg-muted/50 h-2 rounded-full">
                        <div className="bg-solar h-2 rounded-full" style={{ width: '65%' }}></div>
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
            
            <TabsContent value="historical" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historical Space Weather Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <select className="bg-card/50 px-3 py-1.5 rounded-full border border-border/40 text-sm">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                        <option>Last year</option>
                      </select>
                      <select className="bg-card/50 px-3 py-1.5 rounded-full border border-border/40 text-sm">
                        <option>All parameters</option>
                        <option>Kp Index</option>
                        <option>Solar Wind</option>
                        <option>Solar Flares</option>
                      </select>
                    </div>
                    <button className="bg-solar px-3 py-1.5 rounded-full text-background text-sm">
                      Download CSV
                    </button>
                  </div>
                  
                  <div className="h-60 flex items-center justify-center bg-card/50 rounded-lg border border-border/40">
                    <p className="text-muted-foreground">Historical data chart visualization would render here</p>
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
                      <TableRow>
                        <TableCell>2023-06-14</TableCell>
                        <TableCell>3.2</TableCell>
                        <TableCell>482 km/s</TableCell>
                        <TableCell>-4.3</TableCell>
                        <TableCell>2.1e-6</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2023-06-13</TableCell>
                        <TableCell>2.8</TableCell>
                        <TableCell>456 km/s</TableCell>
                        <TableCell>-2.1</TableCell>
                        <TableCell>1.8e-6</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2023-06-12</TableCell>
                        <TableCell>4.5</TableCell>
                        <TableCell>528 km/s</TableCell>
                        <TableCell>-6.7</TableCell>
                        <TableCell>3.4e-6</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2023-06-11</TableCell>
                        <TableCell>3.7</TableCell>
                        <TableCell>501 km/s</TableCell>
                        <TableCell>-5.2</TableCell>
                        <TableCell>2.6e-6</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
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
