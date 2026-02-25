# Mi Taller v1.0.0

Sistema de gestión interna para trabajos de reparación (PCs, notebooks, impresoras, etc.).
Diseñado especialmente para uso en PC y teléfonos móviles, asegurando que no se olviden entregas ni detalles ("qué falta") de cada trabajo.

## Tecnologías
- Next.js (App Router)
- TypeScript
- Tailwind CSS (Glassmorphism & Dark Mode)
- Local Mock Data (Sin base de datos real aún)

## Cómo ejecutar localmente

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Abrir en el navegador:
   [http://localhost:3000](http://localhost:3000)

## Estructura
- `/src/app`: Rutas y páginas principales del sistema (`/login`, `/dashboard`, `/trabajos/[id]`, `/trabajos/nuevo`, `/historial`).
- `/src/lib`: Lógica de datos mock (`mockData.ts`, `mockStore.ts`) e integraciones (`whatsapp.ts`).
- `/src/components`: Componentes de UI reutilizables.
