import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * Servicio Centralizado de Base de Datos Supabase (Multi-tenant con Aislamiento Total)
 * Cada taller tiene su propio workshop_id vinculado a su cuenta de usuario.
 * Ningún taller puede ver o modificar los datos de otro taller.
 */

// 1. Obtener o crear el perfil del taller para el usuario autenticado
export async function getOrCreateWorkshop(user, fallbackProfile = {}) {
  if (!isSupabaseConfigured || !supabase || !user) return null;

  try {
    // Buscar si ya existe el taller para este usuario
    const { data: existing, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('Error buscando taller en Supabase:', error);
    }

    if (existing) {
      return existing;
    }

    // Si no existe, crear el taller automáticamente con sus datos iniciales
    const meta = user.user_metadata || {};
    const newWorkshop = {
      user_id: user.id,
      name: fallbackProfile.name || meta.workshop_name || 'Mi Taller Mecánico',
      owner: fallbackProfile.owner || meta.owner_name || (user.email ? user.email.split('@')[0] : 'Titular Taller'),
      email: user.email || fallbackProfile.email || '',
      phone: fallbackProfile.phone || '',
      address: fallbackProfile.address || '',
      cuit: fallbackProfile.cuit || '',
      logo_url: fallbackProfile.logoUrl || '',
      tax_rate: fallbackProfile.taxRate || 21,
      default_labor_cost: fallbackProfile.defaultLaborCost || 150000
    };

    const { data: created, error: insertErr } = await supabase
      .from('workshops')
      .insert(newWorkshop)
      .select()
      .single();

    if (insertErr) {
      console.error('Error creando taller en Supabase:', insertErr);
      return null;
    }

    return created;
  } catch (err) {
    console.error('Fallo en getOrCreateWorkshop:', err);
    return null;
  }
}

// 2. Cargar todos los datos del taller desde la nube
export async function loadWorkshopData(workshopId) {
  if (!isSupabaseConfigured || !supabase || !workshopId) {
    return null;
  }

  try {
    // Cargar perfil del taller
    const { data: workshop } = await supabase
      .from('workshops')
      .select('*')
      .eq('id', workshopId)
      .single();

    // Cargar Vehículos de este taller
    const { data: dbVehicles, error: vehErr } = await supabase
      .from('vehicles')
      .select('*')
      .eq('workshop_id', workshopId)
      .order('created_at', { ascending: false });

    if (vehErr) throw vehErr;

    // Cargar Órdenes de Trabajo / Visitas técnicas
    const { data: dbOrders, error: ordErr } = await supabase
      .from('work_orders')
      .select('*')
      .eq('workshop_id', workshopId)
      .order('date', { ascending: false });

    if (ordErr) throw ordErr;

    // Vincular visitas a sus vehículos correspondientes
    const vehiclesWithHistory = (dbVehicles || []).map(v => {
      const history = (dbOrders || [])
        .filter(o => o.vehicle_id === v.id)
        .map(o => ({
          id: o.id,
          invoiceNumber: o.invoice_number,
          date: o.date,
          km: o.km,
          status: o.status,
          tasks: o.tasks || [],
          parts: o.parts || [],
          laborCost: Number(o.labor_cost) || 0,
          taxRate: Number(o.tax_rate) || 21,
          subtotal: Number(o.subtotal) || 0,
          taxAmount: Number(o.tax_amount) || 0,
          total: Number(o.total) || 0
        }));

      return {
        id: v.id,
        plate: v.plate,
        model: v.model,
        clientType: v.client_type,
        clientName: v.client_name,
        cuitDni: v.cuit_dni,
        phone: v.phone,
        address: v.address,
        vin: v.vin,
        engine: v.engine,
        injectionSystem: v.injection_system,
        currentKm: v.current_km,
        history: history
      };
    });

    // Cargar Proveedores
    const { data: dbSuppliers } = await supabase
      .from('suppliers')
      .select('*')
      .eq('workshop_id', workshopId);

    // Cargar Cheques
    const { data: dbChecks } = await supabase
      .from('checks')
      .select('*')
      .eq('workshop_id', workshopId);

    // Cargar Retiros del dueño
    const { data: dbWithdrawals } = await supabase
      .from('owner_withdrawals')
      .select('*')
      .eq('workshop_id', workshopId);

    // Cargar Clientes (CRM & Facturación Fiscal)
    let dbClients = [];
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('workshop_id', workshopId)
        .order('name');
      if (!error && data) dbClients = data;
    } catch (e) {
      console.warn('Tabla clients no disponible aún en Supabase:', e);
    }

    // Cargar Pagos / Cobranzas de Clientes
    let dbPayments = [];
    try {
      const { data, error } = await supabase
        .from('client_payments')
        .select('*')
        .eq('workshop_id', workshopId)
        .order('date', { ascending: false });
      if (!error && data) dbPayments = data;
    } catch (e) {
      console.warn('Tabla client_payments no disponible aún en Supabase:', e);
    }

    const checksFormatted = (dbChecks || []).map(c => ({
      id: c.id,
      type: c.check_type,
      bank: c.bank,
      number: c.check_number,
      issuer: c.issuer,
      recipient: c.recipient,
      dueDate: c.due_date,
      amount: Number(c.amount) || 0,
      status: c.status,
      notes: c.notes
    }));

    const clientAccounts = buildClientAccounts(vehiclesWithHistory, dbClients, dbPayments, checksFormatted);

    return {
      workshop,
      vehicles: vehiclesWithHistory,
      clients: dbClients,
      clientAccounts,
      clientPayments: dbPayments,
      suppliers: (dbSuppliers || []).map(s => ({
        id: s.id,
        name: s.name,
        contact: s.contact,
        phone: s.phone,
        rubro: s.rubro,
        cuit: s.cuit,
        balanceDue: Number(s.balance_due) || 0,
        invoices: []
      })),
      checks: checksFormatted,
      withdrawals: (dbWithdrawals || []).map(w => ({
        id: w.id,
        date: w.date,
        concept: w.concept,
        method: w.method,
        amount: Number(w.amount) || 0
      }))
    };
  } catch (err) {
    console.error('Error cargando datos desde Supabase:', err);
    return null;
  }
}

