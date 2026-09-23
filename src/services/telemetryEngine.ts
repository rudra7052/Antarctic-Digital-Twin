import {
  StationId,
  TelemetryReading,
  StatusLevel,
  ForecastPoint,
  ResourceForecastData,
  AnomalyRecord,
  AlertNotification,
  RiskFactor,
  FailureNode,
  RiskMatrixItem,
  SimulationConfig
} from '../types';
import { ANTARCTIC_STATIONS } from '../data/mockStations';

interface StationLiveState {
  waterLevelL: number;
  foodLevelKg: number;
  fuelLevelL: number;
  batterySoc: number;
  batteryHealth: number;
  generatorTemp: number;
  generatorVibration: number;
  generatorEfficiency: number;
  hvacActualTemp: number;
  hvacHumidity: number;
  satcomUptime: number;
  satcomLatency: number;
  ambientTemp: number;
  windSpeed: number;
  cycleCount: number;
}

const initialStates: Record<StationId, StationLiveState> = {
  bharati: {
    waterLevelL: 18450,
    foodLevelKg: 12600,
    fuelLevelL: 42100,
    batterySoc: 91.4,
    batteryHealth: 96.2,
    generatorTemp: 74.2,
    generatorVibration: 2.3,
    generatorEfficiency: 93.8,
    hvacActualTemp: 20.4,
    hvacHumidity: 38.5,
    satcomUptime: 99.8,
    satcomLatency: 540,
    ambientTemp: -24.8,
    windSpeed: 28.5,
    cycleCount: 1420
  },
  maitri: {
    waterLevelL: 14200,
    foodLevelKg: 9800,
    fuelLevelL: 38500,
    batterySoc: 78.6,
    batteryHealth: 88.5,
    generatorTemp: 86.4,
    generatorVibration: 4.8,
    generatorEfficiency: 86.2,
    hvacActualTemp: 19.1,
    hvacHumidity: 42.1,
    satcomUptime: 98.2,
    satcomLatency: 610,
    ambientTemp: -29.2,
    windSpeed: 36.4,
    cycleCount: 2310
  }
};

const currentStates: Record<StationId, StationLiveState> = {
  bharati: { ...initialStates.bharati },
  maitri: { ...initialStates.maitri }
};

