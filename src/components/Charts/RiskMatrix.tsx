import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getRiskAssessmentData } from '../../services/telemetryEngine';
import { AlertTriangle, Grid, Info } from 'lucide-react';

export const RiskMatrix: React.FC = () => {
  const { selectedStationId, simulation } = useAppStore();
  const risk = getRiskAssessmentData(selectedStationId, simulation);

  const riskEvents = [
    {
      id: 'gen_bearing',
      title: 'DG Bearing Catastrophic Lockup',
      likelihood: simulation.mode === 'FAILURE_MODE' ? 4 : 2, // 1-5
      consequence: 5, // 1-5
      category: 'POWER',
      color: 'bg-red-500'
    },
    {
      id: 'pipe_freeze',
      title: 'Freshwater Intake Cryo-Freezing',
      likelihood: 3,
      consequence: 4,
      category: 'WATER',
      color: 'bg-amber-500'
    },
    {
      id: 'satcom_radome_ice',
      title: 'Radome Ice Accretion / Link Loss',
      likelihood: 2,
      consequence: 3,
      category: 'COMMS',
      color: 'bg-indigo-500'
    },
    {
      id: 'bess_thermal_runaway',
      title: 'BESS Cell Sub-Zero Degradation',
      likelihood: 2,
      consequence: 4,
      category: 'BESS',
      color: 'bg-purple-500'
    },
    {
      id: 'katabatic_storm',
      title: 'Blizzard >80 kts Damaging Solar Array',
      likelihood: 3,
      consequence: 3,
      category: 'WEATHER',
      color: 'bg-cyan-500'
    }
  ];

  return (
    <div className="rounded-3xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-750 text-amber-400">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase">
              5x5 Likelihood vs Consequence Risk Matrix
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Antarctic SCADA threat catalog scored per ISO 31000 standards
            </p>
          </div>
        </div>
      </div>

      {/* 5x5 Grid Canvas */}
      <div className="relative h-[320px] rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
        {/* Background Grid Cells */}
        <div className="grid grid-cols-5 grid-rows-5 h-full gap-1.5">
          {[5, 4, 3, 2, 1].map((row) =>
            [1, 2, 3, 4, 5].map((col) => {
              const score = row * col;
              let cellBg = 'bg-slate-950/40 border-slate-800/40';
              if (score >= 15) cellBg = 'bg-red-950/30 border-red-900/40';
              else if (score >= 8) cellBg = 'bg-amber-950/25 border-amber-900/30';
              else cellBg = 'bg-emerald-950/20 border-emerald-900/20';

              return (
                <div
                  key={`${row}-${col}`}
                  className={`rounded-lg border ${cellBg} flex items-center justify-center`}
                />
              );
            })
          )}
        </div>

        {/* Positioned Threat Bubbles */}
        {riskEvents.map((evt) => {
          // X: Likelihood (1 to 5) -> % left
          const leftPercent = ((evt.likelihood - 0.5) / 5) * 100;
          // Y: Consequence (5 at top, 1 at bottom) -> % top
          const topPercent = ((5.5 - evt.consequence) / 5) * 100;

          return (
            <div
              key={evt.id}
              style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer"
            >
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${evt.color} text-white font-mono text-[11px] font-bold shadow-lg ring-2 ring-slate-950 group-hover:scale-110 transition-transform`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span className="hidden sm:inline">{evt.title}</span>
                <span className="sm:hidden">{evt.category}</span>
              </div>

              {/* Hover card */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 rounded-xl bg-slate-900 border border-slate-750 text-[10px] font-mono text-slate-300 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20">
                <p className="font-bold text-slate-100">{evt.title}</p>
                <div className="flex justify-between mt-1 text-slate-400">
                  <span>Likelihood: {evt.likelihood}/5</span>
                  <span>Impact: {evt.consequence}/5</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Axis Labels */}
        <div className="absolute -bottom-1 left-0 right-0 text-center text-[10px] font-mono text-slate-400">
          PROBABILITY / LIKELIHOOD (1: RARE → 5: FREQUENT)
        </div>
        <div className="absolute top-1/2 -left-3 -rotate-90 -translate-y-1/2 text-[10px] font-mono text-slate-400">
          CONSEQUENCE
        </div>
      </div>
    </div>
  );
};
