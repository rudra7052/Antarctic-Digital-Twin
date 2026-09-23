import React from 'react';
import { TelemetryReading } from '../../types';
import {
  Activity,
  Gauge,
  Thermometer,
  Wind,
  Wifi,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Cpu
} from 'lucide-react';

interface EquipmentCardsProps {
  telemetry: TelemetryReading;
}

export const EquipmentCards: React.FC<EquipmentCardsProps> = ({ telemetry }) => {
  const isGenHot = telemetry.generatorTempC > 90;
  const isGenVibrating = telemetry.generatorVibrationMmS > 4.5;
  const isSatcomLow = telemetry.satcomUptimePercent < 95;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Primary Diesel Generator & CHP Loop */}
      <div
        id="generator-health-card"
        className={`relative overflow-hidden rounded-2xl bg-slate-900/90 border p-4 transition-all group ${
          isGenHot || isGenVibrating
            ? 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl border ${
              isGenHot || isGenVibrating
                ? 'bg-red-950/80 border-red-500/40 text-red-400'
                : 'bg-slate-800/80 border-slate-700 text-cyan-400'
            }`}>
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-semibold uppercase text-slate-200">Diesel Gen Bank #1</h3>
              <p className="text-[10px] font-mono text-slate-400">CHP Thermal Co-Gen</p>
            </div>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            isGenHot || isGenVibrating
              ? 'bg-red-950 text-red-400 border-red-800/60 animate-pulse'
              : 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
          }`}>
            {isGenHot || isGenVibrating ? 'DEGRADED' : 'OPTIMAL'}
          </span>
        </div>

        {/* Temperature & Vibration dials summary */}
        <div className="space-y-2.5">
          {/* Temperature row */}
          <div>
            <div className="flex justify-between text-[11px] font-mono mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                CORE TEMP
              </span>
              <span className={`font-semibold ${isGenHot ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                {telemetry.generatorTempC}°C <span className="text-slate-400 text-[10px]">(Max 95°C)</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isGenHot ? 'bg-red-500' : telemetry.generatorTempC > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (telemetry.generatorTempC / 120) * 100)}%` }}
              />
            </div>
          </div>

          {/* Vibration row */}
          <div>
            <div className="flex justify-between text-[11px] font-mono mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                VIBRATION (RMS)
              </span>
              <span className={`font-semibold ${isGenVibrating ? 'text-red-400' : 'text-slate-200'}`}>
                {telemetry.generatorVibrationMmS} mm/s <span className="text-slate-400 text-[10px]">(Limit 4.5)</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isGenVibrating ? 'bg-red-500 animate-pulse' : telemetry.generatorVibrationMmS > 3 ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${Math.min(100, (telemetry.generatorVibrationMmS / 10) * 100)}%` }}
              />
            </div>
          </div>

          {/* Efficiency & Failure prediction */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-800 pt-2 text-slate-400">
            <div>
              <span>EFFICIENCY</span>
              <p className="text-slate-200 font-semibold text-xs">{telemetry.generatorEfficiencyPercent}%</p>
            </div>
            <div>
              <span>EST. NEXT FAILURE</span>
              <p className={`font-semibold text-xs ${
                telemetry.generatorNextEstimatedFailureDays < 10 ? 'text-red-400' : 'text-emerald-400'
              }`}>
                ~{telemetry.generatorNextEstimatedFailureDays} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HVAC & Living Quarters Life Support */}
      <div
        id="hvac-health-card"
        className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-4 hover:border-slate-700 transition-all group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-950/80 border border-teal-500/40 text-teal-400">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-semibold uppercase text-slate-200">HVAC Life Support</h3>
              <p className="text-[10px] font-mono text-slate-400">Indoor Microclimate</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
            NOMINAL
          </span>
        </div>

        <div className="space-y-3">
          {/* Temperature comparator */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-950/60 border border-slate-800/60 p-2.5 text-center">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block">SETPOINT</span>
              <span className="text-sm font-bold font-mono text-cyan-400">{telemetry.hvacSetpointC}°C</span>
            </div>
            <div className="border-l border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">ACTUAL TEMP</span>
              <span className="text-sm font-bold font-mono text-emerald-400">{telemetry.hvacActualTempC}°C</span>
            </div>
          </div>

          {/* Humidity & Airflow */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">HUMIDITY</span>
              <span className="text-slate-200 font-semibold">{telemetry.hvacHumidityPercent}% RH</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                style={{ width: `${telemetry.hvacHumidityPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-2">
            <span>Airflow: {telemetry.hvacAirExchangeRateCfm} CFM</span>
            <span className="text-teal-400">HEPA Filter: Clean</span>
          </div>
        </div>
      </div>

      {/* 3. Satellite Comms & Polar Radome Array */}
      <div
        id="satcom-health-card"
        className={`relative overflow-hidden rounded-2xl bg-slate-900/90 border p-4 transition-all group ${
          isSatcomLow
            ? 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-400">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-semibold uppercase text-slate-200">SatCom Radome #3</h3>
              <p className="text-[10px] font-mono text-slate-400">Iridium & Inmarsat Link</p>
            </div>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            isSatcomLow
              ? 'bg-amber-950 text-amber-400 border-amber-800/60'
              : 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
          }`}>
            {telemetry.satcomUptimePercent}% UP
          </span>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-950/60 border border-slate-800/60 p-2.5 text-center">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block">BANDWIDTH</span>
              <span className="text-sm font-bold font-mono text-indigo-300">{telemetry.satcomBandwidthMbps} Mbps</span>
            </div>
            <div className="border-l border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">LATENCY</span>
              <span className="text-sm font-bold font-mono text-cyan-300">{telemetry.satcomLatencyMs} ms</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">LINK QUALITY</span>
              <span className="text-indigo-400 font-semibold">99.2% SNR</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                style={{ width: `${telemetry.satcomUptimePercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-2">
            <span>Tracking Azimuth: 142.8°</span>
            <span className="text-indigo-400">Radome De-Ice: ON</span>
          </div>
        </div>
      </div>

      {/* 4. Polar Meteorology & Katabatic Wind Sensor */}
      <div
        id="met-health-card"
        className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-4 hover:border-slate-700 transition-all group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-950/80 border border-sky-500/40 text-sky-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-semibold uppercase text-slate-200">Polar Weather AWS</h3>
              <p className="text-[10px] font-mono text-slate-400">Automatic Weather Station</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800/60">
            RECORDING
          </span>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-950/60 border border-slate-800/60 p-2.5 text-center">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block">AMBIENT TEMP</span>
              <span className="text-sm font-bold font-mono text-sky-300">{telemetry.ambientTempC}°C</span>
            </div>
            <div className="border-l border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">WIND SPEED</span>
              <span className="text-sm font-bold font-mono text-amber-300">{telemetry.windSpeedKts} kts</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">WIND CHILL FACTOR</span>
              <span className="text-cyan-300 font-semibold">{telemetry.windChillC}°C</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full"
                style={{ width: `${Math.min(100, (telemetry.windSpeedKts / 80) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-2">
            <span>Baro: {telemetry.atmosphericPressureHpa.toFixed(1)} hPa</span>
            <span className="text-sky-400">Solar Flux: {Math.round(telemetry.solarFluxWm2)} W/m²</span>
          </div>
        </div>
      </div>
    </div>
  );
};