export function getStationTelemetry(stationId: StationId, simulation: SimulationConfig): TelemetryReading {
  const station = ANTARCTIC_STATIONS[stationId] || ANTARCTIC_STATIONS.bharati;
  let state = currentStates[stationId] || currentStates.bharati;
  const isFailure = simulation.mode === 'FAILURE_MODE';
  const scenario = isFailure ? simulation.failureScenario : 'none';

  // Base consumption & generation parameters
  const crew = station.currentCrew;
  const waterRateBase = crew * 5.2; // ~125 L/day for ~24 crew
  const foodRateBase = crew * 3.1;  // ~74 kg/day
  const fuelRateBase = 160 + crew * 2.5; // ~220 L/day
  
  // Natural fluctuations
  const jitter = (Math.random() - 0.5) * 0.4;
  const tempOscillation = Math.sin(Date.now() / 60000) * 1.5;

  let waterConsumptionRate = waterRateBase + jitter * 5;
  let foodConsumptionRate = foodRateBase + jitter * 2;
  let fuelConsumptionRate = fuelRateBase + jitter * 8;
  
  let powerGen = stationId === 'bharati' ? (155 + Math.random() * 8) : (135 + Math.random() * 7);
  let powerCons = stationId === 'bharati' ? (122 + Math.random() * 6) : (114 + Math.random() * 5);
  let genTemp = state.generatorTemp + (Math.random() - 0.5) * 0.8;
  let genVib = state.generatorVibration + (Math.random() - 0.5) * 0.15;
  let genEff = state.generatorEfficiency;
  let batterySoc = state.batterySoc;
  let hvacTemp = state.hvacActualTemp + (Math.random() - 0.5) * 0.2;
  let satcomUptime = state.satcomUptime;
  let ambientTemp = state.ambientTemp + tempOscillation;
  let windSpeed = state.windSpeed + (Math.random() - 0.5) * 2;
  let anomalyScore = stationId === 'maitri' ? 0.38 : 0.08;

  // Scenario modifications
  if (scenario === 'generator_failure' || scenario === 'generator_bearing_failure') {
    genTemp = 108.5 + Math.random() * 4.2;
    genVib = 8.7 + Math.random() * 1.8;
    genEff = 61.4;
    powerGen = 58.0;
    powerCons = 112.0;
    batterySoc = Math.max(12, batterySoc - 0.8 * simulation.speed);
    anomalyScore = 0.89;
  } else if (scenario === 'water_pipe_freeze' || scenario === 'water_leak_pipe_freeze') {
    waterConsumptionRate = 18.0; // blocked intake
    ambientTemp = -46.2;
    windSpeed = 62.0;
    anomalyScore = 0.74;
  } else if (scenario === 'power_shortage') {
    powerGen = 72.0;
    powerCons = 95.0;
    batterySoc = Math.max(18, batterySoc - 0.5 * simulation.speed);
    anomalyScore = 0.68;
  } else if (scenario === 'severe_blizzard_cutoff') {
    ambientTemp = -54.0;
    windSpeed = 78.5;
    satcomUptime = 74.2;
    anomalyScore = 0.82;
  } else if (scenario === 'satcom_blackout' || scenario === 'satcom_radome_failure') {
    satcomUptime = 38.5;
    anomalyScore = 0.65;
  } else if (scenario === 'multi_system_cascade') {
    genTemp = 114.2;
    genVib = 9.4;
    genEff = 54.0;
    powerGen = 45.0;
    powerCons = 120.0;
    batterySoc = Math.max(8.5, batterySoc - 1.2 * simulation.speed);
    hvacTemp = 11.2;
    ambientTemp = -52.0;
    windSpeed = 74.0;
    satcomUptime = 68.0;
    anomalyScore = 0.96;
  } else {
    // Normal gradual consumption
    if (!simulation.isPaused) {
      state.waterLevelL = Math.max(500, state.waterLevelL - (waterConsumptionRate / 86400) * 5 * simulation.speed);
      state.foodLevelKg = Math.max(200, state.foodLevelKg - (foodConsumptionRate / 86400) * 5 * simulation.speed);
      state.fuelLevelL = Math.max(1000, state.fuelLevelL - (fuelConsumptionRate / 86400) * 5 * simulation.speed);
    }
  }

  // Max capacities
  const waterMaxL = stationId === 'bharati' ? 25000 : 20000;
  const foodMaxKg = stationId === 'bharati' ? 18000 : 15000;
  const fuelMaxL = stationId === 'bharati' ? 60000 : 50000;

  const waterDays = Number((state.waterLevelL / Math.max(1, waterConsumptionRate)).toFixed(1));
  const foodDays = Number((state.foodLevelKg / Math.max(1, foodConsumptionRate)).toFixed(1));
  const fuelDays = Number((state.fuelLevelL / Math.max(1, fuelConsumptionRate)).toFixed(1));

  // Renewable breakdowns
  const solarGen = stationId === 'bharati' ? 28.5 : 12.0;
  const windGen = stationId === 'bharati' ? 18.0 : 24.5;
  const dieselGen = Math.max(0, powerGen - solarGen - windGen);

  const reading: TelemetryReading = {
    timestamp: new Date().toISOString(),
    waterLevelL: Math.round(state.waterLevelL),
    waterMaxL,
    waterConsumptionRateLPerDay: Number(waterConsumptionRate.toFixed(1)),
    waterDaysRemaining: waterDays,

    foodLevelKg: Math.round(state.foodLevelKg),
    foodMaxKg,
    foodConsumptionRateKgPerDay: Number(foodConsumptionRate.toFixed(1)),
    foodDaysRemaining: foodDays,

    fuelLevelL: Math.round(state.fuelLevelL),
    fuelMaxL,
    fuelConsumptionRateLPerDay: Number(fuelConsumptionRate.toFixed(1)),
    fuelDaysRemaining: fuelDays,

    batterySocPercent: Number(batterySoc.toFixed(1)),
    batteryDischargeRateKw: Number((powerCons > powerGen ? powerCons - powerGen : 0).toFixed(1)),
    batteryCycleCount: state.cycleCount,
    batteryHealthPercent: Number(state.batteryHealth.toFixed(1)),

    powerGenerationKw: Number(powerGen.toFixed(1)),
    powerConsumptionKw: Number(powerCons.toFixed(1)),
    solarGenerationKw: Number(solarGen.toFixed(1)),
    windGenerationKw: Number(windGen.toFixed(1)),
    dieselGenerationKw: Number(dieselGen.toFixed(1)),

    generatorTempC: Number(genTemp.toFixed(1)),
    generatorVibrationMmS: Number(genVib.toFixed(2)),
    generatorEfficiencyPercent: Number(genEff.toFixed(1)),
    generatorLastMaintenance: stationId === 'bharati' ? '2026-06-15' : '2026-05-10',
    generatorNextEstimatedFailureDays: scenario === 'generator_failure' ? 3 : (stationId === 'maitri' ? 24 : 118),

    hvacSetpointC: 21.0,
    hvacActualTempC: Number(hvacTemp.toFixed(1)),
    hvacHumidityPercent: Number(state.hvacHumidity.toFixed(1)),
    hvacAirExchangeRateCfm: stationId === 'bharati' ? 920 : 780,

    satcomUptimePercent: Number(satcomUptime.toFixed(1)),
    satcomLastSignalTimestamp: new Date(Date.now() - 8000).toISOString(),
    satcomBandwidthMbps: stationId === 'bharati' ? 45.8 : 25.0,
    satcomLatencyMs: state.satcomLatency + Math.round((Math.random() - 0.5) * 20),

    ambientTempC: Number(ambientTemp.toFixed(1)),
    windSpeedKts: Number(windSpeed.toFixed(1)),
    windChillC: Number((ambientTemp - (windSpeed * 0.45)).toFixed(1)),
    atmosphericPressureHpa: 984.2 + (Math.random() - 0.5) * 2,
    solarFluxWm2: Math.max(0, 340 + Math.sin(Date.now() / 40000) * 120),
    blizzardRiskIndex: isFailure ? 82 : (stationId === 'maitri' ? 34 : 18),

    overallAnomalyScore: Number(anomalyScore.toFixed(2)),
    systemHealthIndex: isFailure ? 42 : (stationId === 'maitri' ? 82 : 96)
  };

  return reading;
}

