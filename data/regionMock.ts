export const regionData = {
  tananarivo: {
    name: 'Tananarivo',
    latitude: -18.8792,
    longitude: 47.5079,
  },
  fianarantsoa: {
    name: 'Fianarantsoa',
    latitude: -21.4527,
    longitude: 47.0857,
  },
  diego: {
    name: 'Diego',
    latitude: -12.2787,
    longitude: 49.2917,
  },
  toamasina: {
    name: 'Toamasina',
    latitude: -18.1492,
    longitude: 49.4023,
  },
} as const;

export type RegionKey = keyof typeof regionData;

export const regions = Object.entries(regionData).map(([key, value]) => ({
  key: key as RegionKey,
  ...value,
}));
