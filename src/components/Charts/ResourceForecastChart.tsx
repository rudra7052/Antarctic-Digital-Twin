import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { useAppStore } from '../../store/useAppStore';
import { getStationForecast } from '../../services/telemetryEngine';
import {
  TrendingDown,
  Calendar,
  ShieldAlert,
  Ship,
  Sparkles,
  Download,
  Clock
} from 'lucide-react';

export const ResourceForecastChart: React.FC = () => {
  const { selectedStationId, simulation } = useAppStore();
  const [days, setDays] = useState<number>(90);
  const [activeTab, setActiveTab] = useState<'forecast' | 'consumption' | 'matrix'>('forecast');

  const forecastData = getStationForecast(selectedStationId, days, simulation);

  const downloadCSV = () => {
    const headers = 'DayOffset,Date,WaterPredictedL,WaterLowerL,WaterUpperL,FoodPredictedKg,FuelPredictedL,BatterySoc\n';
    const rows = forecastData.forecastPoints
      .map(p => `${p.dayOffset},"${p.date}",${p.waterPredictedL},${p.waterLowerL},${p.waterUpperL},${p.foodPredictedKg},${p.fuelPredictedL},${p.batteryPredictedSoc}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedStationId}_resource_forecast_${days}d.csv`;
    a.click();
  };

  return (
    <div className="rounded-3xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase">
              Resource Depletion Forecasting Engine
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Monte Carlo predictive burn models with confidence intervals & resupply milestones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Horizon Selector (30 / 60 / 90 Days) */}
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
            {[30, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  days === d
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}D
              </button>
            ))}
          </div>

          <button
            onClick={downloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 text-xs font-mono transition-all"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Depletion Forecast Chart */}
      <div className="h-[360px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={forecastData.forecastPoints}
            margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              tickFormatter={(val) => `${val.toLocaleString()} L`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const point = payload[0].payload;
                return (
                  <div className="rounded-xl bg-slate-900/95 border border-slate-750 p-3 shadow-2xl backdrop-blur-md text-xs font-mono space-y-1.5">
                    <div className="flex items-center justify-between gap-4 font-bold text-slate-200 border-b border-slate-800 pb-1">
                      <span>{label} (Day +{point.dayOffset})</span>
                      {point.isResupplyMilestone && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          🚢 Resupply Vessel
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-slate-300">
                      <div className="flex justify-between gap-3 text-cyan-400">
                        <span>Water (Predicted):</span>
                        <span className="font-bold">{point.waterPredictedL?.toLocaleString()} L</span>
                      </div>
                      <div className="flex justify-between gap-3 text-cyan-400/70 text-[10px]">
                        <span>Confidence Band:</span>
                        <span>{point.waterLowerL?.toLocaleString()} - {point.waterUpperL?.toLocaleString()} L</span>
                      </div>
                      <div className="flex justify-between gap-3 text-emerald-400">
                        <span>Food (Predicted):</span>
                        <span className="font-bold">{point.foodPredictedKg?.toLocaleString()} kg</span>
                      </div>
                      <div className="flex justify-between gap-3 text-amber-400">
                        <span>Fuel (Predicted):</span>
                        <span className="font-bold">{point.fuelPredictedL?.toLocaleString()} L</span>
                      </div>
                      <div className="flex justify-between gap-3 text-purple-400">
                        <span>Battery SoC:</span>
                        <span className="font-bold">{point.batteryPredictedSoc}%</span>
                      </div>
                    </div>
                    {point.resupplyDetails && (
                      <p className="text-[10px] text-emerald-400 border-t border-slate-800 pt-1">
                        {point.resupplyDetails}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
            />

            {/* Critical reserve threshold 20% */}
            <ReferenceLine
              y={5000}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: 'CRITICAL THRESHOLD (5,000 L)', fill: '#ef4444', fontSize: 10, fontFamily: 'monospace' }}
            />

            {/* Confidence Envelope Shading */}
            <Area
              type="monotone"
              dataKey="waterUpperL"
              stroke="transparent"
              fill="#06b6d4"
              fillOpacity={0.08}
              name="Confidence Interval"
            />
            <Area
              type="monotone"
              dataKey="waterLowerL"
              stroke="transparent"
              fill="#0f172a"
              fillOpacity={0.4}
              name="Lower Bound"
            />

            {/* Primary Trajectory Lines */}
            <Line
              type="monotone"
              dataKey="waterPredictedL"
              stroke="#06b6d4"
              strokeWidth={2.5}
              dot={false}
              name="Freshwater (L)"
              activeDot={{ r: 6, fill: '#06b6d4', stroke: '#ffffff' }}
            />
            <Line
              type="monotone"
              dataKey="fuelPredictedL"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="Arctic Fuel (L)"
            />
            <Line
              type="monotone"
              dataKey="foodPredictedKg"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Food Reserve (kg)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Depletion Milestones Footer Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs font-mono">
        <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">WATER DEPLETION:</span>
          <span className="font-bold text-cyan-400">{forecastData.depletionDates.water || '> 147 Days'}</span>
        </div>
        <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">NEXT SEA RESUPPLY:</span>
          <span className="font-bold text-emerald-400">Day +60 (R/V Maitri)</span>
        </div>
        <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">ML MODEL ACCURACY:</span>
          <span className="font-bold text-purple-400">{forecastData.accuracyPercentage}% (LSTM)</span>
        </div>
      </div>
    </div>
  );
};
