-- ================================================================
-- ESQUEMA DE BASE DE DATOS SUPABASE PARA SISTEMA DE TALLER MECÁNICO
-- ================================================================

-- 1. Tabla de Talleres / Usuarios (Multi-tenant)
CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Mi Taller Mecánico',
  owner TEXT NOT NULL DEFAULT 'Titular Taller',
  address TEXT DEFAULT 'Calle Principal 123',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  cuit TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  tax_rate NUMERIC DEFAULT 21,
  default_labor_cost NUMERIC DEFAULT 150000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Vehículos
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  plate TEXT NOT NULL,
  model TEXT NOT NULL,
  client_type TEXT DEFAULT 'particular', -- 'fleet' o 'particular'
  client_name TEXT NOT NULL,
  cuit_dni TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  vin TEXT DEFAULT '',
  engine TEXT DEFAULT '',
  injection_system TEXT DEFAULT 'Bosch',
  current_km BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Órdenes de Trabajo / Visitas Técnicas (Equivalente a Hoja 1, Hoja 2...)
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  invoice_number TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  km BIGINT NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'Completado',
  tasks JSONB DEFAULT '[]'::jsonb,      -- Array de strings de tareas realizadas
  parts JSONB DEFAULT '[]'::jsonb,      -- Array de repuestos {description, brand, unitPrice, qty, isFree}
  labor_cost NUMERIC DEFAULT 0,
  tax_rate NUMERIC DEFAULT 21,
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Proveedores (Repuesteras, lubricantes, rectificadoras)
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  rubro TEXT DEFAULT 'Repuestos',
  cuit TEXT DEFAULT '',
  balance_due NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Cheques (En cartera, emitidos, endosados a terceros)
CREATE TABLE IF NOT EXISTS checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL DEFAULT 'in_portfolio', -- 'in_portfolio', 'issued', 'endorsed'
  bank TEXT NOT NULL,
  check_number TEXT NOT NULL,
  issuer TEXT NOT NULL,
  recipient TEXT NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'A cobrar en cartera',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de Retiros Personales del Dueño
CREATE TABLE IF NOT EXISTS owner_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  concept TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'Efectivo',
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de Clientes (CRM, Facturación Fiscal & Condiciones Comerciales)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                             -- Razón Social / Nombre y Apellido
  contact_person TEXT DEFAULT '',                 -- Encargado / Chofer / Responsable
  client_type TEXT DEFAULT 'particular',          -- 'particular' o 'fleet' (flota)
  tax_id TEXT DEFAULT '',                         -- CUIT / CUIL / DNI
  tax_category TEXT DEFAULT 'Consumidor Final',   -- 'Responsable Inscripto', 'Monotributo', 'Exento', 'Consumidor Final'
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  province TEXT DEFAULT '',
  postal_code TEXT DEFAULT '',
  payment_term_days INT DEFAULT 0,                -- Días de plazo de pago (0=Contado, 15, 30, 60)
  credit_limit NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabla de Cobranzas / Pagos Recibidos de Clientes
CREATE TABLE IF NOT EXISTS client_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'Efectivo', -- 'Efectivo', 'Transferencia', 'Cheque'
  check_id UUID REFERENCES checks(id) ON DELETE SET NULL,
  receipt_number TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- Cada taller solo puede ver y editar sus propios datos
-- ================================================================

ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workshops access own data" ON workshops
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Vehicles access own workshop" ON vehicles
  FOR ALL USING (workshop_id IN (SELECT id FROM workshops WHERE user_id = auth.uid()));

CREATE POLICY "Work orders access own workshop" ON work_orders
  FOR ALL USING (workshop_id IN (SELECT id FROM workshops WHERE user_id = auth.uid()));

CREATE POLICY "Suppliers access own workshop" ON suppliers
  FOR ALL USING (workshop_id IN (SELECT id FROM workshops WHERE user_id = auth.uid()));

CREATE POLICY "Checks access own workshop" ON checks
  FOR ALL USING (workshop_id IN (SELECT id FROM workshops WHERE user_id = auth.uid()));

CREATE POLICY "Withdrawals access own workshop" ON owner_withdrawals
  FOR ALL USING (workshop_id IN (SELECT id FROM workshops WHERE user_id = auth.uid()));

CREATE POLICY "Clients access own workshop" ON clients
  FOR ALL USING (workshop_id IN (SELECT id FROM workshops WHERE user_id = auth.uid()));

CREATE POLICY "Client payments access own workshop" ON client_payments
  FOR ALL USING (workshop_id IN (SELECT id FROM workshops WHERE user_id = auth.uid()));
