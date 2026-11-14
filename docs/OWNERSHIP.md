# Propiedad de módulos

| Responsable | Archivos propios | Primer entregable |
|---|---|---|
| Julio | `src/game/core/**`, `src/game/missions/**`, `src/features/space/**` y pruebas dentro de esos módulos | Guardia lunar de cinco turnos con dos alertas simultáneas, consecuencias y resultado |
| Gaby | `src/features/earth/**`, `src/features/nasa/**`, `src/data/nasa/**` y pruebas dentro de esos módulos | Adaptadores POWER/DONKI verificables y flujo terrestre mínimo |
| Diseño | `public/assets/**` | Recursos con IDs del manifiesto, tamaños, procedencia y licencia |
| Integración (Julio inicialmente) | `src/app/**`, `src/game/contracts/**`, `src/assets/manifest.ts`, `src/styles/**`, `src/main.tsx`, `index.html`, `package.json`, configuración global y `docs/**` | Revisar PRs, mantener contratos y build |

Nadie edita archivos protegidos al mismo tiempo. Un cambio de contrato se propone en el PR de cada módulo y se integra en un paso coordinado por el responsable de integración. Los archivos `.gitkeep` solo conservan carpetas vacías; cada responsable puede quitarlos al agregar código.

Los documentos de equipo de Drive no estaban en el repositorio durante esta preparación. Este reparto sigue el brief suministrado y debe confirmarse con el equipo.
