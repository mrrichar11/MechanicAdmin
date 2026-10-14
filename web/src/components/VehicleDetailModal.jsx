import React, { useState } from 'react';
import { X, Calendar, Wrench, Package, Printer, Plus, History, Building2, User, Edit3 } from 'lucide-react';

export default function VehicleDetailModal({ isOpen, onClose, vehicle, onOpenNewOrder, onPrintVisit, onEditVisit }) {
  if (!isOpen || !vehicle) return null;

  const [activeTab, setActiveTab] = useState(0);
  const visits = vehicle.history || [];
  const currentVisit = visits[activeTab] || null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border-2 border-slate-300 text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header Modal con datos del vehículo con ALTO CONTRASTE */}
        <div className="bg-slate-100 px-6 py-4 border-b border-slate-300 flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Placa Mercosur con relieve */}
            <div className="inline-flex items-center border-2 border-slate-800 rounded-lg overflow-hidden shadow-md bg-white">
              <span className="bg-[#003399] text-white text-[11px] font-black px-2 py-1.5 tracking-wider">
                RA
              </span>
              <span className="font-mono text-lg font-black text-slate-950 px-3.5 py-1 tracking-widest">
                {vehicle.plate}
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-950">
                  {vehicle.model}
                </h2>
                {vehicle.clientType === 'fleet' ? (
                  <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <Building2 className="w-3.5 h-3.5 text-blue-700" /> Flota Empresa
                  </span>
                ) : (
                  <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <User className="w-3.5 h-3.5 text-purple-700" /> Particular
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 mt-1">
                DUEÑO / TITULAR: <strong className="text-slate-950 text-sm font-black bg-amber-100 px-2 py-0.5 rounded border border-amber-300">{vehicle.clientName}</strong>
                <span className="mx-2 text-slate-400">•</span>
                Teléfono: <span className="font-bold text-slate-900">{vehicle.phone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenNewOrder(vehicle)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 text-amber-400" /> Nueva Visita
            </button>
            <button 
              onClick={onClose} 
              className="p-2 rounded-xl bg-slate-200 hover:bg-rose-600 hover:text-white text-slate-700 transition"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ficha técnica compacta con relieve */}
        <div className="bg-white px-6 py-3.5 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs shadow-2xs">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="block text-[10px] uppercase font-bold text-slate-500">Chasis (VIN)</span>
            <span className="font-mono font-bold text-slate-900">{vehicle.vin || 'No registrado'}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="block text-[10px] uppercase font-bold text-slate-500">Motor</span>
            <span className="font-mono font-bold text-slate-900">{vehicle.engine || 'No registrado'}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="block text-[10px] uppercase font-bold text-slate-500">Inyección</span>
            <span className="font-bold text-slate-900">{vehicle.injectionSystem || 'Bosch'}</span>
          </div>
          <div className="bg-amber-50 p-2 rounded-lg border border-amber-300">
            <span className="block text-[10px] uppercase font-bold text-amber-800">Kilometraje Odómetro</span>
            <span className="font-mono text-sm font-black text-amber-950">{vehicle.currentKm?.toLocaleString()} km</span>
          </div>
        </div>

        {/* Pestañas de Historial de Visitas (Equivalente a Hoja 1, Hoja 2... del Excel) */}
        <div className="bg-slate-200/80 px-6 pt-3 border-b border-slate-300 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-black uppercase text-slate-700 flex items-center gap-1 mr-2 shrink-0">
            <History className="w-4 h-4 text-slate-700" /> Visitas Registradas:
          </span>
          {visits.map((v, idx) => (
            <button
              key={v.id || idx}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition shrink-0 flex items-center gap-2 border-t-2 border-x ${
                activeTab === idx
                  ? 'bg-white text-slate-950 border-slate-300 border-t-amber-500 shadow-md font-black -mb-px'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-950 border-transparent hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{v.date} — {v.km?.toLocaleString()} km</span>
            </button>
          ))}
          {visits.length === 0 && (
            <span className="text-xs text-slate-500 py-2">Sin visitas registradas</span>
          )}
        </div>

        {/* Contenido de la visita seleccionada */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
          {currentVisit ? (
            <>
              {/* Barra superior de la visita seleccionada CON BOTONES DE ACCIÓN */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-300 shadow-sm text-xs">
                <div>
                  <span className="text-slate-500 font-bold">Orden: </span>
                  <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{currentVisit.invoiceNumber || 'OT-2025'}</span>
                  <span className="mx-2 text-slate-300">•</span>
                  <span className="text-slate-500 font-bold">Fecha: </span>
                  <span className="font-black text-slate-900">{currentVisit.date}</span>
                  <span className="mx-2 text-slate-300">•</span>
                  <span className="text-slate-500 font-bold">Kilometraje: </span>
                  <span className="font-mono font-black text-slate-950 text-sm">{currentVisit.km?.toLocaleString()} km</span>
                </div>
                
                {/* BOTONES: EDITAR PRECIOS + IMPRIMIR */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onEditVisit(vehicle, currentVisit)}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-600 rounded-lg font-bold flex items-center gap-1.5 transition shadow-sm hover:shadow hover:-translate-y-0.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Orden / Precios</span>
                  </button>
                  <button
                    onClick={() => onPrintVisit(vehicle, currentVisit)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition shadow-sm hover:shadow hover:-translate-y-0.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Imprimir Comprobante (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Trabajos realizados en esta visita */}
              <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-slate-700" />
                  Trabajos y Procedimientos Realizados ({currentVisit.tasks?.length || 0})
                </h4>
                <ul className="text-xs space-y-1.5 text-slate-800 font-medium">
                  {currentVisit.tasks?.map((task, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-amber-500 font-black">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Repuestos e Insumos */}
              <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-700" />
                  Repuestos, Insumos y Mano de Obra
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-xs text-left">
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
                      <div className="w-64 space-y-1.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs">
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
