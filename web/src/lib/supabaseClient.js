import { createClient } from '@supabase/supabase-js';

// Obtener credenciales desde variables de entorno o desde configuración guardada
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const storedUrl = localStorage.getItem('workshop_supabase_url');
const storedKey = localStorage.getItem('workshop_supabase_key');

// Sanitizar y validar la URL de Supabase para evitar "Invalid path specified in request URL"
const cleanUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();
  // Si fue pegado con comillas o espacios
  url = url.replace(/^["']|["']$/g, '');
  // Quitar barra final o paths incorrectos pegados por accidente (ej: /rest/v1 o /auth/v1)
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1\/?$/, '');
  url = url.replace(/\/auth\/v1\/?$/, '');
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
};

const rawUrl = envUrl || storedUrl || '';
const rawKey = envKey || storedKey || '';

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
