# Changelog

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
