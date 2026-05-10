import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

import { RegionPicker } from '@/components/RegionPicker';
import { StatsCard } from '@/components/StatsCard';
import { WeatherLineChart } from '@/components/WeatherLineChart';
import { useAuth } from '@/contexts/AuthContext';
import type { RegionKey } from '@/data/regionMock';
import { fetchRegionWeather } from '@/services/meteoService';
import type { RegionWeatherData } from '@/types/meteo';

export default function HomeScreen() {
  const { logout, user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>('tananarivo');
  const [weather, setWeather] = useState<RegionWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async (region: RegionKey, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await fetchRegionWeather(region);
      setWeather(data);
    } catch (loadError) {
      console.warn('Erreur chargement meteo:', loadError);
      setError("Impossible de charger les donnees depuis l'API.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedRegion);
  }, [selectedRegion]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadWeather(selectedRegion, true)}
            tintColor="#1b7f7a"
          />
        }>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.eyebrow}>Station IoT Meteo</Text>
            <Pressable onPress={logout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>
                <MaterialIcons name="logout" size={24} color="black" />
              </Text>
            </Pressable>
          </View>
          <Text style={styles.title}>Statistiques regionales en temps reel</Text>
          <RegionPicker selectedRegion={selectedRegion} onChange={setSelectedRegion} />
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#1b7f7a" size="large" />
            <Text style={styles.loadingText}>Chargement des donnees...</Text>
          </View>
        ) : (
          <>
            {error ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>API indisponible</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {!error && weather?.isFromCache ? (
              <View style={styles.cacheCard}>
                <Text style={styles.cacheTitle}>Mode hors ligne</Text>
                <Text style={styles.cacheText}>Donnees affichees depuis le cache local.</Text>
              </View>
            ) : null}

            <WeatherLineChart points={weather?.points ?? []} />
            {weather ? <StatsCard weather={weather} /> : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#eef5f4',
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  hero: {
    backgroundColor: '#dcefed',
    borderRadius: 8,
    padding: 20,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  eyebrow: {
    color: '#1b7f7a',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#17343a',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
    marginTop: 10,
  },
  userText: {
    color: '#526b70',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutText: {
    color: '#1b7f7a',
    fontSize: 13,
    fontWeight: '900',
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginTop: 20,
    padding: 28,
  },
  loadingText: {
    color: '#526b70',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
  },
  errorCard: {
    backgroundColor: '#fff4ed',
    borderColor: '#ffbd8a',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 20,
    padding: 16,
  },
  errorTitle: {
    color: '#9a3f19',
    fontSize: 16,
    fontWeight: '900',
  },
  errorText: {
    color: '#9a3f19',
    lineHeight: 20,
    marginTop: 6,
  },
  cacheCard: {
    backgroundColor: '#edf8f5',
    borderColor: '#8bd6c7',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 20,
    padding: 16,
  },
  cacheTitle: {
    color: '#14665f',
    fontSize: 16,
    fontWeight: '900',
  },
  cacheText: {
    color: '#14665f',
    lineHeight: 20,
    marginTop: 6,
  },
});
