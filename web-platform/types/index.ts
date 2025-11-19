import { User } from 'firebase/auth';

export interface WasteReport {
  id: string;
  lat: number;
  lng: number;
  type: string;
  confidence: number;
  timestamp: number;
  imageUrl?: string;
  distance?: number;
  predictions?: Record<string, number>;
}

export interface ClassificationResponse {
  success: boolean;
  predictions: Record<string, number>;
  top_prediction?: {
    label: string;
    confidence: number;
  };
  error?: string;
}

export type FilterType = 'all' | 'plastic' | 'glass' | 'metal' | 'paper' | 'cardboard' | 'trash';
export type SortType = 'distance' | 'confidence' | 'recent';

export type FirebaseUser = User | null;

