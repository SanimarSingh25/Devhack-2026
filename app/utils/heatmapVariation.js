import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'your_supabase_url_here';
const SUPABASE_ANON_KEY = 'your_supabase_anon_key_here';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function uploadBump(bumpData) {
    const { data, error } = await supabase
        .from('bumps')
        .insert([bumpData])

    if (error) console.error('Error uploading bump:', error);
    return data;
}

export async function fetchBumps(boundingBox) {
    const { data, error } = await supabase
        .from('bumps')
        .select('*')
        .gte('lat', boundingBox.minLat)
        .lte('lat', boundingBox.maxLat)
        .gte('lng', boundingBox.minLng)
        .lte('lng', boundingBox.maxLng);

    if (error) {
        console.error('Error fetching bumps:', error);
        return [];
    }
    return data;
}

const heatMapColors = {
    0.4 : '#FFD700',
    0.6 : '#FF5F1F',
    1.0 : '#FF0000'
}

export function getHeatMapColor(intensity) {
    if(intensity >= 0.75) return heatMapColors[1.0];
    else if(intensity >= 0.45) return heatMapColors[0.6];
    else return heatMapColors[0.4];
}

export async function getHeatMapPoints(boundingBox) {
    const bumps = await fetchBumps(boundingBox);

    return bumps.map(bump => ({
        lat: bump.lat,
        lng: bump.lng,
        intensity: bump.severity
    }));
}