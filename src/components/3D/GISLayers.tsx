import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { GISLayerState } from '../../types';
import {
  Layers,
  MapPin,
  Thermometer,
  ShieldAlert,
  Radio,
  Wind,
  Mountain,
  Eye,
  EyeOff,
  Navigation
} from 'lucide-react';

export const GISLayers: React.FC = () => {
  const { gisLayers, toggleGISLayer, setGISLayers } = useAppStore();

  const layerItems: { key: keyof GISLayerState; label: string; icon: React.ElementType; desc: string; color: string }[] = [
    {
      key: 'stations',
      label: 'Indian Antarctic Stations (Bharati & Maitri)',
      icon: MapPin,
      desc: 'Active NCPOR research stations with live status pins',
      color: 'text-cyan-400'
    },
    {
      key: 'interStationCorridor',
      label: 'NCPOR Logistics Air & Comms Corridor',
      icon: Navigation,
      desc: '3,050 km Great Circle flight path & microwave telemetry link',
      color: 'text-amber-400'
    },
    {
      key: 'telemetryLabels',
      label: 'Live SCADA Telemetry Overlays',
      icon: Radio,
      desc: 'Real-time resource, power, and generator metrics floating on pins',
      color: 'text-emerald-400'
    },
    {
      key: 'temperatureHeatmap',
      label: 'Polar Thermal Heatmap Layer',
      icon: Thermometer,
      desc: 'Antarctic surface temperature gradient (-70°C to -10°C)',
      color: 'text-sky-400'
    },
    {
      key: 'riskZones',
      label: 'Crevasse Rifts & Anomaly Stress Zones',
      icon: ShieldAlert,
      desc: 'Larsemann & Schirmacher glacial rift warning zones',
      color: 'text-red-400'
    },
    {
      key: 'serviceAreas',
      label: 'Twin Otter & Helicopter Flight Radius',
      icon: Layers,
      desc: '250 km operational emergency response zones',
      color: 'text-indigo-400'
    },
    {
      key: 'weatherWindVectors',
      label: 'Katabatic Wind Flow Streamlines',
      icon: Wind,
      desc: 'Continental descent wind vectors and blizzard vectors',
      color: 'text-blue-300'
    },
    {
      key: 'elevationContours',
      label: 'Ice Sheet Plateau Elevation Contours',
      icon: Mountain,
      desc: 'Antarctic topographical elevation heightmap lines',
      color: 'text-slate-300'
    }
  ];

  const enableAll = () => {
    const allOn: Partial<GISLayerState> = {};
    layerItems.forEach(l => { allOn[l.key] = true; });
    setGISLayers(allOn);
  };

  const disableAll = () => {
    const allOff: Partial<GISLayerState> = {};
    layerItems.forEach(l => { allOff[l.key] = false; });
    allOff.stations = true;
    allOff.interStationCorridor = true;
    setGISLayers(allOff);
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wide text-slate-200">
            Polar GIS Layer Management
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <button
            onClick={enableAll}
            className="text-cyan-400 hover:text-cyan-300 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 transition-colors"
          >
            All ON
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={disableAll}
            className="text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {layerItems.map((layer) => {
          const Icon = layer.icon;
          const isActive = gisLayers[layer.key];
          return (
            <button
              key={layer.key}
              id={`gis-layer-toggle-${layer.key}`}
              onClick={() => toggleGISLayer(layer.key)}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-slate-800/90 border-cyan-500/40 text-slate-100 shadow-sm shadow-cyan-950/20'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-500 hover:border-slate-700'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isActive ? 'bg-slate-900 ' + layer.color : 'bg-slate-900 text-slate-600'}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold truncate text-slate-200">
                    {layer.label}
                  </span>
                  {isActive ? (
                    <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-600 shrink-0 ml-1" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {layer.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
