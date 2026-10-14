export const WORKSHOP_INFO = {
  name: "Bosch Car Service",
  owner: "Iván Luque",
  address: "Dentesano 61, Sunchales, Santa Fe",
  phone: "03493-423274 / 15403364",
  email: "ivanluque334@gmail.com",
};

// Vehículos: Inicialmente vacío para que Iván cargue sus planillas de Excel
export const INITIAL_VEHICLES = [];

// Borradores de WhatsApp: Inicialmente vacío para recibir mensajes reales del celular
export const INITIAL_BOT_DRAFTS = [];

// Proveedores del Taller (Repuesteras, lubricantes, rectificadoras)
export const INITIAL_SUPPLIERS = [];

// Cuentas Corrientes y Saldos de Clientes (a cobrar)
export const INITIAL_CLIENT_ACCOUNTS = [];

// Cartera de Cheques (Recibidos, Emitidos y Endosados a terceros)
export const INITIAL_CHECKS = [];

// Retiros Personales del Dueño (Iván Luque)
export const INITIAL_OWNER_WITHDRAWALS = [];

// Caja Diaria & Movimientos
export const INITIAL_CASH_BALANCE = {
  cashOnHand: 0.00,       // Efectivo en caja física del taller
  bankBalance: 0.00,      // Saldo en cuenta bancaria del taller
};
