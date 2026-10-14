import { createClient } from '@supabase/supabase-js';

// Credenciales predeterminadas del proyecto central Supabase
const DEFAULT_URL = 'https://suqpveinkcuzskpebhgp.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cXB2ZWlua2N1enNrcGViaGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MzIzMzYsImV4cCI6MjEwNzUwODMzNn0.8NgDY71c62iABvqtohAT2bBZ2AhlctGteFvC7X-ggQw';

// Obtener credenciales desde variables de entorno, localStorage o default del proyecto
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('workshop_supabase_url') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('workshop_supabase_key') : null;

// Sanitizar y validar la URL de Supabase para evitar "Invalid path specified in request URL"
const cleanUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();
  url = url.replace(/^["']|["']$/g, '');
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1\/?$/, '');
  url = url.replace(/\/auth\/v1\/?$/, '');
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
};

const rawUrl = envUrl || storedUrl || DEFAULT_URL;
const rawKey = envKey || storedKey || DEFAULT_ANON_KEY;

export const supabaseUrl = cleanUrl(rawUrl);
export const supabaseAnonKey = (rawKey || '').trim().replace(/^["']|["']$/g, '');

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl.includes('.supabase.co') && 
  supabaseAnonKey && 
  supabaseAnonKey.length > 20
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    }) 
  : null;
