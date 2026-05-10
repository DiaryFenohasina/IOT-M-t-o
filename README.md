# IOT Meteo

Application mobile React Native avec Expo pour afficher des statistiques meteo par region.

## Technologies

- React Native avec Expo
- TypeScript
- Axios
- react-native-chart-kit
- react-native-picker-select
- React Hooks
- expo-sqlite
- expo-crypto

## Installation

```bash
npm install
npx expo install react-native-svg
npm install axios react-native-chart-kit react-native-picker-select
```

## Lancer l'application

```bash
npm run start
```

Pour le web :

```bash
npm run web
```

## Structure

```text
components/
  RegionPicker.tsx
  StatsCard.tsx
  WeatherLineChart.tsx
contexts/
  AuthContext.tsx
data/
  regionMock.ts
services/
  authService.ts
  database.ts
  meteoService.ts
screens/
  LoginScreen.tsx
  HomeScreen.tsx
types/
  auth.ts
  meteo.ts
api/
  meteoApi.ts
```

## Authentification locale

L'application utilise une base SQLite embarquee `iot_meteo.db`.

Tables creees automatiquement :

```sql
users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)

sessions (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

Le premier ecran permet de creer un compte ou de se connecter. Le mot de passe est hache avec `expo-crypto` avant insertion dans SQLite.

## Cache meteo hors ligne

L'API Open-Meteo recupere maintenant `forecast_days: 7`.

Au chargement d'une region :

- si la connexion API fonctionne, les 7 jours de donnees horaires sont recuperes puis stockes en SQLite ;
- les anciens jours deja passes sont supprimes automatiquement ;
- si la connexion echoue, l'application relit les donnees meteo disponibles dans le cache local.

Table utilisee :

```sql
weather_cache (
  region_key TEXT NOT NULL,
  day_key TEXT NOT NULL,
  encrypted_payload TEXT NOT NULL,
  encrypted_updated_at TEXT NOT NULL,
  cached_at TEXT NOT NULL,
  PRIMARY KEY (region_key, day_key)
)
```

Les donnees meteo stockees (`encrypted_payload` et `encrypted_updated_at`) sont chiffrees avant insertion en base locale.

## API

La base URL est configuree dans `services/meteoService.ts` :

```ts
baseURL: 'http://localhost:8080/api/'
```

L'application appelle l'endpoint suivant quand la region change :

```text
GET /api/meteo/:region?latitude=-18.8792&longitude=47.5079
```

Exemple :

```text
GET http://localhost:8080/api/meteo/tananarivo?latitude=-18.8792&longitude=47.5079
```

## Exemple de reponse API

Format simple accepte :

```json
{
  "region": "tananarivo",
  "updatedAt": "2026-05-10T09:00:00.000Z",
  "current": {
    "temperature": 24.8,
    "windSpeed": 12
  },
  "data": [
    { "time": "2026-05-10T06:00:00.000Z", "temperature": 20.2, "humidity": 79, "windSpeed": 8 },
    { "time": "2026-05-10T09:00:00.000Z", "temperature": 24.8, "humidity": 65, "windSpeed": 12 },
    { "time": "2026-05-10T12:00:00.000Z", "temperature": 28.1, "humidity": 58, "windSpeed": 16 }
  ]
}
```

Format type Open-Meteo egalement accepte :

```json
{
  "current": {
    "temperature_2m": 24.8,
    "wind_speed_10m": 12
  },
  "hourly": {
    "time": ["2026-05-10T06:00", "2026-05-10T09:00", "2026-05-10T12:00"],
    "temperature_2m": [20.2, 24.8, 28.1],
    "relative_humidity_2m": [79, 65, 58],
    "wind_speed_10m": [8, 12, 16]
  }
}
```

Sur Android physique, `localhost` pointe vers le telephone. Utilisez l'adresse IP de votre ordinateur ou `http://10.0.2.2:8080/api/` avec l'emulateur Android si necessaire.

---

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
