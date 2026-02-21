import { Accelerometer } from 'expo-sensors';

// TODO: implement
// - Subscribe to accelerometer at 60Hz
// - High-pass filter on z-axis to remove gravity drift
// - Spike detection: z exceeds threshold → bump event
// - Use y-axis to filter out braking
// - Return severity based on spike magnitude
// - Call onBumpDetected({ lat, lng, severity, speed, timestamp })

export function startDetection(onBumpDetected) {
  // placeholder
}

export function stopDetection() {
  // placeholder
}
