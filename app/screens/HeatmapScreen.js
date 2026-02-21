import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import BumpCircles from '../components/BumpCircles';

export default function HeatmapScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [bumps, setBumps] = useState([]);

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

      // Generate fake bump data near current location for testing
      // TODO: replace with fetchBumps() from Supabase
      const fakeBumps = [];
      for (let i = 0; i < 20; i++) {
        fakeBumps.push({
          id: i,
          lat: loc.coords.latitude + (Math.random() - 0.5) * 0.01,
          lng: loc.coords.longitude + (Math.random() - 0.5) * 0.01,
          severity: Math.random() * 6 + 1,
        });
      }
      setBumps(fakeBumps);
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
        <BumpCircles bumps={bumps} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