// 3. Guardar o actualizar datos de configuración del taller
export async function saveWorkshopInfoToDb(workshopId, profileData) {
  if (!isSupabaseConfigured || !supabase || !workshopId) return false;

  try {
    const { error } = await supabase
      .from('workshops')
      .update({
        name: profileData.name,
        owner: profileData.owner,
        address: profileData.address,
        phone: profileData.phone,
        email: profileData.email,
        cuit: profileData.cuit,
        logo_url: profileData.logoUrl,
        tax_rate: profileData.taxRate,
        default_labor_cost: profileData.defaultLaborCost,
        updated_at: new Date().toISOString()
      })
      .eq('id', workshopId);

    return !error;
  } catch (e) {
    console.error('Error guardando configuración en Supabase:', e);
    return false;
  }
}

// 4. Guardar o actualizar un vehículo
export async function saveVehicleToDb(workshopId, vehicle) {
  if (!isSupabaseConfigured || !supabase || !workshopId) return null;

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(vehicle.id);
    const row = {
      workshop_id: workshopId,
      plate: vehicle.plate,
      model: vehicle.model,
      client_type: vehicle.clientType || 'particular',
      client_name: vehicle.clientName,
      cuit_dni: vehicle.cuitDni || '',
      phone: vehicle.phone || '',
      address: vehicle.address || '',
      vin: vehicle.vin || '',
      engine: vehicle.engine || '',
      injection_system: vehicle.injectionSystem || 'Bosch',
      current_km: vehicle.currentKm || 0,
      updated_at: new Date().toISOString()
    };

    if (isUuid) {
      row.id = vehicle.id;
    }

    const { data, error } = await supabase
      .from('vehicles')
      .upsert(row)
      .select()
      .single();

    if (error) {
      console.error('Error guardando vehículo en Supabase:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Fallo en saveVehicleToDb:', e);
    return null;
  }
}

