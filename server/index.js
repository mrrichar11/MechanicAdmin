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

// Parser básico para extraer datos del mensaje de WhatsApp
function parseMechanicalMessage(text, sender) {
  let detectedPlate = "AF 018 OO";
  const plateMatch = text.match(/([A-Z]{2}\s*\d{3}\s*[A-Z]{2}|[A-Z]{3}\s*\d{3})/i);
  if (plateMatch) {
    detectedPlate = plateMatch[1].toUpperCase().replace(/\s+/g, ' ');
  }

  // KM
  let km = 104712;
  const kmMatch = text.match(/(\d{2,3}[\.,]?\d{3})\s*(km)?/i);
  if (kmMatch) {
    km = parseInt(kmMatch[1].replace(/[\.,]/g, ''), 10);
  }

  // Tareas y repuestos
  const tasks = [];
  const parts = [];
  const lower = text.toLowerCase();

  if (lower.includes("polea")) {
    tasks.push("Sustitución de polea de cigüeñal y poleas de inversión.");
    parts.push({ description: "Polea de cigüeñal", brand: "Original", unitPrice: 257064, qty: 1 });
  }
  if (lower.includes("tensor")) {
    tasks.push("Reemplazo de tensor móvil de correa de accesorios.");
    parts.push({ description: "Tensor de correa", brand: "Original", unitPrice: 411706.75, qty: 1 });
  }
  if (lower.includes("refrigerante") || lower.includes("motul")) {
    tasks.push("Carga y purgado de líquido refrigerante de motor.");
    parts.push({ description: "Refrigerante motor Coolant", brand: "Motul", unitPrice: 79655, qty: 1 });
  }
  if (lower.includes("aceite") || lower.includes("filtro") || lower.includes("service")) {
    tasks.push("Service de cambio de aceite y filtros de motor.");
    parts.push({ description: "Aceite sintético 5W40", brand: "Motul", unitPrice: 125000, qty: 1 });
    parts.push({ description: "Filtro de aceite", brand: "Bosch", unitPrice: 32000, qty: 1 });
  }
  if (lower.includes("freno") || lower.includes("pastilla")) {
    tasks.push("Reemplazo de pastillas de freno e inspección de discos.");
    parts.push({ description: "Pastillas de freno", brand: "Bosch", unitPrice: 98000, qty: 1 });
  }

  if (tasks.length === 0) {
    tasks.push(text);
  }

  return {
    id: `draft-wa-${Date.now()}`,
    sender: sender || "WhatsApp del Taller",
    timestamp: "Recién (WhatsApp)",
    sourceType: "text",
    rawContent: text,
    detectedPlate: detectedPlate,
    vehicleModel: `Vehículo ${detectedPlate}`,
    status: "pending",
    parsedData: {
      km,
      tasks,
      parts
    }
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
    printQRInTerminal: true,
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
        // Borrar credenciales si se deslogueó
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

      const senderJid = msg.key.remoteJid;
      const isFromMe = msg.key.fromMe;
      const text = msg.message.conversation || 
                   msg.message.extendedTextMessage?.text || 
                   msg.message.imageMessage?.caption || '';

      console.log(`📩 Mensaje recibido de ${senderJid} (fromMe: ${isFromMe}):`, text);

      if (text && text.trim().length > 3) {
        const draft = parseMechanicalMessage(text, msg.pushName || senderJid);
        incomingDrafts.unshift(draft);

        // Responder confirmación por WhatsApp
        try {
          await sock.sendMessage(senderJid, {
            text: `🚗 *Taller Luque - Sistema:* ¡Mensaje recibido y procesado!\n\n📋 *Patente:* ${draft.detectedPlate}\n🔧 *Tareas detectadas:* ${draft.parsedData.tasks.length}\n📦 *Repuestos:* ${draft.parsedData.parts.length}\n\nYa generé el borrador en tu panel para aprobarlo cuando quieras.`
          });
        } catch (e) {
          console.error('Error respondiendo en WhatsApp:', e);
        }
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Conector de WhatsApp corriendo en http://0.0.0.0:${PORT}`);
});
