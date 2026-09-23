import React from 'react';
import { RiskGauge } from '../components/Charts/RiskGauge';
import { RiskMatrix } from '../components/Charts/RiskMatrix';
import { CascadingFailureTree } from '../components/Charts/CascadingFailureTree';
import { SimulationControls } from '../components/Simulation/SimulationControls';

export const RiskPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <RiskGauge />
        </div>
        <div className="lg:col-span-7">
          <RiskMatrix />
        </div>
      </div>
      <CascadingFailureTree />
      <SimulationControls />
    </div>
  );
};
