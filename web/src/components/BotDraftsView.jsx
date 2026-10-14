import React from 'react';
import { Mic, FileText, ArrowRight, CheckCircle2, Clock, Sparkles, Wrench, Package, Info, Trash2 } from 'lucide-react';

export default function BotDraftsView({ drafts, onOpenEditorWithDraft, onOpenWhatsAppSimulator, onDiscardDraft }) {
  return (
    <div className="space-y-5">
      
      {/* Banner informativo minimalista */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Bandeja de Mensajes y Audios de WhatsApp
              </h2>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-medium px-2 py-0.5 rounded-full border border-emerald-200">
                Procesador activo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
              Los mensajes y notas de voz que te envíes al bot se transcriben aquí. El sistema identifica la patente, los trabajos y los repuestos para que los agregues a la ficha técnica con un solo clic.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenWhatsAppSimulator}
          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-2 transition shadow-xs shrink-0"
        >
          <Mic className="w-3.5 h-3.5" /> Probar Simulador
        </button>
      </div>

      {/* Lista de Borradores */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Borradores Pendientes ({drafts.filter(d => d.status === 'pending').length})
          </h3>
          <span className="text-xs text-slate-400">
            Actualización en tiempo real
          </span>
        </div>

        {drafts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700">No hay mensajes pendientes</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Todos los audios ya fueron incorporados a las órdenes de trabajo.
            </p>
          </div>
        ) : (
          drafts.map((draft) => (
            <div
              key={draft.id}
              className={`bg-white border rounded-xl p-4 transition shadow-xs ${
                draft.status === 'applied' 
                  ? 'border-slate-200 opacity-60 bg-slate-50/50' 
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-3 border-b border-slate-100 pb-3 mb-3">
                
                {/* Info del emisor y origen */}
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    draft.sourceType === 'audio' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {draft.sourceType === 'audio' ? <Mic className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900">{draft.sender}</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {draft.timestamp}
                      </span>
                      {draft.status === 'applied' && (
                        <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                          ✓ Volcado al historial
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {draft.detectedPlate}
                      </span>
                      <span className="text-xs text-slate-600">
                        {draft.vehicleModel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm('¿Deseas descartar y eliminar este borrador de WhatsApp?')) {
                        onDiscardDraft && onDiscardDraft(draft.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-200"
                    title="Descartar / Eliminar este mensaje"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenEditorWithDraft(draft)}
                    disabled={draft.status === 'applied'}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition shadow-xs"
                  >
                    <span>Volcar a Orden de Trabajo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Mensaje original o transcripción */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 mb-3 text-xs">
                <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <span>Mensaje original recibido:</span>
                </div>
                <p className="text-slate-700 leading-relaxed italic">
                  "{draft.rawContent}"
                </p>
              </div>

              {/* Lo que la IA detectó y estructuró */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                
                {/* Tareas estructuradas */}
                <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-200/60">
                  <div className="font-semibold text-slate-800 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Wrench className="w-3.5 h-3.5 text-slate-500" />
                      Trabajos Extraídos ({draft.parsedData.tasks?.length || 0})
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Odómetro: <strong className="text-slate-800 font-mono">{draft.parsedData.km?.toLocaleString()} km</strong>
                    </span>
                  </div>
                  <ul className="space-y-1 text-slate-600">
                    {draft.parsedData.tasks?.map((t, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-slate-400">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Repuestos estructurados */}
                <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-200/60">
                  <div className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-500" />
                    Repuestos / Insumos ({draft.parsedData.parts?.length || 0})
                  </div>
                  <ul className="space-y-1 text-slate-600">
                    {draft.parsedData.parts?.length > 0 ? (
                      draft.parsedData.parts.map((p, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <span>• {p.description} <span className="text-slate-400 text-[11px]">({p.brand})</span></span>
                          <span className="font-mono text-slate-800 font-medium">
                            $ {p.unitPrice?.toLocaleString('es-AR')}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">No se indicaron repuestos con precio.</li>
                    )}
                  </ul>
                </div>

              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
