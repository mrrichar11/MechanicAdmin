import * as XLSX from 'xlsx';

/**
 * Convierte serial de fecha de Excel a string YYYY-MM-DD
 */
function excelDateToString(val) {
  if (!val) return new Date().toISOString().split('T')[0];
  if (typeof val === 'number') {
    // Excel date epoch: Jan 1 1900
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  return String(val).trim();
}

/**
 * Parsea un archivo Excel individual del taller
 */
export function parseWorkshopExcelFile(fileBuffer, fileName) {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    
    // Intenta extraer patente del nombre de archivo (ej. "BHY Mercedes AF 018 OO.xlsx")
    let fallbackPlate = "";
    const plateMatch = fileName.match(/([A-Z]{2}\s*\d{3}\s*[A-Z]{2}|[A-Z]{3}\s*\d{3})/i);
    if (plateMatch) {
      fallbackPlate = plateMatch[1].toUpperCase().replace(/\s+/g, ' ');
    }

    let detectedVehicle = {
      id: `veh-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      plate: fallbackPlate || 'SIN PATENTE',
      model: '',
      clientName: '',
      clientType: 'particular',
      phone: '',
      address: 'Sunchales',
      vin: '',
      engine: '',
      injectionSystem: 'Bosch',
      currentKm: 0,
      history: []
    };

    // Si en el nombre dice BHY u otra empresa, clasificar como flota
    if (fileName.toUpperCase().includes('BHY')) {
      detectedVehicle.clientName = 'BHY S.A.';
      detectedVehicle.clientType = 'fleet';
    }

    const validVisits = [];

    // Iterar por las hojas del libro
    for (const sheetName of workbook.SheetNames) {
      const ws = workbook.Sheets[sheetName];
      if (!ws) continue;

      // Convertir a matriz de filas
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (!rows || rows.length < 10) continue; // Hoja vacía o plantilla sin uso

      let visitDate = '';
      let visitKm = 0;
      let tasks = [];
      let parts = [];
      let laborCost = 0;
      let taxRate = 21;
      let foundJobsSection = false;
      let foundPartsSection = false;

      // Escanear filas
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        const rowStr = row.map(c => String(c).trim()).join(' ');

        // Datos del encabezado de la hoja
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c]).trim();
          
          if (val.toLowerCase().includes('cliente:') && row[c + 1]) {
            const cli = String(row[c + 1]).trim();
            if (cli && !detectedVehicle.clientName) detectedVehicle.clientName = cli;
          }
          if (val.toLowerCase().includes('unidad:') && row[c + 1]) {
            const mod = String(row[c + 1]).trim();
            if (mod && !detectedVehicle.model) detectedVehicle.model = mod;
          }
          if (val.toLowerCase().includes('vehículo:') && row[c + 2]) {
            const mod = String(row[c + 2]).trim();
            if (mod) detectedVehicle.model = mod;
          }
          if (val.toLowerCase().includes('dominio:') && (row[c + 1] || row[c + 2])) {
            const pl = String(row[c + 1] || row[c + 2]).trim();
            if (pl) detectedVehicle.plate = pl.toUpperCase();
          }
          if (val.toLowerCase().includes('chasis:') && (row[c + 1] || row[c + 2])) {
            const vin = String(row[c + 1] || row[c + 2]).trim();
            if (vin) detectedVehicle.vin = vin;
          }
          if (val.toLowerCase().includes('motor:') && (row[c + 1] || row[c + 2])) {
            const eng = String(row[c + 1] || row[c + 2]).trim();
            if (eng) detectedVehicle.engine = eng;
          }
          if (val.toLowerCase().includes('kilómetros:') || val.toLowerCase().includes('kilometros:')) {
            const kmVal = parseFloat(row[c + 1]);
            if (!isNaN(kmVal) && kmVal > 0) {
              visitKm = kmVal;
              if (kmVal > detectedVehicle.currentKm) detectedVehicle.currentKm = kmVal;
            }
          }
          if (val.toLowerCase().includes('fecha:')) {
            const dateVal = row[c + 1];
            if (dateVal) {
              visitDate = excelDateToString(dateVal);
            }
          }
        }

        // Detectar secciones
        if (rowStr.toLowerCase().includes('trabajos realizados')) {
          foundJobsSection = true;
          foundPartsSection = false;
          continue;
        }

        if (rowStr.toLowerCase().includes('repuestos') && rowStr.toLowerCase().includes('importes')) {
          foundJobsSection = false;
          foundPartsSection = true;
          continue;
        }

        if (rowStr.toLowerCase().includes('mano de obra')) {
          foundJobsSection = false;
          foundPartsSection = false;
          // Buscar importe
          for (let col = row.length - 1; col >= 0; col--) {
            const n = parseFloat(row[col]);
            if (!isNaN(n) && n > 0) {
              laborCost = n;
              break;
            }
          }
          continue;
        }

        // Si estamos en sección Trabajos Realizados
        if (foundJobsSection) {
          // Si llegamos a repuestos u otra cosa, parar
          if (rowStr.toLowerCase().includes('repuestos') || rowStr.toLowerCase().includes('subtotal')) {
            foundJobsSection = false;
          } else {
            // Unir texto no vacío
            const textParts = row.filter(cell => String(cell).trim() !== '').map(cell => String(cell).trim());
            const text = textParts.join(' ');
            if (text.length > 3 && !text.toLowerCase().includes('trabajos realizados')) {
              tasks.push(text);
            }
          }
        }

        // Si estamos en sección Repuestos
        if (foundPartsSection) {
          if (rowStr.toLowerCase().includes('mano de obra') || rowStr.toLowerCase().includes('subtotal') || rowStr.toLowerCase().includes('total')) {
            foundPartsSection = false;
          } else {
            const desc = row[2] ? String(row[2]).trim() : (row[1] ? String(row[1]).trim() : '');
            const brand = row[4] ? String(row[4]).trim() : 'Estándar';
            let price = 0;
            let isFree = false;

            for (let col = row.length - 1; col >= 5; col--) {
              const cellVal = String(row[col]).trim();
              if (cellVal.toLowerCase().includes('sin cargo')) {
                isFree = true;
                break;
              }
              const num = parseFloat(row[col]);
              if (!isNaN(num) && num > 0) {
                price = num;
                break;
              }
            }

            if (desc.length > 2 && !desc.toLowerCase().includes('repuestos') && !desc.toLowerCase().includes('importes')) {
              parts.push({
                description: desc,
                brand: brand || 'Original',
                unitPrice: isFree ? 0 : price,
                qty: 1,
                isFree: isFree
              });
            }
          }
        }
      }

      // Si la hoja tenía tareas o repuestos, la tomamos como una visita técnica válida
      if (tasks.length > 0 || parts.length > 0) {
        validVisits.push({
          id: `vis-${Date.now()}-${validVisits.length}`,
          sheetName: sheetName,
          date: visitDate || '2025-05-18',
          km: visitKm || detectedVehicle.currentKm,
          status: 'Completado',
          invoiceNumber: `OT-${sheetName.replace(/\s+/g, '')}`,
          tasks: tasks,
          parts: parts,
          laborCost: laborCost || 150000,
          taxRate: 21
        });
      }
    }

    if (!detectedVehicle.model) {
      detectedVehicle.model = fileName.replace('.xlsx', '').replace(detectedVehicle.plate, '').trim();
    }
    if (!detectedVehicle.clientName) {
      detectedVehicle.clientName = 'Cliente Taller';
    }

    detectedVehicle.history = validVisits;

    return {
      success: true,
      vehicle: detectedVehicle,
      sheetCount: validVisits.length,
      fileName: fileName
    };

  } catch (err) {
    console.error('Error parseando excel:', err);
    return {
      success: false,
      error: err.message,
      fileName: fileName
    };
  }
}
