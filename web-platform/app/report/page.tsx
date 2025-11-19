'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, MapPin, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { ref as dbRef, push } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '@/lib/firebase';
import { ClassificationResponse } from '@/types';
import Link from 'next/link';

export default function ReportPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<Record<string, number> | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !location) {
      setError('Please select an image and enable location');
      return;
    }

    setLoading(true);
    setError('');
    
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
          try {
            response = await fetch(`${apiUrl}/detect`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/octet-stream' },
              body: base64Data,
              mode: 'cors',
            });
          } catch (fetchError) {
            // Network error (CORS, connection refused, etc.)
            const errorMsg = fetchError instanceof Error ? fetchError.message : 'Network error';
            if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
              throw new Error(
                'Cannot connect to ML service. Please ensure:\n' +
                '1. The backend service is running: python app.py\n' +
                '2. The service is accessible at http://localhost:5000\n' +
                '3. CORS is enabled in the backend\n\n' +
                'The report will still be saved to the database, but classification will be skipped.'
              );
            }
            throw new Error(`Connection error: ${errorMsg}`);
          }

          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            let errorMessage = `Failed to classify image (${response.status})`;
            if (response.status === 503) {
              errorMessage = 'ML service is not available. Please ensure the backend service is running on port 5000.';
            } else if (response.status === 400) {
              errorMessage = 'Invalid image data. Please try a different image.';
            } else {
              errorMessage = errorText || 'Please ensure the ML service is running.';
            }
            throw new Error(errorMessage);
          }

          const data: ClassificationResponse = await response.json();
          
          if (data.success && data.predictions) {
            let imageUrl: string | null = null;
            try {
              // Sanitize filename to avoid issues
              const sanitizedFileName = image.name
                .replace(/[^a-zA-Z0-9.-]/g, '_')
                .toLowerCase();
              const timestamp = Date.now();
              const imageRef = storageRef(storage, `waste_images/${timestamp}_${sanitizedFileName}`);
              
              // Upload with metadata
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
              console.error('Firebase Storage error:', storageError);
              // Continue without image URL - report will still be saved
            }

            const topPrediction = Object.entries(data.predictions).sort(
              ([, a], [, b]) => b - a
            )[0];

            const reportData = {
              lat: location.lat,
              lng: location.lng,
              type: topPrediction[0],
              confidence: topPrediction[1],
              timestamp: Date.now(),
              imageUrl: imageUrl || null,
              predictions: data.predictions,
              ...(imageUrl ? {} : { storageError: 'Image upload failed, but report was saved' }),
            };

            await push(dbRef(database, 'waste_reports'), reportData);
            setResult(data.predictions);
            setSuccess(true);
            
            if (!imageUrl) {
              // Show warning but don't block success
              console.warn('Report saved but image upload failed. Check Firebase Storage configuration.');
            }
          } else {
            throw new Error(data.error || 'Classification failed');
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
          console.error('Report submission error:', err);
          
          // If it's a network error, still try to save a basic report
          if (errorMessage.includes('Cannot connect to ML service') || errorMessage.includes('Connection error')) {
            try {
              let imageUrl: string | null = null;
              try {
                const sanitizedFileName = image.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
                const timestamp = Date.now();
                const imageRef = storageRef(storage, `waste_images/${timestamp}_${sanitizedFileName}`);
                await uploadBytes(imageRef, image, {
                  contentType: image.type || 'image/jpeg',
                });
                imageUrl = await getDownloadURL(imageRef);
              } catch (storageErr) {
                console.error('Storage error:', storageErr);
              }
              
              // Save report without classification
              const reportData = {
                lat: location.lat,
                lng: location.lng,
                type: 'unknown',
                confidence: 0,
                timestamp: Date.now(),
                imageUrl: imageUrl,
                predictions: {},
                error: 'ML service unavailable - report saved without classification',
              };
              
              await push(dbRef(database, 'waste_reports'), reportData);
              setError('Report saved, but ML classification failed. Please check backend service.');
              setSuccess(true);
              return;
            } catch (saveErr) {
              console.error('Failed to save report:', saveErr);
            }
          }
          
          setError(errorMessage);
        } finally {
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
    setShowManualAddress(false);
    setManualAddress('');
    setLoading(false);
    // Clear file input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">Report Submitted!</h2>
          <p className="text-muted-foreground mb-6">Thank you for helping keep our oceans clean.</p>
          
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

          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex-1 py-3 bg-muted border border-border rounded-lg text-card-foreground font-semibold hover:bg-accent transition-colors"
            >
              Report Another
            </button>
            <Link href="/dashboard" className="flex-1">
              <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all">
                View Dashboard
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4">
      <div className="max-w-2xl mx-auto py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-4 sm:p-6 lg:p-8"
        >
          <div className="mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">Report Ocean Waste</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Help us track and clean ocean pollution with AI-powered detection</p>
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
                        onError={(e) => {
                          console.error('Image load error');
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    </div>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3 z-10">
                      <motion.button
                        type="button"
                        onClick={() => {
                          // Reset states when changing image
                          setSuccess(false);
                          setResult(null);
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
                          setSuccess(false);
                          setResult(null);
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
                Location
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
                  Submit Report
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
