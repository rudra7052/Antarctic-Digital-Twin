import React from 'react';
import { TelemetryTimeSeries } from '../components/Charts/TelemetryTimeSeries';

export const HistoryPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <TelemetryTimeSeries />
    </div>
  );
};
