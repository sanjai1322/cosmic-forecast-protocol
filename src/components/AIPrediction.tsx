
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

type PredictionData = {
  timestamp: string;
  prediction: string;
  confidence: number;
  analysisFactors: string[];
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
};

interface AIPredictionProps {
  data?: PredictionData;
  className?: string;
}

const mockData: PredictionData = {
  timestamp: new Date().toISOString(),
  prediction: "Potential G2-class geomagnetic storm in the next 24-48 hours",
  confidence: 0.78,
  analysisFactors: [
    "Recent M-class solar flare detected",
    "Coronal Mass Ejection (CME) trajectory analysis",
    "Historical pattern matching",
    "Solar wind parameter trends"
  ],
  riskLevel: 'moderate'
};

const AIPrediction: React.FC<AIPredictionProps> = ({ 
  data = mockData,
  className 
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-alert-low';
    if (confidence >= 0.6) return 'text-alert-moderate';
    return 'text-alert-high';
  };

  const getRiskBadgeClass = (level: 'low' | 'moderate' | 'high' | 'severe') => {
    switch (level) {
      case 'low':
        return 'bg-alert-low/20 text-alert-low';
      case 'moderate':
        return 'bg-alert-moderate/20 text-alert-moderate';
      case 'high':
        return 'bg-alert-high/20 text-alert-high';
      case 'severe':
        return 'bg-alert-severe/20 text-alert-severe';
    }
  };

  const formattedTime = new Date(data.timestamp).toLocaleString();

  return (
    <Card className={`cosmos-card ${className}`}>
      <CardHeader className="pb-2 pt-4 px-6 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-medium">
          AI Prediction
        </CardTitle>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskBadgeClass(data.riskLevel)}`}>
          {data.riskLevel.toUpperCase()} RISK
        </span>
      </CardHeader>
      <CardContent className="p-6 pt-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 bg-accent/20 text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2c1.7 0 3.4.3 5 .8 1.5.6 2.8 1.5 3.9 2.6 1.1 1.1 2 2.4 2.6 3.9.5 1.6.8 3.3.8 5s-.3 3.4-.8 5c-.6 1.5-1.5 2.8-2.6 3.9-1.1 1.1-2.4 2-3.9 2.6-1.6.5-3.3.8-5 .8s-3.4-.3-5-.8c-1.5-.6-2.8-1.5-3.9-2.6-1.1-1.1-2-2.4-2.6-3.9-.5-1.6-.8-3.3-.8-5s.3-3.4.8-5c.6-1.5 1.5-2.8 2.6-3.9 1.1-1.1 2.4-2 3.9-2.6 1.6-.5 3.3-.8 5-.8z"/>
              <path d="M12 6v4"/>
              <path d="M12 14h.01"/>
            </svg>
          </Avatar>
          <div className="space-y-1">
            <p className="text-base font-medium leading-tight">{data.prediction}</p>
            <p className="text-sm text-muted-foreground">
              Confidence: <span className={getConfidenceColor(data.confidence)}>{(data.confidence * 100).toFixed(0)}%</span>
            </p>
            <div className="mt-3">
              <h4 className="text-xs font-medium text-muted-foreground mb-1">
                ANALYSIS FACTORS:
              </h4>
              <ul className="text-xs space-y-1">
                {data.analysisFactors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-1.5">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Last updated: {formattedTime}
        </p>
      </CardContent>
    </Card>
  );
};

export default AIPrediction;
