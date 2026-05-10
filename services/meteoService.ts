import { regionData, type RegionKey } from '@/data/regionMock';
import type { ApiWeatherResponse, MeteoPoint, RegionWeatherData } from '@/types/meteo';
import { getMeteoApi } from '@/api/meteoApi';
import { getCurrentMeteoDateKey, getMeteoDateKey, getMeteoHourNumber } from '@/utils/dateTime';

const average = (values: number[]) => {
  if (values.length === 0) {
    return 0;
  }

  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
};

const max = (values: number[]) => {
  if (values.length === 0) {
    return undefined;
  }

  return Number(Math.max(...values).toFixed(1));
};

const normalizePoints = (payload: ApiWeatherResponse): MeteoPoint[] => {
  if (payload.data?.length) {
    return payload.data;
  }

  const hourly = payload.hourly;
  if (!hourly?.time?.length) {
    return [];
  }

  const temperatures = hourly.temperature ?? hourly.temperature_2m ?? [];
  const humidity = hourly.humidity ?? hourly.relative_humidity_2m ?? [];
  const wind = hourly.windSpeed ?? hourly.wind_speed_10m ?? [];

  return hourly.time.map((time, index) => ({
    time,
    temperature: Number(temperatures[index] ?? 0),
    humidity: humidity[index],
    windSpeed: wind[index],
  }));
};

const normalizeWeather = (
  regionKey: RegionKey,
  payload: ApiWeatherResponse,
): RegionWeatherData => {
  const localRegion = regionData[regionKey];
  const region = {
    key: regionKey,
    name: localRegion.name,
    latitude: localRegion.latitude,
    longitude: localRegion.longitude,
  };
  const allPoints = normalizePoints(payload);
  const currentDateKey = getCurrentMeteoDateKey();
  const todayPoints = allPoints.filter((point) => getMeteoDateKey(point.time) === currentDateKey);
  const nextMidnight = allPoints.find(
    (point) => getMeteoDateKey(point.time) > currentDateKey && getMeteoHourNumber(point.time) === 0,
  );
  const points =
    todayPoints.length > 0
      ? [...todayPoints, ...(nextMidnight ? [nextMidnight] : [])]
      : allPoints.slice(0, 24);
  const temperatures = points.map((point) => point.temperature);
  const humidity = points
    .map((point) => point.humidity)
    .filter((value): value is number => typeof value === 'number');
  const wind = points
    .map((point) => point.windSpeed)
    .filter((value): value is number => typeof value === 'number');

  const currentTemperature =
    payload.current?.temperature ??
    payload.current?.temperature_2m ??
    payload.current_weather?.temperature ??
    temperatures[0] ??
    0;

  return {
    region,
    points,
    stats: {
      currentTemperature: Number(currentTemperature.toFixed(1)),
      averageTemperature: payload.stats?.averageTemperature ?? average(temperatures),
      averageHumidity: payload.stats?.averageHumidity ?? average(humidity),
      maxWindSpeed: payload.stats?.maxWindSpeed ?? max(wind),
    },
    updatedAt: payload.updatedAt ?? payload.current?.time ?? payload.current_weather?.time ?? new Date().toISOString(),
  };
};

export const fetchRegionWeather = async (regionKey: RegionKey): Promise<RegionWeatherData> => {
  const region = regionData[regionKey];
  const response = await getMeteoApi(region.latitude, region.longitude).get<ApiWeatherResponse>('');

  return normalizeWeather(regionKey, response.data);
};
