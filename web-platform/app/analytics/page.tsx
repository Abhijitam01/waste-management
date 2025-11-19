'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Package } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { WasteReport, FirebaseUser } from '@/types';

export default function AnalyticsPage() {
  const [user, setUser] = useState<FirebaseUser>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<WasteReport[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const reportsRef = ref(database, 'waste_reports');
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reportsArray: WasteReport[] = Object.entries(data).map(([id, report]: [string, unknown]) => {
          const reportData = report as Omit<WasteReport, 'id'>;
          return {
            id,
            ...reportData,
          };
        });
        setReports(reportsArray);
      } else {
        setReports([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  const wasteByType = reports.reduce((acc: Record<string, number>, report: WasteReport) => {
    acc[report.type] = (acc[report.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalReports = reports.length;
  const avgConfidence = reports.length > 0
    ? (reports.reduce((sum, r) => sum + (r.confidence || 0), 0) / reports.length * 100).toFixed(1)
    : 0;

  const recentReports = reports
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 7);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar userEmail={user?.email || undefined} onLogout={handleLogout} />

      <div className="flex-1 lg:ml-72 p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Insights</h1>
          <p className="text-muted-foreground mb-8">Track waste collection trends and statistics</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-lg bg-card border border-border"
            >
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-5 h-5 text-primary" />
                <p className="text-muted-foreground text-sm">Total Reports</p>
              </div>
              <p className="text-4xl font-bold text-card-foreground">{totalReports}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-lg bg-card border border-border"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <p className="text-muted-foreground text-sm">Avg Confidence</p>
              </div>
              <p className="text-4xl font-bold text-card-foreground">{avgConfidence}%</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-lg bg-card border border-border"
            >
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <p className="text-muted-foreground text-sm">Waste Types</p>
              </div>
              <p className="text-4xl font-bold text-card-foreground">{Object.keys(wasteByType).length}</p>
            </motion.div>
          </div>

          {/* Waste Distribution */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-lg p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-card-foreground mb-6">Waste Distribution by Type</h2>
            <div className="space-y-4">
              {Object.entries(wasteByType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count], index) => {
                  const percentage = ((count / totalReports) * 100).toFixed(1);
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-card-foreground capitalize font-medium">{type}</span>
                        <span className="text-muted-foreground">{count} ({percentage}%)</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                          className="h-full bg-primary"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold text-card-foreground mb-6">Recent Activity</h2>
            <div className="space-y-3">
              {recentReports.map((report, index) => (
                <motion.div
                  key={report.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-muted border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <div>
                      <p className="text-card-foreground font-medium capitalize">{report.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.timestamp ? new Date(report.timestamp).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded-full">
                    {((report.confidence || 0) * 100).toFixed(0)}%
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
