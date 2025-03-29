
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusIndicator from './StatusIndicator';

type MetricCardProps = {
  title: string;
  value: string | number;
  description?: string;
  status?: 'low' | 'moderate' | 'high' | 'severe';
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  className?: string;
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  status = 'low',
  icon,
  trend,
  className,
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    return trend === 'up' ? (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 text-alert-high" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : trend === 'down' ? (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 text-alert-low" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ) : (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 text-muted-foreground" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  };

  return (
    <Card className={`cosmos-card ${className}`}>
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {status && <StatusIndicator level={status} />}
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-0">
        <div className="text-2xl font-bold flex items-center gap-1">
          {value}
          {getTrendIcon()}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
