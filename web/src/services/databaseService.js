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

    return {
      workshop,
      vehicles: vehiclesWithHistory,
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
      checks: (dbChecks || []).map(c => ({
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
      })),
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
