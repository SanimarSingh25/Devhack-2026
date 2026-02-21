import React from 'react';
import { Heatmap } from 'react-native-maps';

export default function BumpHeatmap({ bumps }) {
  if (bumps.length === 0) return null;

  const points = bumps.map((bump) => ({
    latitude: bump.lat,
    longitude: bump.lng,
    weight: bump.severity,
  }));

  return (
    <Heatmap
      points={points}
      radius={40}
      opacity={0.7}
    />
  );
}
