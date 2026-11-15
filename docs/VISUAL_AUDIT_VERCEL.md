# Auditoría visual de Astronauta Junior

Fecha: 2026-11-15  
Despliegue revisado: https://astronexo-kxgw.vercel.app/  
Rama: `codex/vercel-visual-polish`, creada desde `origin/develop` (`3627bb5`).  
Verificación del despliegue: `origin/main` y `origin/develop` tienen el mismo árbol Git (`8d77009`). El HTML publicado carga `game-B9W3R5Wf.js`, distinto del bundle de la build local; el despliegue usa el mismo código fuente, aunque fue compilado en una build distinta.

## Recorrido y hallazgos

| Etapa | Estado observado | Evidencia |
|---|---|---|
| Portada | Fondo pixel art, marca y acciones visibles. | [Antes](qa/vercel-before-01-welcome.png) |
| Selección de ciudad | Ilustración se llamaba “Mapa Satelital Global NASA POWER”; coordenadas técnicas ocupaban espacio inicial. | [Antes](qa/vercel-before-02-city.png), [después](qa/vercel-after-02-city.png) |
| Destino | Arequipa → Luna funciona; pantalla clara, con bastante texto técnico para niños. | [Antes](qa/vercel-before-03-destination.png) |
| Avatar | Cuatro sprites visibles y selección legible. | [Antes](qa/vercel-before-04-avatar.png) |
| Briefing | Personajes, escenario y botones React visibles; el diálogo es extenso. | [Antes](qa/vercel-before-05-briefing.png) |
| Mapa Arequipa | Cinco hotspots responden. Las etiquetas se superponían con edificios y unas con otras. Separé el nombre del hotspot en una leyenda interactiva, manteniendo posición y estado de cada instalación. | [Antes](qa/vercel-before-06-arequipa-map.png), [después a 1024×768](qa/vercel-after-06-arequipa-map.png) |
| Minijuegos | Se completaron Detective Solar, Cámara Hipobárica y Veggie; sliders, botones de calibración y sellos actualizaron el estado. | [Solar antes](qa/vercel-before-07-solar-game.png) |
| Despegue y llegada | Se completaron las tres misiones y se transfirieron sus kits; navegación a órbita y recepción de datos llegó a la base lunar. | [Mapa con tres misiones](qa/vercel-before-08-map-complete.png), [despegue](qa/vercel-before-09-launch.png), [llegada](qa/vercel-before-10-arrival.png) |
| Constructor | Tres espacios y requisitos eran claros, pero las tarjetas pequeñas no mostraban instalaciones. Añadí vistas interiores lunares y mejoré tamaño de texto y controles. | [Antes](qa/vercel-before-11-builder.png), [después](qa/vercel-after-11-builder.png) |
| Consola y cámaras | Alertas y acciones funcionaban, pero costos, alertas y textos de cámara estaban entre 0.55 y 0.75 rem. Aumenté jerarquía y tamaño de cámara; creé una escena de señal marciana separada de los fondos lunares. | [Consola antes](qa/vercel-before-14-control-full.png), [intervención antes](qa/vercel-before-15-intervention.png) |
| Informe / retorno a Tierra | No se alcanzó en esta sesión del navegador; queda pendiente revisión visual interactiva. | Sin captura |

La consola mostró un error 404 de `/favicon.ico` en local y Vercel, sin errores de React/Vite ni recursos visuales faltantes. Se registró, pero no se cambió el favicon porque no es parte del objetivo visual prioritario.

## Cambios implementados

- Cambié el título de ciudad a “Elige tu base terrestre”, añadí la nota “Escenario ilustrado” y moví coordenadas a un disclosure. El panel deja explícito que los datos solares proceden de NASA POWER.
- Quité los rótulos que tapaban los edificios en el mapa. La leyenda conserva selección, completado, bloqueo y permite seleccionar cada misión; los hotspots y callbacks originales siguen intactos.
- Las cámaras de Marte usan una señal ambiental provisional en tonos marcianos, sin reutilizar fondos lunares. Los cinco interiores lunares ahora se centralizan en `src/assets/moduleScenes.ts`.
- El constructor presenta vistas previas de cada módulo y fondos en espacios ocupados en Luna, con mejores tamaños de tipografía y objetivos de foco visibles. La regla de elegir tres módulos permanece en el estado/componente existente.
- Aumenté tamaños de lectura para barras, alertas, telemetría, cámaras, costos e informe espacial.
- Amplié el área visual de las escenas SVG de entrenamiento para aprovechar el panel.

## Assets reutilizados y pendientes

Reutilicé los interiores ya presentes para energía, soporte vital, refugio, invernadero y laboratorio lunar. La señal de Marte es una composición CSS temporal; hacen falta cinco interiores marcianos con perspectiva y escala consistentes. Los sprites del mapa y personajes existentes permanecen sin cambios.

No se generaron imágenes nuevas. Tampoco se cambiaron motor, costos RF-69, datos NASA, recompensas, contratos ni condiciones de misión.

## Responsive y accesibilidad

Capturas comprobadas a 1280×720, 1366×768 y 1024×768. La leyenda del mapa pasa de tres columnas y dos filas; a 1024 px el mapa y panel lateral permanecen visibles sin desplazamiento horizontal. `EarthBaseScene` mantiene controles accesibles por teclado y ratón. Las reglas existentes de movimiento reducido siguen activas.

768×1024 y 1920×1080 no se verificaron en navegador durante esta sesión. La navegación Tromsø → Marte, intervención completa con cierre de cinco turnos, informe final y regreso a Tierra también quedan pendientes de revisión manual.

## Pruebas

- `pnpm typecheck`: pasó.
- `pnpm test`: pasó, 15 verificaciones de contrato terrestre y 87 pruebas Vitest.
- `pnpm build`: pasó.
- Flujo manual local: entrada → ciudad → Luna → avatar → briefing → minijuegos Solar/Altitud/Veggie → tres recompensas → despegue → llegada → constructor.
- Navegador local: URL y título coinciden, la app no está vacía ni muestra overlay de framework. Un error de consola: `/favicon.ico` 404.

## Archivos modificados

- `src/features/earth/screens/CitySelectionScreen.tsx`
- `src/features/earth/screens/earth.css`
- `src/visual-kit/EarthBaseScene.tsx`
- `src/visual-kit/earth-base-scene.css`
- `src/features/base-builder/BaseBuilderView.tsx`
- `src/features/base-builder/base-builder.css`
- `src/assets/moduleScenes.ts`
- `src/features/mission-control/ModuleCameras.tsx`
- `src/features/space/space-game.css`
- `docs/VISUAL_AUDIT_VERCEL.md`
- Capturas `docs/qa/vercel-before-*.png` y `docs/qa/vercel-after-*.png`.

## Siguiente revisión

Capturar Tromsø y Marte, confirmar las cámaras marcianas y completar la intervención hasta el informe final en escritorio y tablet. Luego integrar mediante PR a `develop`.
