import React, { useState } from 'react';
import { X, Calendar, Wrench, Package, Printer, Plus, History, Building2, User, Edit3, ChevronDown } from 'lucide-react';

export default function VehicleDetailModal({ isOpen, onClose, vehicle, onOpenNewOrder, onPrintVisit, onEditVisit }) {
  if (!isOpen || !vehicle) return null;

  const [activeTab, setActiveTab] = useState(0);
  const visits = vehicle.history || [];
  const currentVisit = visits[activeTab] || null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border-2 border-slate-300 text-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        
        {/* Header Modal con datos del vehículo - 100% Responsive para móviles y desktop */}
        <div className="bg-slate-100 p-3.5 sm:px-6 sm:py-4 border-b border-slate-300">
          
          {/* Fila 1: Patente, Modelo y Botón Cerrar (X) */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              
              {/* Placa Mercosur fija con alto contraste y relieve */}
              <div className="inline-flex items-center border-2 border-slate-800 rounded-lg overflow-hidden shadow-sm bg-white shrink-0">
                <span className="bg-[#003399] text-white text-[10px] sm:text-[11px] font-black px-1.5 sm:px-2 py-1 tracking-wider whitespace-nowrap">
                  RA
                </span>
                <span className="font-mono text-sm sm:text-base font-black text-slate-950 px-2 sm:px-3 py-0.5 tracking-widest whitespace-nowrap">
                  {vehicle.plate}
                </span>
              </div>

              {/* Modelo del Auto y Tipo de Cliente */}
              <div className="min-w-0">
                <h2 className="text-sm sm:text-lg font-black text-slate-950 leading-tight truncate">
                  {vehicle.model}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {vehicle.clientType === 'fleet' ? (
                    <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-bold px-2 py-0.2 rounded-full inline-flex items-center gap-1 shrink-0">
                      <Building2 className="w-3 h-3 text-blue-700" /> Flota Empresa
                    </span>
                  ) : (
                    <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-bold px-2 py-0.2 rounded-full inline-flex items-center gap-1 shrink-0">
                      <User className="w-3 h-3 text-purple-700" /> Particular
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Botón Cerrar X siempre visible y accesible */}
            <button 
              onClick={onClose} 
              className="p-1.5 sm:p-2 rounded-xl bg-slate-200 hover:bg-rose-600 hover:text-white text-slate-700 transition shrink-0"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Fila 2: Titular, Teléfono y Botón "+ Nueva Visita" */}
          <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="text-slate-600 truncate">
              <span className="font-bold text-slate-500 text-[11px] uppercase mr-1">Titular:</span>
              <strong className="text-slate-950 font-black bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 mr-2">
                {vehicle.clientName}
              </strong>
              {vehicle.phone && (
                <span className="text-slate-700 font-bold whitespace-nowrap">
                  • Tel: {vehicle.phone}
                </span>
              )}
            </div>

            <button
              onClick={() => onOpenNewOrder(vehicle)}
              className="w-full sm:w-auto px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm hover:shadow"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Nueva Visita</span>
            </button>
          </div>

        </div>

        {/* Ficha técnica compacta con relieve y texto seguro */}
        <div className="bg-white p-3 sm:px-6 sm:py-3 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs shadow-2xs">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-500">Chasis (VIN)</span>
            <span className="font-mono font-bold text-slate-900 text-[11px] sm:text-xs truncate block" title={vehicle.vin}>
              {vehicle.vin || 'No registrado'}
            </span>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-500">Motor</span>
            <span className="font-mono font-bold text-slate-900 text-[11px] sm:text-xs truncate block" title={vehicle.engine}>
              {vehicle.engine || 'No registrado'}
            </span>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-500">Inyección</span>
            <span className="font-bold text-slate-900 text-[11px] sm:text-xs truncate block">
              {vehicle.injectionSystem || 'Bosch'}
            </span>
          </div>
          <div className="bg-amber-50 p-2 rounded-xl border border-amber-300">
            <span className="block text-[9px] sm:text-[10px] uppercase font-bold text-amber-800">Kilometraje Odómetro</span>
            <span className="font-mono text-xs sm:text-sm font-black text-amber-950 block">
              {vehicle.currentKm?.toLocaleString()} km
            </span>
          </div>
        </div>

        {/* Selector de Historial de Visitas - Adaptado para móviles y tablets */}
        <div className="bg-slate-200/90 px-3 sm:px-6 py-2 border-b border-slate-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 shrink-0 text-xs font-black uppercase text-slate-800">
            <History className="w-4 h-4 text-slate-700" />
            <span>Visitas ({visits.length})</span>
          </div>

          {/* Móvil: Selector Dropdown nativo (Evita el corte de texto horizontal en pantallas pequeñas) */}
          <div className="sm:hidden flex-1 max-w-[240px]">
            {visits.length > 0 ? (
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(Number(e.target.value))}
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-2.5 py-1 text-xs font-black text-slate-900 shadow-xs focus:outline-none"
              >
                {visits.map((v, idx) => (
                  <option key={v.id || idx} value={idx}>
                    {v.date} — {v.km?.toLocaleString()} km ({v.status || 'Completado'})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-slate-500">Sin visitas</span>
            )}
          </div>

          {/* Desktop & Tablet: Pestañas horizontales elegantes */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto">
            {visits.map((v, idx) => (
              <button
                key={v.id || idx}
                onClick={() => setActiveTab(idx)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition shrink-0 flex items-center gap-1.5 border-2 ${
                  activeTab === idx
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-black'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{v.date} — {v.km?.toLocaleString()} km</span>
                {v.status === 'En Curso' ? (
                  <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded font-black">
                    En curso
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-bold">✓</span>
                )}
              </button>
            ))}
            {visits.length === 0 && (
              <span className="text-xs text-slate-500">Sin visitas registradas</span>
            )}
          </div>
        </div>

        {/* Contenido de la visita seleccionada */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 bg-slate-50/50">
          {currentVisit ? (
            <>
              {/* Barra de la visita seleccionada con datos y botones */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 shadow-sm text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-300">
                    {currentVisit.invoiceNumber || 'OT-Hoja1'}
                  </span>
                  <span className="text-slate-600 font-bold">
                    📅 {currentVisit.date}
                  </span>
                  <span className="font-mono font-black text-slate-900">
                    ⚡ {currentVisit.km?.toLocaleString()} km
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    currentVisit.status === 'En Curso' 
                      ? 'bg-amber-100 text-amber-950 border border-amber-300' 
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {currentVisit.status === 'En Curso' ? '⏳ Hoja Abierta (En Curso)' : '✅ Visita Cerrada'}
                  </span>
                </div>
                
                {/* Botones de Acción */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => onEditVisit(vehicle, currentVisit)}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-600 rounded-xl font-bold flex items-center justify-center gap-1.5 transition shadow-sm text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Orden / Precios</span>
                  </button>
                  <button
                    onClick={() => onPrintVisit(vehicle, currentVisit)}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition shadow-sm text-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Imprimir Comprobante (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Trabajos realizados en esta visita */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  Trabajos y Procedimientos Realizados ({currentVisit.tasks?.length || 0})
                </h4>
                <ul className="text-xs space-y-2 text-slate-800 font-medium">
                  {currentVisit.tasks?.map((task, i) => {
                    const cleanText = (typeof task === 'string' ? task : '').trim().replace(/[,;]+$/, '');
                    return (
                      <li key={i} className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                        <span className="text-amber-500 font-black text-sm leading-none">•</span>
                        <span className="flex-1">{cleanText}</span>
                      </li>
                    );
                  })}
                  {(!currentVisit.tasks || currentVisit.tasks.length === 0) && (
                    <li className="text-slate-400 text-xs italic">No se detallaron tareas específicas.</li>
                  )}
                </ul>
              </div>

              {/* Repuestos e Insumos */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  Repuestos, Insumos y Mano de Obra
                </h4>
                
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left min-w-[500px]">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Descripción</th>
                        <th className="py-2.5 px-3">Marca / Calidad</th>
                        <th className="py-2.5 px-3 text-center">Cant</th>
                        <th className="py-2.5 px-3 text-right">Precio Unitario</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentVisit.parts?.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 font-medium">
                          <td className="py-2.5 px-3 text-slate-900 font-semibold">{p.description}</td>
                          <td className="py-2.5 px-3 text-slate-600">{p.brand}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold">{p.qty || 1}</td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {p.isFree ? <span className="text-emerald-700 font-bold">Sin Cargo</span> : `$ ${Number(p.unitPrice).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {p.isFree ? <span className="text-emerald-700 font-bold">$ 0,00</span> : `$ ${(Number(p.unitPrice) * (p.qty || 1)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold text-slate-900">
                        <td colSpan="4" className="py-2.5 px-3">Mano de Obra Especializada</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-950 font-black">
                          $ {Number(currentVisit.laborCost || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Resumen Total */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                  {(() => {
                    const partsTotal = (currentVisit.parts || []).reduce((acc, p) => acc + (p.isFree ? 0 : (p.unitPrice * (p.qty || 1))), 0);
                    const sub = partsTotal + (currentVisit.laborCost || 0);
                    const tax = sub * ((currentVisit.taxRate || 21) / 100);
                    const tot = sub + tax;
                    return (
                      <div className="w-full sm:w-64 space-y-1.5 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex justify-between text-slate-600 font-medium">
                          <span>Subtotal:</span>
                          <span className="font-mono font-bold text-slate-900">$ {sub.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 font-medium">
                          <span>IVA ({currentVisit.taxRate || 21}%):</span>
                          <span className="font-mono font-bold text-slate-900">$ {tax.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-slate-950 pt-1.5 border-t-2 border-slate-900">
                          <span>TOTAL VISITA:</span>
                          <span className="font-mono text-amber-600">$ {tot.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400">
              No hay detalles para esta visita.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
