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

      setError('');
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
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setError('');
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Could not get your location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
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

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const response = await fetch(`${apiUrl}/detect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: base64Data,
          });

          if (!response.ok) {
            throw new Error('Failed to classify image. Please ensure the ML service is running.');
          }

          const data: ClassificationResponse = await response.json();
          
          if (data.success && data.predictions) {
            // Show results immediately
            setResult(data.predictions);
            setShowResults(true);
            
            // Upload image and save to database
            const imageRef = storageRef(storage, `waste_images/${Date.now()}_${image.name}`);
            await uploadBytes(imageRef, image);
            const imageUrl = await getDownloadURL(imageRef);

            const topPrediction = Object.entries(data.predictions).sort(
              ([, a], [, b]) => b - a
            )[0];

            const reportData = {
              lat: location.lat,
              lng: location.lng,
              type: topPrediction[0],
              confidence: topPrediction[1],
              timestamp: Date.now(),
              imageUrl,
              predictions: data.predictions,
            };

            await push(dbRef(database, 'waste_reports'), reportData);
            setSuccess(true);
            
            // Call onSuccess callback after a delay
            setTimeout(() => {
              if (onSuccess) onSuccess();
            }, 2000);
          } else {
            throw new Error(data.error || 'Classification failed');
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
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
    setShowResults(false);
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {success ? (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-card-foreground mb-2">Waste Detected & Reported!</h2>
                  <p className="text-muted-foreground mb-6">Thank you for helping keep our oceans clean. The coordinates have been saved.</p>
                  
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
                      Detect Another
                    </button>
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-card-foreground mb-2">Detect Ocean Waste</h2>
                      <p className="text-muted-foreground">Upload an image to identify waste and save its location</p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-3">
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
                            <img
                              src={preview}
                              alt="Preview"
                              className="w-full h-64 object-cover rounded-lg border border-border"
                            />
                            
                            {/* Detection Results Overlay - Similar to image reference */}
                            {showResults && result && (
                              <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="absolute top-2 right-2 bg-background/95 dark:bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 max-w-xs shadow-lg"
                              >
                                <h4 className="text-xs font-semibold text-card-foreground mb-2">Detection Results:</h4>
                                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                                  {Object.entries(result)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([type, confidence]) => (
                                      <div
                                        key={type}
                                        className="text-xs font-mono text-card-foreground"
                                      >
                                        <span className="capitalize">{type}</span>
                                        <span className="text-muted-foreground"> (score = {confidence.toFixed(5)})</span>
                                      </div>
                                    ))}
                                </div>
                              </motion.div>
                            )}
                            
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-background text-foreground rounded-lg hover:bg-accent transition-colors"
                              >
                                Change Image
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setImage(null);
                                  setPreview('');
                                  setShowResults(false);
                                  setResult(null);
                                }}
                                className="px-4 py-2 bg-background text-foreground rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
                              >
                                <X className="w-4 h-4" />
                                Remove
                              </button>
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
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-64 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-accent transition-all"
                          >
                            <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                            <span className="text-muted-foreground font-medium">Click to upload image</span>
                            <span className="text-sm text-muted-foreground mt-1">PNG, JPG up to 10MB</span>
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-3">
                        Location (Required for saving coordinates)
                      </label>
                      <button
                        type="button"
                        onClick={getLocation}
                        className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all border ${
                          location
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-border hover:border-primary'
                        }`}
                      >
                        <MapPin className="w-5 h-5" />
                        {location
                          ? `Location captured (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`
                          : 'Get Current Location'}
                      </button>
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
                      className="w-full py-4 bg-primary rounded-lg font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                      whileHover={!loading && image && location ? { scale: 1.02 } : {}}
                      whileTap={!loading && image && location ? { scale: 0.98 } : {}}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          Detect & Save Waste
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

