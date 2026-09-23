import { create } from 'zustand';
import {
  StationId,
  TelemetryReading,
  AlertNotification,
  GISLayerState,
  SimulationConfig,
  FailureScenarioType,
  ChatMessage
} from '../types';
import { getStationTelemetry, getStationAlerts } from '../services/telemetryEngine';

export type MainNavTab =
  | 'dashboard'
  | 'globe_3d'
  | 'station_twin'
  | 'forecasts'
  | 'equipment'
  | 'risk'
  | 'history'
  | 'alerts'
  | 'assistant';

interface AppState {
  // Navigation & Active Station
  selectedStationId: StationId;
  activeTab: MainNavTab;
  stationDetailModalId: StationId | null;
  detailModalStationId: StationId | null;
  isChatDrawerOpen: boolean;
  
  // Theme & System
  isDarkMode: boolean;
  isConnected: boolean;
  connectionLatencyMs: number;
  lastUpdated: string;
  isRunningInference: boolean;

  // GIS & Map Layers
  gisLayers: GISLayerState;
  mapZoomLevel: number;
  focusedCoordinates: { lat: number; lng: number } | null;

  // Simulation Engine
  simulation: SimulationConfig;

  // Telemetry & Alerts
  currentTelemetry: TelemetryReading;
  allStationsTelemetry: Partial<Record<StationId, TelemetryReading>>;
  alerts: AlertNotification[];
  unreadAlertsCount: number;

  // AI Assistant Chat
  chatMessages: ChatMessage[];
  isAssistantThinking: boolean;

  // Actions
  setSelectedStationId: (id: StationId) => void;
  setActiveTab: (tab: MainNavTab) => void;
  openStationDetailModal: (id: StationId | null) => void;
  closeStationDetailModal: () => void;
  toggleChatDrawer: (open?: boolean) => void;
  toggleDarkMode: () => void;
  toggleGISLayer: (layerKey: keyof GISLayerState) => void;
  setGISLayers: (layers: Partial<GISLayerState>) => void;
  focusMapOn: (lat: number, lng: number) => void;
  
  // Simulation Actions
  toggleFailureMode: (enable?: boolean) => void;
  setSimulationMode: (mode: 'NORMAL' | 'FAILURE_MODE') => void;
  setFailureScenario: (scenario: FailureScenarioType) => void;
  setSimulationSpeed: (speed: 1 | 2 | 4 | 5 | 10) => void;
  toggleSimulationPause: () => void;
  togglePauseSimulation: () => void;
  resetSimulation: () => void;
  injectManualTelemetry: (overrides: Partial<TelemetryReading>) => void;
  triggerMLInference: () => Promise<void>;

  // Alert Actions
  dismissAlert: (id: string) => void;
  acknowledgeAlert: (id: string) => void;
  clearAllAlerts: () => void;

  // Chat Actions
  addChatMessage: (msg: ChatMessage | Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateChatMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setAssistantThinking: (thinking: boolean) => void;
  updateLastMessageStream: (chunk: string) => void;

  // Periodic Tick
  tickTelemetry: () => void;
}

const defaultSimulation: SimulationConfig = {
  mode: 'NORMAL',
  failureScenario: 'none',
  speed: 1,
  isPaused: false,
  activeSince: new Date().toISOString(),
  manualOverrides: {}
};

const defaultGISLayers: GISLayerState = {
  stations: true,
  telemetryLabels: true,
  temperatureHeatmap: true,
  riskZones: true,
  serviceAreas: true,
  anomalyDensity: false,
  weatherWindVectors: true,
  satcomCoverageBeams: false,
  elevationContours: true,
  interStationCorridor: true
};

const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    text: `Greetings, Antarctic Operations Commander. I am the **Antarctic Digital Twin AI Copilot**, synchronized with real-time telemetry streams from Bharati, Maitri, and partner stations.

How can I assist you with polar resource monitoring, ML failure diagnostics, or emergency SOP execution today?`,
    timestamp: new Date().toISOString(),
    sources: [
      {
        title: 'NCPOR Antarctic Digital Twin Baseline',
        docType: 'TELEMETRY',
        snippet: 'Real-time multi-spectral sensor mesh for Bharati & Maitri stations active.'
      }
    ],
    quickActions: [
      "What is the overall Antarctic status?",
      "Why is Maitri generator bearing in critical state?",
      "When will Bharati water reserves deplete?",
      "Explain the cascading failure risk tree."
    ]
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  selectedStationId: 'bharati',
  activeTab: 'dashboard',
  stationDetailModalId: null,
  detailModalStationId: null,
  isChatDrawerOpen: false,

