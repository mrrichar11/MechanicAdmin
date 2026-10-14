import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Bot, 
  Mic, 
  Building2, 
  User, 
  MapPin, 
  Phone, 
  Wrench,
  Sparkles,
  Inbox,
  DollarSign,
  Wallet,
  FileCheck,
  Settings,
  LogOut
} from 'lucide-react';

import { 
  WORKSHOP_INFO, 
  INITIAL_VEHICLES, 
  INITIAL_BOT_DRAFTS,
  INITIAL_SUPPLIERS,
  INITIAL_CLIENT_ACCOUNTS,
  INITIAL_CHECKS,
  INITIAL_OWNER_WITHDRAWALS,
  INITIAL_CASH_BALANCE
} from './data/initialData';

import VehiclesView from './components/VehiclesView';
import BotDraftsView from './components/BotDraftsView';
import FinanceAndAccountsView from './components/FinanceAndAccountsView';
import VehicleDetailModal from './components/VehicleDetailModal';
import WorkOrderEditor from './components/WorkOrderEditor';
import PrintModal from './components/PrintModal';
import WhatsAppSimulator from './components/WhatsAppSimulator';
import NewVehicleModal from './components/NewVehicleModal';
import AdminWhatsAppConnectionModal from './components/AdminWhatsAppConnectionModal';
import ExcelImportModal from './components/ExcelImportModal';
import AuthScreen from './components/AuthScreen';
import SettingsView from './components/SettingsView';
import { 
  RegisterPaymentModal, 
  RegisterWithdrawalModal, 
  RegisterCheckModal, 
  NewSupplierModal 
} from './components/FinanceModals';

