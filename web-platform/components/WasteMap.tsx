'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import DriftLayer from './DriftLayer';
import 'leaflet/dist/leaflet.css';

interface WasteReport {
  id: string;
  lat: number;
  lng: number;
  type: string;
  confidence: number;
  timestamp: number;
  imageUrl?: string;
}

interface WasteMapProps {
  reports: WasteReport[];
  center?: [number, number];
  showDrift?: boolean;
}

const createCustomIcon = (type: string) => {
  const colors: Record<string, string> = {
    plastic: '#3b82f6',
    glass: '#10b981',
    metal: '#6b7280',
    paper: '#f59e0b',
    cardboard: '#8b5cf6',
    trash: '#ef4444',
  };

  const color = colors[type.toLowerCase()] || '#6b7280';
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function WasteMap({ reports, center = [20.5937, 78.9629], showDrift = false }: WasteMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-slate-800 rounded-xl flex items-center justify-center">
        <p className="text-slate-400">Loading map...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={5}
      className="w-full h-full rounded-xl"
      style={{ height: '100%', minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />
      
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.lat, report.lng]}
          icon={createCustomIcon(report.type)}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-lg capitalize">{report.type}</h3>
              <p className="text-sm text-gray-600">
                Confidence: {(report.confidence * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(report.timestamp).toLocaleDateString()}
              </p>
              {report.imageUrl && (
                <img
                  src={report.imageUrl}
                  alt={report.type}
                  className="mt-2 rounded w-full h-32 object-cover"
                />
              )}
            </div>
          </Popup>
        </Marker>
      ))}
      
      <DriftLayer wasteReports={reports} enabled={showDrift} />
    </MapContainer>
  );
}
