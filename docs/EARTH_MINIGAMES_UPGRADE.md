# Minijuegos de la Tierra: mejora de tres entrenamientos

Detective del Sol, Operación Refugio (tormenta solar) y Nubes y soles ahora comparten el enfoque del mapa y de la selección de astronauta: el escenario pixel art ocupa toda la pantalla y la interfaz flota encima. No cambió ninguna regla, costo, recompensa ni dato NASA.

Capturas antes/después: `docs/screenshots/earth-minigames-upgrade/`.

## Estructura común

`src/features/earth/minigames/ui/MinigameShell.tsx` + `minigame-ui.css`:

- HUD (volver, título, idioma) y tarjetas flotantes, con el mismo estilo del mapa.
- Escenario escalable: reutiliza `computeSceneLayout` (`src/visual-kit/earthMapLayout.ts`) con una zona segura por juego. Las coordenadas de los elementos son porcentajes del lienzo 1000 × 563 y `--u` da los píxeles por unidad lógica, así que los elementos siguen alineados con el fondo en cualquier resolución.
- `reserveTop` / `reserveBottom` reservan el espacio de la interfaz flotante para que no tape el escenario (hoja inferior en tabletas y móviles).
- Sin emojis; los textos nuevos están en i18n (en/es).

## Operación Refugio (`SolarWatchGame.tsx`)

El cuarto blindado (`airlock-refuge.png`) es el tablero. Se tocan los elementos reales: la baliza de alarma, a cada astronauta (abre el menú de rutas, que ya no muestra siempre "libre" arriba: el orden se baraja), la energía de respaldo, la compuerta y la antena de telemetría; los paquetes de datos se recogen en la consola. La tripulación camina al refugio, la compuerta muestra su bloqueo, la antena un escudo, y la llegada de la CME es una onda de luz con sacudida. Con movimiento reducido todo es inmediato. Acciones restantes en pips. La lógica es `solarStormLogic.ts`, sin cambios.

## Detective del Sol (`SolarDetectiveGame.tsx`)

La sala del observatorio es el escenario: ventana con el edificio, que pasa de día a noche y amanecer; haz de luz que sigue el panel; conducto que se enciende al cerrar el circuito. Orientación con cuatro ángulos y deslizador a la vista (antes estaba oculto); el reparto de energía y la noche viven en un panel inferior único que cambia con la fase. Los botones + y − por sistema se suman a tocar las celdas. La lógica es `solarEnergy.ts`, sin cambios.

## Nubes y soles (`CloudsSunsGame.tsx`)

Tres cielos pixel art donde las nubes tapan el Sol según lo que el día pierde frente al mejor día (dato NASA POWER de la ciudad), sobre el fondo de la base. La reserva es un medidor de 20 celdas, con botones +/− y el deslizador. Tras probar, el medidor marca lo que piden los datos. Las funciones `recommendedReservePercent` y `reserveMismatch` no cambiaron.

## Pruebas

- `tests/e2e/helpers.mjs`: los helpers de Detective del Sol y de la tormenta seguían apuntando a pantallas antiguas. Actualizados; `e2e-all-routes.mjs` completa las cuatro rutas (bienvenida → informe).
- Reserva de Detective del Sol: el juego la calcula (≈58 %, costo 1), por lo que la opción `reserve` del helper ya no tiene efecto.
