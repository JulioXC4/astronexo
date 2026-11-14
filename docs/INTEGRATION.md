# Integración y primer corte vertical

> **Actualización v3.0:** las asignaciones personales y el estado de H1 descritos más abajo quedaron desactualizados. Gaby es Software 1 (motor y experiencia espacial); Julio es Software 2 (flujo terrestre, NASA y aplicación). La interfaz pública canónica del simulador se exporta desde `src/game/index.ts`; `src/game/contracts/` es un adaptador temporal para las pantallas existentes.

## Contratos congelados para el primer PR

`EarthFlow.onReady({ setup, nasaData })` entrega un `GameSetup` y un `NasaDataset` a `App`, dueño único de la fase. `App` pasa ambos a `SpaceGame`. `SpaceGame.onFinish(result)` devuelve un `MissionResult` a `App`. Los tipos y callbacks están en `src/game/contracts/`; no importar componentes de un módulo de otro módulo directamente.

La mochila es una tupla de tres IDs distintos del catálogo de cuatro. `isValidBackpack` hace la comprobación en ejecución. `Destination` admite `MOON | MARS`; `AVAILABLE_MISSIONS` expone solo `MOON`. `NasaDataset.validation` distingue registros verificados de datos pendientes. El dataset inicial tiene cero observaciones y nunca se presenta como dato NASA real. `MissionResult.outcome = NOT_PLAYED` identifica exclusivamente la prueba temporal, no una victoria ni un fracaso.

El flujo actual sirve para comprobar la conexión: escoger tres herramientas → enviar a Espacio → ver los datos recibidos → devolver `NOT_PLAYED` → volver a Tierra. No es una misión jugable.

## Orden técnico

1. Gaby mantiene `createMission`, `applyAction`, `advanceTurn` y `getMissionResult` sin dependencia de React, con reglas y escalas educativas en configuración.
2. Gaby conecta la guardia a `SpaceGame` mediante el adaptador temporal, usando Energía, Oxígeno y Escudo como indicadores principales.
3. Julio implementa los adaptadores POWER/DONKI, las cinco misiones terrestres, la selección de tres herramientas y el flujo global de la aplicación.
4. Integración comprueba que una selección diferente de tres herramientas modifica opciones o resultados de la misión y que el informe cita datos realmente verificados. Marte permanece «próximamente» hasta completar y probar su campaña.

## Pruebas de módulo y punto de unión

- Gaby: probar las funciones puras del motor para victoria, interrupción, reproducibilidad, costos y consecuencias.
- Julio: probar normalización POWER/DONKI, las cinco misiones y la selección de tres herramientas distintas.
- En cada PR ejecutar `pnpm test`, `pnpm typecheck` y `pnpm build`.

## Git

El flujo acordado usa `main` como base estable y `develop` para integración. Las ramas espaciales pertenecen a Gaby y las ramas terrestres/NASA a Julio. Cada responsable envía su PR a `develop`; los cambios integrados y verificados pasan después de `develop` a `main`.

Cada persona trabaja en su rama y evita cambios simultáneos en archivos compartidos. En conflictos, conservar el contrato público de `src/game/index.ts`, adaptar los bordes legacy y coordinar antes de modificar `package.json`, configuración o contratos compartidos.

## Incertidumbres

- No se pudo comparar con `00-PAQUETE-EQUIPO`: no estaba en el repositorio. Confirmar decisiones de alcance y contenido antes de tratarlas como aprobadas.
- El brief separa cuatro herramientas/personajes y propone una Tierra acotada; esta preparación usa el MVP lunar como prioridad técnica, sin resolver esa propuesta como decisión final del equipo.
- Las escalas numéricas del motor y las fuentes históricas concretas aún no están definidas ni verificadas.

## Verificación de este andamiaje (14-11-2026)

- `pnpm install` obtuvo las dependencias. En este entorno, el primer intento sin acceso a red falló con `EAI_AGAIN`; un segundo intento con acceso a red descargó paquetes, y la instalación final offline terminó con código 0. `pnpm-workspace.yaml` desactiva el postinstall de `esbuild` porque el sandbox no permite ejecutar ese binario en esa etapa; Vite sí completó el build.
- `pnpm typecheck`: código 0, sin errores de TypeScript.
- `pnpm build`: código 0; Vite 7.3.8 transformó 38 módulos y generó `dist/index.html`, CSS y JS.
- Esta verificación corresponde al andamiaje histórico; H0 y H1 ya fueron implementados posteriormente.
