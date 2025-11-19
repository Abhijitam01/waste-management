'use client';

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { getWindData, getOceanCurrentData, calculateDriftPosition, calculateDriftSpeed, calculateDriftWithSpeed } from '@/lib/weather';

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
  const [driftMarkers, setDriftMarkers] = useState<L.Marker[]>([]);

  useEffect(() => {
    if (!enabled) {
      driftLines.forEach(line => map.removeLayer(line));
      driftMarkers.forEach(marker => map.removeLayer(marker));
      setDriftLines([]);
      setDriftMarkers([]);
      return;
    }

    const fetchDriftData = async () => {
      // Clear existing lines and markers
      driftLines.forEach(line => map.removeLayer(line));
      driftMarkers.forEach(marker => map.removeLayer(marker));
      const newLines: L.Polyline[] = [];
      const newMarkers: L.Marker[] = [];

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

            // Calculate drift speed
            const driftSpeed = calculateDriftSpeed(windSpeed, windDirection, currentVelocity, currentDirection);

            // Calculate drift positions with speed info for 24, 48, and 72 hours
            const drift24 = calculateDriftWithSpeed(report.lat, report.lng, windSpeed, windDirection, currentVelocity, currentDirection, 24);
            const drift48 = calculateDriftWithSpeed(report.lat, report.lng, windSpeed, windDirection, currentVelocity, currentDirection, 48);
            const drift72 = calculateDriftWithSpeed(report.lat, report.lng, windSpeed, windDirection, currentVelocity, currentDirection, 72);

            const positions = [
              { lat: report.lat, lng: report.lng },
              { lat: drift24.lat, lng: drift24.lng },
              { lat: drift48.lat, lng: drift48.lng },
              { lat: drift72.lat, lng: drift72.lng },
            ];

            // Create polyline with color based on drift speed (faster = brighter)
            const speedIntensity = Math.min(driftSpeed.speedKmh / 5, 1); // Normalize to 0-1 (5 km/h = max intensity)
            const lineColor = `hsl(${210 - speedIntensity * 30}, 70%, ${50 + speedIntensity * 20}%)`;
            
            const line = L.polyline(
              positions.map(p => [p.lat, p.lng]),
              {
                color: lineColor,
                weight: 2 + speedIntensity * 2,
                opacity: 0.7,
                dashArray: '5, 10',
              }
            ).addTo(map);

            // Add arrow markers with drift speed info
            const driftData = [drift24, drift48, drift72];
            driftData.forEach((drift, index) => {
              const hours = (index + 1) * 24;
              const arrow = L.marker([drift.lat, drift.lng], {
                icon: L.divIcon({
                  html: `<div style="color: ${lineColor}; font-size: 20px; font-weight: bold;">→</div>`,
                  className: 'drift-arrow',
                  iconSize: [20, 20],
                }),
              }).addTo(map);

              arrow.bindPopup(`
                <div style="padding: 10px; min-width: 200px;">
                  <strong style="color: #3b82f6;">Predicted Position</strong><br/>
                  <hr style="margin: 8px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <div style="margin-bottom: 6px;">
                    <strong>Time:</strong> ${hours} hours from now<br/>
                    <strong>Distance:</strong> ${(drift.distance / 1000).toFixed(2)} km
                  </div>
                  <div style="background: #f3f4f6; padding: 8px; border-radius: 4px; margin: 8px 0;">
                    <strong style="color: #059669;">Drift Speed: ${drift.driftSpeed.speedKmh.toFixed(2)} km/h</strong><br/>
                    <small style="color: #6b7280;">(${drift.driftSpeed.speed.toFixed(3)} m/s)</small>
                  </div>
                  <div style="font-size: 0.85em; color: #6b7280;">
                    <strong>Direction:</strong> ${drift.driftSpeed.direction.toFixed(1)}°<br/>
                    <strong>Wind:</strong> ${windSpeed.toFixed(1)} m/s @ ${windDirection.toFixed(0)}°<br/>
                    <strong>Current:</strong> ${currentVelocity.toFixed(2)} m/s @ ${currentDirection.toFixed(0)}°
                  </div>
                  <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 0.8em; color: #059669;">
                    <strong>💡 NGO Tip:</strong> Plan cleanup at this location in ${hours}h
                  </div>
                </div>
              `);
              
              newMarkers.push(arrow);
            });

            // Add marker at origin with current drift speed
            const originMarker = L.marker([report.lat, report.lng], {
              icon: L.divIcon({
                html: `<div style="background: ${lineColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; white-space: nowrap;">${driftSpeed.speedKmh.toFixed(1)} km/h</div>`,
                className: 'drift-speed-marker',
                iconSize: [60, 20],
              }),
            }).addTo(map);

            originMarker.bindPopup(`
              <div style="padding: 10px; min-width: 200px;">
                <strong style="color: #3b82f6;">Current Drift Speed</strong><br/>
                <hr style="margin: 8px 0; border: none; border-top: 1px solid #e5e7eb;">
                <div style="background: #f3f4f6; padding: 8px; border-radius: 4px; margin: 8px 0;">
                  <strong style="color: #059669; font-size: 1.2em;">${driftSpeed.speedKmh.toFixed(2)} km/h</strong><br/>
                  <small style="color: #6b7280;">${driftSpeed.speed.toFixed(3)} m/s</small>
                </div>
                <div style="font-size: 0.85em; color: #6b7280; margin-top: 8px;">
                  <strong>Direction:</strong> ${driftSpeed.direction.toFixed(1)}°<br/>
                  <strong>Wind Contribution:</strong> ${driftSpeed.windContribution.toFixed(3)} m/s<br/>
                  <strong>Current Contribution:</strong> ${driftSpeed.currentContribution.toFixed(3)} m/s
                </div>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 0.8em; color: #059669;">
                  <strong>💡 NGO Tip:</strong> Waste is moving at ${driftSpeed.speedKmh.toFixed(1)} km/h. Use predicted positions to plan cleanup routes.
                </div>
              </div>
            `);

            newMarkers.push(originMarker);
            newLines.push(line);
          }
        } catch (error) {
          console.error('Error calculating drift:', error);
        }
      }

      setDriftLines(newLines);
      setDriftMarkers(newMarkers);
    };

    fetchDriftData();

    return () => {
      driftLines.forEach(line => map.removeLayer(line));
      driftMarkers.forEach(marker => map.removeLayer(marker));
    };
  }, [enabled, wasteReports, map]);

  return null;
}
