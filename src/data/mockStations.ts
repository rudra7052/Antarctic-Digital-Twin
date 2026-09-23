import { StationSpecs, StationId } from '../types';

export const ANTARCTIC_STATIONS: Record<StationId, StationSpecs> = {
  bharati: {
    id: 'bharati',
    name: 'Bharati Station',
    country: 'India (NCPOR / MoES)',
    established: 2012,
    coordinates: {
      lat: -69.4072,
      lng: 76.1872,
      elevationM: 35,
      region: 'Larsemann Hills, Princess Elizabeth Land',
    },
    crewCapacity: 47,
    currentCrew: 24,
    stationType: 'Year-round',
    primaryResearch: [
      'Atmospheric Physics & Ionospheric Dynamics',
      'Southern Ocean Marine & Cryosphere Science',
      'Solid Earth Geomagnetism & Paleomagnetism',
      'Microbial Glaciology & Extremophile Genomics',
      'Space Weather & Indian Polar Satellite Ground Station (SGS)'
    ],
    climateZone: 'Coastal Antarctic Tundra / Continental Margin',
    facilities: [
      '3-Tier Modular Architectural Complex on Stilts (134 Prefab Shipping Containers)',
      'Satellite Ground Station (SGS) with 7.5m & 4.5m Dual Radomes for ISRO Earth Observation (Cartosat/RISAT)',
      'Combined Heat & Power (CHP) Waste-Heat Recovery Plant with Central Glycol Loop',
      'Dual Reverse Osmosis (RO) Sea-Ice Desalination Plant with Ultrasonic Anti-Frazil Intake',
      'Sub-Zero Snow Cat Garage & Heavy PistonBully Logistics Workshop'
    ],
    powerSystem: '3x 125 kVA Volvo Penta Tier-4 Diesel Gensets + 65 kW BIPV Solar Envelope + 250 kWh Lithium Iron Phosphate BESS Microgrid',
    waterSystem: 'Heated Seawater/Lake Intake (45,000L buffer) + Secondary Vacuum-Flash Thermal Melt Unit + 85% Greywater Recovery Recycler',
    commsSystem: 'Continuous 45 Mbps Dedicated Ku-Band & C-Band Satellite Trunks + High-Latitude Iridium Certus Backup + ISRO Polar S/X-Band Feeder',
    emergencySOP: [
      'SOP-BHR-01: Severe Katabatic Wind (>140 km/h) Lock-in & Exterior Thermal Hatch Seal Protocol',
      'SOP-BHR-08: Auxiliary Combined Heat & Power (CHP) loop startup & Glycol Radiator Bypass',
      'SOP-BHR-14: Desalination & Sea-ice RO intake anti-frazil ultrasonic purge and freeze protection',
      'SOP-BHR-22: Satellite Ground Station (SGS) Radome de-icing and backup telemetry link switch',
      'SOP-BHR-30: Inter-station emergency evacuation & Maitri air-bridge logistics coordination'
    ],
    description: 'India’s flagship third Antarctic research facility in Larsemann Hills, engineered as an aerodynamic, high-efficiency structure on stilts to prevent snowdrift accumulation. Features direct real-time downlink connectivity for ISRO Earth Observation satellites and an ultra-modern life-support digital twin.'
  },
  maitri: {
    id: 'maitri',
    name: 'Maitri Station',
    country: 'India (NCPOR / MoES)',
    established: 1989,
    coordinates: {
      lat: -70.7667,
      lng: 11.7333,
      elevationM: 117,
      region: 'Schirmacher Oasis, Queen Maud Land',
    },
    crewCapacity: 65,
    currentCrew: 25,
    stationType: 'Year-round',
    primaryResearch: [
      'Paleoclimatology & Deep Ice-Core Isotope Stratigraphy',
      'Seismology & Continental Crust Geodynamics',
      'Lake Priyadarshini Limnology & Freshwater Ecosystems',
      'Solar-Terrestrial & Geomagnetic Pulsations',
      'Meteorological Planetary Boundary Layer Studies'
    ],
    climateZone: 'Inland Oasis / Polar Semi-Arid',
    facilities: [
      'Main Structural Block with Heated Living Quarters & Central Mess Facility',
      'Lake Priyadarshini Dedicated Freshwater Suction Pump House & Heated Trace Pipeline',
      'Indo-Russian Magnetometer & Digital Broadband Seismometer Vault',
      'Bio-Digester & Low-Temperature Cryo-Sanitation Waste Treatment Facility',
      'Helicopter Helipad & Polar Airstrip Fuel Staging Depot'
    ],
    powerSystem: '4x 100 kVA Kirloskar Arctic-Spec Diesel Gensets + 30 kW Experimental Wind Turbine Array + 180 kWh Lead-Carbon Hybrid Storage',
    waterSystem: 'Priyadarshini Lake Sub-Ice Pump Station with Constant Heated Glycol Jacket + 30,000L Heated Storage Reservoir',
    commsSystem: 'Inmarsat Global Xpress 25 Mbps Broadband Terminal + HF Radio Directional Array + Emergency Polar Iridium Transceiver',
    emergencySOP: [
      'SOP-MAI-03: Lake Priyadarshini Sub-Ice Intake Trace-Heating Activation & Deep Freeze Thawing',
      'SOP-MAI-09: Diesel Generator Bank 2 Auto-Failover & Harmonic Vibration Safety Cutoff',
      'SOP-MAI-15: Cryo-containment ventilation bypass and living quarter emergency space-heater engagement',
      'SOP-MAI-21: HF Radio / Iridium Polar Gateway redundancy link auto-reconnect sequence',
      'SOP-MAI-27: Schirmacher Oasis blizzard survival shelter dispatch & tether line life-safety protocol'
    ],
    description: 'India’s historic second permanent research station, established on the rocky ice-free oasis of Schirmacher Oasis in Queen Maud Land. Operating year-round for over three decades, Maitri relies on the pristine freshwater of Lake Priyadarshini and serves as a vital scientific observation post.'
  }
};
