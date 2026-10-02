import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Award, Sprout, Satellite, LayoutGrid, RotateCcw } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface FarmData {
  name: string;
  farmer: string;
  location: string;
  distance: string;
  acreage: string;
  specialty: string;
  image: string;
  farmerImg: string;
  soilHealth: string;
  lat: number;
  lng: number;
}

export const LocalFarms: React.FC = () => {
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  const farms: FarmData[] = [
    {
      name: 'Green Valley Organic Farms',
      farmer: 'Ramesh Patel',
      location: 'Valley Agro Belt, Pollachi Corridor',
      distance: '18 km away',
      acreage: '12 Acres Certified Organic',
      specialty: 'Heirloom Vine Tomatoes, Exotic Bell Peppers, Herbs',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      farmerImg: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
      soilHealth: '0.82% Organic Carbon',
      lat: 10.658,
      lng: 77.008,
    },
    {
      name: 'Sunrise Fields Collective',
      farmer: 'Anandi Devi',
      location: 'Sunlight Natural Cluster, Coimbatore Rural',
      distance: '12 km away',
      acreage: '8 Acres Natural Farming',
      specialty: 'Malabar Spinach, Fenugreek, Radish Greens, Coriander',
      image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
      farmerImg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      soilHealth: 'Zero Chemical Residue',
      lat: 10.892,
      lng: 76.924,
    },
    {
      name: 'Meadow Roots Micro-Farm',
      farmer: 'Suresh More',
      location: 'Nilgiris Biosphere Foothills',
      distance: '35 km away',
      acreage: '15 Acres Clay Alluvial',
      specialty: 'Sweet Orange Carrots, Beetroots, Purple Turnips',
      image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
      farmerImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      soilHealth: 'Deep Mineral Well Irrigation',
      lat: 11.238,
      lng: 76.942,
    },
  ];

  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
    if (mapContainerRef.current) {
      delete (mapContainerRef.current as any)._leaflet_id;
      mapContainerRef.current.innerHTML = '';
    }

    try {
      const map = L.map(mapContainerRef.current, {
        attributionControl: false,
        zoomControl: false,
        scrollWheelZoom: true,
        dragging: true,
      });

      // Satellite ortho imagery layer
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);

      // Boundaries and places layer for high-contrast labels
      L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 1.0 }
      ).addTo(map);

      const markersGroup = L.featureGroup();

      farms.forEach((farm) => {
        const farmIcon = L.divIcon({
          className: 'leaflet-custom-marker',
          html: `
            <div style="display:flex; flex-direction:column; align-items:center; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.85));">
              <div style="background:#ffffff; color:#0e291b; border:2.5px solid #183c2a; border-radius:8px; padding:3px 9px; font-size:11px; font-weight:800; white-space:nowrap; margin-bottom:4px; box-shadow:0 3px 8px rgba(0,0,0,0.6); font-family:sans-serif;">
                ${farm.name}
              </div>
              <div style="background:#183c2a; color:#ffffff; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; border:2.5px solid #ffffff; box-shadow:0 4px 10px rgba(0,0,0,0.7);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 1 1.1 4c-1.2-.1-2.8-.6-3.9-1.5-.9-.8-1.5-1.9-1.9-3.2 2.2-.4 3.7-.1 4.7.7z"/></svg>
              </div>
            </div>
          `,
          iconSize: [140, 56],
          iconAnchor: [70, 52],
        });

        const marker = L.marker([farmLat(farm.lat), farm.lng], { icon: farmIcon });
        marker.bindPopup(`
          <div style="font-family:sans-serif; min-width:180px;">
            <div style="font-weight:bold; font-size:13px; color:#183c2a;">${farm.name}</div>
            <div style="font-size:11px; color:#555; margin-top:3px;">Farmer: <b>${farm.farmer}</b></div>
            <div style="font-size:11px; color:#555;">${farm.acreage}</div>
            <div style="font-size:11px; color:#2c5b3d; font-weight:bold; margin-top:4px;">${farm.distance}</div>
          </div>
        `);
        markersGroup.addLayer(marker);
      });

      markersGroup.addTo(map);
      map.fitBounds(markersGroup.getBounds(), { padding: [50, 50] });

      leafletMapRef.current = map;

      const refresh = () => {
        if (map) {
          map.invalidateSize();
          map.fitBounds(markersGroup.getBounds(), { padding: [40, 40] });
        }
      };
      requestAnimationFrame(refresh);
      const timer = setTimeout(refresh, 250);

      window.addEventListener('resize', refresh, { passive: true });

      let ro: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        ro = new ResizeObserver(() => {
          refresh();
        });
        ro.observe(mapContainerRef.current);
      }

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', refresh);
        if (ro) ro.disconnect();
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }
      };
    } catch (e) {
      console.warn('Local farms map notice:', e);
    }
  }, [viewMode]);

  function farmLat(lat: number) {
    return lat;
  }

  return (
    <section id="farms" className="py-20 max-w-7xl mx-auto px-5 md:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#c5a880]">
            The Producers
          </span>
          <h2 className="font-sans text-3xl md:text-5xl font-bold tracking-[-0.04em] text-[#182019] mt-2">
            Meet Our Partner Farms
          </h2>
          <p className="text-sm md:text-base text-[#6f776e] mt-2 max-w-xl">
            Every vegetable links directly to the verified grower who cultivated it. We pay farmers 40% above typical mandi rates.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="inline-flex items-center rounded-full bg-white p-1 border border-stone-200 shadow-2xs shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-[#183c2a] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Farm Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-[#183c2a] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Satellite className="h-3.5 w-3.5" />
            <span>Satellite Ortho Map</span>
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {farms.map((farm, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-3xl border border-[rgba(24,32,25,0.08)] bg-[#fbfaf5] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Farm photo */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
                <img
                  src={farm.image}
                  alt={farm.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-[#183c2a] shadow-sm">
                  {farm.distance}
                </div>
              </div>

              {/* Farmer badge */}
              <div className="flex items-center gap-3 mt-5">
                <img
                  src={farm.farmerImg}
                  alt={farm.farmer}
                  className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <div className="text-xs font-medium text-[#6f776e]">Lead Farmer</div>
                  <div className="text-sm font-bold text-[#182019]">{farm.farmer}</div>
                </div>
              </div>

              {/* Farm details */}
              <div className="mt-4">
                <h3 className="font-sans text-xl font-bold tracking-[-0.03em] text-[#182019] group-hover:text-[#183c2a] transition-colors">
                  {farm.name}
                </h3>
                <p className="flex items-center gap-1.5 text-xs text-[#6f776e] mt-1">
                  <MapPin className="h-3.5 w-3.5 text-[#2c5b3d]" />
                  {farm.location} • {farm.acreage}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-[rgba(24,32,25,0.06)] text-xs text-[#343c35]">
                <div className="font-semibold text-[11px] uppercase tracking-wider text-[#a48256] mb-1">
                  Primary Specialty
                </div>
                <p className="line-clamp-1">{farm.specialty}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Interactive Satellite Map View */
        <div className="relative rounded-3xl overflow-hidden border border-stone-200/90 shadow-lg bg-[#07100b]">
          <div
            ref={mapContainerRef}
            className="w-full h-[450px] relative z-0"
            style={{ minHeight: '450px' }}
          />
        </div>
      )}
    </section>
  );
};
