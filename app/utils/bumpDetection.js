import { Accelerometer } from 'expo-sensors';

// TODO: implement
// - Subscribe to accelerometer at 60Hz
// - High-pass filter on z-axis to remove gravity drift
// - Spike detection: z exceeds threshold → bump event
// - Use y-axis to filter out braking
// - Return severity based on spike magnitude
// - Call onBumpDetected({ lat, lng, severity, speed, timestamp })
// app/utils/bumpDetections.js

// Threshold values (you can tune these)
const LOW_THRESHOLD = 1.5;
const MEDIUM_THRESHOLD = 2.2;
const HIGH_THRESHOLD = 3.0;

// Prevent multiple detections within short time
let lastDetectionTime = 0;
const COOLDOWN_TIME = 1000; // 1 second

/**
 * Detect bump from accelerometer data
 * @param {Object} current - current accelerometer reading {x,y,z}
 * @param {Object} previous - previous accelerometer reading {x,y,z}
 * @returns {Object|null} bump object OR null
 */
export function detectBump(current, previous) {
  if (!previous) return null;

  const delta =
    Math.abs(current.x - previous.x) +
    Math.abs(current.y - previous.y) +
    Math.abs(current.z - previous.z);

  const now = Date.now();

  // Prevent duplicate detection
  if (now - lastDetectionTime < COOLDOWN_TIME) {
    return null;
  }

  let severity = null;

  if (delta > HIGH_THRESHOLD) {
    severity = "HIGH";
  } else if (delta > MEDIUM_THRESHOLD) {
    severity = "MEDIUM";
  } else if (delta > LOW_THRESHOLD) {
    severity = "LOW";
  }

  if (severity) {
    lastDetectionTime = now;

    return {
      id: now,
      timestamp: new Date().toISOString(),
      severity,
      intensity: delta.toFixed(2),
    };
  }

  return null;
}