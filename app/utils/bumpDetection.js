import { Accelerometer } from 'expo-sensors';

// ── Config ──────────────────────────────────────────────────
const CONFIG = {
  updateIntervalMs: 16,            // ~60 Hz sampling rate
  filterAlpha: 0.8,                // high-pass filter strength (0–1)

  // Speed-based thresholds
  baseThreshold: 1.2,              // baseline z spike (in Gs) to count as a bump
  minSpeedMph: 3,                  // below this → skip detection entirely
  speedFactors: [                  // [maxSpeed, factor] pairs, checked in order
    [15, 1.5],                     // under 15 mph → threshold * 1.5
    [40, 1.0],                     // 15–40 mph → threshold * 1.0
    [Infinity, 0.8],               // above 40 mph → threshold * 0.8
  ],

  // Pattern matching (rolling buffer)
  bufferSize: 30,                  // ~500ms of samples at 60Hz
  bounceWindowMs: 200,             // max time between drop and bounce for pothole
  bounceMinMs: 50,                 // min time between drop and bounce
  dropThreshold: 0.8,              // negative z spike to start pothole pattern
  bounceThreshold: 0.6,            // positive z spike to confirm pothole pattern

  // Cooldown
  cooldownMs: 800,                 // ignore readings for this long after a bump

  // Braking filter
  brakingYThreshold: 0.6,         // y-axis spike above this → probably braking

  // Severity
  minSeverity: 1,
  maxSeverity: 10,
  severityScale: 3,

  // Band-pass filter (low-pass on top of high-pass)
  lowPassAlpha: 0.4,               // smoothing for low-pass (0–1, lower = more smoothing)
};

// ── State ───────────────────────────────────────────────────
let subscription = null;
let lastRaw = { x: 0, y: 0, z: 0 };
let highPassed = { x: 0, y: 0, z: 0 };
let bandPassed = { x: 0, y: 0, z: 0 };
let lastBumpTime = 0;

// Rolling buffer for pattern matching
let buffer = [];

// ── Filters ─────────────────────────────────────────────────

// High-pass: removes gravity (slow drift), keeps sudden jolts
function highPassFilter(current, previousRaw, previousFiltered, alpha) {
  return {
    x: alpha * (previousFiltered.x + current.x - previousRaw.x),
    y: alpha * (previousFiltered.y + current.y - previousRaw.y),
    z: alpha * (previousFiltered.z + current.z - previousRaw.z),
  };
}

// Low-pass: removes high-frequency road vibration noise
// Combined with the high-pass above, this creates a band-pass
// that isolates bump frequencies (~1–10 Hz)
function lowPassFilter(current, previous, alpha) {
  return {
    x: alpha * current.x + (1 - alpha) * previous.x,
    y: alpha * current.y + (1 - alpha) * previous.y,
    z: alpha * current.z + (1 - alpha) * previous.z,
  };
}

// ── Speed helpers ───────────────────────────────────────────

// expo-location gives speed in m/s, convert to mph
function msToMph(ms) {
  return (ms || 0) * 2.237;
}

// Returns a multiplier for the spike threshold based on speed
function getSpeedFactor(speedMph) {
  for (const [maxSpeed, factor] of CONFIG.speedFactors) {
    if (speedMph <= maxSpeed) return factor;
  }
  return 1.0;
}

// ── Pattern matching ────────────────────────────────────────

