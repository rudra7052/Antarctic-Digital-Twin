import React from 'react';
import { ResourceForecastChart } from '../components/Charts/ResourceForecastChart';
import { ResourcePriorityMatrix } from '../components/Charts/ResourcePriorityMatrix';
import { ResourceCards } from '../components/Cards/ResourceCard';
import { useAppStore } from '../store/useAppStore';

export const ForecastsPage: React.FC = () => {
  const { currentTelemetry } = useAppStore();

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <ResourceCards telemetry={currentTelemetry} />
      <ResourceForecastChart />
      <ResourcePriorityMatrix />
    </div>
  );
};
