
import React, { useState, useRef, useEffect } from "react";
//import { View, Text, Button } from "react-native";
import { Accelerometer } from "expo-sensors";
//import { Accelerometer } from "expo-sensors";
import { detectBump } from "../utils/bumpDetection";
import { View, Text, StyleSheet, FlatList,Button, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import BumpCircles from '../components/BumpCircles';
import DetectionControls from '../components/DetectionControls';


export default function DetectionScreen() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [bumps, setBumps] = useState([]);

  const lastReadingRef = useRef(null);

  const handleToggleDetection = () => {
    setIsDetecting((prev) => !prev);
  };

  
  // Accelerometer subscription effect
  useEffect(() => {
    let subscription = null;

    if (isDetecting) {
      Accelerometer.setUpdateInterval(200);
      subscription = Accelerometer.addListener((data) => {
        const bump = detectBump(data, lastReadingRef.current);
        if (bump) {
          setBumps((prev) => [bump, ...prev]);
        }
        lastReadingRef.current = data;
      });
    } else if (subscription) {
      subscription.remove();
      subscription = null;
    }

    return () => {
      if (subscription) subscription.remove();
    };
  }, [isDetecting]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pothole Detection</Text>
      <Text style={styles.count}>Total Bumps: {bumps.length}</Text>

      <DetectionControls
        isDetecting={isDetecting}
        onToggle={handleToggleDetection}
        bumpCount={bumps.length}
      />

      <FlatList
        data={bumps}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.bumpItem}>
            <Text style={styles.bumpText}>
              [{item.severity}] {item.timestamp} | Intensity: {item.intensity}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  count: { fontSize: 18, textAlign: "center", marginBottom: 10 },
  list: { marginTop: 20 },
  bumpItem: { padding: 10, backgroundColor: "#fff", marginBottom: 5, borderRadius: 5 },
  bumpText: { fontSize: 14, color: "#333" },
});