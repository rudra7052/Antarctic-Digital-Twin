export type StationId = 'bharati' | 'maitri';

export type StatusLevel = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'INFO';

export interface StationLocation {
  lat: number;
  lng: number;
  elevationM: number;
  region: string;
}

export interface StationSpecs {
  id: StationId;
  name: string;
  country: string;
  established: number;
  coordinates: StationLocation;
  crewCapacity: number;
  currentCrew: number;
  stationType: 'Year-round' | 'Summer-only' | 'Automated';
  primaryResearch: string[];
  climateZone: string;
  emergencySOP: string[];
  description: string;
  facilities: string[];
  powerSystem: string;
  waterSystem: string;
  commsSystem: string;
}

export interface TelemetryReading {
  timestamp: string;
  // Resources
  waterLevelL: number;
  waterMaxL: number;
  waterConsumptionRateLPerDay: number;
  waterDaysRemaining: number;
  
  foodLevelKg: number;
  foodMaxKg: number;
  foodConsumptionRateKgPerDay: number;
  foodDaysRemaining: number;
  
  fuelLevelL: number;
  fuelMaxL: number;
  fuelConsumptionRateLPerDay: number;
  fuelDaysRemaining: number;
  
  // Power & Battery
  batterySocPercent: number;
  batteryDischargeRateKw: number;
  batteryCycleCount: number;
  batteryHealthPercent: number;
  
  powerGenerationKw: number;
  powerConsumptionKw: number;
  solarGenerationKw: number;
  windGenerationKw: number;
  dieselGenerationKw: number;
  
  // Equipment - Generator
  generatorTempC: number;
  generatorVibrationMmS: number;
  generatorEfficiencyPercent: number;
  generatorLastMaintenance: string;
  generatorNextEstimatedFailureDays: number;
  
  // Equipment - HVAC
  hvacSetpointC: number;
  hvacActualTempC: number;
  hvacHumidityPercent: number;
  hvacAirExchangeRateCfm: number;
  
  // Equipment - SatCom
  satcomUptimePercent: number;
  satcomLastSignalTimestamp: string;
  satcomBandwidthMbps: number;
  satcomLatencyMs: number;
  
  // Environmental
  ambientTempC: number;
  windSpeedKts: number;
  windChillC: number;
  atmosphericPressureHpa: number;
  solarFluxWm2: number;
  blizzardRiskIndex: number;
  
  // High-level ML scoring
  overallAnomalyScore: number;
  systemHealthIndex: number;
}

export interface ForecastPoint {
  date: string;
  dayOffset: number;
  waterPredictedL: number;
  waterLowerL: number;
  waterUpperL: number;
  
  foodPredictedKg: number;
  foodLowerKg: number;
  foodUpperKg: number;
  
  fuelPredictedL: number;
  fuelLowerL: number;
  fuelUpperL: number;
  
  batteryPredictedSoc: number;
  isResupplyMilestone?: boolean;
  resupplyDetails?: string;
}

export interface ResourceForecastData {
  stationId: StationId;
  generatedAt: string;
  days: number;
  criticalThresholdPercent: number;
  forecastPoints: ForecastPoint[];
  depletionDates: {
    water: string | null;
    food: string | null;
    fuel: string | null;
    battery: string | null;
  };
  accuracyPercentage: number;
}

export interface AnomalyRecord {
  id: string;
  stationId: StationId;
  timestamp: string;
  sensor: string;
  sensorCategory: 'POWER' | 'THERMAL' | 'MECHANICAL' | 'SATCOM' | 'LIFE_SUPPORT';
  severity: StatusLevel;
  anomalyScore: number;
  mlConfidence: number;
  value: number;
  expectedValue: number;
  unit: string;
  description: string;
  rootCause: string;
  resolved: boolean;
}

export interface AlertNotification {
  id: string;
  stationId: StationId;
  timestamp: string;
  severity: StatusLevel;
  category: 'RESOURCES' | 'EQUIPMENT' | 'WEATHER' | 'POWER' | 'SECURITY';
  subsystem?: string;
  title: string;
  message: string;
  rootCause: string;
  recommendedAction: string;
  dismissed: boolean;
  acknowledged: boolean;
}

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  trend: 'UP' | 'STABLE' | 'DOWN';
  category: string;
}

export interface FailureNode {
  id: string;
  label: string;
  type: 'TRIGGER' | 'INTERMEDIATE' | 'CATASTROPHIC';
  status: 'NOMINAL' | 'ELEVATED' | 'CRITICAL';
  probability: number;
  impactScore: number;
  description: string;
  children?: FailureNode[];
}

export interface RiskMatrixItem {
  id: string;
  name: string;
  likelihood: number; // 1-5
  consequence: number; // 1-5
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  impactL: string;
}

export interface AssistantSourceRef {
  title: string;
  docType: 'TELEMETRY' | 'SOP_MANUAL' | 'ML_FORECAST' | 'EQUIPMENT_LOG';
  snippet: string;
  timestamp?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system' | 'USER' | 'BOT';
  text: string;
  timestamp: string;
  sources?: AssistantSourceRef[];
  quickActions?: string[];
  isStreaming?: boolean;
  isThinking?: boolean;
  suggestedPrompts?: string[];
}

export type FailureScenarioType =
  | 'none'
  | 'generator_failure'
  | 'generator_bearing_failure'
  | 'water_pipe_freeze'
  | 'water_leak_pipe_freeze'
  | 'power_shortage'
  | 'severe_blizzard_cutoff'
  | 'satcom_blackout'
  | 'satcom_radome_failure'
  | 'multi_system_cascade';

export interface SimulationConfig {
  mode: 'NORMAL' | 'FAILURE_MODE';
  failureScenario: FailureScenarioType;
  speed: 1 | 2 | 4 | 5 | 10;
  isPaused: boolean;
  activeSince: string;
  manualOverrides: Partial<TelemetryReading>;
}

export interface GISLayerState {
  stations: boolean;
  telemetryLabels: boolean;
  temperatureHeatmap: boolean;
  riskZones: boolean;
  serviceAreas: boolean;
  anomalyDensity: boolean;
  weatherWindVectors: boolean;
  satcomCoverageBeams: boolean;
  elevationContours: boolean;
  interStationCorridor: boolean;
}
