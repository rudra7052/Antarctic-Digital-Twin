import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { ANTARCTIC_STATIONS } from './src/data/mockStations.ts';
import {
  getStationTelemetry,
  getStationForecast,
  getStationAnomalies,
  getStationAlerts,
  getRiskAssessmentData,
  generateTelemetryHistory
} from './src/services/telemetryEngine.ts';
import { StationId, SimulationConfig } from './src/types/index.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory simulation state
let currentSimulation: SimulationConfig = {
  mode: 'NORMAL',
  failureScenario: 'none',
  speed: 1,
  isPaused: false,
  activeSince: new Date().toISOString(),
  manualOverrides: {}
};

// 1. Stations List (Bharati & Maitri)
app.get('/api/stations', (req, res) => {
  res.json({
    status: 'success',
    data: Object.values(ANTARCTIC_STATIONS)
  });
});

// 2. Station Detail
app.get('/api/stations/:id', (req, res) => {
  const stationId = (req.params.id || 'bharati') as StationId;
  const station = ANTARCTIC_STATIONS[stationId] || ANTARCTIC_STATIONS.bharati;
  
  const telemetry = getStationTelemetry(stationId, currentSimulation);
  const forecast = getStationForecast(stationId, 90, currentSimulation);
  const anomalies = getStationAnomalies(stationId, currentSimulation);
  const alerts = getStationAlerts(stationId, currentSimulation);
  const risk = getRiskAssessmentData(stationId, currentSimulation);

  res.json({
    status: 'success',
    data: {
      station,
      telemetry,
      forecast,
      anomalies,
      alerts,
      risk
    }
  });
});

// 3. Telemetry Stream
app.get('/api/telemetry', (req, res) => {
  const stationId = (req.query.station_id as StationId) || 'bharati';
  const hours = req.query.hours ? parseInt(req.query.hours as string, 10) : 0;

  if (hours > 0) {
    const history = generateTelemetryHistory(stationId, hours);
    return res.json({
      status: 'success',
      stationId,
      hours,
      data: history
    });
  }

  const live = getStationTelemetry(stationId, currentSimulation);
  res.json({
    status: 'success',
    stationId,
    timestamp: new Date().toISOString(),
    data: live
  });
});

// 4. Depletion Predictions & Forecasting
app.get('/api/predictions', (req, res) => {
  const stationId = (req.query.station_id as StationId) || 'bharati';
  const days = req.query.days ? parseInt(req.query.days as string, 10) : 90;
  const forecast = getStationForecast(stationId, days, currentSimulation);
  res.json({
    status: 'success',
    data: forecast
  });
});

// 5. Anomalies Feed
app.get('/api/anomalies', (req, res) => {
  const stationId = (req.query.station_id as StationId) || 'bharati';
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const anomalies = getStationAnomalies(stationId, currentSimulation).slice(0, limit);
  res.json({
    status: 'success',
    data: anomalies
  });
});

// 6. Alerts Feed
app.get('/api/alerts', (req, res) => {
  const stationId = (req.query.station_id as StationId) || 'bharati';
  const severity = req.query.severity as string;
  let alerts = getStationAlerts(stationId, currentSimulation);
  if (severity) {
    alerts = alerts.filter(a => a.severity === severity);
  }
  res.json({
    status: 'success',
    data: alerts
  });
});

// 7. ML Inference Trigger
app.post('/api/inference/:station_id', (req, res) => {
  const stationId = (req.params.station_id as StationId) || 'bharati';
  const risk = getRiskAssessmentData(stationId, currentSimulation);
  const anomalies = getStationAnomalies(stationId, currentSimulation);
  res.json({
    status: 'success',
    inferredAt: new Date().toISOString(),
    stationId,
    riskScore: risk.overallScore,
    anomaliesDetected: anomalies.length,
    inferenceTimeMs: 12.4,
    model: 'Antarctic-DigitalTwin-TransAnomaly-v4.5-Polar'
  });
});

// 8. Simulation State Update
app.post('/api/simulation/state', (req, res) => {
  currentSimulation = {
    ...currentSimulation,
    ...req.body
  };
  res.json({
    status: 'success',
    simulation: currentSimulation
  });
});

