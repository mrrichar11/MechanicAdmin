-- ==============================================================
-- SCRIPT PARA REGISTRAR AL TALLER DE IVÁN LUQUE EN SUPABASE
-- ==============================================================

-- Opción 1 (Recomendada):
-- Ve a tu panel de Supabase -> Authentication -> Users -> Add User -> Create user:
-- Email: ivanluque334@gmail.com
-- Password: Luque2026!
-- Auto Confirm: YES

-- Opción 2: Si quieres insertar el registro de su taller en la tabla workshops:
INSERT INTO public.workshops (name, owner, address, phone, email, cuit, tax_rate, default_labor_cost)
VALUES (
  'Bosch Car Service',
  'Iván Luque',
  'Dentesano 61, Sunchales, Santa Fe',
  '03493-423274 / 15403364',
  'ivanluque334@gmail.com',
  '20-22445588-4',
  21,
  150000
)
ON CONFLICT DO NOTHING;
