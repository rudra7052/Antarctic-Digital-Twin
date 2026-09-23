import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ShieldAlert, AlertTriangle, CheckCircle2, Droplets, Fuel, Apple, BatteryCharging } from 'lucide-react';

export const ResourcePriorityMatrix: React.FC = () => {
  const { currentTelemetry } = useAppStore();

  const waterPercent = (currentTelemetry.waterLevelL / currentTelemetry.waterMaxL) * 100;
  const foodPercent = (currentTelemetry.foodLevelKg / currentTelemetry.foodMaxKg) * 100;
  const fuelPercent = (currentTelemetry.fuelLevelL / currentTelemetry.fuelMaxL) * 100;
  const batteryPercent = currentTelemetry.batterySocPercent;

  const items = [
    {
      id: 'water',
      name: 'Freshwater',
      percent: waterPercent,
      days: currentTelemetry.waterDaysRemaining,
      icon: Droplets,
      color: 'bg-cyan-500',
      border: 'border-cyan-400',
      textColor: 'text-cyan-300'
    },
    {
      id: 'food',
      name: 'Food Rations',
      percent: foodPercent,
      days: currentTelemetry.foodDaysRemaining,
      icon: Apple,
      color: 'bg-emerald-500',
      border: 'border-emerald-400',
      textColor: 'text-emerald-300'
    },
    {
      id: 'fuel',
      name: 'Arctic Fuel',
      percent: fuelPercent,
      days: currentTelemetry.fuelDaysRemaining,
      icon: Fuel,
      color: 'bg-amber-500',
      border: 'border-amber-400',
      textColor: 'text-amber-300'
    },
    {
      id: 'battery',
      name: 'Battery BESS',
      percent: batteryPercent,
      days: Math.round(currentTelemetry.batterySocPercent / 5),
      icon: BatteryCharging,
      color: 'bg-purple-500',
      border: 'border-purple-400',
      textColor: 'text-purple-300'
    }
  ];

  return (
    <div className="rounded-3xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-950 border border-purple-800/60 text-purple-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase">
              2x2 Resource Priority Matrix
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Cross-resource criticality mapping: Reserve Capacity vs. Projected Days to Depletion
            </p>
          </div>
        </div>
      </div>

      {/* 2x2 Quadrant Grid */}
      <div className="relative h-[320px] rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
        {/* Quadrant Backgrounds */}
        <div className="grid grid-cols-2 grid-rows-2 h-full gap-2 text-[11px] font-mono">
          {/* Top Left: High Level, Low Days (HIGH BURN / LEAK) */}
          <div className="rounded-xl bg-amber-950/20 border border-amber-900/30 p-2 text-amber-400/80">
            <span>QUADRANT II: HIGH LEVEL / RAPID BURN</span>
          </div>
          {/* Top Right: High Level, High Days (STABLE) */}
          <div className="rounded-xl bg-emerald-950/20 border border-emerald-900/30 p-2 text-emerald-400/80 text-right">
            <span>QUADRANT I: SECURE & STABLE</span>
          </div>
          {/* Bottom Left: Low Level, Low Days (CRITICAL ACTION) */}
          <div className="rounded-xl bg-red-950/30 border border-red-900/40 p-2 text-red-400/90 flex items-end">
            <span>QUADRANT III: CRITICAL ACTION REQ</span>
          </div>
          {/* Bottom Right: Low Level, High Days (CONTROLLED RATIONING) */}
          <div className="rounded-xl bg-blue-950/20 border border-blue-900/30 p-2 text-blue-400/80 flex items-end justify-end">
            <span>QUADRANT IV: CONTROLLED LOW FLOW</span>
          </div>
        </div>

        {/* Positioned Item Bubbles */}
        {items.map((item) => {
          const Icon = item.icon;
          // Normalize X (Days: 0 to 200 days)
          const leftPercent = Math.min(88, Math.max(12, (item.days / 200) * 100));
          // Normalize Y (Reserve %: 0 to 100%) -> Y is inverted in CSS top
          const topPercent = Math.min(88, Math.max(12, 100 - item.percent));

          return (
            <div
              key={item.id}
              style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${item.color} text-white font-mono text-xs font-bold shadow-lg ring-2 ring-slate-900 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
                <span className="text-[10px] opacity-90">({item.percent.toFixed(0)}%)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-300 mt-1 bg-slate-950/90 px-1.5 py-0.5 rounded border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.days} days remaining
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
