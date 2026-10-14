export const WORKSHOP_INFO = {
  name: "Bosch Car Service",
  owner: "Iván Luque",
  address: "Dentesano 61, Sunchales, Santa Fe",
  phone: "03493-423274 / 15403364",
  email: "ivanluque334@gmail.com",
};

export const INITIAL_VEHICLES = [
  {
    id: "veh-1",
    plate: "AF 018 OO",
    model: "MERCEDES BENZ GLB 250 4MATIC",
    clientType: "fleet",
    clientId: "cli-1",
    clientName: "BHY S.A.",
    cuitDni: "30-70984123-9",
    phone: "03493-428900",
    address: "Parque Industrial Sunchales",
    vin: "W1N4M4HB9LW076717",
    engine: "26092030225383",
    injectionSystem: "Bosch High Pressure Direct Injection",
    currentKm: 104712,
    history: [
      {
        id: "vis-1",
        date: "2025-05-18",
        km: 104712,
        status: "Completado",
        invoiceNumber: "OT-2025-0042",
        tasks: [
          "Extracción rueda delantera derecha, plásticos cubre cárter, deflector delantero, guardaplast.",
          "Travesaño lateral derecho, depósito líquido refrigerante motor, soporte de motor derecho.",
          "Desmontaje correa de accesorios, polea de inversión, tensor móvil correa, antivibrador.",
          "Cambio polea cigüeñal.",
          "Cambio tensor correa.",
          "Cambio polea inversión.",
          "Cambio correa de accesorios.",
          "Líquido refrigerante motor nuevo.",
          "Extracción ruedas traseras, bulón soporte inferior amortiguador traseros, bieletas barra estabilizadora.",
          "Cambio bulón inferior bieleta trasera derecha.",
          "Control de niveles de fluidos, luces y seguridad.",
          "Agregado de líquido refrigerante de motor.",
          "Agregado de líquido lavaparabrisas.",
          "Limpieza de interior y carrocería.",
          "Limpieza de motor.",
          "Limpieza de radiadores.",
          "Control y calibración de presión de neumáticos.",
          "Control y ajuste de elementos de inyección con scanner de diagnóstico Bosch."
        ],
        parts: [
          { description: "Polea de inversión", brand: "Original", unitPrice: 171765.10, qty: 1, isFree: false },
          { description: "Tensor correa", brand: "Original", unitPrice: 411706.75, qty: 1, isFree: false },
          { description: "Antivibrador", brand: "Original", unitPrice: 257064.00, qty: 1, isFree: false },
          { description: "Correa de accesorios", brand: "Original", unitPrice: 69580.50, qty: 1, isFree: false },
          { description: "Refrigerante motor", brand: "Motul Coolant", unitPrice: 79655.00, qty: 1, isFree: false },
          { description: "Diagnóstico y escaneo computarizado", brand: "Bosch KTS", unitPrice: 0, qty: 1, isFree: true },
        ],
        laborCost: 178800.00,
        taxRate: 21,
      },
      {
        id: "vis-0",
        date: "2024-11-10",
        km: 92400,
        status: "Completado",
        invoiceNumber: "OT-2024-0891",
        tasks: [
          "Service preventivo completo 90.000 km.",
          "Cambio de aceite sintético y filtro de aceite.",
          "Cambio de filtro de aire motor y filtro de habitáculo.",
          "Inspección de pastillas y discos de freno delanteros y traseros.",
          "Rotación y balanceo de 4 neumáticos."
        ],
        parts: [
          { description: "Aceite sintético 5W40", brand: "Motul 8100", unitPrice: 125000.00, qty: 1, isFree: false },
          { description: "Filtro de aceite", brand: "Bosch", unitPrice: 32000.00, qty: 1, isFree: false },
          { description: "Filtro de aire", brand: "Mann Filter", unitPrice: 45000.00, qty: 1, isFree: false },
          { description: "Filtro de habitáculo antipolen", brand: "Bosch", unitPrice: 38000.00, qty: 1, isFree: false },
        ],
        laborCost: 85000.00,
        taxRate: 21,
      }
    ]
  },
  {
    id: "veh-2",
    plate: "AE 452 XY",
    model: "TOYOTA HILUX 2.8 TDI 4X4",
    clientType: "fleet",
    clientId: "cli-1",
    clientName: "BHY S.A.",
    cuitDni: "30-70984123-9",
    phone: "03493-428900",
    address: "Parque Industrial Sunchales",
    vin: "8AJBA3CD4M0129845",
    engine: "1GD987214",
    injectionSystem: "Denso Common Rail",
    currentKm: 142300,
    history: [
      {
        id: "vis-toyota-1",
        date: "2025-04-02",
        km: 140000,
        status: "Completado",
        invoiceNumber: "OT-2025-0019",
        tasks: [
          "Reemplazo de pastillas de freno delanteras.",
          "Rectificación de discos delanteros.",
          "Purgado de líquido de frenos Bosch DOT 4."
        ],
        parts: [
          { description: "Juego de pastillas de freno delanteras", brand: "Bosch", unitPrice: 98000.00, qty: 1, isFree: false },
          { description: "Líquido de frenos DOT 4", brand: "Bosch", unitPrice: 24000.00, qty: 1, isFree: false }
        ],
        laborCost: 95000.00,
        taxRate: 21,
      }
    ]
  },
  {
    id: "veh-3",
    plate: "AC 891 LK",
    model: "VOLKSWAGEN AMAROK V6 3.0",
    clientType: "particular",
    clientId: "cli-2",
    clientName: "Carlos Alberto Rossi",
    cuitDni: "20-22445588-4",
    phone: "03493-15456789",
    address: "Av. Independencia 420, Sunchales",
    vin: "WV1ZZZ2HZKA098124",
    engine: "DDXA045129",
    injectionSystem: "Bosch EDC17",
    currentKm: 78500,
    history: [
      {
        id: "vis-amarok-1",
        date: "2025-03-12",
        km: 75000,
        status: "Completado",
        invoiceNumber: "OT-2025-0008",
        tasks: [
          "Cambio de correa de distribución y bomba de agua.",
          "Cambio de líquido refrigerante G12 Evo."
        ],
        parts: [
          { description: "Kit de distribución completo V6", brand: "Original VW", unitPrice: 620000.00, qty: 1, isFree: false },
          { description: "Bomba de agua con sensor", brand: "Dolz", unitPrice: 195000.00, qty: 1, isFree: false },
          { description: "Refrigerante G12 Concentrado", brand: "Motul", unitPrice: 58000.00, qty: 2, isFree: false }
        ],
        laborCost: 280000.00,
        taxRate: 21,
      }
    ]
  }
];

