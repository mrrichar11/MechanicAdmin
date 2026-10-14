import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Sparkles, Wrench, Package, Edit3 } from 'lucide-react';

export default function WorkOrderEditor({ isOpen, onClose, vehicle, onSaveOrder, initialDraft = null, editingVisit = null }) {
  if (!isOpen || !vehicle) return null;

  const isEditing = !!editingVisit;

  const [date, setDate] = useState(editingVisit?.date || new Date().toISOString().split('T')[0]);
  const [km, setKm] = useState(editingVisit?.km || initialDraft?.parsedData?.km || vehicle.currentKm || 0);
  const [laborCost, setLaborCost] = useState(editingVisit ? editingVisit.laborCost : 150000);
  const [taxRate, setTaxRate] = useState(editingVisit ? (editingVisit.taxRate ?? 21) : 21);
  const [tasks, setTasks] = useState(
    editingVisit?.tasks || initialDraft?.parsedData?.tasks || [
      "Revisión y diagnóstico general con scanner Bosch KTS.",
      "Control de fluidos y frenos."
    ]
  );
  const [newTaskInput, setNewTaskInput] = useState('');

  const [parts, setParts] = useState(
    editingVisit?.parts || initialDraft?.parsedData?.parts || [
      { description: "Aceite sintético", brand: "Motul", unitPrice: 85000, qty: 1, isFree: false }
    ]
  );

  const [newPart, setNewPart] = useState({
    description: '',
    brand: 'Original',
    unitPrice: '',
    qty: 1,
    isFree: false
  });

  const handleAddTask = () => {
    if (!newTaskInput.trim()) return;
    setTasks([...tasks, newTaskInput.trim()]);
    setNewTaskInput('');
  };

  const handleRemoveTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleTaskChange = (index, value) => {
    const updated = [...tasks];
    updated[index] = value;
    setTasks(updated);
  };

  const handleAddPart = () => {
    if (!newPart.description.trim()) return;
    setParts([
      ...parts,
      {
        description: newPart.description.trim(),
        brand: newPart.brand.trim() || 'Estándar',
        unitPrice: newPart.isFree ? 0 : parseFloat(newPart.unitPrice) || 0,
        qty: parseInt(newPart.qty) || 1,
        isFree: newPart.isFree
      }
    ]);
    setNewPart({ description: '', brand: 'Original', unitPrice: '', qty: 1, isFree: false });
  };

  const handleRemovePart = (index) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handlePartFieldChange = (index, field, value) => {
    const updated = [...parts];
    if (field === 'unitPrice') {
      updated[index].unitPrice = parseFloat(value) || 0;
    } else if (field === 'qty') {
      updated[index].qty = parseInt(value) || 1;
    } else if (field === 'description' || field === 'brand') {
      updated[index][field] = value;
    } else if (field === 'isFree') {
      updated[index].isFree = value;
      if (value) updated[index].unitPrice = 0;
    }
    setParts(updated);
  };

  const subtotalParts = parts.reduce((acc, p) => acc + (p.isFree ? 0 : (p.unitPrice * (p.qty || 1))), 0);
  const subtotal = subtotalParts + (parseFloat(laborCost) || 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const handleSave = () => {
    const orderData = {
      id: editingVisit?.id || `vis-${Date.now()}`,
      date: date,
      km: parseInt(km) || vehicle.currentKm,
      status: "Completado",
      invoiceNumber: editingVisit?.invoiceNumber || `OT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tasks: tasks,
      parts: parts,
      laborCost: parseFloat(laborCost) || 0,
      taxRate: taxRate,
    };
    onSaveOrder(vehicle.id, orderData, initialDraft?.id, isEditing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-2 border-slate-300 text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-100 px-6 py-4 border-b border-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              {isEditing ? <Edit3 className="w-5 h-5 text-amber-400" /> : <Wrench className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">
                  {isEditing ? 'Editar Orden de Trabajo y Precios' : 'Nueva Orden de Trabajo / Visita Técnica'}
                </h2>
                {initialDraft && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-emerald-700" /> Prellenado desde WhatsApp
                  </span>
                )}
                {isEditing && (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    Modo Edición / Corrección
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Vehículo: <strong className="text-slate-900 font-mono">{vehicle.plate}</strong> • {vehicle.model} • Titular: <strong className="text-slate-900">{vehicle.clientName}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
          
          {/* Fila superior: Fecha, Kilometraje, Mano de Obra */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-300 shadow-sm text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Fecha de Intervención</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-800 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Kilometraje del Vehículo</label>
              <input
                type="number"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-slate-800 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Costo Mano de Obra ($)</label>
              <input
                type="number"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-slate-800 shadow-2xs"
              />
            </div>
          </div>

          {/* Sección Trabajos Realizados */}
          <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-slate-700" />
              1. Trabajos Realizados (Edita o agrega tareas)
            </h3>
            
            <div className="space-y-2 mb-3">
              {tasks.map((task, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{idx + 1}</span>
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => handleTaskChange(idx, e.target.value)}
                    className="flex-1 bg-transparent text-xs text-slate-900 font-medium focus:outline-none focus:bg-white px-1.5 py-0.5 rounded border border-transparent focus:border-slate-300"
                  />
                  <button 
                    onClick={() => handleRemoveTask(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition shrink-0"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe una nueva tarea y presiona Enter..."
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-700 shadow-2xs"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Tarea
              </button>
            </div>
          </div>

          {/* Sección Repuestos e Insumos (EDITABLE EN VIVO) */}
          <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-slate-700" />
                2. Repuestos, Insumos y Precios (Haz clic en cualquier celda para corregir)
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                Podes cambiar precios o cantidades directamente
              </span>
            </div>

            <div className="overflow-x-auto mb-3 border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Descripción Repuesto</th>
                    <th className="py-2.5 px-3">Marca / Tipo</th>
                    <th className="py-2.5 px-3 text-center w-20">Cant</th>
                    <th className="py-2.5 px-3 text-right w-32">Precio Unit. ($)</th>
                    <th className="py-2.5 px-3 text-right w-32">Subtotal ($)</th>
                    <th className="py-2.5 px-3 text-center w-16">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={p.description}
                          onChange={(e) => handlePartFieldChange(idx, 'description', e.target.value)}
                          className="w-full bg-transparent font-semibold text-slate-900 focus:bg-white focus:outline-none px-1.5 py-0.5 rounded border border-transparent focus:border-slate-300"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={p.brand}
                          onChange={(e) => handlePartFieldChange(idx, 'brand', e.target.value)}
                          className="w-full bg-transparent text-slate-600 focus:bg-white focus:outline-none px-1.5 py-0.5 rounded border border-transparent focus:border-slate-300"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          value={p.qty}
                          onChange={(e) => handlePartFieldChange(idx, 'qty', e.target.value)}
                          className="w-16 text-center font-mono font-bold bg-slate-50 border border-slate-300 rounded px-1.5 py-1 focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        {p.isFree ? (
                          <span className="text-emerald-700 font-bold text-xs">Sin Cargo</span>
                        ) : (
                          <input
                            type="number"
                            value={p.unitPrice}
                            onChange={(e) => handlePartFieldChange(idx, 'unitPrice', e.target.value)}
                            className="w-28 text-right font-mono font-bold bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 focus:bg-white focus:outline-none"
                          />
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                        {p.isFree ? (
                          <span className="text-emerald-700 font-bold">$ 0,00</span>
                        ) : (
                          `$ ${(Number(p.unitPrice) * (p.qty || 1)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button 
                          onClick={() => handleRemovePart(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition"
                          title="Eliminar repuesto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Formulario para agregar repuesto */}
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-6 gap-2 text-xs">
              <input
                type="text"
                placeholder="Nombre repuesto..."
                value={newPart.description}
                onChange={(e) => setNewPart({ ...newPart, description: e.target.value })}
                className="sm:col-span-2 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-800 shadow-2xs font-medium"
              />
              <input
                type="text"
                placeholder="Marca (Original, Bosch, Motul...)"
                value={newPart.brand}
                onChange={(e) => setNewPart({ ...newPart, brand: e.target.value })}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-800 shadow-2xs"
              />
              <input
                type="number"
                placeholder="Cant"
                value={newPart.qty}
                onChange={(e) => setNewPart({ ...newPart, qty: e.target.value })}
                className="bg-white border border-slate-300 rounded-lg px-2 py-2 text-slate-900 focus:outline-none focus:border-slate-800 text-center font-mono font-bold shadow-2xs"
              />
              <input
                type="number"
                placeholder="Precio ($)"
                disabled={newPart.isFree}
                value={newPart.unitPrice}
                onChange={(e) => setNewPart({ ...newPart, unitPrice: e.target.value })}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus:outline-none focus:border-slate-800 disabled:opacity-40 font-mono font-bold shadow-2xs"
              />
              <button
                type="button"
                onClick={handleAddPart}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-3 py-2 font-bold flex items-center justify-center gap-1 transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>
            
            <label className="inline-flex items-center gap-2 mt-2 text-xs text-slate-600 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={newPart.isFree}
                onChange={(e) => setNewPart({ ...newPart, isFree: e.target.checked })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Marcar repuesto o escaneo como "Sin Cargo" (Cortesía o Garantía)</span>
            </label>
          </div>

          {/* Resumen de Totales e Impuestos */}
          <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
              <span>Alícuota IVA:</span>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-bold focus:outline-none shadow-2xs"
              >
                <option value={21}>21% (Responsable Inscripto / Flotas)</option>
                <option value={10.5}>10.5% (Tasa reducida)</option>
                <option value={0}>0% (Sin IVA / Final)</option>
              </select>
            </div>

            <div className="text-right text-xs space-y-1">
              <div className="text-slate-600 font-medium">
                Subtotal (Repuestos + Mano de Obra): <span className="font-mono font-bold text-slate-900">$ {subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-slate-600 font-medium">
                IVA ({taxRate}%): <span className="font-mono font-bold text-slate-900">$ {tax.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-sm font-black text-slate-950 pt-1.5 border-t-2 border-slate-900">
                TOTAL ORDEN: <span className="font-mono text-base text-amber-600">$ {total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="bg-white px-6 py-4 border-t border-slate-300 flex justify-end items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{isEditing ? 'Guardar Correcciones en la Ficha' : 'Guardar Visita en Historial'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
