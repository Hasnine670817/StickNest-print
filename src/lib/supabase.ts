import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lynzhatcrgdnfarkphfn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5bnpoYXRjcmdkbmZhcmtwaGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNzQwMjAsImV4cCI6MjA4ODg1MDAyMH0.MJ7BtG8TSvJzszSAAYB1vhZPGRUYo7UXa666hPn-npU';

console.log('Initializing Supabase...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Silent connection check
supabase.from('profiles').select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) console.warn('Supabase connection check:', error.message);
    else console.log('Supabase connected');
  });
