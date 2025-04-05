
/**
 * PDF Export Utilities
 * Provides functions to create and download PDF reports
 */
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ReportData {
  title: string;
  date: string;
  content?: string;
  data?: Record<string, any>[];
}

/**
 * Generate a PDF report from the provided data
 */
export const generatePDF = (reportData: ReportData): jsPDF => {
  // Initialize jsPDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(31, 41, 55);
  doc.text(reportData.title, 20, 20);
  
  // Add date
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated: ${reportData.date}`, 20, 30);
  
  // Add content if provided
  if (reportData.content) {
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    
    // Split long text into lines
    const splitText = doc.splitTextToSize(reportData.content, 170);
    doc.text(splitText, 20, 40);
  }
  
  // Add data table if provided
  if (reportData.data && reportData.data.length > 0) {
    const startY = reportData.content ? 60 : 40;
    
    // @ts-ignore - jsPDF-autotable extends jsPDF
    doc.autoTable({
      startY: startY,
      head: [Object.keys(reportData.data[0])],
      body: reportData.data.map(item => Object.values(item)),
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [220, 220, 220]
      },
      headerStyles: {
        fillColor: [31, 41, 55],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
  }
  
  return doc;
};

/**
 * Download a PDF report
 */
export const downloadPDF = (reportData: ReportData, filename: string): void => {
  const doc = generatePDF(reportData);
  doc.save(filename);
};

/**
 * Format a date for PDF reports
 */
export const formatReportDate = (date: Date = new Date()): string => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Create a space weather analysis report
 */
export const createSpaceWeatherReport = (
  title: string,
  period: string,
  metrics: Record<string, any>
): void => {
  const reportDate = formatReportDate();
  const content = `
This report provides an analysis of space weather conditions during ${period}. 
The data includes key measurements of solar activity, geomagnetic conditions,
and predictive model performance.

Key findings:
- Kp Index range: ${metrics.kpRange || 'N/A'}
- Maximum solar wind speed: ${metrics.maxSolarWind || 'N/A'} km/s
- Geomagnetic storm occurrence: ${metrics.stormOccurrence || 'No significant storms'}
- Model prediction accuracy: ${metrics.modelAccuracy || 'N/A'}
- Model validation RMSE: ${metrics.validationRMSE || 'N/A'}
- Model test RMSE: ${metrics.testRMSE || 'N/A'}

This information is crucial for satellite operators, power grid managers,
and other stakeholders affected by space weather conditions.
  `.trim();
  
  const data = [
    { Metric: 'Kp Index (Average)', Value: metrics.avgKp || 'N/A' },
    { Metric: 'Kp Index (Maximum)', Value: metrics.maxKp || 'N/A' },
    { Metric: 'Solar Wind Speed (Average)', Value: `${metrics.avgSolarWind || 'N/A'} km/s` },
    { Metric: 'Solar Wind Speed (Maximum)', Value: `${metrics.maxSolarWind || 'N/A'} km/s` },
    { Metric: 'IMF Bz (Minimum)', Value: `${metrics.minBz || 'N/A'} nT` },
    { Metric: 'X-Ray Flux (Maximum)', Value: metrics.maxXRayFlux || 'N/A' },
    { Metric: 'Model RMSE (Overall)', Value: metrics.modelRMSE || 'N/A' },
    { Metric: 'Validation RMSE', Value: metrics.validationRMSE || 'N/A' },
    { Metric: 'Test RMSE', Value: metrics.testRMSE || 'N/A' }
  ];
  
  const filename = `space_weather_analysis_${period}_${new Date().getTime()}.pdf`;
  
  downloadPDF({
    title,
    date: reportDate,
    content,
    data
  }, filename);
};
