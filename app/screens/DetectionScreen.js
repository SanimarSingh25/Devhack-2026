import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { startDetection, stopDetection } from '../utils/bumpDetection';
import BumpCircles from '../components/BumpCircles';
import DetectionControls from '../components/DetectionControls';
import * as Haptics from 'expo-haptics';


export default function DetectionScreen() {
  const [isDetecting, setIsDetecting] = useState(true);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [bumps, setBumps] = useState([]);
  const locationRef = useRef(null);
  const bumpIdRef = useRef(0);

  // Get permission and continuously track GPS
  useEffect(() => {
    let locationSub = null;

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
      locationRef.current = loc.coords;

      locationSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 2 },
        (newLoc) => {
          setLocation(newLoc.coords);
          locationRef.current = newLoc.coords;
        }
      );
    })();

    return () => {
      if (locationSub) locationSub.remove();
    };
  }, []);

  // Start/stop bump detection
  useEffect(() => {
    if (isDetecting) {
      startDetection(
        () => locationRef.current,
        (bump) => {
          // 📳 Vibrate based on severity
          if (bump.severity === "HIGH") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } else if (bump.severity === "MEDIUM") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else {
           Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          bump.id = bumpIdRef.current++;
          setBumps((prev) => [...prev, bump]);
          // TODO: uploadBump(bump) to Supabase
        }
      );
    } else {
      stopDetection();
    }

    return () => stopDetection();
  }, [isDetecting]);

  if (errorMsg) {
    return (
      <View style={styles.centered}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.centered}>
        <Text>Getting location…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        showsUserLocation={true}
        followsUserLocation={isDetecting}
        camera={{
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          pitch: 60,
          heading: location.heading || 0,
          altitude: 50,
          zoom: 20,
        }}
      >
        <BumpCircles bumps={bumps} />
      </MapView>

      <DetectionControls
        isDetecting={isDetecting}
        onToggle={() => setIsDetecting(!isDetecting)}
        bumpCount={bumps.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
