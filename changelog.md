# Changelog

## [1.1.5] - 2026-02-26

### Cambiado
- **Finanzas: campos por trabajo (precio, materiales, extra)**: se agregan columnas y formularios para cargar `precio_cobrado`, `costo_materiales` y `costo_extra`.
- **Ganancias: cálculo y vista previa en formularios**: se muestra ganancia estimada en alta/edicion y se persiste junto con el estado del trabajo.
- **Inicio: resumen financiero mensual + gráficos compactos**: KPIs del mes y visualizaciones de facturacion/ganancia de ultimos 6 meses integradas en Inicio.
- **Regla: solo entregados cuentan para finanzas**: los agregados financieros consideran exclusivamente trabajos en estado `entregado`.

## [1.1.4] - 2026-02-26

### Cambiado
- **Rediseño completo de Inicio**: nueva composicion minimalista enfocada en decision rapida y lectura inmediata.
- **Eliminación de scroll horizontal**: el bloque de indicadores se organiza en un grid 2x2 fijo en todas las resoluciones.
- **Dashboard KPI siempre visible**: los cuatro KPIs operativos se renderizan en todo momento con numero protagonista.
- **Mejora de microinteracciones**: animaciones fade+scale con stagger y feedback hover/tap mas claro en cards y acciones.
- **UI: botón Nuevo trabajo sin '+' redundante**: en Acciones rapidas se conserva solo el icono junto al texto.
- **UI: tarjetas KPI más legibles (label/valor/icon badge)**: tipografia ampliada, jerarquia reforzada y badge circular glass para iconos.
- **UX: KPIs clickeables navegan a Tablero filtrado**: accesos directos por estado (`activos`, `en_curso`, `listo`) y por antiguedad.
- **Mejora jerarquía visual en KPI Cards**: labels con mayor presencia, composicion icono+titulo horizontal y numero principal mas dominante.
- **Header con navegación más prominente**: `Inicio` y `Salir` pasan a estilo mas visible con mejor contraste y hover refinado.
- **Botón “Ir al Tablero” reforzado visualmente**: mayor padding, borde mas definido y feedback hover consistente con la UI glass.

## [1.1.3] - 2026-02-26

### Cambiado
- **UX: nueva pagina Inicio (resumen operativo)**: se agrega landing en `/` con KPIs diarios sin finanzas, recordatorios y accesos rapidos.
- **UX: changelog accesible desde header**: al tocar "Mi Taller · v1.1.3" se abre modal/sheet animado con el contenido de `CHANGELOG.md`.
- **Motion: transiciones entre rutas**: navegacion con `AnimatePresence` y animaciones de entrada/salida para mejorar continuidad visual.

## [1.1.2] - 2026-02-26

### Cambiado
- **Refinamiento visual glass iOS sobrio**: nuevos tokens de color, bordes, sombras y blur mas suave para mejorar legibilidad sin perder identidad.
- **Jerarquia de cards y chips unificados**: cliente, telefono, equipo, descripcion y bloque "Falta" con mejor espaciado y componente `StatusChip` consistente.
- **Controles estilo iOS**: botones pill con microanimaciones, CTA "Pasar al siguiente estado" con icono de flecha y header mas compacto en mobile.
- **UI: refinamiento glass sobrio**: fondo con gradiente equilibrado, noise minimo y cards con contraste local mas limpio.
- **UX: microinteracciones en botones/chips/cards (hover/tap)**: elevacion suave en desktop, estado pressed en mobile, focus-visible accesible y disabled sin rebote.

## [1.2.0] - 2026-02-26

### Cambiado
- **Migracion a Vite + React (SPA)**: reemplazo completo de Next.js App Router por cliente unico con React Router.
- **Simplificacion de deploy y env vars**: nuevas variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, build output en `dist` y configuracion de Vercel para SPA.
- **Persistencia Supabase visible en Network**: alta, listado y actualizacion de trabajos ejecutan llamadas `rest/v1` desde el navegador sin RSC ni Server Actions.

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
