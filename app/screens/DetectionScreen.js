import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import BumpCircles from '../components/BumpCircles';
import DetectionControls from '../components/DetectionControls';

export default function DetectionScreen() {
  // TODO: accelerometer detection, GPS tracking, live bump display
  return (
    <View style={styles.container}>
      <Text>Detection Screen — TODO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