// 5. Guardar o actualizar una orden de trabajo (visita técnica)
export async function saveWorkOrderToDb(workshopId, vehicleDbId, orderData) {
  if (!isSupabaseConfigured || !supabase || !workshopId) return null;

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderData.id);
    const row = {
      workshop_id: workshopId,
      vehicle_id: vehicleDbId,
      invoice_number: orderData.invoiceNumber || '',
      date: orderData.date || new Date().toISOString().split('T')[0],
      km: orderData.km || 0,
      status: orderData.status || 'Completado',
      tasks: orderData.tasks || [],
      parts: orderData.parts || [],
      labor_cost: orderData.laborCost || 0,
      tax_rate: orderData.taxRate || 21,
      subtotal: orderData.subtotal || 0,
      tax_amount: orderData.taxAmount || 0,
      total: orderData.total || 0
    };

    if (isUuid) {
      row.id = orderData.id;
    }

    const { data, error } = await supabase
      .from('work_orders')
      .upsert(row)
      .select()
      .single();

    if (error) {
      console.error('Error guardando orden en Supabase:', error);
      return null;
    }

    // Actualizar odómetro del vehículo
    await supabase
      .from('vehicles')
      .update({ current_km: orderData.km, updated_at: new Date().toISOString() })
      .eq('id', vehicleDbId);

    return data;
  } catch (e) {
    console.error('Fallo en saveWorkOrderToDb:', e);
    return null;
  }
}

// 6. Importación masiva desde Planillas Excel a Supabase
export async function bulkImportToSupabase(workshopId, importedVehicles) {
  if (!isSupabaseConfigured || !supabase || !workshopId || !Array.isArray(importedVehicles)) {
    return false;
  }

  try {
    for (const veh of importedVehicles) {
      // 1. Guardar vehículo
      const { data: dbVeh, error: vehErr } = await supabase
        .from('vehicles')
        .insert({
          workshop_id: workshopId,
          plate: veh.plate,
          model: veh.model,
          client_type: veh.clientType || 'particular',
          client_name: veh.clientName,
          cuit_dni: veh.cuitDni || '',
          phone: veh.phone || '',
          address: veh.address || '',
          vin: veh.vin || '',
          engine: veh.engine || '',
          injection_system: veh.injectionSystem || 'Bosch',
          current_km: veh.currentKm || 0
        })
        .select()
        .single();

      if (vehErr || !dbVeh) {
        console.error('Error importando vehículo a Supabase:', vehErr);
        continue;
      }

      // 2. Guardar visitas históricas de este vehículo
      if (Array.isArray(veh.history) && veh.history.length > 0) {
        const orderRows = veh.history.map(h => ({
          workshop_id: workshopId,
          vehicle_id: dbVeh.id,
          invoice_number: h.invoiceNumber || '',
          date: h.date || new Date().toISOString().split('T')[0],
          km: h.km || 0,
          status: h.status || 'Completado',
          tasks: h.tasks || [],
          parts: h.parts || [],
          labor_cost: h.laborCost || 0,
          tax_rate: h.taxRate || 21,
          subtotal: h.subtotal || 0,
          tax_amount: h.taxAmount || 0,
          total: h.total || 0
        }));

        await supabase.from('work_orders').insert(orderRows);
      }
    }
    return true;
  } catch (e) {
    console.error('Error en bulkImportToSupabase:', e);
    return false;
  }
}

// 7. Sincronizar datos locales existentes a Supabase si la base de datos está vacía
export async function syncLocalDataIfDbEmpty(workshopId, localVehicles, localSettings) {
  if (!isSupabaseConfigured || !supabase || !workshopId) return false;

  try {
    const { count } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('workshop_id', workshopId);

    // Si no hay ningún vehículo en Supabase pero hay en local, migrarlos
    if (count === 0 && Array.isArray(localVehicles) && localVehicles.length > 0) {
      console.log(`📤 Subiendo ${localVehicles.length} vehículos locales a Supabase...`);
      await bulkImportToSupabase(workshopId, localVehicles);
    }

    if (localSettings && localSettings.name) {
      await saveWorkshopInfoToDb(workshopId, localSettings);
    }
    return true;
  } catch (e) {
    console.warn('Sync inicial local a DB ignorado:', e);
    return false;
  }
}

