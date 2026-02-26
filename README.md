# Mi Taller v1.1.1

Sistema de gestion interna para trabajos de reparacion (PCs, notebooks, impresoras, etc.).
Disenado especialmente para uso en PC y telefonos moviles, asegurando que no se olviden entregas ni detalles de cada trabajo.

## Tecnologias

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres + API)
- Deploy recomendado: Vercel

## Persistencia

La app usa Supabase de forma obligatoria para listar, crear y actualizar trabajos.
Si faltan `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`, la app muestra error de configuracion y no usa mocks.

## Como ejecutar localmente

1. Instalar dependencias:

```bash
npm install
```

2. Copiar variables de entorno:

```bash
cp .env.example .env.local
```

3. Completar `.env.local` con tus valores de Supabase.

4. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

5. Abrir en el navegador:

`http://localhost:3000`

## Setup de Supabase

1. Crear un proyecto en Supabase.
2. En el SQL Editor, ejecutar `supabase/schema.sql`.
3. (Opcional) Cargar datos iniciales ejecutando `supabase/seed.sql`.
4. Copiar URL y anon key del proyecto a `.env.local`.

## Deploy a Vercel (staging)

1. Importar el repo en Vercel.
2. En `Settings -> Environment Variables`, agregar:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Hacer deploy de la rama principal o una rama de staging.

## Estructura

- `/src/app`: rutas y paginas (`/login`, `/dashboard`, `/trabajos/[id]`, `/trabajos/nuevo`, `/historial`).
- `/src/lib`: cliente de Supabase, repositorio de trabajos y utilidades (`whatsapp.ts`).
- `/supabase`: esquema SQL y semilla opcional.
