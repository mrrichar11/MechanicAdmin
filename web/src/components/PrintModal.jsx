import React, { useEffect } from 'react';
import { Printer, X, Wrench, ArrowLeft } from 'lucide-react';
import { WORKSHOP_INFO } from '../data/initialData';

export default function PrintModal({ isOpen, onClose, vehicle, visit, workshopInfo = WORKSHOP_INFO }) {
  const info = workshopInfo || WORKSHOP_INFO;
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !vehicle || !visit) return null;

  const calculateSubtotal = () => {
    const partsTotal = (visit.parts || []).reduce((acc, p) => acc + (p.isFree ? 0 : (p.unitPrice * (p.qty || 1))), 0);
    return partsTotal + (visit.laborCost || 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * ((visit.taxRate || 21) / 100);
  const total = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-300 relative flex flex-col max-h-[95vh]">
        
        {/* Barra superior de acciones FIJA (siempre visible) */}
        <div className="sticky top-0 z-50 bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shadow-md print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <div>
              <span className="font-bold text-sm block">Comprobante Oficial / Orden de Servicio</span>
              <span className="text-[11px] text-slate-400">{vehicle.plate} • {vehicle.model}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-2 transition shadow"
            >
              <Printer className="w-4 h-4" /> Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-800 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 hover:border-rose-500"
              title="Cerrar vista previa"
            >
              <X className="w-4 h-4" />
              <span>Cerrar (Esc)</span>
            </button>
          </div>
        </div>

        {/* Hoja de Presupuesto / Servicio Membretada */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 text-slate-900 font-sans print:p-0">
          
          {/* Header membretado del Taller */}
          <div className="border-b-2 border-slate-800 pb-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  {info.logoUrl ? (
                    <img 
                      src={info.logoUrl} 
                      alt="Logo del Taller" 
                      className="h-14 w-auto max-w-[160px] object-contain rounded"
                    />
                  ) : (
                    <div className="bg-slate-900 text-amber-400 p-2.5 rounded-xl flex items-center justify-center shadow-sm">
                      <Wrench className="w-7 h-7 text-amber-400" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">
                      {info.name || "Mi Taller Mecánico"}
                    </h1>
                    {info.owner && (
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                        de {info.owner}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-600 leading-tight">
                {info.address && <p className="font-semibold text-slate-900">{info.address}</p>}
                {info.phone && <p>Tel: {info.phone}</p>}
                {info.email && <p>Email: {info.email}</p>}
                {info.cuit && <p>CUIT: {info.cuit}</p>}
              </div>
            </div>
          </div>

          {/* Datos del Cliente y Vehículo */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs">
            <div>
              <p><span className="font-bold text-slate-500">CLIENTE / EMPRESA:</span> <span className="font-bold text-slate-900 text-sm">{vehicle.clientName}</span></p>
              <p><span className="font-bold text-slate-500">CUIT / DNI:</span> {vehicle.cuitDni || 'Consumidor Final'}</p>
              <p><span className="font-bold text-slate-500">DIRECCIÓN:</span> {vehicle.address}</p>
              <p><span className="font-bold text-slate-500">TELÉFONO:</span> {vehicle.phone}</p>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <p><span className="font-bold text-slate-500">VEHÍCULO / UNIDAD:</span> <span className="font-bold text-slate-900">{vehicle.model}</span></p>
              <p><span className="font-bold text-slate-500">DOMINIO (PATENTE):</span> <span className="font-bold font-mono text-slate-950 px-2 py-0.5 bg-slate-200 rounded">{vehicle.plate}</span></p>
              <p><span className="font-bold text-slate-500">KILÓMETROS:</span> <span className="font-bold">{visit.km?.toLocaleString()} km</span></p>
              <p><span className="font-bold text-slate-500">FECHA:</span> {visit.date}</p>
              {vehicle.vin && <p><span className="font-bold text-slate-500">CHASIS (VIN):</span> {vehicle.vin}</p>}
              {vehicle.engine && <p><span className="font-bold text-slate-500">MOTOR:</span> {vehicle.engine}</p>}
            </div>
          </div>

          {/* Trabajos Realizados */}
          <div className="mb-6">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 bg-slate-200 px-3 py-1.5 rounded-md mb-3 flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5 text-slate-700" />
              Trabajos Realizados
            </h3>
            <ul className="text-xs space-y-1.5 pl-2">
              {visit.tasks && visit.tasks.map((task, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-800">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Repuestos e Insumos */}
          <div className="mb-6">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 bg-slate-200 px-3 py-1.5 rounded-md mb-3">
              Repuestos e Insumos
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Descripción</th>
                    <th className="py-2 px-3">Marca / Calidad</th>
                    <th className="py-2 px-3 text-center">Cant.</th>
                    <th className="py-2 px-3 text-right">Importe Unitario</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visit.parts && visit.parts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium text-slate-900">{p.description}</td>
                      <td className="py-2 px-3 text-slate-600">{p.brand || 'Estándar'}</td>
                      <td className="py-2 px-3 text-center">{p.qty || 1}</td>
                      <td className="py-2 px-3 text-right">
                        {p.isFree ? (
                          <span className="text-emerald-600 font-semibold">Sin Cargo</span>
                        ) : (
                          `$ ${Number(p.unitPrice).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-medium">
                        {p.isFree ? (
                          <span className="text-emerald-600 font-semibold">$ 0,00</span>
                        ) : (
                          `$ ${(Number(p.unitPrice) * (p.qty || 1)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/70 font-medium">
                    <td colSpan="4" className="py-2.5 px-3 text-slate-800">Mano de Obra Especializada</td>
                    <td className="py-2.5 px-3 text-right text-slate-900">
                      $ {Number(visit.laborCost || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-semibold text-slate-900">$ {subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">IVA ({visit.taxRate || 21}%):</span>
                <span className="font-semibold text-slate-900">$ {tax.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-black">
                <span className="text-slate-950">TOTAL:</span>
                <span className="text-slate-950">$ {total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Pie de firma */}
          <div className="border-t border-slate-200 pt-8 mt-12 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p>Garantía de servicio técnico y mano de obra garantizada por {info.name || 'el Taller'}.</p>
              <p>Comprobante generado por el sistema de gestión del taller.</p>
            </div>
            <div className="text-center w-48 border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-800">Firma / Aprobación</p>
            </div>
          </div>

        </div>

        {/* Footer barra fija adicional */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex justify-between items-center print:hidden">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al Sistema
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            Cerrar Vista Previa
          </button>
        </div>

      </div>
    </div>
  );
}
