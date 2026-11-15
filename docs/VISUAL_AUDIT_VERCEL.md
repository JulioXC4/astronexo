# Auditoría visual de Astronauta Junior

Fecha: 2026-11-15  
Despliegue revisado: https://astronexo-kxgw.vercel.app/  
Rama: `codex/vercel-visual-polish`, creada desde `origin/develop` (`3627bb5`) e integrada con la actualización remota `da8a7c0` (i18n y E2E).  
Al inicio de la auditoría, `origin/main` y `origin/develop` compartían el árbol Git `8d77009`. La URL pública carga `game-B9W3R5Wf.js`, distinto del bundle local; desde entonces `develop` avanzó a `da8a7c0` con i18n y pruebas E2E, cambios que se incorporaron a esta rama.

## Recorrido y hallazgos

| Etapa | Estado observado | Evidencia |
|---|---|---|
| Portada | Fondo pixel art, marca y acciones visibles. | [Antes](qa/vercel-before-01-welcome.png) |
| Selección de ciudad | Ilustración se llamaba “Mapa Satelital Global NASA POWER”; coordenadas técnicas ocupaban espacio inicial. | [Antes](qa/vercel-before-02-city.png), [después](qa/vercel-after-02-city.png) |
| Destino | Arequipa → Luna funciona; pantalla clara, con bastante texto técnico para niños. | [Antes](qa/vercel-before-03-destination.png) |
| Avatar | Cuatro sprites visibles y selección legible. | [Antes](qa/vercel-before-04-avatar.png) |
| Briefing | Personajes, escenario y botones React visibles; el diálogo es extenso. | [Antes](qa/vercel-before-05-briefing.png) |
| Mapa Arequipa | Cinco hotspots responden. Las etiquetas se superponían con edificios y unas con otras. Separé el nombre del hotspot en una leyenda interactiva, manteniendo posición y estado de cada instalación. | [Antes](qa/vercel-before-06-arequipa-map.png), [después a 1024×768](qa/vercel-after-06-arequipa-map.png) |
| Mapa Tromsø | Recorrido confirmado con cinco hotspots. El SVG del invernadero ártico cubría demasiado su plataforma; reduje su escala y ahora queda dentro de ella sin taparla. | [Después a 1920×1080](qa/vercel-after-tromso-map-1920.png) |
| Minijuegos | Se completaron Detective Solar, Cámara Hipobárica y Veggie; sliders, botones de calibración y sellos actualizaron el estado. | [Solar antes](qa/vercel-before-07-solar-game.png) |
| Despegue y llegada | Se completaron las tres misiones y se transfirieron sus kits; navegación a órbita y recepción de datos llegó a la base lunar. | [Mapa con tres misiones](qa/vercel-before-08-map-complete.png), [despegue](qa/vercel-before-09-launch.png), [llegada](qa/vercel-before-10-arrival.png) |
| Constructor | Tres espacios y requisitos eran claros, pero las tarjetas pequeñas no mostraban instalaciones. Añadí vistas interiores lunares y mejoré tamaño de texto y controles. Tras integrar i18n corregí el título del constructor y la etiqueta del botón de guardia. | [Antes](qa/vercel-before-11-builder.png), [Luna](qa/vercel-after-11-builder.png), [Marte 1920×1080](qa/vercel-after-mars-builder-1920x1080.png), [Marte 768×1024](qa/vercel-after-mars-builder-768x1024.png) |
| Consola y cámaras | El flujo Tromsø → Marte llegó a la consola; se seleccionaron tres módulos y se avanzó por las cinco guardias. Las cámaras marcianas muestran la señal ambiental marciana y las alertas, costos, barras y módulos permanecen legibles. | [Consola a 1920×1080](qa/vercel-after-mars-control-1920.png) |
| Informe final | Se alcanzó tras cerrar los cinco turnos y se validaron el resultado, recursos, consecuencias y acciones de reintento/entrega. Se dejó avanzar deliberadamente sin intervenir: el informe muestra “Misión incompleta”, 5/5 turnos y 28/100, como corresponde a esa partida de prueba. | [Escritorio 1920×1080](qa/vercel-after-mars-report-1920x1080.png), [tablet 768×1024](qa/vercel-after-mars-report-768x1024.png) |

