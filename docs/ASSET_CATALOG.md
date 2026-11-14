# Catálogo visual de Astronauta Junior

Fuente revisada: `Your paragraph text.pdf`, 17 páginas, exportado de Canva. El PDF indica «Katiasofia Gonzales» en metadatos, pero eso no confirma autoría ni licencia de cada imagen. Sus imágenes se trataron como **referencias**. No se incorporó ninguna a `public/assets/` ni al juego.

La inspección con `pdfimages -list` encontró imágenes raster individuales, pero casi todas están compuestas sobre fondo blanco o contienen varias poses, etiquetas o mapas en una sola imagen. La página 9 incluye una máscara alfa en una imagen de robot; aun así se requiere confirmación de procedencia y archivo fuente antes de usarla. Se inspeccionaron las 17 páginas, incluidas las páginas vacías 2 y 14.

| Recurso | Página | Archivo en producción | Resolución original observada | Transparencia | Estado y destino |
|---|---:|---|---|---|---|
| Referencias de interfaz y pixel art | 1 | Ninguno | 840×1008, 840×465, 1000×800 | Sin alfa | Referencia de estilo; interfaz |
| Luna y Marte con interfaz incrustada | 3 | Ninguno | 964×538 cada una | Sin alfa | Referencia; destinos |
| Mapa mundial | 3–4 | Ninguno | 964×538, 1376×768 | Sin alfa | Referencia; selección de ciudad |
| Sudamérica | 5 | Ninguno | 1024×764 | Sin alfa | Referencia; Arequipa |
| Perú y región andina | 6 | Ninguno | 1264×848, 928×1152 | Sin alfa | Referencia; Arequipa |
| Europa y Noruega | 7 | Ninguno | 1264×848, 743×922, 615×615 | Sin alfa | Referencia; Tromsø |
| Astronautas azules | 8 | Ninguno | 413×615, 404×615, 820×612, 1024×572 | Sin alfa | Variantes y grupos; avatares |
| Robots | 9 | Ninguno | 687×1024 y 481×717 | Una imagen usa máscara alfa | Conceptos; apoyo narrativo |
| Científicas | 10 | Ninguno | 550×820, 687×1024, 1024×572 | Sin alfa | Conceptos; diálogos |
| Personaje verde | 11 | Ninguno | 765×1024, 550×820 | Sin alfa | Concepto; identidad sin confirmar |
| Avatares y tonos de piel | 12–13 | Ninguno | 1024×572 cada página | Sin alfa | Variantes; avatares |
| Mochila, inventario y recursos | 15 | Ninguno | 442×442, 820×612, 1024×765 | Sin alfa | Conceptos; HUD e inventario |
| Sistema de oxígeno M1 | 16 | Ninguno | Solo título | No aplica | Ilustración de minijuego pendiente |
| Simulacro solar M2 | 17 | Ninguno | Solo título | No aplica | Ilustración de minijuego pendiente |

Las dimensiones son de imágenes incrustadas en el PDF, no tamaños aprobados para el juego. Los IDs y placeholders disponibles para revisión están en `src/visual-kit/catalog.ts`; su `path` permanece en `null` hasta recibir archivos originales y licencia. La galería independiente está en `/visual-gallery.html`.

## Pedidos concretos a diseño

- PNG o WebP originales con transparencia de cada personaje y robot, una pose por archivo; identidad y expresiones de diálogo identificadas.
- Mapas limpios y separados de interfaz para Arequipa, Tromsø, Luna y Marte; puntos interactivos y edificios en capas propias. No reutilizar mapas de procedencia desconocida.
- Sprites de cinco edificios, herramientas y ranuras de inventario, panel, batería, cables, interruptores, generador, alarma y refugio.
- Para cada archivo: autor, licencia, permiso de uso en repositorio público, versión, resolución, escala base y declaración de IA si corresponde.
