# GUÍA DE INTEGRACIÓN DE ASSETS — ASTRONAUTA JUNIOR

> **Documento de Handoff Técnico para Equipo de Diseño y Codex (Software 2 / Software 1)**  
> Versión: 2.0 — Hackatón NASA Space Apps Challenge 2026

Este documento detalla el inventario de recursos visuales necesarios para sustituir los placeholders SVG/CSS interactivos por las ilustraciones definitivas del equipo de diseño, conservando la arquitectura desacoplada mediante `src/assets/manifest.ts`.

---

## 1. Arquitectura de Reemplazo de Assets

Cada componente del juego consume sus recursos visuales mediante el manifiesto único `assetManifest`:

```typescript
// src/assets/manifest.ts
export const assetManifest: Record<AssetId, AssetEntry> = {
  'identificador': {
    path: '/assets/carpeta/nombre-archivo.png', // o null si está en placeholder
    fallbackLabel: 'Etiqueta accesible',
    fallbackColor: '#colorHex'
  }
}
```

**Regla de integración:** Ningún componente React acopla rutas `<img>` fijas. Cuando diseño entregue un asset, se deposita en `public/assets/...` y se actualiza únicamente el campo `path` en `src/assets/manifest.ts`. Si la imagen tarda en cargar o falla, el juego cae limpiamente al fallback SVG/CSS sin romperse.

---

## 2. Inventario Completo de Assets por Pantalla y Módulo

| Identificador (`AssetId`) | Pantalla / Módulo | Descripción / Contenido | Formato | Dimensiones Recomendadas | Placeholder Actual | Estado |
|---|---|---|---|---|---|---|
| `background.earthWelcome` | P1 Bienvenida | Paisaje 2D toon del Centro Espacial al amanecer con base y cohete en plataforma | PNG / WebP | 1440 × 1024 px | `welcome-concept.png` | **Aprobado (P3 pulido de bordes)** |
| `ui.welcomeWordmark` | P1 Bienvenida | Logotipo ilustrado "Astronauta Junior — De tu cielo a otros mundos" | PNG (Alpha) | 1200 × 500 px | `welcome-wordmark-concept.png` | **Aprobado** |
| `map.earthBase` | P5 Mapa Terrestre | Terreno 2D del Centro Espacial de Lima con calles, áreas verdes y plataformas | PNG / SVG | 1920 × 1080 px | SVG procedural de terreno | **Pendiente Arte** |
| `facility.observatory` | P5 Mapa Terrestre | Edificio de Observatorio Solar con cúpula astronómica y paneles | PNG (Alpha) / SVG | 400 × 400 px | SVG procedural interactivo | **Pendiente Arte** |
| `facility.weatherTower` | P5 Mapa Terrestre | Torre del Centro de Clima Espacial con antena de radar y cúpula | PNG (Alpha) / SVG | 400 × 400 px | SVG procedural interactivo | **Pendiente Arte** |
| `facility.eclssHangar` | P5 Mapa Terrestre | Hangar industrial de reciclaje de aire y agua con tanques esféricos | PNG (Alpha) / SVG | 400 × 400 px | SVG procedural interactivo | **Pendiente Arte** |
| `facility.bioDome` | P5 Mapa Terrestre | Cúpula geodésica transparente de cultivos con iluminación hidropónica | PNG (Alpha) / SVG | 400 × 400 px | SVG procedural interactivo | **Pendiente Arte** |
| `facility.launchPad` | P5 Mapa Terrestre | Plataforma de despegue con torre gantry y cohete vertical | PNG (Alpha) / SVG | 500 × 600 px | SVG procedural interactivo | **Pendiente Arte** |
| `game.solarLab` | P6 Detective del Sol | Mesa de laboratorio, soporte de panel móvil y batería espacial | PNG / SVG | 1200 × 800 px | SVG interactivo con circuitos | **Pendiente Arte** |
| `game.spaceStation` | P7 Vigilante del Sol | Sección esquemática de hábitat: cúpula exterior, esclusa y búnker subterráneo | PNG / SVG | 1200 × 800 px | SVG interactivo de refugio | **Pendiente Arte** |
| `cargo.bay` | P8 Mochila | Bodega de carga de nave espacial abierta con 3 bahías hexagonales | PNG / SVG | 900 × 600 px | SVG interactivo con slots | **Pendiente Arte** |
| `tool.panels` | P8 Mochila / Consola | Contenedor de paneles solares compactos desplegables | PNG (Alpha) | 256 × 256 px | SVG / Icono con marco | **Pendiente Arte** |
| `tool.lifeSupport` | P8 Mochila / Consola | Tanque de presurización y cartuchos de oxígeno ECLSS | PNG (Alpha) | 256 × 256 px | SVG / Icono con marco | **Pendiente Arte** |
| `tool.shelterKit` | P8 Mochila / Consola | Módulo de blindaje denso de polietileno y agua para refugio | PNG (Alpha) | 256 × 256 px | SVG / Icono con marco | **Pendiente Arte** |
| `tool.cropKit` | P8 Mochila / Consola | Almohadillas hidropónicas y semillas espaciales Veggie | PNG (Alpha) | 256 × 256 px | SVG / Icono con marco | **Pendiente Arte** |
| `character.alba` | P3 / P4 / Consola | Cadete / Comandante Alba (Mando y decisiones, ~10-12 años) | PNG (Alpha) | 512 × 512 px | Badge SVG ilustrado | **Pendiente Arte** |
| `character.chispa` | P3 / Diálogos | Robot Chispa (Especialista en energía y cables) | PNG (Alpha) | 512 × 512 px | Badge SVG ilustrado | **Pendiente Arte** |
| `character.aurora` | P3 / Diálogos | Dra. / Oficial Aurora (Científica de radiación y Sol) | PNG (Alpha) | 512 × 512 px | Badge SVG ilustrado | **Pendiente Arte** |
| `character.nico` | P3 / Diálogos | Ingeniero Nico (Soporte vital y botánica) | PNG (Alpha) | 512 × 512 px | Badge SVG ilustrado | **Pendiente Arte** |
| `background.moonArrival` | P11 Llegada | Paisaje del Polo Sur lunar (Cráter Shackleton) con Tierra en el horizonte | PNG / WebP | 1920 × 1080 px | Gradiente espacial con cráter | **Pendiente Arte** |
| `background.earthSplashdown`| P15 Regreso | Cápsula espacial flotando en el océano Pacífico con 3 paracaídas naranjas | PNG / WebP | 1920 × 1080 px | Gráfico CSS de reingreso | **Pendiente Arte** |

---

## 3. Pautas de Estilo para el Equipo de Diseño

1. **Estilo:** 2D toon moderno, apto para público de 9 a 12 años (no preescolar, no hiperrealista ni 3D genérico).
2. **Paleta:** Azules profundos espaciales (`#101e30`, `#1a2f4c`), acentos dorados/ámbar (`#f6c15b`, `#e5ab3b`), acentos cian/oxígeno (`#4cc3d9`, `#7cb5c8`) y verdes de soporte vital (`#4caf50`).
3. **Optimización:** Usar WebP o PNG optimizados con compresión sin pérdidas. Nombres de archivo sin espacios ni mayúsculas (ej: `facility-observatory.png`).
