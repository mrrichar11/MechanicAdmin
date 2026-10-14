import React, { useState, useEffect } from 'react';
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
  LogOut,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function AdminWhatsAppConnectionModal({ 
  isOpen, 
  onClose 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [adminPin, setAdminPin] = useState('1234');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPinChange, setShowPinChange] = useState(false);
  const [newPin, setNewPin] = useState('');

  // Estado REAL de Baileys / WhatsApp
  const [serverOnline, setServerOnline] = useState(false);
  const [isRealConnected, setIsRealConnected] = useState(false);
  const [realQrCodeUrl, setRealQrCodeUrl] = useState(null);
  const [connectedUserPhone, setConnectedUserPhone] = useState(null);
  const [filterPrivacyActive, setFilterPrivacyActive] = useState(true);

  // URL del backend (detecta si está en localhost, IP local o configuración guardada)
  const isCloudHost = !['localhost', '127.0.0.1'].includes(window.location.hostname) && !window.location.hostname.startsWith('192.168.');
  
  const [customBackendUrl, setCustomBackendUrl] = useState(() => {
    return localStorage.getItem('workshop_whatsapp_backend_url') || '';
  });

  const apiBase = customBackendUrl.trim() 
    ? customBackendUrl.trim().replace(/\/$/, '')
    : (window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : `http://${window.location.hostname}:3001`);

  // Polling para consultar estado real de Baileys cuando el modal está abierto
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    const checkRealStatus = async () => {
      try {
        const res = await fetch(`${apiBase}/api/whatsapp/status`);
        if (res.ok) {
          const data = await res.json();
          setServerOnline(true);
          setIsRealConnected(data.isConnected);
          setRealQrCodeUrl(data.qrCodeDataUrl);
          if (data.user) {
            setConnectedUserPhone(data.user.id || data.user.name || 'Conectado');
          } else {
            setConnectedUserPhone(null);
          }
        }
      } catch (err) {
        setServerOnline(false);
      }
    };

    checkRealStatus();
    const interval = setInterval(checkRealStatus, 2500);
    return () => clearInterval(interval);
  }, [isOpen, isAuthenticated, apiBase]);

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

  const handleDisconnect = async () => {
    if (window.confirm('¿Deseas desvincular la sesión de WhatsApp del taller?')) {
      try {
        await fetch(`${apiBase}/api/whatsapp/disconnect`, { method: 'POST' });
        setIsRealConnected(false);
        setRealQrCodeUrl(null);
      } catch (e) {
        alert('Error al desconectar');
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
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
                  Conector Real de WhatsApp (Baileys)
                </h2>
                <span className="bg-slate-800 text-amber-400 border border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Exclusivo Administrador
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isAuthenticated 
                  ? 'Sesión de Administrador Desbloqueada (Privacidad Activa)' 
                  : 'Ingresa tu PIN para ver el código QR y proteger tus chats personales'}
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

        {/* PANTALLA DE ACCESO POR PIN (PROTECCIÓN DE PRIVACIDAD) */}
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
                Para que nadie en el taller pueda ver o vincular tu WhatsApp personal, el conector y el código QR están protegidos con contraseña.
              </p>
            </div>

            <form onSubmit={handleLogin} className="max-w-xs mx-auto space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-left">
                  Ingresa tu PIN de Administrador (Por defecto: 1234):
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  placeholder="••••"
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
                Desbloquear Conexión WhatsApp
              </button>
            </form>
          </div>
        ) : (
          /* PANTALLA REAL CON CÓDIGO QR DE WHATSAPP */
          <div className="p-6 space-y-5 bg-slate-50/50">
            
            {/* Tarjeta de Estado del Conector */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full ${
                    isRealConnected ? 'bg-emerald-500 animate-pulse' : (realQrCodeUrl ? 'bg-amber-500' : 'bg-slate-400')
                  }`} />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      {isRealConnected ? '✅ WhatsApp Vinculado y Recibiendo Mensajes' : '📲 Esperando Vinculación de WhatsApp'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isRealConnected 
                        ? `Línea activa: ${connectedUserPhone || 'Tu número de teléfono'}`
                        : 'Escanea el código QR de abajo con tu celular para vincular'}
                    </p>
                  </div>
                </div>

                {isRealConnected && (
                  <button
                    onClick={handleDisconnect}
                    className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition shadow-2xs"
                  >
                    Desvincular
                  </button>
                )}
              </div>

              {/* CONTENEDOR DEL CÓDIGO QR REAL */}
              {!isRealConnected && (
                <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-emerald-400 text-center space-y-4">
                  {realQrCodeUrl ? (
                    <div className="space-y-3">
                      <div className="inline-block p-3 bg-white border-2 border-slate-300 rounded-2xl shadow-lg">
                        {/* IMAGEN DEL CÓDIGO QR REAL EMITIDO POR WHATSAPP */}
                        <img 
                          src={realQrCodeUrl} 
                          alt="Código QR Real de WhatsApp" 
                          className="w-64 h-64 mx-auto block rounded-lg"
                        />
                      </div>
                      <p className="text-xs font-black text-emerald-800">
                        ⚡ Código QR emitido en vivo por WhatsApp. Se actualiza automáticamente.
                      </p>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs font-bold text-slate-500 space-y-2">
                      <RefreshCw className="w-6 h-6 mx-auto animate-spin text-emerald-600" />
                      <p>Generando código QR desde WhatsApp Web...</p>
                    </div>
                  )}

                  {/* Alerta de conexión cuando el servidor Node no responde o se navega desde la nube */}
                  {!serverOnline && (
                    <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-xl text-left text-xs space-y-2">
                      <div className="flex items-center gap-2 text-amber-900 font-bold">
                        <AlertCircle className="w-4 h-4 text-amber-700" />
                        <span>El conector Node.js de WhatsApp está en tu computadora local</span>
                      </div>
                      <p className="text-amber-800 text-[11px] leading-relaxed">
                        Como estás navegando desde Vercel (<code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200">{window.location.hostname}</code>), el navegador no puede conectarse por seguridad directamente a tu <code className="font-mono">localhost:3001</code>.
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-amber-200 text-[11px] space-y-2">
                        <p className="font-bold text-slate-900">👉 Para ver el QR ahora mismo:</p>
                        <p className="text-slate-700">
                          Abrí la aplicación directamente desde tu computadora en: <br />
                          <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="text-blue-600 font-black underline">http://localhost:5173</a> o en tu red Wi-Fi: <a href="http://192.168.5.88:5173" target="_blank" rel="noreferrer" className="text-blue-600 font-black underline">http://192.168.5.88:5173</a>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-slate-700 max-w-sm mx-auto bg-white p-3.5 rounded-xl border border-slate-200 text-left space-y-1.5 shadow-2xs">
                    <p className="font-bold text-slate-900">Pasos para escanear con tu celular:</p>
                    <p>1. Abre <strong>WhatsApp</strong> en tu teléfono.</p>
                    <p>2. Toca los tres puntos o Configuración ➡️ <strong>Dispositivos vinculados</strong>.</p>
                    <p>3. Toca <strong>Vincular un dispositivo</strong> y apunta tu cámara a este código QR.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Filtro de Privacidad */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm text-xs">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterPrivacyActive}
                  onChange={(e) => setFilterPrivacyActive(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-900 block">
                    🔒 Protección activa de chats personales
                  </span>
                  <span className="text-slate-500 leading-relaxed block mt-0.5 text-[11px]">
                    El conector solo extrae datos cuando el mensaje contiene una patente o te lo mandas a ti mismo ("Mensajes a ti mismo"). Tus chats privados con familia y amigos son ignorados por completo.
                  </span>
                </div>
              </label>
            </div>

            {/* Administrar PIN de Acceso */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">PIN de Administrador: ••••</span>
                <span className="text-slate-500 text-[11px]">Cambia la clave para que nadie en el taller pueda ver esta sección</span>
              </div>
              <button
                onClick={() => setShowPinChange(!showPinChange)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition border border-slate-300"
              >
                {showPinChange ? 'Cancelar' : 'Cambiar PIN'}
              </button>
            </div>

            {showPinChange && (
              <form onSubmit={handleChangePin} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2">
                <input
                  type="password"
                  placeholder="Nuevo PIN (ej. 7842)"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs"
                >
                  Guardar
                </button>
              </form>
            )}

          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
            {serverOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>Servidor Baileys activo en puerto 3001</span>
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
