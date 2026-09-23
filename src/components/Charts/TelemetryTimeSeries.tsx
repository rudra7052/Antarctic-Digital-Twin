import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Brush
} from 'recharts';
import { useAppStore } from '../../store/useAppStore';
import { generateTelemetryHistory } from '../../services/telemetryEngine';
import {
  Activity,
  History,
  Download,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const TelemetryTimeSeries: React.FC = () => {
  const { selectedStationId } = useAppStore();
  const [hours, setHours] = useState<number>(24);
  const [activeSeries, setActiveSeries] = useState<{ [key: string]: boolean }>({
    generatorTempC: true,
    generatorVibrationMmS: true,
    powerGenerationKw: true,
    waterLevelL: false,
    ambientTempC: false
  });

  const historyData = generateTelemetryHistory(selectedStationId, hours);

  // Compute statistical summaries
  const stats = React.useMemo(() => {
    if (!historyData.length) return null;
    const temps = historyData.map(d => d.generatorTempC);
    const vibs = historyData.map(d => d.generatorVibrationMmS);
    const powers = historyData.map(d => d.powerGenerationKw);

    const calc = (arr: number[]) => {
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      const variance = arr.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / arr.length;
      const std = Math.sqrt(variance);
      return { min: min.toFixed(1), max: max.toFixed(1), avg: avg.toFixed(1), std: std.toFixed(2) };
    };

    return {
      temp: calc(temps),
      vib: calc(vibs),
      power: calc(powers)
    };
  }, [historyData]);

  const toggleSeries = (key: string) => {
    setActiveSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const exportCSV = () => {
    const headers = 'Timestamp,GeneratorTempC,VibrationMmS,PowerGenKw,WaterL,AmbientTempC\n';
    const rows = historyData
      .map(d => `"${d.timestamp}",${d.generatorTempC},${d.generatorVibrationMmS},${d.powerGenerationKw},${d.waterLevelL},${d.ambientTempC}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedStationId}_telemetry_${hours}h.csv`;
    a.click();
  };

  return (
    <div className="rounded-3xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase">
              Multi-Parameter Telemetry Time Series
            </h2>
            <p className="text-xs font-mono text-slate-400">
              High-resolution historical SCADA sensor recording with statistical bounds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
            {[6, 24, 72, 168].map((h) => (
              <button
                key={h}
                onClick={() => setHours(h)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  hours === h
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {h >= 24 ? `${h / 24}D` : `${h}H`}
              </button>
            ))}
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 text-xs font-mono transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export Log</span>
          </button>
        </div>
      </div>

      {/* Series Filter Toggles */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-slate-400 text-[11px] mr-1">CHANNELS:</span>
        <button
          onClick={() => toggleSeries('generatorTempC')}
          className={`px-2.5 py-1 rounded-lg border transition-all ${
            activeSeries.generatorTempC
              ? 'bg-amber-950/70 border-amber-500 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          • Gen Core Temp (°C)
        </button>
        <button
          onClick={() => toggleSeries('generatorVibrationMmS')}
          className={`px-2.5 py-1 rounded-lg border transition-all ${
            activeSeries.generatorVibrationMmS
              ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          • Vibration (mm/s)
        </button>
        <button
          onClick={() => toggleSeries('powerGenerationKw')}
          className={`px-2.5 py-1 rounded-lg border transition-all ${
            activeSeries.powerGenerationKw
              ? 'bg-yellow-950/70 border-yellow-500 text-yellow-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          • Power Gen (kW)
        </button>
        <button
          onClick={() => toggleSeries('waterLevelL')}
          className={`px-2.5 py-1 rounded-lg border transition-all ${
            activeSeries.waterLevelL
              ? 'bg-blue-950/70 border-blue-500 text-blue-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          • Water Reserve (L)
        </button>
        <button
          onClick={() => toggleSeries('ambientTempC')}
          className={`px-2.5 py-1 rounded-lg border transition-all ${
            activeSeries.ambientTempC
              ? 'bg-sky-950/70 border-sky-500 text-sky-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          • Ambient Air (°C)
        </button>
      </div>

      {/* Main Time-Series Chart */}
      <div className="h-[340px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={historyData}
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis
              dataKey="timestamp"
              stroke="#64748b"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              tickFormatter={(t) => t.substring(11, 16)}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="rounded-xl bg-slate-900/95 border border-slate-750 p-3 shadow-2xl backdrop-blur-md text-xs font-mono space-y-1">
                    <span className="font-bold text-slate-200 block border-b border-slate-800 pb-1">
                      {label}
                    </span>
                    {payload.map((item: any, idx) => (
                      <div key={idx} className="flex justify-between gap-3" style={{ color: item.color }}>
                        <span>{item.name}:</span>
                        <span className="font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />

            {activeSeries.generatorTempC && (
              <Line
                type="monotone"
                dataKey="generatorTempC"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="Gen Temp (°C)"
              />
            )}
            {activeSeries.generatorVibrationMmS && (
              <Line
                type="monotone"
                dataKey="generatorVibrationMmS"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
                name="Vibration (mm/s)"
              />
            )}
            {activeSeries.powerGenerationKw && (
              <Line
                type="monotone"
                dataKey="powerGenerationKw"
                stroke="#eab308"
                strokeWidth={2}
                dot={false}
                name="Power Gen (kW)"
              />
            )}
            {activeSeries.waterLevelL && (
              <Line
                type="monotone"
                dataKey="waterLevelL"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Water Level (L)"
              />
            )}
            {activeSeries.ambientTempC && (
              <Line
                type="monotone"
                dataKey="ambientTempC"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                name="Ambient Temp (°C)"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Statistical Summary Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs font-mono">
          <div className="rounded-xl bg-slate-900/60 p-2.5 border border-slate-800">
            <span className="text-amber-400 block font-semibold mb-1">GENERATOR TEMP (°C)</span>
            <div className="flex justify-between text-slate-300 text-[11px]">
              <span>Min: {stats.temp.min}°</span>
              <span>Avg: {stats.temp.avg}°</span>
              <span>Max: {stats.temp.max}°</span>
              <span className="text-slate-400">σ: {stats.temp.std}</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-2.5 border border-slate-800">
            <span className="text-cyan-400 block font-semibold mb-1">VIBRATION RMS (mm/s)</span>
            <div className="flex justify-between text-slate-300 text-[11px]">
              <span>Min: {stats.vib.min}</span>
              <span>Avg: {stats.vib.avg}</span>
              <span>Max: {stats.vib.max}</span>
              <span className="text-slate-400">σ: {stats.vib.std}</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-2.5 border border-slate-800">
            <span className="text-yellow-400 block font-semibold mb-1">MICROGRID POWER (kW)</span>
            <div className="flex justify-between text-slate-300 text-[11px]">
              <span>Min: {stats.power.min}</span>
              <span>Avg: {stats.power.avg}</span>
              <span>Max: {stats.power.max}</span>
              <span className="text-slate-400">σ: {stats.power.std}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
