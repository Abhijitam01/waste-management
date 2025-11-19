'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, TrendingUp, Package, Wind, Search, 
  Clock, CheckCircle2, SlidersHorizontal, Filter, Camera, Navigation
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { calculateDistance } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import WasteDetectionModal from '@/components/WasteDetectionModal';
import NGOCleanupPlanner from '@/components/NGOCleanupPlanner';
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
  const [showDetectionModal, setShowDetectionModal] = useState(false);
  const [showNGOPPlanner, setShowNGOPPlanner] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const plannerRef = useRef<HTMLDivElement>(null);
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
        (error) => {
          // Silently fail - use default location (India center)
          // User can still use the map without their exact location
          console.debug('Geolocation not available, using default location');
        },
        {
          timeout: 5000,
          enableHighAccuracy: false
        }
      );
    }
  }, []);

  // Helper function to load reports from localStorage
  const loadFromLocalStorage = (): WasteReport[] => {
    try {
      const localData = localStorage.getItem('waste_reports');
      if (localData) {
        const localReports = JSON.parse(localData);
        return localReports.map((report: any) => ({
          id: report.id || `local_${Date.now()}`,
          lat: report.lat || 0,
          lng: report.lng || 0,
          type: report.type || 'unknown',
          confidence: report.confidence || 0,
          timestamp: report.timestamp || Date.now(),
          imageUrl: report.imageUrl,
          distance: calculateDistance(userLocation[0], userLocation[1], report.lat || 0, report.lng || 0),
        }));
      }
    } catch (err) {
      console.error('Failed to load from localStorage:', err);
    }
    return [];
  };

  useEffect(() => {
    // Load from localStorage first (immediate display)
    const localReports = loadFromLocalStorage();
    if (localReports.length > 0) {
      localReports.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setReports(localReports);
    }

    // Then try to load from Firebase
    const reportsRef = ref(database, 'waste_reports');
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      const allReports: WasteReport[] = [];
      
      // Add Firebase reports
      if (data) {
        const firebaseReports: WasteReport[] = Object.entries(data).map(([id, report]: [string, unknown]) => {
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
        allReports.push(...firebaseReports);
      }
      
      // Add localStorage reports (avoid duplicates)
      const localReports = loadFromLocalStorage();
      const firebaseIds = new Set(allReports.map(r => r.id));
      const uniqueLocalReports = localReports.filter(r => !firebaseIds.has(r.id));
      allReports.push(...uniqueLocalReports);
      
      // Remove duplicates and sort
      const uniqueReports = Array.from(
        new Map(allReports.map(r => [r.id, r])).values()
      );
      uniqueReports.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setReports(uniqueReports);
    }, (error) => {
      // If Firebase fails, just use localStorage
      console.warn('Firebase read failed, using localStorage only:', error);
      const localReports = loadFromLocalStorage();
      if (localReports.length > 0) {
        localReports.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setReports(localReports);
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

      <div className="flex-1 lg:ml-72 transition-all duration-300">
        <div className="space-y-6 min-h-screen py-4 px-2 md:px-10">
          {/* Header with Breadcrumb */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-xl sm:text-2xl text-foreground">Dashboard</h1>
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDetectionModal(true)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg text-sm sm:text-base"
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Detect Waste Now</span>
              <span className="xs:hidden">Detect</span>
            </motion.button>
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
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {stats.map((stat, index) => (
                      <Card
                        key={index}
                        className={`border-none hover:shadow-xl transition-all duration-300 py-2 sm:py-3 bg-gradient-to-br ${stat.gradient}`}
                      >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6">
                          <CardTitle className="text-xs sm:text-sm font-medium truncate pr-1">{stat.label}</CardTitle>
                          <div className={`h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-gradient-to-br ${stat.iconGradient} text-white flex-shrink-0`}>
                            <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                          <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-1">{stat.change}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-background border border-input rounded-lg text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                showFilters || filterType !== 'all' || sortType !== 'distance'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-card-foreground border border-border hover:border-primary'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Filters</span>
            </motion.button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4"
              >
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 sm:mb-3">Filter by Type</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {(['all', 'plastic', 'glass', 'metal', 'paper', 'cardboard', 'trash'] as FilterType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
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
                  <p className="text-xs font-medium text-muted-foreground mb-2 sm:mb-3">Sort by</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {([
                      { value: 'distance', label: 'Distance' },
                      { value: 'confidence', label: 'Confidence' },
                      { value: 'recent', label: 'Recent' }
                    ] as { value: SortType; label: string }[]).map((sort) => (
                      <button
                        key={sort.value}
                        onClick={() => setSortType(sort.value)}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Map Section */}
            <div className="p-0.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-zinc-700 dark:to-zinc-800 rounded-xl order-2 lg:order-1">
              <Card className="border-0 shadow-sm h-full">
                <CardHeader className="pb-2 px-3 sm:px-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                        <span className="truncate">Waste Locations</span>
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {filteredReports.length} {filteredReports.length === 1 ? 'location' : 'locations'} on map
                      </CardDescription>
                    </div>
                    <button
                      onClick={() => setShowDrift(!showDrift)}
                      className={`ml-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${
                        showDrift
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground border border-border hover:border-primary'
                      }`}
                    >
                      <Wind className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{showDrift ? 'Hide' : 'Show'} Drift</span>
                      <span className="sm:hidden">{showDrift ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 px-3 sm:px-6">
                  <div className="h-[300px] sm:h-[400px] lg:h-[500px] rounded-lg overflow-hidden border border-border">
                    <WasteMap 
                      reports={filteredReports} 
                      center={mapCenter || userLocation} 
                      showDrift={showDrift} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reports List */}
            <div className="p-0.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-zinc-700 dark:to-zinc-800 rounded-xl order-1 lg:order-2">
              <Card className="border-0 shadow-sm h-full">
                <CardHeader className="pb-2 px-3 sm:px-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Recent Reports
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Sorted by {sortType}</CardDescription>
                </CardHeader>
                <CardContent className="pb-4 px-3 sm:px-6">
                  <div className="space-y-2 max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto custom-scrollbar">
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
                          onClick={() => {
                            setMapCenter([report.lat, report.lng]);
                            setShowDrift(false); // Reset drift when clicking a report
                          }}
                          className="group bg-muted border border-border rounded-lg p-3 sm:p-4 hover:border-primary transition-all cursor-pointer active:scale-[0.98]"
                        >
                          <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                                <h3 className="font-semibold text-card-foreground text-xs sm:text-sm capitalize truncate">{report.type}</h3>
                                <span className="px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium border border-border bg-background text-muted-foreground flex-shrink-0">
                                  {report.type}
                                </span>
                              </div>
                              {report.imageUrl && (
                                <div className="mb-2 rounded-lg overflow-hidden border border-border">
                                  <img
                                    src={report.imageUrl}
                                    alt={report.type}
                                    className="w-full h-16 sm:h-20 object-cover"
                                  />
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground bg-background px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-border flex-shrink-0">
                              {report.distance ? `${report.distance.toFixed(1)} km` : 'N/A'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">
                            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                            <span className="truncate">{report.lat.toFixed(3)}, {report.lng.toFixed(3)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                              <span>{getTimeAgo(report.timestamp)}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                              {report.confidence > 0.8 && (
                                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                              )}
                              <span className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded border ${
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

          {/* NGO Cleanup Planner Section */}
          <AnimatePresence>
            {showNGOPPlanner && (
              <motion.div
                ref={plannerRef}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-700 dark:to-zinc-800 rounded-xl"
              >
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Navigation className="h-5 w-5 text-primary" />
                          NGO Cleanup Planner
                        </CardTitle>
                        <CardDescription>
                          Calculate drift speeds and plan optimal cleanup locations based on wind conditions
                        </CardDescription>
                      </div>
                      <button
                        onClick={() => setShowNGOPPlanner(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-background text-muted-foreground border border-border hover:border-primary transition-all"
                      >
                        Hide Planner
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <NGOCleanupPlanner
                      reports={reports}
                      onLocationSelect={(lat, lng) => {
                        setMapCenter([lat, lng]);
                        setShowDrift(true);
                      }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show NGO Planner Button */}
          {!showNGOPPlanner && (
            <div className="space-y-4">
              <div className="p-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-700 dark:to-zinc-800 rounded-xl">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-primary" />
                      For NGOs: Cleanup Planning Tools
                    </CardTitle>
                    <CardDescription>
                      View all waste reports with drift analysis to plan efficient cleanup operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                      <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
                        <h3 className="font-semibold text-sm sm:text-base text-card-foreground mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                          <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                          <span>Drift Analysis</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                          See how waste moves based on wind and ocean currents. Click "Show Drift" on the map above.
                        </p>
                        <button
                          onClick={() => setShowDrift(!showDrift)}
                          className={`w-full px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                            showDrift
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background text-muted-foreground border border-border hover:border-primary'
                          }`}
                        >
                          <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{showDrift ? 'Hide' : 'Show'} Drift Analysis</span>
                          <span className="sm:hidden">{showDrift ? 'Hide' : 'Show'} Drift</span>
                        </button>
                      </div>
                      <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
                        <h3 className="font-semibold text-sm sm:text-base text-card-foreground mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                          <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                          <span>Cleanup Planner</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                          Get prioritized cleanup recommendations with drift speeds and predicted locations.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShowNGOPPlanner(true);
                            // Smooth scroll to planner after it opens
                            setTimeout(() => {
                              plannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 300);
                          }}
                          className="w-full px-2.5 sm:px-3 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-1.5 sm:gap-2 hover:opacity-90 transition-all text-xs sm:text-sm"
                        >
                          <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Open Cleanup Planner</span>
                          <span className="sm:hidden">Open Planner</span>
                        </motion.button>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-primary/10 border border-primary/30 rounded-lg">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        <strong className="text-card-foreground">Total Reports:</strong> {reports.length} locations
                        {reports.length > 0 && (
                          <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0">
                            • {reports.filter(r => r.confidence > 0.8).length} high confidence
                            • {reports.filter(r => (r.distance || 0) < 50).length} within 50km
                          </span>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Waste Detection Modal */}
      <WasteDetectionModal
        isOpen={showDetectionModal}
        onClose={() => setShowDetectionModal(false)}
        onSuccess={() => {
          // Refresh reports after successful detection
          setShowDetectionModal(false);
          // The reports will automatically update via Firebase listener
        }}
      />
    </div>
  );
}