// 8. Construcción Inteligente del Libro Mayor y Cuentas de Clientes (CRM + Cuenta Corriente)
export function buildClientAccounts(vehicles = [], dbClients = [], dbPayments = [], checks = []) {
  const clientsMap = new Map();

  // A. Registrar clientes dados de alta en Supabase
  (dbClients || []).forEach(dc => {
    const key = (dc.name || '').trim().toLowerCase();
    clientsMap.set(key || dc.id, {
      id: dc.id,
      name: dc.name,
      clientName: dc.name,
      contactPerson: dc.contact_person || '',
      clientType: dc.client_type || 'particular',
      taxId: dc.tax_id || '',
      cuitDni: dc.tax_id || '',
      taxCategory: dc.tax_category || 'Consumidor Final',
      email: dc.email || '',
      phone: dc.phone || '',
      address: dc.address || '',
      city: dc.city || '',
      province: dc.province || '',
      postalCode: dc.postal_code || '',
      paymentTermDays: parseInt(dc.payment_term_days, 10) || 0,
      creditLimit: parseFloat(dc.credit_limit) || 0,
      notes: dc.notes || '',
      vehicles: [],
      orders: [],
      payments: [],
      checks: []
    });
  });

  // B. Inferir y asociar vehículos y visitas a los clientes
  (vehicles || []).forEach(v => {
    const rawName = (v.clientName || 'Cliente Particular').trim();
    const key = rawName.toLowerCase();

    let client = clientsMap.get(key);
    if (!client) {
      // Buscar si coincide por CUIT/DNI
      if (v.cuitDni) {
        for (const c of clientsMap.values()) {
          if (c.taxId && c.taxId.trim() === v.cuitDni.trim()) {
            client = c;
            break;
          }
        }
      }
    }

    if (!client) {
      client = {
        id: `cli-${encodeURIComponent(key)}`,
        name: rawName,
        clientName: rawName,
        contactPerson: '',
        clientType: v.clientType || 'particular',
        taxId: v.cuitDni || '',
        cuitDni: v.cuitDni || '',
        taxCategory: 'Consumidor Final',
        email: '',
        phone: v.phone || '',
        address: v.address || '',
        city: '',
        province: '',
        postalCode: '',
        paymentTermDays: v.clientType === 'fleet' ? 30 : 0,
        creditLimit: 0,
        notes: '',
        vehicles: [],
        orders: [],
        payments: [],
        checks: []
      };
      clientsMap.set(key, client);
    }

    // Agregar vehículo a la flota del cliente si no existe ya
    if (!client.vehicles.some(cv => cv.plate === v.plate)) {
      client.vehicles.push(v);
    }

    // Si el cliente no tiene teléfono o CUIT y el vehículo sí, completar los datos
    if (!client.phone && v.phone) client.phone = v.phone;
    if (!client.taxId && v.cuitDni) {
      client.taxId = v.cuitDni;
      client.cuitDni = v.cuitDni;
    }
    if (!client.address && v.address) client.address = v.address;

    // Agregar todas las órdenes de trabajo / visitas como débitos
    (v.history || []).forEach(h => {
      client.orders.push({
        ...h,
        vehiclePlate: v.plate,
        vehicleModel: v.model,
        vehicleId: v.id
      });
    });
  });

  // C. Imputar Pagos y Cobranzas Recibidas
  (dbPayments || []).forEach(p => {
    let matchedClient = null;

    // 1. Por ID directo
    if (p.client_id) {
      for (const c of clientsMap.values()) {
        if (c.id === p.client_id) {
          matchedClient = c;
          break;
        }
      }
    }

    // 2. Por coincidencia en notas o nombres si no tiene UUID directo
    if (!matchedClient && p.notes) {
      const noteLower = p.notes.toLowerCase();
      for (const c of clientsMap.values()) {
        if (noteLower.includes(c.name.toLowerCase())) {
          matchedClient = c;
          break;
        }
      }
    }

    if (matchedClient) {
      matchedClient.payments.push({
        id: p.id,
        date: p.date,
        amount: Number(p.amount) || 0,
        method: p.payment_method || 'Efectivo',
        checkId: p.check_id,
        receiptNumber: p.receipt_number || '',
        note: p.notes || ''
      });
    }
  });

  // D. Asociar Cheques en Cartera entregados por este cliente
  (checks || []).forEach(chk => {
    const issuer = (chk.issuer || '').toLowerCase().trim();
    if (!issuer) return;
    for (const c of clientsMap.values()) {
      if (c.name.toLowerCase().includes(issuer) || issuer.includes(c.name.toLowerCase())) {
        if (!c.checks.some(existingChk => existingChk.id === chk.id)) {
          c.checks.push(chk);
        }
      }
    }
  });

  // E. Calcular Totales, Saldo Deudor, Plazo y Días de Mora
  return Array.from(clientsMap.values()).map(client => {
    const totalBilled = client.orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalPaid = client.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const balanceDue = Math.max(0, totalBilled - totalPaid);

    let isOverdue = false;
    let overdueDays = 0;

    if (balanceDue > 0) {
      // Ordenar visitas de más vieja a más nueva para consumir pagos con método FIFO
      const sortedOrders = [...client.orders].sort((a, b) => new Date(a.date) - new Date(b.date));
      let paidCover = totalPaid;
      let oldestUnpaidDate = null;

      for (const ord of sortedOrders) {
        const ordTotal = Number(ord.total) || 0;
        if (paidCover >= ordTotal) {
          paidCover -= ordTotal;
        } else {
          oldestUnpaidDate = ord.date;
          break;
        }
      }

      if (oldestUnpaidDate) {
        const orderDate = new Date(oldestUnpaidDate);
        const daysElapsed = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        const termDays = client.paymentTermDays || 0;
        if (daysElapsed > termDays) {
          isOverdue = true;
          overdueDays = daysElapsed - termDays;
        }
      }
    }

    return {
      ...client,
      totalBilled,
      totalPaid,
      balanceDue,
      isOverdue,
      overdueDays
    };
  });
}