export function getStationForecast(stationId: StationId, days: number = 90, simulation?: SimulationConfig): ResourceForecastData {
  const current = getStationTelemetry(stationId, simulation || { mode: 'NORMAL', failureScenario: 'none', speed: 1, isPaused: false, activeSince: '', manualOverrides: {} });
  const points: ForecastPoint[] = [];
  const now = new Date();

  let curWater = current.waterLevelL;
  let curFood = current.foodLevelKg;
  let curFuel = current.fuelLevelL;
  let curBattery = current.batterySocPercent;

  const waterBurn = current.waterConsumptionRateLPerDay;
  const foodBurn = current.foodConsumptionRateKgPerDay;
  const fuelBurn = current.fuelConsumptionRateLPerDay;

  // Next planned resupply is day 60 (Indian Antarctic Expedition Vessel R/V Maitri Express / SA Agulhas II)
  const resupplyDay = 60;
  let depletionWater: string | null = null;
  let depletionFood: string | null = null;
  let depletionFuel: string | null = null;
  let depletionBattery: string | null = null;

  for (let d = 0; d <= days; d += 2) {
    const targetDate = new Date(now.getTime() + d * 86400000);
    const dateStr = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const uncertaintyFactor = 1 + (d / days) * 0.18;
    const waterVariance = d * 18 * uncertaintyFactor;
    const foodVariance = d * 10 * uncertaintyFactor;
    const fuelVariance = d * 40 * uncertaintyFactor;

    const isResupply = d === resupplyDay;
    let resupplyInfo: string | undefined = undefined;

    if (isResupply) {
      curWater = Math.min(current.waterMaxL, curWater + 12000);
      curFood = Math.min(current.foodMaxKg, curFood + 8000);
      curFuel = Math.min(current.fuelMaxL, curFuel + 25000);
      resupplyInfo = '44th Indian Antarctic Expedition (IAE) Charter Vessel Delivery';
    } else {
      curWater = Math.max(0, curWater - waterBurn * 2);
      curFood = Math.max(0, curFood - foodBurn * 2);
      curFuel = Math.max(0, curFuel - fuelBurn * 2);
    }

    if (curWater <= 0 && !depletionWater) depletionWater = dateStr;
    if (curFood <= 0 && !depletionFood) depletionFood = dateStr;
    if (curFuel <= 0 && !depletionFuel) depletionFuel = dateStr;

    points.push({
      date: dateStr,
      dayOffset: d,
      waterPredictedL: Math.round(curWater),
      waterLowerL: Math.max(0, Math.round(curWater - waterVariance)),
      waterUpperL: Math.min(current.waterMaxL, Math.round(curWater + waterVariance)),

      foodPredictedKg: Math.round(curFood),
      foodLowerKg: Math.max(0, Math.round(curFood - foodVariance)),
      foodUpperKg: Math.min(current.foodMaxKg, Math.round(curFood + foodVariance)),

      fuelPredictedL: Math.round(curFuel),
      fuelLowerL: Math.max(0, Math.round(curFuel - fuelVariance)),
      fuelUpperL: Math.min(current.fuelMaxL, Math.round(curFuel + fuelVariance)),

      batteryPredictedSoc: Math.round(Math.max(15, curBattery - (d * 0.12))),
      isResupplyMilestone: isResupply,
      resupplyDetails: resupplyInfo
    });
  }

  return {
    stationId,
    generatedAt: now.toISOString(),
    days,
    criticalThresholdPercent: 20,
    forecastPoints: points,
    depletionDates: {
      water: depletionWater,
      food: depletionFood,
      fuel: depletionFuel,
      battery: depletionBattery
    },
    accuracyPercentage: 95.4
  };
}

