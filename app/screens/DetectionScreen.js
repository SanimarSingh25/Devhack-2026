import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import BumpCircles from '../components/BumpCircles';
import DetectionControls from '../components/DetectionControls';
import { startDetection, stopDetection} from "../utils/bumpDetection";

export default function DetectionScreen() {
  const [running, setRunning] = useState(false);
  const [bumpHit, setBumpHit] = useState(false);
  const [lastSeverity, setLastSeverity] = useState(null);

  useEffect(() => {
    if (!running) {
      stopDetection();
      return;
    }

    const onBumpDetected = ({ severity, timestamp }) => {
      setLastSeverity(severity);
      setBumpHit(true);

      // turn it off after 1 second so it doesn’t stay stuck “on”
      setTimeout(() => setBumpHit(false), 1000);
    };

    startDetection(onBumpDetected, null, 16); // ~60Hz

    return () => stopDetection();
  }, [running]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bump Detection</Text>

      <Button
        title={running ? "Stop" : "Start"}
        onPress={() => setRunning((r) => !r)}
      />

      <View style={{ marginTop: 24 }}>
        <Text style={[styles.status, bumpHit ? styles.hit : styles.noHit]}>
          {bumpHit ? "BUMP DETECTED!" : running ? "Listening..." : "Stopped"}
        </Text>

        {lastSeverity != null && (
          <Text style={styles.smallText}>
            Last severity: {Number(lastSeverity).toFixed(1)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  status: { fontSize: 20, fontWeight: "bold" },
  hit: { color: "red" },
  noHit: { color: "gray" },
  smallText: { marginTop: 8, fontSize: 14, color: "#555" },
});