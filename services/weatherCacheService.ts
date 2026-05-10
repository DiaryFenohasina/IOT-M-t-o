import { regionData, type RegionKey } from '@/data/regionMock';
import { decryptJson, encryptJson } from '@/services/encryptionService';
import { getDatabase } from '@/services/database';
import type { MeteoPoint, RegionWeatherData, WeatherStats } from '@/types/meteo';
import { getCurrentMeteoDateKey, getMeteoDateKey, getMeteoHourNumber } from '@/utils/dateTime';

type WeatherCacheRow = {
  encrypted_payload: string;
  encrypted_updated_at: string;
};

type DayCachePayload = {
  points: MeteoPoint[];
};

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

const groupPointsByDay = (points: MeteoPoint[]) =>
  points.reduce<Record<string, MeteoPoint[]>>((groups, point) => {
    const dayKey = getMeteoDateKey(point.time);

    return {
      ...groups,
      [dayKey]: [...(groups[dayKey] ?? []), point],
    };
  }, {});

const getRegion = (regionKey: RegionKey) => {
  const localRegion = regionData[regionKey];

  return {
    key: regionKey,
    name: localRegion.name,
    latitude: localRegion.latitude,
    longitude: localRegion.longitude,
  };
};

const buildStats = (points: MeteoPoint[], currentTemperature?: number): WeatherStats => {
  const temperatures = points.map((point) => point.temperature);
  const humidity = points
    .map((point) => point.humidity)
    .filter((value): value is number => typeof value === 'number');
  const wind = points
    .map((point) => point.windSpeed)
    .filter((value): value is number => typeof value === 'number');

  return {
    currentTemperature: Number((currentTemperature ?? temperatures[0] ?? 0).toFixed(1)),
    averageTemperature: average(temperatures),
    averageHumidity: average(humidity),
    maxWindSpeed: max(wind),
  };
};

export const getTodayWeatherPoints = (points: MeteoPoint[]) => {
  const currentDateKey = getCurrentMeteoDateKey();
  const todayPoints = points.filter((point) => getMeteoDateKey(point.time) === currentDateKey);
  const nextMidnight = points.find(
    (point) => getMeteoDateKey(point.time) > currentDateKey && getMeteoHourNumber(point.time) === 0,
  );

  return todayPoints.length > 0
    ? [...todayPoints, ...(nextMidnight ? [nextMidnight] : [])]
    : points.slice(0, 24);
};

export const purgeExpiredWeatherCache = async () => {
  const db = await getDatabase();
  const currentDateKey = getCurrentMeteoDateKey();

  await db.runAsync('DELETE FROM weather_cache WHERE day_key < ?', currentDateKey);
};

export const saveWeatherForecastCache = async (
  regionKey: RegionKey,
  points: MeteoPoint[],
  updatedAt: string,
) => {
  const db = await getDatabase();
  const groupedPoints = groupPointsByDay(points);
  const encryptedUpdatedAt = encryptJson(updatedAt);

  await purgeExpiredWeatherCache();

  await db.withTransactionAsync(async () => {
    for (const [dayKey, dayPoints] of Object.entries(groupedPoints)) {
      await db.runAsync(
        `INSERT OR REPLACE INTO weather_cache
          (region_key, day_key, encrypted_payload, encrypted_updated_at, cached_at)
         VALUES (?, ?, ?, ?, ?)`,
        regionKey,
        dayKey,
        encryptJson({ points: dayPoints } satisfies DayCachePayload),
        encryptedUpdatedAt,
        new Date().toISOString(),
      );
    }
  });
};

export const getCachedRegionWeather = async (
  regionKey: RegionKey,
): Promise<RegionWeatherData | null> => {
  const db = await getDatabase();
  const currentDateKey = getCurrentMeteoDateKey();
  let rows = await db.getAllAsync<WeatherCacheRow>(
    `SELECT encrypted_payload, encrypted_updated_at
     FROM weather_cache
     WHERE region_key = ? AND day_key >= ?
     ORDER BY day_key ASC`,
    regionKey,
    currentDateKey,
  );

  if (rows.length === 0) {
    rows = await db.getAllAsync<WeatherCacheRow>(
      `SELECT encrypted_payload, encrypted_updated_at
       FROM weather_cache
       WHERE region_key = ?
       ORDER BY day_key DESC`,
      regionKey,
    );
  }

  if (rows.length === 0) {
    return null;
  }

  const allPoints = rows.flatMap((row) => decryptJson<DayCachePayload>(row.encrypted_payload).points);
  const points = getTodayWeatherPoints(allPoints);
  const updatedAt = decryptJson<string>(rows[0].encrypted_updated_at);

  return {
    region: getRegion(regionKey),
    points,
    stats: buildStats(points),
    updatedAt,
    isFromCache: true,
  };
};

export const buildRegionWeatherData = (
  regionKey: RegionKey,
  points: MeteoPoint[],
  updatedAt: string,
  currentTemperature?: number,
): RegionWeatherData => {
  const todayPoints = getTodayWeatherPoints(points);

  return {
    region: getRegion(regionKey),
    points: todayPoints,
    stats: buildStats(todayPoints, currentTemperature),
    updatedAt,
  };
};
