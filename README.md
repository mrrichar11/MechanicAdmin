# 🚗 MechanicAdmin - Software Integral de Gestión para Talleres Mecánicos

Sistema SaaS moderno para gestión operativa, técnica y financiera de talleres mecánicos, flotas corporativas y particulares. Incluye integración con **WhatsApp Bot**, transcripción por IA de notas de voz, importador masivo de planillas Excel históricas y base de datos en la nube con **Supabase**.

---

## 🚀 Características Principales

### 1. Ficha Técnica e Historial por Vehículo
* Registro completo de vehículos (Patente, Modelo, Titular, Chasis VIN, Motor, Inyección).
* Soporte nativo para **Flotas de Empresas** (ej. *BHY S.A.*) y **Clientes Particulares**.
* Historial cronológico de visitas técnicas (equivalente a las pestañas *Hoja 1, Hoja 2...* de Excel).
* Impresión y exportación a **PDF oficial con membrete del taller**.

### 2. Bandeja de Borradores de WhatsApp & Notas de Voz (IA)
* Procesamiento de notas de voz y mensajes de WhatsApp enviados por el mecánico desde la fosa o vano motor.
* Extracción automática con IA de: **Patente, Odómetro (KM), Tareas realizadas y Repuestos con marcas**.
* Botón **"⚡ Volcar a Orden de Trabajo"** para crear la orden con 1 clic sin tipear a mano.
* **Área protegida con PIN de Administrador** para salvaguardar la privacidad de los chats personales del dueño.

### 3. Control Integral Contable y Financiero 💰
* **Proveedores:** Cuentas corrientes de repuesteras, lubricentros y tornerías, saldos adeudados y pagos parciales.
* **Cuentas de Clientes:** Saldos deudores de flotas y particulares, cobros parciales en efectivo, transferencia o cheques.
* **Carpeta de Cheques:** Cheques en cartera a cobrar, cheques emitidos propios y cheques de clientes endosados a proveedores.
* **Retiros del Dueño:** Registro de adelantos y retiros personales de caja chica o banco.

### 4. Importador Masivo de Planillas Excel (.xlsx) 📥
* Migración automática de todos los Excels históricos que ya tenga el taller.
* Detección automática de hojas con visitas técnicas y fusión sin duplicados.

### 5. Multi-Tenant y Supabase Ready ☁️
* Arquitectura SaaS preparada para albergar múltiples talleres con **Row Level Security (RLS)**.
* Esquema SQL completo en `supabase_schema.sql`.

---

## 🛠️ Tecnologías

* **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons.
* **Lector Excel:** SheetJS (`xlsx`).
* **Base de Datos & Auth:** Supabase (`@supabase/supabase-js`).
* **Conexión WhatsApp:** Compatible con Evolution API / Baileys.

---

## 💻 Instalación y Uso Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/mrrichar11/MechanicAdmin.git
cd MechanicAdmin/web

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional)
cp .env.example .env

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará corriendo en `http://localhost:5173/`.

---

## 📄 Licencia y Autor
Desarrollado para gestión integral automotriz.