// 9. Multi-Turn AI Copilot Chatbot (Powered by Gemini 3.5 Flash + Telemetry RAG)
app.post('/api/assistant/chat', async (req, res) => {
  const { question, messages = [], stationId = 'bharati' } = req.body;

  const activeStationId = (stationId === 'maitri' ? 'maitri' : 'bharati') as StationId;
  const station = ANTARCTIC_STATIONS[activeStationId];

  // Fetch live telemetry snapshots for BOTH Indian stations
  const bharatiTelem = getStationTelemetry('bharati', currentSimulation);
  const maitriTelem = getStationTelemetry('maitri', currentSimulation);
  const currentTelem = activeStationId === 'bharati' ? bharatiTelem : maitriTelem;
  
  const forecast = getStationForecast(activeStationId, 90, currentSimulation);
  const anomalies = getStationAnomalies(activeStationId, currentSimulation);
  const alerts = getStationAlerts(activeStationId, currentSimulation);
  const risk = getRiskAssessmentData(activeStationId, currentSimulation);

  const queryText = question || (messages.length > 0 ? messages[messages.length - 1]?.text || messages[messages.length - 1]?.content : '');

  if (!queryText && (!messages || messages.length === 0)) {
    return res.status(400).json({ error: 'Question or conversation messages required' });
  }

  const systemInstruction = `You are the Power AI Copilot and Lead SCADA Automation Systems Officer for the National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences, Government of India.
You oversee the Indian Antarctic Program digital twin controlling both permanent research bases:
1. BHARATI STATION (Lat 69.4072° S, Lng 76.1872° E, Larsemann Hills) - India's 3rd modern research facility with 3x125kVA CHP gensets, ISRO Earth Observation Ground Station (SGS), and Dual Reverse Osmosis Desalination.
2. MAITRI STATION (Lat 70.7667° S, Lng 11.7333° E, Schirmacher Oasis) - India's 2nd permanent research station with 4x100kVA DG gensets, Priyadarshini freshwater lake suction trace line, and Seismology/Magnetometer observatories.

OPERATIONAL INSTRUCTIONS:
- Deliver precise, technically authoritative, and structured engineering responses.
- Always quote exact sensor readings (kW, °C, mm/s vibration, liters, SoC%) from the live telemetry snapshot.
- Directly reference Standard Operating Procedures (SOP-BHR-xx for Bharati, SOP-MAI-xx for Maitri) with specific action steps when diagnosing faults.
- Format with crisp Markdown headings, bullet points, and code/table highlights where appropriate.
- If an emergency or failure mode is active (e.g. DG vibration spike, lake trace freeze, katabatic storm), highlight immediate life-safety and load-shedding mitigations.

REAL-TIME SCADA TELEMETRY CONTEXT:
[Active Focus Station: ${station.name}]
- Simulation Mode: ${currentSimulation.mode} (Scenario: ${currentSimulation.failureScenario})
- Overall Health Risk Score: ${risk.overallScore}/100 [${risk.status}]
- Ambient Weather: Temp ${currentTelem.ambientTempC}°C | Wind ${currentTelem.windSpeedKts} kts | Wind Chill ${currentTelem.windChillC}°C | Blizzard Index ${currentTelem.blizzardRiskIndex}/100

[BHARATI STATION LIVE]:
- Freshwater Reserve: ${bharatiTelem.waterLevelL} L / ${bharatiTelem.waterMaxL} L (${bharatiTelem.waterDaysRemaining} days remaining at ${bharatiTelem.waterConsumptionRateLPerDay} L/d)
- Fuel (Arctic Diesel): ${bharatiTelem.fuelLevelL} L / ${bharatiTelem.fuelMaxL} L (${bharatiTelem.fuelDaysRemaining} days remaining)
- Food Rations: ${bharatiTelem.foodLevelKg} kg (${bharatiTelem.foodDaysRemaining} days remaining)
- Power Microgrid: Gen ${bharatiTelem.powerGenerationKw} kW (Solar ${bharatiTelem.solarGenerationKw}kW, Wind ${bharatiTelem.windGenerationKw}kW, Diesel ${bharatiTelem.dieselGenerationKw}kW) vs Load ${bharatiTelem.powerConsumptionKw} kW
- BESS Battery: ${bharatiTelem.batterySocPercent}% SoC | Health ${bharatiTelem.batteryHealthPercent}%
- DG-1 Genset: Temp ${bharatiTelem.generatorTempC}°C | Vibration ${bharatiTelem.generatorVibrationMmS} mm/s | Eff ${bharatiTelem.generatorEfficiencyPercent}%
- SatCom & ISRO SGS: Uptime ${bharatiTelem.satcomUptimePercent}% | Bandwidth ${bharatiTelem.satcomBandwidthMbps} Mbps | Latency ${bharatiTelem.satcomLatencyMs}ms

[MAITRI STATION LIVE]:
- Freshwater (Lake Priyadarshini): ${maitriTelem.waterLevelL} L / ${maitriTelem.waterMaxL} L (${maitriTelem.waterDaysRemaining} days remaining at ${maitriTelem.waterConsumptionRateLPerDay} L/d)
- Fuel (Arctic Grade): ${maitriTelem.fuelLevelL} L / ${maitriTelem.fuelMaxL} L (${maitriTelem.fuelDaysRemaining} days remaining)
- Food Rations: ${maitriTelem.foodLevelKg} kg (${maitriTelem.foodDaysRemaining} days remaining)
- Power Microgrid: Gen ${maitriTelem.powerGenerationKw} kW vs Load ${maitriTelem.powerConsumptionKw} kW
- BESS Battery: ${maitriTelem.batterySocPercent}% SoC | Health ${maitriTelem.batteryHealthPercent}%
- DG-1 Genset: Temp ${maitriTelem.generatorTempC}°C | Vibration ${maitriTelem.generatorVibrationMmS} mm/s (Threshold: 4.5 mm/s)
- SatCom: Uptime ${maitriTelem.satcomUptimePercent}% | Latency ${maitriTelem.satcomLatencyMs}ms

ACTIVE ALERTS & ANOMALIES FOR ${station.name.toUpperCase()}:
${alerts.map(a => `- [${a.severity}] ${a.title}: ${a.message} (Root cause: ${a.rootCause}) | Action: ${a.recommendedAction}`).join('\n')}

EMERGENCY SOPS FOR ${station.name.toUpperCase()}:
${station.emergencySOP.map(s => `- ${s}`).join('\n')}
`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Prepare multi-turn contents format
      let contents: any[] = [];

      if (messages && messages.length > 0) {
        // Map messages to Gemini multi-turn format
        for (const m of messages) {
          const role = (m.sender === 'USER' || m.sender === 'user' || m.role === 'user') ? 'user' : 'model';
          const textContent = m.text || m.content || '';
          if (textContent) {
            contents.push({
              role,
              parts: [{ text: textContent }]
            });
          }
        }
        // Ensure the latest question is at the end if not already included
        if (question && (!contents.length || contents[contents.length - 1].role !== 'user' || contents[contents.length - 1].parts[0].text !== question)) {
          contents.push({
            role: 'user',
            parts: [{ text: question }]
          });
        }
      } else {
        contents = [
          {
            role: 'user',
            parts: [{ text: queryText }]
          }
        ];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const responseText = response.text || 'Telemetry acknowledged. All subsystems operating within monitored limits.';

      return res.json({
        status: 'success',
        answer: responseText,
        sources: [
          {
            title: `${station.name} SCADA Sensor Stream`,
            docType: 'TELEMETRY',
            snippet: `Water: ${currentTelem.waterLevelL}L (${currentTelem.waterDaysRemaining}d) | Fuel: ${currentTelem.fuelLevelL}L | DG Temp: ${currentTelem.generatorTempC}°C | Vib: ${currentTelem.generatorVibrationMmS}mm/s`
          },
          {
            title: `NCPOR Polar Station SOP Runbook (${station.name})`,
            docType: 'SOP_MANUAL',
            snippet: station.emergencySOP.slice(0, 2).join('; ')
          },
          {
            title: `TransAnomaly ML Health Model v4.5`,
            docType: 'ML_FORECAST',
            snippet: `Station Risk Score: ${risk.overallScore}/100 [${risk.status}] | Failure Probability: ${(risk.cascadingTree.probability * 100).toFixed(0)}%`
          }
        ],
        quickActions: [
          `Inspect ${activeStationId === 'bharati' ? 'Bharati CHP Loop' : 'Maitri DG-1 Bearing'}`,
          `Calculate 90-Day Resupply Autonomy`,
          `Simulate Polar Vortex Storm`,
          `Switch to ${activeStationId === 'bharati' ? 'Maitri Station' : 'Bharati Station'}`
        ]
      });
    } else {
      // High-fidelity fallback logic
      const q = queryText.toLowerCase();
      let answer = '';
      let quickActions: string[] = [];

      if (q.includes('vibration') || q.includes('generator') || q.includes('bearing') || q.includes('dg-1') || q.includes('dg')) {
        answer = `### ⚠️ Generator Telemetry & Diagnostic Report for ${station.name}

- **Genset Model:** ${activeStationId === 'bharati' ? 'Volvo Penta 125 kVA CHP Integrated' : 'Kirloskar Arctic-Spec 100 kVA DG-1'}
- **Current Temperature:** **${currentTelem.generatorTempC}°C** (Normal: 70–80°C, Critical Trip: 95°C)
- **Harmonic Vibration Amplitude:** **${currentTelem.generatorVibrationMmS} mm/s** (Critical Threshold: **4.5 mm/s**)
- **Electrical Output:** Generating **${currentTelem.powerGenerationKw} kW** against base load **${currentTelem.powerConsumptionKw} kW**
- **ML Anomaly Classification:** ${anomalies[0]?.rootCause || 'Harmonic outer raceway defect detected by TransAnomaly sensor cluster'}.

#### 🛠️ Recommended SCADA SOP Actions:
1. **Execute ${activeStationId === 'bharati' ? 'SOP-BHR-08' : 'SOP-MAI-09'}:** Initiate automatic load transfer to Standby Genset Bank 2 within **40 minutes**.
2. **Shed Non-Essential Loads:** Throttle non-critical science heaters to maintain BESS battery charge above **80% SoC**.
3. **Inspect Lubrication Channel:** Verify sub-zero synthetic oil pressure and glycol pre-heater circuit.`;
        quickActions = ['Switch to DG-2 Standby', 'View Cascading Failure Tree', 'Check Battery SoC'];
      } else if (q.includes('water') || q.includes('deplet') || q.includes('freeze') || q.includes('lake') || q.includes('priyadarshini')) {
        answer = `### 💧 Freshwater Reserves & Life-Support Autonomy (${station.name})

- **Current Inventory:** **${currentTelem.waterLevelL.toLocaleString()} Liters** (${Math.round((currentTelem.waterLevelL / currentTelem.waterMaxL) * 100)}% capacity)
- **Daily Consumption Rate:** **${currentTelem.waterConsumptionRateLPerDay} L/day** for **${station.currentCrew} personnel**
- **Days of Autonomy Remaining:** **${currentTelem.waterDaysRemaining} Days**
- **Water Source & Processing:** ${station.waterSystem}
- **Projected Depletion Horizon:** **${forecast.depletionDates.water || 'Day 147 (~5 months)'}**
- **Scheduled Resupply:** 44th Indian Antarctic Expedition vessel resupply (+12,000 L) at Day 60.

#### 🛡️ Freeze Mitigation Safeguards:
- Primary trace heating loop active across intake suction line.
- Secondary cryo-melt thermal unit on hot-standby.`;
        quickActions = ['Inspect Water Intake', 'Calculate Resupply ETA', 'View 90-Day Forecast'];
      } else if (q.includes('status') || q.includes('overview') || q.includes('health') || q.includes('summary')) {
        answer = `### 🛰️ NCPOR Polar Mission Control Status Briefing

**Station:** **${station.name}** (${station.coordinates.region})
- **System Health Risk Index:** **${risk.overallScore}/100** [**${risk.status}**]
- **Active Crew:** **${station.currentCrew} / ${station.crewCapacity}** winter-over specialists
- **Power Generation:** **${currentTelem.powerGenerationKw} kW** (Solar: ${currentTelem.solarGenerationKw} kW, Wind: ${currentTelem.windGenerationKw} kW, Diesel: ${currentTelem.dieselGenerationKw} kW)
- **Battery Storage:** **${currentTelem.batterySocPercent}% SoC** (Health: ${currentTelem.batteryHealthPercent}%)
- **Fuel Reserves:** **${currentTelem.fuelLevelL.toLocaleString()} Liters** (**${currentTelem.fuelDaysRemaining} days**)
- **Ambient Conditions:** **${currentTelem.ambientTempC}°C** | Wind **${currentTelem.windSpeedKts} kts** | Chill **${currentTelem.windChillC}°C**
- **Comms Telemetry:** SatCom **${currentTelem.satcomUptimePercent}% Uptime**, Latency **${currentTelem.satcomLatencyMs} ms**

${alerts.length > 0 ? `🚨 **Active SCADA Alerts:** ${alerts.map(a => `\n- *[${a.severity}]* ${a.title} — ${a.message}`).join('')}` : '✅ All telemetry channels within nominal operating envelopes.'}`;
        quickActions = ['Analyze DG Vibration', 'View 3D Polar Map', 'Run ML Risk Simulation'];
      } else if (q.includes('risk') || q.includes('cascade') || q.includes('failure')) {
        answer = `### ⚡ Cascading Failure Vulnerability Matrix (${station.name})

- **Root Trigger Vulnerability:** **${risk.cascadingTree.label}** (Probability: ${(risk.cascadingTree.probability * 100).toFixed(0)}%)
- **Cascade Stage 1:** 45 kW microgrid power deficit causing immediate BESS battery rapid discharge (-1.2%/min).
- **Cascade Stage 2:** Combined Heat & Power (CHP) glycol circulation collapse.
- **Cascade Stage 3 (Catastrophic):** Living quarters temperature drop below +10°C within 2 hours, and exterior intake freeze within **3.5 hours at -30°C**.

#### 🔒 Automated SCADA Safeguards:
- Microgrid fast-acting islanding breaker armed.
- Tier-1 essential load-shedding protocol programmed in PLC-04.`;
        quickActions = ['Trigger DG Failover', 'Inspect Trace Heaters', 'Open Risk Matrix'];
      } else {
        answer = `### 📡 Telemetry Verified for ${station.name}

Commander, the SCADA telemetry mesh for **${station.name}** is actively streaming:
- **Risk Index:** **${risk.overallScore}/100 (${risk.status})**
- **Power:** **${currentTelem.powerGenerationKw} kW** generated vs **${currentTelem.powerConsumptionKw} kW** consumed
- **Reserves:** Water **${currentTelem.waterLevelL.toLocaleString()} L** (${currentTelem.waterDaysRemaining}d) | Fuel **${currentTelem.fuelLevelL.toLocaleString()} L** (${currentTelem.fuelDaysRemaining}d)
- **Active Alerts:** **${alerts.length}** event(s) recorded in SCADA journal.

Ask me about generator vibration, water freeze risk, 90-day depletion forecasts, or emergency SOP execution.`;
        quickActions = ['Summarize Station Health', 'Check Lake Intake', 'Run SOP Diagnostic'];
      }

      return res.json({
        status: 'success',
        answer,
        sources: [
          {
            title: `${station.name} SCADA Sensor Stream`,
            docType: 'TELEMETRY',
            snippet: `Water: ${currentTelem.waterLevelL}L (${currentTelem.waterDaysRemaining}d) | Fuel: ${currentTelem.fuelLevelL}L | DG Temp: ${currentTelem.generatorTempC}°C | Vib: ${currentTelem.generatorVibrationMmS}mm/s`
          },
          {
            title: `NCPOR Polar Station SOP Runbook (${station.name})`,
            docType: 'SOP_MANUAL',
            snippet: station.emergencySOP[0]
          }
        ],
        quickActions
      });
    }
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Internal AI service error' });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Antarctic Digital Twin server running on http://localhost:${PORT}`);
  });
}

startServer();
