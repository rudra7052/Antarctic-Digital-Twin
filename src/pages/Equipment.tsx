import React from 'react';
import { EquipmentCards } from '../components/Cards/EquipmentCard';
import { EquipmentGauges } from '../components/Charts/EquipmentGauges';
import { StationIsometricTwin } from '../components/3D/StationIsometricTwin';
import { useAppStore } from '../store/useAppStore';

export const EquipmentPage: React.FC = () => {
  const { currentTelemetry } = useAppStore();

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <StationIsometricTwin />
      <EquipmentCards telemetry={currentTelemetry} />
      <EquipmentGauges telemetry={currentTelemetry} />
    </div>
  );
};
