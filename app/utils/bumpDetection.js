import { Accelerometer } from "expo-sensors";

let accelSub = null;

// memory for filter + cooldown
let lastRawZ = 0;
let lastHPZ = 0;
let lastBumpAt = 0;

// tunables
const HP_ALPHA = 0.9;
const Z_SPIKE_THRESHOLD = 1.8;
const BRAKE_Y_THRESHOLD = 1.2;
const COOLDOWN_MS = 1200;

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

function spikeToSeverity(spikeAbs) {
  const scaled = (spikeAbs - Z_SPIKE_THRESHOLD) * 4 + 1;
  return clamp(scaled, 0, 10);
}

// OPTIONAL: if you still want raw streaming without detection
export function startAccelerometer(onSample, intervalMs = 50) {
  if (accelSub) return;

  Accelerometer.setUpdateInterval(intervalMs);
  accelSub = Accelerometer.addListener(({ x, y, z }) => {
    onSample({ x, y, z, timestamp: Date.now() });
  });
}

export function stopAccelerometer() {
  if (!accelSub) return;
  accelSub.remove();
  accelSub = null;
}

export function startDetection(onBumpDetected, onDebugSample = null, intervalMs = 16) {
  if (accelSub) return;

  // reset state when starting
  lastRawZ = 0;
  lastHPZ = 0;
  lastBumpAt = 0;

  Accelerometer.setUpdateInterval(intervalMs);

  accelSub = Accelerometer.addListener(({ x, y, z }) => {
    const timestamp = Date.now();

    // high-pass filter on z
    const hpZ = HP_ALPHA * (lastHPZ + z - lastRawZ);
    lastRawZ = z;
    lastHPZ = hpZ;

    const spike = Math.abs(hpZ);
    const looksLikeBraking = Math.abs(y) > BRAKE_Y_THRESHOLD;
    const cooldownOver = timestamp - lastBumpAt > COOLDOWN_MS;

    let bump = false;
    let severity = 0;

    if (cooldownOver && !looksLikeBraking && spike > Z_SPIKE_THRESHOLD) {
      bump = true;
      lastBumpAt = timestamp;
      severity = spikeToSeverity(spike);

      onBumpDetected({ severity, timestamp }); // add lat/lng/speed later
    }

    if (onDebugSample) {
      onDebugSample({ x, y, z, hpZ, spike, looksLikeBraking, cooldownOver, bump, severity, timestamp });
    }
  });
}

export function stopDetection() {
  stopAccelerometer(); // same underlying subscription variable
}