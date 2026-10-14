import { createClient } from '@supabase/supabase-js';

// Obtener credenciales desde variables de entorno o desde configuración guardada
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const storedUrl = localStorage.getItem('workshop_supabase_url');
const storedKey = localStorage.getItem('workshop_supabase_key');

export const supabaseUrl = envUrl || storedUrl || '';
export const supabaseAnonKey = envKey || storedKey || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
