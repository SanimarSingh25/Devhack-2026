import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import BumpCircles from '../components/BumpCircles';
import BumpHeatmap from '../components/BumpHeatmap';
import { fetchBumps } from '../utils/supabase';

export default function HeatmapScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [bumps, setBumps] = useState([]);
  const [useHeatmap, setUseHeatmap] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(loc.coords);

      const data = await fetchBumps();
      setBumps(data);
    })();
  }, []);

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Getting location…</Text>
      </View>
    );
  }

  const region = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={region} showsUserLocation={true}>
        {useHeatmap ? <BumpHeatmap bumps={bumps} /> : <BumpCircles bumps={bumps} />}
      </MapView>

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setUseHeatmap(!useHeatmap)}
      >
        <Text style={styles.toggleText}>
          {useHeatmap ? 'Circles' : 'Heatmap'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toggleButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toggleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
