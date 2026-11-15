# Mapa visual terrestre

La pantalla `PreparationMapScreen` usa `EarthBaseScene` desde `src/visual-kit/EarthBaseScene.tsx`. Recibe las cinco misiones, ciudad, selección, misiones completadas, límite y callbacks. La selección, la apertura de misiones y la entrega de herramientas siguen en la pantalla funcional. La escena se puede probar de forma aislada en `/visual-gallery.html`.

## Procedencia

- La portada y su wordmark son los dos PNG conceptuales que ya estaban en `public/assets/`. No se modificaron.
- El PDF `Your paragraph text.pdf` contiene referencias pixel art, personajes y escenas de Canva. La versión adjunta tiene 20 páginas y 43 imágenes incrustadas. Los recortes visibles incluyen fondos, poses y etiquetas; la autoría y el permiso de reutilización de cada imagen no están confirmados. Ninguna imagen del PDF se incorporó al juego.
- El mapa, sus edificios y las variantes de Arequipa y Tromsø son SVG originales escritos para esta rama. No representan instalaciones NASA reales.

## Conexión y reemplazo

Cada instalación se dibuja por `MissionType` y comparte el mismo grupo interactivo. `onSelectMission(id)` selecciona; `onOpenMission(mission)` abre la misión con doble clic o Enter sobre la selección. Los estados visuales provienen de `completedMissions`, `selectedMissionId` y `missionLimitReached`. El texto completo, la herramienta y el efecto están en el nombre accesible y en el panel de misión existente.

`SolarCircuitVisual` recibe `panelActive`, `switchOn`, `charge`, `circuitComplete` y `tiltAngle`; está conectado a Detective del Sol. `StormShelterVisual` recibe `alert`, `doorClosed`, `crewEvacuated` y `crewSafe`; está conectado a Vigilante del Sol. Las lecturas científicas y los controles funcionales siguen en cada pantalla. Ningún SVG modifica los cálculos NASA ni las reglas de los entrenamientos.

`CharacterPortrait` ofrece variantes SVG originales para Alba, Leo, Aurora, Nico y Chispa, selección y tres expresiones. Se usan en la selección de avatar y en el briefing como sustitutos temporales del arte definitivo. `ToolSprite` sustituye los emojis de los cuatro equipos de la bodega. `CityLandscape` ofrece las variantes de Arequipa y Tromsø en la selección de ciudad. La galería muestra estas piezas y los estados de entrenamiento.

Cuando diseño entregue archivos definitivos, se necesitarán edificios transparentes separados para observatorio, cámara de altura, banco de baterías, invernadero ártico, centro de clima espacial, soporte vital y bio-domo Veggie. Se necesitarán autor, licencia, permiso para el repositorio público, versión, tamaño y escala. Los personajes del PDF requieren archivos originales con transparencia y confirmación de identidad antes de vincularlos a Alba, Chispa, Aurora o Nico.
