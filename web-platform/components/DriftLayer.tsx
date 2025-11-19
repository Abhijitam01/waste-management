'use client';

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { getWindData, getOceanCurrentData, calculateDriftPosition } from '@/lib/weather';

interface DriftLayerProps {
  wasteReports: Array<{
    id: string;
    lat: number;
    lng: number;
    type: string;
  }>;
  enabled: boolean;
}

export default function DriftLayer({ wasteReports, enabled }: DriftLayerProps) {
  const map = useMap();
  const [driftLines, setDriftLines] = useState<L.Polyline[]>([]);

  useEffect(() => {
    if (!enabled) {
      driftLines.forEach(line => map.removeLayer(line));
      setDriftLines([]);
      return;
    }

    const fetchDriftData = async () => {
      // Clear existing lines
      driftLines.forEach(line => map.removeLayer(line));
      const newLines: L.Polyline[] = [];

      for (const report of wasteReports.slice(0, 20)) { // Limit to 20 for performance
        try {
          const [windData, currentData] = await Promise.all([
            getWindData(report.lat, report.lng),
            getOceanCurrentData(report.lat, report.lng),
          ]);

          if (windData || currentData) {
            const windSpeed = windData?.speed || 0;
            const windDirection = windData?.direction || 0;
            const currentVelocity = currentData?.velocity || 0;
            const currentDirection = currentData?.direction || 0;

            // Calculate drift positions for 24, 48, and 72 hours
            const positions = [
              { lat: report.lat, lng: report.lng },
              calculateDriftPosition(report.lat, report.lng, windSpeed, windDirection, currentVelocity, currentDirection, 24),
              calculateDriftPosition(report.lat, report.lng, windSpeed, windDirection, currentVelocity, currentDirection, 48),
              calculateDriftPosition(report.lat, report.lng, windSpeed, windDirection, currentVelocity, currentDirection, 72),
            ];

            // Create polyline
            const line = L.polyline(
              positions.map(p => [p.lat, p.lng]),
              {
                color: '#3b82f6',
                weight: 2,
                opacity: 0.6,
                dashArray: '5, 10',
              }
            ).addTo(map);

            // Add arrow markers
            positions.slice(1).forEach((pos, index) => {
              const arrow = L.marker([pos.lat, pos.lng], {
                icon: L.divIcon({
                  html: `<div style="color: #3b82f6; font-size: 20px;">→</div>`,
                  className: 'drift-arrow',
                  iconSize: [20, 20],
                }),
              }).addTo(map);

              arrow.bindPopup(`
                <div style="padding: 8px;">
                  <strong>Predicted Position</strong><br/>
                  ${(index + 1) * 24} hours from now<br/>
                  Wind: ${windSpeed.toFixed(1)} m/s<br/>
                  Current: ${currentVelocity.toFixed(2)} m/s
                </div>
              `);
            });

            newLines.push(line);
          }
        } catch (error) {
          console.error('Error calculating drift:', error);
        }
      }

      setDriftLines(newLines);
    };

    fetchDriftData();

    return () => {
      driftLines.forEach(line => map.removeLayer(line));
    };
  }, [enabled, wasteReports, map]);

  return null;
}
