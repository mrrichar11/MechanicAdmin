import React, { useState } from 'react';
import { Search, Car, Building2, User, Plus, History, ArrowRight, Gauge, Wrench, FileSpreadsheet } from 'lucide-react';

export default function VehiclesView({ vehicles, onSelectVehicle, onOpenNewOrder, onAddNewVehicle, onOpenExcelImport }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'fleet', 'particular'

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    return matchesSearch && v.clientType === filterType;
  });

  return (
    <div className="space-y-6">
      
      {/* Controles de búsqueda y filtros con relieve */}
      <div className="bg-white border-2 border-slate-200/90 p-4 rounded-2xl shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Barra de búsqueda */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por patente (AF 018 OO), modelo (Mercedes GLB) o titular (BHY, Rossi)..."
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white shadow-inner transition"
          />
        </div>

        {/* Filtros por tipo de cliente */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-300 flex items-center text-xs shadow-inner">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-lg transition font-bold ${
                filterType === 'all' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Todos ({vehicles.length})
            </button>
            <button
              onClick={() => setFilterType('fleet')}
              className={`px-3.5 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 ${
                filterType === 'fleet' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Flotas
            </button>
            <button
              onClick={() => setFilterType('particular')}
              className={`px-3.5 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 ${
                filterType === 'particular' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Particulares
            </button>
          </div>

          <button
            onClick={onOpenExcelImport}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition shadow-md hover:shadow-lg hover:-translate-y-0.5 shrink-0"
            title="Importar planillas Excel históricas del taller"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" /> Importar Excels
          </button>

          <button
            onClick={onAddNewVehicle}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition shadow-md hover:shadow-lg hover:-translate-y-0.5 shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400" /> Nuevo Vehículo
          </button>
        </div>

      </div>

      {/* Grid de Vehículos con Tarjetas Tactile / Relieve */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVehicles.map((veh) => {
          const lastVisit = veh.history && veh.history[0];
          return (
            <div
              key={veh.id}
              className="bg-white border-2 border-slate-200 hover:border-slate-400 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Header: Patente Mercosur en relieve y Badge */}
                <div className="flex items-center justify-between gap-3 mb-3.5">
                  <div className="inline-flex items-center border-2 border-slate-800 rounded-lg overflow-hidden shadow-sm bg-white">
                    <span className="bg-[#003399] text-white text-[10px] font-black px-2 py-1 tracking-wider">
                      RA
                    </span>
                    <span className="font-mono text-sm font-black text-slate-950 px-3 py-0.5 tracking-wider">
                      {veh.plate}
                    </span>
                  </div>
                  
                  {veh.clientType === 'fleet' ? (
                    <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                      <Building2 className="w-3 h-3 text-blue-700" /> Flota Empresa
                    </span>
                  ) : (
                    <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                      <User className="w-3 h-3 text-purple-700" /> Particular
                    </span>
                  )}
                </div>

                {/* DUEÑO / TITULAR DESTACADO */}
                <div className="mb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Titular / Dueño:
                  </span>
                  <div className="text-base font-black text-slate-950 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded border border-amber-300">
                      {veh.clientName}
                    </span>
                  </div>
                </div>

                {/* Modelo */}
                <h3 className="text-sm font-bold text-slate-800 leading-snug mt-1">
                  {veh.model}
                </h3>

                {/* KILÓMETROS & VISITAS DESTACADAS CON RELIEVE */}
                <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-slate-600" /> Odómetro
                    </span>
                    <span className="font-mono text-sm font-black text-slate-950 block mt-0.5">
                      {veh.currentKm?.toLocaleString()} km
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-slate-600" /> Historial
                    </span>
                    <span className="text-sm font-black text-slate-950 block mt-0.5">
                      {veh.history?.length || 0} visitas
                    </span>
                  </div>
                </div>

                {/* Última visita */}
                {lastVisit && (
                  <div className="mt-3 bg-slate-100/70 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div className="text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wide">
                      Último Servicio ({lastVisit.date}):
                    </div>
                    <p className="truncate text-slate-800 font-semibold text-[11px]">
                      {lastVisit.tasks?.[0] || 'Mantenimiento preventivo'}
                    </p>
                  </div>
                )}
              </div>

              {/* Botones de acción con efecto botón real */}
              <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between gap-2.5">
                <button
                  onClick={() => onSelectVehicle(veh)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm hover:shadow hover:-translate-y-0.5"
                >
                  <History className="w-3.5 h-3.5 text-slate-600" />
                  Ver Historial
                </button>
                <button
                  onClick={() => onOpenNewOrder(veh)}
                  className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" /> Cargar Visita
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
