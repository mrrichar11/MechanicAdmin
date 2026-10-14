import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Bot, 
  CheckCheck, 
  Sparkles, 
  X, 
  Car, 
  Wrench, 
  Package, 
  CheckCircle2, 
  ArrowRight,
  Volume2,
  AlertCircle
} from 'lucide-react';

export default function MechanicAssistantModal({ 
  isOpen, 
  onClose, 
  onNewDraftCreated, 
  existingVehicles = [],
  onOpenOrderDirectly
}) {
  const [messageText, setMessageText] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: '👋 ¡Hola! Soy tu Asistente de Carga Rápida.\n\nPodés hablarme directamente con el micrófono o escribirme. Decime la patente (o elegila arriba), kilometraje y lo que le hiciste al auto. Yo te armo el borrador al instante.',
      time: 'Ahora'
    }
  ]);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Inicializar Speech Recognition del navegador (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-AR'; // Español de Argentina

      recognition.onresult = (event) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setLiveTranscript(current);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Permiso de micrófono denegado. Habilitá el micrófono en tu navegador para dictar notas.');
        }
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
        clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      clearInterval(timerRef.current);
    };
  }, []);

  // Auto-scroll del chat
  useEffect(() => {
    if (isOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, liveTranscript, isOpen]);

  if (!isOpen) return null;

  // Iniciar dictado por voz real
  const startListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      // Si el navegador no lo soporta, simular captura de audio de prueba
      handleSimulatedVoice();
      return;
    }

    try {
      if (navigator.vibrate) navigator.vibrate([40]);
      setLiveTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Error starting speech recognition:', err);
    }
  };

  // Detener dictado y procesar lo que se dijo
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    clearInterval(timerRef.current);
    setIsListening(false);

    if (liveTranscript.trim()) {
      handleProcessMessage(liveTranscript.trim(), 'audio');
      setLiveTranscript('');
    }
  };

  // Fallback simulado para navegadores sin Speech API
  const handleSimulatedVoice = () => {
    setIsListening(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds(s => {
        if (s >= 3) {
          clearInterval(timerRef.current);
          setIsListening(false);
          const demoText = selectedVehicle 
            ? `Cambié polea de cigüeñal y tensor móvil original. Purgué refrigerante Motul coolant. 104780 km.`
            : `Patente AF 018 OO, Mercedes C200. Cambié polea cigüeñal y tensor original. Refrigerante Motul. Odómetro 104780 km.`;
          handleProcessMessage(demoText, 'audio');
          return 0;
        }
        return s + 1;
      });
    }, 1000);
  };

  // Enviar texto manual
  const handleSendText = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    handleProcessMessage(messageText.trim(), 'text');
    setMessageText('');
  };

  // Extractor de Patente
  const extractPlate = (text) => {
    if (!text) return null;
    const mercosur = text.match(/\b([A-Za-z]{2})\s*(\d{3})\s*([A-Za-z]{2})\b/i);
    if (mercosur) return `${mercosur[1].toUpperCase()} ${mercosur[2]} ${mercosur[3].toUpperCase()}`;

    const legacy = text.match(/\b([A-Za-z]{3})\s*(\d{3})\b/i);
    if (legacy) {
      const letters = legacy[1].toUpperCase();
      if (!['DEL', 'POR', 'QUE', 'LOS', 'LAS', 'CON', 'SIN', 'ROD', 'MAS'].includes(letters)) {
        return `${letters} ${legacy[2]}`;
      }
    }
    return null;
  };

  // Parser inteligente para extraer datos del mensaje
  const handleProcessMessage = (rawText, sourceType = 'text') => {
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: rawText,
      sourceType: sourceType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const lower = rawText.toLowerCase();

      // 1. Determinar Patente
      let detectedPlate = extractPlate(rawText);
      if (!detectedPlate && selectedVehicle) {
        detectedPlate = selectedVehicle.plate;
      }
      if (!detectedPlate) {
        // Buscar en los vehículos cargados si menciona algún modelo o apellido de cliente
        const found = existingVehicles.find(v => 
          lower.includes(v.plate.toLowerCase().replace(/\s+/g, '')) ||
          lower.includes(v.model.toLowerCase()) ||
          lower.includes(v.clientName.toLowerCase())
        );
        detectedPlate = found ? found.plate : (existingVehicles[0]?.plate || "AF 018 OO");
      }

      const matchedVeh = existingVehicles.find(
        v => v.plate.replace(/\s+/g, '') === detectedPlate.replace(/\s+/g, '')
      ) || existingVehicles[0] || { plate: detectedPlate, model: 'Vehículo', currentKm: 100000, clientName: 'Cliente' };

      // 2. Kilometraje
      let km = matchedVeh.currentKm || 100000;
      const kmMatch = rawText.match(/(\d{2,3}[\.,]?\d{3})\s*(km|kms|mil)?/i);
      if (kmMatch) {
        km = parseInt(kmMatch[1].replace(/[\.,]/g, ''), 10);
      } else {
        const milMatch = rawText.match(/(\d{2,3})\s*mil/i);
        if (milMatch) {
          km = parseInt(milMatch[1], 10) * 1000;
        }
      }

      // 3. Tareas y Repuestos
      const tasks = [];
      const parts = [];

      if (lower.includes("polea")) {
        tasks.push("Revisión y sustitución de polea de cigüeñal / inversión.");
        parts.push({ description: "Polea de cigüeñal", brand: "Original", unitPrice: 257064, qty: 1 });
      }
      if (lower.includes("tensor")) {
        tasks.push("Reemplazo de tensor móvil de correa de accesorios.");
        parts.push({ description: "Tensor de correa", brand: "Original", unitPrice: 411706.75, qty: 1 });
      }
      if (lower.includes("correa")) {
        tasks.push("Cambio de correa Poli-V de accesorios.");
        parts.push({ description: "Correa Poli-V", brand: "Continental", unitPrice: 48000, qty: 1 });
      }
      if (lower.includes("refrigerante") || lower.includes("motul") || lower.includes("coolant")) {
        tasks.push("Carga, purgado y control de líquido refrigerante.");
        parts.push({ description: "Refrigerante motor Coolant", brand: "Motul", unitPrice: 79655, qty: 1 });
      }
      if (lower.includes("aceite") || lower.includes("filtro") || lower.includes("service")) {
        tasks.push("Service programado de cambio de aceite y filtros.");
        parts.push({ description: "Aceite sintético 5W40", brand: "Motul 8100", unitPrice: 125000, qty: 1 });
        parts.push({ description: "Filtro de aceite", brand: "Mann / Bosch", unitPrice: 32000, qty: 1 });
      }
      if (lower.includes("freno") || lower.includes("pastilla") || lower.includes("disco")) {
        tasks.push("Inspección y reemplazo de pastillas de freno delanteras.");
        parts.push({ description: "Juego de pastillas de freno", brand: "Bosch", unitPrice: 98000, qty: 1 });
      }
      if (lower.includes("rodamiento") || lower.includes("ruleman")) {
        tasks.push("Extracción y sustitución de rodamiento / rulemán.");
        parts.push({ description: "Rodamiento de rueda", brand: "SKF", unitPrice: 85000, qty: 1 });
      }
      if (lower.includes("radiador")) {
        tasks.push("Limpieza y sopleteado de paneles de radiador e intercooler.");
      }
      if (lower.includes("escan") || lower.includes("diagnostico") || lower.includes("scanner")) {
        tasks.push("Diagnóstico computarizado y escaneo con borrado de averías.");
      }
      if (lower.includes("amortiguador")) {
        tasks.push("Reemplazo de par de amortiguadores y topes.");
        parts.push({ description: "Amortiguadores", brand: "Monroe", unitPrice: 185000, qty: 2 });
      }

      if (tasks.length === 0) {
        tasks.push(rawText.trim());
      }

      const newDraft = {
        id: `draft-app-${Date.now()}`,
        sender: "Asistente Mecánico (Móvil)",
        timestamp: "Recién (Asistente)",
        sourceType: sourceType,
        rawContent: rawText,
        detectedPlate: matchedVeh.plate,
        vehicleModel: `${matchedVeh.model} (${matchedVeh.clientName || 'Cliente'})`,
        status: "pending",
        parsedData: {
          km: km,
          tasks: tasks,
          parts: parts
        }
      };

      // Notificar al componente principal
      onNewDraftCreated(newDraft);

      // Sincronizar en segundo plano con el servidor local si está activo
      try {
        fetch('http://localhost:3001/api/whatsapp/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newDraft)
        }).catch(() => {});
      } catch (e) {}

      // Respuesta del Asistente
      const botReply = {
        id: Date.now() + 1,
        sender: 'bot',
        plate: matchedVeh.plate,
        model: matchedVeh.model,
        km: km,
        tasks: tasks,
        parts: parts,
        draft: newDraft,
        text: `✅ ¡Borrador generado con éxito! Reconocí el vehículo ${matchedVeh.plate} (${matchedVeh.model}).`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botReply]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border-2 border-slate-300 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[92vh]">
        
        {/* Header del Asistente */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b-2 border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md font-black">
              <Mic className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="font-black text-sm flex items-center gap-2">
                Asistente de Carga Rápida
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  En línea
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Dictá con voz o escribí tus notas sin salir del taller
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Selección Rápida de Vehículo */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 text-xs">
          <span className="text-slate-500 font-black shrink-0 flex items-center gap-1 text-[11px]">
            <Car className="w-3.5 h-3.5 text-slate-600" /> Auto:
          </span>
          <button
            onClick={() => setSelectedVehicle(null)}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition text-xs border ${
              selectedVehicle === null
                ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Autodetectar
          </button>
          {existingVehicles.slice(0, 6).map((veh) => (
            <button
              key={veh.id}
              onClick={() => setSelectedVehicle(veh)}
              className={`px-2.5 py-1 rounded-lg font-mono font-black shrink-0 transition text-xs border flex items-center gap-1.5 ${
                selectedVehicle?.id === veh.id
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{veh.plate}</span>
              <span className="text-[10px] font-sans font-normal opacity-80">{veh.model?.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#f8fafc]">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex flex-col max-w-[90%] sm:max-w-[85%] ${m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div 
                className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs border ${
                  m.sender === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none border-emerald-700' 
                    : 'bg-white text-slate-900 rounded-tl-none border-slate-200 shadow-sm'
                }`}
              >
                {/* Header si es audio */}
                {m.sourceType === 'audio' && (
                  <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-emerald-500/40 text-emerald-100 font-bold text-[11px]">
                    <Mic className="w-3.5 h-3.5" />
                    <span>Nota dictada por voz</span>
                  </div>
                )}

                <p className="whitespace-pre-line text-xs font-medium">{m.text}</p>

                {/* Resumen interactivo si el bot detectó datos */}
                {m.sender === 'bot' && m.plate && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="bg-slate-900 text-amber-400 font-mono font-black px-2 py-0.5 rounded">
                        {m.plate}
                      </span>
                      <span className="text-slate-600 font-bold">
                        {m.model}
                      </span>
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-mono font-bold ml-auto">
                        {m.km?.toLocaleString()} km
                      </span>
                    </div>

                    {m.tasks && m.tasks.length > 0 && (
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80 space-y-1">
                        <div className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-slate-600" /> Tareas detectadas ({m.tasks.length}):
                        </div>
                        <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5">
                          {m.tasks.map((t, idx) => (
                            <li key={idx} className="leading-tight">{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {m.parts && m.parts.length > 0 && (
                      <div className="bg-amber-50/70 p-2 rounded-lg border border-amber-200/80 space-y-1">
                        <div className="text-[10px] font-black uppercase text-amber-800 flex items-center gap-1">
                          <Package className="w-3 h-3 text-amber-700" /> Repuestos detectados ({m.parts.length}):
                        </div>
                        <div className="space-y-0.5 text-[11px] text-amber-950 font-medium">
                          {m.parts.map((p, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span>• {p.description} ({p.brand})</span>
                              <span className="font-mono font-bold">${p.unitPrice?.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Borrador añadido a la bandeja de órdenes</span>
                      </div>
                      {onOpenOrderDirectly && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenOrderDirectly(m.draft);
                          }}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded text-[11px] font-black shrink-0 transition flex items-center gap-1 shadow-xs"
                        >
                          Abrir Orden <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className={`text-[10px] mt-1 flex items-center gap-1 ${m.sender === 'user' ? 'text-emerald-200 justify-end' : 'text-slate-400'}`}>
                  <span>{m.time}</span>
                  {m.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
            </div>
          ))}

          {/* Grabación en tiempo real */}
          {isListening && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-rose-800 font-bold text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
                  <span>Escuchando tu voz... Hablá cerca del teléfono ({recordingSeconds}s)</span>
                </div>
                <button
                  type="button"
                  onClick={stopListening}
                  className="bg-rose-600 text-white px-3 py-1 rounded-lg text-xs font-black shadow-xs hover:bg-rose-700"
                >
                  Detener y Guardar
                </button>
              </div>
              <p className="text-xs text-rose-950 font-medium italic min-h-[20px]">
                {liveTranscript || "Decí la patente, km y lo que cambiaste..."}
              </p>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Ejemplos Rápidos de Prueba */}
        <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 text-xs">
          <span className="text-slate-400 text-[11px] font-bold shrink-0">Ejemplos:</span>
          <button
            onClick={() => setMessageText("Patente AF 018 OO Mercedes: cambié polea cigüeñal y tensor original. 104780 km.")}
            className="shrink-0 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md text-slate-700 border border-slate-200 transition text-[11px]"
          >
            Mercedes AF 018 OO (Polea/Tensor)
          </button>
          <button
            onClick={() => setMessageText("Hilux AE 452 XY le hicimos service completo de aceite y filtros. 142300 km.")}
            className="shrink-0 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md text-slate-700 border border-slate-200 transition text-[11px]"
          >
            Hilux AE 452 XY (Service)
          </button>
          <button
            onClick={() => setMessageText("Amarok AC 891 LK cambié pastillas de freno y rodamientos delanteros. 189000 km.")}
            className="shrink-0 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md text-slate-700 border border-slate-200 transition text-[11px]"
          >
            Amarok AC 891 LK (Frenos)
          </button>
        </div>

        {/* Input Bar con Botón de Micrófono Prominente */}
        <div className="bg-slate-50 p-3 border-t-2 border-slate-200 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`p-3 rounded-xl transition flex items-center justify-center font-bold shadow-md ${
              isListening 
                ? 'bg-rose-600 text-white animate-bounce ring-4 ring-rose-200' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title={isListening ? "Detener grabación" : "Dictar por voz"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <form onSubmit={handleSendText} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={selectedVehicle ? `Dictá o escribí para ${selectedVehicle.plate}...` : "Escribí o dictá: 'Patente AF 018 OO, cambié...'"}
              className="flex-1 bg-white text-slate-900 text-xs px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-emerald-600 focus:outline-none placeholder:text-slate-400 font-medium"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-amber-400 transition shadow-sm"
              title="Enviar"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