// Searches the rolling buffer for a pothole signature:
// negative z spike (drop) followed by positive z spike (bounce)
// Returns a severity multiplier if pattern found, 0 if not
function detectPotholePattern() {
  if (buffer.length < 4) return 0;

  // Walk backwards looking for a drop (negative z spike)
  let dropIndex = -1;
  let dropMagnitude = 0;

  for (let i = buffer.length - 1; i >= 0; i--) {
    if (buffer[i].z < -CONFIG.dropThreshold) {
      dropIndex = i;
      dropMagnitude = Math.abs(buffer[i].z);
      break;
    }
  }

  if (dropIndex === -1) return 0;

  // Look for a bounce (positive z spike) after the drop
  let bounceMagnitude = 0;

  for (let i = dropIndex + 1; i < buffer.length; i++) {
    const timeDiff = buffer[i].time - buffer[dropIndex].time;

    // Too early — still in the drop
    if (timeDiff < CONFIG.bounceMinMs) continue;
    // Too late — not a pothole pattern
    if (timeDiff > CONFIG.bounceWindowMs) break;

    if (buffer[i].z > CONFIG.bounceThreshold) {
      bounceMagnitude = buffer[i].z;
      break;
    }
  }

  if (bounceMagnitude === 0) return 0;

  // Pattern confirmed — severity based on drop depth + bounce height
  return dropMagnitude + bounceMagnitude;
}

// ── Severity ────────────────────────────────────────────────

function calculateSeverity(filteredZ, patternScore, speedMph) {
  // Base severity from spike magnitude
  const spikeMag = Math.abs(filteredZ) - CONFIG.baseThreshold;
  let raw = spikeMag * CONFIG.severityScale + CONFIG.minSeverity;

  // Boost severity if pothole pattern was confirmed
  if (patternScore > 0) {
    raw += patternScore * 1.5;
  }

  // Bumps at higher speeds are more dangerous
  if (speedMph > 40) {
    raw *= 1.3;
  }

  return Math.min(CONFIG.maxSeverity, Math.max(CONFIG.minSeverity, Math.round(raw * 10) / 10));
}

// ── Detection ───────────────────────────────────────────────

function isBump(filteredData, now, speedMph) {
  // Too slow — probably stationary, skip to avoid false positives
  if (speedMph < CONFIG.minSpeedMph) return false;

  const zMag = Math.abs(filteredData.z);

  // Scale threshold by speed
  const effectiveThreshold = CONFIG.baseThreshold * getSpeedFactor(speedMph);

  // Not a big enough spike
  if (zMag < effectiveThreshold) return false;

  // Still in cooldown from the last bump
  if (now - lastBumpTime < CONFIG.cooldownMs) return false;

  // Large y-axis spike without proportional z → probably braking
  if (Math.abs(filteredData.y) > CONFIG.brakingYThreshold && zMag < Math.abs(filteredData.y)) {
    return false;
  }

  return true;
}

// ── Public API ──────────────────────────────────────────────

export function startDetection(getLocation, onBumpDetected) {
  // Reset all state for a fresh session
  lastRaw = { x: 0, y: 0, z: 0 };
  highPassed = { x: 0, y: 0, z: 0 };
  bandPassed = { x: 0, y: 0, z: 0 };
  lastBumpTime = 0;
  buffer = [];

  Accelerometer.setUpdateInterval(CONFIG.updateIntervalMs);

  subscription = Accelerometer.addListener((data) => {
    const now = Date.now();

    // Band-pass filter: high-pass then low-pass
    highPassed = highPassFilter(data, lastRaw, highPassed, CONFIG.filterAlpha);
    bandPassed = lowPassFilter(highPassed, bandPassed, CONFIG.lowPassAlpha);
    lastRaw = data;

    // Push to rolling buffer for pattern matching
    buffer.push({ ...bandPassed, time: now });
    if (buffer.length > CONFIG.bufferSize) {
      buffer.shift();
    }

    const location = getLocation();
    const speedMph = location ? msToMph(location.speed) : 0;

    if (isBump(bandPassed, now, speedMph)) {
      lastBumpTime = now;

      if (!location) return;

      // Check for pothole drop-bounce pattern
      const patternScore = detectPotholePattern();

      onBumpDetected({
        lat: location.latitude,
        lng: location.longitude,
        severity: calculateSeverity(bandPassed.z, patternScore, speedMph),
        speed: location.speed || 0,
        timestamp: new Date().toISOString(),
      });
    }
  });
}

export function stopDetection() {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
}
