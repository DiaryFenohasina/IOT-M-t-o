import { StyleSheet, Text, View } from 'react-native';

import type { RegionWeatherData } from '@/types/meteo';
import { formatMeteoDateTime } from '@/utils/dateTime';

type StatsCardProps = {
  weather: RegionWeatherData;
};

export function StatsCard({ weather }: StatsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.region}>{weather.region.name}</Text>
          <Text style={styles.coordinates}>
            {weather.region.latitude}, {weather.region.longitude}
          </Text>
        </View>
        <Text style={styles.updatedAt}>{formatMeteoDateTime(weather.updatedAt)}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.metric}>
          <Text style={styles.label}>Actuelle</Text>
          <Text style={styles.value}>{weather.stats.currentTemperature}°C</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.label}>Moyenne</Text>
          <Text style={styles.value}>{weather.stats.averageTemperature}°C</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.label}>Humidite</Text>
          <Text style={styles.value}>{weather.stats.averageHumidity ?? 0}%</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.label}>Vent max</Text>
          <Text style={styles.value}>{weather.stats.maxWindSpeed ?? 0} km/h</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#17343a',
    borderRadius: 8,
    marginTop: 20,
    padding: 18,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  region: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  coordinates: {
    color: '#a8c5ca',
    fontSize: 13,
    marginTop: 4,
  },
  updatedAt: {
    color: '#ffbd8a',
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    backgroundColor: '#22464d',
    borderRadius: 8,
    minHeight: 86,
    padding: 12,
    width: '47.8%',
  },
  label: {
    color: '#a8c5ca',
    fontSize: 13,
    fontWeight: '700',
  },
  value: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 10,
  },
});
