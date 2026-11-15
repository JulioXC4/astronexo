# Integración de pixel art

Rama `codex/game-assets-integration`, basada en `origin/develop` con RF-69.

Los PNG bajo `public/assets/pixel-art/` provienen de la colección entregada en `D:\Julio\Hackatones\Nasa\assets`. La portada anterior continúa en `public/assets/backgrounds/earth/welcome-concept.png` como respaldo. La lógica de misiones y del motor no cambia.

- Portada: academia al atardecer; logo y botones siguen en React.
- Mapas: escenarios separados de los hotspots. Arequipa usa cinco sprites; Tromsø usa los sprites de reserva de energía, clima espacial, soporte vital y bio-módulo. El invernadero ártico conserva el SVG existente porque no hay un sprite propio para esa misión.
- Avatares y briefing: Alba, Leo, Aurora y Nico usan sus sprites; Chispa conserva su SVG. El briefing usa el interior de academia con texto y controles React.
- Guardia lunar: sala de control de fondo y cinco interiores de cámaras. Estados activo, apagado, suspendido y advertencia siguen calculándose en React.

`Aurora Over Arctic Research Base.png` ya incluye un gran edificio y no tiene cinco plataformas vacías. El mapa interactivo usa `Arctic Aurora Research Base.png`, que coincide con la distribución de Arequipa. `Arctic Aurora Observatory Sprite.png` y `Arctic Radar Research Station.png` no corresponden de forma segura a las misiones de Tromsø y quedan sin asignar. `Empty Resource Pixel HUD.png` y `Pixel-Art Astronaut Status Monitor.png` requieren una composición específica que mantenga barras y valores dinámicos; el HUD actual conserva esa funcionalidad.