La consola mostró un error 404 de `/favicon.ico` en local y Vercel, sin errores de React/Vite ni recursos visuales faltantes. Se registró, pero no se cambió el favicon porque no es parte del objetivo visual prioritario.

## Cambios implementados

- Cambié el título de ciudad a “Elige tu base terrestre”, añadí la nota “Escenario ilustrado” y moví coordenadas a un disclosure. El panel deja explícito que los datos solares proceden de NASA POWER.
- Quité los rótulos que tapaban los edificios en el mapa. La leyenda conserva selección, completado, bloqueo y permite seleccionar cada misión; los hotspots y callbacks originales siguen intactos.
- Las cámaras de Marte usan una señal ambiental provisional en tonos marcianos, sin reutilizar fondos lunares. Los cinco interiores lunares ahora se centralizan en `src/assets/moduleScenes.ts`.
- El constructor presenta vistas previas de cada módulo y fondos en espacios ocupados en Luna, con mejores tamaños de tipografía y objetivos de foco visibles. La regla de elegir tres módulos permanece en el estado/componente existente.
- Aumenté tamaños de lectura para barras, alertas, telemetría, cámaras, costos e informe espacial.
- Amplié el área visual de las escenas SVG de entrenamiento para aprovechar el panel.
- Ajusté el invernadero SVG de Tromsø para mantener visible su plataforma. En el constructor, el título usa la plantilla traducida y el botón de guardia ya tiene etiquetas en inglés y español, sin alterar las reglas de selección.

## Assets reutilizados y pendientes

Reutilicé los interiores ya presentes para energía, soporte vital, refugio, invernadero y laboratorio lunar. La señal de Marte es una composición CSS temporal; hacen falta cinco interiores marcianos con perspectiva y escala consistentes. Los sprites del mapa y personajes existentes permanecen sin cambios.

No se generaron imágenes nuevas. Tampoco se cambiaron motor, costos RF-69, datos NASA, recompensas, contratos ni condiciones de misión.

## Responsive y accesibilidad

Capturas comprobadas a 1280×720, 1366×768 y 1024×768. La leyenda del mapa pasa de tres columnas y dos filas; a 1024 px el mapa y panel lateral permanecen visibles sin desplazamiento horizontal. `EarthBaseScene` mantiene controles accesibles por teclado y ratón. Las reglas existentes de movimiento reducido siguen activas.

Verificación final con Playwright local a 768×1024 y 1920×1080. En ambos tamaños el documento conserva el ancho del viewport (sin desbordamiento horizontal); el informe refluye a una columna en tablet y utiliza dos columnas en escritorio. El constructor también se revisó en ambos tamaños. Se completó el recorrido Tromsø → Marte hasta el informe final, con cinco turnos. La prueba interactiva tomó la opción de no intervenir en todas las guardias para comprobar que las alertas acumulen consecuencias y que se pueda llegar al resultado.

## Pruebas

- `pnpm typecheck`: pasó.
- `pnpm test`: pasó, 15 verificaciones de contrato terrestre y 95 pruebas Vitest en 13 archivos.
- `pnpm build`: pasó.
- Flujo manual local: entrada → ciudad → Luna → avatar → briefing → minijuegos Solar/Altitud/Veggie → tres recompensas → despegue → llegada → constructor.
- Navegador local con Playwright: flujo Tromsø → Marte hasta el informe tras 5/5 turnos; se verificaron pantallas a 768×1024 y 1920×1080 sin overflow horizontal. Un error de consola: `/favicon.ico` 404; no se observaron errores de React ni de recursos de pantalla.

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

La revisión visual del flujo solicitado queda completa. Siguen pendientes como recursos futuros cinco interiores marcianos con arte pixel art propio y la sustitución del favicon 404. El constructor aún conserva algunas etiquetas fijas en español al seleccionar EN/QU/NO; se corrigieron su título y CTA sin ampliar esta tarea a una traducción integral. Nada de esto bloqueó el flujo probado. No se alteraron las reglas del motor, costos RF-69, assets existentes ni contratos.
