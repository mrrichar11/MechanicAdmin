import React, { useState } from 'react';
import { X, Save, Car } from 'lucide-react';

export default function NewVehicleModal({ isOpen, onClose, onSave }) {
  if (!isOpen) return null;

  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [clientType, setClientType] = useState('fleet');
  const [clientName, setClientName] = useState('BHY S.A.');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currentKm, setCurrentKm] = useState('');
  const [vin, setVin] = useState('');
  const [engine, setEngine] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!plate.trim() || !model.trim()) return;

    const newVeh = {
      id: `veh-${Date.now()}`,
      plate: plate.toUpperCase().trim(),
      model: model.trim(),
      clientType,
      clientName: clientName.trim(),
      phone: phone.trim() || 'Sin teléfono',
      address: address.trim() || 'Sunchales',
      vin: vin.trim(),
      engine: engine.trim(),
      currentKm: parseInt(currentKm) || 0,
      history: []
    };

    onSave(newVeh);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 text-slate-800 w-full max-w-lg rounded-xl shadow-xl overflow-hidden my-4">
        
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-slate-700" />
            <h2 className="text-sm font-semibold text-slate-900">Registrar Nuevo Vehículo</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs bg-white">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Patente / Dominio *</label>
              <input
                type="text"
                required
                placeholder="Ej. AG 123 ZZ"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-800 font-mono uppercase focus:outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Kilometraje Inicial</label>
              <input
                type="number"
                placeholder="Ej. 85000"
                value={currentKm}
                onChange={(e) => setCurrentKm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Marca y Modelo del Vehículo *</label>
            <input
              type="text"
              required
              placeholder="Ej. TOYOTA COROLLA 2.0 SEG"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Tipo de Cliente</label>
              <select
                value={clientType}
                onChange={(e) => setClientType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none"
              >
                <option value="fleet">Flota Empresa (ej. BHY)</option>
                <option value="particular">Particular</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Nombre Cliente / Empresa *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Teléfono</label>
              <input
                type="text"
                placeholder="Ej. 03493-15403364"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Dirección / Localidad</label>
              <input
                type="text"
                placeholder="Ej. Sunchales"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Chasis (VIN)</label>
              <input
                type="text"
                placeholder="Opcional"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Número de Motor</label>
              <input
                type="text"
                placeholder="Opcional"
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-500 hover:text-slate-800 rounded-md transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-md flex items-center gap-1.5 transition shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" /> Guardar Vehículo
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
