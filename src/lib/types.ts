export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'farmer' | 'dealer' | 'admin';
};

export type FarmMetric = {
  month: string;
  productionRate: number;
  mortalityRate: number;
  feedConsumption: number;
};

export type SensorData = {
  id: string;
  location: string;
  temperature: number;
  humidity: number;
  ammonia: number;
  timestamp: string;
};

export type FarmAlert = {
  id: string;
  type: 'critical' | 'warning';
  message: string;
  timestamp: string;
};
