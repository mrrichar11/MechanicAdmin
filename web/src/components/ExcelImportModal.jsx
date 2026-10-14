import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Car, 
  Wrench, 
  ArrowRight,
  Sparkles,
  Trash2,
  FileCheck
} from 'lucide-react';
import { parseWorkshopExcelFile } from '../utils/excelImporter';

export default function ExcelImportModal({ isOpen, onClose, onImportVehicles }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [parsedResults, setParsedResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFiles = async (files) => {
    setIsProcessing(true);
    setImportSummary(null);
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const parsed = parseWorkshopExcelFile(buffer, file.name);
        results.push(parsed);
      }
    }

    setParsedResults(prev => [...prev, ...results]);
    setIsProcessing(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleRemoveItem = (index) => {
    setParsedResults(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmImport = () => {
    const validVehicles = parsedResults
      .filter(r => r.success && r.vehicle)
      .map(r => r.vehicle);

    if (validVehicles.length === 0) return;

    onImportVehicles(validVehicles);
    
    setImportSummary({
      count: validVehicles.length,
      visits: validVehicles.reduce((acc, v) => acc + (v.history?.length || 0), 0)
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border-2 border-slate-300 text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">
                  Importador Masivo de Planillas Excel (.xlsx)
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Migración Automática
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Carga todos los Excels históricos que ya tiene el taller para incorporar autos, clientes y hojas de trabajos anteriores.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
          
          {/* Zona de Drop & Selección */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="bg-white border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-2xl p-8 text-center transition-all cursor-pointer shadow-sm group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              multiple 
              accept=".xlsx, .xls" 
              className="hidden" 
              onChange={handleFileInputChange} 
            />
            
            <div className="w-16 h-16 rounded-2xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-amber-400 text-slate-700 mx-auto flex items-center justify-center mb-3 transition shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-sm font-black text-slate-900">
              Arrastra aquí todos los archivos Excel (.xlsx) de los autos
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Puedes seleccionar decenas de archivos juntos. El sistema leerá automáticamente la patente, cliente, kilometrajes y las visitas de cada hoja.
            </p>

            <button 
              type="button"
              className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Seleccionar archivos desde la PC
            </button>
          </div>

          {/* Estado de procesamiento */}
          {isProcessing && (
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl text-center text-xs font-bold text-amber-900 animate-pulse">
              Analizando archivos de Excel y extrayendo historiales técnicos...
            </div>
          )}

          {/* Resumen de éxito */}
          {importSummary && (
            <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-xl text-xs font-bold text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>¡Éxito! Se importaron {importSummary.count} vehículos y un total de {importSummary.visits} visitas históricas a la base de datos del taller.</span>
              </div>
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-black shadow-sm"
              >
                Ver Vehículos Importados
              </button>
            </div>
          )}

          {/* Lista de archivos analizados */}
          {parsedResults.length > 0 && (
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  Archivos Listos para Importar ({parsedResults.filter(r => r.success).length})
                </h4>
                <button
                  onClick={() => setParsedResults([])}
                  className="text-xs text-slate-400 hover:text-rose-600 font-bold"
                >
                  Limpiar lista
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Archivo</th>
                      <th className="py-2.5 px-3">Patente</th>
                      <th className="py-2.5 px-3">Vehículo</th>
                      <th className="py-2.5 px-3">Titular / Cliente</th>
                      <th className="py-2.5 px-3 text-center">Visitas Detectadas</th>
                      <th className="py-2.5 px-3 text-right">Odómetro</th>
                      <th className="py-2.5 px-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedResults.map((res, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {res.fileName}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-black text-slate-950">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {res.vehicle?.plate || 'Detectando'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {res.vehicle?.model || 'Desconocido'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {res.vehicle?.clientName || 'General'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                            {res.sheetCount} visitas
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                          {res.vehicle?.currentKm?.toLocaleString()} km
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-4 border-t-2 border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium">
            Formato soportado: Planillas oficiales Bosch Car Service (.xlsx)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={parsedResults.length === 0 || isProcessing}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md hover:shadow-lg transition"
            >
              <FileCheck className="w-4 h-4 text-amber-400" />
              <span>Importar Todos al Sistema</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
