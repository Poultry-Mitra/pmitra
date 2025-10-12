
export type UserRole = 'farmer' | 'dealer' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  dateJoined: string;
  avatarUrl?: string;
};

export type FarmMetric = {
  month: string;
  productionRate: number; // percentage
  mortalityRate: number; // percentage
  feedConsumption: number; // grams per bird per day
};

export type SensorData = {
  id: string;
  location: string; // e.g., "Coop A-1"
  temperature: number; // Celsius
  humidity: number; // percentage
  ammonia: number; // ppm
  timestamp: string; // ISO 8601 format
};

export type FarmAlert = {
  id: string;
  type: 'critical' | 'warning';
  message: string;
  timestamp: string; // ISO 8601 format
};

export type DailyRates = {
    readyBird: {
        small: number;
        medium: number;
        big: number;
    },
    chickRate: number;
    feedCostIndex: number;
    lastUpdated: string;
    location: {
        state: string;
        district: string;
    }
}
