import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FailureScenarioType } from '../../types';
import {
  Flame,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Zap,
  Droplets,
  Radio,
  Wind
} from 'lucide-react';

export const SimulationControls: React.FC = () => {
  const {
    simulation,
    setSimulationMode,
    setFailureScenario,
    setSimulationSpeed,
    togglePauseSimulation,
    resetSimulation
  } = useAppStore();

  const scenarios: { id: FailureScenarioType; label: string; desc: string; icon: React.ElementType }[] = [
    {
      id: 'none',
      label: 'Nominal Baseline',
      desc: 'All systems operating within normal bounds',
      icon: Zap
    },
    {
      id: 'generator_bearing_failure',
      label: 'DG Bearing Lockup & Thermal Overheat',
      desc: 'Vibration >7.5 mm/s, core temp >96°C, power drop',
      icon: Flame
    },
    {
      id: 'water_leak_pipe_freeze',
      label: 'Freshwater Intake Pipeline Freeze',
      desc: 'Trace heat cut, 3x rapid water loss & RO cutoff',
      icon: Droplets
    },
    {
      id: 'severe_blizzard_cutoff',
      label: 'Catastrophic Polar Blizzard (85 kts)',
      desc: 'Wind gusts damage solar, forces full diesel run',
      icon: Wind
    },
    {
      id: 'satcom_radome_failure',
      label: 'SatCom Radome Heavy Ice Accretion',
      desc: 'Comms uptime drops to 64%, latency spikes to 950ms',
      icon: Radio
    }
  ];

  return (
    <div className="rounded-3xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-950 border border-amber-800/60 text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase">
              Digital Twin Simulation & Fault Injection Engine
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Inject failure scenarios, adjust time acceleration, and observe cascading propagation
            </p>
          </div>
        </div>

        {/* Play / Pause / Speed buttons */}
        <div className="flex items-center gap-2">
          <button
            id="simulation-play-pause-btn"
            onClick={togglePauseSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
              simulation.isPaused
                ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-sm'
                : 'bg-slate-900 text-slate-300 border-slate-750 hover:border-slate-600'
            }`}
          >
            {simulation.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{simulation.isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>

          {/* Speed multiplier */}
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs font-mono">
            {([1, 2, 5, 10] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  simulation.speed === spd
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}X
              </button>
            ))}
          </div>

          <button
            onClick={resetSimulation}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-400 hover:text-white transition-colors"
            title="Reset Simulation State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Switcher: Normal vs Failure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => {
            setSimulationMode('NORMAL');
            setFailureScenario('none');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
            simulation.mode === 'NORMAL'
              ? 'bg-emerald-950/40 border-emerald-500/60 text-slate-100 shadow-sm shadow-emerald-950/20'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div>
            <span className="text-xs font-mono font-bold block text-emerald-400">
              NORMAL OPERATIONAL SIMULATION
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Realistic diurnal solar variance & steady resource consumption.
            </span>
          </div>
          <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0 ml-2" />
        </button>

        <button
          onClick={() => {
            setSimulationMode('FAILURE_MODE');
            setFailureScenario('generator_bearing_failure');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
            simulation.mode === 'FAILURE_MODE'
              ? 'bg-red-950/40 border-red-500/60 text-slate-100 shadow-sm shadow-red-950/30'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div>
            <span className="text-xs font-mono font-bold block text-red-400">
              FAILURE SCENARIO INJECTION MODE
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Forces equipment degradation, rapid resource burn, and alarm cascades.
            </span>
          </div>
          <span className="h-3 w-3 rounded-full bg-red-500 animate-ping shrink-0 ml-2" />
        </button>
      </div>

      {/* Failure Scenario Selection Grid */}
      {simulation.mode === 'FAILURE_MODE' && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-mono text-slate-400 block font-semibold">
            SELECT ACTIVE FAULT INJECTION SCENARIO:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {scenarios.map((sc) => {
              const Icon = sc.icon;
              const isSelected = simulation.failureScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setFailureScenario(sc.id)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    isSelected
                      ? 'bg-red-950/50 border-red-500 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-red-900 text-red-300' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold block text-slate-200">
                      {sc.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {sc.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
