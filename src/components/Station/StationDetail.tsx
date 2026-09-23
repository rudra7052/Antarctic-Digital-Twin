import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ANTARCTIC_STATIONS } from '../../data/mockStations';
import { StatusBadge } from '../Cards/StatusBadge';
import {
  X,
  MapPin,
  Users,
  Calendar,
  Compass,
  FileText,
  Radio,
  Zap,
  Droplets,
  ShieldCheck,
  AlertTriangle,
  Download,
  Share2
} from 'lucide-react';

export const StationDetail: React.FC = () => {
  const {
    detailModalStationId,
    closeStationDetailModal,
    currentTelemetry,
    simulation
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'equipment' | 'sops'>('overview');

  if (!detailModalStationId) return null;

  const station = ANTARCTIC_STATIONS[detailModalStationId] || ANTARCTIC_STATIONS.bharati;

  const exportStationReport = () => {
    const report = {
      station: station.name,
      country: station.country,
      coordinates: station.coordinates,
      crew: `${station.currentCrew} / ${station.crewCapacity}`,
      telemetry: currentTelemetry,
      simulationState: simulation,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${station.id}_scada_report_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-950 border border-slate-750 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-slate-100 uppercase">
                  {station.name}
                </h2>
                <StatusBadge status={simulation.mode === 'FAILURE_MODE' ? 'CRITICAL' : 'NORMAL'} size="sm" />
              </div>
              <p className="text-xs font-mono text-slate-400">
                {station.country} • Established {station.established} • {station.stationType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportStationReport}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-cyan-400 transition-colors"
              title="Export Station JSON Diagnostic Report"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={closeStationDetailModal}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/30 text-xs font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 border-b-2 font-bold transition-all ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Station Overview
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-3.5 py-2 border-b-2 font-bold transition-all ${
              activeTab === 'equipment'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Equipment Specs & SCADA
          </button>
          <button
            onClick={() => setActiveTab('sops')}
            className={`px-3.5 py-2 border-b-2 font-bold transition-all ${
              activeTab === 'sops'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Emergency SOP Manual
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4 font-mono text-xs">
              <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                {station.description}
              </p>

              {/* Geographic & Operational Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">COORDINATES</span>
                  <span className="text-slate-100 font-bold">
                    {station.coordinates.lat}° S, {station.coordinates.lng}° E
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">ELEVATION</span>
                  <span className="text-cyan-400 font-bold">{station.coordinates.elevationM} meters</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">CREW (CURRENT/CAP)</span>
                  <span className="text-emerald-400 font-bold">{station.currentCrew} / {station.crewCapacity}</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">REGION</span>
                  <span className="text-slate-100 font-bold">{station.coordinates.region}</span>
                </div>
              </div>

              {/* Scientific Research Missions */}
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-2">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">
                  ACTIVE RESEARCH DISCIPLINES:
                </span>
                <div className="flex flex-wrap gap-2">
                  {station.primaryResearch.map((focus, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 text-cyan-300 border border-slate-800 text-[11px]"
                    >
                      • {focus}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-amber-400 font-bold block flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> PRIMARY POWER & CHP
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    Main generator: 3x 125 kVA Caterpillar Diesel + 65kW PV Array
                  </p>
                  <p className="text-slate-400 text-[10px]">
                    Backup: 2x 100 kVA Automated Quick-Start Standby DG
                  </p>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-blue-400 font-bold block flex items-center gap-1.5">
                    <Droplets className="w-4 h-4" /> WATER & LIFE-SUPPORT
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    Plant Type: Dual-Stage Reverse Osmosis Desalination & Cryo-Melt Loop
                  </p>
                  <p className="text-slate-400 text-[10px]">
                    Buffer Capacity: 45,000 Liters Heated Vacuum-Insulated Tank
                  </p>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-indigo-400 font-bold block flex items-center gap-1.5">
                    <Radio className="w-4 h-4" /> COMMS & SATCOM
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    Array: 3.8m Ku-Band / C-Band Radome + Iridium Certus Polar Gateway
                  </p>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-teal-400 font-bold block flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> LIFE SUPPORT & HVAC
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    System: Dual Redundant Glycol Heat Exchange Air Recirculation
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sops' && (
            <div className="space-y-3 font-mono text-xs">
              <span className="text-slate-400 text-[10px] block font-bold uppercase">
                EMERGENCY STANDARD OPERATING PROCEDURES (SOPS):
              </span>
              <div className="space-y-2">
                {station.emergencySOP.map((sop, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-200"
                  >
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold text-[10px] shrink-0">
                      STEP {idx + 1}
                    </span>
                    <p className="text-xs leading-relaxed">{sop}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            NCPOR Polar Telemetry Registry: ID <strong className="text-slate-200">{station.id}</strong>
          </span>
          <button
            onClick={closeStationDetailModal}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
