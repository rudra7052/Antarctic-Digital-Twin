import React from 'react';
import { AlertFeed } from '../components/Alerts/AlertFeed';
import { SimulationControls } from '../components/Simulation/SimulationControls';

export const AlertsPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <AlertFeed />
      <SimulationControls />
    </div>
  );
};