export function getStationAnomalies(stationId: StationId, simulation?: SimulationConfig): AnomalyRecord[] {
  const isFailure = simulation?.mode === 'FAILURE_MODE';
  const scenario = simulation?.failureScenario || 'none';

  const baseAnomalies: AnomalyRecord[] = [
    {
      id: 'ano-01',
      stationId: 'bharati',
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      sensor: 'CHP Glycol Heat Exchanger #2',
      sensorCategory: 'THERMAL',
      severity: 'WARNING',
      anomalyScore: 0.72,
      mlConfidence: 91.4,
      value: 84.6,
      expectedValue: 72.0,
      unit: '°C',
      description: 'Thermal glycol temperature divergence from baseline curve during high katabatic load.',
      rootCause: 'Partial ice crusting along exterior heat dispersion radiator manifold.',
      resolved: false
    },
    {
      id: 'ano-02',
      stationId: 'maitri',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      sensor: 'Diesel Generator #1 Crankshaft',
      sensorCategory: 'MECHANICAL',
      severity: 'CRITICAL',
      anomalyScore: 0.88,
      mlConfidence: 96.2,
      value: 4.8,
      expectedValue: 2.2,
      unit: 'mm/s',
      description: 'Harmonic vibration spectral spike in 120Hz fundamental bearing band.',
      rootCause: 'Imminent roller bearing raceway spalling. Mean time to catastrophic failure ~48h.',
      resolved: false
    },
    {
      id: 'ano-03',
      stationId: 'bharati',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      sensor: 'RO Desalination Sea-Ice Intake Valve',
      sensorCategory: 'LIFE_SUPPORT',
      severity: 'NORMAL',
      anomalyScore: 0.35,
      mlConfidence: 84.0,
      value: 12.8,
      expectedValue: 14.5,
      unit: 'bar',
      description: 'Transient pressure drop resolved after ultrasonic backwash purge.',
      rootCause: 'Frazil ice agglomeration during tidal surge.',
      resolved: true
    },
    {
      id: 'ano-04',
      stationId: 'maitri',
      timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
      sensor: 'Lake Priyadarshini Suction Trace Heater #1',
      sensorCategory: 'POWER',
      severity: 'WARNING',
      anomalyScore: 0.65,
      mlConfidence: 88.5,
      value: 11.2,
      expectedValue: 16.0,
      unit: 'A',
      description: 'Trace-heating current draw 30% below setpoint across 250m lake conduit.',
      rootCause: 'Sub-zero resistance drift along junction box B-4 near oasis shore.',
      resolved: false
    }
  ];

  if (isFailure && (scenario === 'generator_failure' || scenario === 'generator_bearing_failure')) {
    baseAnomalies.unshift({
      id: 'ano-fail-gen',
      stationId,
      timestamp: new Date().toISOString(),
      sensor: 'Primary Genset Main Stator Bearing',
      sensorCategory: 'MECHANICAL',
      severity: 'CRITICAL',
      anomalyScore: 0.98,
      mlConfidence: 99.1,
      value: 114.2,
      expectedValue: 74.0,
      unit: '°C',
      description: 'Severe thermal runaway with 9.4 mm/s vibration surge.',
      rootCause: 'Lubrication channel viscosity stall triggered by sub-zero seal failure.',
      resolved: false
    });
  }

  return baseAnomalies.filter(a => a.stationId === stationId);
}

