import { Accelerometer } from 'expo-sensors';

// ──  Improvements ─────────────────────────────────────
//
// Speed-based thresholds:
//   - Scale spikeThreshold by speed. At low speeds (<15 mph) the car
//     drops deeper into holes so spikes are bigger → raise threshold
//     (~1.5x) to avoid over-reporting. At high speeds (>50 mph) the
//     car skims over small stuff → lower threshold (~0.8x) so only
//     real hazards register.
//   - Add a minimum speed cutoff (~3 mph). Below that you're stopped
//     or parking and body movements trigger false positives.
//   - effectiveThreshold = baseThreshold * speedFactor(speed)
//
// Pattern matching (rolling buffer):
//   - Keep a buffer of the last ~30 readings (~500ms at 60Hz).
//   - Pothole signature: negative z spike (drop) followed by positive
//     z spike (bounce) within 50–200ms. Severity = drop depth + bounce
//     height. Drastically cuts false positives.
//   - Speed bump signature: slow rise, plateau, slow descent over
//     ~500ms+. Different severity category.
//   - Railroad tracks: two sharp spikes in quick succession (front
//     wheels then rear wheels).
//   - Road vibration: lots of tiny fast oscillations → ignore.
//
// Heading / turn dampening:
//   - Use gyroscope to detect sharp turns. Dampen or skip detection
//     during turns since lateral forces create z-axis noise.
//
// Consecutive / crowdsource confirmation:
//   - Query Supabase for nearby bumps. If multiple users flagged the
//     same GPS area, boost confidence score. Server-side aggregation.
//
// Frequency band-pass filter:
//   - Layer a low-pass on top of the existing high-pass to create a
//     band-pass isolating bump frequencies (~1–10 Hz). Rejects both
//     gravity drift (below) AND road vibration noise (above).
//
// Phone orientation compensation:
//   - Use gyroscope to rotate accelerometer readings into a
//     world-aligned frame. Makes detection work regardless of how
//     the phone is sitting (cupholder, mount, pocket, etc.).
//

// ── Config ──────────────────────────────────────────────────
// Tweak these to adjust sensitivity. All in one place so
// future improvements (adaptive thresholds, ML, etc.) can
// swap values or override them easily.
const CONFIG = {
  updateIntervalMs: 16,          // ~60 Hz sampling rate
  spikeThreshold: 1.2,           // filtered z (in Gs) to count as a bump
  cooldownMs: 800,               // ignore readings for this long after a bump
  filterAlpha: 0.8,              // high-pass filter strength (0–1, higher = more filtering)
  brakingYThreshold: 0.6,        // y-axis spike above this → probably braking, not a bump
  minSeverity: 1,                // clamp severity floor
  maxSeverity: 10,               // clamp severity ceiling
  severityScale: 3,              // multiplier to map spike magnitude → severity
};

// ── State ───────────────────────────────────────────────────
let subscription = null;
let lastRaw = { x: 0, y: 0, z: 0 };
let filtered = { x: 0, y: 0, z: 0 };
let lastBumpTime = 0;

// ── Filters ─────────────────────────────────────────────────
// Simple high-pass: removes the slow-moving component (gravity)
// so only sudden jolts remain. Replace this function with
// something fancier later without touching anything else.
function highPassFilter(current, previousRaw, previousFiltered, alpha) {
  return {
    x: alpha * (previousFiltered.x + current.x - previousRaw.x),
    y: alpha * (previousFiltered.y + current.y - previousRaw.y),
    z: alpha * (previousFiltered.z + current.z - previousRaw.z),
  };
}

// ── Severity ────────────────────────────────────────────────
// Maps the spike magnitude to a 1–10 severity score.
// Swap this out for a more nuanced calculation later.
function calculateSeverity(filteredZ) {
  const magnitude = Math.abs(filteredZ) - CONFIG.spikeThreshold;
  const raw = magnitude * CONFIG.severityScale + CONFIG.minSeverity;
  return Math.min(CONFIG.maxSeverity, Math.max(CONFIG.minSeverity, raw));
}

// ── Detection ───────────────────────────────────────────────
// Returns true if this reading qualifies as a bump.
// Separated so you can layer on extra checks (speed-based
// thresholds, pattern matching across multiple samples, etc.)
function isBump(filteredData, now) {
  const zMag = Math.abs(filteredData.z);

  // Not a big enough spike
  if (zMag < CONFIG.spikeThreshold) return false;

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
  // Reset filter state for a fresh session
  lastRaw = { x: 0, y: 0, z: 0 };
  filtered = { x: 0, y: 0, z: 0 };
  lastBumpTime = 0;

  Accelerometer.setUpdateInterval(CONFIG.updateIntervalMs);

  subscription = Accelerometer.addListener((data) => {
    // Run the high-pass filter
    filtered = highPassFilter(data, lastRaw, filtered, CONFIG.filterAlpha);
    lastRaw = data;

    const now = Date.now();

    if (isBump(filtered, now)) {
      lastBumpTime = now;

      const location = getLocation();
      if (!location) return; // no GPS fix yet, skip

      onBumpDetected({
        lat: location.latitude,
        lng: location.longitude,
        severity: calculateSeverity(filtered.z),
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
