'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, MapPin, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { ref as dbRef, push } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '@/lib/firebase';
import { ClassificationResponse } from '@/types';

interface WasteDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WasteDetectionModal({ isOpen, onClose, onSuccess }: WasteDetectionModalProps) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showManualAddress, setShowManualAddress] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [geocodingLocation, setGeocodingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Reset all states when changing image to allow new detection
      setError('');
      setSuccess(false);
      setResult(null);
      setShowResults(false);
      setLoading(false);
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      setError('');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setShowManualAddress(false);
          setError('');
        },
        (error) => {
          // Don't log to console to avoid cluttering
          setShowManualAddress(true);
          setError('Could not get your location. Please enter an address manually.');
        },
        {
          timeout: 5000,
          enableHighAccuracy: false
        }
      );
    } else {
      setShowManualAddress(true);
      setError('Geolocation is not supported by your browser. Please enter an address manually.');
    }
  };

  const geocodeAddress = async () => {
    if (!manualAddress.trim()) {
      setError('Please enter an address');
      return;
    }

    setGeocodingLocation(true);
    setError('');

    try {
      // Using Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}&limit=1`,
        {
          headers: {
            'User-Agent': 'OceanCleanup-Connect/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        setLocation({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        });
        setShowManualAddress(false);
        setError('');
      } else {
        throw new Error('Address not found. Please try a more specific address.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to geocode address. Please try again.';
      setError(errorMessage);
    } finally {
      setGeocodingLocation(false);
    }
  };

  // Helper function to save report to localStorage
  const saveToLocalStorage = (reportData: any) => {
    try {
      const existingReports = JSON.parse(localStorage.getItem('waste_reports') || '[]');
      const newReport = {
        ...reportData,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      existingReports.push(newReport);
      localStorage.setItem('waste_reports', JSON.stringify(existingReports));
      return true;
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !location) {
      setError('Please select an image and enable location');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];

          // Automatically use the same hostname as frontend (works from any IP)
          const apiUrl = typeof window !== 'undefined' 
            ? (process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`)
            : 'http://localhost:5000';
          
          let response;
          let predictions: Record<string, number> | null = null;
          let topPrediction: [string, number] | null = null;
          
          try {
            response = await fetch(`${apiUrl}/detect`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/octet-stream' },
              body: base64Data,
              mode: 'cors',
            });

            if (response.ok) {
              const data: ClassificationResponse = await response.json();
              if (data.success && data.predictions) {
                predictions = data.predictions;
                topPrediction = Object.entries(data.predictions).sort(
                  ([, a], [, b]) => b - a
                )[0] as [string, number];
                // Show results immediately
                setResult(predictions);
                setShowResults(true);
              }
            }
          } catch (fetchError) {
            // Network error - continue without ML classification
            console.warn('ML service unavailable, saving report without classification');
          }

          // Upload image and save to database (with localStorage fallback)
          let imageUrl: string | null = null;
          let savedToFirebase = false;
          let savedToLocalStorage = false;

          // Try Firebase Storage
          try {
            const sanitizedFileName = image.name
              .replace(/[^a-zA-Z0-9.-]/g, '_')
              .toLowerCase();
            const timestamp = Date.now();
            const imageRef = storageRef(storage, `waste_images/${timestamp}_${sanitizedFileName}`);
            
            const metadata = {
              contentType: image.type || 'image/jpeg',
              customMetadata: {
                uploadedAt: timestamp.toString(),
                originalName: image.name,
              }
            };
            
            await uploadBytes(imageRef, image, metadata);
            imageUrl = await getDownloadURL(imageRef);
          } catch (storageError) {
            console.warn('Firebase Storage error, using base64 preview:', storageError);
            // Use base64 preview as fallback
            imageUrl = preview;
          }

          const reportData = {
            lat: location.lat,
            lng: location.lng,
            type: topPrediction ? topPrediction[0] : 'unknown',
            confidence: topPrediction ? topPrediction[1] : 0,
            timestamp: Date.now(),
            imageUrl: imageUrl || preview,
            predictions: predictions || {},
            ...(predictions ? {} : { error: 'ML service unavailable - report saved without classification' }),
          };

          // Try Firebase first
          try {
            await push(dbRef(database, 'waste_reports'), reportData);
            savedToFirebase = true;
          } catch (firebaseError) {
            console.warn('Firebase save failed, using localStorage:', firebaseError);
          }

          // Always save to localStorage as backup
          savedToLocalStorage = saveToLocalStorage(reportData);

          if (savedToFirebase || savedToLocalStorage) {
            setSuccess(true);
            setLoading(false);
            
            // Call onSuccess callback after a delay
            setTimeout(() => {
              if (onSuccess) onSuccess();
            }, 2000);
          } else {
            throw new Error('Failed to save report to both Firebase and localStorage');
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
          console.error('Waste detection error:', err);
          setError(errorMessage);
          setLoading(false);
        }
      };
      reader.readAsDataURL(image);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setImage(null);
    setPreview('');
    setResult(null);
    setLocation(null);
    setError('');
    setShowResults(false);
    setShowManualAddress(false);
    setManualAddress('');
    setLoading(false);
    // Clear file input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              {success ? (
                <div className="p-4 sm:p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-2">Waste Detected & Reported!</h2>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Thank you for helping keep our oceans clean. The coordinates have been saved.</p>
                  
                  {result && (
                    <div className="mb-6 text-left">
                      <h3 className="text-sm font-semibold text-card-foreground mb-3">AI Classification Results:</h3>
                      <div className="space-y-2">
                        {Object.entries(result)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 3)
                          .map(([type, confidence], index) => (
                            <motion.div
                              key={type}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + index * 0.1 }}
                              className="flex items-center justify-between p-3 bg-muted border border-border rounded-lg"
                            >
                              <span className="text-card-foreground capitalize font-medium">{type}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${confidence * 100}%` }}
                                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                    className="h-full bg-primary"
                                  />
                                </div>
                                <span className="text-card-foreground font-semibold text-sm w-12 text-right">
                                  {(confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={resetForm}
                      className="flex-1 py-2.5 sm:py-3 bg-muted border border-border rounded-lg text-card-foreground font-semibold hover:bg-accent transition-colors text-sm sm:text-base"
                    >
                      Detect Another
                    </button>
                    <button
                      onClick={handleClose}
                      className="flex-1 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all text-sm sm:text-base"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-1 sm:mb-2">Detect Ocean Waste</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">Upload an image to identify waste and save its location</p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-card-foreground mb-2 sm:mb-3">
                        Upload Waste Image
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      
                      <AnimatePresence mode="wait">
                        {preview ? (
                          <motion.div
                            key="preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative group"
                          >
                            <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden border-2 border-border shadow-lg bg-muted">
                              <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-contain"
                                style={{ 
                                  imageRendering: 'auto' as const,
                                }}
                                onError={(e) => {
                                  console.error('Image load error');
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                            </div>
                            
                            {/* Detection Results Overlay - Fully opaque with better styling */}
                            {showResults && result && (
                              <motion.div
                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ type: 'spring', damping: 20 }}
                                className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-card/95 backdrop-blur-md border-2 border-primary/40 rounded-xl p-3 sm:p-4 max-w-[280px] sm:max-w-sm shadow-2xl z-20"
                                style={{ 
                                  backgroundColor: 'hsl(var(--card) / 0.95)',
                                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
                                }}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-bold text-card-foreground flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-primary" />
                                    AI Detection Results
                                  </h4>
                                  <button
                                    onClick={() => setShowResults(false)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                                  {Object.entries(result)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([type, confidence], index) => {
                                      const percentage = (confidence * 100).toFixed(1);
                                      const isTop = index === 0;
                                      return (
                                        <motion.div
                                          key={type}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: index * 0.05 }}
                                          className={`p-2.5 rounded-lg border ${
                                            isTop
                                              ? 'bg-primary/10 border-primary/50'
                                              : 'bg-muted/50 border-border'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className={`text-sm font-semibold capitalize ${
                                              isTop ? 'text-primary' : 'text-card-foreground'
                                            }`}>
                                              {type}
                                            </span>
                                            <span className={`text-xs font-bold ${
                                              isTop ? 'text-primary' : 'text-muted-foreground'
                                            }`}>
                                              {percentage}%
                                            </span>
                                          </div>
                                          <div className="w-full h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                                            <motion.div
                                              initial={{ width: 0 }}
                                              animate={{ width: `${percentage}%` }}
                                              transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
                                              className={`h-full rounded-full ${
                                                isTop ? 'bg-primary' : 'bg-primary/60'
                                              }`}
                                            />
                                          </div>
                                          <div className="text-xs text-muted-foreground mt-1 font-mono">
                                            Score: {confidence.toFixed(5)}
                                          </div>
                                        </motion.div>
                                      );
                                    })}
                                </div>
                              </motion.div>
                            )}
                            
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3 z-10">
                              <motion.button
                                type="button"
                                onClick={() => {
                                  // Reset states when changing image
                                  setSuccess(false);
                                  setResult(null);
                                  setShowResults(false);
                                  setError('');
                                  setLoading(false);
                                  fileInputRef.current?.click();
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all font-medium shadow-lg"
                              >
                                Change Image
                              </motion.button>
                              <motion.button
                                type="button"
                                onClick={() => {
                                  setImage(null);
                                  setPreview('');
                                  setShowResults(false);
                                  setResult(null);
                                  setSuccess(false);
                                  setError('');
                                  setLoading(false);
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2.5 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-all font-medium shadow-lg flex items-center gap-2"
                              >
                                <X className="w-4 h-4" />
                                Remove
                              </motion.button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.button
                            key="upload"
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full h-64 sm:h-80 lg:h-96 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:border-primary hover:bg-accent/50 transition-all p-6 sm:p-8 bg-gradient-to-br from-muted/50 to-muted"
                          >
                            <div className="p-4 rounded-full bg-primary/10 mb-4">
                              <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                            </div>
                            <span className="text-sm sm:text-base text-foreground font-semibold text-center mb-2">Click to upload image</span>
                            <span className="text-xs sm:text-sm text-muted-foreground text-center">PNG, JPG, WEBP up to 10MB</span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground/70 text-center mt-2">High quality images recommended</span>
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-card-foreground mb-2 sm:mb-3">
                        Location (Required for saving coordinates)
                      </label>
                      
                      {!location && (
                        <button
                          type="button"
                          onClick={getLocation}
                          className="w-full px-4 py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all border bg-background text-foreground border-border hover:border-primary mb-2 sm:mb-3 text-sm sm:text-base"
                        >
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                          Get Current Location
                        </button>
                      )}

                      {location && (
                        <div className="mb-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="text-sm text-card-foreground font-medium">
                                Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setLocation(null);
                                setShowManualAddress(false);
                                setManualAddress('');
                              }}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Manual Address Input */}
                      {showManualAddress && !location && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                          <div>
                            <label className="block text-xs text-muted-foreground mb-2">
                              Enter address (e.g., "Mumbai, India" or "Beach Road, Goa")
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={manualAddress}
                                onChange={(e) => setManualAddress(e.target.value)}
                                placeholder="Enter address or location name"
                                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    geocodeAddress();
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={geocodeAddress}
                                disabled={geocodingLocation || !manualAddress.trim()}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {geocodingLocation ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Finding...
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="w-4 h-4" />
                                    Find
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg flex items-start gap-3"
                        >
                          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                          <p className="text-destructive text-sm">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={!image || !location || loading}
                      className="w-full py-3 sm:py-4 bg-primary rounded-lg font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90 transition-all text-sm sm:text-base"
                      whileHover={!loading && image && location ? { scale: 1.02 } : {}}
                      whileTap={!loading && image && location ? { scale: 0.98 } : {}}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="hidden sm:inline">Detect & Save Waste</span>
                          <span className="sm:hidden">Detect Waste</span>
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

