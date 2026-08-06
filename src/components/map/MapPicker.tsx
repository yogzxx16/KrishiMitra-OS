import React, { useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon pathing in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

import { motion } from 'framer-motion';
import { MapPin, Crosshair, Loader2, Layers } from 'lucide-react';
import { reverseGeocode } from '../../services/nominatim';
import { useAppStore } from '../../store/appStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { formatCoords } from '../../utils/formatters';
import type { GeoCoordinates } from '../../types';

// ─── Custom Map Pin Icon (Official Style) ─────────────────────────────────────

const createCustomIcon = () =>
  L.divIcon({
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    html: `
      <div style="
        width:32px;height:40px;display:flex;flex-direction:column;align-items:center;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <div style="
          width:28px;height:28px;border-radius:50%;
          background:var(--color-goi-navy);
          border:2px solid white;
          display:flex;align-items:center;justify-content:center;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div style="
          width:2px;height:12px;
          background:var(--color-goi-navy);
          border-radius:1px;
        "></div>
      </div>
    `,
  });

// ─── Map Helpers ──────────────────────────────────────────────────────────────

function RecenterMap({ coords }: { coords: GeoCoordinates }) {
  const map = useMap();
  useEffect(() => {
    map.setView([coords.lat, coords.lng], 13, { animate: true });
  }, [coords, map]);
  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    const container = map.getContainer();
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [map]);
  return null;
}

function MapClickHandler({
  onPin,
}: {
  onPin: (coords: GeoCoordinates) => void;
}) {
  useMapEvents({
    click(e) {
      onPin({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// ─── Main Map Picker ──────────────────────────────────────────────────────────

const DEFAULT_CENTER: GeoCoordinates = { lat: 18.4088, lng: 76.5604 }; // Latur District

export const MapPicker = React.memo(function MapPicker() {
  const { setLocation } = useAppStore();
  const { coordinates: gpsCoords, requestLocation, isLocating } = useGeolocation();

  const [pinCoords, setPinCoords] = useState<GeoCoordinates>(
    gpsCoords ?? DEFAULT_CENTER
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locationLabel, setLocationLabel] = useState('Tap map or use GPS to set location');

  const customIcon = React.useMemo(() => createCustomIcon(), []);

  const handlePin = useCallback(
    async (coords: GeoCoordinates) => {
      setPinCoords(coords);
      setIsGeocoding(true);
      try {
        const result = await reverseGeocode(coords);
        setLocation(result.data);
        setLocationLabel(`${result.data.block}, ${result.data.district}, ${result.data.state}`);
      } finally {
        setIsGeocoding(false);
      }
    },
    [setLocation]
  );

  // Auto-pin on GPS fix
  useEffect(() => {
    if (gpsCoords) {
      handlePin(gpsCoords);
    }
  }, [gpsCoords, handlePin]);

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg overflow-hidden border border-gray-300 shadow-sm">
        <MapContainer
          center={[pinCoords.lat, pinCoords.lng]}
          zoom={12}
          className="h-72 w-full z-0"
          zoomControl={true}
          scrollWheelZoom={false}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap Base">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
            </LayersControl.BaseLayer>
            
            {/* Satellite Mock Layer */}
            <LayersControl.BaseLayer name="Satellite (Bhuvan/Esri)">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri'
              />
            </LayersControl.BaseLayer>

            {/* Overlays */}
            <LayersControl.Overlay name="Groundwater Block Map">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  opacity={0} // Mock overlay
                />
            </LayersControl.Overlay>
            <LayersControl.Overlay name="Soil Health Grid">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  opacity={0} // Mock overlay
                />
            </LayersControl.Overlay>
          </LayersControl>

          <MapResizer />
          <RecenterMap coords={pinCoords} />
          <MapClickHandler onPin={handlePin} />
          <Marker position={[pinCoords.lat, pinCoords.lng]} icon={customIcon} />
        </MapContainer>

        {/* GPS Button Overlay */}
        <button
          onClick={requestLocation}
          disabled={isLocating}
          className="absolute bottom-4 left-4 z-[500] flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-sm border border-gray-300 text-gray-800 rounded text-sm font-semibold hover:bg-gray-50 transition-all shadow-md focus-visible:ring-2 focus-visible:ring-[var(--color-goi-saffron)] outline-none"
          aria-label="Use my GPS location"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin text-[var(--color-goi-navy)]" aria-hidden="true" />
          ) : (
            <Crosshair className="h-4 w-4 text-[var(--color-goi-navy)]" aria-hidden="true" />
          )}
          {isLocating ? 'Locating…' : 'Locate Farm'}
        </button>
      </div>

      {/* Location Label */}
      <motion.div
        key={locationLabel}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg shadow-sm"
      >
        {isGeocoding ? (
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin shrink-0" />
        ) : (
          <MapPin className="h-5 w-5 text-[var(--color-goi-navy)] shrink-0" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <p className="text-sm text-gray-900 font-bold truncate tracking-wide">{locationLabel}</p>
          <p className="text-xs text-gray-600 mt-0.5 font-medium">
            Geo-coordinates: {formatCoords(pinCoords.lat, pinCoords.lng)}
          </p>
        </div>
      </motion.div>
    </div>
  );
});
