# Revisión de galería visual

Capturas del 14 de noviembre de 2026: `visual-gallery-desktop.png` (1440×1000) y `visual-gallery-mobile.png` (390×844). En ambas, las tarjetas, el escenario de respaldo y los controles se leen sin desbordamiento horizontal. Los recursos del PDF aparecen como pendientes por falta de confirmación de derechos y archivos fuente. La galería tiene entrada independiente `/visual-gallery.html`; el juego mantiene `/`.

Verificación: `tsc -b`, `vite build` y `node --test tests/earth/run-tests.mjs` pasaron. El diff no incluye lógica de juego, NASA, misiones ni pantallas activas.
