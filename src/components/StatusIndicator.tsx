import React from 'react';
import { AlertLevel } from '@/services/notificationService';

interface StatusIndicatorProps {
  level: AlertLevel;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ level, className }) => {
  const getColorClass = () => {
    switch (level) {
      case 'low':
        return 'bg-alert-low';
      case 'moderate':
        return 'bg-alert-moderate';
      case 'high':
        return 'bg-alert-high';
      case 'severe':
        return 'bg-alert-severe';
      default:
        return 'bg-alert-low';
    }
  };

  const getAnimationClass = () => {
    switch (level) {
      case 'low':
        return 'animate-pulse';
      case 'moderate':
        return 'animate-pulse-slow';
      case 'high':
      case 'severe':
        return 'animate-[pulse_0.7s_cubic-bezier(0.4,0,0.6,1)_infinite]';
      default:
        return 'animate-pulse';
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div 
        className={`h-3 w-3 rounded-full ${getColorClass()} ${getAnimationClass()}`} 
      />
    </div>
  );
};

export default StatusIndicator;
