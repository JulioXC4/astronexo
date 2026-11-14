# Entrega de assets

Todos los archivos definitivos viven bajo `public/assets/**`. `src/assets/manifest.ts` es el único mapa de IDs a rutas. La mayoría de los `path` siguen en `null` y tienen etiqueta/color de respaldo. Dos rutas de la bienvenida apuntan a **arte conceptual temporal generado con IA**, no a assets finales: `background.earthWelcome` y `ui.welcomeWordmark`. Integración modifica el manifiesto al aceptar una entrega de diseño. No renombrar IDs sin coordinar con Julio y Gaby.

| ID(s) | Nombre sugerido | Tamaño o proporción sugerida | Respaldo |
|---|---|---|---|
| `character.alba`, `character.chispa`, `character.aurora`, `character.nico` | `characters/<nombre>/portrait.webp` | retrato 1:1, 512×512 px; expresión y fondo transparente | tarjeta CSS con nombre y color |
| `background.earth`, `background.moon`, `background.mars` | `backgrounds/<destino>/scene.webp` | escenario 16:9, 1920×1080 px; zona segura central | bloque de color y título |
| `ui.console` | `ui/console.webp` | 16:9 o capas separadas; controles no incrustados en la imagen | panel CSS |
| `ui.energy`, `ui.air`, `ui.shelter` | `ui/<recurso>.svg` | vector 24×24 en vista nominal | texto visible y color |
| `object.panel`, `object.airlock` | `objects/<objeto>.webp` | transparente, caja 512×512 px | forma CSS y etiqueta |
| `animation.alert` | `animations/alert.webp` | secuencia o animación ligera; duración declarada | cambio CSS y texto |
| `audio.alert` | `audio/alert.ogg` | audio corto; volumen normalizado | aviso visual y texto |
| `background.earthWelcome` | `backgrounds/earth/welcome-concept.png` | concepto actual: 1487×1058 px, 2D toon | color oscuro si falla la carga |
| `ui.welcomeWordmark` | `ui/welcome-wordmark-concept.png` | concepto actual: 1967×799 px, RGBA | título y subtítulo en texto |

Los tamaños son propuestas de producción, no requisitos ya aprobados. Diseño debe entregar nombres semánticos, dimensiones reales, versión, autor, procedencia, licencia y, si aplica, declaración de uso de IA. Para las interacciones, separar elementos móviles del fondo y dejar hitboxes definibles en código. Los audios deben tener alternativa visual; no depender del sonido para entender una alerta. No incrustar métricas científicas ni diálogos en imágenes.

Antes de integrar, comprobar que el archivo existe, actualizar únicamente su `path` en el manifiesto y verificar el respaldo cuando la ruta falla. La interfaz debe seguir siendo utilizable sin assets y con mouse o touch.

Los dos conceptos de bienvenida se generaron el 14-11-2026 a partir de la opción visual elegida por el usuario. La ilustración muestra un centro espacial ficticio; no se presenta como una instalación NASA real. Diseño puede reemplazarlos manteniendo los IDs y el espacio de composición. El wordmark actual tiene pequeños artefactos de transparencia visibles al ampliarlo; revisar el alfa en la entrega definitiva. Las fuentes de interfaz son Fredoka y Nunito (`@fontsource`); los iconos vienen de `@phosphor-icons/react`. Confirmar sus licencias al preparar los créditos finales.
