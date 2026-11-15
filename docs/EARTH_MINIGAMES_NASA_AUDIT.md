# Misiones terrestres: datos y reglas

Verificación: 15 de noviembre de 2026. La partida sigue usando los registros históricos locales y funciona sin red. No se añadió una consulta en vivo: las siete actividades son reproducibles, y una API externa no debe bloquear una demostración.

## Datos contrastados

NASA POWER, parámetro diario `ALLSKY_SFC_SW_DWN` (`kW-hr/m²/day`):

| Ciudad y coordenadas | Fecha | Valor local | Valor API oficial |
| --- | --- | ---: | ---: |
| Arequipa (-16.4090, -71.5375) | 2024-01-20 | 5.6028 | 5.6028 |
| Arequipa | 2024-02-10 | 6.174 | 6.174 |
| Arequipa | 2024-06-15 | 5.6455 | 5.6455 |
| Tromsø (69.6492, 18.9553) | 2024-03-21 | 1.7194 | 1.7194 |
| Tromsø | 2024-06-21 | 3.5702 | 3.5702 |
| Tromsø | 2024-12-21 | 0 | 0 |

Consulta: [NASA POWER API](https://power.larc.nasa.gov/docs/services/api/). Los enlaces de consulta con fecha, parámetro y coordenadas están en `src/data/nasa/powerData.ts`.

NASA DONKI, [API CME](https://api.nasa.gov/):

| ID histórico | Análisis utilizados en el juego | Respuesta oficial |
| --- | ---: | --- |
| `2024-05-10T07:12:00-CME-001` | 1018 km/s | 1018 y 1332 km/s; el valor local es un análisis, no el único |
| `2024-05-10T21:28:00-CME-001` | 717 km/s | 717 km/s |

## Qué usa cada juego

| Juego | Registro NASA | Parámetros educativos simulados |
| --- | --- | --- |
| Detective del Sol | Tres días POWER de Arequipa, seleccionables | Inclinación de 16°, factor angular, área de 10 m², 22 % de eficiencia, carga y reserva |
| Reserva para los meses oscuros | Día POWER del 2024-12-21 en Tromsø | Reparto de batería, umbrales de calor, cultivos y radio, analogía con la noche lunar |
| Vigilante del Sol | Dos eventos históricos DONKI | Secuencia de evacuación, refugio y sensores; no se calcula dosis de radiación |
| Aclimatación de altura | Ningún registro de POWER o DONKI | Presión de cámara, sellos, consumo de gas y umbrales del desafío |
| Soporte Vital ECLSS | Información conceptual de NASA ECLSS | Watts, porcentajes de recuperación y puntuación del circuito |
| Laboratorio Veggie | Información conceptual de NASA Veggie | Espectro LED, agua, crecimiento y costo de alimentos |
| Invernadero Ártico | Ninguna medición NASA de temperatura del invernadero | Temperatura, caudal geotérmico, aislamiento y crecimiento |

POWER mide radiación solar incidente en una superficie horizontal terrestre. La electricidad calculada por Detective del Sol es una estimación didáctica, no una medición POWER ni una predicción certificada para paneles inclinados. La inclinación de 16° es una elección de diseño basada en la latitud; no es una recomendación oficial para todos los días. Los valores espaciales y costos RF-69 son reglas del simulador.

Una actualización futura puede consultar POWER sin clave desde un servicio opcional con validación de fecha, unidad, parámetro y coordenadas. DONKI admite `DEMO_KEY` para una consulta exploratoria, con límites de uso; una clave privada debe quedar en el servidor. Toda consulta debe mantener caché y respaldo local. La demo actual no necesita esa dependencia.

## Arte pendiente

No hay fondos específicos de pixel art para el interior de los siete minijuegos. Los PNG existentes representan las instalaciones del mapa; usarlos como fondo del SVG interactivo duplicaría edificios y controles.
