import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  FileCheck, 
  DollarSign, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Printer, 
  Edit3, 
  Plus, 
  MessageCircle,
  FileText,
  CreditCard,
  Building
} from 'lucide-react';

export default function ClientDetailModal({ 
  isOpen, 
  onClose, 
  client, 
  onOpenPayment, 
  onEditClient, 
  onSelectVehicle,
  workshopInfo 
}) {
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'vehicles' | 'checks' | 'fiscal'

  if (!isOpen || !client) return null;

  const isFleet = client.clientType === 'fleet';
  const hasDebt = (client.balanceDue || 0) > 0;

  // Unificar movimientos para el Libro Mayor cronológico
  const ledgerMovements = [
    ...(client.orders || []).map(o => ({
      id: `ord-${o.id}`,
      type: 'debit', // Deuda generada por trabajo realizado
      date: o.date,
      concept: `Orden de Trabajo ${o.invoiceNumber || ''} • ${o.vehiclePlate} (${o.vehicleModel})`,
      amount: o.total,
      rawItem: o
    })),
    ...(client.payments || []).map(p => ({
      id: `pay-${p.id}`,
      type: 'credit', // Pago / cobranza recibida
      date: p.date,
      concept: `Cobranza ${p.receiptNumber ? `Recibo ${p.receiptNumber}` : ''} • ${p.method}${p.note ? ` (${p.note})` : ''}`,
      amount: p.amount,
      rawItem: p
    }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calcular saldo acumulado paso a paso
  let runningBalance = 0;
  const ledgerWithBalance = ledgerMovements.map(m => {
    if (m.type === 'debit') {
      runningBalance += m.amount;
    } else {
      runningBalance = Math.max(0, runningBalance - m.amount);
    }
    return { ...m, balance: runningBalance };
  }).reverse(); // Mostrar los más recientes arriba

  // Formato para WhatsApp
  const handleShareWhatsApp = () => {
    const text = `Hola *${client.name}*! Te compartimos el estado de cuenta actualizado de tu vehículo/flota en *${workshopInfo.name || 'nuestro taller'}*:\n\n` +
      `🚗 *Vehículos:* ${client.vehicles?.join(', ') || 'En taller'}\n` +
      `📊 *Total Facturado:* $${client.totalBilled?.toLocaleString('es-AR')}\n` +
      `✅ *Total Abonado:* $${client.totalPaid?.toLocaleString('es-AR')}\n` +
      `💰 *Saldo Pendiente:* $${client.balanceDue?.toLocaleString('es-AR')}\n` +
      `📅 *Condición:* ${client.paymentTermDays ? `${client.paymentTermDays} días` : 'Contado'}\n\n` +
      `Quedamos a disposición ante cualquier consulta. ¡Muchas gracias!`;

    const cleanPhone = (client.phone || '').replace(/[^0-9]/g, '');
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURI(text)}`
      : `https://wa.me/?text=${encodeURI(text)}`;
    window.open(url, '_blank');
  };

  // Imprimir comprobante de Estado de Cuenta
  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border-2 border-slate-300 text-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        
        {/* Header con Perfil del Cliente */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b-2 border-slate-800 shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                {isFleet ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {client.name}
                  </h2>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    isFleet 
                      ? 'bg-blue-500/20 text-blue-300 border-blue-400/40' 
                      : 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                  }`}>
                    {isFleet ? 'Flota / Empresa' : 'Particular'}
                  </span>
                  {client.taxCategory && (
                    <span className="text-[10px] font-bold bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
                      {client.taxCategory}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap">
                  {client.taxId && (
                    <span className="font-mono bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">
                      CUIT/DNI: {client.taxId}
                    </span>
                  )}
                  {client.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {client.phone}
                    </span>
                  )}
                  {client.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {client.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => onEditClient(client)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                title="Editar datos del cliente"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editar</span>
              </button>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>

        {/* Barra de Estado Financiero & Semáforo de Cuenta Corriente */}
        <div className="bg-slate-100/90 border-b-2 border-slate-200 p-4 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
            
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Total Facturado</span>
              <span className="text-base font-black font-mono text-slate-900">
                ${client.totalBilled?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{client.orders?.length || 0} visitas técnicas</span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-emerald-600 block">Total Cobrado</span>
              <span className="text-base font-black font-mono text-emerald-700">
                ${client.totalPaid?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{client.payments?.length || 0} pagos registrados</span>
            </div>

            <div className={`p-3 rounded-2xl border shadow-2xs ${
              hasDebt 
                ? (client.isOverdue ? 'bg-rose-50 border-rose-300' : 'bg-amber-50 border-amber-300')
                : 'bg-emerald-50 border-emerald-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase ${
                  hasDebt ? (client.isOverdue ? 'text-rose-800' : 'text-amber-800') : 'text-emerald-800'
                }`}>
                  Saldo Deudor
                </span>
                {hasDebt ? (
                  client.isOverdue ? (
                    <span className="text-[9px] bg-rose-600 text-white font-black px-1.5 py-0.2 rounded-full">
                      Vencido {client.daysOverdue}d
                    </span>
                  ) : (
                    <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                      En plazo
                    </span>
                  )
                ) : (
                  <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded-full">
                    Al día
                  </span>
                )}
              </div>
              <span className={`text-base font-black font-mono block mt-0.5 ${
                hasDebt ? (client.isOverdue ? 'text-rose-950' : 'text-amber-950') : 'text-emerald-950'
              }`}>
                ${client.balanceDue?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Plazo de Pago</span>
                <span className="text-xs font-black text-slate-800">
                  {client.paymentTermDays ? `${client.paymentTermDays} días fecha factura` : 'Contado inmediato'}
                </span>
              </div>
              <button
                onClick={() => onOpenPayment(client)}
                className="mt-1.5 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar Cobro
              </button>
            </div>

          </div>
        </div>

        {/* Pestañas de Navegación Interna */}
        <div className="bg-white px-4 sm:px-6 pt-3 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ledger'
                ? 'border-slate-900 text-slate-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Cuenta Corriente & Movimientos ({ledgerMovements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vehicles')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'vehicles'
                ? 'border-slate-900 text-slate-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4 text-amber-500" />
            <span>Vehículos Asociados ({client.vehicles?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('checks')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'checks'
                ? 'border-slate-900 text-slate-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Cheques del Cliente ({client.checks?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('fiscal')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'fiscal'
                ? 'border-slate-900 text-slate-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Datos Fiscales & Contacto</span>
          </button>
        </div>

        {/* Contenido de la Pestaña Activa */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          
          {/* TAB 1: LIBRO MAYOR DE CUENTA CORRIENTE */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Historial de Órdenes y Cobranzas
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Registro detallado de débitos por trabajos mecánicos y créditos por pagos recibidos.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    title="Enviar resumen de deuda por WhatsApp al cliente"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={handlePrintStatement}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    title="Imprimir estado de cuenta"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              {ledgerWithBalance.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-400">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-bold text-xs">No hay movimientos registrados para este cliente</p>
                  <p className="text-[11px]">Las órdenes de trabajo de sus vehículos y pagos aparecerán aquí automáticamente.</p>
                </div>
              ) : (
                <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Fecha</th>
                          <th className="py-2.5 px-3">Concepto / Comprobante</th>
                          <th className="py-2.5 px-3 text-right">Debe (Trabajo)</th>
                          <th className="py-2.5 px-3 text-right">Haber (Cobrado)</th>
                          <th className="py-2.5 px-3 text-right">Saldo Acumulado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {ledgerWithBalance.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                              {m.date}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5">
                                {m.type === 'debit' ? (
                                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                                )}
                                <span className="font-bold text-slate-900">{m.concept}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                              {m.type === 'debit' ? `$${m.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                              {m.type === 'credit' ? `$${m.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                              ${m.balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VEHÍCULOS DEL CLIENTE / FLOTA */}
          {activeTab === 'vehicles' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Vehículos Asignados a este Cliente ({client.vehicles?.length || 0})
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {client.vehicles?.map((plate) => (
                  <div 
                    key={plate} 
                    className="bg-white border-2 border-slate-200 rounded-2xl p-3.5 shadow-xs flex items-center justify-between hover:border-slate-400 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-black">
                        <Car className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <span className="font-mono font-black text-sm text-slate-950 block">
                          {plate}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {isFleet ? 'Vehículo de flota' : 'Auto particular'}
                        </span>
                      </div>
                    </div>
                    {onSelectVehicle && (
                      <button
                        onClick={() => {
                          onClose();
                          onSelectVehicle(plate);
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                        title="Ver historial técnico del auto"
                      >
                        Ver Auto
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CHEQUES RECIBIDOS DE ESTE CLIENTE */}
          {activeTab === 'checks' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Cheques Entregados en Pago por {client.name}
              </h3>

              {(!client.checks || client.checks.length === 0) ? (
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-400 text-xs">
                  <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-bold">No hay cheques registrados a nombre de este cliente</p>
                  <p className="text-[11px] text-slate-400">Cuando registre una cobranza con método "Cheque Recibido", se listará aquí.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {client.checks.map(chk => (
                    <div key={chk.id} className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Banco</span>
                          <h4 className="font-bold text-sm text-slate-900">{chk.bank}</h4>
                          <span className="text-xs font-mono font-bold text-slate-600">N° {chk.checkNumber || chk.number}</span>
                        </div>
                        <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {chk.status || 'En Cartera'}
                        </span>
                      </div>

                      <div className="flex justify-between items-end pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Vencimiento:</span>
                          <span className="font-mono font-bold text-xs text-slate-700">{chk.dueDate}</span>
                        </div>
                        <span className="text-base font-black font-mono text-slate-950">
                          ${chk.amount?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DATOS FISCALES & FACTURACIÓN */}
          {activeTab === 'fiscal' && (
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 text-xs">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider pb-2 border-b border-slate-200">
                Información para Facturación Fiscal (AFIP / Factura Electrónica)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Razón Social / Nombre Fiscal:</span>
                  <p className="font-bold text-slate-900 text-sm">{client.name}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Identificación Tributaria (CUIT / CUIL / DNI):</span>
                  <p className="font-mono font-bold text-slate-900 text-sm">{client.taxId || 'No informado'}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Condición frente al IVA:</span>
                  <p className="font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 inline-block">
                    {client.taxCategory || 'Consumidor Final'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Tipo de Factura Habitual:</span>
                  <p className="font-black text-slate-800 font-mono">
                    {client.taxCategory === 'Responsable Inscripto' ? 'Factura "A"' : 'Factura "B"'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Domicilio Fiscal / Dirección:</span>
                  <p className="font-medium text-slate-800">{client.address || 'Sin dirección registrada'}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Email de Envío de Facturas:</span>
                  <p className="font-medium text-slate-800">{client.email || 'Sin correo electrónico'}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Límite de Crédito Permitido:</span>
                  <p className="font-mono font-bold text-slate-900">
                    {client.creditLimit ? `$${client.creditLimit.toLocaleString('es-AR')}` : 'Sin límite fijado'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Notas y Observaciones de Facturación:</span>
                  <p className="font-medium text-slate-600 italic">{client.notes || 'Sin notas especiales'}</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
