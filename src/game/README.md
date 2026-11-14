# Contrato del simulador espacial

El punto de entrada público es `src/game/index.ts`. El motor no importa React, no hace peticiones HTTP y no usa datos NASA sin normalizar.

```ts
import { advanceTurn, applyAction, createMission, getMissionResult } from './game';

let state = createMission({
  mode: 'SOLO',
  city: 'AREQUIPA',
  destination: 'MOON',
  selectedTools: ['FOLDING_PANELS', 'LIFE_SUPPORT', 'SHELTER_KIT'],
  selectedModules: [],
  scenarioId: 'H1_LUNAR_TRAINING',
  difficulty: 'CALM',
});

state = applyAction(state, { type: 'PATCH_OXYGEN_LEAK' });
state = advanceTurn(state);
const result = getMissionResult(state); // null mientras la guardia sigue activa
```

`createMission`, `applyAction`, `advanceTurn` y `getMissionResult` devuelven objetos nuevos y son deterministas. La UI no debe modificar `MissionState` directamente. Los parámetros educativos están centralizados en `src/game/config/`; los datos normalizados que entregue Software 2 se integrarán en H2 mediante un adaptador, sin HTTP dentro del motor.
