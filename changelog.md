# Changelog

## [1.1.1] - 2026-02-26

### Fix
- **Persistencia real en Supabase (crear/editar/estado)**: altas y actualizaciones de trabajos ahora escriben en DB con errores visibles y logs en consola.
- **Dashboard e Historial leen desde DB sin cache/mocks**: listado unificado desde Supabase ordenado por `created_at` y sin fallback silencioso a datos locales.

## [1.1.0] - 2026-02-26

### Agregado
- **Persistencia cloud con Supabase**: nuevo repositorio de datos para listar, crear y actualizar trabajos en Postgres.
- **Esquema SQL inicial**: archivo `supabase/schema.sql` con tablas, relaciones, RLS y politicas para entorno de staging.
- **Seed opcional**: archivo `supabase/seed.sql` para cargar datos de ejemplo equivalentes al mock local.
- **Variables de entorno versionadas**: nuevo `.env.example` para configuracion de URL y anon key.

### Cambiado
- **Pantallas principales conectadas al repositorio**: `/dashboard`, `/historial`, `/trabajos/nuevo` y `/trabajos/[id]` ahora consumen datos asincronos.
- **Fallback automatico**: si no hay variables de Supabase, la app sigue funcionando con store en memoria.

## [1.0.0] - 2026-02-25

### Agregado
- **Interfaz Glass Sobrio iOS**: Diseño moderno con soporte automático para modo oscuro y claro basado en preferencias del sistema.
- **Micro-animaciones**: Transiciones suaves y efectos de escala al interactuar con cards y botones.
- **Rutas de la Aplicación**:
  - `/login`: UI estática.
  - `/dashboard`: Tablero consolidado y buscador global.
  - `/trabajos/nuevo`: Formulario ágil.
  - `/trabajos/[id]`: Detalle del trabajo, manejo de presupuesto, validaciones de "qué falta" al pasar a en curso.
  - `/historial`: Historial de equipos entregados.
- **Integración WhatsApp**: Generación de link dinámico para avisar cuando el equipo está "Listo" indicando total (materiales + mano de obra).
- **Mocks & Local Store**: Datos de prueba con casos reales y tienda en memoria para navegación local con estado `entregado`, `pendiente`, `en_curso`, `listo`.
- **Alertas de Antigüedad**: Sistema de badges (e.g., "⚠ Listo hace X días") para evitar olvido de equipos.
