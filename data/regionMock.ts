export const regionData = {
  tananarivo: {
    name: 'Antananarivo',
    latitude: -18.8792,
    longitude: 47.5079,
  },

  fianarantsoa: {
    name: 'Fianarantsoa',
    latitude: -21.4527,
    longitude: 47.0857,
  },

  diego: {
    name: 'Antsiranana',
    latitude: -12.2787,
    longitude: 49.2917,
  },

  toamasina: {
    name: 'Toamasina',
    latitude: -18.1492,
    longitude: 49.4023,
  },

  mahajanga: {
    name: 'Mahajanga',
    latitude: -15.7167,
    longitude: 46.3167,
  },

  tulear: {
    name: 'Toliara',
    latitude: -23.3500,
    longitude: 43.6667,
  },
} as const;

export type RegionKey = keyof typeof regionData;

export const regions = Object.entries(regionData).map(([key, value]) => ({
  key: key as RegionKey,
  ...value,
}));