export function getStationAlerts(stationId: StationId, simulation?: SimulationConfig): AlertNotification[] {
  const isFailure = simulation?.mode === 'FAILURE_MODE';
  const scenario = simulation?.failureScenario || 'none';

  const alerts: AlertNotification[] = [
    {
      id: 'alt-01',
      stationId: 'maitri',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      severity: 'CRITICAL',
      category: 'EQUIPMENT',
      title: 'DG-1 Bearing Harmonic Vibration Critical',
      message: 'Vibration amplitude reached 4.8 mm/s (threshold: 4.5 mm/s). Immediate switch to DG-2 required.',
      rootCause: 'Spectral analysis detected severe ball-pass outer raceway frequency (BPFO) defect.',
      recommendedAction: 'Execute SOP-MAI-09: Switch load to Generator Bank 2 within 45 minutes.',
      dismissed: false,
      acknowledged: false
    },
    {
      id: 'alt-02',
      stationId: 'bharati',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      severity: 'WARNING',
      category: 'RESOURCES',
      title: 'RO Desalination Intake Flow Minor Reduction',
      message: 'Intake flow dropped 8% below nominal. Heating trace loop active.',
      rootCause: 'Peripheral frazil ice buildup around intake suction screen.',
      recommendedAction: 'Verify ultrasonic transducer pulse frequency and trace current.',
      dismissed: false,
      acknowledged: true
    },
    {
      id: 'alt-03',
      stationId: 'maitri',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      severity: 'WARNING',
      category: 'WEATHER',
      title: 'Schirmacher Oasis Katabatic Depression Alert',
      message: 'Ambient temp dropped to -29.2°C with 36.4 kts winds.',
      rootCause: 'Polar vortex trough deepening over Queen Maud Land.',
      recommendedAction: 'Inspect Priyadarshini intake conduits and secure external weather shelter.',
      dismissed: false,
      acknowledged: true
    },
    {
      id: 'alt-04',
      stationId: 'bharati',
      timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
      severity: 'INFO',
      category: 'EQUIPMENT',
      title: 'ISRO SGS Radome Track Locked',
      message: '7.5m S/X-Band polar radome locked to Cartosat-3 pass (Elevation 64°).',
      rootCause: 'Scheduled orbital telemetry pass for National Remote Sensing Centre.',
      recommendedAction: 'Routine pass monitoring; auto-archive telemetry.',
      dismissed: false,
      acknowledged: true
    }
  ];

  if (isFailure) {
    alerts.unshift({
      id: 'alt-emergency',
      stationId,
      timestamp: new Date().toISOString(),
      severity: 'CRITICAL',
      category: 'EQUIPMENT',
      title: `CRITICAL INJECTION: ${scenario.toUpperCase().replace(/_/g, ' ')}`,
      message: 'Automated digital twin telemetry injector active. Primary systems operating in degraded emergency state.',
      rootCause: 'Manual stress simulation testing cascading failure safeguards.',
      recommendedAction: 'Engage auxiliary microgrid load-shedding and verify battery discharge floor.',
      dismissed: false,
      acknowledged: false
    });
  }

  return alerts.filter(a => a.stationId === stationId);
}

