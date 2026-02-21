import React from 'react';
import { Circle } from 'react-native-maps';

function getSeverityColor(severity) {
  if (severity >= 4) return 'rgba(255, 0, 0, 0.35)';
  if (severity >= 2.5) return 'rgba(255, 165, 0, 0.35)';
  return 'rgba(255, 255, 0, 0.3)';
}

function getSeverityBorderColor(severity) {
  if (severity >= 4) return 'rgba(255, 0, 0, 0.6)';
  if (severity >= 2.5) return 'rgba(255, 165, 0, 0.6)';
  return 'rgba(255, 255, 0, 0.5)';
}

export default function BumpCircles({ bumps }) {
  return bumps.map((bump) => (
    <Circle
      key={bump.id}
      center={{ latitude: bump.lat, longitude: bump.lng }}
      radius={2 + bump.severity * 0.3}
      fillColor={getSeverityColor(bump.severity)}
      strokeColor={getSeverityBorderColor(bump.severity)}
      strokeWidth={1}
    />
  ));
}
