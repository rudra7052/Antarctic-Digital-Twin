import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getRiskAssessmentData } from '../../services/telemetryEngine';
import { ShieldAlert, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

export const RiskGauge: React.FC = () => {
  const { selectedStationId, simulation } = useAppStore();
  const risk = getRiskAssessmentData(selectedStationId, simulation);

  const score = risk.overallScore;
  const isHigh = score > 60;
  const isMed = score > 30 && score <= 60;

  // Normalized angle -90 to +90 deg
  const angle = -90 + (score / 100) * 180;

  return (
    <div className="rounded-3xl bg-slate-950 border border-slate-800 p-5 space-y-3 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${
            isHigh ? 'bg-red-950 border-red-500/50 text-red-400' : 'bg-slate-900 border-slate-750 text-cyan-400'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase">
              Station Cascading Risk Index
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Composite real-time operational safety index (TransAnomaly ML)
            </p>
          </div>
        </div>

        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
          isHigh
            ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
            : isMed
            ? 'bg-amber-950 text-amber-400 border-amber-800'
            : 'bg-emerald-950 text-emerald-400 border-emerald-800'
        }`}>
          {risk.status}
        </span>
      </div>

      {/* Semicircular Needle Gauge */}
      <div className="relative flex flex-col items-center justify-center pt-2">
        <div className="relative w-[240px] h-[135px]">
          <svg viewBox="0 0 200 110" className="w-full h-full">
            <defs>
              <linearGradient id="riskArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>

            {/* Background Arc */}
            <path
              d="M 20,100 A 80,80 0 0,1 180,100"
              fill="none"
              stroke="#1e293b"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Colored Risk Arc */}
            <path
              d="M 20,100 A 80,80 0 0,1 180,100"
              fill="none"
              stroke="url(#riskArcGrad)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Pivot */}
            <circle cx="100" cy="100" r="7" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2" />
            {/* Needle */}
            <g transform={`rotate(${angle}, 100, 100)`}>
              <polygon points="98,100 102,100 100,24" fill="#ffffff" />
            </g>
          </svg>

          {/* Centered Score */}
          <div className="absolute bottom-1 left-0 right-0 text-center font-mono">
            <span className="text-3xl font-bold text-slate-100 tracking-tight">{score}</span>
            <span className="text-xs text-slate-400 ml-1">/ 100</span>
          </div>
        </div>
      </div>

      {/* Sub-system Risk Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 text-center">
          <span className="text-slate-400 block text-[10px]">POWER GRID</span>
          <span className={`font-bold ${risk.powerRisk > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
            {risk.powerRisk}%
          </span>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 text-center">
          <span className="text-slate-400 block text-[10px]">THERMAL/HVAC</span>
          <span className={`font-bold ${risk.thermalRisk > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
            {risk.thermalRisk}%
          </span>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 text-center">
          <span className="text-slate-400 block text-[10px]">WATER LOOP</span>
          <span className={`font-bold ${risk.waterRisk > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
            {risk.waterRisk}%
          </span>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 text-center">
          <span className="text-slate-400 block text-[10px]">COMMS LINK</span>
          <span className={`font-bold ${risk.commsRisk > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
            {risk.commsRisk}%
          </span>
        </div>
      </div>
    </div>
  );
};