export function getRiskAssessmentData(stationId: StationId, simulation?: SimulationConfig) {
  const isFailure = simulation?.mode === 'FAILURE_MODE';

  const overallScore = isFailure ? 87 : (stationId === 'maitri' ? 48 : 18);
  const status: StatusLevel = overallScore >= 65 ? 'CRITICAL' : overallScore >= 35 ? 'WARNING' : 'NORMAL';

  const riskFactors: RiskFactor[] = [
    { name: 'Power System & DG Redundancy', score: isFailure ? 92 : (stationId === 'maitri' ? 64 : 14), weight: 0.35, trend: isFailure ? 'UP' : 'STABLE', category: 'Power' },
    { name: 'Freshwater Intake Freeze Vulnerability', score: stationId === 'maitri' ? 38 : 22, weight: 0.25, trend: 'DOWN', category: 'Life Support' },
    { name: 'Thermal HVAC Envelope Integrity', score: isFailure ? 75 : 16, weight: 0.20, trend: isFailure ? 'UP' : 'STABLE', category: 'Thermal' },
    { name: 'SatCom Downlink & SGS Radome Link', score: isFailure ? 64 : 10, weight: 0.10, trend: 'STABLE', category: 'Comms' },
    { name: 'Katabatic Blizzard & Wind Risk', score: isFailure ? 85 : (stationId === 'maitri' ? 36 : 24), weight: 0.10, trend: 'UP', category: 'Weather' }
  ];

  const riskMatrix: RiskMatrixItem[] = [
    { id: 'rm-1', name: 'DG-1 Bearing Harmonic Spalling', likelihood: stationId === 'maitri' ? 4 : 1, consequence: 5, urgency: stationId === 'maitri' ? 'CRITICAL' : 'LOW', category: 'Generator', impactL: 'Total 415V bus outage risk' },
    { id: 'rm-2', name: 'Lake Priyadarshini Trace-Heat Failure', likelihood: stationId === 'maitri' ? 3 : 1, consequence: 4, urgency: stationId === 'maitri' ? 'HIGH' : 'LOW', category: 'Water', impactL: '147 days reserve only' },
    { id: 'rm-3', name: 'ISRO SGS Earth Station S-Band Feed Trip', likelihood: 2, consequence: 3, urgency: 'MEDIUM', category: 'SatCom', impactL: 'Telemetry buffering switch' },
    { id: 'rm-4', name: 'BESS Lithium Battery Bank Cell Imbalance', likelihood: isFailure ? 4 : 2, consequence: 4, urgency: isFailure ? 'CRITICAL' : 'MEDIUM', category: 'Battery', impactL: 'Microgrid autonomy reduced' },
    { id: 'rm-5', name: 'Larsemann Hills Katabatic Wind >120 km/h', likelihood: 3, consequence: 2, urgency: 'LOW', category: 'Weather', impactL: 'Exterior excursion lockdown' }
  ];

  const cascadingTree: FailureNode = {
    id: 'root',
    label: `${stationId === 'bharati' ? 'Bharati DG-1 Primary CHP Genset' : 'Maitri DG-1 Arctic Kirloskar Genset'} Trip`,
    type: 'TRIGGER',
    status: isFailure ? 'CRITICAL' : (stationId === 'maitri' ? 'ELEVATED' : 'NOMINAL'),
    probability: isFailure ? 0.94 : (stationId === 'maitri' ? 0.65 : 0.08),
    impactScore: 92,
    description: 'Harmonic vibration or thermal stall triggers protective breaker trip on main 415V SCADA bus.',
    children: [
      {
        id: 'c1',
        label: '45 kW Micro-Grid Power Deficit',
        type: 'INTERMEDIATE',
        status: isFailure ? 'CRITICAL' : 'NOMINAL',
        probability: 0.88,
        impactScore: 78,
        description: 'Auxiliary solar and wind cannot meet total station base load.',
        children: [
          {
            id: 'c1-1',
            label: 'Rapid BESS Battery Bank Deep Discharge',
            type: 'INTERMEDIATE',
            status: isFailure ? 'CRITICAL' : 'NOMINAL',
            probability: 0.91,
            impactScore: 84,
            description: 'Battery SoC drops 1.2% per minute under un-shed scientific loads.'
          },
          {
            id: 'c1-2',
            label: 'ISRO SGS Satellite Downlink Standby Shedding',
            type: 'INTERMEDIATE',
            status: isFailure ? 'ELEVATED' : 'NOMINAL',
            probability: 0.76,
            impactScore: 50,
            description: 'Ground station radome motors throttled to auxiliary backup.'
          }
        ]
      },
      {
        id: 'c2',
        label: 'Combined Heat & Power (CHP) Glycol Circulation Loss',
        type: 'INTERMEDIATE',
        status: isFailure ? 'CRITICAL' : 'NOMINAL',
        probability: 0.85,
        impactScore: 86,
        description: 'Engine jacket waste heat ceases circulating through living blocks.',
        children: [
          {
            id: 'c2-1',
            label: 'Living Quarters Ambient Temp Drops below +10°C',
            type: 'CATASTROPHIC',
            status: isFailure ? 'CRITICAL' : 'NOMINAL',
            probability: 0.82,
            impactScore: 95,
            description: 'Emergency space heating required to prevent hypothermia hazard.'
          },
          {
            id: 'c2-2',
            label: `${stationId === 'bharati' ? 'Desalination RO' : 'Lake Priyadarshini'} Intake Line Freeze`,
            type: 'CATASTROPHIC',
            status: isFailure ? 'CRITICAL' : 'NOMINAL',
            probability: 0.79,
            impactScore: 90,
            description: 'Exposed outdoor suction lines freeze within 3.5 hours at -30°C.'
          }
        ]
      }
    ]
  };

  return {
    overallScore,
    status,
    riskFactors,
    riskMatrix,
    cascadingTree,
    powerRisk: isFailure ? 92 : (stationId === 'maitri' ? 64 : 14),
    thermalRisk: isFailure ? 75 : 16,
    waterRisk: isFailure ? 62 : 22,
    commsRisk: isFailure ? 64 : 10
  };
}

