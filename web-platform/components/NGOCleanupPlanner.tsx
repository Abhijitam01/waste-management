'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Wind, Navigation, Clock, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getWindData, getOceanCurrentData, calculateDriftSpeed, calculateDriftWithSpeed } from '@/lib/weather';
import { WasteReport } from '@/types';

interface CleanupRecommendation {
  report: WasteReport;
  driftSpeed: {
    speed: number;
    speedKmh: number;
    direction: number;
  };
  predicted24h: { lat: number; lng: number; distance: number };
  predicted48h: { lat: number; lng: number; distance: number };
  predicted72h: { lat: number; lng: number; distance: number };
  priority: 'high' | 'medium' | 'low';
  urgency: number; // 0-100 score
}

interface NGOCleanupPlannerProps {
  reports: WasteReport[];
  onLocationSelect?: (lat: number, lng: number) => void;
}

export default function NGOCleanupPlanner({ reports, onLocationSelect }: NGOCleanupPlannerProps) {
  const [recommendations, setRecommendations] = useState<CleanupRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<24 | 48 | 72>(24);
  const [sortBy, setSortBy] = useState<'speed' | 'distance' | 'urgency'>('urgency');

  useEffect(() => {
    if (reports.length === 0) return;

    const fetchDriftData = async () => {
      setLoading(true);
      const recs: CleanupRecommendation[] = [];

      // Limit to 20 reports for performance
      for (const report of reports.slice(0, 20)) {
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

            const driftSpeed = calculateDriftSpeed(windSpeed, windDirection, currentVelocity, currentDirection);
            const drift24 = calculateDriftWithSpeed(report.lat, report.lng, windSpeed, windDirection, currentVelocity, currentDirection, 24);
            const drift48 = calculateDriftWithSpeed(report.lat, report.lng, windSpeed, windDirection, currentVelocity, currentDirection, 48);
            const drift72 = calculateDriftWithSpeed(report.lat, report.lng, windSpeed, windDirection, currentVelocity, currentDirection, 72);

            // Calculate urgency score (higher speed + recent report = higher urgency)
            const hoursSinceReport = (Date.now() - report.timestamp) / (1000 * 60 * 60);
            const urgency = Math.min(
              (driftSpeed.speedKmh * 10) + // Speed factor (0-50)
              (report.confidence * 30) + // Confidence factor (0-30)
              Math.max(0, 20 - hoursSinceReport / 24) // Recency factor (0-20)
            , 100);

            // Determine priority
            let priority: 'high' | 'medium' | 'low' = 'low';
            if (urgency > 60) priority = 'high';
            else if (urgency > 30) priority = 'medium';

            recs.push({
              report,
              driftSpeed: {
                speed: driftSpeed.speed,
                speedKmh: driftSpeed.speedKmh,
                direction: driftSpeed.direction,
              },
              predicted24h: {
                lat: drift24.lat,
                lng: drift24.lng,
                distance: drift24.distance,
              },
              predicted48h: {
                lat: drift48.lat,
                lng: drift48.lng,
                distance: drift48.distance,
              },
              predicted72h: {
                lat: drift72.lat,
                lng: drift72.lng,
                distance: drift72.distance,
              },
              priority,
              urgency,
            });
          }
        } catch (error) {
          console.error(`Error processing report ${report.id}:`, error);
        }
      }

      // Sort recommendations
      recs.sort((a, b) => {
        switch (sortBy) {
          case 'speed':
            return b.driftSpeed.speedKmh - a.driftSpeed.speedKmh;
          case 'distance':
            return (a.report.distance || 0) - (b.report.distance || 0);
          case 'urgency':
          default:
            return b.urgency - a.urgency;
        }
      });

      setRecommendations(recs);
      setLoading(false);
    };

    fetchDriftData();
  }, [reports, sortBy]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 border-red-500/50 text-red-700 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-400';
    }
  };

  const getUrgencyColor = (urgency: number) => {
    if (urgency > 60) return 'text-red-600 dark:text-red-400';
    if (urgency > 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-sm text-muted-foreground">Calculating drift speeds and cleanup recommendations...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">No drift data available. Enable drift analysis to see recommendations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted-foreground mb-2">Timeframe</label>
          <div className="flex gap-2">
            {[24, 48, 72].map((hours) => (
              <button
                key={hours}
                onClick={() => setSelectedTimeframe(hours as 24 | 48 | 72)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTimeframe === hours
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground border border-border hover:border-primary'
                }`}
              >
                {hours}h
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted-foreground mb-2">Sort By</label>
          <div className="flex gap-2">
            {[
              { value: 'urgency', label: 'Urgency' },
              { value: 'speed', label: 'Speed' },
              { value: 'distance', label: 'Distance' },
            ].map((sort) => (
              <button
                key={sort.value}
                onClick={() => setSortBy(sort.value as 'speed' | 'distance' | 'urgency')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sortBy === sort.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground border border-border hover:border-primary'
                }`}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
        {recommendations.map((rec, index) => {
          const predicted = selectedTimeframe === 24 ? rec.predicted24h : 
                           selectedTimeframe === 48 ? rec.predicted48h :
                           rec.predicted72h;

          return (
            <motion.div
              key={rec.report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer ${
                rec.priority === 'high' ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20' :
                rec.priority === 'medium' ? 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20' :
                'border-border bg-card'
              }`}
              onClick={() => {
                if (onLocationSelect) {
                  onLocationSelect(predicted.lat, predicted.lng);
                }
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-card-foreground capitalize">{rec.report.type}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-muted/50 rounded-lg p-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Wind className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">Drift Speed</span>
                      </div>
                      <div className="text-lg font-bold text-card-foreground">
                        {rec.driftSpeed.speedKmh.toFixed(2)} <span className="text-xs text-muted-foreground">km/h</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Direction: {rec.driftSpeed.direction.toFixed(1)}°
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">Urgency Score</span>
                      </div>
                      <div className={`text-lg font-bold ${getUrgencyColor(rec.urgency)}`}>
                        {rec.urgency.toFixed(0)}/100
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {rec.priority === 'high' ? 'Immediate action needed' :
                         rec.priority === 'medium' ? 'Plan within 48h' :
                         'Monitor and plan'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>Current: {rec.report.lat.toFixed(4)}, {rec.report.lng.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Navigation className="w-3 h-3" />
                      <span>
                        Predicted ({selectedTimeframe}h): {predicted.lat.toFixed(4)}, {predicted.lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Distance: {(predicted.distance / 1000).toFixed(2)} km in {selectedTimeframe}h</span>
                    </div>
                    {rec.report.distance && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>From you: {rec.report.distance.toFixed(1)} km</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className={`px-2 py-1 rounded text-xs font-bold ${getUrgencyColor(rec.urgency)}`}>
                    {rec.urgency.toFixed(0)}
                  </div>
                  {rec.report.confidence > 0.8 && (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-primary" />
                  <span className="text-muted-foreground">
                    <strong className="text-card-foreground">NGO Recommendation:</strong> Plan cleanup at predicted location 
                    ({selectedTimeframe}h) to intercept waste. Waste is moving at {rec.driftSpeed.speedKmh.toFixed(1)} km/h.
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

