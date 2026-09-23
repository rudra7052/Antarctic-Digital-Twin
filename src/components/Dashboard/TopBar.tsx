import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ANTARCTIC_STATIONS } from '../../data/mockStations';
import { StationId } from '../../types';
import { StatusBadge } from '../Cards/StatusBadge';
import {
  Compass,
  Radio,
  Flame,
  Bot,
  Sun,
  Moon,
  Zap,
  Activity,
  Maximize2
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    selectedStationId,
    setSelectedStationId,
    currentTelemetry,
    simulation,
    toggleFailureMode,
    isDarkMode,
    toggleDarkMode,
    isConnected,
    connectionLatencyMs,
    lastUpdated,
    toggleChatDrawer,
    unreadAlertsCount
  } = useAppStore();

  const [timeUtc, setTimeUtc] = useState<string>('');
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
      const updatedDiff = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
      setSecondsAgo(Math.max(0, updatedDiff));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const currentStation = ANTARCTIC_STATIONS[selectedStationId] || ANTARCTIC_STATIONS.bharati;

  const currentStatus = simulation.mode === 'FAILURE_MODE'
    ? 'CRITICAL'
    : (selectedStationId === 'maitri' ? 'WARNING' : 'NORMAL');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Mission Identifier */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
                ANTARCTIC DIGITAL TWIN
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  NCPOR SCADA
                </span>
              </h1>
            </div>
            <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span>{timeUtc}</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400/80">LAT {currentStation.coordinates.lat}° S</span>
            </p>
          </div>
        </div>

        {/* Station Selector & Status Indicator */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Station Selector */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-750 p-1">
            <span className="text-xs font-mono text-slate-400 px-2 flex items-center gap-1.5 hidden sm:flex">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              STATION:
            </span>
            <select
              id="station-selector-dropdown"
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value as StationId)}
              className="bg-slate-950 text-slate-200 text-xs font-medium font-mono rounded-md px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              {Object.values(ANTARCTIC_STATIONS).map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.country.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Live Status Badge */}
          <StatusBadge status={currentStatus} size="md" />

          {/* Simulation Mode Toggle Button */}
          <button
            id="simulation-mode-toggle-btn"
            onClick={() => toggleFailureMode()}
            className={`flex items-center gap-1.5 text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              simulation.mode === 'FAILURE_MODE'
                ? 'bg-red-950 text-red-300 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
            title="Toggle Live Simulation Failure Mode"
          >
            <Flame className={`w-3.5 h-3.5 ${simulation.mode === 'FAILURE_MODE' ? 'text-red-400' : 'text-amber-400'}`} />
            <span>{simulation.mode === 'FAILURE_MODE' ? 'SIM: FAILURE MODE' : 'SIM: NORMAL'}</span>
          </button>
        </div>

        {/* Live Sync Status & System Controls */}
        <div className="flex items-center gap-2">
          {/* Telemetry Sync Indicator */}
          <div className="hidden md:flex flex-col items-end text-[11px] font-mono leading-tight text-slate-400 pr-2 border-r border-slate-800">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              {isConnected ? 'LIVE TELEMETRY' : 'DISCONNECTED'} ({connectionLatencyMs}ms)
            </span>
            <span className="text-slate-500 text-[10px]">
              Sync: {secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`}
            </span>
          </div>

          {/* AI Copilot Quick Button */}
          <button
            id="open-ai-copilot-btn"
            onClick={() => toggleChatDrawer(true)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-medium shadow-md shadow-cyan-900/30 transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4 text-cyan-200" />
            <span className="hidden sm:inline">AI COPILOT</span>
            {unreadAlertsCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-750 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
            title="Toggle Light / Dark theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Fullscreen Button */}
          <button
            id="fullscreen-toggle-btn"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-750 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors hidden sm:flex"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
