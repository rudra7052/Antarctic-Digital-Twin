import React, { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ResourceCards } from '../components/Cards/ResourceCard';
import { EquipmentCards } from '../components/Cards/EquipmentCard';
import { GlobeViewer } from '../components/3D/GlobeViewer';
import { GISLayers } from '../components/3D/GISLayers';
import { StationIsometricTwin } from '../components/3D/StationIsometricTwin';
import { ResourceForecastChart } from '../components/Charts/ResourceForecastChart';
import { EquipmentGauges } from '../components/Charts/EquipmentGauges';
import { RiskGauge } from '../components/Charts/RiskGauge';
import { CascadingFailureTree } from '../components/Charts/CascadingFailureTree';
import { AlertFeed } from '../components/Alerts/AlertFeed';
import { SimulationControls } from '../components/Simulation/SimulationControls';
import { ANTARCTIC_STATIONS } from '../data/mockStations';

export const DashboardPage: React.FC = () => {
  const { currentTelemetry, selectedStationId, simulation, tickTelemetry } = useAppStore();

  const station = ANTARCTIC_STATIONS[selectedStationId] || ANTARCTIC_STATIONS.bharati;

  // Live simulation tick interval (scaled by simulation speed)
  useEffect(() => {
    if (simulation.isPaused) return;
    const intervalMs = Math.max(250, 1500 / simulation.speed);
    const timer = setInterval(() => {
      tickTelemetry();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [simulation.isPaused, simulation.speed, tickTelemetry]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Primary Resource Inventory & Consumption Gauges */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Life-Support Resource Reserves ({station.name})
          </h2>
          <span className="text-[11px] font-mono text-cyan-400">
            SCADA Scan Rate: 1.0 Hz
          </span>
        </div>
        <ResourceCards telemetry={currentTelemetry} />
      </section>

      {/* 2. 3D Polar GIS Globe & Station Subsystem Twin */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Geospatial 3D Polar GIS & Subsystem Twin
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <GlobeViewer />
          <GISLayers />
        </div>
      </section>

      {/* 3. 3D Station Modular Digital Twin */}
      <section className="space-y-3">
        <StationIsometricTwin />
      </section>

      {/* 4. Equipment Health & Mechanical Gauges */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Subsystem Mechanical & Environmental Telemetry
          </h2>
        </div>
        <EquipmentCards telemetry={currentTelemetry} />
        <EquipmentGauges telemetry={currentTelemetry} />
      </section>

      {/* 5. Resource Depletion Forecasting Engine */}
      <section className="space-y-3">
        <ResourceForecastChart />
      </section>

      {/* 6. Cascading Failure Simulator & Risk Assessment */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <RiskGauge />
        </div>
        <div className="lg:col-span-8">
          <CascadingFailureTree />
        </div>
      </section>

      {/* 7. SCADA Alerts Feed & Simulation Control Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <AlertFeed />
        </div>
        <div className="lg:col-span-5">
          <SimulationControls />
        </div>
      </section>
    </div>
  );
};
