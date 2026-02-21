import { createClient } from '@supabase/supabase-js';

// TODO: replace with your Supabase project credentials
const SUPABASE_URL = 'your_supabase_url_here';
const SUPABASE_KEY = 'your_supabase_anon_key_here';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function uploadBump(bumpData) {
  // TODO: insert bump into Supabase bumps table
}

export async function fetchBumps(boundingBox) {
  // TODO: fetch bumps from Supabase, optionally filtered by map area
}

export default supabase;