// 9. Guardar o actualizar un Cliente en Supabase
export async function saveClientToDb(workshopId, clientData) {
  if (!isSupabaseConfigured || !supabase || !workshopId) return null;

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientData.id);
    const row = {
      workshop_id: workshopId,
      name: clientData.name || clientData.clientName,
      contact_person: clientData.contactPerson || '',
      client_type: clientData.clientType || 'particular',
      tax_id: clientData.taxId || clientData.cuitDni || '',
      tax_category: clientData.taxCategory || 'Consumidor Final',
      email: clientData.email || '',
      phone: clientData.phone || '',
      address: clientData.address || '',
      city: clientData.city || '',
      province: clientData.province || '',
      postal_code: clientData.postalCode || '',
      payment_term_days: parseInt(clientData.paymentTermDays, 10) || 0,
      credit_limit: parseFloat(clientData.creditLimit) || 0,
      notes: clientData.notes || '',
      updated_at: new Date().toISOString()
    };

    if (isUuid) {
      row.id = clientData.id;
    }

    const { data, error } = await supabase
      .from('clients')
      .upsert(row)
      .select()
      .single();

    if (error) {
      console.error('Error guardando cliente en Supabase:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Fallo en saveClientToDb:', e);
    return null;
  }
}

// 10. Guardar o registrar un Cobro / Pago de Cliente en Supabase
export async function saveClientPaymentToDb(workshopId, paymentData) {
  if (!isSupabaseConfigured || !supabase || !workshopId) return null;

  try {
    const isClientUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paymentData.entityId || paymentData.clientId);
    const row = {
      workshop_id: workshopId,
      client_id: isClientUuid ? (paymentData.entityId || paymentData.clientId) : null,
      date: paymentData.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(paymentData.amount) || 0,
      payment_method: paymentData.method || paymentData.paymentMethod || 'Efectivo',
      check_id: paymentData.checkId || null,
      receipt_number: paymentData.receiptNumber || '',
      notes: paymentData.notes || ''
    };

    const { data, error } = await supabase
      .from('client_payments')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('Error guardando pago de cliente en Supabase:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Fallo en saveClientPaymentToDb:', e);
    return null;
  }
}

