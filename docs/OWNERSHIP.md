# Propiedad de módulos

> **Actualización v3.0:** este archivo contenía el reparto inicial invertido. Gaby es Software 1 y mantiene el motor y la experiencia espacial. Julio es Software 2 y mantiene el flujo terrestre, datos NASA, aplicación y configuración compartida.

| Responsable | Archivos propios | Primer entregable |
|---|---|---|
| Gaby — Software 1 | `src/game/**`, `src/features/space/**`, `src/features/mission-control/**`, `src/features/space-minigames/**`, `src/features/mission-results/**` y `tests/game/**` | Motor espacial, guardia de cinco turnos, consecuencias e informe |
| Julio — Software 2 | `src/app/**`, `src/features/earth/**`, `src/features/nasa/**`, `src/data/**`, navegación y configuración global | Flujo terrestre, cinco misiones, datos NASA normalizados e integración de aplicación |
| Diseño | `public/assets/**` | Recursos con IDs del manifiesto, tamaños, procedencia y licencia |
| Compartido — coordinación previa | `src/game/contracts/**`, `src/assets/manifest.ts`, `src/styles/**`, `src/main.tsx`, `index.html`, `package.json`, configuración global y `docs/**` | Mantener contratos, estilos y build sin romper los módulos de cada responsable |

Nadie edita archivos protegidos al mismo tiempo. Un cambio de contrato se propone en el PR de cada módulo y se integra en un paso coordinado por el responsable de integración. Los archivos `.gitkeep` solo conservan carpetas vacías; cada responsable puede quitarlos al agregar código.

Este reparto reemplaza el reparto invertido del andamiaje inicial.
