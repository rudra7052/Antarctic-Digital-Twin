import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { AlertNotification } from '../../types';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Filter,
  Flame,
  Bot,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const AlertFeed: React.FC = () => {
  const { alerts, acknowledgeAlert, triggerMLInference, isRunningInference, toggleChatDrawer } = useAppStore();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="rounded-3xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-950 border border-red-800/60 text-red-400">
            <Bell className="w-5 h-5 animate-swing" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase">
              Explainable Anomaly & SCADA Alert Stream
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Live automated fault diagnostics powered by TransAnomaly Deep Learning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Severity filter buttons */}
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs font-mono">
            {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterSeverity === sev
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <button
            onClick={() => triggerMLInference()}
            disabled={isRunningInference}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-cyan-400 text-xs font-mono transition-all cursor-pointer disabled:opacity-50"
            title="Re-run ML Inference"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningInference ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Run Inference</span>
          </button>
        </div>
      </div>

      {/* Alerts Feed List */}
      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 font-mono text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
            No active alerts under this filter. All telemetry within nominal envelope.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';

            return (
              <div
                key={alert.id}
                id={`alert-card-${alert.id}`}
                className={`rounded-2xl border p-4 transition-all space-y-2.5 ${
                  alert.acknowledged
                    ? 'bg-slate-950/60 border-slate-800/80 opacity-60'
                    : isCritical
                    ? 'bg-red-950/40 border-red-500/50 shadow-sm shadow-red-950/30'
                    : isWarning
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                {/* Title and metadata row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      isCritical ? 'bg-red-950 text-red-400 border border-red-800' : isWarning ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-800 text-cyan-400'
                    }`}>
                      {isCritical ? <AlertOctagon className="w-4 h-4" /> : isWarning ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-xs font-mono font-bold text-slate-100">
                        {alert.title}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        {alert.timestamp} • Category: {alert.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isCritical ? 'bg-red-950 text-red-300 border-red-700' : isWarning ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-slate-900 text-cyan-300 border-slate-700'
                    }`}>
                      {alert.severity}
                    </span>

                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>

                {/* Body message */}
                <p className="text-xs font-mono text-slate-300 leading-relaxed pl-8">
                  {alert.message}
                </p>

                {/* Explainable AI & Recommended Action */}
                <div className="ml-8 rounded-xl bg-slate-950/90 border border-slate-800 p-3 space-y-2 text-xs font-mono">
                  <div className="flex items-start gap-2 text-amber-300">
                    <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">ROOT CAUSE:</span>
                    <span className="text-[11px]">{alert.rootCause}</span>
                  </div>
                  <div className="flex items-start gap-2 text-emerald-300 border-t border-slate-800/80 pt-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">RECOMMENDED SOP:</span>
                    <span className="text-[11px]">{alert.recommendedAction}</span>
                  </div>
                </div>

                {/* AI Consult Quick Trigger */}
                <div className="flex justify-end gap-2 pt-1 pl-8">
                  <button
                    onClick={() => toggleChatDrawer(true)}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-800/60 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask AI Copilot for Emergency Procedure</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
