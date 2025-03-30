
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import Starfield from '@/components/Starfield';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { fetchSpaceWeatherAlerts } from '@/services/solarDataService';
import StatusIndicator from '@/components/StatusIndicator';

const Alerts = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    toast({
      title: "Alerts System",
      description: "Monitoring real-time space weather alerts",
    });
    
    const loadAlerts = async () => {
      setLoading(true);
      try {
        console.log('Fetching space weather alerts...');
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
        console.error('Error fetching space weather alerts:', error);
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
    
    // Set up slower refresh interval (every 15 minutes)
    const intervalId = setInterval(loadAlerts, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
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
      
      <main className="dashboard-container py-6 transition-all duration-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Space Weather Alerts</h1>
            <p className="text-sm text-muted-foreground">
              Last updated: {formatDate()}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8">
              <Card className="transition-all duration-500">
                <CardHeader>
                  <CardTitle>Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">Loading alerts...</TableCell>
                        </TableRow>
                      ) : alerts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">No current alerts</TableCell>
                        </TableRow>
                      ) : (
                        alerts.map((alert, idx) => (
                          <TableRow key={idx} className="transition-opacity duration-300 hover:bg-muted/30">
                            <TableCell>{alert.time}</TableCell>
                            <TableCell>{alert.event}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <StatusIndicator level={alert.level} className="mr-2" />
                                <span className="capitalize">{alert.level}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">Details</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-4 space-y-6">
              <Card className="transition-all duration-500">
                <CardHeader>
                  <CardTitle>Alert Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>High Priority</span>
                      <StatusIndicator level="high" className="mr-2" />
                    </div>
                    <div className="w-full bg-muted/50 h-2 rounded-full">
                      <div className="bg-alert-high h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Moderate</span>
                      <StatusIndicator level="moderate" className="mr-2" />
                    </div>
                    <div className="w-full bg-muted/50 h-2 rounded-full">
                      <div className="bg-alert-moderate h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Low Priority</span>
                      <StatusIndicator level="low" className="mr-2" />
                    </div>
                    <div className="w-full bg-muted/50 h-2 rounded-full">
                      <div className="bg-alert-low h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-between">
                    <Button variant="outline">View All</Button>
                    <Button variant="outline">Export</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="transition-all duration-500">
                <CardHeader>
                  <CardTitle>Data Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-solar mr-2"></div>
                      NOAA Space Weather Prediction Center
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-solar mr-2"></div>
                      NASA DONKI
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-solar mr-2"></div>
                      ESA Space Weather Network
                    </li>
                  </ul>
                </CardContent>
              </Card>
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

export default Alerts;
