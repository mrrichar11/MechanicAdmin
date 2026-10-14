import React, { useState } from 'react';
import { X, Save, DollarSign, Building2, Users, FileCheck, UserCheck } from 'lucide-react';

// Modal para Cobro a Cliente o Pago a Proveedor
export function RegisterPaymentModal({ isOpen, onClose, type = 'client', suppliers, clientAccounts, checks, onSavePayment }) {
  if (!isOpen) return null;

  const isClient = type === 'client';
  const [selectedEntityId, setSelectedEntityId] = useState(
    isClient ? (clientAccounts[0]?.id || '') : (suppliers[0]?.id || '')
  );
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [selectedEndorsedCheckId, setSelectedEndorsedCheckId] = useState('');
  const [notes, setNotes] = useState('');

  const checksInPortfolio = checks.filter(c => c.type === 'in_portfolio');

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount <= 0) return;

    onSavePayment({
      type,
      entityId: selectedEntityId,
      amount: parsedAmount,
      method: paymentMethod,
      endorsedCheckId: paymentMethod === 'Endoso de Cheque de Tercero' ? selectedEndorsedCheckId : null,
      notes: notes.trim() || 'Sin observaciones'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-2 border-slate-300 text-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-4">
        <div className="bg-slate-100 px-6 py-4 border-b border-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className={`w-5 h-5 ${isClient ? 'text-emerald-600' : 'text-rose-600'}`} />
            <h2 className="text-sm font-black text-slate-900">
              {isClient ? 'Registrar Cobro / Cobranza de Cliente' : 'Registrar Pago a Proveedor'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs bg-slate-50/50">
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              {isClient ? 'Seleccionar Cliente / Flota' : 'Seleccionar Proveedor / Repuestera'} *
            </label>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none"
            >
              {isClient ? (
                clientAccounts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.clientName} (Debe: $ {c.balanceDue.toLocaleString('es-AR')})
                  </option>
                ))
              ) : (
                suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Saldo adeudado: $ {s.balanceDue.toLocaleString('es-AR')})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Importe ($) - Permite pagos parciales *
            </label>
            <input
              type="number"
              required
              placeholder="Ej. 250000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-black text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Forma de Pago *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none"
            >
              <option value="Efectivo">Efectivo (Caja del Taller)</option>
              <option value="Transferencia Bancaria">Transferencia Bancaria</option>
              <option value="Cheque Recibido (Cliente)">Cheque Recibido (a cobrar)</option>
              {!isClient && (
                <>
                  <option value="Cheque Propio Emitido">Cheque Propio Emitido</option>
                  <option value="Endoso de Cheque de Tercero">Endoso de Cheque de Tercero (de Cartera)</option>
                </>
              )}
            </select>
          </div>

          {paymentMethod === 'Endoso de Cheque de Tercero' && (
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-300">
              <label className="block text-amber-900 font-bold mb-1">
                Elegir Cheque en Cartera a Endosar:
              </label>
              <select
                value={selectedEndorsedCheckId}
                onChange={(e) => setSelectedEndorsedCheckId(e.target.value)}
                className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none"
              >
                <option value="">Seleccione un cheque...</option>
                {checksInPortfolio.map(chk => (
                  <option key={chk.id} value={chk.id}>
                    Nº {chk.checkNumber} - {chk.bank} ($ {chk.amount.toLocaleString('es-AR')}) - Vto: {chk.dueDate}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">Detalle / Notas / Factura</label>
            <input
              type="text"
              placeholder="Ej. Pago parcial factura poleas / Pago arreglo Mercedes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-300 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-white font-black rounded-xl shadow-md transition ${
                isClient ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Confirmar Operación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal para Retiro Personal del Dueño
export function RegisterWithdrawalModal({ isOpen, onClose, onSaveWithdrawal }) {
  if (!isOpen) return null;

  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('Retiro personal para gastos particulares');
  const [method, setMethod] = useState('Efectivo');

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(amount) || 0;
    if (val <= 0) return;

    onSaveWithdrawal({
      id: `ret-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      concept: concept.trim(),
      method: method,
      amount: val
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white border-2 border-slate-300 text-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden my-4">
        <div className="bg-amber-100 px-6 py-4 border-b border-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-800" />
            <h2 className="text-sm font-black text-amber-950">Registrar Retiro del Dueño / Titular</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-600 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs bg-white">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Importe a Retirar ($) *</label>
            <input
              type="number"
              required
              placeholder="Ej. 150000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-black text-base focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Medio de Retiro</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none"
            >
              <option value="Efectivo">Efectivo (Retiro de Caja)</option>
              <option value="Transferencia Bancaria">Transferencia Bancaria a cuenta personal</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Concepto / Motivo</label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold">
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md transition"
            >
              Registrar Retiro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal para Ingresar Cheque
export function RegisterCheckModal({ isOpen, onClose, onSaveCheck }) {
  if (!isOpen) return null;

  const [bank, setBank] = useState('Banco Macro');
  const [checkNumber, setCheckNumber] = useState('');
  const [issuer, setIssuer] = useState('');
  const [recipient, setRecipient] = useState('El Taller');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('in_portfolio');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(amount) || 0;
    if (val <= 0 || !checkNumber.trim()) return;

    onSaveCheck({
      id: `chk-${Date.now()}`,
      type: type,
      bank: bank.trim(),
      checkNumber: checkNumber.trim(),
      issuer: issuer.trim() || 'Cliente',
      recipient: recipient.trim(),
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      amount: val,
      status: type === 'in_portfolio' ? 'A cobrar en cartera' : 'Emitido propio',
      originOrderOrNote: note.trim() || 'Ingreso manual'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white border-2 border-slate-300 text-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-4">
        <div className="bg-blue-100 px-6 py-4 border-b border-blue-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-800" />
            <h2 className="text-sm font-black text-blue-950">Ingresar Cheque a la Cartera</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-600 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs bg-white">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Tipo de Cheque</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none"
              >
                <option value="in_portfolio">Cheque Recibido (En Cartera)</option>
                <option value="issued">Cheque Propio Emitido</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Banco Emisor *</label>
              <input
                type="text"
                required
                placeholder="Ej. Banco Santander / Macro"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Número de Cheque *</label>
              <input
                type="text"
                required
                placeholder="Ej. 45129983"
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Importe ($) *</label>
              <input
                type="number"
                required
                placeholder="Ej. 650000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-black focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Emisor (Quién firma)</label>
              <input
                type="text"
                placeholder="Ej. BHY S.A."
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Fecha de Cobro / Vto *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Observaciones / Orden Asociada</label>
            <input
              type="text"
              placeholder="Ej. Recibido por pago parcial OT Mercedes"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold">
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition"
            >
              Guardar Cheque
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal para Nuevo Proveedor
export function NewSupplierModal({ isOpen, onClose, onSaveSupplier }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [rubro, setRubro] = useState('Repuestos & Accesorios');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [cuit, setCuit] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveSupplier({
      id: `sup-${Date.now()}`,
      name: name.trim(),
      rubro: rubro.trim(),
      contact: contact.trim() || 'Contacto comercial',
      phone: phone.trim() || 'Sin teléfono',
      cuit: cuit.trim() || 'Sin CUIT',
      balanceDue: 0.00,
      totalPurchases: 0.00,
      history: []
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white border-2 border-slate-300 text-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden my-4">
        <div className="bg-slate-100 px-6 py-4 border-b border-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-800" />
            <h2 className="text-sm font-black text-slate-900">Registrar Nuevo Proveedor</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs bg-white">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Razón Social / Nombre Proveedor *</label>
            <input
              type="text"
              required
              placeholder="Ej. Distribuidora Santa Fe Repuestos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Rubro Principal</label>
            <input
              type="text"
              placeholder="Ej. Aceites Motul / Suspensión / Frenos"
              value={rubro}
              onChange={(e) => setRubro(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Persona de Contacto</label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Teléfono</label>
              <input
                type="text"
                placeholder="Ej. 03492-15498811"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">CUIT</label>
            <input
              type="text"
              placeholder="Ej. 30-71984210-2"
              value={cuit}
              onChange={(e) => setCuit(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold">
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-md transition"
            >
              Guardar Proveedor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
