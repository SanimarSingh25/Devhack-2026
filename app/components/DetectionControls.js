import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function DetectionControls({ isDetecting, onToggle, bumpCount }) {
  // TODO: start/stop button, live stats (bump count, speed, status)
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
