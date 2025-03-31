
interface DataRow {
  [key: string]: string | number | Date;
}

/**
 * Convert data array to CSV format
 */
export const convertToCSV = (data: DataRow[]): string => {
  if (data.length === 0) return '';
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const rows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      
      // Handle different data types
      if (value === null || value === undefined) {
        return '';
      } else if (typeof value === 'string') {
        // Escape quotes and wrap in quotes
        return `"${value.replace(/"/g, '""')}"`;
      } else if (value instanceof Date) {
        return `"${value.toISOString()}"`;
      } else {
        return String(value);
      }
    }).join(',');
  }).join('\n');
  
  return `${headerRow}\n${rows}`;
};

/**
 * Download data as CSV file
 */
export const downloadCSV = (data: DataRow[], filename: string): void => {
  const csv = convertToCSV(data);
  
  // Create a blob and link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Add to document, click and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object after download
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 300);
};

/**
 * Format current date for filename
 */
export const getTimestampedFilename = (baseName: string): string => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:T.]/g, '-').slice(0, 19);
  return `${baseName}-${timestamp}.csv`;
};

/**
 * Create a summary report CSV from alert data
 */
export const createAlertSummaryCSV = (alerts: any[]): string => {
  if (!alerts || alerts.length === 0) return '';
  
  // Count alerts by level
  const summary = {
    total: alerts.length,
    high: alerts.filter(a => a.level === 'high').length,
    moderate: alerts.filter(a => a.level === 'moderate').length,
    low: alerts.filter(a => a.level === 'low').length,
    date: new Date().toISOString()
  };
  
  // Create CSV content
  const headers = ['Report Date', 'Total Alerts', 'High Priority', 'Moderate Priority', 'Low Priority'];
  const values = [
    `"${new Date(summary.date).toLocaleString()}"`,
    summary.total,
    summary.high,
    summary.moderate,
    summary.low
  ];
  
  return `${headers.join(',')}\n${values.join(',')}`;
};
