import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { TopBar } from './components/Dashboard/TopBar';
import { Sidebar } from './components/Common/Sidebar';
import { DashboardPage } from './pages/Dashboard';
import { ForecastsPage } from './pages/Forecasts';
import { EquipmentPage } from './pages/Equipment';
import { RiskPage } from './pages/RiskPage';
import { HistoryPage } from './pages/HistoryPage';
import { AlertsPage } from './pages/AlertsPage';
import { GlobeViewer } from './components/3D/GlobeViewer';
import { GISLayers } from './components/3D/GISLayers';
import { StationIsometricTwin } from './components/3D/StationIsometricTwin';
import { ChatPanel } from './components/Assistant/ChatPanel';
import { StationDetail } from './components/Station/StationDetail';

export default function App() {
  const { activeTab, isDarkMode, isChatDrawerOpen, toggleChatDrawer } = useAppStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'globe_3d':
        return (
          <div className="space-y-6 pb-12 animate-fade-in">
            <GlobeViewer />
            <GISLayers />
          </div>
        );
      case 'station_twin':
        return (
          <div className="space-y-6 pb-12 animate-fade-in">
            <StationIsometricTwin />
          </div>
        );
      case 'forecasts':
        return <ForecastsPage />;
      case 'equipment':
        return <EquipmentPage />;
      case 'risk':
        return <RiskPage />;
      case 'history':
        return <HistoryPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'assistant':
        return (
          <div className="h-[calc(100vh-120px)] animate-fade-in">
            <ChatPanel />
          </div>
        );
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top SCADA Mission Control Bar */}
      <TopBar />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950/40 relative">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>

        {/* Slide-out AI Assistant Drawer (when opened via quick button) */}
        {isChatDrawerOpen && activeTab !== 'assistant' && (
          <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] p-4 bg-slate-950/90 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col animate-slide-left">
            <ChatPanel />
          </div>
        )}
      </div>

      {/* Station Details & Emergency SOP Modal */}
      <StationDetail />
    </div>
  );
}
