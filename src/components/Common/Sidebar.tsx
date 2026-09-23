import React from 'react';
import { useAppStore, MainNavTab } from '../../store/useAppStore';
import {
  LayoutDashboard,
  Globe2,
  Box,
  TrendingDown,
  Cpu,
  AlertTriangle,
  History,
  BellRing,
  Bot,
  Layers,
  Settings2
} from 'lucide-react';

interface NavItem {
  id: MainNavTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  highlight?: boolean;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, unreadAlertsCount, simulation, toggleChatDrawer } = useAppStore();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    { id: 'globe_3d', label: '3D Polar GIS Globe', icon: Globe2 },
    { id: 'station_twin', label: '3D Station Twin', icon: Box },
    { id: 'forecasts', label: 'Resource Forecasts', icon: TrendingDown },
    { id: 'equipment', label: 'Equipment Health', icon: Cpu },
    { id: 'risk', label: 'Risk Assessment', icon: AlertTriangle, highlight: simulation.mode === 'FAILURE_MODE' },
    { id: 'history', label: 'Telemetry History', icon: History },
    { id: 'alerts', label: 'Alerts & Anomalies', icon: BellRing, badge: unreadAlertsCount },
    { id: 'assistant', label: 'AI RAG Copilot', icon: Bot }
  ];

  return (
    <aside className="w-16 md:w-60 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col justify-between transition-all">
      <div className="p-3 space-y-4">
        {/* Navigation List */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 hidden md:block">
            Polar Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  if (item.id === 'assistant') {
                    toggleChatDrawer(true);
                  }
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center justify-center md:justify-between px-3 py-2.5 rounded-xl text-xs font-medium font-mono transition-all group ${
                  isActive
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent'
                } ${item.highlight ? 'ring-1 ring-red-500/50 text-red-300' : ''}`}
                title={item.label}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                    }`}
                  />
                  <span className="hidden md:inline truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="hidden md:flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Status Panel */}
      <div className="p-3 border-t border-slate-900 hidden md:block">
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              GIS MESH
            </span>
            <span className="text-emerald-400">ONLINE</span>
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">
            TransAnomaly ML Inference Engine v4.2 active.
          </div>
        </div>
      </div>
    </aside>
  );
};
