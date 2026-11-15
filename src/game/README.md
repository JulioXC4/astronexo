# Contrato del simulador espacial

El punto de entrada público es `src/game/index.ts`. El motor no importa React, no hace peticiones HTTP y no usa datos NASA sin normalizar.

```ts
import { advanceTurn, applyAction, createMission, getMissionResult } from './game';

let state = createMission({
  mode: 'SOLO',
  city: 'AREQUIPA',
  destination: 'MOON',
  completedEarthMissions: ['M1', 'M4', 'M5'],
  selectedTools: ['SPARE_PARTS_KIT', 'EXTRA_BATTERY', 'WATER_RECYCLER'],
  selectedModules: ['SOLAR_STORAGE', 'STORM_SHELTER', 'SCIENCE_LAB'],
  scenarioId: 'H3_LUNAR_SIMULATED',
  difficulty: 'CALM',
});

state = applyAction(state, { type: 'PATCH_OXYGEN_LEAK' });
state = advanceTurn(state);
const result = getMissionResult(state); // null mientras la guardia sigue activa
```

`createMission`, `applyAction`, `advanceTurn` y `getMissionResult` devuelven objetos nuevos y son deterministas. `advanceTurn` solo avanza después de registrar una intervención o `SKIP_INTERVENTION`. La UI no debe modificar `MissionState` directamente. Los parámetros educativos están centralizados en `src/game/config/`; los datos normalizados que entregue Software 2 se integrarán en H2 mediante un adaptador, sin HTTP dentro del motor.

La interfaz pública canónica es `GameSetup` en `src/game/types`. `createMission()` rechaza configuraciones inválidas. El contrato definitivo que debe enviar Software 2 es:

- `mode`: `SOLO | LOCAL_COOP`; `destination`: `MOON | MARS`; `city`: `AREQUIPA | TROMSO`.
- `completedEarthMissions`: exactamente tres IDs distintos.
- `selectedTools`: exactamente las herramientas ganadas por esas misiones: M1 → `SPARE_PARTS_KIT`, M2 → `EARLY_WARNING`, M3 → `GROW_TRAY`, M4 → `EXTRA_BATTERY`, M5 → `WATER_RECYCLER` en Arequipa o `THERMAL_INSULATION` en Tromsø.
- `selectedModules`: exactamente tres IDs distintos de `SOLAR_STORAGE`, `REINFORCED_LIFE_SUPPORT`, `STORM_SHELTER`, `GREENHOUSE` y `SCIENCE_LAB`.
- `scenarioId`: identificador estable no vacío; `difficulty`: `CALM | ACTIVE | STORMY`.

La victoria requiere cinco turnos seguros **y** `scienceProgress >= SCIENCE_TARGET`. Terminar el turno cinco sin ciencia produce `INTERRUPTED` con causa explícita y puntuación parcial; la categoría científica vale cero hasta cumplir el objetivo.

`MissionState` expone Energía, Oxígeno, Escudo, alimento, exposición, ciencia, eficiencia solar y estado de comunicación. Los eventos son fixtures educativos simulados reproducibles mediante `scenarioId`. G8 admite una consulta por misión: inmediata en Luna y disponible al siguiente turno en Marte.

`src/game/config/modules.ts` es la única fuente de nombres, costos y reglas de módulos. El motor registra cada aplicación en `moduleOperations`, y P14 deriva beneficios/costos solo desde ese historial.

`src/game/contracts` conserva aliases y estructuras legacy únicamente para no romper las pantallas actuales durante la migración de Software 2. `SpaceGame` usa explícitamente `LEGACY_H1_DEMO` y `createLegacyDemoMission()`; esa excepción solo acepta tres herramientas antiguas y tres módulos válidos. Julio debe retirar ese borde cuando `EarthFlow` entregue el `GameSetup` canónico, sin relajar `createMission()`.
