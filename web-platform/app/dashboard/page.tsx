'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, TrendingUp, Package, Wind, Search, 
  Clock, CheckCircle2, SlidersHorizontal, Filter
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { calculateDistance } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { WasteReport, FilterType, SortType, FirebaseUser } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';

const WasteMap = dynamic(() => import('@/components/WasteMap'), { ssr: false });

export default function DashboardPage() {
  const [user, setUser] = useState<FirebaseUser>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<WasteReport[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>([20.5937, 78.9629]);
  const [showDrift, setShowDrift] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('distance');
  const [showFilters, setShowFilters] = useState(false);
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.log('Geolocation error:', error)
      );
    }
  }, []);

  useEffect(() => {
    const reportsRef = ref(database, 'waste_reports');
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reportsArray: WasteReport[] = Object.entries(data).map(([id, report]: [string, unknown]) => {
          const reportData = report as Omit<WasteReport, 'id' | 'distance'>;
          return {
            id,
            lat: reportData.lat || 0,
            lng: reportData.lng || 0,
            type: reportData.type || 'unknown',
            confidence: reportData.confidence || 0,
            timestamp: reportData.timestamp || Date.now(),
            imageUrl: reportData.imageUrl,
            distance: calculateDistance(userLocation[0], userLocation[1], reportData.lat || 0, reportData.lng || 0),
          };
        });
        
        reportsArray.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setReports(reportsArray);
      } else {
        setReports([]);
      }
    });

    return () => unsubscribe();
  }, [userLocation]);

  useEffect(() => {
    let filtered = [...reports];

    if (searchQuery) {
      filtered = filtered.filter(report => 
        report.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(report => report.type.toLowerCase() === filterType);
    }

    switch (sortType) {
      case 'distance':
        filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'confidence':
        filtered.sort((a, b) => b.confidence - a.confidence);
        break;
      case 'recent':
        filtered.sort((a, b) => b.timestamp - a.timestamp);
        break;
    }

    setFilteredReports(filtered);
  }, [reports, searchQuery, filterType, sortType]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const stats = [
    { 
      label: 'Total Reports', 
      value: reports.length, 
      icon: Package,
      change: '+12% from last month',
      gradient: 'from-blue-50 to-indigo-50 dark:from-blue-400 dark:to-blue-950',
      iconGradient: 'from-blue-500 to-indigo-600',
    },
    { 
      label: 'Nearby', 
      value: reports.filter(r => (r.distance || 0) < 50).length, 
      icon: MapPin,
      change: 'Within 50km radius',
      gradient: 'from-green-50 to-emerald-50 dark:from-green-400 dark:to-emerald-950',
      iconGradient: 'from-green-500 to-emerald-600',
    },
    { 
      label: 'High Confidence', 
      value: reports.filter(r => r.confidence > 0.8).length, 
      icon: TrendingUp,
      change: 'Above 80% accuracy',
      gradient: 'from-purple-50 to-purple-100 dark:from-purple-400 dark:to-purple-950',
      iconGradient: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Active',
      value: Math.floor(reports.length * 0.3),
      icon: Package,
      change: 'Ongoing cleanups',
      gradient: 'from-orange-50 to-orange-100 dark:from-orange-400 dark:to-orange-950',
      iconGradient: 'from-orange-500 to-red-500',
    }
  ];

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar userEmail={user?.email || undefined} onLogout={handleLogout} />

      <div className="flex-1 lg:ml-72">
        <div className="space-y-6 min-h-screen py-4 px-2 md:px-10">
          {/* Header with Breadcrumb */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-2xl text-foreground">Dashboard</h1>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Overview</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          <Separator />

          {/* Stats Cards with Gradient Borders */}
          <div className="space-y-5">
            <div className="p-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-700 dark:to-zinc-800 rounded-xl">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Waste Reports Overview
                  </CardTitle>
                  <CardDescription>Key statistics and metrics</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                      <Card
                        key={index}
                        className={`border-none hover:shadow-xl transition-all duration-300 py-3 bg-gradient-to-br ${stat.gradient}`}
                      >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                          <div className={`h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br ${stat.iconGradient} text-white`}>
                            <stat.icon className="h-5 w-5" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                showFilters || filterType !== 'all' || sortType !== 'distance'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-card-foreground border border-border hover:border-primary'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </motion.button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-card border border-border rounded-lg p-5 space-y-4"
              >
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">Filter by Type</p>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'plastic', 'glass', 'metal', 'paper', 'cardboard', 'trash'] as FilterType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                          filterType === type
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background text-muted-foreground border border-border hover:border-primary'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">Sort by</p>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { value: 'distance', label: 'Distance' },
                      { value: 'confidence', label: 'Confidence' },
                      { value: 'recent', label: 'Recent' }
                    ] as { value: SortType; label: string }[]).map((sort) => (
                      <button
                        key={sort.value}
                        onClick={() => setSortType(sort.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          sortType === sort.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background text-muted-foreground border border-border hover:border-primary'
                        }`}
                      >
                        {sort.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Map Section */}
            <div className="p-0.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-zinc-700 dark:to-zinc-800 rounded-xl">
              <Card className="border-0 shadow-sm h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Waste Locations
                  </CardTitle>
                  <CardDescription>
                    {filteredReports.length} {filteredReports.length === 1 ? 'location' : 'locations'} on map
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1" />
                    <button
                      onClick={() => setShowDrift(!showDrift)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                        showDrift
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground border border-border hover:border-primary'
                      }`}
                    >
                      <Wind className="w-3.5 h-3.5" />
                      {showDrift ? 'Hide' : 'Show'} Drift
                    </button>
                  </div>
                  <div className="h-[500px] rounded-lg overflow-hidden border border-border">
                    <WasteMap reports={filteredReports} center={userLocation} showDrift={showDrift} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reports List */}
            <div className="p-0.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-zinc-700 dark:to-zinc-800 rounded-xl">
              <Card className="border-0 shadow-sm h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Recent Reports
                  </CardTitle>
                  <CardDescription>Sorted by {sortType}</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {filteredReports.length === 0 ? (
                      <div className="p-8 text-center">
                        <Package className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-1">No reports found</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
                      </div>
                    ) : (
                      filteredReports.slice(0, 10).map((report, index) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="group bg-muted border border-border rounded-lg p-4 hover:border-primary transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-card-foreground text-sm capitalize">{report.type}</h3>
                                <span className="px-2 py-0.5 rounded text-xs font-medium border border-border bg-background text-muted-foreground">
                                  {report.type}
                                </span>
                              </div>
                              {report.imageUrl && (
                                <div className="mb-2 rounded-lg overflow-hidden border border-border">
                                  <img
                                    src={report.imageUrl}
                                    alt={report.type}
                                    className="w-full h-20 object-cover"
                                  />
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded border border-border">
                              {report.distance ? `${report.distance.toFixed(1)} km` : 'N/A'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{report.lat.toFixed(3)}, {report.lng.toFixed(3)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {getTimeAgo(report.timestamp)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {report.confidence > 0.8 && (
                                <CheckCircle2 className="w-3 h-3 text-primary" />
                              )}
                              <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                                report.confidence > 0.8
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : report.confidence > 0.6
                                  ? 'bg-muted text-card-foreground border-border'
                                  : 'bg-muted text-muted-foreground border-border'
                              }`}>
                                {(report.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
