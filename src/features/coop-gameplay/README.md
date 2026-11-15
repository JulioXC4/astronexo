# Integración H4 · Estación local

Julio puede montar `CoopSpaceGame` desde su navegación E1–E5 sin modificar el motor:

```tsx
<CoopSpaceGame
  setup={canonicalSetup}
  group={localGroup}
  onFinish={(result) => /* navegar con el mismo MissionResult de SOLO */}
/>
```

`setup` usa el `GameSetup` canónico con `mode: 'LOCAL_COOP'`. Si `selectedModules` todavía no contiene tres módulos válidos, el componente abre P10 y completa la configuración antes de llamar a `createMission()`; no se relaja la validación del motor.

`group` usa `LocalCoopConfig`: nombre ficticio de equipo, 3–5 `LocalPlayer`, IDs ficticios únicos, roles según tamaño e índice activo. No contiene datos personales ni modifica recursos. Los contratos, fixtures de 3/4/5 jugadores y `CoopDemo` se exportan desde `src/features/coop-gameplay`.

La confirmación cooperativa solo mantiene `PendingGroupDecision` fuera de `MissionState`. Al confirmar llama una vez a `applyAction`; al cerrar turno llama a `advanceTurn`; P13–P14 reciben el mismo `MissionResult` y la misma puntuación que Despegue.
