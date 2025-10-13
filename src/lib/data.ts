
import type { User, FarmMetric, SensorData, FarmAlert, DailyRates, Batch } from '@/lib/types';

export const mockUsers: User[] = [];

export const mockFarmMetrics: FarmMetric[] = [];

export const mockSensorData: SensorData[] = [];

export const mockAlerts: FarmAlert[] = [];

export const mockHistoricalData = {
    thirtyDays: []
};

export const mockDailyRates: DailyRates[] = [
    {
        id: "mock-pune",
        location: { state: "Maharashtra", district: "Pune" },
        readyBird: { small: 115, medium: 125, big: 135 },
        chickRate: 38,
        feedCostIndex: 45,
        lastUpdated: new Date().toISOString()
    },
    {
        id: "mock-nashik",
        location: { state: "Maharashtra", district: "Nashik" },
        readyBird: { small: 110, medium: 120, big: 130 },
        chickRate: 37,
        feedCostIndex: 44,
        lastUpdated: new Date().toISOString()
    },
    {
        id: "mock-bengaluru",
        location: { state: "Karnataka", district: "Bengaluru" },
        readyBird: { small: 118, medium: 128, big: 138 },
        chickRate: 40,
        feedCostIndex: 46,
        lastUpdated: new Date().toISOString()
    }
];
    