  isDarkMode: true,
  isConnected: true,
  connectionLatencyMs: 42,
  lastUpdated: new Date().toISOString(),
  isRunningInference: false,

  gisLayers: defaultGISLayers,
  mapZoomLevel: 3,
  focusedCoordinates: { lat: -69.4072, lng: 76.1872 },

  simulation: defaultSimulation,

  currentTelemetry: getStationTelemetry('bharati', defaultSimulation),
  allStationsTelemetry: {
    bharati: getStationTelemetry('bharati', defaultSimulation),
    maitri: getStationTelemetry('maitri', defaultSimulation)
  },
  alerts: getStationAlerts('bharati', defaultSimulation),
  unreadAlertsCount: 2,

  chatMessages: initialChatMessages,
  isAssistantThinking: false,

  setSelectedStationId: (id: StationId) => {
    const sim = get().simulation;
    const telem = getStationTelemetry(id, sim);
    const alerts = getStationAlerts(id, sim);
    set({
      selectedStationId: id,
      currentTelemetry: telem,
      alerts,
      lastUpdated: new Date().toISOString()
    });
  },

  setActiveTab: (tab: MainNavTab) => set({ activeTab: tab }),
  
  openStationDetailModal: (id: StationId | null) => set({ stationDetailModalId: id, detailModalStationId: id }),
  closeStationDetailModal: () => set({ stationDetailModalId: null, detailModalStationId: null }),

  toggleChatDrawer: (open) => set(state => ({ isChatDrawerOpen: open !== undefined ? open : !state.isChatDrawerOpen })),

  toggleDarkMode: () => {
    set(state => {
      const next = !state.isDarkMode;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { isDarkMode: next };
    });
  },

  toggleGISLayer: (layerKey) => set(state => ({
    gisLayers: {
      ...state.gisLayers,
      [layerKey]: !state.gisLayers[layerKey]
    }
  })),

  setGISLayers: (layers) => set(state => ({
    gisLayers: {
      ...state.gisLayers,
      ...layers
    }
  })),

  focusMapOn: (lat, lng) => set({ focusedCoordinates: { lat, lng } }),

  toggleFailureMode: (enable) => {
    set(state => {
      const nextMode = enable !== undefined ? (enable ? 'FAILURE_MODE' : 'NORMAL') : (state.simulation.mode === 'NORMAL' ? 'FAILURE_MODE' : 'NORMAL');
      const nextScenario = nextMode === 'FAILURE_MODE' ? (state.simulation.failureScenario === 'none' ? 'generator_failure' : state.simulation.failureScenario) : 'none';
      const sim: SimulationConfig = {
        ...state.simulation,
        mode: nextMode,
        failureScenario: nextScenario,
        activeSince: new Date().toISOString()
      };
      const telem = getStationTelemetry(state.selectedStationId, sim);
      const alerts = getStationAlerts(state.selectedStationId, sim);
      return {
        simulation: sim,
        currentTelemetry: telem,
        alerts,
        unreadAlertsCount: alerts.filter(a => !a.dismissed && !a.acknowledged).length,
        lastUpdated: new Date().toISOString()
      };
    });
  },

  setSimulationMode: (mode) => {
    set(state => {
      const sim: SimulationConfig = {
        ...state.simulation,
        mode,
        failureScenario: mode === 'NORMAL' ? 'none' : (state.simulation.failureScenario === 'none' ? 'generator_failure' : state.simulation.failureScenario)
      };
      const telem = getStationTelemetry(state.selectedStationId, sim);
      const alerts = getStationAlerts(state.selectedStationId, sim);
      return {
        simulation: sim,
        currentTelemetry: telem,
        alerts,
        unreadAlertsCount: alerts.filter(a => !a.dismissed && !a.acknowledged).length,
        lastUpdated: new Date().toISOString()
      };
    });
  },

