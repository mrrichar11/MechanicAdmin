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

const DRAFTS_FILE = path.resolve('drafts_cache.json');
const PROCESSED_MSGS_FILE = path.resolve('processed_messages.json');

// Cargar caché persistente de borradores
function loadDraftsCache() {
  try {
    if (fs.existsSync(DRAFTS_FILE)) {
      const data = fs.readFileSync(DRAFTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error leyendo caché de borradores:', e);
  }
  return [];
}

function saveDraftsCache() {
  try {
    fs.writeFileSync(DRAFTS_FILE, JSON.stringify(incomingDrafts, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error guardando caché de borradores:', e);
  }
}

// Cargar IDs de mensajes procesados para no duplicar jamás
function loadProcessedMessageIds() {
  try {
    if (fs.existsSync(PROCESSED_MSGS_FILE)) {
      const data = fs.readFileSync(PROCESSED_MSGS_FILE, 'utf-8');
      return new Set(JSON.parse(data));
    }
  } catch (e) {
    console.error('Error leyendo mensajes procesados:', e);
  }
  return new Set();
}

function saveProcessedMessageIds() {
  try {
    // Guardar solo los últimos 2000 IDs para no saturar memoria/disco
    const arr = Array.from(processedMessageIds).slice(-2000);
    fs.writeFileSync(PROCESSED_MSGS_FILE, JSON.stringify(arr), 'utf-8');
  } catch (e) {
    console.error('Error guardando mensajes procesados:', e);
  }
}

let sock = null;
let currentQrCodeDataUrl = null;
let isConnected = false;
let connectedUser = null;
let incomingDrafts = loadDraftsCache();
const processedMessageIds = loadProcessedMessageIds();

// Contexto de último auto trabajado para cuando el mecánico dice "al mismo auto" o "al auto anterior"
let lastActivePlate = null;

// Normalizador de patentes argentinas (Mercosur AA 123 BB o Vieja AAA 123)
function extractPlate(text) {
  if (!text) return null;

  // Patente Mercosur: 2 letras, 3 números, 2 letras (ej: AF 018 OO, AF018OO)
  const mercosurMatch = text.match(/\b([A-Za-z]{2})\s*(\d{3})\s*([A-Za-z]{2})\b/i);
  if (mercosurMatch) {
    return `${mercosurMatch[1].toUpperCase()} ${mercosurMatch[2]} ${mercosurMatch[3].toUpperCase()}`;
  }

  // Patente formato anterior: 3 letras, 3 números (ej: NTO 302, ABC 123)
  const legacyMatch = text.match(/\b([A-Za-z]{3})\s*(\d{3})\b/i);
  if (legacyMatch) {
    const letters = legacyMatch[1].toUpperCase();
    if (!['DEL', 'POR', 'QUE', 'LOS', 'LAS', 'CON', 'SIN', 'ROD', 'MAS', 'DOS'].includes(letters)) {
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
  if (!detectedPlate && (lower.includes("mismo auto") || lower.includes("al mismo") || lower.includes("mismo vehiculo") || lower.includes("al anterior"))) {
    detectedPlate = lastActivePlate || "AF 018 OO";
  }

  // Si se detectó patente, guardarla como la última activa
  if (detectedPlate) {
    lastActivePlate = detectedPlate;
  }

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
    tasks.push("Revisión y reemplazo de poleas de accesorios / cigüeñal.");
    parts.push({ description: "Polea de cigüeñal / inversión", brand: "Original", unitPrice: 175000, qty: 1 });
  }
  if (lower.includes("tensor")) {
    tasks.push("Reemplazo de tensor móvil de correa.");
    parts.push({ description: "Tensor de correa", brand: "Original", unitPrice: 220000, qty: 1 });
  }
  if (lower.includes("correa")) {
    tasks.push("Sustitución de correa de accesorios Poli-V.");
    parts.push({ description: "Correa Poli-V", brand: "Continental / Gates", unitPrice: 48000, qty: 1 });
  }
  if (lower.includes("refrigerante") || lower.includes("motul") || lower.includes("coolant") || lower.includes("liquido")) {
    tasks.push("Carga y purgado de líquido refrigerante de motor.");
    parts.push({ description: "Refrigerante motor Coolant", brand: "Motul", unitPrice: 79655, qty: 1 });
  }
  if (lower.includes("aceite") || lower.includes("filtro") || lower.includes("service")) {
    tasks.push("Service de cambio de aceite y filtros.");
    parts.push({ description: "Aceite de motor", brand: "Sintético", unitPrice: 125000, qty: 1 });
    parts.push({ description: "Filtro de aceite", brand: "Original / Bosch", unitPrice: 32000, qty: 1 });
  }
  if (lower.includes("freno") || lower.includes("pastilla") || lower.includes("disco")) {
    tasks.push("Revisión y reemplazo en sistema de frenos.");
    parts.push({ description: "Juego de pastillas de freno", brand: "Bosch / Frasle", unitPrice: 98000, qty: 1 });
  }
  if (lower.includes("rodamiento") || lower.includes("ruleman")) {
    tasks.push("Extracción y cambio de rodamiento / rulemán de rueda.");
    parts.push({ description: "Rodamiento de rueda", brand: "SKF / Timken", unitPrice: 85000, qty: 1 });
  }
  if (lower.includes("escan") || lower.includes("diagnostico") || lower.includes("escaner")) {
    tasks.push("Diagnóstico computarizado y escaneo general.");
  }
  if (lower.includes("amortiguador") || lower.includes("suspension") || lower.includes("suspensión")) {
    tasks.push("Control y reemplazo de amortiguadores.");
    parts.push({ description: "Amortiguadores", brand: "Monroe / Fric-Rot", unitPrice: 185000, qty: 2 });
  }
  if (lower.includes("bujia") || lower.includes("bujía")) {
    tasks.push("Sustitución de juego de bujías de encendido.");
    parts.push({ description: "Juego de bujías", brand: "NGK / Bosch", unitPrice: 56000, qty: 1 });
  }
  if (lower.includes("radiador")) {
    tasks.push("Limpieza, sopleteado y control de estanqueidad de radiador.");
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

// Procesador centralizado de mensajes (en vivo o sincronizados de historial)
async function processSingleMessage(msg, isHistorical = false) {
  if (!msg || !msg.message) return;

  const msgId = msg.key?.id;
  if (!msgId) return;

  // Evitar reprocesar duplicados
  if (processedMessageIds.has(msgId)) return;
  processedMessageIds.add(msgId);
  saveProcessedMessageIds();

  const remoteJid = msg.key.remoteJid || '';

  // 1. REGLA ESTRICTA DE PRIVACIDAD: IGNORAR GRUPOS Y DIFUSIONES
  if (remoteJid.endsWith('@g.us') || remoteJid.endsWith('@broadcast')) {
    return;
  }

  const isFromMe = Boolean(msg.key.fromMe);
  const text = msg.message.conversation || 
               msg.message.extendedTextMessage?.text || 
               msg.message.imageMessage?.caption || '';

  if (!text || text.trim().length < 3) return;

  const lowerText = text.toLowerCase();
  const hasPlate = Boolean(extractPlate(text));
  const hasAutomotiveKeywords = [
    'patente', 'auto', 'aceite', 'filtro', 'polea', 'tensor', 'km', 'freno', 
    'rueda', 'rodamiento', 'ruleman', 'scanner', 'escaneo', 'refrigerante', 
    'service', 'taller', 'cambie', 'cambié', 'reparé', 'revisé', 'repuesto', 
    'bujia', 'bujía', 'amortiguador', 'correa', 'bateria', 'batería', 'radiador'
  ].some(k => lowerText.includes(k));

  // Verificar si es chat consigo mismo (notas de taller personales)
  const myPhone = connectedUser?.id ? connectedUser.id.split(':')[0].replace(/[^0-9]/g, '') : null;
  const remotePhone = remoteJid.split('@')[0].replace(/[^0-9]/g, '');
  const isSelfChat = isFromMe && (!myPhone || remotePhone === myPhone || remoteJid.includes(myPhone));

  // Si no es un mensaje a uno mismo Y no tiene contenido automotriz, ignorar
  if (!isSelfChat && !hasPlate && !hasAutomotiveKeywords) {
    return;
  }

  console.log(`📩 [Taller] ${isHistorical ? 'Sincronización Historial' : 'Mensaje en Vivo'} de ${remoteJid}: "${text}"`);

  const parsed = parseMechanicalMessage(text, msg.pushName || (isSelfChat ? 'Tú (Nota personal)' : remoteJid));

  // 3. JUNTAR O ACTUALIZAR BORRADOR EXISTENTE DE LA MISMA PATENTE
  const existingDraftIndex = incomingDrafts.findIndex(
    d => d.detectedPlate === parsed.detectedPlate && d.status === 'pending'
  );

  if (existingDraftIndex >= 0) {
    const existing = incomingDrafts[existingDraftIndex];
    const mergedTasks = [...new Set([...existing.parsedData.tasks, ...parsed.tasks])];
    const mergedParts = [...existing.parsedData.parts, ...parsed.parts];
    
    incomingDrafts[existingDraftIndex] = {
      ...existing,
      timestamp: isHistorical ? 'Recuperado offline' : 'Recién (actualizado)',
      rawContent: `${existing.rawContent}\n+ ${text}`,
      parsedData: {
        km: parsed.km || existing.parsedData.km,
        tasks: mergedTasks,
        parts: mergedParts
      }
    };
  } else {
    incomingDrafts.unshift({
      id: `draft-wa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: msg.pushName || (isSelfChat ? 'Tú (Notas de Taller)' : remoteJid.replace('@s.whatsapp.net', '')),
      timestamp: isHistorical ? 'Recuperado offline (WhatsApp)' : 'Recién (WhatsApp)',
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

  saveDraftsCache();

  // Responder confirmación por WhatsApp SOLO si es en vivo (evitar spamear mensajes históricos)
  if (!isHistorical && sock && isConnected) {
    try {
      await sock.sendMessage(remoteJid, {
        text: `🚗 *Sistema del Taller:* ¡Mensaje procesado para *${parsed.detectedPlate}*!\n\n🔧 *Tareas detectadas:* ${parsed.tasks.length}\n📦 *Repuestos:* ${parsed.parts.length}\n\n${existingDraftIndex >= 0 ? '🔄 _Se agregaron los nuevos trabajos a la orden abierta de esta patente._' : '📋 _Se generó una nueva orden en tu panel para aprobarla._'}`
      });
    } catch (e) {
      console.error('Error respondiendo en WhatsApp:', e);
    }
  }
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
    syncFullHistory: false,
    // Ignora grupos y canales en la raíz del protocolo para evitar saturación y errores de descifrado
    shouldIgnoreJid: (jid) => jid?.endsWith('@g.us') || jid?.endsWith('@broadcast'),
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
      const selfPhone = sock.user?.id ? sock.user.id.split(':')[0] : 'Desconocido';
      console.log(`📱 Sesión activa vinculada al número: +${selfPhone}`);
      console.log(`🔍 Chat de "Mensajes a ti mismo" activo para recibir y sincronizar notas de taller.`);
    }
  });

  // Escuchar historial sincronizado al conectarse (recupera mensajes enviados cuando el bot estaba apagado)
  sock.ev.on('messaging-history.set', async ({ messages }) => {
    console.log(`📥 [Historial WhatsApp] Procesando sincronización (${messages?.length || 0} mensajes recibidos)...`);
    if (Array.isArray(messages)) {
      const sorted = [...messages].sort((a, b) => (Number(a.messageTimestamp) || 0) - (Number(b.messageTimestamp) || 0));
      for (const msg of sorted) {
        await processSingleMessage(msg, true);
      }
    }
  });

  // Escuchar mensajes en tiempo real y offline pendientes
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    // Procesa tanto 'notify' (tiempo real) como 'append' (mensajes recibidos offline)
    const isHistorical = (type === 'append');
    for (const msg of messages) {
      await processSingleMessage(msg, isHistorical);
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

// Obtener borradores actuales
app.get('/api/whatsapp/drafts', (req, res) => {
  res.json(incomingDrafts);
});

// Guardar o actualizar borrador (por ejemplo, desde el Asistente de Carga web)
app.post('/api/whatsapp/drafts', (req, res) => {
  const newDraft = req.body;
  if (!newDraft || !newDraft.id) {
    return res.status(400).json({ error: 'Borrador inválido' });
  }

  const existingIdx = incomingDrafts.findIndex(
    d => d.detectedPlate === newDraft.detectedPlate && d.status === 'pending'
  );

  if (existingIdx >= 0) {
    const existing = incomingDrafts[existingIdx];
    incomingDrafts[existingIdx] = {
      ...existing,
      rawContent: `${existing.rawContent}\n+ ${newDraft.rawContent}`,
      parsedData: {
        km: newDraft.parsedData.km || existing.parsedData.km,
        tasks: [...new Set([...existing.parsedData.tasks, ...newDraft.parsedData.tasks])],
        parts: [...existing.parsedData.parts, ...newDraft.parsedData.parts]
      }
    };
  } else {
    incomingDrafts.unshift(newDraft);
  }

  saveDraftsCache();
  res.json({ success: true, drafts: incomingDrafts });
});

// Eliminar / descartar borrador
app.delete('/api/whatsapp/drafts/:id', (req, res) => {
  const { id } = req.params;
  incomingDrafts = incomingDrafts.filter(d => d.id !== id);
  saveDraftsCache();
  res.json({ success: true });
});

// Endpoint para consultar sincronización
app.post('/api/whatsapp/sync', (req, res) => {
  res.json({
    success: true,
    isConnected,
    pendingDraftsCount: incomingDrafts.filter(d => d.status === 'pending').length,
    processedCount: processedMessageIds.size
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Conector de WhatsApp corriendo en http://0.0.0.0:${PORT}`);
});
