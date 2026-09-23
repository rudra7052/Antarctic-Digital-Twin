import React from 'react';
import { TelemetryReading } from '../../types';
import { Gauge, Thermometer, Activity, Battery, Wifi } from 'lucide-react';

interface EquipmentGaugesProps {
  telemetry: TelemetryReading;
}

export const EquipmentGauges: React.FC<EquipmentGaugesProps> = ({ telemetry }) => {
  // SVG Circular Needle Gauge Helper
  const renderDialGauge = (
    title: string,
    value: number,
    min: number,
    max: number,
    unit: string,
    criticalThreshold: number,
    textColor: string,
    strokeColor: string,
    icon: React.ElementType
  ) => {
    const Icon = icon;
    const clampedVal = Math.min(max, Math.max(min, value));
    const normalized = (clampedVal - min) / (max - min);
    // Angle from -120 deg to +120 deg (240 deg span)
    const angle = -120 + normalized * 240;
    const isCritical = value >= criticalThreshold;

    return (
      <div className="flex flex-col items-center justify-between rounded-2xl bg-slate-900/90 border border-slate-800 p-4 relative overflow-hidden group hover:border-slate-750 transition-all shadow-md">
        <div className="w-full flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-slate-300 flex items-center gap-1.5 uppercase font-semibold">
            <Icon className={`w-3.5 h-3.5 ${textColor}`} />
            {title}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isCritical ? 'bg-red-950/80 text-red-400 border-red-800 animate-pulse' : 'bg-slate-950 text-slate-300 border-slate-800'
          }`}>
            {isCritical ? 'ALERT' : 'NOMINAL'}
          </span>
        </div>

        {/* SVG Circular Dial */}
        <div className="relative w-[130px] h-[100px] flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            {/* Background Arc */}
            <path
              d="M 25,95 A 45,45 0 1,1 95,95"
              fill="none"
              stroke="#1e293b"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Value Arc */}
            <path
              d="M 25,95 A 45,45 0 1,1 95,95"
              fill="none"
              stroke={isCritical ? '#ef4444' : strokeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="190"
              strokeDashoffset={190 - normalized * 190}
              className="transition-all duration-700 ease-out"
            />
            {/* Center Pivot */}
            <circle cx="60" cy="65" r="4" fill="#94a3b8" />
            {/* Needle Line */}
            <g transform={`rotate(${angle}, 60, 65)`}>
              <line x1="60" y1="65" x2="60" y2="28" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </svg>

          {/* Centered Readout */}
          <div className="absolute bottom-1 text-center font-mono">
            <span className="text-xl font-bold text-slate-100">{value}</span>
            <span className="text-[11px] text-slate-400 ml-1">{unit}</span>
          </div>
        </div>

        <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-2 mt-2">
          <span>Min: {min}</span>
          <span className="text-amber-400">Limit: {criticalThreshold}</span>
          <span>Max: {max}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {renderDialGauge(
        'Generator Temp',
        telemetry.generatorTempC,
        20,
        120,
        '°C',
        95,
        'text-amber-400',
        '#f59e0b',
        Thermometer
      )}
      {renderDialGauge(
        'Vibration RMS',
        telemetry.generatorVibrationMmS,
        0,
        10,
        'mm/s',
        4.5,
        'text-cyan-400',
        '#06b6d4',
        Activity
      )}
      {renderDialGauge(
        'Battery SoC',
        telemetry.batterySocPercent,
        0,
        100,
        '%',
        25,
        'text-purple-400',
        '#a855f7',
        Battery
      )}
      {renderDialGauge(
        'SatCom Uptime',
        telemetry.satcomUptimePercent,
        50,
        100,
        '%',
        90,
        'text-indigo-400',
        '#6366f1',
        Wifi
      )}
    </div>
  );
};