  setFailureScenario: (scenario) => {
    set(state => {
      const sim: SimulationConfig = {
        ...state.simulation,
        mode: scenario === 'none' ? 'NORMAL' : 'FAILURE_MODE',
        failureScenario: scenario
      };
      const telem = getStationTelemetry(state.selectedStationId, sim);
      const alerts = getStationAlerts(state.selectedStationId, sim);
      return {
        simulation: sim,
        currentTelemetry: telem,
        alerts,
        unreadAlertsCount: alerts.filter(a => !a.dismissed && !a.acknowledged).length,
        lastUpdated: new Date().toISOString()
      };
    });
  },

  setSimulationSpeed: (speed) => set(state => ({
    simulation: { ...state.simulation, speed }
  })),

  toggleSimulationPause: () => set(state => ({
    simulation: { ...state.simulation, isPaused: !state.simulation.isPaused }
  })),

  togglePauseSimulation: () => set(state => ({
    simulation: { ...state.simulation, isPaused: !state.simulation.isPaused }
  })),

  resetSimulation: () => {
    set(state => {
      const sim = { ...defaultSimulation };
      const telem = getStationTelemetry(state.selectedStationId, sim);
      const alerts = getStationAlerts(state.selectedStationId, sim);
      return {
        simulation: sim,
        currentTelemetry: telem,
        alerts,
        lastUpdated: new Date().toISOString()
      };
    });
  },

  injectManualTelemetry: (overrides) => set(state => {
    const telem = { ...state.currentTelemetry, ...overrides };
    return { currentTelemetry: telem, lastUpdated: new Date().toISOString() };
  }),

  triggerMLInference: async () => {
    const state = get();
    set({ isRunningInference: true });
    try {
      await fetch(`/api/inference/${state.selectedStationId}`, { method: 'POST' });
      state.tickTelemetry();
    } catch {
      // ignore
    } finally {
      set({ isRunningInference: false });
    }
  },

  dismissAlert: (id) => set(state => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, dismissed: true } : a),
    unreadAlertsCount: Math.max(0, state.unreadAlertsCount - 1)
  })),

  acknowledgeAlert: (id) => set(state => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a),
    unreadAlertsCount: Math.max(0, state.unreadAlertsCount - 1)
  })),

  clearAllAlerts: () => set(state => ({
    alerts: state.alerts.map(a => ({ ...a, dismissed: true })),
    unreadAlertsCount: 0
  })),

  addChatMessage: (msg) => set(state => ({
    chatMessages: [
      ...state.chatMessages,
      {
        ...msg,
        id: (msg as ChatMessage).id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: (msg as ChatMessage).timestamp || new Date().toISOString()
      }
    ]
  })),

  updateChatMessage: (id: string, updates: Partial<ChatMessage>) => set(state => ({
    chatMessages: state.chatMessages.map(m => m.id === id ? { ...m, ...updates } : m)
  })),

  setAssistantThinking: (thinking) => set({ isAssistantThinking: thinking }),

  updateLastMessageStream: (chunk) => set(state => {
    const msgs = [...state.chatMessages];
    if (msgs.length === 0) return state;
    const last = msgs[msgs.length - 1];
    if (last.sender === 'assistant' || last.sender === 'BOT') {
      msgs[msgs.length - 1] = {
        ...last,
        text: last.text + chunk,
        isStreaming: false
      };
    }
    return { chatMessages: msgs };
  }),

  tickTelemetry: () => {
    const state = get();
    if (state.simulation.isPaused) return;

    const telem = getStationTelemetry(state.selectedStationId, state.simulation);
    const alerts = getStationAlerts(state.selectedStationId, state.simulation);

    set({
      currentTelemetry: telem,
      alerts,
      lastUpdated: new Date().toISOString(),
      connectionLatencyMs: 38 + Math.round(Math.random() * 12)
    });
  }
}));
