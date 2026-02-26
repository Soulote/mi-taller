# Mi Taller v1.2.0

SPA para gestion interna de trabajos de reparacion (PCs, notebooks, impresoras y mas), con UI glass sobria y persistencia real en Supabase.

## Stack

- Vite + React 18 + TypeScript
- React Router (SPA)
- Tailwind CSS
- Supabase (Postgres + REST)

## Variables de entorno

Usar archivo `.env` o `.env.local` con:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Si faltan variables, la app muestra error visible y hace `console.error`.

## Desarrollo local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrir `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

El output de produccion queda en `dist/`.

## Deploy en Vercel

- Framework preset: `Vite` (detectado automaticamente).
- Build command: `npm run build`.
- Output directory: `dist`.
- Environment Variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

Se agrega `vercel.json` con rewrite global a `index.html` para soportar rutas SPA (por ejemplo, acceso directo a `/trabajos/:id`).

## Persistencia Supabase

- Dashboard e historial leen datos con `supabase.from("trabajos").select(...)`.
- Alta de trabajo:
  1. Buscar cliente por telefono.
  2. Crear cliente si no existe (o actualizar nombre si cambio).
  3. Insertar equipo.
  4. Insertar trabajo con `estado = pendiente`.
- Edicion y cambio de estado usan `update(...).eq("id", ...).select("*").single()`.

En Network deben verse requests a `https://<project>.supabase.co/rest/v1/*`.
