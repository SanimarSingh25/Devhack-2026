import React from 'react';
import { Platform } from 'react-native';
import { Circle } from 'react-native-maps';

let NativeHeatmap = null;
if (Platform.OS === 'android') {
  NativeHeatmap = require('react-native-maps').Heatmap;
}

// ── Fake heatmap for iOS ────────────────────────────────────
// Concentric circles per bump. Where bumps overlap, transparency
// stacks and the area looks "hotter" — approximates a gradient.

const LAYERS = [
  { radiusScale: 3.0, opacity: 0.05 },
  { radiusScale: 2.0, opacity: 0.10 },
  { radiusScale: 1.2, opacity: 0.20 },
  { radiusScale: 0.5, opacity: 0.35 },
];

function getColor(severity, opacity) {
  if (severity >= 4) return `rgba(255, 30, 0, ${opacity})`;
  if (severity >= 2.5) return `rgba(255, 140, 0, ${opacity})`;
  return `rgba(255, 220, 0, ${opacity})`;
}

function FakeHeatmap({ bumps }) {
  const baseRadius = 2;

  return bumps.flatMap((bump) =>
    LAYERS.map((layer, i) => (
      <Circle
        key={`${bump.id}-${i}`}
        center={{ latitude: bump.lat, longitude: bump.lng }}
        radius={(baseRadius + bump.severity * 0.3) * layer.radiusScale}
        fillColor={getColor(bump.severity, layer.opacity)}
        strokeColor="transparent"
        strokeWidth={0}
      />
    ))
  );
}

// ── Real heatmap for Android ────────────────────────────────

function RealHeatmap({ bumps }) {
  const points = bumps.map((bump) => ({
    latitude: bump.lat,
    longitude: bump.lng,
    weight: bump.severity,
  }));

  return (
    <NativeHeatmap
      points={points}
      radius={15}
      opacity={0.7}
    />
  );
}

// ── Public component ────────────────────────────────────────

export default function BumpHeatmap({ bumps }) {
  if (bumps.length === 0) return null;

  if (NativeHeatmap) {
    return <RealHeatmap bumps={bumps} />;
  }

  return <FakeHeatmap bumps={bumps} />;
}
