import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ANTARCTIC_STATIONS } from '../../data/mockStations';
import { StationSpecs, StationId } from '../../types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MapPin,
  Layers,
  Radio,
  Zap,
  Droplets,
  Wind,
  Navigation,
  Activity,
  Compass
} from 'lucide-react';

export const GlobeViewer: React.FC = () => {
  const {
    selectedStationId,
    setSelectedStationId,
    openStationDetailModal,
    gisLayers,
    simulation,
    currentTelemetry
  } = useAppStore();

  const [rotation, setRotation] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(15);
  const [zoom, setZoom] = useState<number>(1.15);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredStation, setHoveredStation] = useState<StationSpecs | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  // Accurate Polar Stereographic Projection (Center = South Pole at 400, 400)
  // Mapping Latitudes [-90 to -60] to Radius [0 to 280]
  const projectPolar = (lat: number, lng: number) => {
    const clampedLat = Math.min(-60, Math.max(-90, lat));
    const r = ((90 - Math.abs(clampedLat)) / 30) * 290;
    const rad = (lng * Math.PI) / 180;
    // 0 deg Longitude is North (Up), 90 deg East is Right (East)
    const x = 400 + r * Math.sin(rad);
    const y = 400 - r * Math.cos(rad);
    return { x, y };
  };

  // Pre-project Bharati & Maitri coordinates
  const bharatiPos = projectPolar(ANTARCTIC_STATIONS.bharati.coordinates.lat, ANTARCTIC_STATIONS.bharati.coordinates.lng);
  const maitriPos = projectPolar(ANTARCTIC_STATIONS.maitri.coordinates.lat, ANTARCTIC_STATIONS.maitri.coordinates.lng);

  // Smooth Focus Animation to Station
  const focusStation = (id: StationId) => {
    setSelectedStationId(id);
    const target = ANTARCTIC_STATIONS[id];
    if (!target) return;

    // Calculate rotation angle to bring station to the bottom/front (180 deg)
    const targetLng = target.coordinates.lng;
    const targetRot = (180 - targetLng + 360) % 360;
    const targetZoom = 1.8;
    const targetPitch = 22;

    const startRot = rotation;
    const startZoom = zoom;
    const startPitch = pitch;
    const startTime = performance.now();
    const duration = 650;

    setIsAnimating(true);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      let deltaRot = targetRot - startRot;
      if (deltaRot > 180) deltaRot -= 360;
      if (deltaRot < -180) deltaRot += 360;

      setRotation(startRot + deltaRot * ease);
      setZoom(startZoom + (targetZoom - startZoom) * ease);
      setPitch(startPitch + (targetPitch - startPitch) * ease);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);
  };

  const resetView = () => {
    const startRot = rotation;
    const startZoom = zoom;
    const startPitch = pitch;
    const startTime = performance.now();
    const duration = 500;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);

      setRotation(startRot * (1 - ease));
      setZoom(startZoom + (1.15 - startZoom) * ease);
      setPitch(startPitch + (15 - startPitch) * ease);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Mouse / Touch Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotation(r => (r + dx * 0.4 + 360) % 360);
    setPitch(p => Math.max(0, Math.min(45, p - dy * 0.25)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.75, Math.min(3.2, Number((z + delta).toFixed(2)))));
  };

  // Touch Handlers for Tablets/Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    setRotation(r => (r + dx * 0.4 + 360) % 360);
    setPitch(p => Math.max(0, Math.min(45, p - dy * 0.25)));
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const isFailure = simulation.mode === 'FAILURE_MODE';

  return (
    <div
      className="relative w-full h-full min-h-[520px] rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-center items-center select-none"
      onWheel={handleWheel}
    >
      {/* Top Header & Fast Station Focus Buttons */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-750 backdrop-blur-md text-xs font-mono font-bold text-slate-200 shadow-lg">
          <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span>POLAR GIS (WGS84 EPSG:3031)</span>
        </div>

        <button
          onClick={() => focusStation('bharati')}
          className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
            selectedStationId === 'bharati'
              ? 'bg-cyan-600/90 border-cyan-400 text-white shadow-lg shadow-cyan-900/50'
              : 'bg-slate-900/90 border-slate-750 text-slate-300 hover:text-white hover:border-slate-600'
          }`}
        >
          📍 Focus Bharati (76.2°E)
        </button>

        <button
          onClick={() => focusStation('maitri')}
          className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
            selectedStationId === 'maitri'
              ? 'bg-cyan-600/90 border-cyan-400 text-white shadow-lg shadow-cyan-900/50'
              : 'bg-slate-900/90 border-slate-750 text-slate-300 hover:text-white hover:border-slate-600'
          }`}
        >
          📍 Focus Maitri (11.7°E)
        </button>
      </div>

      {/* Floating Camera & Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-750 rounded-2xl p-1.5 backdrop-blur-md shadow-xl">
        <button
          onClick={() => setZoom(z => Math.min(3.2, Number((z + 0.25).toFixed(2))))}
          className="p-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Zoom In (Scroll Up)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.75, Number((z - 0.25).toFixed(2))))}
          className="p-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Zoom Out (Scroll Down)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Reset Antarctica Polar View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive 3D SVG Map Canvas */}
      <div
        className={`w-full h-full flex items-center justify-center ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <svg
          viewBox="0 0 800 800"
          className="w-full h-full max-h-[620px] transition-transform duration-75"
          style={{
            transform: `perspective(1000px) rotateX(${pitch}deg)`,
            transformOrigin: '50% 50%'
          }}
        >
          <defs>
            {/* Southern Ocean Gradient */}
            <radialGradient id="oceanGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0369a1" stopOpacity="0.12" />
              <stop offset="65%" stopColor="#0f172a" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.98" />
            </radialGradient>

            {/* Antarctic Ice Sheet Relief */}
            <radialGradient id="iceSheetGradient" cx="48%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#f0f9ff" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#bae6fd" stopOpacity="0.75" />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
            </radialGradient>

            {/* Polar Thermal Gradient */}
            <radialGradient id="polarThermalGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4338ca" stopOpacity="0.5" />
              <stop offset="40%" stopColor="#0284c7" stopOpacity="0.35" />
              <stop offset="75%" stopColor="#06b6d4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </radialGradient>

            {/* Neon Pin Filter */}
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Route Pulse Filter */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Static Ocean Sphere Background */}
          <circle cx="400" cy="400" r="380" fill="url(#oceanGlow)" stroke="#1e293b" strokeWidth="1.5" />

          {/* UNIFIED POLAR WORLD CONTAINER: Rotates and Scales synchronously */}
          <g transform={`translate(400, 400) scale(${zoom}) rotate(${rotation}) translate(-400, -400)`}>
            {/* Latitude Graticules (60°S, 70°S, 80°S, 90°S South Pole) */}
            <circle cx="400" cy="400" r="290" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4,6" opacity="0.45" />
            <circle cx="400" cy="400" r="193" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,5" opacity="0.5" />
            <circle cx="400" cy="400" r="97" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="2,4" opacity="0.65" />

            {/* Longitude Meridian Radial Rays (Every 45 degrees) */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const x2 = 400 + 330 * Math.sin(rad);
              const y2 = 400 - 330 * Math.cos(rad);
              return (
                <line
                  key={deg}
                  x1="400"
                  y1="400"
                  x2={x2}
                  y2={y2}
                  stroke="#1e293b"
                  strokeWidth="0.8"
                  strokeDasharray="2,6"
                />
              );
            })}

            {/* Meridian Degree Labels */}
            <text x="400" y="80" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">0° (Prime Meridian)</text>
            <text x="730" y="404" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">90°E</text>
            <text x="400" y="725" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">180°</text>
            <text x="70" y="404" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">90°W</text>

            {/* Temperature Heatmap Layer */}
            {gisLayers.temperatureHeatmap && (
              <circle cx="400" cy="400" r="280" fill="url(#polarThermalGradient)" />
            )}

            {/* Accurate Antarctic Continental Landmass Outline (Polar Stereographic) */}
            <path
              d="
                M 420, 180
                C 510, 185 580, 240 615, 310
                C 650, 380 640, 460 595, 530
                C 550, 600 470, 640 390, 630
                C 310, 620 230, 565 180, 490
                C 135, 420 150, 330 195, 250
                C 245, 180 330, 175 420, 180 Z
              "
              fill="url(#iceSheetGradient)"
              stroke="#7dd3fc"
              strokeWidth="2.5"
              filter="url(#glow)"
              opacity="0.9"
            />

            {/* Major Ice Shelves: Amery Ice Shelf near Bharati, Fimbul Ice Shelf near Maitri */}
            {/* Amery Ice Shelf (Pr. Elizabeth Land near 70°E) */}
            <path
              d="M 540, 240 C 580, 220 595, 270 565, 285 C 545, 275 535, 250 540, 240 Z"
              fill="#0284c7"
              fillOpacity="0.3"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="3,3"
            />
            {/* Ross Ice Shelf (180° sector) */}
            <path
              d="M 330, 550 C 380, 600 450, 580 480, 530 C 440, 500 370, 505 330, 550 Z"
              fill="#0284c7"
              fillOpacity="0.25"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4,2"
            />
            {/* Ronne-Filchner Ice Shelf (Weddell Sea sector) */}
            <path
              d="M 230, 310 C 275, 270 330, 290 340, 345 C 295, 355 250, 340 230, 310 Z"
              fill="#0284c7"
              fillOpacity="0.25"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4,2"
            />

            {/* High Plateau Elevation Contours (Dome C / South Pole Ridge) */}
            {gisLayers.elevationContours && (
              <>
                <ellipse cx="430" cy="380" rx="145" ry="110" fill="none" stroke="#bae6fd" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                <ellipse cx="440" cy="390" rx="85" ry="60" fill="none" stroke="#f0f9ff" strokeWidth="1.2" opacity="0.8" />
                <text x="445" y="380" fill="#bae6fd" fontSize="8" fontFamily="monospace" opacity="0.7">3,000m CONTOUR</text>
              </>
            )}

            {/* Katabatic Wind Flow Streamlines */}
            {gisLayers.weatherWindVectors && (
              <g stroke="#38bdf8" strokeWidth="1.5" opacity="0.75" strokeDasharray="8,4">
                {/* Wind draining from High Dome towards Bharati (Princess Elizabeth Land) */}
                <path d="M 440, 380 Q 510, 310 590, 275" fill="none" className="animate-pulse" />
                {/* Wind draining towards Maitri (Queen Maud Land) */}
                <path d="M 420, 380 Q 420, 280 425, 205" fill="none" className="animate-pulse" />
                {/* Wind towards Ross Sea */}
                <path d="M 400, 420 Q 340, 490 260, 520" fill="none" />
              </g>
            )}

            {/* Risk Zones: Schirmacher & Larsemann Glacial Rifts */}
            {gisLayers.riskZones && (
              <g>
                {/* Larsemann Hills crevasse hazard area near Bharati */}
                <polygon
                  points="575,260 610,275 600,305 565,290"
                  fill="#ef4444"
                  fillOpacity={isFailure ? '0.5' : '0.25'}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  className={isFailure ? 'animate-pulse' : ''}
                />
                <text x="590" y="255" fill="#f87171" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  RIFT-BHR-04
                </text>

                {/* Schirmacher Oasis glacial transition zone near Maitri */}
                <polygon
                  points="405,215 440,225 430,250 395,240"
                  fill="#f59e0b"
                  fillOpacity="0.3"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
                <text x="420" y="210" fill="#fbbf24" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  OASIS-PERIMETER
                </text>
              </g>
            )}

            {/* NCPOR Great Circle Logistics & Microwave Link between Bharati & Maitri */}
            {gisLayers.interStationCorridor && (
              <g id="ncpor-inter-station-corridor">
                {/* Logistics Arc Line */}
                <path
                  d={`M ${bharatiPos.x},${bharatiPos.y} Q 500,220 ${maitriPos.x},${maitriPos.y}`}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                  filter="url(#routeGlow)"
                  opacity="0.85"
                />

                {/* Animated Flying Particle Pulse along the route */}
                <circle
                  cx={(bharatiPos.x + maitriPos.x) / 2 + 10}
                  cy={(bharatiPos.y + maitriPos.y) / 2 - 15}
                  r="4.5"
                  fill="#fbbf24"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="animate-ping"
                />

                {/* Inter-Station Corridor Info Badge */}
                <g transform={`translate(${(bharatiPos.x + maitriPos.x) / 2 - 40}, ${(bharatiPos.y + maitriPos.y) / 2 - 35})`}>
                  <rect
                    x="-6"
                    y="-10"
                    width="125"
                    height="20"
                    rx="6"
                    fill="#0f172a"
                    fillOpacity="0.92"
                    stroke="#f59e0b"
                    strokeWidth="1"
                  />
                  <text x="56" y="4" fill="#fbbf24" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    NCPOR CORRIDOR: 3,050 km
                  </text>
                </g>
              </g>
            )}

            {/* Flight / Search & Rescue Buffers */}
            {gisLayers.serviceAreas && (
              <g>
                <circle
                  cx={bharatiPos.x}
                  cy={bharatiPos.y}
                  r="45"
                  fill="#6366f1"
                  fillOpacity="0.1"
                  stroke="#818cf8"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <circle
                  cx={maitriPos.x}
                  cy={maitriPos.y}
                  r="45"
                  fill="#6366f1"
                  fillOpacity="0.1"
                  stroke="#818cf8"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              </g>
            )}

            {/* Geographic South Pole 90°S Marker */}
            <g transform="translate(400, 400)">
              <circle cx="0" cy="0" r="4.5" fill="#f8fafc" stroke="#0ea5e9" strokeWidth="2" />
              <text x="0" y="16" fill="#94a3b8" fontSize="8.5" fontFamily="monospace" textAnchor="middle">
                SOUTH POLE 90°S
              </text>
            </g>

            {/* INDIAN STATIONS: BHARATI & MAITRI ONLY */}
            {gisLayers.stations && [ANTARCTIC_STATIONS.bharati, ANTARCTIC_STATIONS.maitri].map((st) => {
              const pos = projectPolar(st.coordinates.lat, st.coordinates.lng);
              const isSelected = selectedStationId === st.id;

              // Color codes
              let pinColor = '#10b981'; // Emerald
              let ringColor = 'rgba(16, 185, 129, 0.45)';

              if (isFailure) {
                pinColor = '#ef4444';
                ringColor = 'rgba(239, 68, 68, 0.6)';
              } else if (st.id === 'maitri') {
                pinColor = '#f59e0b'; // Amber warning on DG vibration
                ringColor = 'rgba(245, 158, 11, 0.45)';
              }

              return (
                <g
                  key={st.id}
                  id={`station-pin-${st.id}`}
                  className="cursor-pointer transition-transform duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStationId(st.id);
                    openStationDetailModal(st.id);
                  }}
                  onMouseEnter={() => setHoveredStation(st)}
                  onMouseLeave={() => setHoveredStation(null)}
                >
                  {/* Radar Pulse Animation */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 26 : 18}
                    fill="none"
                    stroke={pinColor}
                    strokeWidth="1.5"
                    opacity="0.8"
                    className="animate-ping"
                  />

                  {/* Selection Halo */}
                  {isSelected && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="20"
                      fill={ringColor}
                      stroke={pinColor}
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Outer Shield Ring */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 10 : 8}
                    fill="#0f172a"
                    stroke={pinColor}
                    strokeWidth="2"
                  />

                  {/* Center Dot */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 5.5 : 4}
                    fill={pinColor}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    filter="url(#glow)"
                  />

                  {/* Station Name & Live Telemetry Badge */}
                  {gisLayers.telemetryLabels && (
                    <g transform={`translate(${pos.x + 14}, ${pos.y - 12})`}>
                      <rect
                        x="-4"
                        y="-14"
                        width={st.id === 'bharati' ? 148 : 138}
                        height="26"
                        rx="7"
                        fill="#090d16"
                        fillOpacity="0.94"
                        stroke={isSelected ? '#06b6d4' : '#334155'}
                        strokeWidth={isSelected ? '2' : '1'}
                      />
                      <circle cx="5" cy="-1" r="3.5" fill={pinColor} />
                      <text
                        x="14"
                        y="1"
                        fill={isSelected ? '#38bdf8' : '#f1f5f9'}
                        fontSize="10.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {st.name} (IN)
                      </text>
                      <text
                        x="14"
                        y="9"
                        fill="#94a3b8"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        {st.id === 'bharati' ? 'CHP 155kW • RO Intact' : 'DG 135kW • Vib 4.8mm/s'}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Floating Detailed Hover Card */}
      {hoveredStation && (
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none rounded-2xl bg-slate-900/95 border border-cyan-500/60 p-4 backdrop-blur-md shadow-2xl space-y-2 max-w-sm animate-fade-in">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-slate-100 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              {hoveredStation.name}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              {hoveredStation.stationType}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-mono">
            {hoveredStation.country} • {hoveredStation.coordinates.region}
          </p>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-slate-300 border-t border-slate-800">
            <div>
              <span className="text-slate-500">CREW:</span> {hoveredStation.currentCrew} / {hoveredStation.crewCapacity}
            </div>
            <div>
              <span className="text-slate-500">ELEV:</span> {hoveredStation.coordinates.elevationM} m
            </div>
            <div>
              <span className="text-slate-500">LAT/LNG:</span> {hoveredStation.coordinates.lat}°S, {hoveredStation.coordinates.lng}°E
            </div>
            <div>
              <span className="text-slate-500">STATUS:</span>{' '}
              <span className={isFailure ? 'text-red-400 font-bold' : (hoveredStation.id === 'maitri' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold')}>
                {isFailure ? 'CRITICAL FAULT' : (hoveredStation.id === 'maitri' ? 'WARNING (DG-1)' : 'NOMINAL')}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-cyan-400 font-mono italic pt-1">
            ⚡ Click station pin to inspect full 3D Digital Twin & SCADA diagnostic
          </p>
        </div>
      )}

      {/* Map Interactive Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-[11px] font-mono text-slate-300 shadow-xl">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span> Nominal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span> Alert (Maitri)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400"></span> Critical
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-400 font-semibold">Drag to Orbit • Wheel to Zoom</span>
      </div>
    </div>
  );
};
