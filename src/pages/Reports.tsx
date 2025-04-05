import React, { useState, useEffect } from 'react';
import HistoricalDataChart from '@/components/HistoricalDataChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MLModelInfo from '@/components/MLModelInfo';
import ModelPerformanceMetrics from '@/components/ModelPerformanceMetrics';
import { Button } from '@/components/ui/button';
import { Download, FileText, BarChart, Volume2, VolumeX } from 'lucide-react';
import { downloadCSV, getTimestampedFilename } from '@/utils/csvExport';
import { setSoundsEnabled, areSoundsEnabled } from '@/services/notificationService';
import { HybridModelPerformance } from '@/models/HybridCNNLSTMModel';
import { createSpaceWeatherReport } from '@/utils/pdfExport';
import { useToast } from '@/hooks/use-toast';

const Reports = () => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | '365days'>('30days');
  const [dataType, setDataType] = useState<'all' | 'kp' | 'solar-wind' | 'solar-flares'>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(areSoundsEnabled());
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize sound state on component mount
    setSoundEnabled(areSoundsEnabled());
  }, []);

  const handleExportData = () => {
    // Sample data for export
    const data = [
      { date: '2023-01-01', kpIndex: 2.3, solarWindSpeed: 420, magneticFieldBz: -1.2 },
      { date: '2023-01-02', kpIndex: 3.1, solarWindSpeed: 450, magneticFieldBz: -2.5 },
      { date: '2023-01-03', kpIndex: 4.2, solarWindSpeed: 520, magneticFieldBz: -4.1 },
      // More data would be here in a real app
    ];

    const filename = getTimestampedFilename(`space_weather_data_${timeRange}`);
    downloadCSV(data, filename);
    
    // Show success notification
    toast({
      title: "Data Exported Successfully",
      description: `The file "${filename}" has been downloaded.`,
      duration: 3000,
    });
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    setSoundsEnabled(newState);
  };
  
  const downloadReport = (reportName: string, period: string) => {
    // Create metrics object for the report
    const metrics = {
      kpRange: "0.5 - 5.2",
      maxSolarWind: "650 km/s",
      stormOccurrence: period === "April 2025" ? "G2 (Moderate) on April 12" : "G1 (Minor) on Feb 15",
      modelAccuracy: "87%",
      avgKp: "2.7",
      maxKp: "5.2",
      avgSolarWind: "480",
      minBz: "-8.3",
      maxXRayFlux: "3.2×10−6",
      modelRMSE: HybridModelPerformance.rootMeanSquaredError.overall.toFixed(2),
      validationRMSE: HybridModelPerformance.validationMetrics.rmse.toString(),
      testRMSE: HybridModelPerformance.testMetrics.rmse.toString()
    };
    
    // Generate the report
    createSpaceWeatherReport(reportName, period, metrics);
    
    // Show success notification
    toast({
      title: "Report Generated",
      description: `"${reportName}" has been downloaded.`,
      duration: 3000,
    });
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={toggleSound}
            className="flex items-center gap-2"
            size="sm"
          >
            {soundEnabled ? (
              <>
                <Volume2 size={16} />
                Disable Sounds
              </>
            ) : (
              <>
                <VolumeX size={16} />
                Enable Sounds
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportData}
            className="flex items-center gap-2"
            size="sm"
          >
            <Download size={16} />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle>Historical Data</CardTitle>
              
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Tabs defaultValue={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                  <TabsList className="grid grid-cols-4 h-8">
                    <TabsTrigger value="7days" className="text-xs">7D</TabsTrigger>
                    <TabsTrigger value="30days" className="text-xs">30D</TabsTrigger>
                    <TabsTrigger value="90days" className="text-xs">90D</TabsTrigger>
                    <TabsTrigger value="365days" className="text-xs">1Y</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Tabs defaultValue={dataType} onValueChange={(v) => setDataType(v as any)}>
                  <TabsList className="grid grid-cols-4 h-8">
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    <TabsTrigger value="kp" className="text-xs">Kp</TabsTrigger>
                    <TabsTrigger value="solar-wind" className="text-xs">Wind</TabsTrigger>
                    <TabsTrigger value="solar-flares" className="text-xs">Flares</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <HistoricalDataChart timeRange={timeRange} dataType={dataType} />
          </CardContent>
        </Card>

        <MLModelInfo />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ModelPerformanceMetrics />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={18} />
              Analysis Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <div className="font-medium">Monthly Space Weather Review</div>
                  <div className="text-sm text-muted-foreground">April 2025</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => downloadReport("Monthly Space Weather Review", "April 2025")}
                >
                  <Download size={14} />
                  PDF
                </Button>
              </div>
              
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <div className="font-medium">Solar Cycle 25 Progress Report</div>
                  <div className="text-sm text-muted-foreground">Q1 2025</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => downloadReport("Solar Cycle 25 Progress Report", "Q1 2025")}
                >
                  <Download size={14} />
                  PDF
                </Button>
              </div>
              
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <div className="font-medium">Model Performance Analysis</div>
                  <div className="text-sm text-muted-foreground">March 2025</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => downloadReport("Model Performance Analysis", "March 2025")}
                >
                  <Download size={14} />
                  PDF
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Geomagnetic Storm Event Analysis</div>
                  <div className="text-sm text-muted-foreground">February 12-15, 2025</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => downloadReport("Geomagnetic Storm Event Analysis", "February 12-15, 2025")}
                >
                  <Download size={14} />
                  PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart size={18} />
              Model Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-2 font-medium">Key Performance Metrics</div>
                <div className="text-sm text-muted-foreground mb-3">
                  Root Mean Square Error (RMSE) calculation for our forecasting models:
                </div>
                
                <div className="bg-muted/20 p-4 rounded-md text-sm font-mono">
                  <pre className="whitespace-pre-wrap">
                    {`RMSE = sqrt(1/n * Σ(predicted - actual)²)
                    
where:
- n is the number of observations
- predicted is the model forecast
- actual is the observed value

Overall RMSE: ${HybridModelPerformance.rootMeanSquaredError.overall}
Kp Index RMSE: ${HybridModelPerformance.rootMeanSquaredError.kpIndex}
Solar Wind RMSE: ${HybridModelPerformance.rootMeanSquaredError.solarWindSpeed} km/s`}
                  </pre>
                </div>
              </div>
              
              <div>
                <div className="mb-1 font-medium">Verification Against External Sources</div>
                <div className="text-sm text-muted-foreground">
                  Our model predictions are continuously compared against measurements from NOAA SWPC, 
                  DSCOVR satellite, and the global magnetometer network to ensure accuracy.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