export const INITIAL_BOT_DRAFTS = [
  {
    id: "draft-1",
    sender: "Iván Luque (+54 9 3493 15-403364)",
    timestamp: "Hoy, 16:42 hs",
    sourceType: "audio",
    audioDuration: "0:45",
    rawContent: "Audio transcripto: 'Patente AF 018 OO, el Mercedes de BHY. Ya le bajé las ruedas delanteras y cambié el tensor de correa original y la polea de cigüeñal. También le eché el refrigerante Motul coolant. Me queda pendiente hacerle la limpieza de radiadores y revisar los amortiguadores traseros. Anotalo con 104.750 km.'",
    detectedPlate: "AF 018 OO",
    vehicleModel: "MERCEDES BENZ GLB 250 4MATIC (BHY S.A.)",
    status: "pending",
    parsedData: {
      km: 104750,
      tasks: [
        "Desmontaje de ruedas delanteras.",
        "Cambio tensor de correa.",
        "Cambio polea de cigüeñal.",
        "Carga de líquido refrigerante.",
        "Pendiente: Limpieza de radiadores.",
        "Pendiente: Inspección amortiguadores traseros."
      ],
      parts: [
        { description: "Tensor de correa", brand: "Original", unitPrice: 411706.75, qty: 1 },
        { description: "Polea de cigüeñal", brand: "Original", unitPrice: 257064.00, qty: 1 },
        { description: "Refrigerante de motor", brand: "Motul Coolant", unitPrice: 79655.00, qty: 1 }
      ]
    }
  },
  {
    id: "draft-2",
    sender: "Iván Luque (+54 9 3493 15-403364)",
    timestamp: "Hoy, 11:15 hs",
    sourceType: "text",
    rawContent: "Hilux AE 452 XY le hicimos cambio de aceite 5w30 Sintetico Toyota, filtro de aire y filtro de gasoil Denso. Control de tren delantero todo ok. 148200 km.",
    detectedPlate: "AE 452 XY",
    vehicleModel: "TOYOTA HILUX 2.8 TDI (BHY S.A.)",
    status: "pending",
    parsedData: {
      km: 148200,
      tasks: [
        "Cambio de aceite sintético 5W30.",
        "Cambio de filtro de aire.",
        "Cambio de filtro de gasoil.",
        "Control general de tren delantero (OK)."
      ],
      parts: [
        { description: "Aceite sintético 5W30", brand: "Toyota Genuine", unitPrice: 110000, qty: 1 },
        { description: "Filtro de aire", brand: "Mann", unitPrice: 38000, qty: 1 },
        { description: "Filtro de gasoil", brand: "Denso", unitPrice: 62000, qty: 1 }
      ]
    }
  }
];

