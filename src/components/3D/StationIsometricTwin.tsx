import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ANTARCTIC_STATIONS } from '../../data/mockStations';
import {
  Box,
  Cpu,
  Droplets,
  Fuel,
  BatteryCharging,
  Radio,
  Wind,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

export const StationIsometricTwin: React.FC = () => {
  const { selectedStationId, currentTelemetry, simulation } = useAppStore();
  const station = ANTARCTIC_STATIONS[selectedStationId] || ANTARCTIC_STATIONS.bharati;

  const [activeModule, setActiveModule] = useState<string>('generator');

  const isGenHot = currentTelemetry.generatorTempC > 90;
  const isGenVib = currentTelemetry.generatorVibrationMmS > 4.5;
  const waterPercent = (currentTelemetry.waterLevelL / currentTelemetry.waterMaxL) * 100;
  const fuelPercent = (currentTelemetry.fuelLevelL / currentTelemetry.fuelMaxL) * 100;

  const modules = [
    {
      id: 'generator',
      name: 'Generator & CHP Thermal Plant',
      icon: Cpu,
      status: isGenHot || isGenVib ? 'CRITICAL' : 'OPTIMAL',
      statusColor: isGenHot || isGenVib ? 'bg-red-500' : 'bg-emerald-500',
      description: 'Caterpillar 3512B Arctic Diesel Generator paired with heat-recovery glycol loops.',
      metrics: [
        { label: 'Core Temperature', val: `${currentTelemetry.generatorTempC}°C` },
        { label: 'Vibration Amplitude', val: `${currentTelemetry.generatorVibrationMmS} mm/s` },
        { label: 'Electrical Output', val: `${currentTelemetry.powerGenerationKw} kW` },
        { label: 'Mechanical Efficiency', val: `${currentTelemetry.generatorEfficiencyPercent}%` }
      ]
    },
    {
      id: 'water_plant',
      name: 'Desalination & Freshwater Tanks',
      icon: Droplets,
      status: waterPercent < 25 ? 'WARNING' : 'OPTIMAL',
      statusColor: waterPercent < 25 ? 'bg-amber-500' : 'bg-blue-500',
      description: 'Reverse Osmosis (RO) filtration plant with trace-heated intake and ultraviolet sanitizers.',
      metrics: [
        { label: 'Current Reserve', val: `${currentTelemetry.waterLevelL.toLocaleString()} L` },
        { label: 'Tank Fill Level', val: `${waterPercent.toFixed(1)}%` },
        { label: 'Daily Consumption', val: `${currentTelemetry.waterConsumptionRateLPerDay} L/d` },
        { label: 'Autonomy Margin', val: `${currentTelemetry.waterDaysRemaining} days` }
      ]
    },
    {
      id: 'fuel_farm',
      name: 'Arctic Diesel Fuel Tank Farm',
      icon: Fuel,
      status: 'OPTIMAL',
      statusColor: 'bg-amber-500',
      description: 'Double-walled insulated cryogenic fuel storage with automatic vacuum leak detection.',
      metrics: [
        { label: 'Stored Volume', val: `${currentTelemetry.fuelLevelL.toLocaleString()} L` },
        { label: 'Capacity Fill', val: `${fuelPercent.toFixed(1)}%` },
        { label: 'Burn Rate', val: `${currentTelemetry.fuelConsumptionRateLPerDay} L/d` },
        { label: 'Days Remaining', val: `${currentTelemetry.fuelDaysRemaining} days` }
      ]
    },
    {
      id: 'battery_bess',
      name: 'BESS Battery Storage Enclosure',
      icon: BatteryCharging,
      status: currentTelemetry.batterySocPercent < 30 ? 'CRITICAL' : 'OPTIMAL',
      statusColor: currentTelemetry.batterySocPercent < 30 ? 'bg-red-500' : 'bg-purple-500',
      description: 'Lithium Iron Phosphate (LiFePO4) 400 kWh storage bank buffer with active thermal management.',
      metrics: [
        { label: 'State of Charge', val: `${currentTelemetry.batterySocPercent}%` },
        { label: 'Cell Health (SOH)', val: `${currentTelemetry.batteryHealthPercent}%` },
        { label: 'Discharge Flow', val: `${currentTelemetry.batteryDischargeRateKw} kW` },
        { label: 'Cycle Counter', val: `${currentTelemetry.batteryCycleCount}` }
      ]
    },
    {
      id: 'satcom_radome',
      name: 'Polar SatCom Radome & Comms',
      icon: Radio,
      status: currentTelemetry.satcomUptimePercent < 95 ? 'WARNING' : 'OPTIMAL',
      statusColor: 'bg-indigo-500',
      description: '4.5-meter geodesic radome housing dual-axis auto-tracking satellite dishes.',
      metrics: [
        { label: 'Uptime', val: `${currentTelemetry.satcomUptimePercent}%` },
        { label: 'Bandwidth', val: `${currentTelemetry.satcomBandwidthMbps} Mbps` },
        { label: 'Round-Trip Latency', val: `${currentTelemetry.satcomLatencyMs} ms` },
        { label: 'Radome Heat', val: 'Active (De-iced)' }
      ]
    }
  ];

  const selectedMod = modules.find(m => m.id === activeModule) || modules[0];

  return (
    <div className="rounded-3xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase">
              3D Digital Twin Modular Blueprint: {station.name}
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Interactive SCADA subsystem schematic & isometric module inspector
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
          Crew: {station.currentCrew} / {station.crewCapacity} active
        </span>
      </div>

      {/* Main 3D Isometric Station Layout Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* SVG Isometric Schematic */}
        <div className="lg:col-span-8 relative h-[380px] rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 700 420" className="w-full h-full max-h-[380px]">
            <defs>
              <linearGradient id="groundGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              {/* Module Isometric Gradients */}
              <linearGradient id="modBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>

              <linearGradient id="modRed" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>

              <linearGradient id="modAmber" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>

            {/* Isometric Foundation Plate */}
            <polygon
              points="350,50 650,210 350,380 50,210"
              fill="url(#groundGrad)"
              stroke="#334155"
              strokeWidth="2"
            />

            {/* Grid Lines on Foundation */}
            <line x1="200" y1="130" x2="500" y2="295" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="500" y1="130" x2="200" y2="295" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />

            {/* Connecting Pipe & Power Conduits (animated glow) */}
            <path d="M 230,190 L 350,240 L 470,180" fill="none" stroke="#06b6d4" strokeWidth="3" opacity="0.7" strokeDasharray="6,3" />
            <path d="M 350,240 L 350,310" fill="none" stroke="#3b82f6" strokeWidth="3" opacity="0.8" />

            {/* Module 1: Generator & CHP (Center Left) */}
            <g
              id="twin-generator-block"
              className="cursor-pointer transition-all duration-200 hover:opacity-95"
              onClick={() => setActiveModule('generator')}
            >
              {/* Active selection glow halo */}
              {activeModule === 'generator' && (
                <ellipse cx="250" cy="180" rx="80" ry="50" fill="#06b6d4" fillOpacity="0.2" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4,4" />
              )}
              {/* Left face */}
              <polygon points="180,180 250,220 250,260 180,220" fill={isGenHot ? '#7f1d1d' : '#1e293b'} stroke="#334155" strokeWidth="1" />
              {/* Right face */}
              <polygon points="250,220 320,180 320,220 250,260" fill={isGenHot ? '#991b1b' : '#334155'} stroke="#475569" strokeWidth="1" />
              {/* Top face */}
              <polygon points="180,180 250,140 320,180 250,220" fill={isGenHot ? '#ef4444' : '#475569'} stroke={activeModule === 'generator' ? '#38bdf8' : '#64748b'} strokeWidth={activeModule === 'generator' ? 2 : 1} />
              
              {/* Status beacon */}
              <circle cx="250" cy="180" r="6" fill={isGenHot ? '#ef4444' : '#10b981'} className={isGenHot ? 'animate-ping' : ''} />
              
              {/* Pill Bubble */}
              <rect x="195" y="108" width="110" height="22" rx="11" fill="#0f172a" fillOpacity="0.92" stroke={activeModule === 'generator' ? '#38bdf8' : '#334155'} strokeWidth="1.5" />
              <text x="250" y="123" fill="#f8fafc" fontSize="10.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                ⚡ DG-1 CHP
              </text>
            </g>

            {/* Module 2: Desalination & Water Plant (Center Right) */}
            <g
              id="twin-water-block"
              className="cursor-pointer transition-all duration-200 hover:opacity-95"
              onClick={() => setActiveModule('water_plant')}
            >
              {activeModule === 'water_plant' && (
                <ellipse cx="450" cy="170" rx="80" ry="50" fill="#06b6d4" fillOpacity="0.2" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4,4" />
              )}
              {/* Left face */}
              <polygon points="380,170 450,210 450,250 380,210" fill="#075985" stroke="#0369a1" strokeWidth="1" />
              {/* Right face */}
              <polygon points="450,210 520,170 520,210 450,250" fill="#0284c7" stroke="#0ea5e9" strokeWidth="1" />
              {/* Top face */}
              <polygon points="380,170 450,130 520,170 450,210" fill="#0369a1" stroke={activeModule === 'water_plant' ? '#38bdf8' : '#38bdf8'} strokeWidth={activeModule === 'water_plant' ? 2 : 1} />

              <circle cx="450" cy="170" r="6" fill="#0ea5e9" />
              
              {/* Pill Bubble */}
              <rect x="380" y="98" width="140" height="22" rx="11" fill="#082f49" fillOpacity="0.92" stroke={activeModule === 'water_plant' ? '#38bdf8' : '#0369a1'} strokeWidth="1.5" />
              <text x="450" y="113" fill="#bae6fd" fontSize="10.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                💧 WATER ({waterPercent.toFixed(0)}%)
              </text>
            </g>

            {/* Module 3: Fuel Tank Farm (Bottom Center) */}
            <g
              id="twin-fuel-block"
              className="cursor-pointer transition-all duration-200 hover:opacity-95"
              onClick={() => setActiveModule('fuel_farm')}
            >
              {activeModule === 'fuel_farm' && (
                <ellipse cx="350" cy="270" rx="65" ry="40" fill="#f59e0b" fillOpacity="0.2" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4,4" />
              )}
              {/* Left face */}
              <polygon points="300,270 350,300 350,335 300,305" fill="#78350f" stroke="#92400e" strokeWidth="1" />
              {/* Right face */}
              <polygon points="350,300 400,270 400,305 350,335" fill="#b45309" stroke="#d97706" strokeWidth="1" />
              {/* Top face */}
              <polygon points="300,270 350,240 400,270 350,300" fill="#d97706" stroke={activeModule === 'fuel_farm' ? '#fde68a' : '#f59e0b'} strokeWidth={activeModule === 'fuel_farm' ? 2 : 1} />

              <circle cx="350" cy="270" r="5" fill="#f59e0b" />
              
              {/* Pill Bubble */}
              <rect x="280" y="340" width="140" height="22" rx="11" fill="#451a03" fillOpacity="0.92" stroke={activeModule === 'fuel_farm' ? '#fbbf24' : '#b45309'} strokeWidth="1.5" />
              <text x="350" y="355" fill="#fde68a" fontSize="10.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                ⛽ FUEL ({fuelPercent.toFixed(0)}%)
              </text>
            </g>

            {/* Module 4: SatCom Radome (Top Center) */}
            <g
              id="twin-satcom-block"
              className="cursor-pointer transition-all duration-200 hover:opacity-95"
              onClick={() => setActiveModule('satcom_radome')}
            >
              {activeModule === 'satcom_radome' && (
                <ellipse cx="350" cy="95" rx="50" ry="35" fill="#6366f1" fillOpacity="0.2" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4,4" />
              )}
              <circle cx="350" cy="95" r="24" fill="#312e81" stroke={activeModule === 'satcom_radome' ? '#a5b4fc' : '#6366f1'} strokeWidth={activeModule === 'satcom_radome' ? 2.5 : 1.5} />
              <circle cx="350" cy="95" r="15" fill="#4338ca" />
              <line x1="350" y1="71" x2="350" y2="50" stroke="#a5b4fc" strokeWidth="2" />
              <circle cx="350" cy="50" r="3.5" fill="#67e8f9" />
              
              {/* Pill Bubble */}
              <rect x="280" y="24" width="140" height="22" rx="11" fill="#1e1b4b" fillOpacity="0.92" stroke={activeModule === 'satcom_radome' ? '#818cf8' : '#4338ca'} strokeWidth="1.5" />
              <text x="350" y="39" fill="#c7d2fe" fontSize="10.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                📡 SATCOM RADOME
              </text>
            </g>

            {/* Module 5: BESS Battery Storage (Far Left) */}
            <g
              id="twin-battery-block"
              className="cursor-pointer transition-all duration-200 hover:opacity-95"
              onClick={() => setActiveModule('battery_bess')}
            >
              {activeModule === 'battery_bess' && (
                <ellipse cx="170" cy="230" rx="65" ry="40" fill="#a855f7" fillOpacity="0.2" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4,4" />
              )}
              {/* Left face */}
              <polygon points="120,230 170,260 170,290 120,260" fill="#581c87" stroke="#6b21a8" strokeWidth="1" />
              {/* Right face */}
              <polygon points="170,260 220,230 220,260 170,290" fill="#6b21a8" stroke="#7e22ce" strokeWidth="1" />
              {/* Top face */}
              <polygon points="120,230 170,200 220,230 170,260" fill="#7e22ce" stroke={activeModule === 'battery_bess' ? '#e9d5ff' : '#a855f7'} strokeWidth={activeModule === 'battery_bess' ? 2 : 1} />

              {/* Pill Bubble */}
              <rect x="95" y="295" width="150" height="22" rx="11" fill="#3b0764" fillOpacity="0.92" stroke={activeModule === 'battery_bess' ? '#c084fc' : '#6b21a8'} strokeWidth="1.5" />
              <text x="170" y="310" fill="#e9d5ff" fontSize="10.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                🔋 BESS ({currentTelemetry.batterySocPercent}%)
              </text>
            </g>
          </svg>

          {/* Floating Instructions */}
          <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-1 rounded-md border border-slate-800">
            Click module to inspect SCADA status
          </div>
        </div>

        {/* Selected Module Detail Panel */}
        <div className="lg:col-span-4 rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${selectedMod.statusColor} animate-pulse`} />
                <h3 className="text-xs font-mono font-bold text-slate-100 uppercase">
                  {selectedMod.name}
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                {selectedMod.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              {selectedMod.description}
            </p>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {selectedMod.metrics.map((m, idx) => (
                <div key={idx} className="bg-slate-950/80 rounded-xl p-2 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{m.label}</span>
                  <span className="font-bold text-slate-100 text-sm">{m.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-cyan-400 flex items-center justify-between">
            <span>SCADA Protocol: Modbus TCP</span>
            <span className="text-emerald-400">Telemetry: OK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
