# Design QA — bienvenida de Astronauta Junior

- **Verdad visual:** opción 1 elegida por el usuario, imagen original de ImageGen en `/home/o1101ol/.codex/generated_images/01a1db3a-a39f-7ae3-82cc-c822c5c1eb4f/exec-b758f156-cedd-46c7-a72a-49ecfb67ab6b.png` (1487×1058 px). Copia normalizada: `docs/qa/welcome-reference-normalized.jpg` (1440×1024 px).
- **Implementación capturada:** `docs/qa/welcome-desktop.png` (1440×1024 px) y `docs/qa/welcome-mobile.png` (390×844 px).
- **Comparación conjunta:** `docs/qa/welcome-comparison.jpg` (2880×1024 px; referencia a la izquierda, implementación a la derecha). Región de título y controles: `docs/qa/welcome-controls-comparison.jpg` (2880×504 px).
- **Viewport y estado:** escritorio 1440×1024 CSS px, densidad 1; ambas vistas en bienvenida inicial, sin panel abierto. La referencia se redimensionó de 1487×1058 a 1440×1024; las proporciones son casi idénticas. Móvil 390×844 CSS px, densidad 1, bienvenida inicial.

## Hallazgos y comparación

En la comparación final no hay diferencias P0, P1 ni P2 accionables. La escena, las proporciones del título, la jerarquía del botón principal y la ubicación de las acciones secundarias conservan la composición de la opción 1. En móvil no se ocultan controles ni aparece desplazamiento horizontal.

| Superficie requerida | Evidencia final |
|---|---|
| Tipografía | El wordmark conserva el estilo ilustrado; Fredoka en botones y Nunito en paneles mantienen lectura clara. El título existe como `h1` para lectores de pantalla. |
| Espaciado y proporción | El título queda sobre la roca oscura y los tres botones quedan en la franja inferior. La comparación enfocada muestra separación y tamaños cercanos a la referencia. |
| Color | Amarillo cálido para «Jugar ahora», azul oscuro y borde cian para acciones secundarias; contraste suficiente sobre la escena. |
| Imágenes | El escenario y wordmark son assets PNG individuales generados para esta pantalla; no se sustituyeron por dibujos CSS/SVG. La ilustración omite emblemas y banderines decorativos presentes en el mock. |
| Texto | «Astronauta Junior», «De tu cielo a otros mundos», «Jugar ahora», «Modo Estación» y «Fuentes científicas» aparecen completos y en español. Los paneles distinguen maqueta y fuentes de funciones implementadas. |

**P3 pendiente:** el wordmark conceptual presenta pequeños puntos de alfa al ampliarlo; no afectan su lectura sobre la roca, pero diseño debe entregar un PNG limpio. Los emblemas y banderines del edificio no se reprodujeron en el fondo limpio. El botón amarillo tiene un relleno más plano que el mock; es aceptable hasta recibir la dirección final de diseño.

## Historial de correcciones

1. Primera revisión de escritorio en navegador: el título y botón principal estaban unos 20–30 px bajos y las acciones secundarias quedaban demasiado separadas. Se ajustaron el padding inferior, la altura del botón principal y el ancho de los secundarios en `welcome.css`.
2. Segunda revisión conjunta: la ubicación mejoró; en anchos intermedios, los anchos fijos podían forzar desbordamiento. Se añadió un tramo fluido entre 1001 y 1399 px. La captura final de 1440×1024 y la revisión en navegador a 1280×720 muestran los tres controles completos.
3. Revisión móvil final a 390×844: la ilustración se recorta hacia los personajes, y título y botones permanecen visibles. No quedaron hallazgos P0/P1/P2.

## Comportamiento verificado

- «Jugar ahora» abre la selección temporal; al quitar una herramienta, el envío se deshabilita, y vuelve a habilitarse al escoger tres distintas.
- La configuración llega a Espacio y `NOT_PLAYED` vuelve a App; el regreso muestra nuevamente la bienvenida.
- «Modo Estación» y «Fuentes científicas» abren paneles. Escape los cierra y devuelve el foco; Shift+Tab desde «Cerrar» permanece dentro del panel.
- El navegador integrado no reportó errores de consola durante esta revisión. `pnpm build` compila; no hay prueba automática de juego ni misión lunar implementada.

**Open Questions:** el equipo de diseño debe confirmar arte definitivo, limpieza del wordmark y créditos finales. La preparación terrestre y la guardia lunar siguen siendo pantallas temporales.

**Implementation Checklist:** sustituir los dos conceptos desde `src/assets/manifest.ts` cuando diseño entregue archivos; continuar con el corte lunar sin cambiar el callback Tierra→App→Espacio.

final result: passed
