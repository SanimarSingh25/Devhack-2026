import React from 'react';
import { View, Text, Button,TouchableOpacity, StyleSheet } from 'react-native';
import { Accelerometer } from "expo-sensors";
export default function DetectionControls({ isDetecting, onToggle, bumpCount }) {
  // TODO: start/stop button, live stats (bump count, speed, status)

const subscriptionRef = React.useRef(null);
const lastReadingRef = React.useRef(null);

React.useEffect(() => {
  if (isDetecting) {
    subscriptionRef.current = Accelerometer.addListener((data) => {
      const { x, y, z } = data;

      if (lastReadingRef.current) {
        const delta =
          Math.abs(x - lastReadingRef.current.x) +
          Math.abs(y - lastReadingRef.current.y) +
          Math.abs(z - lastReadingRef.current.z);

        const threshold = 1.8;

        if (delta > threshold) {
          console.log("BUMP DETECTED");
        }
      }

      lastReadingRef.current = data;
    });

    Accelerometer.setUpdateInterval(200);
  } else {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
  }

  return () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
    }
  };
}, [isDetecting]);
  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={[styles.button, isDetecting ? styles.stopButton : styles.startButton]}
        onPress={onToggle}
      >
        <Text style={styles.buttonText}>
          {isDetecting ? 'Stop' : 'Start'}
        </Text>
      </TouchableOpacity>
      {isDetecting && (
        <Text style={styles.stats}>Bumps detected: {bumpCount}</Text>
      )}
     <Button
      title={isDetecting ? "Stop Detection" : "Start Detection"}
      onPress={onToggle}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  startButton: { backgroundColor: '#22c55e' },
  stopButton: { backgroundColor: '#ef4444' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  stats: { color: 'white', marginTop: 10, fontSize: 14, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 },
});
