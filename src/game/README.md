# Contrato del simulador espacial

El punto de entrada público es `src/game/index.ts`. El motor no importa React, no hace peticiones HTTP y no usa datos NASA sin normalizar.

```ts
import { advanceTurn, applyAction, createMission, getMissionResult } from './game';

let state = createMission({
  mode: 'SOLO',
  city: 'AREQUIPA',
  destination: 'MOON',
  completedEarthMissions: ['M1', 'M2', 'M3'],
  selectedTools: ['SPARE_PARTS_KIT', 'EXTRA_BATTERY', 'WATER_RECYCLER'],
  selectedModules: [],
  scenarioId: 'H2_LUNAR_SIMULATED',
  difficulty: 'CALM',
});

state = applyAction(state, { type: 'PATCH_OXYGEN_LEAK' });
state = advanceTurn(state);
const result = getMissionResult(state); // null mientras la guardia sigue activa
```

`createMission`, `applyAction`, `advanceTurn` y `getMissionResult` devuelven objetos nuevos y son deterministas. `advanceTurn` solo avanza después de registrar una intervención o `SKIP_INTERVENTION`. La UI no debe modificar `MissionState` directamente. Los parámetros educativos están centralizados en `src/game/config/`; los datos normalizados que entregue Software 2 se integrarán en H2 mediante un adaptador, sin HTTP dentro del motor.

La interfaz pública canónica es `GameSetup` en `src/game/types`. Modela las cinco misiones terrestres como `M1`–`M5` y exige una tupla de tres herramientas. `H2_TOOL_CATALOG` publica los seis identificadores v1.1: `SPARE_PARTS_KIT`, `EARLY_WARNING`, `GROW_TRAY`, `EXTRA_BATTERY`, `WATER_RECYCLER` y `THERMAL_INSULATION`.

`MissionState` expone Energía, Oxígeno, Escudo, alimento, exposición, ciencia, eficiencia solar y estado de comunicación. Los eventos son fixtures educativos simulados reproducibles mediante `scenarioId`. G8 admite una consulta por misión: inmediata en Luna y disponible al siguiente turno en Marte.

`src/game/contracts` conserva aliases y estructuras legacy únicamente para no romper las pantallas actuales durante la migración de Software 2. El adaptador actual todavía entrega `completedEarthMissions: []`; Julio debe enviar tres IDs v3.0 al migrar el flujo terrestre.
