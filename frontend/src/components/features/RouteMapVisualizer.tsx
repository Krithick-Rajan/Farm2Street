import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  Compass,
  Zap,
  Route,
  RotateCcw,
} from 'lucide-react';
import { DeliveryStatus } from '../../types';

interface RouteMapVisualizerProps {
  pickupLocation: string;
  deliveryLocation: string;
  distanceKm: number;
  estimatedMinutes: number;
  status: DeliveryStatus;
  driverName?: string;
  vehicleNumber?: string;
}

export const RouteMapVisualizer: React.FC<RouteMapVisualizerProps> = ({
  pickupLocation,
  deliveryLocation,
  distanceKm,
  estimatedMinutes,
  status,
  driverName = 'Delivery Partner',
  vehicleNumber = 'EV-CARGO',
}) => {
  const [activeTab, setActiveTab] = useState<'map' | 'turn_by_turn'>('map');
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapInstance = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Calculate delivery progress percentage
  const getProgressPercentage = () => {
    switch (status) {
      case 'Order Placed':
      case 'Order Confirmed':
      case 'Preparing':
        return 0;
      case 'Ready for Pickup':
        return 12;
      case 'Delivery Partner Assigned':
        return 25;
      case 'Picked Up':
        return 45;
      case 'Out for Delivery':
        return 78;
      case 'Delivered':
        return 100;
      default:
        return 50;
    }
  };

  const progress = getProgressPercentage();

  // Recenter map helper
  const recenterMap = () => {
    if (leafletMapInstance.current && polylineRef.current) {
      leafletMapInstance.current.invalidateSize();
      leafletMapInstance.current.fitBounds(polylineRef.current.getBounds(), {
        padding: [80, 80],
        maxZoom: 14,
      });
    }
  };

  // Initialize & update real Leaflet Satellite View Map
  useEffect(() => {
    if (activeTab !== 'map' || !mapContainerRef.current) return;

    // Fixed realistic corridor coordinates (Coimbatore / Agro-Hub to Destination)
    const farmLat = 10.658;
    const farmLng = 77.008;
    const destLat = 11.0168;
    const destLng = 76.9558;

    // Interpolate current driver position based on progress
    const ratio = Math.max(0, Math.min(progress / 100, 1));
    const currentLat = farmLat + (destLat - farmLat) * ratio;
    const currentLng = farmLng + (destLng - farmLng) * ratio;

    // Teardown any prior map instance and clear Leaflet internal ID
    if (leafletMapInstance.current) {
      leafletMapInstance.current.remove();
      leafletMapInstance.current = null;
    }
    if (mapContainerRef.current) {
      delete (mapContainerRef.current as any)._leaflet_id;
      mapContainerRef.current.innerHTML = '';
    }

    try {
      // 1. Initialize map with zoomControl: false (no + or - buttons) & scrollWheelZoom: true (mouse wheel zoom)
      const map = L.map(mapContainerRef.current, {
        attributionControl: false,
        zoomControl: false, // NO + or - buttons
        scrollWheelZoom: true, // Zoom in and out using mouse wheel
        dragging: true, // Mouse drag panning
        doubleClickZoom: true,
        minZoom: 6,
        maxZoom: 18,
      });

      // 2. High-Resolution True Satellite Ortho Imagery Layer (ArcGIS World_Imagery)
      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          crossOrigin: true,
        }
      );
      satelliteLayer.addTo(map);

      // 3. High-Contrast Reference Labels Layer (World Boundaries, Highways & Cities)
      const labelLayer = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          opacity: 1.0,
          crossOrigin: true,
        }
      );
      labelLayer.addTo(map);

      // 4. OpenStreetMap Fallback Layer
      const osmFallback = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
        }
      );
      satelliteLayer.on('tileerror', () => {
        if (!map.hasLayer(osmFallback)) {
          osmFallback.addTo(map);
        }
      });

      // 5. Custom Farm Origin Marker (High-Contrast Solid White & Dark Green Pill)
      const farmIcon = L.divIcon({
        className: 'leaflet-custom-marker',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; filter: drop-shadow(0 6px 14px rgba(0,0,0,0.85));">
            <div style="background:#ffffff; color:#0e291b; border:2.5px solid #183c2a; border-radius:10px; padding:4px 12px; font-size:12px; font-weight:800; white-space:nowrap; margin-bottom:5px; box-shadow:0 4px 12px rgba(0,0,0,0.5); font-family:system-ui, -apple-system, sans-serif;">
              Farm Gate Origin
            </div>
            <div style="background:#183c2a; color:#ffffff; border-radius:50%; width:38px; height:38px; display:flex; align-items:center; justify-content:center; border:2.5px solid #ffffff; box-shadow:0 4px 12px rgba(0,0,0,0.7);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 1 1.1 4c-1.2-.1-2.8-.6-3.9-1.5-.9-.8-1.5-1.9-1.9-3.2 2.2-.4 3.7-.1 4.7.7z"/></svg>
            </div>
          </div>
        `,
        iconSize: [150, 70],
        iconAnchor: [75, 68],
      });
      const farmMarker = L.marker([farmLat, farmLng], { icon: farmIcon }).addTo(map);
      farmMarker.bindPopup(`<b>Farm Gate Origin</b><br/>${pickupLocation}`);

      // 6. Custom Destination Marker (High-Contrast Solid White & Warm Gold Pill)
      const destIcon = L.divIcon({
        className: 'leaflet-custom-marker',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; filter: drop-shadow(0 6px 14px rgba(0,0,0,0.85));">
            <div style="background:#ffffff; color:#52360b; border:2.5px solid #c5a880; border-radius:10px; padding:4px 12px; font-size:12px; font-weight:800; white-space:nowrap; margin-bottom:5px; box-shadow:0 4px 12px rgba(0,0,0,0.5); font-family:system-ui, -apple-system, sans-serif;">
              Customer Doorstep
            </div>
            <div style="background:#c5a880; color:#07100b; border-radius:50%; width:38px; height:38px; display:flex; align-items:center; justify-content:center; border:2.5px solid #ffffff; box-shadow:0 4px 12px rgba(0,0,0,0.7);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
          </div>
        `,
        iconSize: [160, 70],
        iconAnchor: [80, 68],
      });
      const destMarker = L.marker([destLat, destLng], { icon: destIcon }).addTo(map);
      destMarker.bindPopup(`<b>Customer Doorstep</b><br/>${deliveryLocation}`);

      // 7. Live Driver / EV Cargo Marker (Ultra-High-Contrast Solid White Pill with Crisp Emerald Border)
      const vanIcon = L.divIcon({
        className: 'leaflet-custom-marker',
        html: `
          <div style="background:#ffffff; color:#092215; border:2.5px solid #10b981; border-radius:30px; padding:5px 14px; font-size:11px; font-weight:800; display:flex; align-items:center; gap:8px; box-shadow:0 6px 16px rgba(0,0,0,0.85); white-space:nowrap; font-family:system-ui, -apple-system, sans-serif;">
            <span style="background:#10b981; color:#ffffff; border-radius:50%; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><path d="M15 18H9"/><circle cx="17" cy="18" r="2"/><path d="M19 18h2a1 1 0 0 0 1-1v-5.2a2 2 0 0 0-.6-1.4l-3.2-3.2A2 2 0 0 0 16.8 7H14"/><line x1="2" x2="2" y1="13" y2="13"/></svg>
            </span>
            <span style="color:#092215; font-size:12px;">${driverName}</span>
            <span style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; border-radius:12px; padding:1px 7px; font-size:10px; font-weight:700;">${status}</span>
          </div>
        `,
        iconSize: [260, 42],
        iconAnchor: [130, 21],
      });
      L.marker([currentLat, currentLng], { icon: vanIcon }).addTo(map);

      // 8. High-Visibility Dual-Casing Polyline Route on Satellite
      const routePath: [number, number][] = [
        [farmLat, farmLng],
        [currentLat, currentLng],
        [destLat, destLng],
      ];

      // Black outer glow casing
      L.polyline(routePath, {
        color: '#000000',
        weight: 9,
        opacity: 0.75,
      }).addTo(map);

      // Emerald inner glowing route
      const polyline = L.polyline(routePath, {
        color: '#10b981',
        weight: 5,
        dashArray: status === 'Delivered' ? undefined : '8, 6',
        opacity: 1,
      }).addTo(map);

      polylineRef.current = polyline;

      // Fit bounds with generous 80px padding so labels are never cut off
      map.fitBounds(polyline.getBounds(), { padding: [80, 80] });

      leafletMapInstance.current = map;

      // Invalidate size on animation frame and timeouts
      const invalidate = () => {
        if (map) {
          map.invalidateSize();
          map.fitBounds(polyline.getBounds(), { padding: [80, 80] });
        }
      };

      requestAnimationFrame(invalidate);
      const t1 = setTimeout(invalidate, 100);
      const t2 = setTimeout(invalidate, 300);
      const t3 = setTimeout(invalidate, 650);

      let ro: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        ro = new ResizeObserver(() => {
          map.invalidateSize();
        });
        ro.observe(mapContainerRef.current);
      }

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        if (ro) ro.disconnect();
        if (leafletMapInstance.current) {
          leafletMapInstance.current.remove();
          leafletMapInstance.current = null;
        }
      };
    } catch (err) {
      console.warn('Leaflet satellite map initialization notice:', err);
    }
  }, [activeTab, status, pickupLocation, deliveryLocation, progress, driverName]);

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm font-sans">
      {/* Route Header */}
      <div className="border-b border-stone-100 bg-[#fbfaf5] p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#183c2a] text-white">
            <Route className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#182019] block">
              Satellite Transit Navigation
            </span>
            <span className="text-[10px] text-stone-500 font-medium">
              Use mouse wheel to zoom in/out · Drag to pan route
            </span>
          </div>
        </div>

        {/* View mode toggle & Recenter button */}
        <div className="flex items-center gap-2">
          {activeTab === 'map' && (
            <button
              type="button"
              onClick={recenterMap}
              className="flex items-center gap-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 px-3 py-1 text-xs font-bold text-stone-800 transition-all cursor-pointer shadow-2xs"
              title="Recenter Map on Transit Route"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#183c2a]" />
              <span>Recenter</span>
            </button>
          )}

          <div className="flex items-center rounded-lg bg-stone-200/60 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className={`rounded-md px-3 py-1 transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Satellite Map
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('turn_by_turn')}
              className={`rounded-md px-3 py-1 transition-all cursor-pointer ${
                activeTab === 'turn_by_turn'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Waypoints
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bar with High-Contrast Readable Text */}
      <div className="grid grid-cols-3 border-b border-stone-100 bg-white p-2.5 text-center text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-stone-400">Total Distance</span>
          <div className="font-bold text-[#182019] text-sm mt-0.5">{distanceKm} km</div>
        </div>
        <div className="border-x border-stone-100">
          <span className="text-[10px] uppercase font-bold text-stone-400">Estimated Arrival</span>
          <div className="font-bold text-[#183c2a] text-sm mt-0.5">
            {status === 'Delivered' ? 'Completed' : `~${estimatedMinutes} mins`}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-stone-400">Transit Vehicle</span>
          <div className="font-bold text-emerald-700 text-sm mt-0.5 flex items-center justify-center gap-1">
            <Zap className="h-3.5 w-3.5 text-emerald-600" />
            <span>EV Cargo ({vehicleNumber})</span>
          </div>
        </div>
      </div>

      {/* Map Content Tab (Completely unobstructed view - zero overlay badges blocking satellite) */}
      {activeTab === 'map' ? (
        <div className="relative h-80 sm:h-96 w-full bg-[#0a120c] overflow-hidden">
          {/* Real Leaflet Satellite Map Container */}
          <div
            ref={mapContainerRef}
            className="h-full w-full relative z-0"
            style={{ minHeight: '320px' }}
          />
        </div>
      ) : (
        /* Turn-by-Turn Waypoints */
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto text-xs bg-white">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
              1
            </div>
            <div>
              <div className="font-bold text-[#182019]">Collect Crate at Farm Gate</div>
              <div className="text-[11px] text-stone-500">{pickupLocation} • Check batch QR seal integrity</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-stone-700 font-bold text-[10px] shrink-0">
              2
            </div>
            <div>
              <div className="font-bold text-[#182019]">Northbound Corridor onto Regional Agro Expressway</div>
              <div className="text-[11px] text-stone-500">11.2 km uninterrupted eco-speed (45 km/h avg)</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-stone-700 font-bold text-[10px] shrink-0">
              3
            </div>
            <div>
              <div className="font-bold text-[#182019]">City Distribution Hub Exit</div>
              <div className="text-[11px] text-stone-500">Take left towards East Avenue (4.8 km)</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
              4
            </div>
            <div>
              <div className="font-bold text-[#182019]">Customer Neighborhood Gate Handover</div>
              <div className="text-[11px] text-stone-500">{deliveryLocation} • Direct doorstep contactless drop</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
