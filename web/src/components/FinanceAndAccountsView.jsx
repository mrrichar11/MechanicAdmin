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
  FileText
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
  onOpenNewSupplier
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'suppliers' | 'clients' | 'checks' | 'withdrawals'

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

      {/* Pestañas de Navegación Financiera */}
      <div className="bg-white border-2 border-slate-200/90 p-2 rounded-2xl shadow-sm flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4 text-amber-400" />
          <span>Resumen General & Caja</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
            activeTab === 'suppliers'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4 text-rose-400" />
          <span>Proveedores & Cuentas ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
            activeTab === 'clients'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Cuentas de Clientes / Cobranzas</span>
        </button>

        <button
          onClick={() => setActiveTab('checks')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
            activeTab === 'checks'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4 text-blue-400" />
          <span>Cartera de Cheques ({checks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
            activeTab === 'withdrawals'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4 text-amber-400" />
          <span>Retiros del Dueño</span>
        </button>
      </div>

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
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Cuentas Corrientes de Clientes (Flotas y Particulares)
              </h3>
              <p className="text-xs text-slate-500">
                Control de saldos facturados, pagos parciales con cheque o transferencia, y deuda restante.
              </p>
            </div>
            <button
              onClick={onOpenClientPayment}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              + Registrar Cobranza / Pago Parcial
            </button>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-md">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Cliente / Razón Social</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Autos Asociados</th>
                  <th className="py-3 px-4 text-right">Total Facturado</th>
                  <th className="py-3 px-4 text-right">Total Cobrado</th>
                  <th className="py-3 px-4 text-right">Saldo Deudor</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {clientAccounts.map(cli => (
                  <tr key={cli.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {cli.clientName}
                      <span className="block text-[11px] text-slate-400 font-normal">CUIT: {cli.cuitDni} • Tel: {cli.phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {cli.clientType === 'fleet' ? (
                        <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-full">Flota Empresa</span>
                      ) : (
                        <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-2 py-0.5 rounded-full">Particular</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {cli.vehicles?.join(', ')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                      $ {cli.totalBilled?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-bold">
                      $ {cli.totalPaid?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-rose-700 text-sm">
                      $ {cli.balanceDue?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={onOpenClientPayment}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-2xs"
                      >
                        Cobrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
