# Astronauta Junior: De tu cielo a otros mundos

Videojuego educativo 2D sobre la preparación de una expedición y la gestión de una base en la Luna o Marte. Esta versión de `develop` reúne el flujo terrestre de Software 2, sus recursos visuales y el motor espacial de Gaby (Software 1). La portada actual se mantiene.

## Ejecutar y verificar

Requiere Node.js 20.19+ y pnpm.

```bash
pnpm install
pnpm dev
```

Abre la URL local que muestra Vite (normalmente `http://localhost:5173/`). Para verificar el proyecto:

```bash
pnpm typecheck
pnpm test
pnpm build
```

`pnpm test` ejecuta las pruebas terrestres y las de `tests/game/`.

## Recorrido individual disponible

**Bienvenida → ciudad → destino → avatar y alias → briefing → mapa terrestre → tres entrenamientos → despegue → llegada → constructor de base → guardia espacial → informe → regreso/reinicio.**

- **Tierra:** Arequipa o Tromsø, Luna o Marte, cinco instalaciones por ciudad y exactamente tres misiones completables. Cada minijuego exige una interacción funcional antes de conceder su kit. El mapa, los retratos y varias escenas de entrenamiento usan ilustraciones SVG integradas.
- **Espacio:** `SoloSpaceGame` abre el constructor para elegir tres de cinco módulos. La guardia gestiona Energía, Oxígeno, Escudo, alertas e intervenciones G1–G8 durante un máximo de cinco turnos. El informe muestra el desenlace, puntuación, decisiones, costos de módulos y consecuencias.
- **Datos:** la preparación muestra registros históricos verificados de NASA POWER y DONKI. Los valores y eventos del motor espacial son parámetros de una simulación educativa, no mediciones NASA en tiempo real.

## Respaldo científico P0