export default function App() {
  // Sesión de Usuario y Perfil del Taller (requiere login al entrar)
  const [userSession, setUserSession] = useState(() => {
    const saved = localStorage.getItem('workshop_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [workshopInfo, setWorkshopInfo] = useState(() => {
    const saved = localStorage.getItem('workshop_info_profile');
    return saved ? JSON.parse(saved) : WORKSHOP_INFO;
  });

  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('workshop_vehicles_data');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });
  const [drafts, setDrafts] = useState(() => {
    const saved = localStorage.getItem('workshop_drafts_data');
    return saved ? JSON.parse(saved) : INITIAL_BOT_DRAFTS;
  });
  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('workshop_suppliers_data');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });
  const [clientAccounts, setClientAccounts] = useState(() => {
    const saved = localStorage.getItem('workshop_clients_data');
    return saved ? JSON.parse(saved) : INITIAL_CLIENT_ACCOUNTS;
  });
  const [checks, setChecks] = useState(() => {
    const saved = localStorage.getItem('workshop_checks_data');
    return saved ? JSON.parse(saved) : INITIAL_CHECKS;
  });
  const [withdrawals, setWithdrawals] = useState(() => {
    const saved = localStorage.getItem('workshop_withdrawals_data');
    return saved ? JSON.parse(saved) : INITIAL_OWNER_WITHDRAWALS;
  });
  const [cashBalance, setCashBalance] = useState(() => {
    const saved = localStorage.getItem('workshop_cash_data');
    return saved ? JSON.parse(saved) : INITIAL_CASH_BALANCE;
  });

  // Guardar en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('workshop_vehicles_data', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('workshop_drafts_data', JSON.stringify(drafts));
  }, [drafts]);

  useEffect(() => {
    localStorage.setItem('workshop_suppliers_data', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('workshop_clients_data', JSON.stringify(clientAccounts));
  }, [clientAccounts]);

  useEffect(() => {
    localStorage.setItem('workshop_checks_data', JSON.stringify(checks));
  }, [checks]);

  useEffect(() => {
    localStorage.setItem('workshop_withdrawals_data', JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem('workshop_cash_data', JSON.stringify(cashBalance));
  }, [cashBalance]);

  // Navegación de Vistas: 'vehicles' | 'drafts' | 'finances' | 'settings'
  const [currentView, setCurrentView] = useState('vehicles');

  // Modales Vehículos & Órdenes
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  const [editorVehicle, setEditorVehicle] = useState(null);
  const [editorDraft, setEditorDraft] = useState(null);
  const [editingVisit, setEditingVisit] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [printVehicle, setPrintVehicle] = useState(null);
  const [printVisit, setPrintVisit] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [isWhatsAppSimOpen, setIsWhatsAppSimOpen] = useState(false);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);
  const [isAdminWhatsAppOpen, setIsAdminWhatsAppOpen] = useState(false);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);

  // Modales Financieros
  const [paymentModalConfig, setPaymentModalConfig] = useState({ isOpen: false, type: 'client' });
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // Polling para traer borradores generados por WhatsApp real desde el servidor local
  useEffect(() => {
    // Si la web está en Vercel (https) y el servidor WhatsApp está en local, no bloquear
    const isLocalEnv = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.') || window.location.hostname === '127.0.0.1';
    if (!isLocalEnv) return;

    const fetchIncomingDrafts = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/whatsapp/drafts');
        if (res.ok) {
          const incoming = await res.json();
          if (incoming && incoming.length > 0) {
            setDrafts(prev => {
              const existingIds = new Set(prev.map(d => d.id));
              const newDrafts = incoming.filter(d => !existingIds.has(d.id));
              return newDrafts.length > 0 ? [...newDrafts, ...prev] : prev;
            });
          }
        }
      } catch (err) {
        // Backend no conectado o apagado, ignorar silenciosamente
      }
    };

    fetchIncomingDrafts();
    const interval = setInterval(fetchIncomingDrafts, 4000);
    return () => clearInterval(interval);
  }, []);

  // Seleccionar vehículo para ver historial
  const handleSelectVehicle = (veh) => {
    setSelectedVehicle(veh);
    setIsVehicleModalOpen(true);
  };

  // Abrir editor para nueva visita manual
  const handleOpenNewOrder = (veh) => {
    setEditorVehicle(veh);
    setEditorDraft(null);
    setEditingVisit(null);
    setIsEditorOpen(true);
  };

  // Abrir editor para EDITAR visita existente
  const handleEditVisit = (veh, visit) => {
    setEditorVehicle(veh);
    setEditorDraft(null);
    setEditingVisit(visit);
    setIsEditorOpen(true);
  };

  // Abrir editor desde un borrador de WhatsApp
  const handleOpenEditorWithDraft = (draft) => {
    const matched = vehicles.find(v => v.plate.replace(/\s+/g, '') === draft.detectedPlate.replace(/\s+/g, '')) || vehicles[0];
    setEditorVehicle(matched);
    setEditorDraft(draft);
    setEditingVisit(null);
    setIsEditorOpen(true);
  };

  // Guardar orden de trabajo (nueva o editada)
  const handleSaveOrder = (vehicleId, orderData, draftId = null, isEditing = false) => {
    setVehicles(prevVehicles => 
      prevVehicles.map(v => {
        if (v.id === vehicleId) {
          let updatedHistory;
          if (isEditing) {
            updatedHistory = (v.history || []).map(h => h.id === orderData.id ? orderData : h);
          } else {
            updatedHistory = [orderData, ...(v.history || [])];
          }
          return {
            ...v,
            currentKm: orderData.km,
            history: updatedHistory
          };
        }
        return v;
      })
    );

    // Actualizar vehículo seleccionado si está abierto
    if (selectedVehicle && selectedVehicle.id === vehicleId) {
      setSelectedVehicle(prev => {
        let updatedHistory;
        if (isEditing) {
          updatedHistory = (prev.history || []).map(h => h.id === orderData.id ? orderData : h);
        } else {
          updatedHistory = [orderData, ...(prev.history || [])];
        }
        return {
          ...prev,
          currentKm: orderData.km,
          history: updatedHistory
        };
      });
    }

    if (draftId) {
      setDrafts(prevDrafts => 
        prevDrafts.map(d => d.id === draftId ? { ...d, status: 'applied' } : d)
      );
    }
  };

  // Descartar / eliminar borrador de WhatsApp
  const handleDiscardDraft = async (draftId) => {
    setDrafts(prev => prev.filter(d => d.id !== draftId));
    try {
      await fetch(`http://localhost:3001/api/whatsapp/drafts/${draftId}`, { method: 'DELETE' });
    } catch (e) {
      // Ignorar si offline
    }
  };

  // Imprimir comprobante
  const handlePrintVisit = (vehicle, visit) => {
    setPrintVehicle(vehicle);
    setPrintVisit(visit);
    setIsPrintModalOpen(true);
  };

  // Guardar nuevo vehículo
  const handleSaveNewVehicle = (newVeh) => {
    setVehicles(prev => [newVeh, ...prev]);
  };

  // Importar lote de vehículos desde planillas Excel
  const handleImportVehicles = (importedVehicles) => {
    setVehicles(prevVehicles => {
      let current = [...prevVehicles];
      importedVehicles.forEach(newVeh => {
        const cleanPlate = newVeh.plate.replace(/\s+/g, '').toUpperCase();
        const existingIndex = current.findIndex(v => v.plate.replace(/\s+/g, '').toUpperCase() === cleanPlate);
        
        if (existingIndex >= 0) {
          // Unir historial de visitas sin duplicar
          const existing = current[existingIndex];
          const mergedHistory = [...(newVeh.history || []), ...(existing.history || [])];
          current[existingIndex] = {
            ...existing,
            currentKm: Math.max(existing.currentKm || 0, newVeh.currentKm || 0),
            history: mergedHistory
          };
        } else {
          current.unshift(newVeh);
        }
      });
      return current;
    });
  };

  // Nuevo borrador de WhatsApp
  const handleNewDraftCreated = (newDraft) => {
    setDrafts(prev => [newDraft, ...prev]);
  };

  // Procesar Pago / Cobranza Financiera
  const handleSavePayment = ({ type, entityId, amount, method, endorsedCheckId, notes }) => {
    if (type === 'client') {
      // Cobro de cliente
      setClientAccounts(prev => prev.map(c => {
        if (c.id === entityId) {
          const newPaid = (c.totalPaid || 0) + amount;
          const newDue = Math.max(0, (c.balanceDue || 0) - amount);
          return {
            ...c,
            totalPaid: newPaid,
            balanceDue: newDue,
            payments: [{ id: `cp-${Date.now()}`, date: new Date().toISOString().split('T')[0], method, amount, note: notes }, ...(c.payments || [])]
          };
        }
        return c;
      }));

      // Si pagó con cheque, ingresar a cartera
      if (method.includes('Cheque')) {
        const clientObj = clientAccounts.find(c => c.id === entityId);
        setChecks(prev => [
          {
            id: `chk-${Date.now()}`,
            type: 'in_portfolio',
            bank: 'Banco del Cliente',
            checkNumber: `${Math.floor(10000000 + Math.random() * 90000000)}`,
            issuer: clientObj?.clientName || 'Cliente',
            recipient: 'Bosch Car Service / Iván Luque',
            dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
            amount: amount,
            status: 'A cobrar en cartera',
            originOrderOrNote: `Pago de ${clientObj?.clientName}`
          },
          ...prev
        ]);
      } else if (method === 'Efectivo') {
        setCashBalance(prev => ({ ...prev, cashOnHand: prev.cashOnHand + amount }));
      } else {
        setCashBalance(prev => ({ ...prev, bankBalance: prev.bankBalance + amount }));
      }
    } else {
      // Pago a proveedor
      setSuppliers(prev => prev.map(s => {
        if (s.id === entityId) {
          const newDue = Math.max(0, (s.balanceDue || 0) - amount);
          return {
            ...s,
            balanceDue: newDue,
            history: [{ id: `mov-${Date.now()}`, date: new Date().toISOString().split('T')[0], type: 'payment', description: `${method}: ${notes}`, amount: -amount, balanceAfter: newDue }, ...(s.history || [])]
          };
        }
        return s;
      }));

      // Si endosó cheque, actualizar estado del cheque
      if (endorsedCheckId) {
        setChecks(prev => prev.map(chk => chk.id === endorsedCheckId ? { ...chk, type: 'endorsed', status: 'Endosado y entregado a proveedor' } : chk));
      } else if (method === 'Efectivo') {
        setCashBalance(prev => ({ ...prev, cashOnHand: Math.max(0, prev.cashOnHand - amount) }));
      } else {
        setCashBalance(prev => ({ ...prev, bankBalance: Math.max(0, prev.bankBalance - amount) }));
      }
    }
  };

  // Guardar Retiro del Dueño
  const handleSaveWithdrawal = (withdrawal) => {
    setWithdrawals(prev => [withdrawal, ...prev]);
    if (withdrawal.method === 'Efectivo') {
      setCashBalance(prev => ({ ...prev, cashOnHand: Math.max(0, prev.cashOnHand - withdrawal.amount) }));
    } else {
      setCashBalance(prev => ({ ...prev, bankBalance: Math.max(0, prev.bankBalance - withdrawal.amount) }));
    }
  };

  // Guardar Cheque Manual
  const handleSaveCheck = (checkData) => {
    setChecks(prev => [checkData, ...prev]);
  };

  // Guardar Nuevo Proveedor
  const handleSaveSupplier = (supplierData) => {
    setSuppliers(prev => [supplierData, ...prev]);
  };

  // Manejador de Login Exitoso
  const handleLoginSuccess = (sessionData) => {
    setUserSession(sessionData);
    localStorage.setItem('workshop_user_session', JSON.stringify(sessionData));

    // Si viene con datos del taller, actualizar workshopInfo
    if (sessionData.workshopName) {
      setWorkshopInfo(prev => {
        const updated = {
          ...prev,
          name: sessionData.workshopName || prev.name,
          owner: sessionData.ownerName || prev.owner,
          email: sessionData.email || prev.email,
          phone: sessionData.phone || prev.phone
        };
        localStorage.setItem('workshop_info_profile', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Manejador de Cierre de Sesión
  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem('workshop_user_session');
  };

  // Guardar datos configurados del taller
  const handleSaveWorkshopInfo = (updatedInfo) => {
    setWorkshopInfo(updatedInfo);
    localStorage.setItem('workshop_info_profile', JSON.stringify(updatedInfo));
  };

  const pendingDraftsCount = drafts.filter(d => d.status === 'pending').length;

  // Si no hay sesión iniciada, mostrar pantalla de Login / Registro
  if (!userSession) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 flex flex-col font-sans">
      
      {/* Header superior con ALTO CONTRASTE y relieve */}
      <header className="bg-white border-b-2 border-slate-300 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo del taller dinámico */}
          <div className="flex items-center gap-3.5">
            <div className="bg-[#cc0000] text-white px-2.5 py-1 font-black text-sm tracking-wider rounded-lg shadow-sm">
              BOSCH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-slate-950 text-base tracking-tight">
                  {workshopInfo.name}
                </h1>
                <span className="text-slate-400 font-bold">/</span>
                <span className="text-xs text-slate-800 font-black bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  de {workshopInfo.owner}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-semibold flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-500" /> {workshopInfo.address}</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-500" /> {workshopInfo.phone}</span>
              </p>
            </div>
          </div>

          {/* Navegación Principal con EFECTO TACTIL / BOTONES EN RELIEVE */}
          <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300 shadow-inner">
            <button
              onClick={() => setCurrentView('vehicles')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                currentView === 'vehicles'
                  ? 'bg-white text-slate-950 shadow-md scale-102'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/60'
              }`}
            >
              <Car className="w-4 h-4 text-amber-500" />
              <span>Vehículos & Flotas</span>
              <span className="text-[10px] bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.2 rounded-full font-mono font-black">
                {vehicles.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentView('drafts')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all relative ${
                currentView === 'drafts'
                  ? 'bg-white text-slate-950 shadow-md scale-102'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/60'
              }`}
            >
              <Inbox className="w-4 h-4 text-emerald-600" />
              <span>Borradores WhatsApp</span>
              {pendingDraftsCount > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                  {pendingDraftsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('finances')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                currentView === 'finances'
                  ? 'bg-white text-slate-950 shadow-md scale-102'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/60'
              }`}
            >
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>Control & Cuentas</span>
            </button>

            <button
              onClick={() => setCurrentView('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                currentView === 'settings'
                  ? 'bg-white text-slate-950 shadow-md scale-102'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/60'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span>Configuración</span>
            </button>
          </div>

          {/* Botones de WhatsApp y Administración */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdminWhatsAppOpen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-black rounded-xl flex items-center gap-1.5 transition shadow-md hover:shadow-lg hover:-translate-y-0.5 border border-slate-700"
              title="Vincular WhatsApp / Estado de conexión (Área Protegida por Contraseña)"
            >
              <span>🔐 WhatsApp (Admin)</span>
            </button>

            <button
              onClick={() => setIsWhatsAppSimOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Mic className="w-4 h-4" />
              <span>Simular Audio</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* Renderizado de Vistas */}
        {currentView === 'vehicles' && (
          <VehiclesView
            vehicles={vehicles}
            onSelectVehicle={handleSelectVehicle}
            onOpenNewOrder={handleOpenNewOrder}
            onAddNewVehicle={() => setIsNewVehicleModalOpen(true)}
            onOpenExcelImport={() => setIsExcelImportModalOpen(true)}
          />
        )}

        {currentView === 'drafts' && (
          <BotDraftsView
            drafts={drafts}
            onOpenEditorWithDraft={handleOpenEditorWithDraft}
            onOpenWhatsAppSimulator={() => setIsWhatsAppSimOpen(true)}
            onDiscardDraft={handleDiscardDraft}
          />
        )}

        {currentView === 'finances' && (
          <FinanceAndAccountsView
            suppliers={suppliers}
            clientAccounts={clientAccounts}
            checks={checks}
            withdrawals={withdrawals}
            cashBalance={cashBalance}
            onOpenSupplierPayment={() => setPaymentModalConfig({ isOpen: true, type: 'supplier' })}
            onOpenClientPayment={() => setPaymentModalConfig({ isOpen: true, type: 'client' })}
            onOpenNewCheck={() => setIsCheckModalOpen(true)}
            onOpenNewWithdrawal={() => setIsWithdrawalModalOpen(true)}
            onOpenNewSupplier={() => setIsSupplierModalOpen(true)}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            workshopInfo={workshopInfo}
            onSaveWorkshopInfo={handleSaveWorkshopInfo}
            userSession={userSession}
            onLogout={handleLogout}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t-2 border-slate-300 bg-white py-4 text-center text-xs text-slate-500 font-bold">
        Sistema de Control Integral para Taller Mecánico • Bosch Car Service Iván Luque (Sunchales)
      </footer>

      {/* Modales de Vehículos & Trabajos */}
      <VehicleDetailModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        vehicle={selectedVehicle}
        onOpenNewOrder={handleOpenNewOrder}
        onEditVisit={handleEditVisit}
        onPrintVisit={handlePrintVisit}
      />

      <WorkOrderEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditorDraft(null);
          setEditingVisit(null);
        }}
        vehicle={editorVehicle}
        initialDraft={editorDraft}
        editingVisit={editingVisit}
        onSaveOrder={handleSaveOrder}
      />

      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        vehicle={printVehicle}
        visit={printVisit}
        workshopInfo={workshopInfo}
      />

      <WhatsAppSimulator
        isOpen={isWhatsAppSimOpen}
        onClose={() => setIsWhatsAppSimOpen(false)}
        existingVehicles={vehicles}
        onNewDraftCreated={handleNewDraftCreated}
      />

      <NewVehicleModal
        isOpen={isNewVehicleModalOpen}
        onClose={() => setIsNewVehicleModalOpen(false)}
        onSave={handleSaveNewVehicle}
      />

      {/* Modales Financieros */}
      <RegisterPaymentModal
        isOpen={paymentModalConfig.isOpen}
        type={paymentModalConfig.type}
        onClose={() => setPaymentModalConfig({ isOpen: false, type: 'client' })}
        suppliers={suppliers}
        clientAccounts={clientAccounts}
        checks={checks}
        onSavePayment={handleSavePayment}
      />

      <RegisterWithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        onSaveWithdrawal={handleSaveWithdrawal}
      />

      <RegisterCheckModal
        isOpen={isCheckModalOpen}
        onClose={() => setIsCheckModalOpen(false)}
        onSaveCheck={handleSaveCheck}
      />

      <NewSupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSaveSupplier={handleSaveSupplier}
      />

      <AdminWhatsAppConnectionModal
        isOpen={isAdminWhatsAppOpen}
        onClose={() => setIsAdminWhatsAppOpen(false)}
      />

      <ExcelImportModal
        isOpen={isExcelImportModalOpen}
        onClose={() => setIsExcelImportModalOpen(false)}
        onImportVehicles={handleImportVehicles}
      />

    </div>
  );
}
