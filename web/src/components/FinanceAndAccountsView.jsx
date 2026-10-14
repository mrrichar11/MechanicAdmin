import React, { useState } from 'react';
import { 
  DollarSign, 
  Building2, 
  Users, 
  FileCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Wallet, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  UserCheck,
  Building,
  HelpCircle,
  FileText,
  Search,
  ShieldCheck,
  AlertTriangle,
  Eye,
  Edit3,
  Phone,
  Car,
  MessageCircle,
  Menu,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export default function FinanceAndAccountsView({ 
  suppliers, 
  clientAccounts, 
  checks, 
  withdrawals, 
  cashBalance,
  onOpenSupplierPayment,
  onOpenClientPayment,
  onOpenNewCheck,
  onOpenNewWithdrawal,
  onOpenNewSupplier,
  onOpenNewClient,
  onOpenEditClient,
  onOpenClientDetail
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'suppliers' | 'clients' | 'checks' | 'withdrawals'
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all'); // 'all' | 'debt' | 'paid' | 'fleet' | 'particular'

  const menuSections = [
    {
      id: 'overview',
      title: 'Resumen General & Caja',
      desc: 'Disponibilidad de fondos, efectivo y cuentas bancarias',
      icon: <Wallet className="w-5 h-5 text-amber-500 shrink-0" />
    },
    {
      id: 'suppliers',
      title: `Proveedores & Cuentas (${suppliers.length})`,
      desc: 'Deudas por repuestos, lubricantes y tornerías',
      icon: <Building2 className="w-5 h-5 text-rose-500 shrink-0" />,
      badge: suppliers.length > 0 ? `${suppliers.length}` : null
    },
    {
      id: 'clients',
      title: `Cuentas de Clientes / Cobranzas (${clientAccounts.length})`,
      desc: 'Cuentas corrientes, facturación fiscal y plazos comerciales',
      icon: <Users className="w-5 h-5 text-emerald-500 shrink-0" />,
      badge: clientAccounts.filter(c => (c.balanceDue || 0) > 0).length > 0 
        ? `${clientAccounts.filter(c => (c.balanceDue || 0) > 0).length} con deuda` 
        : null
    },
    {
      id: 'checks',
      title: `Cartera de Cheques (${checks.length})`,
      desc: 'Cheques recibidos de clientes, propios y endosados',
      icon: <FileCheck className="w-5 h-5 text-blue-500 shrink-0" />,
      badge: checks.filter(c => c.type === 'in_portfolio').length > 0 
        ? `${checks.filter(c => c.type === 'in_portfolio').length} en cartera` 
        : null
    },
    {
      id: 'withdrawals',
      title: `Retiros del Dueño (${withdrawals.length})`,
      desc: 'Registro de extracciones y retiros personales del titular',
      icon: <UserCheck className="w-5 h-5 text-amber-500 shrink-0" />,
      badge: withdrawals.length > 0 ? `${withdrawals.length}` : null
    }
  ];

  const currentSection = menuSections.find(s => s.id === activeTab) || menuSections[0];

  // Cálculos totales
  const totalClientDebt = clientAccounts.reduce((acc, c) => acc + (c.balanceDue || 0), 0);
  const totalSupplierDebt = suppliers.reduce((acc, s) => acc + (s.balanceDue || 0), 0);
  const totalChecksInPortfolio = checks
    .filter(c => c.type === 'in_portfolio')
    .reduce((acc, c) => acc + (c.amount || 0), 0);
  const totalChecksIssued = checks
    .filter(c => c.type === 'issued')
    .reduce((acc, c) => acc + (c.amount || 0), 0);
  const totalOwnerWithdrawals = withdrawals.reduce((acc, w) => acc + (w.amount || 0), 0);

  return (
    <div className="space-y-6">

      {/* Tarjetas Principales de Balance y Control Financiero con ALTO RELIEVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Cuentas a Cobrar Clientes */}
        <div className="bg-white border-2 border-emerald-300 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>A Cobrar (Clientes & Flotas)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950 font-mono mt-1">
            $ {totalClientDebt.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] font-bold text-emerald-700 mt-1 block">
            {clientAccounts.filter(c => c.balanceDue > 0).length} clientes con saldo pendiente
          </span>
        </div>

        {/* Deudas con Proveedores */}
        <div className="bg-white border-2 border-rose-300 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-rose-800">
            <span>Deudas a Pagar (Proveedores)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-950 font-mono mt-1">
            $ {totalSupplierDebt.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] font-bold text-rose-700 mt-1 block">
            Repuestos, lubricantes y tornerías
          </span>
        </div>

        {/* Cheques en Cartera */}
        <div className="bg-white border-2 border-blue-300 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-blue-800">
            <span>Cheques en Cartera (Cobrar/Endosar)</span>
            <FileCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-950 font-mono mt-1">
            $ {totalChecksInPortfolio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] font-bold text-blue-700 mt-1 block">
            {checks.filter(c => c.type === 'in_portfolio').length} cheques listos para cobro/endoso
          </span>
        </div>

        {/* Retiros del Dueño */}
        <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span>Retiros del Dueño / Titular</span>
            <UserCheck className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-black text-amber-950 font-mono mt-1">
            $ {totalOwnerWithdrawals.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] font-bold text-amber-800 mt-1 block">
            Retiros personales del mes
          </span>
        </div>

      </div>

      {/* Barra de Menú Hamburguesa & Selector de Sección */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl p-2.5 sm:p-3 shadow-md flex items-center justify-between gap-2.5">
        <button
          onClick={() => setIsMenuDrawerOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition active:scale-95 group shrink-0"
        >
          <Menu className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>Menú de Cuentas</span>
        </button>

        {/* Indicador de la sección activa actual con botón desplegable */}
        <button 
          onClick={() => setIsMenuDrawerOpen(true)}
          className="flex-1 flex items-center justify-end gap-2 text-left group"
        >
          <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">Sección activa:</span>
          <div className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-black text-slate-900 flex items-center gap-2 transition shadow-2xs max-w-full">
            {currentSection.icon}
            <span className="truncate max-w-[170px] sm:max-w-none">{currentSection.title}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 group-hover:translate-y-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* Menú Lateral Desplegable (Slide-over Drawer) */}
      {isMenuDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
          onClick={() => setIsMenuDrawerOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-sm h-full shadow-2xl p-5 flex flex-col justify-between border-l-2 border-slate-300 animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              {/* Cabecera del Menú */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
                <div className="flex items-center gap-2">
                  <Menu className="w-5 h-5 text-amber-500" />
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide">
                    Módulos de Cuentas
                  </h3>
                </div>
                <button 
                  onClick={() => setIsMenuDrawerOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                  title="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                Selecciona la vista financiera que deseas consultar:
              </p>

              {/* Lista de Secciones */}
              <div className="space-y-2.5">
                {menuSections.map(sec => {
                  const isActive = activeTab === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setActiveTab(sec.id);
                        setIsMenuDrawerOpen(false);
                      }}
                      className={`w-full p-3.5 rounded-2xl text-left transition flex items-start gap-3 border-2 ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900 shadow-lg font-black'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 font-bold shadow-xs'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-slate-100/10 shrink-0">
                        {sec.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs">{sec.title}</span>
                          {sec.badge && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                              isActive 
                                ? 'bg-amber-400 text-slate-950 font-black' 
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}>
                              {sec.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] mt-0.5 leading-tight ${isActive ? 'text-slate-300 font-normal' : 'text-slate-500 font-normal'}`}>
                          {sec.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pie del Menú Lateral */}
            <div className="pt-4 border-t border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-400">
                Sistema Integral de Gestión de Taller
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          1. PESTAÑA: RESUMEN GENERAL & CAJA
      ======================================================== */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Saldos Disponibles */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Wallet className="w-4 h-4 text-slate-700" /> Disponibilidad en Caja y Bancos
            </h3>
            
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Efectivo en Caja Taller</span>
              <div className="text-xl font-mono font-black text-slate-900 mt-0.5">
                $ {cashBalance.cashOnHand?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Cuenta Banco / Transferencias</span>
              <div className="text-xl font-mono font-black text-slate-900 mt-0.5">
                $ {cashBalance.bankBalance?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600">Total Líquido Disponible:</span>
              <span className="font-mono font-black text-base text-slate-950">
                $ {((cashBalance.cashOnHand || 0) + (cashBalance.bankBalance || 0)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Estado de Deudas y Cheques */}
          <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-700" /> Situación Financiera Neta del Taller
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-800 block">Total a Favor (Activo Corriente):</span>
                <span className="font-mono text-lg font-black text-emerald-950 block mt-1">
                  $ {(totalClientDebt + totalChecksInPortfolio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  Deudas de clientes + cheques en cartera
                </span>
              </div>

              <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200">
                <span className="font-bold text-rose-800 block">Total Compromisos (Pasivo Corriente):</span>
                <span className="font-mono text-lg font-black text-rose-950 block mt-1">
                  $ {(totalSupplierDebt + totalChecksIssued).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">
                  Deudas con repuesteras + cheques propios a debitar
                </span>
              </div>
            </div>

            {/* Accesos rápidos */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap gap-2.5">
              <button
                onClick={onOpenClientPayment}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                + Cobrar a Cliente / Pago Parcial
              </button>
              <button
                onClick={onOpenSupplierPayment}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                + Pagar a Proveedor / Entregar Cheque
              </button>
              <button
                onClick={onOpenNewWithdrawal}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm"
              >
                + Retiro Personal del Dueño
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          2. PESTAÑA: PROVEEDORES & DEUDAS
      ======================================================== */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Proveedores del Taller (Repuestos, Lubricantes, Tornería)
              </h3>
              <p className="text-xs text-slate-500">
                Lleva el control exacto de facturas adeudadas y pagos parciales entregados.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onOpenSupplierPayment}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                + Registrar Pago a Proveedor
              </button>
              <button
                onClick={onOpenNewSupplier}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                + Nuevo Proveedor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliers.map(sup => (
              <div key={sup.id} className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h4 className="font-black text-sm text-slate-900 leading-snug">{sup.name}</h4>
                    {sup.balanceDue > 0 ? (
                      <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        Deuda Activa
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        Al Día
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-500 mb-2">{sup.rubro}</p>
                  
                  <div className="text-[11px] text-slate-600 space-y-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3">
                    <p><span className="font-bold">Contacto:</span> {sup.contact}</p>
                    <p><span className="font-bold">Tel:</span> {sup.phone}</p>
                    <p><span className="font-bold">CUIT:</span> {sup.cuit}</p>
                  </div>

                  <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200 mb-2">
                    <span className="text-[10px] uppercase font-bold text-rose-700 block">Saldo Pendiente a Pagar:</span>
                    <span className="text-lg font-mono font-black text-rose-950">
                      $ {sup.balanceDue?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex gap-2">
                  <button
                    onClick={onOpenSupplierPayment}
                    className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs text-center"
                  >
                    Pagar / Entregar Cheque
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          3. PESTAÑA: CUENTAS DE CLIENTES & COBRANZAS
      ======================================================== */}
      {/* ========================================================
          3. PESTAÑA: CRM, CUENTAS CORRIENTES Y COBRANZAS DE CLIENTES
      ======================================================== */}
      {activeTab === 'clients' && (() => {
        const totalBilledClients = clientAccounts.reduce((acc, c) => acc + (c.totalBilled || 0), 0);
        const totalPaidClients = clientAccounts.reduce((acc, c) => acc + (c.totalPaid || 0), 0);
        const overdueClientsCount = clientAccounts.filter(c => c.isOverdue).length;

        const filteredClients = clientAccounts.filter(cli => {
          const term = clientSearch.toLowerCase().trim();
          const matchesSearch = !term || 
            (cli.name || cli.clientName || '').toLowerCase().includes(term) ||
            (cli.contactPerson || '').toLowerCase().includes(term) ||
            (cli.taxId || cli.cuitDni || '').toLowerCase().includes(term) ||
            (cli.phone || '').includes(term) ||
            (cli.vehicles || []).some(v => (v.plate || (typeof v === 'string' ? v : '')).toLowerCase().includes(term));

          if (!matchesSearch) return false;
          if (clientFilter === 'debt') return (cli.balanceDue || 0) > 0;
          if (clientFilter === 'paid') return (cli.balanceDue || 0) === 0;
          if (clientFilter === 'fleet') return cli.clientType === 'fleet';
          if (clientFilter === 'particular') return cli.clientType !== 'fleet';
          return true;
        });

        return (
          <div className="space-y-5">
            {/* Encabezado y Botones de Acción */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  CRM & Cuentas Corrientes de Clientes
                </h3>
                <p className="text-xs text-slate-500">
                  Control estricto de saldos, facturación fiscal, plazos de pago (15/30/60 días), cheques y cobranzas.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onOpenNewClient && (
                  <button
                    onClick={onOpenNewClient}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Nuevo Cliente</span>
                  </button>
                )}
                <button
                  onClick={onOpenClientPayment}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4 text-emerald-200" />
                  <span>Registrar Cobro</span>
                </button>
              </div>
            </div>

            {/* Tarjetas Métricas Rápidas de Clientes */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Facturado</span>
                <span className="text-base sm:text-lg font-mono font-black text-slate-900">
                  $ {totalBilledClients.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Cobrado</span>
                <span className="text-base sm:text-lg font-mono font-black text-emerald-950">
                  $ {totalPaidClients.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="bg-rose-50/70 border border-rose-200 p-3.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-rose-800 block">Saldo Total a Cobrar</span>
                <span className="text-base sm:text-lg font-mono font-black text-rose-950">
                  $ {totalClientDebt.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className={`p-3.5 rounded-xl border ${overdueClientsCount > 0 ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[10px] uppercase font-bold text-slate-600 block">En Mora / Vencidos</span>
                <span className={`text-base sm:text-lg font-mono font-black ${overdueClientsCount > 0 ? 'text-amber-900' : 'text-slate-700'}`}>
                  {overdueClientsCount} cliente{overdueClientsCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {/* Barra de Búsqueda y Filtros */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, contacto, CUIT, teléfono o patente..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: `Todos (${clientAccounts.length})` },
                  { id: 'debt', label: 'Con Saldo Pendiente' },
                  { id: 'paid', label: 'Al Día' },
                  { id: 'fleet', label: 'Flotas' },
                  { id: 'particular', label: 'Particulares' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setClientFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                      clientFilter === tab.id
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Listado / Tabla de Cuentas de Clientes */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[750px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Cliente / Razón Social</th>
                      <th className="py-3 px-3">Datos Fiscales</th>
                      <th className="py-3 px-3">Vehículos / Flota</th>
                      <th className="py-3 px-3 text-center">Condición de Pago</th>
                      <th className="py-3 px-3 text-right">Facturado</th>
                      <th className="py-3 px-3 text-right">Cobrado</th>
                      <th className="py-3 px-3 text-right">Saldo Deudor</th>
                      <th className="py-3 px-3 text-center">Estado</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                          No se encontraron clientes con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map(cli => {
                        const hasDebt = (cli.balanceDue || 0) > 0;
                        const clientName = cli.name || cli.clientName;
                        const vehiclesList = (cli.vehicles || []).map(v => typeof v === 'string' ? v : v.plate);

                        return (
                          <tr key={cli.id} className="hover:bg-slate-50 transition-colors">
                            {/* Cliente & Contacto */}
                            <td className="py-3 px-4">
                              <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                                {cli.clientType === 'fleet' ? (
                                  <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                ) : (
                                  <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                )}
                                <span>{clientName}</span>
                              </div>
                              {cli.contactPerson && (
                                <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                                  Resp: {cli.contactPerson}
                                </span>
                              )}
                              {cli.phone && (
                                <a
                                  href={`https://wa.me/${cli.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-bold mt-0.5"
                                >
                                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                                  <span>{cli.phone}</span>
                                </a>
                              )}
                            </td>

                            {/* Datos Fiscales */}
                            <td className="py-3 px-3 text-slate-700">
                              <span className="font-mono text-[11px] block text-slate-900 font-bold">
                                {cli.taxId || cli.cuitDni || 'Sin CUIT/DNI'}
                              </span>
                              <span className="inline-block bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5">
                                {cli.taxCategory || 'Consumidor Final'}
                              </span>
                            </td>

                            {/* Flota / Vehículos */}
                            <td className="py-3 px-3">
                              <div className="flex flex-wrap gap-1 max-w-[150px]">
                                {vehiclesList.length > 0 ? (
                                  vehiclesList.slice(0, 3).map((plate, idx) => (
                                    <span key={idx} className="bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded font-mono font-bold text-[10px] text-slate-800">
                                      {plate}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[11px] text-slate-400">Sin autos</span>
                                )}
                                {vehiclesList.length > 3 && (
                                  <span className="text-[10px] text-slate-500 font-bold self-center">
                                    +{vehiclesList.length - 3} más
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Condición de Pago */}
                            <td className="py-3 px-3 text-center">
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-slate-200">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {cli.paymentTermDays > 0 ? `${cli.paymentTermDays} días` : 'Contado'}
                              </span>
                            </td>

                            {/* Total Facturado */}
                            <td className="py-3 px-3 text-right font-mono text-slate-700">
                              $ {cli.totalBilled?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>

                            {/* Total Cobrado */}
                            <td className="py-3 px-3 text-right font-mono text-emerald-700 font-bold">
                              $ {cli.totalPaid?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>

                            {/* Saldo Deudor */}
                            <td className="py-3 px-3 text-right font-mono font-black text-sm">
                              <span className={hasDebt ? 'text-rose-700' : 'text-slate-400'}>
                                $ {cli.balanceDue?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                              </span>
                            </td>

                            {/* Estado / Badge de Mora */}
                            <td className="py-3 px-3 text-center">
                              {!hasDebt ? (
                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                  Al Día
                                </span>
                              ) : cli.isOverdue ? (
                                <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap inline-flex items-center gap-1">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Vencido ({cli.overdueDays}d)
                                </span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                  En Plazo
                                </span>
                              )}
                            </td>

                            {/* Botones de Acción */}
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {onOpenClientDetail && (
                                  <button
                                    onClick={() => onOpenClientDetail(cli)}
                                    title="Ver Ficha y Cuenta Corriente"
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span className="hidden xl:inline text-[11px]">Ficha</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => onOpenClientPayment(cli)}
                                  title="Registrar Cobro"
                                  className="p-1.5 sm:px-2.5 sm:py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                                >
                                  <DollarSign className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline text-[11px]">Cobrar</span>
                                </button>
                                {onOpenEditClient && (
                                  <button
                                    onClick={() => onOpenEditClient(cli)}
                                    title="Editar Datos Fiscales"
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================
          4. PESTAÑA: CARTERA DE CHEQUES (Recibidos, Emitidos y Endosados)
      ======================================================== */}
      {activeTab === 'checks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Carpeta Integral de Cheques
              </h3>
              <p className="text-xs text-slate-500">
                Control de cheques en cartera a cobrar, cheques emitidos propios y cheques endosados a terceros.
              </p>
            </div>
            <button
              onClick={onOpenNewCheck}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              + Ingresar Cheque
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {checks.map(chk => (
              <div 
                key={chk.id} 
                className={`bg-white border-2 rounded-2xl p-5 shadow-md flex flex-col justify-between ${
                  chk.type === 'in_portfolio' ? 'border-blue-300' :
                  chk.type === 'endorsed' ? 'border-amber-300' : 'border-purple-300'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="font-mono text-xs font-black bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-300">
                      Nº {chk.checkNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      chk.type === 'in_portfolio' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                      chk.type === 'endorsed' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      'bg-purple-100 text-purple-900 border border-purple-300'
                    }`}>
                      {chk.status}
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-slate-900 mb-1">{chk.bank}</h4>
                  
                  <div className="text-xs text-slate-700 space-y-1 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <p><span className="font-bold text-slate-500">Emisor:</span> {chk.issuer}</p>
                    <p><span className="font-bold text-slate-500">Beneficiario:</span> {chk.recipient}</p>
                    <p><span className="font-bold text-slate-500">Fecha de Cobro/Vto:</span> <span className="font-mono font-bold text-slate-900">{chk.dueDate}</span></p>
                    <p className="text-[11px] text-slate-500 italic mt-1">{chk.originOrderOrNote}</p>
                  </div>

                  <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 mb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Importe del Cheque:</span>
                    <span className="text-xl font-mono font-black text-slate-950">
                      $ {chk.amount?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {chk.type === 'in_portfolio' && (
                  <div className="pt-2 border-t border-slate-200 flex gap-2">
                    <button
                      onClick={onOpenSupplierPayment}
                      className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-2xs text-center"
                    >
                      Endosar a Proveedor
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          5. PESTAÑA: RETIROS DEL DUEÑO / TITULAR
      ======================================================== */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Retiros y Adelantos de Ganancias del Dueño
              </h3>
              <p className="text-xs text-slate-500">
                Registro detallado de dinero retirado de la caja o transferido a cuentas personales.
              </p>
            </div>
            <button
              onClick={onOpenNewWithdrawal}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm"
            >
              + Nuevo Retiro Personal
            </button>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-md">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Concepto / Motivo</th>
                  <th className="py-3 px-4">Medio de Retiro</th>
                  <th className="py-3 px-4 text-right">Importe Retirado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {withdrawals.map(w => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{w.date}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-bold">{w.concept}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full font-bold border border-slate-300">
                        {w.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-amber-700 text-sm">
                      $ {w.amount?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
