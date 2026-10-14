import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  X, 
  RefreshCw, 
  KeyRound, 
  Eye, 
  EyeOff, 
  LogOut,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function AdminWhatsAppConnectionModal({ 
  isOpen, 
  onClose, 
  onSimulateLink 
}) {
  // Estado de autenticación del Administrador
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [adminPin, setAdminPin] = useState('1234'); // PIN por defecto de Iván
  const [errorMessage, setErrorMessage] = useState('');
  const [showPinChange, setShowPinChange] = useState(false);
  const [newPin, setNewPin] = useState('');

  // Estado de la conexión de WhatsApp
  const [connectionStatus, setConnectionStatus] = useState('connected'); // 'disconnected' | 'connecting' | 'connected'
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const [filterPrivacyActive, setFilterPrivacyActive] = useState(true);

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === adminPin) {
      setIsAuthenticated(true);
      setErrorMessage('');
      setPinInput('');
    } else {
      setErrorMessage('Contraseña incorrecta. Solo el dueño/administrador tiene acceso.');
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setErrorMessage('');
    setShowPinChange(false);
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    if (newPin.length >= 4) {
      setAdminPin(newPin);
      setShowPinChange(false);
      setNewPin('');
      alert('PIN de administrador actualizado correctamente.');
    } else {
      alert('El PIN debe tener al menos 4 dígitos.');
    }
  };

  const handleGenerateQR = () => {
    setConnectionStatus('connecting');
    setQrCodeGenerated(true);
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 4000);
  };

  const handleDisconnect = () => {
    if (window.confirm('¿Seguro que deseas desvincular el WhatsApp del taller? Tendrás que escanear el QR nuevamente.')) {
      setConnectionStatus('disconnected');
      setQrCodeGenerated(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleLogout();
          onClose();
        }
      }}
    >
      <div className="bg-white border-2 border-slate-300 text-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col">
        
        {/* Header con indicador de Seguridad */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isAuthenticated ? 'bg-emerald-600' : 'bg-amber-500 text-slate-950'}`}>
              {isAuthenticated ? <Unlock className="w-5 h-5 text-white" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black tracking-tight">
                  Conexión WhatsApp del Taller
                </h2>
                <span className="bg-slate-800 text-amber-400 border border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Solo Administrador
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isAuthenticated ? 'Sesión de Administrador Activa (Iván Luque)' : 'Área protegida por contraseña para privacidad de chats personales'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition border border-slate-700"
                title="Bloquear pantalla"
              >
                <LogOut className="w-3.5 h-3.5" /> Bloquear
              </button>
            )}
            <button
              onClick={() => {
                handleLogout();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENIDO BLOQUEADO (PANTALLA DE ACCESO PIN) */}
        {!isAuthenticated ? (
          <div className="p-8 text-center space-y-6 bg-slate-50">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto">
              <h3 className="text-base font-black text-slate-900">
                Acceso Exclusivo para el Dueño
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Por seguridad y privacidad de tus conversaciones personales y familiares en WhatsApp, la visualización de chats y la configuración del conector están restringidas.
              </p>
            </div>

            <form onSubmit={handleLogin} className="max-w-xs mx-auto space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-left">
                  Ingresa tu PIN o Contraseña de Administrador:
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  placeholder="PIN (Por defecto: 1234)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-2.5 text-center text-slate-900 font-mono text-base font-bold tracking-widest focus:outline-none focus:border-slate-800 shadow-inner"
                />
              </div>

              {errorMessage && (
                <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition hover:shadow-lg hover:-translate-y-0.5"
              >
                Desbloquear Panel de WhatsApp
              </button>
            </form>

            <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-4 max-w-sm mx-auto">
              💡 <strong>Nota de privacidad:</strong> Los empleados y mecánicos solo ven las órdenes técnicas ya parseadas de los vehículos, nunca tus chats personales.
            </div>
          </div>
        ) : (
          /* CONTENIDO DESBLOQUEADO (CONFIGURACIÓN Y QR DE WHATSAPP) */
          <div className="p-6 space-y-6 bg-slate-50/50">
            
            {/* Estado de la Conexión */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      {connectionStatus === 'connected' ? 'WhatsApp Vinculado y Activo' : 'WhatsApp Desconectado'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {connectionStatus === 'connected' 
                        ? 'Línea conectada: Iván Luque (+54 9 3493 15-403364)' 
                        : 'Escanea el código QR desde tu celular para activar el bot del taller'}
                    </p>
                  </div>
                </div>

                {connectionStatus === 'connected' ? (
                  <button
                    onClick={handleDisconnect}
                    className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition shadow-2xs"
                  >
                    Desvincular
                  </button>
                ) : (
                  <button
                    onClick={handleGenerateQR}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4" /> Generar Código QR
                  </button>
                )}
              </div>

              {/* Si está en proceso de conexión / mostrando QR */}
              {connectionStatus === 'connecting' && (
                <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-emerald-400 text-center space-y-3">
                  <div className="w-48 h-48 bg-white border-2 border-slate-300 mx-auto rounded-xl flex items-center justify-center p-3 shadow-md">
                    {/* QR Mockup visual interactivo */}
                    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 rounded-lg p-2 text-white">
                      <QrCode className="w-28 h-28 text-white mx-auto animate-pulse" />
                      <span className="text-[10px] font-mono font-bold mt-1 text-emerald-400">Escaneando...</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-700 max-w-sm mx-auto">
                    <p className="font-bold">1. Abre WhatsApp en tu celular</p>
                    <p>2. Ve a <strong>Ajustes ➡️ Dispositivos Vinculados ➡️ Vincular un dispositivo</strong></p>
                    <p>3. Apunta tu cámara hacia este código QR</p>
                  </div>
                </div>
              )}
            </div>

            {/* Configuración de Filtros de Privacidad */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Filtro de Privacidad y Procesamiento Inteligente
              </h4>

              <div className="space-y-2 text-xs">
                <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
                  <input
                    type="checkbox"
                    checked={filterPrivacyActive}
                    onChange={(e) => setFilterPrivacyActive(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Aislar automáticamente los chats personales
                    </span>
                    <span className="text-slate-500 leading-relaxed block mt-0.5 text-[11px]">
                      El sistema solo analiza mensajes que contengan una patente de auto o que te envíes a tu propio chat personal ("Mensajes a ti mismo"). Todos los demás chats (familia, grupos de amigos) son ignorados por completo y nunca se almacenan.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Administrar PIN de Acceso */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-slate-700" />
                    PIN de Seguridad del Administrador
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    PIN actual: <strong className="font-mono">••••</strong> (cámbialo cuando quieras para que nadie en el taller pueda ver esta sección)
                  </p>
                </div>
                <button
                  onClick={() => setShowPinChange(!showPinChange)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition border border-slate-300"
                >
                  {showPinChange ? 'Cancelar' : 'Cambiar PIN'}
                </button>
              </div>

              {showPinChange && (
                <form onSubmit={handleChangePin} className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2 max-w-sm">
                  <input
                    type="password"
                    placeholder="Nuevo PIN (ej. 5821)"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition shadow-xs"
                  >
                    Guardar
                  </button>
                </form>
              )}
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-semibold">
            Tecnología: Gateway Evolution API / Baileys con Cifrado Local
          </span>
          <button
            onClick={() => {
              handleLogout();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition shadow-xs"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
}
