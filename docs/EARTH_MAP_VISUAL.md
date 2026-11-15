# Mapa visual terrestre

La pantalla `PreparationMapScreen` usa `EarthBaseScene` desde `src/visual-kit/EarthBaseScene.tsx`. Recibe las cinco misiones, ciudad, selección, misiones completadas, límite y callbacks. La selección, la apertura de misiones y la entrega de herramientas siguen en la pantalla funcional. La escena se puede probar de forma aislada en `/visual-gallery.html`.

## Procedencia

- La portada y su wordmark son los dos PNG conceptuales que ya estaban en `public/assets/`. No se modificaron.
- El PDF `Your paragraph text.pdf` contiene referencias pixel art, personajes y escenas de Canva. La versión adjunta tiene 20 páginas y 43 imágenes incrustadas. Los recortes visibles incluyen fondos, poses y etiquetas; la autoría y el permiso de reutilización de cada imagen no están confirmados. Ninguna imagen del PDF se incorporó al juego.
- El mapa, sus edificios y las variantes de Arequipa y Tromsø son SVG originales escritos para esta rama. No representan instalaciones NASA reales.

## Mapa inmersivo (pantalla completa)

`PreparationMapScreen` muestra el escenario a pantalla completa; el escenario es el menú y la interfaz flota encima. No hay columna fija ni lista inferior de edificios.

- **Encuadre.** `src/visual-kit/earthMapLayout.ts` (`computeSceneLayout`) escala el lienzo lógico 1000 × 563 al contenedor conservando proporciones, como `object-fit: cover`, pero sin recortar nunca la zona segura (cinco edificios y plataforma de lanzamiento). En 16:9 llena el viewport; en 4:3 o vertical reduce la escala y un fondo ambiental desenfocado rellena las franjas libres. Edificios, marcadores y zonas interactivas viven dentro del mismo SVG, así que siguen alineados en todas las resoluciones. Las coordenadas de los edificios (`FACILITY_POSITIONS`) no cambiaron.
- **HUD.** Volver (arriba a la izquierda); base → destino, indicativo y `n/3 entrenamientos` (arriba al centro); ayuda e idioma sin emojis (arriba a la derecha).
- **Instalaciones.** Resaltado, esquinas de selección y tooltip con nombre al pasar el cursor o enfocar con teclado. Clic, toque o Enter/Espacio seleccionan; doble clic abre el entrenamiento. Escape, la X o un clic en el escenario vacío cierran la ficha.
- **Ficha de misión** (`EarthMissionPanel`). Flota a la derecha en escritorio (320–390 px) y es una hoja inferior compacta en ≤ 1200 px o relación ≤ 4:3. Estados: disponible, seleccionada, completada y bloqueada (3/3). El detalle largo (efecto espacial y tu preparación) está en «Más detalles».
- **Entrenamiento completado.** `EarthFlow` pasa `justCompletedId` al volver del minijuego: onda y destellos sobre la instalación y un aviso breve. No cambia la lógica de recompensas ni el progreso.
- **Plataforma de lanzamiento.** Con 3/3 recibe un brillo discreto; el botón de despegue flota abajo al centro.

Los tests de encuadre están en `tests/game/earth-map-layout.test.ts`. La galería (`/visual-gallery.html`) sigue mostrando `EarthBaseScene` dentro de un contenedor 16:9.

## Conexión y reemplazo

Cada instalación se dibuja por `MissionType` y comparte el mismo grupo interactivo. `onSelectMission(id)` selecciona; `onOpenMission(mission)` abre la misión con doble clic o con el botón «Iniciar entrenamiento» de la ficha. Los estados visuales provienen de `completedMissions`, `selectedMissionId` y `missionLimitReached`. El texto completo, la herramienta y el efecto están en el nombre accesible y en el panel de misión existente.

`SolarCircuitVisual` recibe `panelActive`, `switchOn`, `charge`, `circuitComplete` y `tiltAngle`; está conectado a Detective del Sol. `StormShelterVisual` recibe `alert`, `doorClosed`, `crewEvacuated` y `crewSafe`; está conectado a Vigilante del Sol. Las lecturas científicas y los controles funcionales siguen en cada pantalla. Ningún SVG modifica los cálculos NASA ni las reglas de los entrenamientos.

`CharacterPortrait` ofrece variantes SVG originales para Alba, Leo, Aurora, Nico y Chispa, selección y tres expresiones. Se usan en la selección de avatar y en el briefing como sustitutos temporales del arte definitivo. `ToolSprite` sustituye los emojis de los cuatro equipos de la bodega. `CityLandscape` ofrece las variantes de Arequipa y Tromsø en la selección de ciudad. La galería muestra estas piezas y los estados de entrenamiento.

Cuando diseño entregue archivos definitivos, se necesitarán edificios transparentes separados para observatorio, cámara de altura, banco de baterías, invernadero ártico, centro de clima espacial, soporte vital y bio-domo Veggie. Se necesitarán autor, licencia, permiso para el repositorio público, versión, tamaño y escala. Los personajes del PDF requieren archivos originales con transparencia y confirmación de identidad antes de vincularlos a Alba, Chispa, Aurora o Nico.
