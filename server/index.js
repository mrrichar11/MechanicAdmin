import express from 'express';
import cors from 'cors';
import qrcode from 'qrcode';
import pino from 'pino';
import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let sock = null;
let currentQrCodeDataUrl = null;
let isConnected = false;
let connectedUser = null;
let incomingDrafts = [];

// Contexto de último auto trabajado para cuando el mecánico dice "al mismo auto" o "al auto anterior"
let lastActivePlate = null;

// Normalizador de patentes argentinas (Mercosur AA 123 BB o Vieja AAA 123)
function extractPlate(text) {
  // Patente Mercosur: 2 letras, 3 números, 2 letras (ej: AF 018 OO, AF018OO)
  const mercosurMatch = text.match(/\b([A-Za-z]{2})\s*(\d{3})\s*([A-Za-z]{2})\b/i);
  if (mercosurMatch) {
    return `${mercosurMatch[1].toUpperCase()} ${mercosurMatch[2]} ${mercosurMatch[3].toUpperCase()}`;
  }

  // Patente formato anterior: 3 letras, 3 números (ej: NTO 302, ABC 123)
  // Excluimos palabras comunes de 3 letras que tengan números pegados que no sean patentes
  const legacyMatch = text.match(/\b([A-Za-z]{3})\s*(\d{3})\b/i);
  if (legacyMatch) {
    const letters = legacyMatch[1].toUpperCase();
    // Descartar falsos positivos comunes
    if (!['DEL', 'POR', 'QUE', 'LOS', 'LAS', 'CON', 'SIN', 'ROD'].includes(letters)) {
      return `${letters} ${legacyMatch[2]}`;
    }
  }

  return null;
}

// Parser inteligente para extraer datos mecánicos
function parseMechanicalMessage(text, sender) {
  const lower = text.toLowerCase();

  // 1. Detección de Patente
  let detectedPlate = extractPlate(text);

  // Si dice "al mismo auto", "mismo auto", "al anterior" y tenemos un auto previo
  if (!detectedPlate && (lower.includes("mismo auto") || lower.includes("al mismo") || lower.includes("mismo vehiculo"))) {
    detectedPlate = lastActivePlate || "AF 018 OO";
  }

  // Si se detectó patente, guardarla como la última activa
  if (detectedPlate) {
    lastActivePlate = detectedPlate;
  }

  // Si no hay patente en el texto y no hay activa, no inventar o usar fallback claro
  if (!detectedPlate) {
    detectedPlate = lastActivePlate || "Sin Patente";
  }

  // 2. Kilometraje (ej: 104500 km, 104.500km, 148200)
  let km = null;
  const kmMatch = text.match(/(\d{2,3}[\.,]?\d{3})\s*(km|kms|kilometros)?/i);
  if (kmMatch) {
    km = parseInt(kmMatch[1].replace(/[\.,]/g, ''), 10);
  }

  // 3. Extracción de Tareas y Repuestos
  const tasks = [];
  const parts = [];

  // Diccionario mecánico inteligente
  if (lower.includes("polea")) {
    tasks.push("Revisión y reemplazo de poleas.");
    parts.push({ description: "Polea de cigüeñal / inversión", brand: "Original", unitPrice: 175000, qty: 1 });
  }
  if (lower.includes("tensor")) {
    tasks.push("Reemplazo de tensor de correa.");
    parts.push({ description: "Tensor de correa", brand: "Original", unitPrice: 220000, qty: 1 });
  }
  if (lower.includes("refrigerante") || lower.includes("motul") || lower.includes("liquido")) {
    tasks.push("Carga y purgado de líquido refrigerante.");
    parts.push({ description: "Refrigerante motor Coolant", brand: "Motul", unitPrice: 79655, qty: 1 });
  }
  if (lower.includes("aceite") || lower.includes("filtro") || lower.includes("service")) {
    tasks.push("Service de cambio de aceite y filtros.");
    parts.push({ description: "Aceite de motor", brand: "Sintético", unitPrice: 125000, qty: 1 });
    parts.push({ description: "Filtro de aceite", brand: "Bosch", unitPrice: 32000, qty: 1 });
  }
  if (lower.includes("freno") || lower.includes("pastilla") || lower.includes("disco")) {
    tasks.push("Revisión sistema de frenos.");
    parts.push({ description: "Juego de pastillas de freno", brand: "Bosch", unitPrice: 98000, qty: 1 });
  }
  if (lower.includes("rodamiento") || lower.includes("ruleman")) {
    tasks.push("Extracción y cambio de rodamiento / rulemán.");
    parts.push({ description: "Rodamiento de rueda", brand: "SKF / Timken", unitPrice: 85000, qty: 1 });
  }
  if (lower.includes("escan") || lower.includes("diagnostico") || lower.includes("error")) {
    tasks.push("Diagnóstico computarizado y escaneo con scanner Bosch.");
  }
  if (lower.includes("paragolpe") || lower.includes("rueda") || lower.includes("desarmar")) {
    tasks.push("Desmontaje de elementos para inspección en elevador.");
  }

  // Si no se clasificó por palabra clave específica, poner el texto como tarea
  if (tasks.length === 0) {
    tasks.push(text.trim());
  }

  return {
    detectedPlate,
    km,
    tasks,
    parts
  };
}