export function generateTelemetryHistory(stationId: StationId, hours: number = 720) {
  const points = [];
  const now = Date.now();
  const stepMs = (hours * 3600 * 1000) / 60; // 60 data points

  const baseWater = stationId === 'bharati' ? 18450 : 14200;
  const baseFood = stationId === 'bharati' ? 12600 : 9800;
  const baseFuel = stationId === 'bharati' ? 42100 : 38500;

  for (let i = 60; i >= 0; i--) {
    const t = new Date(now - i * stepMs);
    const dayProgress = (60 - i) / 60;
    
    const isAnomalySpot = stationId === 'maitri' ? (i === 14 || i === 38) : (i === 48);
    const waterVal = baseWater - dayProgress * 2200 + (Math.random() - 0.5) * 80;
    const foodVal = baseFood - dayProgress * 1100 + (Math.random() - 0.5) * 50;
    const fuelVal = baseFuel - dayProgress * 3800 + (Math.random() - 0.5) * 120;
    const genTemp = (stationId === 'maitri' ? 82 : 74) + (isAnomalySpot ? 20 : Math.sin(i / 4) * 3 + Math.random() * 2);
    const genVib = (stationId === 'maitri' ? 3.8 : 2.2) + (isAnomalySpot ? 2.5 : Math.random() * 0.3);
    const ambientTemp = (stationId === 'maitri' ? -29 : -25) + Math.sin(i / 6) * 8 + (Math.random() - 0.5) * 2;
    const batterySoc = (stationId === 'maitri' ? 84 : 92) - (Math.sin(i / 3) * 5) + (Math.random() - 0.5) * 2;
    const powerKw = (stationId === 'bharati' ? 145 : 125) + Math.sin(i / 5) * 16 + Math.random() * 4;

    points.push({
      timestamp: t.toISOString(),
      label: t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' }),
      waterLevelL: Math.round(waterVal),
      foodLevelKg: Math.round(foodVal),
      fuelLevelL: Math.round(fuelVal),
      batterySocPercent: Number(batterySoc.toFixed(1)),
      generatorTempC: Number(genTemp.toFixed(1)),
      generatorVibrationMmS: Number(genVib.toFixed(2)),
      ambientTempC: Number(ambientTemp.toFixed(1)),
      powerGenerationKw: Number(powerKw.toFixed(1)),
      isAnomaly: isAnomalySpot
    });
  }

  return points;
}
