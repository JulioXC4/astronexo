# Software 1 → Software 2

## Exports públicos

```ts
import { SoloSpaceGame } from '../src/features/space';
import { CoopSpaceGame } from '../src/features/coop-gameplay';
import type { LocalCoopConfig } from '../src/features/coop-gameplay';
import type { GameSetup, MissionResult, MissionState } from '../src/game';
```

Ambas entradas usan `createMission`, P10–P14 y devuelven el mismo `MissionResult`. No realizan HTTP ni completan datos NASA.

## GameSetup

`mode` debe ser `SOLO` o `LOCAL_COOP`; ciudad y destino deben ser válidos; se requieren tres misiones distintas y exactamente sus herramientas: M1 repuestos, M2 alerta, M3 cultivo, M4 batería y M5 reciclador en Arequipa o aislamiento en Tromsø. También requiere `scenarioId` estable y dificultad.

Antes de P10, `selectedModules` puede ser `[]`. `SoloSpaceGame` y `CoopSpaceGame` abrirán el constructor. `createMission()` sigue exigiendo exactamente tres módulos válidos.

## Despegue

```tsx
<SoloSpaceGame
  setup={{ ...setupFromEarth, mode: 'SOLO' }}
  onFinish={(result: MissionResult) => goToP15(result)}
/>
```

## Estación

```tsx
<CoopSpaceGame
  setup={{ ...setupFromEarth, mode: 'LOCAL_COOP' }}
  group={localGroup satisfies LocalCoopConfig}
  onFinish={(result: MissionResult) => closeCoopFlow(result)}
/>
```

`LocalCoopConfig` contiene un alias ficticio de equipo, 3–5 jugadores con IDs ficticios únicos, roles asignados por posición e índice activo. No incluir nombres reales. Los fixtures `COOP_DEMO_GROUPS` y `COOP_DEMO_SETUP` permiten probar 3, 4 y 5 integrantes.

## Resultado

`MissionResult` incluye desenlace, estado final, puntuación, objetivo científico, decisiones, consecuencias, herramientas, módulos y evidencia de costos/beneficios. La fórmula es idéntica en SOLO y LOCAL_COOP.

## Propiedad

- Gaby: `src/game/**`, `src/features/space/**`, `mission-control`, `space-minigames`, `mission-results`, `base-builder`, `coop-gameplay` y `tests/game/**`.
- Julio: `src/app/**`, `src/features/earth/**`, `src/features/nasa/**`, `src/data/**`, `src/i18n/**`, navegación P1–P9/P15–P17 y E1–E5.

## Pendiente de integración

Julio debe montar las entradas desde sus rutas, conservar el mismo `scenarioId` al reintentar y decidir la navegación posterior a `onFinish`. `SpaceGame` permanece como adaptador legacy temporal para `EarthFlow`; no usarlo en integraciones nuevas.