// Proveedores del Taller (Repuesteras, lubricantes, rectificadoras)
export const INITIAL_SUPPLIERS = [
  {
    id: "sup-1",
    name: "Distribuidora Repuestos Rafaela S.R.L.",
    contact: "Marcelo Gómez",
    phone: "03492-432100",
    rubro: "Repuestos Originales & Alternativos",
    cuit: "30-65489123-8",
    balanceDue: 840500.00, // Deuda pendiente a pagar
    totalPurchases: 3450000.00,
    history: [
      { id: "mov-s1", date: "2025-05-15", type: "purchase", description: "Factura A-0012-000491: Poleas y tensores Mercedes", amount: 840500.00, balanceAfter: 840500.00 },
      { id: "mov-s2", date: "2025-05-02", type: "payment", description: "Pago con Cheque tercero Banco Macro #891244", amount: -500000.00, balanceAfter: 0.00 }
    ]
  },
  {
    id: "sup-2",
    name: "Lubricentro & Filtros del Litoral",
    contact: "Esteban Fontana",
    phone: "03493-15498822",
    rubro: "Aceites Motul, Castrol, Filtros Mann & Bosch",
    cuit: "30-71120984-4",
    balanceDue: 265000.00,
    totalPurchases: 1890000.00,
    history: [
      { id: "mov-s3", date: "2025-05-10", type: "purchase", description: "Factura B-0005-001890: Tambor Motul 5W40 y Refrigerante", amount: 465000.00, balanceAfter: 465000.00 },
      { id: "mov-s4", date: "2025-05-14", type: "payment", description: "Transferencia Bancaria Cuenta Taller (Pago parcial)", amount: -200000.00, balanceAfter: 265000.00 }
    ]
  },
  {
    id: "sup-3",
    name: "Rectificaciones & Tornería Luque",
    contact: "Horacio Luque",
    phone: "03493-421189",
    rubro: "Rectificado de tapas, discos y embragues",
    cuit: "20-14892301-2",
    balanceDue: 0.00,
    totalPurchases: 540000.00,
    history: [
      { id: "mov-s5", date: "2025-04-20", type: "purchase", description: "Rectificación de discos Hilux y Amarok", amount: 75000.00, balanceAfter: 75000.00 },
      { id: "mov-s6", date: "2025-04-21", type: "payment", description: "Efectivo caja chica - Cancelación total", amount: -75000.00, balanceAfter: 0.00 }
    ]
  }
];

