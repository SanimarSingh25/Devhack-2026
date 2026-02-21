import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function uploadBump(bumpData) {
  const { error } = await supabase
    .from('bumps')
    .insert({
      lat: bumpData.lat,
      lng: bumpData.lng,
      severity: bumpData.severity,
      speed: bumpData.speed,
      timestamp: bumpData.timestamp,
    });

  if (error) {
    console.warn('Failed to upload bump:', error.message);
  }
}

export async function fetchBumps(boundingBox) {
  let query = supabase.from('bumps').select('*');

  if (boundingBox) {
    query = query
      .gte('lat', boundingBox.south)
      .lte('lat', boundingBox.north)
      .gte('lng', boundingBox.west)
      .lte('lng', boundingBox.east);
  }

  const { data, error } = await query;

  if (error) {
    console.warn('Failed to fetch bumps:', error.message);
    return [];
  }

  return data;
}

export default supabase;
