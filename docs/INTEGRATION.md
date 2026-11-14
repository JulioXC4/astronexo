# Integración y primer corte vertical

## Contratos congelados para el primer PR

`EarthFlow.onReady({ setup, nasaData })` entrega un `GameSetup` y un `NasaDataset` a `App`, dueño único de la fase. `App` pasa ambos a `SpaceGame`. `SpaceGame.onFinish(result)` devuelve un `MissionResult` a `App`. Los tipos y callbacks están en `src/game/contracts/`; no importar componentes de un módulo de otro módulo directamente.

La mochila es una tupla de tres IDs distintos del catálogo de cuatro. `isValidBackpack` hace la comprobación en ejecución. `Destination` admite `MOON | MARS`; `AVAILABLE_MISSIONS` expone solo `MOON`. `NasaDataset.validation` distingue registros verificados de datos pendientes. El dataset inicial tiene cero observaciones y nunca se presenta como dato NASA real. `MissionResult.outcome = NOT_PLAYED` identifica exclusivamente la prueba temporal, no una victoria ni un fracaso.

El flujo actual sirve para comprobar la conexión: bienvenida → «Jugar ahora» → escoger tres herramientas → enviar a Espacio → ver los datos recibidos → devolver `NOT_PLAYED` → volver a la bienvenida. «Modo Estación» muestra una maqueta informativa; «Fuentes científicas» enlaza fuentes reales, sin afirmar que ya existan observaciones normalizadas. No es una misión jugable.

## Orden técnico

1. Julio implementa `createMission`, `generateTurnEvents`, `applyAction`, `resolveIgnoredEvents`, `advanceTurn` y `checkMissionResult` sin dependencia de React, con reglas y escalas educativas en configuración. Primer objetivo: cinco turnos lunares, dos alertas concurrentes, una acción que afecta recursos, degradación de alerta ignorada y ambos desenlaces.
2. Julio conecta la guardia lunar a `SpaceGame` conservando `SpaceGameProps` y el retorno tipado. La consola debe mostrar energía, aire y Escudo como preparación del refugio; alimento, exposición y comunicaciones quedan secundarios.
3. Gaby implementa adaptadores de POWER y DONKI con fecha, parámetro, valor, unidad, ID/URL y validación de datos históricos. Mantiene respaldo local solo cuando haya registros comprobados. Entrenamientos T1/T2 y mochila pasan a `EarthFlow` sin cambiar `EarthFlowProps`.
4. Integración comprueba que una selección diferente de tres herramientas modifica opciones o resultados de la misión y que el informe cita datos realmente verificados. Marte permanece «próximamente» hasta completar y probar su campaña.

## Pruebas de módulo y punto de unión

- Julio: probar las funciones puras del motor con un estado fijo para victoria, fracaso y alerta ignorada. Durante el desarrollo usar el `GameSetup` que envía el placeholder terrestre; el primer punto de unión es `SpaceGameProps`.
- Gaby: probar normalización POWER/DONKI con muestras históricas cuya fuente se pueda comprobar y comprobar mochila de tres IDs únicos. Durante el desarrollo, el placeholder espacial permite verificar la entrega con `NasaDataset.validation`.
- En cada PR ejecutar `pnpm typecheck` y `pnpm build`; ejecutar pruebas de módulo cuando existan. No hay suite automática aún.

## Git

El remoto estaba vacío antes del commit inicial del andamiaje. El flujo acordado usa `main` como base estable, `develop` para integración y tres ramas que parten de `develop`: `feat/core-space` (Julio), `feat/earth-nasa` (Gaby) y `feat/assets` (diseño). Cada responsable envía su PR a `develop`; los cambios integrados y verificados pasan después de `develop` a `main`. Proteger `main` y `develop` en GitHub si la configuración del repositorio lo permite. Si ya existen ramas al iniciar una tarea posterior, inspeccionarlas antes de crear otras.

En una misma máquina, con estas ramas ya creadas, usar, por ejemplo, `git worktree add ../astronexo-julio feat/core-space` y `git worktree add ../astronexo-gaby feat/earth-nasa`. Cada persona trabaja en su ruta y evita cambios simultáneos en archivos protegidos. En conflictos, conservar el contrato vigente, adaptar el módulo propio y pedir revisión de integración antes de modificar tipos compartidos. Este documento no autoriza por sí solo nuevos commits, pushes ni merges posteriores.

## Incertidumbres

- No se pudo comparar con `00-PAQUETE-EQUIPO`: no estaba en el repositorio. Confirmar decisiones de alcance y contenido antes de tratarlas como aprobadas.
- El brief separa cuatro herramientas/personajes y propone una Tierra acotada; esta preparación usa el MVP lunar como prioridad técnica, sin resolver esa propuesta como decisión final del equipo.
- Las escalas numéricas del motor y las fuentes históricas concretas aún no están definidas ni verificadas.

## Verificación de este andamiaje (14-11-2026)

- `pnpm install` obtuvo las dependencias. En este entorno, el primer intento sin acceso a red falló con `EAI_AGAIN`; un segundo intento con acceso a red descargó paquetes, y la instalación final offline terminó con código 0. `pnpm-workspace.yaml` desactiva el postinstall de `esbuild` porque el sandbox no permite ejecutar ese binario en esa etapa; Vite sí completó el build.
- `pnpm typecheck`: código 0, sin errores de TypeScript.
- `pnpm build`: código 0; Vite 7.3.8 transformó 38 módulos y generó `dist/index.html`, CSS y JS.
- No hay pruebas de juego todavía: el motor y la campaña lunar siguen pendientes.