// Cuentas Corrientes y Saldos de Clientes (a cobrar)
export const INITIAL_CLIENT_ACCOUNTS = [
  {
    id: "cli-1",
    clientName: "BHY S.A.",
    clientType: "fleet",
    cuitDni: "30-70984123-9",
    phone: "03493-428900",
    totalBilled: 1413971.33 + 219000.00,
    totalPaid: 650000.00,
    balanceDue: 982971.33, // Saldo adeudado por la empresa
    vehicles: ["AF 018 OO", "AE 452 XY"],
    payments: [
      { id: "cp-1", date: "2025-05-19", method: "Cheque a 30 días", note: "Cheque Santander Río #45129983", amount: 650000.00 }
    ]
  },
  {
    id: "cli-2",
    clientName: "Carlos Alberto Rossi",
    clientType: "particular",
    cuitDni: "20-22445588-4",
    phone: "03493-15456789",
    totalBilled: 1400000.00,
    totalPaid: 1400000.00,
    balanceDue: 0.00, // Al día
    vehicles: ["AC 891 LK"],
    payments: [
      { id: "cp-2", date: "2025-03-12", method: "Transferencia Bancaria", note: "Pago total distribución Amarok", amount: 1400000.00 }
    ]
  }
];

// Cartera de Cheques (Recibidos, Emitidos y Endosados a terceros)
export const INITIAL_CHECKS = [
  {
    id: "chk-1",
    type: "in_portfolio", // "in_portfolio" (en cartera a cobrar), "issued" (emitido propio), "endorsed" (entregado a tercero)
    bank: "Banco Santander Río",
    checkNumber: "45129983",
    issuer: "BHY S.A.",
    recipient: "Bosch Car Service / Iván Luque",
    dueDate: "2025-06-20",
    amount: 650000.00,
    status: "A cobrar en cartera",
    originOrderOrNote: "Pago parcial OT Mercedes AF 018 OO"
  },
  {
    id: "chk-2",
    type: "endorsed",
    bank: "Banco Macro",
    checkNumber: "891244",
    issuer: "Cooperativa Agrícola Ganadera",
    recipient: "Distribuidora Repuestos Rafaela S.R.L. (Endosado)",
    dueDate: "2025-05-30",
    amount: 500000.00,
    status: "Entregado a proveedor como pago",
    originOrderOrNote: "Recibido de cliente particular y endosado a Repuestos Rafaela"
  },
  {
    id: "chk-3",
    type: "issued",
    bank: "Banco Nación (Cta Taller Luque)",
    checkNumber: "00184920",
    issuer: "Iván Luque (Cheque Propio)",
    recipient: "Lubricentro & Filtros del Litoral",
    dueDate: "2025-06-15",
    amount: 265000.00,
    status: "Emitido a debitar en cuenta",
    originOrderOrNote: "Pago de lote tambor de aceite y filtros"
  }
];

// Retiros Personales del Dueño (Iván Luque)
export const INITIAL_OWNER_WITHDRAWALS = [
  {
    id: "ret-1",
    date: "2025-05-18",
    concept: "Retiro personal de caja - Gastos particulares",
    method: "Efectivo",
    amount: 150000.00
  },
  {
    id: "ret-2",
    date: "2025-05-10",
    concept: "Transferencia a cuenta personal Iván Luque",
    method: "Transferencia Bancaria",
    amount: 300000.00
  },
  {
    id: "ret-3",
    date: "2025-05-02",
    concept: "Adelanto mensual ganancias taller",
    method: "Efectivo",
    amount: 200000.00
  }
];

// Caja Diaria & Movimientos
export const INITIAL_CASH_BALANCE = {
  cashOnHand: 340000.00,       // Efectivo en caja física del taller
  bankBalance: 1850000.00,     // Saldo en cuenta bancaria del taller
};
