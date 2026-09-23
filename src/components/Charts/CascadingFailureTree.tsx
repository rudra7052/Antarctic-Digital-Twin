import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getRiskAssessmentData } from '../../services/telemetryEngine';
import {
  GitFork,
  AlertOctagon,
  ArrowRight,
  Flame,
  Droplets,
  BatteryCharging,
  Cpu,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const CascadingFailureTree: React.FC = () => {
  const { selectedStationId, simulation, openStationDetailModal } = useAppStore();
  const risk = getRiskAssessmentData(selectedStationId, simulation);
  const tree = risk.cascadingTree;

  return (
    <div className="rounded-3xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-950 border border-red-800/60 text-red-400">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase">
              Fault Tree & Cascading Failure Simulator
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Interactive causal propagation graph of equipment faults to life-support systems
            </p>
          </div>
        </div>

        <button
          onClick={() => openStationDetailModal(selectedStationId)}
          className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 text-cyan-400 hover:text-cyan-300"
        >
          View Emergency SOPs →
        </button>
      </div>

      {/* Visual Cascading Nodes Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative">
        {/* Tier 1: Root Fault */}
        <div className="rounded-2xl bg-red-950/40 border border-red-500/50 p-4 space-y-2.5 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-900/60 text-red-300 font-bold">
              ROOT CAUSE (PRIMARY)
            </span>
            <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <h3 className="text-xs font-mono font-bold text-slate-100 uppercase">
            {tree.label}
          </h3>
          <p className="text-[11px] font-mono text-red-300/90 leading-relaxed">
            Mechanical fatigue on bearing casing produces excessive 7.8 mm/s vibration and 96°C core temperature.
          </p>
          <div className="text-[10px] font-mono text-slate-400 border-t border-red-900/40 pt-2 flex justify-between">
            <span>Probability: High (0.84)</span>
            <span className="text-red-400">Active Alert</span>
          </div>
        </div>

        {/* Tier 2: Secondary Cascades */}
        <div className="space-y-3">
          {tree.children?.map((child, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-amber-950/30 border border-amber-500/40 p-3.5 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 font-bold">
                  CASCADE LEVEL 2
                </span>
                <Flame className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <h4 className="text-xs font-mono font-bold text-slate-100 uppercase">
                {child.label}
              </h4>
              <p className="text-[11px] font-mono text-slate-300">
                {idx === 0
                  ? 'Microgrid drops from 120 kW to 40 kW generation. Deficit forces battery bank into deep discharge.'
                  : 'Loss of glycol heat exchanger drops thermal loop supply to residential modules.'}
              </p>
            </div>
          ))}
        </div>

        {/* Tier 3: Tertiary Life Support Impact */}
        <div className="rounded-2xl bg-purple-950/30 border border-purple-500/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 font-bold">
              CRITICAL TERMINAL IMPACT
            </span>
            <Droplets className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-xs font-mono font-bold text-slate-100 uppercase">
            Freshwater Trace-Heating Freeze-up
          </h3>
          <p className="text-[11px] font-mono text-purple-200/90 leading-relaxed">
            Without microgrid power or thermal heating, exterior intake pipelines freeze solid in ambient -35°C air within 3.5 hours, cutting all potable water production.
          </p>
          <div className="rounded-xl bg-slate-950/80 p-2 border border-purple-900/50 text-[10px] font-mono text-cyan-300">
            <strong>Immediate SOP:</strong> Switch load to Auxiliary Gen #2 and activate auxiliary diesel heat blower.
          </div>
        </div>
      </div>
    </div>
  );
};
