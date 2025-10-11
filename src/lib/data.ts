import type { User, FarmMetric, SensorData, FarmAlert } from '@/lib/types';

export const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@poultrymitra.com', role: 'admin', dateJoined: '2023-01-15' },
  { id: '2', name: 'Farmer John', email: 'john@farm.com', role: 'farmer', dateJoined: '2023-02-20' },
  { id: '3', name: 'Dealer Jane', email: 'jane@dealer.com', role: 'dealer', dateJoined: '2023-03-10' },
  { id: '4', name: 'Farmer Alice', email: 'alice@farm.com', role: 'farmer', dateJoined: '2023-04-05' },
  { id: '5', name: 'Dealer Bob', email: 'bob@dealer.com', role: 'dealer', dateJoined: '2023-05-21' },
];

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
}
