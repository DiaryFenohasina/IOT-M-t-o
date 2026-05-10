import { regionData, regions, type RegionKey } from '@/data/regionMock';
import type { ApiWeatherResponse, MeteoPoint, RegionWeatherData } from '@/types/meteo';
import { getMeteoApi } from '@/api/meteoApi';
import {
  buildRegionWeatherData,
  getCachedRegionWeather,
  saveWeatherForecastCache,
} from '@/services/weatherCacheService';

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

const getCurrentTemperature = (payload: ApiWeatherResponse, points: MeteoPoint[]) => {
  const currentTemperature =
    payload.current?.temperature ??
    payload.current?.temperature_2m ??
    payload.current_weather?.temperature ??
    points[0]?.temperature ??
    0;

  return Number(currentTemperature.toFixed(1));
};

const fetchApiRegionWeather = async (regionKey: RegionKey) => {
  const region = regionData[regionKey];
  const response = await getMeteoApi(region.latitude, region.longitude).get<ApiWeatherResponse>(
    '',
  );
  const allPoints = normalizePoints(response.data);
  const updatedAt =
    response.data.updatedAt ??
    response.data.current?.time ??
    response.data.current_weather?.time ??
    new Date().toISOString();

  try {
    await saveWeatherForecastCache(regionKey, allPoints, updatedAt);
  } catch (cacheError) {
    console.warn('Impossible de sauvegarder le cache meteo local:', cacheError);
  }

  return {
    allPoints,
    currentTemperature: getCurrentTemperature(response.data, allPoints),
    updatedAt,
  };
};

export const syncAllRegionsWeatherCache = async (excludedRegionKey?: RegionKey) => {
  const regionKeys = regions
    .map((region) => region.key)
    .filter((regionKey) => regionKey !== excludedRegionKey);

  for (const regionKey of regionKeys) {
    try {
      await fetchApiRegionWeather(regionKey);
    } catch (syncError) {
      console.warn(`Impossible de synchroniser le cache meteo ${regionKey}:`, syncError);
    }
  }
};

export const fetchRegionWeather = async (regionKey: RegionKey): Promise<RegionWeatherData> => {
  try {
    const { allPoints, currentTemperature, updatedAt } = await fetchApiRegionWeather(regionKey);
    const weatherData = buildRegionWeatherData(
      regionKey,
      allPoints,
      updatedAt,
      currentTemperature,
    );

    return weatherData;
  } catch (apiError) {
    try {
      const cachedWeather = await getCachedRegionWeather(regionKey);

      if (cachedWeather) {
        return cachedWeather;
      }
    } catch (cacheError) {
      console.warn('Impossible de lire le cache meteo local:', cacheError);
    }

    throw apiError;
  }
};
