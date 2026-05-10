import { LineChart } from 'react-native-chart-kit';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

import type { MeteoPoint } from '@/types/meteo';
import { formatMeteoHour, getMeteoDateKey, getMeteoHourNumber } from '@/utils/dateTime';

type WeatherLineChartProps = {
  points: MeteoPoint[];
};

const chartWidth = Dimensions.get('window').width - 40;

const formatDayLabel = (point: MeteoPoint, index: number, points: MeteoPoint[]) => {
  const firstDate = getMeteoDateKey(points[0].time);
  const pointDate = getMeteoDateKey(point.time);
  const hour = getMeteoHourNumber(point.time);

  if (index === points.length - 1 && pointDate !== firstDate && hour === 0) {
    return '24h';
  }

  return formatMeteoHour(point.time);
};

export function WeatherLineChart({ points }: WeatherLineChartProps) {
  const visiblePoints = points.slice(0, 25);

  if (visiblePoints.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyTitle}>Aucune donnée météo</Text>
        <Text style={styles.emptyText}>Le graphique apparaitra apres la reponse API.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Temperature de la journee</Text>
      <LineChart
        data={{
          labels: visiblePoints.map((point, index) => {
            if (index === 0 || index === visiblePoints.length - 1 || index % 3 === 0) {
              return formatDayLabel(point, index, visiblePoints);
            }

            return '';
          }),
          datasets: [
            {
              data: visiblePoints.map((point) => point.temperature),
              color: () => '#1b7f7a',
              strokeWidth: 3,
            },
          ],
        }}
        width={chartWidth}
        height={250}
        yAxisSuffix="°"
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(27, 127, 122, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(51, 64, 66, ${opacity})`,
          propsForBackgroundLines: {
            stroke: '#e3ecef',
          },
          propsForDots: {
            r: '4',
            stroke: '#ff8a5b',
            strokeWidth: '2',
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginTop: 20,
    paddingBottom: 10,
    paddingTop: 18,
    shadowColor: '#0b2f35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  title: {
    color: '#17343a',
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 18,
  },
  chart: {
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    minHeight: 180,
    padding: 24,
  },
  emptyTitle: {
    color: '#17343a',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    color: '#6e7f83',
    marginTop: 8,
    textAlign: 'center',
  },
});
