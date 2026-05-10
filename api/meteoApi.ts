import axios from "axios";
import { APP_TIME_ZONE } from '@/utils/dateTime';

export const getMeteoApi = (latitude : number, longitude : number) => {
  return axios.create({
    baseURL: `https://api.open-meteo.com/v1/forecast`,
    timeout: 10000,
    params: {
      latitude,
      longitude,
      current: "temperature_2m,wind_speed_10m",
      hourly:
        "temperature_2m,relative_humidity_2m,wind_speed_10m",
      timezone: APP_TIME_ZONE,
      forecast_days: 7,
    },
  });
};
