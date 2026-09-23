import React from 'react';
import { TelemetryReading } from '../../types';
import {
  Droplets,
  Apple,
  Fuel,
  BatteryCharging,
  Zap,
  TrendingDown,
  Clock
} from 'lucide-react';

interface ResourceCardsProps {
  telemetry: TelemetryReading;
}

export const ResourceCards: React.FC<ResourceCardsProps> = ({ telemetry }) => {
  const waterPercent = Math.min(100, Math.max(0, (telemetry.waterLevelL / telemetry.waterMaxL) * 100));
  const foodPercent = Math.min(100, Math.max(0, (telemetry.foodLevelKg / telemetry.foodMaxKg) * 100));
  const fuelPercent = Math.min(100, Math.max(0, (telemetry.fuelLevelL / telemetry.fuelMaxL) * 100));
  const powerDelta = telemetry.powerGenerationKw - telemetry.powerConsumptionKw;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-stretch">
      {/* 1. Freshwater Card */}
      <div
        id="water-resource-card"
        className="flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-slate-800 p-4 hover:border-cyan-500/40 transition-all group shadow-sm"
      >
        <div>
          <div className="flex items-center justify-between gap-2 min-h-[32px] mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-xl bg-blue-950/80 border border-blue-500/30 text-blue-400 shrink-0">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-semibold uppercase text-slate-200 truncate">
                Freshwater
              </span>
            </div>
            <span className="shrink-0 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-950/70 text-blue-300 border border-blue-800/60 font-semibold shadow-inner">
              {waterPercent.toFixed(0)}%
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-xl font-bold font-mono tracking-tight text-slate-100">
                {telemetry.waterLevelL.toLocaleString()}
              </span>
              <span className="text-[11px] font-mono text-slate-400">/ {telemetry.waterMaxL.toLocaleString()} L</span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  waterPercent < 25
                    ? 'bg-gradient-to-r from-red-500 to-amber-500'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                }`}
                style={{ width: `${waterPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Burn Rate</span>
              <span className="text-slate-200 font-semibold flex items-center gap-1 mt-0.5">
                <TrendingDown className="w-3 h-3 text-cyan-400 shrink-0" />
                {telemetry.waterConsumptionRateLPerDay} L/d
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Autonomy</span>
              <span className={`font-semibold flex items-center gap-1 mt-0.5 ${
                telemetry.waterDaysRemaining < 30 ? 'text-red-400' : 'text-emerald-400'
              }`}>
                <Clock className="w-3 h-3 shrink-0" />
                {telemetry.waterDaysRemaining}d
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
            <span>Trend: -0.8%/d</span>
            <span className="text-cyan-400 font-medium">RO: Active</span>
          </div>
        </div>
      </div>

      {/* 2. Food Level Card */}
      <div
        id="food-resource-card"
        className="flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-slate-800 p-4 hover:border-emerald-500/40 transition-all group shadow-sm"
      >
        <div>
          <div className="flex items-center justify-between gap-2 min-h-[32px] mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 shrink-0">
                <Apple className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-semibold uppercase text-slate-200 truncate">
                Food Rations
              </span>
            </div>
            <span className="shrink-0 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 font-semibold shadow-inner">
              {foodPercent.toFixed(0)}%
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-xl font-bold font-mono tracking-tight text-slate-100">
                {telemetry.foodLevelKg.toLocaleString()}
              </span>
              <span className="text-[11px] font-mono text-slate-400">/ {telemetry.foodMaxKg.toLocaleString()} kg</span>
            </div>

            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                style={{ width: `${foodPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Rate</span>
              <span className="text-slate-200 font-semibold flex items-center gap-1 mt-0.5">
                <TrendingDown className="w-3 h-3 text-emerald-400 shrink-0" />
                {telemetry.foodConsumptionRateKgPerDay} kg/d
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Autonomy</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 shrink-0" />
                {telemetry.foodDaysRemaining}d
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
            <span>Loss: 0.1%/d</span>
            <span className="text-emerald-400 font-medium">Hydro: OK</span>
          </div>
        </div>
      </div>

      {/* 3. Arctic Fuel Card */}
      <div
        id="fuel-resource-card"
        className="flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-slate-800 p-4 hover:border-amber-500/40 transition-all group shadow-sm"
      >
        <div>
          <div className="flex items-center justify-between gap-2 min-h-[32px] mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-400 shrink-0">
                <Fuel className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-semibold uppercase text-slate-200 truncate">
                Arctic Fuel
              </span>
            </div>
            <span className="shrink-0 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-800/60 font-semibold shadow-inner">
              {fuelPercent.toFixed(0)}%
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-xl font-bold font-mono tracking-tight text-slate-100">
                {telemetry.fuelLevelL.toLocaleString()}
              </span>
              <span className="text-[11px] font-mono text-slate-400">/ {telemetry.fuelMaxL.toLocaleString()} L</span>
            </div>

            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                style={{ width: `${fuelPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Burn Rate</span>
              <span className="text-slate-200 font-semibold flex items-center gap-1 mt-0.5">
                <TrendingDown className="w-3 h-3 text-amber-400 shrink-0" />
                {telemetry.fuelConsumptionRateLPerDay} L/d
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Autonomy</span>
              <span className="text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 shrink-0" />
                {telemetry.fuelDaysRemaining}d
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
            <span>Viscosity: OK</span>
            <span className="text-amber-400 font-medium">Margin: +65d</span>
          </div>
        </div>
      </div>

      {/* 4. Battery Bank Storage Card */}
      <div
        id="battery-resource-card"
        className="flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-slate-800 p-4 hover:border-purple-500/40 transition-all group shadow-sm"
      >
        <div>
          <div className="flex items-center justify-between gap-2 min-h-[32px] mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-400 shrink-0">
                <BatteryCharging className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-semibold uppercase text-slate-200 truncate">
                BESS Battery
              </span>
            </div>
            <span className={`shrink-0 text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-semibold shadow-inner ${
              telemetry.batterySocPercent < 30
                ? 'bg-red-950/70 text-red-300 border-red-800/60'
                : 'bg-purple-950/70 text-purple-300 border-purple-800/60'
            }`}>
              {telemetry.batterySocPercent}%
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-xl font-bold font-mono tracking-tight text-slate-100">
                {telemetry.batterySocPercent}%
              </span>
              <span className="text-[11px] font-mono text-purple-300">SOH: {telemetry.batteryHealthPercent}%</span>
            </div>

            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  telemetry.batterySocPercent < 30
                    ? 'bg-red-500'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-400'
                }`}
                style={{ width: `${telemetry.batterySocPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Cycles</span>
              <span className="text-slate-200 font-semibold block mt-0.5">{telemetry.batteryCycleCount}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Flow</span>
              <span className={`font-semibold block mt-0.5 ${telemetry.batteryDischargeRateKw > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {telemetry.batteryDischargeRateKw} kW
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
            <span>Cell: 19.4°C</span>
            <span className="text-purple-400 font-medium">LiFePO4</span>
          </div>
        </div>
      </div>

      {/* 5. Microgrid Power Balance Card */}
      <div
        id="power-resource-card"
        className="flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-slate-800 p-4 hover:border-yellow-500/40 transition-all group shadow-sm"
      >
        <div>
          <div className="flex items-center justify-between gap-2 min-h-[32px] mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-xl bg-yellow-950/80 border border-yellow-500/30 text-yellow-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-semibold uppercase text-slate-200 truncate">
                Microgrid
              </span>
            </div>
            <span className={`shrink-0 text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-semibold shadow-inner ${
              powerDelta >= 0
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                : 'bg-red-950/70 text-red-300 border-red-800/60'
            }`}>
              {powerDelta >= 0 ? `+${powerDelta.toFixed(0)}kW` : `${powerDelta.toFixed(0)}kW`}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-xl font-bold font-mono tracking-tight text-slate-100">
                {telemetry.powerGenerationKw}
              </span>
              <span className="text-[11px] font-mono text-slate-400">/ {telemetry.powerConsumptionKw} kW Load</span>
            </div>

            {/* Microgrid distribution */}
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${(telemetry.solarGenerationKw / Math.max(1, telemetry.powerGenerationKw)) * 100}%` }}
                title={`Solar: ${telemetry.solarGenerationKw} kW`}
              />
              <div
                className="h-full bg-cyan-400 transition-all"
                style={{ width: `${(telemetry.windGenerationKw / Math.max(1, telemetry.powerGenerationKw)) * 100}%` }}
                title={`Wind: ${telemetry.windGenerationKw} kW`}
              />
              <div
                className="h-full bg-orange-600 transition-all"
                style={{ width: `${(telemetry.dieselGenerationKw / Math.max(1, telemetry.powerGenerationKw)) * 100}%` }}
                title={`Diesel CHP: ${telemetry.dieselGenerationKw} kW`}
              />
            </div>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-2">
          <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center">
            <div className="bg-slate-950/60 rounded py-0.5 px-1 border border-slate-800/60">
              <span className="text-amber-400 block text-[8px]">SOLAR</span>
              <span className="text-slate-200 font-semibold">{telemetry.solarGenerationKw}k</span>
            </div>
            <div className="bg-slate-950/60 rounded py-0.5 px-1 border border-slate-800/60">
              <span className="text-cyan-400 block text-[8px]">WIND</span>
              <span className="text-slate-200 font-semibold">{telemetry.windGenerationKw}k</span>
            </div>
            <div className="bg-slate-950/60 rounded py-0.5 px-1 border border-slate-800/60">
              <span className="text-orange-400 block text-[8px]">DG</span>
              <span className="text-slate-200 font-semibold">{telemetry.dieselGenerationKw}k</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
            <span>Bus: 415V 50Hz</span>
            <span className="text-yellow-400 font-medium">PF: 0.98</span>
          </div>
        </div>
      </div>
    </div>
  );
};

