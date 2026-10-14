import React, { useState } from 'react';
import { Mic, Send, Bot, CheckCheck, Sparkles, X } from 'lucide-react';

export default function WhatsAppSimulator({ isOpen, onClose, onNewDraftCreated, existingVehicles }) {
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '👋 ¡Hola Iván! Enviame audios o notas de texto con la patente del auto y lo que vas haciendo. Yo te armo el borrador de la orden de trabajo automáticamente.',
      time: '08:00'
    }
  ]);

  if (!isOpen) return null;

  const handleSimulateAudio = () => {
    setIsRecording(true);
    let sec = 0;
    const interval = setInterval(() => {
      sec++;
      setRecordingSeconds(sec);
      if (sec >= 3) {
        clearInterval(interval);
        setIsRecording(false);
        setRecordingSeconds(0);
        // Dispatch simulated audio message
        sendProcessedMessage(
          "Audio de WhatsApp (0:38): 'Patente AF 018 OO, Mercedes de BHY. Cambié polea cigüeñal y tensor original. Le puse refrigerante Motul coolant. Pendiente: limpieza de radiadores y control de amortiguadores traseros. Odómetro 104780 km.'",
          "audio",
          "AF 018 OO"
        );
      }
    }, 1000);
  };

  const handleSendText = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    // Intenta detectar patente
    let detected = "AF 018 OO";
    if (messageText.toUpperCase().includes("AE 452") || messageText.toUpperCase().includes("HILUX")) {
      detected = "AE 452 XY";
    } else if (messageText.toUpperCase().includes("AC 891") || messageText.toUpperCase().includes("AMAROK")) {
      detected = "AC 891 LK";
    }

    sendProcessedMessage(messageText, "text", detected);
    setMessageText('');
  };

  const sendProcessedMessage = (rawText, type, defaultPlate) => {
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: rawText,
      type: type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const matchedVeh = existingVehicles.find(v => v.plate.replace(/\s+/g, '') === defaultPlate.replace(/\s+/g, '')) || existingVehicles[0];

      const tasks = [];
      const parts = [];
      let km = matchedVeh.currentKm;

      if (rawText.toLowerCase().includes("polea")) {
        tasks.push("Sustitución de polea de cigüeñal y poleas de inversión.");
        parts.push({ description: "Polea de cigüeñal", brand: "Original", unitPrice: 257064, qty: 1 });
      }
      if (rawText.toLowerCase().includes("tensor")) {
        tasks.push("Reemplazo de tensor móvil de correa de accesorios.");
        parts.push({ description: "Tensor de correa", brand: "Original", unitPrice: 411706.75, qty: 1 });
      }
      if (rawText.toLowerCase().includes("refrigerante") || rawText.toLowerCase().includes("motul")) {
        tasks.push("Purgado y carga de líquido refrigerante de motor.");
        parts.push({ description: "Refrigerante motor Coolant", brand: "Motul", unitPrice: 79655, qty: 1 });
      }
      if (rawText.toLowerCase().includes("radiador")) {
        tasks.push("Limpieza y sopleteado de panel de radiadores.");
      }
      if (rawText.toLowerCase().includes("aceite") || rawText.toLowerCase().includes("service")) {
        tasks.push("Cambio de aceite de motor y filtros correspondientes.");
        parts.push({ description: "Aceite sintético", brand: "Motul 8100", unitPrice: 125000, qty: 1 });
      }

      const kmMatch = rawText.match(/(\d{2,3}[\.,]?\d{3})\s*(km)?/i);
      if (kmMatch) {
        km = parseInt(kmMatch[1].replace(/[\.,]/g, ''), 10);
      }

      if (tasks.length === 0) {
        tasks.push("Inspección general de componentes y diagnóstico.");
      }

      const newDraft = {
        id: `draft-${Date.now()}`,
        sender: "Iván Luque (Taller)",
        timestamp: "Recién",
        sourceType: type,
        rawContent: rawText,
        detectedPlate: matchedVeh.plate,
        vehicleModel: `${matchedVeh.model} (${matchedVeh.clientName})`,
        status: "pending",
        parsedData: {
          km: km,
          tasks: tasks,
          parts: parts
        }
      };

      onNewDraftCreated(newDraft);

      const botReply = {
        id: Date.now() + 1,
        sender: 'bot',
        text: `✅ Recibido. Identifiqué el vehículo ${matchedVeh.plate} (${matchedVeh.model}). Generé un borrador con ${tasks.length} tareas y ${parts.length} repuestos en tu panel.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botReply]);
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[620px]">
        
        {/* WhatsApp Header Claro */}
        <div className="bg-[#008069] text-white p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-sm flex items-center gap-1.5">
                Bot Asistente Taller Luque
                <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
              </div>
              <div className="text-[11px] text-white/80">En línea • Asistente Mecánico</div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-3 py-1.5 text-[11px] text-emerald-800 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
          <span>Simulador de WhatsApp: prueba enviando audios o mensajes como en el taller.</span>
        </div>

        {/* Chat area estilo WhatsApp claro */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2]">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex flex-col max-w-[85%] ${m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div 
                className={`p-2.5 rounded-xl text-xs leading-relaxed shadow-2xs ${
                  m.sender === 'user' 
                    ? 'bg-[#d9fdd3] text-slate-800 rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/60'
                }`}
              >
                {m.type === 'audio' && (
                  <div className="flex items-center gap-2 mb-1 pb-1 border-b border-slate-200 text-emerald-700 font-medium">
                    <Mic className="w-3.5 h-3.5" />
                    <span>Nota de voz transcripta</span>
                  </div>
                )}
                <p className="whitespace-pre-line">{m.text}</p>
                <div className={`text-[10px] mt-1 flex items-center gap-1 ${m.sender === 'user' ? 'text-slate-400 justify-end' : 'text-slate-400'}`}>
                  <span>{m.time}</span>
                  {m.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                </div>
              </div>
            </div>
          ))}

          {isRecording && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Grabando nota de voz del mecánico... ({recordingSeconds}s)
            </div>
          )}
        </div>

        {/* Quick Presets */}
        <div className="bg-slate-50 border-t border-slate-200 p-2 overflow-x-auto flex gap-1.5 text-[11px]">
          <span className="text-slate-400 py-1 pl-1 shrink-0">Ejemplos:</span>
          <button
            onClick={() => setMessageText("Patente AF 018 OO Mercedes: cambié polea cigüeñal y tensor correa original. Revisé radiador. 104712 km.")}
            className="shrink-0 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 transition"
          >
            Mercedes AF 018 OO (Polea/Tensor)
          </button>
          <button
            onClick={() => setMessageText("Hilux AE 452 XY le hicimos service de aceite y filtros. 142300 km.")}
            className="shrink-0 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 transition"
          >
            Hilux AE 452 XY (Service)
          </button>
        </div>

        {/* Input Bar */}
        <div className="bg-[#f0f2f5] p-2.5 flex items-center gap-2 border-t border-slate-200">
          <button
            type="button"
            onClick={handleSimulateAudio}
            disabled={isRecording}
            title="Simular audio de WhatsApp"
            className={`p-2 rounded-full transition ${
              isRecording 
                ? 'bg-rose-500 text-white animate-bounce' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          <form onSubmit={handleSendText} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Escribe o dicta: 'Patente AF 018 OO, cambié...'"
              className="flex-1 bg-white text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-[#008069] focus:outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="p-2 rounded-full bg-[#008069] hover:bg-[#006a57] disabled:opacity-40 text-white transition shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
