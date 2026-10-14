import React, { useState, useEffect } from 'react';
import { X, Save, User, Building2, ShieldCheck, Mail, Phone, MapPin, DollarSign, Calendar } from 'lucide-react';

export default function ClientEditorModal({ isOpen, onClose, client, onSaveClient }) {
  const [name, setName] = useState('');
  const [clientType, setClientType] = useState('particular');
  const [contactPerson, setContactPerson] = useState('');
  const [taxId, setTaxId] = useState('');
  const [taxCategory, setTaxCategory] = useState('Consumidor Final');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentTermDays, setPaymentTermDays] = useState(0);
  const [creditLimit, setCreditLimit] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (client) {
      setName(client.name || client.clientName || '');
      setClientType(client.clientType || 'particular');
      setContactPerson(client.contactPerson || '');
      setTaxId(client.taxId || client.cuitDni || '');
      setTaxCategory(client.taxCategory || 'Consumidor Final');
      setPhone(client.phone || '');
      setEmail(client.email || '');
      setAddress(client.address || '');
      setCity(client.city || '');
      setProvince(client.province || '');
      setPostalCode(client.postalCode || '');
      setPaymentTermDays(client.paymentTermDays ?? 0);
      setCreditLimit(client.creditLimit || '');
      setNotes(client.notes || '');
    } else {
      setName('');
      setClientType('particular');
      setContactPerson('');
      setTaxId('');
      setTaxCategory('Consumidor Final');
      setPhone('');
      setEmail('');
      setAddress('');
      setCity('');
      setProvince('');
      setPostalCode('');
      setPaymentTermDays(0);
      setCreditLimit('');
      setNotes('');
    }
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveClient({
      id: client?.id || `cli-${Date.now()}`,
      name: name.trim(),
      clientType,
      contactPerson: contactPerson.trim(),
      taxId: taxId.trim(),
      taxCategory,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      province: province.trim(),
      postalCode: postalCode.trim(),
      paymentTermDays: parseInt(paymentTermDays, 10) || 0,
      creditLimit: parseFloat(creditLimit) || 0,
      notes: notes.trim(),
      vehicles: client?.vehicles || []
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border-2 border-slate-300 text-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              {clientType === 'fleet' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                {client ? 'Editar Ficha del Cliente' : 'Nuevo Cliente / Empresa'}
              </h2>
              <p className="text-xs text-slate-400">
                Datos de contacto, información fiscal para facturación y plazos comerciales.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs bg-slate-50/60">
          
          {/* 1. Tipo e Identidad */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
                1. Tipo de Cuenta & Identificación
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setClientType('particular')}
                  className={`px-3 py-1 rounded-lg font-bold transition text-xs flex items-center gap-1 border ${
                    clientType === 'particular'
                      ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> Particular
                </button>
                <button
                  type="button"
                  onClick={() => setClientType('fleet')}
                  className={`px-3 py-1 rounded-lg font-bold transition text-xs flex items-center gap-1 border ${
                    clientType === 'fleet'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Flota / Empresa
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nombre Completo / Razón Social *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. BHY S.A. o Carlos Rossi"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Persona de Contacto / Encargado de Flota
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Ej. Ing. Marcelo Pérez (Jefe de compras)"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Datos Fiscales para Facturación */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <span className="font-black text-slate-800 uppercase tracking-wider text-[11px] block">
              2. Datos Fiscales para Facturación (AFIP / Factura Electrónica)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  CUIT / CUIL / DNI *
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="Ej. 30-70894512-4 o 24.582.109"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Condición frente al IVA
                </label>
                <select
                  value={taxCategory}
                  onChange={(e) => setTaxCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-slate-800 focus:outline-none"
                >
                  <option value="Responsable Inscripto">IVA Responsable Inscripto (Factura A)</option>
                  <option value="Monotributo">IVA Responsable Monotributo (Factura B)</option>
                  <option value="Exento">IVA Exento (Factura B)</option>
                  <option value="Consumidor Final">Consumidor Final (Factura B)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Contacto & Domicilio */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <span className="font-black text-slate-800 uppercase tracking-wider text-[11px] block">
              3. Vías de Contacto & Domicilio
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 3493-402211"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> Email de Facturación
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="facturacion@empresa.com"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">
                  Domicilio Fiscal / Calle y Número
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Av. Belgrano 450"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Localidad / Ciudad
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Sunchales"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Condiciones Comerciales & Crédito */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <span className="font-black text-slate-800 uppercase tracking-wider text-[11px] block">
              4. Condiciones Comerciales & Plazos de Pago
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Plazo de Pago Acordado
                </label>
                <select
                  value={paymentTermDays}
                  onChange={(e) => setPaymentTermDays(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-slate-800 focus:outline-none"
                >
                  <option value={0}>Contado / Pago al Retiro</option>
                  <option value={15}>15 días fecha factura</option>
                  <option value={30}>30 días fecha factura</option>
                  <option value={45}>45 días fecha factura</option>
                  <option value={60}>60 días fecha factura</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  El sistema alertará en color rojo cuando el saldo pendiente supere este plazo.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" /> Límite de Crédito ($)
                </label>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="Ej. 1500000 (Dejar vacío si no aplica)"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Notas y Observaciones Internas
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Enviar factura por mail al recibir vehículo. Pago por transferencia los días 10."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Guardar Cliente</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