Los seis valores diarios de `ALLSKY_SFC_SW_DWN` se contrastaron el 15 de noviembre de 2026 con la [API diaria oficial de NASA POWER](https://power.larc.nasa.gov/docs/services/api/temporal/daily/), usando las coordenadas y fechas guardadas en [`powerData.ts`](src/data/nasa/powerData.ts). La unidad de la respuesta es `kW-hr/m^2/day`. Para Arequipa, los valores de 2024-01-20, 2024-06-15 y 2024-02-10 son 5.6028, 5.6455 y 6.174. Para Tromsø, los de 2024-06-21, 2024-03-21 y 2024-12-21 son 3.5702, 1.7194 y 0. Los valores anteriores no coincidían con la API.

El respaldo [NASA DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) conserva dos CME del catálogo M2M del 10 de mayo de 2024: `2024-05-10T07:12:00-CME-001` (análisis de la parte principal, 1018 km/s) y `2024-05-10T21:28:00-CME-001` (primer análisis, 717 km/s). Sus enlaces a los registros figuran en [`donkiData.ts`](src/data/nasa/donkiData.ts). Se retiró la llamarada que tenía ID, hora, enlace y unidad no comprobables. La pantalla de llegada permite abrir el registro original de cada observación.

Las inclinaciones, eficiencias de paneles, costos terrestres, barras, alertas, producción solar lunar/marciana y resultados de protección son **parámetros simulados**. NASA POWER describe la Tierra; no alimenta la producción espacial. El juego usa el respaldo local sin consultas de red ni claves en el cliente. La consulta a Tierra conserva el contrato de Gaby: consume una acción y la única comunicación disponible, sin un cargo adicional de Energía.

La entrada individual oficial está en [`src/features/space/SoloSpaceGame.tsx`](src/features/space/SoloSpaceGame.tsx). [`src/features/space/SpaceGame.tsx`](src/features/space/SpaceGame.tsx) permanece como adaptador antiguo; `GameRouter` ya no lo usa como entrada principal.

## Contrato Tierra → Espacio para Gaby

[`EarthFlow`](src/features/earth/EarthFlow.tsx) entrega a [`GameRouter`](src/app/GameRouter.tsx) un `GameSetup` canónico mediante [`buildEarthV3Setup`](src/features/earth/earthToSpace.ts). Incluye `mode: 'SOLO'`, ciudad, destino, tres misiones terrestres, **exactamente los tres kits ganados**, `selectedModules: []` antes del constructor, `scenarioId` estable y dificultad `ACTIVE`. `earthProfile` conserva avatar, alias y el detalle de entrenamientos. `SoloSpaceGame` completa la selección de módulos y devuelve el `MissionResult` canónico al terminar.

Los IDs M1–M5 son **posiciones del mapa de cada ciudad**; no se equiparan por nombre a las misiones antiguas del motor:

### Costos terrestres RF-69

Cada minijuego conserva la herramienta obtenida y registra la decisión final en `earthProfile.outcomes`. El costo es de **1 o 2 puntos del simulador** sobre la reserva inicial espacial: Energía (Solar, Meses Oscuros, Mirador DONKI, ECLSS e Invernadero Ártico), Oxígeno (Aclimatación) o Alimentos (Veggie). La variante depende del control que el jugador utilizó: porcentaje reservado, distribución térmica, gas empleado, evento CME elegido, potencia ECLSS, mezcla de iluminación o flujo geotérmico, respectivamente. Son parámetros educativos pequeños; no son mediciones NASA ni modifican las reglas planetarias de Gaby.

El adaptador valida que cada resultado corresponda a la misión y al kit ganado. El motor aplica la suma **una vez al crear la guardia**, respeta el límite de 0 a 100 y muestra decisión, costo y beneficio en el informe. El mapa conserva y muestra los resultados al volver de un entrenamiento. Los escenarios H2 anteriores sin resultados terrestres siguen siendo compatibles.

| Posición | Arequipa | Tromsø |
| --- | --- | --- |
| M1 | Detective del Sol → paneles plegables | Meses Oscuros → paneles plegables |
| M2 | Aclimatación de Altura → soporte vital | Invernadero Ártico → cultivos |
| M3 | Mirador de Tormentas → refugio | Mirador de Tormentas → refugio |
| M4 | Soporte Vital ECLSS → soporte vital | Soporte Vital ECLSS → soporte vital |
| M5 | Cultivos Veggie → cultivos | Cultivos Veggie → cultivos |

El adaptador valida la relación entre las misiones terminadas y los kits recibidos. Una combinación legítima puede contener dos kits iguales: se conservan y sus beneficios se acumulan. La validación de los escenarios H2 originales de Gaby sigue siendo independiente. Las reglas están en [`src/game/config/tools.ts`](src/game/config/tools.ts) y sus pruebas de integración en [`tests/game/earth-integration.test.ts`](tests/game/earth-integration.test.ts). Los costos terrestres son descripciones educativas; los costos numéricos de la guardia provienen del motor.

## Estado de verificación y pendientes

Se recorrió en navegador una partida **Arequipa → Luna** con tres entrenamientos, construcción de tres módulos, cinco turnos, interrupción por energía, informe y reinicio. También se comprobó el inicio de **Tromsø → Marte**. Las pruebas del motor incluyen una victoria y una interrupción con configuraciones producidas por Tierra. Hay capturas en [`docs/qa/`](docs/qa/).

Pendiente: recorrer Tromsø → Marte hasta el informe en navegador y pulir la vista de la base espacial. El motor cooperativo de Gaby está incluido, pero la aplicación principal aún ofrece «Modo Estación» como maqueta; el recorrido conectado y verificado es el individual. La validación P0 de esta rama añade pruebas de procedencia NASA, beneficios terrestres, comunicaciones y causa y efecto por barra. Pasaron `pnpm test` (15 pruebas terrestres y 76 del motor), `pnpm typecheck` y `pnpm build`. La revisión adicional de navegador quedó en el minijuego DONKI por un límite de la herramienta de automatización.

Más detalles: [`docs/INTEGRATION.md`](docs/INTEGRATION.md), [`docs/SOFTWARE1_HANDOFF.md`](docs/SOFTWARE1_HANDOFF.md), [`docs/OWNERSHIP.md`](docs/OWNERSHIP.md) y [`docs/ASSET_HANDOFF.md`](docs/ASSET_HANDOFF.md).
