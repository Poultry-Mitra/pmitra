

import { Timestamp } from "firebase/firestore";

export type UserRole = 'farmer' | 'dealer' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  dateJoined: string;
  avatarUrl?: string;
};

export type Batch = {
  id: string;
  farmerUID: string;
  batchName: string;
  batchType: "Broiler" | "Layer";
  totalChicks: number;
  batchStartDate: string;
  feedPhase: "Pre-Starter" | "Starter" | "Finisher";
  mortalityCount: number;
  avgBodyWeight: number; // in grams
  feedConsumed: number; // in kg
  dealerUID?: string;
  status: 'Active' | 'Completed' | 'Planned';
  createdAt?: Timestamp;
};

export type InventoryItem = {
    id: string;
    farmerUID: string;
    dealerUID?: string;
    productName: string;
    category: "Feed" | "Medicine";
    stockQuantity: number;
    unit: "kg" | "grams" | "liters" | "ml" | "units";
    lowStockThreshold: number;
    lastUpdated: Timestamp;
}

export type LedgerEntry = {
  id: string;
  farmerUID: string;
  dealerUID?: string;
  batchId?: string;
  type: "Debit" | "Credit";
  description: string;
  amount: number;
  balanceAfter: number;
  date: string; // ISO 8601 format
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

export type PricingPlan = {
    name: string;
    price: string;
    priceMonthly: string;
    priceYearly: string;
    priceDesc: string;
    description: string;
    features: string[];
    cta: string;
    isPopular: boolean;
    userType: "Farmer" | "Dealer";
}

    
