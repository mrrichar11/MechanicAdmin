import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Save, 
  Sparkles, 
  Printer, 
  CheckCircle2, 
  AlertCircle,
  Image,
  Percent,
  DollarSign,
  Download,
  Upload,
  ShieldCheck,
  FileJson,
  Check
} from 'lucide-react';

export default function SettingsView({ 
  workshopInfo, 
  onSaveWorkshopInfo, 
  userSession, 
  onLogout,
  vehicles = [],
  suppliers = [],
  clientAccounts = [],
  checks = [],
  withdrawals = [],
  cashBalance = {},
  onRestoreBackup,
  currentWorkshop
}) {
  const [name, setName] = useState(workshopInfo.name || '');
  const [owner, setOwner] = useState(workshopInfo.owner || '');
  const [address, setAddress] = useState(workshopInfo.address || '');
  const [phone, setPhone] = useState(workshopInfo.phone || '');
  const [email, setEmail] = useState(workshopInfo.email || '');
  const [cuit, setCuit] = useState(workshopInfo.cuit || '30-70984123-9');
  const [logoUrl, setLogoUrl] = useState(workshopInfo.logoUrl || '');
  const [defaultTaxRate, setDefaultTaxRate] = useState(workshopInfo.taxRate || 21);
  const [defaultLaborCost, setDefaultLaborCost] = useState(workshopInfo.defaultLaborCost || 150000);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveWorkshop = (e) => {
    e.preventDefault();
    const updated = {
      ...workshopInfo,
      name,
      owner,
      address,
      phone,
      email,
      cuit,
      logoUrl,
      taxRate: Number(defaultTaxRate),
      defaultLaborCost: Number(defaultLaborCost)
    };
    onSaveWorkshopInfo(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const backupData = {
      systemVersion: '1.2.0',
      exportTimestamp: new Date().toISOString(),
      workshopId: currentWorkshop?.id || 'local',
      workshop: {
        name,
        owner,
        address,
        phone,
        email,
        cuit,
        logoUrl,
        taxRate: defaultTaxRate,
        defaultLaborCost
      },
      vehicles,
      suppliers,
      clientAccounts,
      checks,
      withdrawals,
      cashBalance
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_${(name || 'taller').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestoreFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.vehicles && Array.isArray(parsed.vehicles)) {
          if (window.confirm(`Se encontraron ${parsed.vehicles.length} vehículos y sus visitas en la copia de seguridad. ¿Deseas restaurarlos en tu taller?`)) {
            if (onRestoreBackup) onRestoreBackup(parsed);
          }
        } else {
          alert('El archivo seleccionado no es una copia de seguridad válida.');
        }
      } catch (err) {
        alert('Error al leer el archivo: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header de Configuración */}
      <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            Configuración del Taller & Perfil Comercial
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personaliza el nombre de tu taller, los datos de contacto, membrete para presupuestos y la base de datos en la nube.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Seguro que deseas limpiar todos los datos de prueba? Esto dejará la base de datos vacía para que Iván cargue sus planillas de Excel desde cero.')) {
                localStorage.removeItem('workshop_vehicles_data');
                localStorage.removeItem('workshop_drafts_data');
                localStorage.removeItem('workshop_suppliers_data');
                localStorage.removeItem('workshop_clients_data');
                localStorage.removeItem('workshop_checks_data');
                localStorage.removeItem('workshop_withdrawals_data');
                localStorage.removeItem('workshop_cash_data');
                window.location.reload();
              }
            }}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition shadow-2xs"
            title="Deja la base de datos limpia en 0 para cargar las planillas"
          >
            🧹 Limpiar Datos de Prueba
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition shadow-2xs"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-900 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>¡Datos del taller actualizados correctamente! Se reflejan en el membrete y en todas las órdenes.</span>
        </div>
      )}

      {/* Formulario de Datos del Taller */}
      <form onSubmit={handleSaveWorkshop} className="bg-white border-2 border-slate-200 p-6 rounded-2xl shadow-md space-y-5 text-xs">
        
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-200">
          <Building2 className="w-4 h-4 text-slate-700" />
          1. Identidad y Datos del Taller (Aparecen en el comprobante impreso)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Nombre Comercial del Taller *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Taller Mecánico San Martín"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Dueño / Titular Responsable *</label>
            <input
              type="text"
              required
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Ej. Juan Pérez"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Dirección y Localidad</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej. Av. Rivadavia 1234, Ciudad"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Teléfonos de Contacto</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 011-45678900 / 11-55554444"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Email del Taller</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej. info@mitaller.com"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Logo personalizado del taller */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
            <span>Logo del Taller (URL de imagen o carga directa)</span>
            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl('')}
                className="text-rose-600 hover:text-rose-800 text-[10px] font-bold"
              >
                Eliminar logo
              </button>
            )}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://... o pega el enlace directo de tu logo"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none font-mono text-xs"
            />
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt="Vista previa logo" 
                className="h-9 w-auto max-w-[80px] object-contain rounded border border-slate-300 p-0.5 bg-white shadow-2xs"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Este logo se mostrará en el encabezado de la web y en la esquina superior de los presupuestos y comprobantes impresos en PDF.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-slate-700 font-bold mb-1">CUIT del Taller</label>
            <input
              type="text"
              value={cuit}
              onChange={(e) => setCuit(e.target.value)}
              placeholder="Ej. 20-22445588-4"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Alícuota IVA Predeterminada</label>
            <select
              value={defaultTaxRate}
              onChange={(e) => setDefaultTaxRate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:bg-white focus:outline-none"
            >
              <option value={21}>21% (Responsable Inscripto)</option>
              <option value={10.5}>10.5% (Tasa reducida)</option>
              <option value={0}>0% (Sin IVA / Monotributo)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Mano de Obra Base Sugerida ($)</label>
            <input
              type="number"
              value={defaultLaborCost}
              onChange={(e) => setDefaultLaborCost(e.target.value)}
              placeholder="150000"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black flex items-center gap-2 shadow-md hover:shadow-lg transition"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Guardar Configuración del Taller</span>
          </button>
        </div>
      </form>

      {/* 2. Copias de Seguridad (Backups) & Resguardo de Datos */}
      <div className="bg-white border-2 border-slate-200 p-6 rounded-2xl shadow-md space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            2. Copias de Seguridad (Backups) & Resguardo de Datos
          </h3>
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full self-start sm:self-auto flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600" />
            Nube Activa & Sincronizada
          </span>
        </div>

        <p className="text-slate-600 leading-relaxed">
          Todos los vehículos, clientes, órdenes de trabajo y cuentas se resguardan automáticamente en la nube de forma segura y privada para tu taller. Adicionalmente, puedes descargar una copia física completa a tu dispositivo o restaurar información en cualquier momento.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition text-xs"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Descargar Copia de Seguridad (.json)</span>
          </button>

          <label className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border-2 border-slate-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition text-xs">
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Restaurar Copia desde Archivo</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleRestoreFile} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

    </div>
  );
}
