import RNPickerSelect from 'react-native-picker-select';
import { StyleSheet, View } from 'react-native';

import { regions, type RegionKey } from '@/data/regionMock';

type RegionPickerProps = {
  selectedRegion: RegionKey;
  onChange: (region: RegionKey) => void;
};

export function RegionPicker({ selectedRegion, onChange }: RegionPickerProps) {
  return (
    <View style={styles.container}>
      <RNPickerSelect
        value={selectedRegion}
        onValueChange={(value) => {
          if (value) {
            onChange(value as RegionKey);
          }
        }}
        items={regions.map((region) => ({
          label: region.name,
          value: region.key,
        }))}
        placeholder={{}}
        useNativeAndroidPickerStyle={false}
        style={{
          inputIOS: styles.input,
          inputAndroid: styles.input,
          iconContainer: styles.iconContainer,
        }}
        Icon={() => <View style={styles.chevron} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderColor: '#d7e3e6',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 18,
  },
  input: {
    color: '#17343a',
    fontSize: 16,
    fontWeight: '700',
    minHeight: 52,
    paddingHorizontal: 16,
    paddingRight: 42,
  },
  iconContainer: {
    right: 18,
    top: 20,
  },
  chevron: {
    borderBottomWidth: 2,
    borderColor: '#1b7f7a',
    borderRightWidth: 2,
    height: 10,
    transform: [{ rotate: '45deg' }],
    width: 10,
  },
});
