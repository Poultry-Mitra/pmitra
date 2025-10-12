

import type { User, FarmMetric, SensorData, FarmAlert, DailyRates, Batch } from '@/lib/types';

export const mockUsers: User[] = [
  { id: 'usr_admin_001', name: 'Admin User', email: 'admin@poultrymitra.com', role: 'admin', dateJoined: '2023-01-15', planType: 'premium' },
  { id: 'usr_farmer_002', name: 'Farmer John', email: 'john@farm.com', role: 'farmer', dateJoined: '2023-02-20', planType: 'premium' },
  { id: 'usr_dealer_003', name: 'Dealer Jane', email: 'jane@dealer.com', role: 'dealer', dateJoined: '2023-03-10', planType: 'premium', uniqueDealerCode: 'DEAL-JANE', connectedFarmers: ['usr_farmer_002', 'usr_farmer_004'] },
  { id: 'usr_farmer_004', name: 'Farmer Alice', email: 'alice@farm.com', role: 'farmer', dateJoined: '2023-04-05', planType: 'free' },
  { id: 'usr_dealer_005', name: 'Dealer Bob', email: 'bob@dealer.com', role: 'dealer', dateJoined: '2023-05-21', planType: 'free', uniqueDealerCode: 'DEAL-BOB', connectedFarmers: ['usr_farmer_002'] },
];

export const currentUser: User = mockUsers[1];
export const currentDealer: User | undefined = mockUsers.find(u => u.id === 'usr_dealer_003');


export const mockFarmMetrics: FarmMetric[] = [
  { month: 'Jan', productionRate: 85, mortalityRate: 1.2, feedConsumption: 110 },
  { month: 'Feb', productionRate: 88, mortalityRate: 1.1, feedConsumption: 112 },
  { month: 'Mar', productionRate: 90, mortalityRate: 1.0, feedConsumption: 115 },
  { month: 'Apr', productionRate: 92, mortalityRate: 0.9, feedConsumption: 114 },
  { month: 'May', productionRate: 89, mortalityRate: 1.3, feedConsumption: 116 },
  { month: 'Jun', productionRate: 93, mortalityRate: 0.8, feedConsumption: 118 },
  { month: 'Jul', productionRate: 94, mortalityRate: 0.7, feedConsumption: 120 },
];

export const mockSensorData: SensorData[] = [
    { id: 'sensor-1', location: 'Coop A-1', temperature: 24, humidity: 65, ammonia: 15, timestamp: new Date().toISOString() },
    { id: 'sensor-2', location: 'Coop A-2', temperature: 25, humidity: 68, ammonia: 22, timestamp: new Date().toISOString() },
    { id: 'sensor-3', location: 'Coop B-1', temperature: 23, humidity: 62, ammonia: 12, timestamp: new Date().toISOString() },
    { id: 'sensor-4', location: 'Coop B-2', temperature: 26, humidity: 70, ammonia: 25, timestamp: new Date().toISOString() },
];

export const mockAlerts: FarmAlert[] = [
    { id: 'alert-1', type: 'critical', message: 'High ammonia levels detected in Coop B-2. Immediate ventilation required.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: 'alert-2', type: 'warning', message: 'Humidity dropping in Coop A-1. Check water supply.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
];

export const mockHistoricalData = {
    thirtyDays: mockFarmMetrics.map((d, i) => ({...d, date: new Date(Date.now() - (30-i) * 24 * 60 * 60 * 1000).toISOString()}))
};

export const mockDailyRates: DailyRates[] = [
    {
        readyBird: {
            small: 110,
            medium: 125,
            big: 140,
        },
        chickRate: 35,
        feedCostIndex: 45.5,
        lastUpdated: '2023-10-27T10:00:00Z',
        location: {
            state: "Maharashtra",
            district: "Pune",
        }
    },
    {
        readyBird: {
            small: 108,
            medium: 122,
            big: 138,
        },
        chickRate: 34,
        feedCostIndex: 45.0,
        lastUpdated: '2023-10-27T10:00:00Z',
        location: {
            state: "Maharashtra",
            district: "Nashik",
        }
    },
    {
        readyBird: {
            small: 115,
            medium: 130,
            big: 145,
        },
        chickRate: 36,
        feedCostIndex: 46.2,
        lastUpdated: '2023-10-27T10:00:00Z',
        location: {
            state: "Karnataka",
            district: "Bengaluru",
        }
    }
];
