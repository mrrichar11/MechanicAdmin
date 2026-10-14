import React, { useState } from 'react';
import { Wrench, Lock, Mail, Building2, User, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function AuthScreen({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        if (isRegistering) {
          const { data, error: supaErr } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                workshop_name: workshopName,
                owner_name: ownerName
              }
            }
          });
          if (supaErr) throw supaErr;
          
          onLoginSuccess({
            email: email,
            workshopName: workshopName || 'Mi Taller Mecánico',
            ownerName: ownerName || 'Titular',
            phone: phone,
            isOnline: true
          });
        } else {
          const { data, error: supaErr } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (supaErr) throw supaErr;

          onLoginSuccess({
            email: email,
            workshopName: data.user?.user_metadata?.workshop_name || 'Bosch Car Service',
            ownerName: data.user?.user_metadata?.owner_name || 'Iván Luque',
            isOnline: true
          });
        }
      } else {
        // Si Supabase no está configurado o sus credenciales son inválidas
        onLoginSuccess({
          email: email,
          workshopName: isRegistering ? (workshopName || 'Mi Taller Mecánico') : 'Bosch Car Service',
          ownerName: isRegistering ? (ownerName || 'Titular') : 'Iván Luque',
          phone: phone || '',
          isOnline: false
        });
      }
    } catch (err) {
      console.error('Error Auth:', err);
      // Si la URL guardada en localStorage era inválida y causa error de red
      if (err.message?.includes('Invalid path') || err.message?.includes('Failed to fetch')) {
        setError(`Error de conexión con Supabase (${err.message}). Si pegaste la URL con un path extra o espacios, límpiala en Configuración o borra la caché.`);
      } else {
        setError(err.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      
      {/* Tarjeta de Autenticación con Relieve */}
      <div className="bg-white border-2 border-slate-300 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Banner Superior con Logo */}
        <div className="bg-slate-950 p-6 text-center text-white border-b-2 border-slate-800">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="bg-[#cc0000] text-white px-2.5 py-0.5 font-black text-sm tracking-wider rounded">
              BOSCH
            </div>
            <span className="font-mono text-xs uppercase font-bold text-slate-400">Software Online</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">
            Sistema de Gestión de Taller Mecánico
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRegistering ? 'Crea la cuenta para tu taller mecánico' : 'Ingresa con tu usuario y contraseña'}
          </p>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-5 bg-white text-xs">
          
          {error && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3 rounded-xl font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nombre Comercial del Taller *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Bosch Car Service Luque"
                      value={workshopName}
                      onChange={(e) => setWorkshopName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-bold focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nombre y Apellido del Dueño / Titular *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Iván Luque"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-bold focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Teléfono o WhatsApp de Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej. 03493-15403364"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1">Correo Electrónico *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="ejemplo@taller.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Contraseña *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-md transition hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>{isRegistering ? 'Crear Cuenta y Entrar' : 'Iniciar Sesión'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Link para registro o login libre */}
          <div className="text-center pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-slate-600 hover:text-slate-950 font-bold text-xs"
            >
              {isRegistering 
                ? '¿Ya tienes una cuenta? Inicia sesión aquí' 
                : '¿Nuevo taller? Regístrate aquí para crear tu cuenta'}
            </button>
          </div>

        </div>

      </div>

      <div className="text-center mt-6 text-slate-500 text-xs font-semibold">
        Sincronización en la nube con Supabase • Despliegue continuo con GitHub
      </div>

    </div>
  );
}