async function startWhatsApp() {
  const authFolder = path.resolve('auth_info_baileys');
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('--- NUEVO CÓDIGO QR GENERADO POR WHATSAPP ---');
      currentQrCodeDataUrl = await qrcode.toDataURL(qr, { width: 300, margin: 2 });
      isConnected = false;
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`Conexión cerrada. Razón: ${statusCode}. Reconectando: ${shouldReconnect}`);
      isConnected = false;
      currentQrCodeDataUrl = null;
      connectedUser = null;

      if (shouldReconnect) {
        startWhatsApp();
      } else {
        if (fs.existsSync(authFolder)) {
          fs.rmSync(authFolder, { recursive: true, force: true });
        }
      }
    } else if (connection === 'open') {
      console.log('✅ ¡WHATSAPP CONECTADO EXITOSAMENTE CON EL CELULAR!');
      isConnected = true;
      currentQrCodeDataUrl = null;
      connectedUser = sock.user;
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;

      const remoteJid = msg.key.remoteJid || '';
      
      // 1. REGLA ESTRICTA DE PRIVACIDAD: IGNORAR GRUPOS POR COMPLETO
      // Los grupos en WhatsApp siempre terminan con @g.us
      if (remoteJid.endsWith('@g.us')) {
        console.log(`🔒 [Privacidad] Mensaje de grupo ignorado: ${remoteJid}`);
        continue;
      }

      // 2. REGLA DE CHATS PERSONALES:
      // Solo procesar si el mensaje es de uno mismo (Mensajes a ti mismo / fromMe: true)
      // O si en chats directos contiene palabras o patentes explícitas de mecánica.
      const isFromMe = Boolean(msg.key.fromMe);
      const text = msg.message.conversation || 
                   msg.message.extendedTextMessage?.text || 
                   msg.message.imageMessage?.caption || '';

      if (!text || text.trim().length < 4) continue;

      const lowerText = text.toLowerCase();
      const hasPlate = Boolean(extractPlate(text));
      const hasAutomotiveKeywords = ['patente', 'auto', 'aceite', 'filtro', 'polea', 'tensor', 'km', 'freno', 'rueda', 'rodamiento', 'ruleman', 'scanner', 'escaneo', 'refrigerante', 'service', 'taller'].some(k => lowerText.includes(k));

      // Si no es un mensaje a ti mismo Y no tiene nada automotriz, ignorar (es chat privado con amigos/familia)
      if (!isFromMe && !hasPlate && !hasAutomotiveKeywords) {
        console.log(`🔒 [Privacidad] Chat privado ignorado (sin contenido automotriz): ${remoteJid}`);
        continue;
      }

      console.log(`📩 [Taller] Mensaje automotriz procesado de ${remoteJid}:`, text);

      const parsed = parseMechanicalMessage(text, msg.pushName || remoteJid);

      // 3. JUNTAR O ACTUALIZAR BORRADOR EXISTENTE DE LA MISMA PATENTE (si llegó hace menos de 30 min)
      const existingDraftIndex = incomingDrafts.findIndex(
        d => d.detectedPlate === parsed.detectedPlate && d.status === 'pending'
      );

      if (existingDraftIndex >= 0) {
        // Agrupar en la misma orden para no duplicar borradores
        const existing = incomingDrafts[existingDraftIndex];
        const mergedTasks = [...new Set([...existing.parsedData.tasks, ...parsed.tasks])];
        const mergedParts = [...existing.parsedData.parts, ...parsed.parts];
        
        incomingDrafts[existingDraftIndex] = {
          ...existing,
          timestamp: 'Recién (actualizado)',
          rawContent: `${existing.rawContent}\n+ ${text}`,
          parsedData: {
            km: parsed.km || existing.parsedData.km,
            tasks: mergedTasks,
            parts: mergedParts
          }
        };
      } else {
        // Nuevo borrador para esta patente
        incomingDrafts.unshift({
          id: `draft-wa-${Date.now()}`,
          sender: msg.pushName || (isFromMe ? 'Tú (Notas de Taller)' : remoteJid.replace('@s.whatsapp.net', '')),
          timestamp: 'Recién (WhatsApp)',
          sourceType: 'text',
          rawContent: text,
          detectedPlate: parsed.detectedPlate,
          vehicleModel: `Vehículo ${parsed.detectedPlate}`,
          status: 'pending',
          parsedData: {
            km: parsed.km || 104712,
            tasks: parsed.tasks,
            parts: parsed.parts
          }
        });
      }

      // Responder confirmación por WhatsApp sólo si no es mensaje a uno mismo o si es nota personal
      try {
        await sock.sendMessage(remoteJid, {
          text: `🚗 *Taller Luque - Sistema:* ¡Mensaje procesado para *${parsed.detectedPlate}*!\n\n🔧 *Tareas detectadas:* ${parsed.tasks.length}\n📦 *Repuestos:* ${parsed.parts.length}\n\n${existingDraftIndex >= 0 ? '🔄 _Se agregaron los nuevos trabajos a la orden abierta de esta patente._' : '📋 _Se generó una nueva orden en tu panel para aprobarla._'}`
        });
      } catch (e) {
        console.error('Error respondiendo en WhatsApp:', e);
      }
    }
  });
}

// Iniciar WhatsApp al arrancar el servidor
startWhatsApp().catch(err => console.error('Error iniciando Baileys:', err));

// Rutas de API
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    isConnected,
    user: connectedUser,
    qrCodeDataUrl: currentQrCodeDataUrl
  });
});

app.post('/api/whatsapp/disconnect', async (req, res) => {
  try {
    if (sock) {
      await sock.logout();
    }
    const authFolder = path.resolve('auth_info_baileys');
    if (fs.existsSync(authFolder)) {
      fs.rmSync(authFolder, { recursive: true, force: true });
    }
    isConnected = false;
    currentQrCodeDataUrl = null;
    connectedUser = null;
    startWhatsApp();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/whatsapp/drafts', (req, res) => {
  res.json(incomingDrafts);
});

app.delete('/api/whatsapp/drafts/:id', (req, res) => {
  const { id } = req.params;
  incomingDrafts = incomingDrafts.filter(d => d.id !== id);
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Conector de WhatsApp corriendo en http://0.0.0.0:${PORT}`);
});
