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
  LogOut,
  RefreshCw,
  CloudCheck,
  ShieldCheck
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
import MechanicAssistantModal from './components/MechanicAssistantModal';
import NewVehicleModal from './components/NewVehicleModal';
import AdminWhatsAppConnectionModal from './components/AdminWhatsAppConnectionModal';
import ExcelImportModal from './components/ExcelImportModal';
import AuthScreen from './components/AuthScreen';
import SettingsView from './components/SettingsView';
import ClientDetailModal from './components/ClientDetailModal';
import ClientEditorModal from './components/ClientEditorModal';
import { 
  RegisterPaymentModal, 
  RegisterWithdrawalModal, 
  RegisterCheckModal, 
  NewSupplierModal 
} from './components/FinanceModals';

import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { 
  getOrCreateWorkshop, 
  loadWorkshopData, 
  saveWorkshopInfoToDb, 
  saveVehicleToDb, 
  saveWorkOrderToDb, 
  bulkImportToSupabase,
  syncLocalDataIfDbEmpty,
  saveClientToDb,
  saveClientPaymentToDb,
  buildClientAccounts
} from './services/databaseService';

export default function App() {
  // Sesión de Usuario
  const [userSession, setUserSession] = useState(() => {
    const saved = localStorage.getItem('workshop_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentWorkshop, setCurrentWorkshop] = useState(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

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

  // Guardar en localStorage como caché secundaria
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

  // Actualizar título de la pestaña del navegador
  useEffect(() => {
    document.title = workshopInfo.name || 'Mi Taller';
  }, [workshopInfo.name]);

  // Restaurar sesión de Supabase al recargar la página
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        const u = data.session.user;
        setUserSession({
          userId: u.id,
          email: u.email,
          workshopName: u.user_metadata?.workshop_name || 'Mi Taller Mecánico',
          ownerName: u.user_metadata?.owner_name || (u.email ? u.email.split('@')[0] : 'Titular'),
          isOnline: true
        });
      }
    });
  }, []);

  // Sincronización Automática con la Base de Datos Central (Supabase Multi-tenant)
  useEffect(() => {
    if (!userSession) return;

    let isMounted = true;
    const syncData = async () => {
      setIsSyncingCloud(true);
      try {
        const { data: authData } = await supabase?.auth.getUser() || {};
        const u = authData?.user || { id: userSession.userId || userSession.email, email: userSession.email };

        const ws = await getOrCreateWorkshop(u, workshopInfo);
        if (ws && isMounted) {
          setCurrentWorkshop(ws);

          // Si la base de datos está vacía y el usuario tenía autos locales (ej: Excel en localhost), migrarlos
          await syncLocalDataIfDbEmpty(ws.id, vehicles, workshopInfo);

          // Cargar datos reales desde la base de datos de Supabase para este taller
          const cloudData = await loadWorkshopData(ws.id);
          if (cloudData && isMounted) {
            if (cloudData.workshop) {
              setWorkshopInfo(prev => ({
                ...prev,
                name: cloudData.workshop.name || prev.name,
                owner: cloudData.workshop.owner || prev.owner,
                address: cloudData.workshop.address || prev.address,
                phone: cloudData.workshop.phone || prev.phone,
                email: cloudData.workshop.email || prev.email,
                cuit: cloudData.workshop.cuit || prev.cuit,
                logoUrl: cloudData.workshop.logo_url || prev.logoUrl,
                taxRate: cloudData.workshop.tax_rate ?? prev.taxRate,
                defaultLaborCost: cloudData.workshop.default_labor_cost ?? prev.defaultLaborCost
              }));
            }
            if (cloudData.vehicles && cloudData.vehicles.length > 0) {
              setVehicles(cloudData.vehicles);
            }
            if (cloudData.clients && cloudData.clients.length > 0) {
              setDbClientsList(cloudData.clients);
            }
            if (cloudData.clientPayments && cloudData.clientPayments.length > 0) {
              setDbPaymentsList(cloudData.clientPayments);
            }
            if (cloudData.clientAccounts && cloudData.clientAccounts.length > 0) {
              setClientAccounts(cloudData.clientAccounts);
            }
            if (cloudData.suppliers && cloudData.suppliers.length > 0) {
              setSuppliers(cloudData.suppliers);
            }
            if (cloudData.checks && cloudData.checks.length > 0) {
              setChecks(cloudData.checks);
            }
            if (cloudData.withdrawals && cloudData.withdrawals.length > 0) {
              setWithdrawals(cloudData.withdrawals);
            }
          }
        }
      } catch (err) {
        console.warn('Error sincronizando con Supabase:', err);
      } finally {
        if (isMounted) setIsSyncingCloud(false);
      }
    };

    syncData();

    return () => { isMounted = false; };
  }, [userSession]);

  // Estado de Clientes y Cobranzas persistidos en DB
  const [dbClientsList, setDbClientsList] = useState([]);
  const [dbPaymentsList, setDbPaymentsList] = useState([]);

  // Modales CRM & Clientes
  const [selectedClientDetail, setSelectedClientDetail] = useState(null);
  const [selectedClientToEdit, setSelectedClientToEdit] = useState(null);
  const [isClientEditorOpen, setIsClientEditorOpen] = useState(false);
  const [preselectedClientId, setPreselectedClientId] = useState(null);

  // Recalcular Cuentas Corrientes y CRM reactivamente cuando cambian vehículos, pagos o clientes
  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const computedAccounts = buildClientAccounts(vehicles, dbClientsList, dbPaymentsList, checks);
      setClientAccounts(computedAccounts);
    }
  }, [vehicles, dbClientsList, dbPaymentsList, checks]);

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

  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);
  const [isAdminWhatsAppOpen, setIsAdminWhatsAppOpen] = useState(false);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);

  // Modales Financieros
  const [paymentModalConfig, setPaymentModalConfig] = useState({ isOpen: false, type: 'client' });
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // Polling para traer borradores generados por WhatsApp real desde el backend
  useEffect(() => {
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
        // Backend apagado
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

  // Guardar orden de trabajo (nueva o editada) y persistir a Supabase
  const handleSaveOrder = async (vehicleId, orderData, draftId = null, isEditing = false) => {
    // 1. Actualización de estado local reactiva
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

    // 2. Guardar en Base de Datos de Supabase en la nube
    if (currentWorkshop?.id) {
      await saveWorkOrderToDb(currentWorkshop.id, vehicleId, orderData);
    }
  };

  // Descartar / eliminar borrador de WhatsApp
  const handleDiscardDraft = async (draftId) => {
    setDrafts(prev => prev.filter(d => d.id !== draftId));
    try {
      await fetch(`http://localhost:3001/api/whatsapp/drafts/${draftId}`, { method: 'DELETE' });
    } catch (e) {}
  };

  // Imprimir comprobante
  const handlePrintVisit = (vehicle, visit) => {
    setPrintVehicle(vehicle);
    setPrintVisit(visit);
    setIsPrintModalOpen(true);
  };

  // Guardar nuevo vehículo y persistir en Supabase
  const handleSaveNewVehicle = async (newVeh) => {
    setVehicles(prev => [newVeh, ...prev]);
    if (currentWorkshop?.id) {
      const savedDb = await saveVehicleToDb(currentWorkshop.id, newVeh);
      if (savedDb) {
        setVehicles(prev => prev.map(v => v.id === newVeh.id ? { ...v, id: savedDb.id } : v));
      }
    }
  };

  // Importar lote de vehículos desde planillas Excel y guardar en Supabase
  const handleImportVehicles = async (importedVehicles) => {
    setVehicles(prevVehicles => {
      let current = [...prevVehicles];
      importedVehicles.forEach(newVeh => {
        const cleanPlate = newVeh.plate.replace(/\s+/g, '').toUpperCase();
        const existingIndex = current.findIndex(v => v.plate.replace(/\s+/g, '').toUpperCase() === cleanPlate);
        
        if (existingIndex >= 0) {
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

    // Guardar masivamente en la base de datos central de Supabase
    if (currentWorkshop?.id) {
      await bulkImportToSupabase(currentWorkshop.id, importedVehicles);
    }
  };

  // Nuevo borrador del asistente o WhatsApp
  const handleNewDraftCreated = (newDraft) => {
    setDrafts(prev => [newDraft, ...prev]);
  };

  // Guardar datos configurados del taller y sincronizar a la nube
  const handleSaveWorkshopInfo = async (updatedInfo) => {
    setWorkshopInfo(updatedInfo);
    localStorage.setItem('workshop_info_profile', JSON.stringify(updatedInfo));
    if (currentWorkshop?.id) {
      await saveWorkshopInfoToDb(currentWorkshop.id, updatedInfo);
    }
  };

  // Restaurar Copia de Seguridad desde Archivo JSON
  const handleRestoreBackup = async (backupData) => {
    if (backupData.vehicles) setVehicles(backupData.vehicles);
    if (backupData.workshop) setWorkshopInfo(backupData.workshop);
    if (backupData.suppliers) setSuppliers(backupData.suppliers);
    if (backupData.clientAccounts) setClientAccounts(backupData.clientAccounts);
    if (backupData.checks) setChecks(backupData.checks);
    if (backupData.withdrawals) setWithdrawals(backupData.withdrawals);
    if (backupData.cashBalance) setCashBalance(backupData.cashBalance);

    if (currentWorkshop?.id && backupData.vehicles) {
      await bulkImportToSupabase(currentWorkshop.id, backupData.vehicles);
      if (backupData.workshop) await saveWorkshopInfoToDb(currentWorkshop.id, backupData.workshop);
    }
    alert('¡Copia de seguridad restaurada correctamente en este taller!');
  };

  // Guardar o actualizar datos de un Cliente (CRM / Fiscal / Comercial)
  const handleSaveClient = async (clientData) => {
    setDbClientsList(prev => {
      const idx = prev.findIndex(c => c.id === clientData.id || (c.name && c.name.toLowerCase() === (clientData.name || '').toLowerCase()));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...clientData };
        return copy;
      }
      return [clientData, ...prev];
    });

    if (currentWorkshop?.id) {
      await saveClientToDb(currentWorkshop.id, clientData);
    }
  };

  const handleOpenClientPayment = (client = null) => {
    if (client) {
      setPreselectedClientId(client.id);
    } else {
      setPreselectedClientId(null);
    }
    setPaymentModalConfig({ isOpen: true, type: 'client' });
  };

  // Procesar Pago / Cobranza Financiera
  const handleSavePayment = async ({ type, entityId, amount, method, endorsedCheckId, receiptNumber, transferRef, checkDetails, notes }) => {
    if (type === 'client') {
      const paymentDate = new Date().toISOString().split('T')[0];
      const newPayment = {
        id: `cp-${Date.now()}`,
        client_id: entityId,
        date: paymentDate,
        amount,
        payment_method: method,
        receipt_number: receiptNumber || '',
        notes: notes || ''
      };

      setDbPaymentsList(prev => [newPayment, ...prev]);

      if (method === 'Cheque Recibido (Cliente)' || method.includes('Cheque')) {
        const clientObj = clientAccounts.find(c => c.id === entityId);
        const newCheck = {
          id: `chk-${Date.now()}`,
          type: 'in_portfolio',
          bank: checkDetails?.bank || 'Banco Galicia',
          checkNumber: checkDetails?.checkNumber || `${Math.floor(10000000 + Math.random() * 90000000)}`,
          issuer: clientObj?.name || clientObj?.clientName || 'Cliente',
          recipient: `${workshopInfo.name || 'El Taller'} / ${workshopInfo.owner || 'Titular'}`,
          dueDate: checkDetails?.dueDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
          amount: amount,
          status: 'A cobrar en cartera',
          originOrderOrNote: `Pago de ${clientObj?.name || clientObj?.clientName} (Recibo: ${receiptNumber || 'S/N'})`
        };
        setChecks(prev => [newCheck, ...prev]);
      } else if (method === 'Efectivo') {
        setCashBalance(prev => ({ ...prev, cashOnHand: prev.cashOnHand + amount }));
      } else {
        setCashBalance(prev => ({ ...prev, bankBalance: prev.bankBalance + amount }));
      }

      // Persistir cobro en Supabase
      if (currentWorkshop?.id) {
        await saveClientPaymentToDb(currentWorkshop.id, {
          entityId,
          date: paymentDate,
          amount,
          method,
          receiptNumber,
          notes
        });
      }
    } else {
      setSuppliers(prev => prev.map(s => {
        if (s.id === entityId) {
          const newDue = Math.max(0, (s.balanceDue || 0) - amount);
          return {
            ...s,
            balanceDue: newDue,
            payments: [{ id: `sp-${Date.now()}`, date: new Date().toISOString().split('T')[0], method, amount, note: notes }, ...(s.payments || [])]
          };
        }
        return s;
      }));

      if (method === 'Efectivo') {
        setCashBalance(prev => ({ ...prev, cashOnHand: Math.max(0, prev.cashOnHand - amount) }));
      } else {
        setCashBalance(prev => ({ ...prev, bankBalance: Math.max(0, prev.bankBalance - amount) }));
      }
    }
  };

  const handleSaveWithdrawal = (withdrawalData) => {
    setWithdrawals(prev => [withdrawalData, ...prev]);
    if (withdrawalData.method === 'Efectivo') {
      setCashBalance(prev => ({ ...prev, cashOnHand: Math.max(0, prev.cashOnHand - withdrawalData.amount) }));
    } else {
      setCashBalance(prev => ({ ...prev, bankBalance: Math.max(0, prev.bankBalance - withdrawalData.amount) }));
    }
  };

  const handleSaveCheck = (checkData) => {
    setChecks(prev => [checkData, ...prev]);
  };

  const handleSaveSupplier = (supplierData) => {
    setSuppliers(prev => [supplierData, ...prev]);
  };

  // Manejador de Login Exitoso
  const handleLoginSuccess = (sessionData) => {
    setUserSession(sessionData);
    localStorage.setItem('workshop_user_session', JSON.stringify(sessionData));

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

  const handleLogout = async () => {
    if (supabase) {
      try { await supabase.auth.signOut(); } catch (e) {}
    }
    setUserSession(null);
    setCurrentWorkshop(null);
    localStorage.removeItem('workshop_user_session');
  };

  const pendingDraftsCount = drafts.filter(d => d.status === 'pending').length;

  if (!userSession) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 flex flex-col font-sans">
      
      {/* Header superior: Diseño Adaptativo para PC y Celulares */}
      <header className="bg-white border-b-2 border-slate-300 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex justify-between items-center gap-3">
          
          {/* Logo del taller dinámico */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {workshopInfo.logoUrl ? (
              <img 
                src={workshopInfo.logoUrl} 
                alt="Logo" 
                className="h-8 sm:h-10 w-auto max-w-[90px] sm:max-w-[120px] object-contain rounded-lg border border-slate-200 p-0.5 bg-white shadow-sm shrink-0" 
              />
            ) : (
              <div className="bg-slate-900 text-amber-400 p-1.5 sm:p-2 rounded-xl shadow-sm flex items-center justify-center font-black text-xs sm:text-sm tracking-wider shrink-0">
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <h1 className="font-black text-slate-950 text-xs sm:text-base tracking-tight truncate">
                  {workshopInfo.name || "Mi Taller"}
                </h1>
                {workshopInfo.owner && (
                  <span className="text-[10px] sm:text-xs text-slate-800 font-bold bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 shrink-0">
                    {workshopInfo.owner}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                {isSyncingCloud ? (
                  <span className="flex items-center gap-1 text-blue-600 font-bold animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Sincronizando con la nube...
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Base de Datos Conectada
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navegación Desktop (Visible sólo en pantallas medianas y grandes) */}
          <div className="hidden md:flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300 shadow-inner">
            <button
              onClick={() => setCurrentView('vehicles')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                currentView === 'vehicles'
                  ? 'bg-white text-slate-950 shadow-md scale-102'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/60'
              }`}
            >
              <Car className="w-4 h-4 text-amber-500" />
              <span>Vehículos</span>
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
              <span>Borradores</span>
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
              <span>Cuentas</span>
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

          {/* Botones de Acción Rápidos */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsAdminWhatsAppOpen(true)}
              className="p-2 sm:px-3 sm:py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-black rounded-xl flex items-center gap-1.5 transition shadow-sm border border-slate-700 shrink-0"
              title="Vincular WhatsApp / Estado de conexión"
            >
              <span>🔐</span>
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={() => setIsAssistantModalOpen(true)}
              className="px-2.5 py-2 sm:px-3.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition shadow-md hover:shadow-lg hover:-translate-y-0.5 shrink-0"
              title="Dictar o cargar notas mecánicas por voz"
            >
              <Mic className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">🎙️ Asistente de Carga</span>
              <span className="sm:hidden font-bold">Dictar</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area con padding inferior adicional en celulares para la barra fija */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 w-full space-y-5 pb-24 md:pb-6">
        
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
            onOpenWhatsAppSimulator={() => setIsAssistantModalOpen(true)}
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
            onOpenClientPayment={handleOpenClientPayment}
            onOpenNewCheck={() => setIsCheckModalOpen(true)}
            onOpenNewWithdrawal={() => setIsWithdrawalModalOpen(true)}
            onOpenNewSupplier={() => setIsSupplierModalOpen(true)}
            onOpenNewClient={() => {
              setSelectedClientToEdit(null);
              setIsClientEditorOpen(true);
            }}
            onOpenEditClient={(cli) => {
              setSelectedClientToEdit(cli);
              setIsClientEditorOpen(true);
            }}
            onOpenClientDetail={(cli) => {
              setSelectedClientDetail(cli);
            }}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            workshopInfo={workshopInfo}
            onSaveWorkshopInfo={handleSaveWorkshopInfo}
            userSession={userSession}
            onLogout={handleLogout}
            vehicles={vehicles}
            suppliers={suppliers}
            clientAccounts={clientAccounts}
            checks={checks}
            withdrawals={withdrawals}
            cashBalance={cashBalance}
            onRestoreBackup={handleRestoreBackup}
            currentWorkshop={currentWorkshop}
          />
        )}

      </main>

      {/* Barra de Navegación Móvil Fija al Pie (Estilo App Nativa para Google Pixel y Smartphones) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t-2 border-slate-300 shadow-[0_-4px_25px_rgba(0,0,0,0.12)] py-2 px-2 flex justify-around items-center">
        <button
          onClick={() => setCurrentView('vehicles')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition text-[11px] font-black relative ${
            currentView === 'vehicles' ? 'text-amber-600 scale-105' : 'text-slate-500'
          }`}
        >
          <Car className="w-5 h-5" />
          <span>Vehículos</span>
          {vehicles.length > 0 && (
            <span className="absolute -top-1 right-2 bg-slate-100 text-slate-800 border border-slate-300 text-[9px] font-bold px-1 rounded-full">
              {vehicles.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentView('drafts')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition text-[11px] font-black relative ${
            currentView === 'drafts' ? 'text-emerald-600 scale-105' : 'text-slate-500'
          }`}
        >
          <Inbox className="w-5 h-5" />
          <span>Borradores</span>
          {pendingDraftsCount > 0 && (
            <span className="absolute -top-1 right-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 rounded-full animate-pulse shadow-xs">
              {pendingDraftsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentView('finances')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition text-[11px] font-black ${
            currentView === 'finances' ? 'text-blue-600 scale-105' : 'text-slate-500'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span>Cuentas</span>
        </button>

        <button
          onClick={() => setCurrentView('settings')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition text-[11px] font-black ${
            currentView === 'settings' ? 'text-slate-900 scale-105' : 'text-slate-500'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Ajustes</span>
        </button>
      </nav>

      {/* Footer Desktop */}
      <footer className="hidden md:block border-t-2 border-slate-300 bg-white py-4 text-center text-xs text-slate-500 font-bold">
        Sistema de Control Integral para Taller Mecánico • {workshopInfo.name || 'Mi Taller'} {workshopInfo.owner ? `de ${workshopInfo.owner}` : ''}
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

      <MechanicAssistantModal
        isOpen={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
        existingVehicles={vehicles}
        onNewDraftCreated={handleNewDraftCreated}
        onOpenOrderDirectly={handleOpenEditorWithDraft}
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
        initialEntityId={preselectedClientId}
        onClose={() => {
          setPaymentModalConfig({ isOpen: false, type: 'client' });
          setPreselectedClientId(null);
        }}
        suppliers={suppliers}
        clientAccounts={clientAccounts}
        checks={checks}
        onSavePayment={handleSavePayment}
      />

      {/* Modales de CRM, Cuentas Corrientes y Clientes */}
      <ClientDetailModal
        isOpen={Boolean(selectedClientDetail)}
        onClose={() => setSelectedClientDetail(null)}
        client={selectedClientDetail}
        onOpenPayment={(cli) => {
          setSelectedClientDetail(null);
          handleOpenClientPayment(cli);
        }}
        onEditClient={(cli) => {
          setSelectedClientDetail(null);
          setSelectedClientToEdit(cli);
          setIsClientEditorOpen(true);
        }}
        onSelectVehicle={(veh) => {
          setSelectedClientDetail(null);
          handleSelectVehicle(veh);
        }}
        workshopInfo={workshopInfo}
      />

      <ClientEditorModal
        isOpen={isClientEditorOpen}
        onClose={() => {
          setIsClientEditorOpen(false);
          setSelectedClientToEdit(null);
        }}
        client={selectedClientToEdit}
        onSaveClient={handleSaveClient}
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
