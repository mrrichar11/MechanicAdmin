# Guía de Puesta en Vivo Online (Supabase + GitHub + Vercel)

Esta guía detalla los pasos para poner el software de taller mecánico online en producción.

---

## 1. Base de Datos en Supabase (Nube Gratuita)

1. Ingresa a [https://supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Crea un **Nuevo Proyecto** (ej: `taller-mecanico`).
3. Ve a la pestaña **SQL Editor** en el menú lateral izquierdo de Supabase.
4. Abre el archivo [`supabase_schema.sql`](file:///c:/Proyectos/Mecanica/supabase_schema.sql) que está en la raíz de este proyecto, copia todo su contenido y pégalo en el editor de Supabase. Haz clic en **Run**.
   * *Esto creará todas las tablas: talleres, vehículos, órdenes técnicas, proveedores, cheques, cuentas de clientes y retiros con seguridad RLS.*
5. Ve a **Project Settings ➡️ API**:
   * Copia tu **Project URL** (ej: `https://xyzcompany.supabase.co`).
   * Copia tu **Project API Key (anon/public)**.

---

## 2. Configurar el Taller en la App

Puedes ingresar estas credenciales directamente desde la app:
1. Ve a la pestaña **⚙️ Configuración** en la aplicación.
2. En la sección **2. Base de Datos en la Nube (Supabase)** pega la URL y la Anon Key y presiona *Guardar Conexión Supabase*.
3. En la sección **1. Identidad del Taller** puedes modificar el nombre comercial, el titular (Iván Luque), dirección, teléfonos y CUIT. Se actualiza automáticamente en toda la app y en los membretes impresos.

---

## 3. Subir el Código a GitHub

En tu terminal local dentro de la carpeta del proyecto:

```bash
git init
git add .
git commit -m "feat: Sistema de gestion de taller mecanico con integracion whatsapp, finanzas y supabase"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/taller-mecanica.git
git push -u origin main
```

Para crear una nueva versión / release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## 4. Despliegue Online Inmediato en Vercel (100% Gratis)

1. Ingresa a [https://vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **Add New Project** y selecciona tu repositorio `taller-mecanica`.
3. En **Root Directory** selecciona la carpeta `web`.
4. En **Environment Variables** agrega:
   * `VITE_SUPABASE_URL` = (tu URL de Supabase)
   * `VITE_SUPABASE_ANON_KEY` = (tu Anon Key de Supabase)
5. Haz clic en **Deploy**.
6. En 30 segundos tendrás un enlace público como `https://taller-luque.vercel.app` accesible desde cualquier celular, tablet o computadora del taller.
7. Cada vez que hagas un `git push` o un release en GitHub, Vercel actualizará la web en vivo automáticamente.
