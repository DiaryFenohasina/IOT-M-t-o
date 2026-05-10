import type { RegionKey } from '@/data/regionMock';

export type Region = {
  key: RegionKey;
  name: string;
  latitude: number;
  longitude: number;
};

export type MeteoPoint = {
  time: string;
  temperature: number;
  humidity?: number;
  windSpeed?: number;
};

export type WeatherStats = {
  currentTemperature: number;
  averageTemperature: number;
  averageHumidity?: number;
  maxWindSpeed?: number;
};

export type RegionWeatherData = {
  region: Region;
  points: MeteoPoint[];
  stats: WeatherStats;
  updatedAt: string;
};

export type ApiWeatherResponse = {
  region?: string;
  updatedAt?: string;
  current?: {
    time?: string;
    temperature?: number;
    temperature_2m?: number;
    windSpeed?: number;
    wind_speed_10m?: number;
  };
  current_weather?: {
    time?: string;
    temperature?: number;
    windspeed?: number;
  };
  hourly?: {
    time: string[];
    temperature?: number[];
    temperature_2m?: number[];
    humidity?: number[];
    relative_humidity_2m?: number[];
    windSpeed?: number[];
    wind_speed_10m?: number[];
  };
  stats?: Partial<WeatherStats>;
  data?: Array<{
    time: string;
    temperature: number;
    humidity?: number;
    windSpeed?: number;
  }>;
};
