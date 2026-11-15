# Propuesta de Adaptación de Contratos V3.0 para Software 1 (Gaby)

**De:** Julio (Software 2 — Flujo Terrestre y Datos NASA)  
**Para:** Gaby (Software 1 — Motor de Simulación Espacial e Integración)  
**Fecha:** 14 de noviembre de 2026  
**Rama:** `feat/software2-earth-flow`  
**Referencia:** Requisitos v3.0, RF-09, RF-10, RF-69 y `docs/INTEGRATION.md`

---

## 1. Contexto y Origen de la Incompatibilidad

En el andamiaje inicial (v1/v2), el equipamiento se seleccionaba mediante una pantalla de checklist (`BackpackScreen`) donde el jugador marcaba 3 casillas de un catálogo de 4 herramientas disponibles. Por esa razón, el contrato en `src/game/contracts/types.ts` definió:

```typescript
export function isValidBackpack(tools: readonly ToolId[]): tools is Backpack {
  const catalogIds = new Set<ToolId>(TOOL_CATALOG.map((tool) => tool.id));
  return tools.length === 3 && new Set(tools).size === 3 && tools.every((tool) => catalogIds.has(tool));
}
```

La restricción `new Set(tools).size === 3` forzaba a que las 3 herramientas fuesen estrictamente distintas.

---

## 2. Incompatibilidad detectada con la Especificación V3.0

En la especificación **v3.0**, el flujo de preparación cambió radicalmente:
1. Las herramientas **no se eligen en una lista pasiva**: se ganan al completar **3 de 5 instalaciones** en el mapa 2D interactivo (`PreparationMapScreen`).
2. Cada ciudad tiene 5 misiones (2 específicas y 3 comunes).
3. Cada misión otorga un beneficio concreto:
   - **Arequipa:**
     - `SOLAR_DETECTIVE` ➔ `FOLDING_PANELS` (Energía)
     - `ALTITUDE_ACCLIMATIZATION` ➔ `LIFE_SUPPORT` (Oxígeno / Sellado)
     - `SOLAR_WATCH` ➔ `SHELTER_KIT` (Escudo / DONKI)
     - `ECLSS_TRAINING` ➔ `LIFE_SUPPORT` (Oxígeno / Regenerativo)
     - `VEGGIE_LAB` ➔ `CROP_KIT` (Alimento / Cultivos)
   - **Tromsø:**
     - `DARK_MONTHS_RESERVE` ➔ `FOLDING_PANELS` (Energía / Noche polar)
     - `ARCTIC_GREENHOUSE` ➔ `CROP_KIT` (Alimento / Bio-refugio)
     - `SOLAR_WATCH` ➔ `SHELTER_KIT` (Escudo / DONKI)
     - `ECLSS_TRAINING` ➔ `LIFE_SUPPORT` (Oxígeno / Regenerativo)
     - `VEGGIE_LAB` ➔ `CROP_KIT` (Alimento / Cultivos)

### El problema:
Si un cadete en Arequipa decide enfocarse en soporte vital y completa:
1. `ALTITUDE_ACCLIMATIZATION` (`LIFE_SUPPORT`)
2. `ECLSS_TRAINING` (`LIFE_SUPPORT`)
3. `SOLAR_WATCH` (`SHELTER_KIT`)

El jugador ha ganado legítimamente: `['LIFE_SUPPORT', 'LIFE_SUPPORT', 'SHELTER_KIT']`.

En la versión anterior del código, para esquivar el fallo de `isValidBackpack`, se ejecutaba un relleno automático desde el catálogo:
```typescript
// CÓDIGO ANTERIOR INCORRECTO:
const unique = Array.from(new Set(derivedTools));
for (const tool of catalog) {
  if (unique.length >= 3) break;
  if (!unique.includes(tool)) unique.push(tool);
}
```
Esto le **regalaba al jugador una herramienta no obtenida** (por ejemplo, `FOLDING_PANELS` o `CROP_KIT`) y descartaba su segundo `LIFE_SUPPORT`. Esto vulneraba la relación causa-efecto del juego y el requisito RF-10.

---

## 3. Estado Actual en Software 2 (Sin Alterar Archivos de Software 1)

Para respetar la propiedad de módulos de Gaby y no romper `types.ts` unilateralmente:
1. **Software 2 ya no regala herramientas.** El estado `backpack` contiene estrictamente las 3 herramientas ganadas por el jugador:
   `const earnedBackpack: Backpack = [derivedTools[0], derivedTools[1], derivedTools[2]];`
2. El tipo TypeScript `Backpack = readonly [ToolId, ToolId, ToolId]` compila perfectamente con herramientas duplicadas.
3. Se conservan intactos los identificadores de misiones completadas, sus costos y sus efectos.
4. Para `completedTraining`, se filtran los entrenamientos compatibles con el enum `TrainingId = 'SOLAR_DETECTIVE' | 'SOLAR_WATCH'`.

---

## 4. Propuestas de Adaptación Conjunta para el Próximo PR

Proponemos a Gaby adoptar una de las dos siguientes soluciones técnicas en `src/game/contracts/`:

### Opción A (Recomendada): Permitir duplicados con acumulación de nivel/efecto
Modificar `isValidBackpack` en `types.ts` para validar que existan exactamente 3 herramientas válidas del catálogo, sin exigir cardinalidad única:
```typescript
export function isValidBackpack(tools: readonly ToolId[]): tools is Backpack {
  const catalogIds = new Set<ToolId>(TOOL_CATALOG.map((tool) => tool.id));
  return tools.length === 3 && tools.every((tool) => catalogIds.has(tool));
}
```
**Impacto en la simulación espacial:**
- Dos `LIFE_SUPPORT` pueden otorgar +20% de reserva de aire inicial o duplicar la velocidad de reparación de fugas.
- Dos `FOLDING_PANELS` pueden duplicar la captación en turnos con sol directo.
- Dos `CROP_KIT` pueden acelerar el abastecimiento de raciones frescas.

### Opción B: Exponer `completedMissions` en `GameSetup`
Extender `GameSetup` para recibir directamente los IDs de las 3 misiones de la base:
```typescript
export interface GameSetup {
  readonly cityId: string;
  readonly avatarId: string;
  readonly fictionalName: string;
  readonly destination: Destination;
  readonly backpack: Backpack;
  readonly completedMissions: readonly MissionType[]; // <-- V3.0
  readonly completedTraining: readonly TrainingId[];
}
```
De esta manera, el motor espacial de Software 1 tiene acceso granular no solo a la herramienta base, sino al contexto específico de la misión completada (ej. si fue aclimatación de altura o reciclaje ECLSS).

---

## 5. Pruebas y Validación

La suite de pruebas de Software 2 (`tests/earth/run-tests.mjs`) incluye:
- Prueba de regresión 5: garantiza que el backpack contiene exactamente las 3 recompensas ganadas, sin herramientas inventadas.
- Prueba base de contratos: mantiene la prueba de compatibilidad con `isValidBackpack` actual para evitar regresiones en el andamiaje existente.
