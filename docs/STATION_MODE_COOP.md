# Astronauta Junior · Modo Estación Cooperativo Local (P1)

Este documento detalla la arquitectura, reglas pedagógicas, integración con el motor canónico de Software 1 y la batería de pruebas para el **Modo Estación Cooperativo Local**.

---

## 1. Visión y Enfoque Pedagógico

El **Modo Estación** transforma Astronauta Junior en una experiencia colaborativa diseñada para el trabajo en aulas escolares y estaciones de aprendizaje compartidas en una **única computadora o laptop**, sin requerir cuentas de usuario, backend remoto ni conexión a internet (100% offline y seguro para la privacidad estudiantil).

### Principios Fundamentales:
1. **Privacidad Escolar Estricta:** Se utilizan únicamente alias espaciales ficticios (ej. `Nova`, `Rayo`, `Luna`, `Astro`, `Brote`), nunca nombres ni apellidos reales.
2. **Decisiones por Consenso (Sin Temporizador):** A diferencia de simuladores de reflejos rápidos, el Modo Estación fomenta la deliberación y el diálogo colectivo antes de confirmar cada intervención espacial.
3. **Liderazgo Rotativo:** Cada turno cuenta con un cadete activo que dirige la acción, mientras los demás cadetes analizan telemetría de apoyo según su rol. La dirección de turno rota cíclicamente en cada avance.
4. **Construcción Colaborativa de Base:** Al iniciar la expedición espacial, el equipo debate y elige conjuntamente 3 de los 5 módulos para su outpost en la Luna o en Marte.
5. **Evaluación Formativa Colectiva:** Al finalizar la guardia de 5 turnos, se presenta una puntuación colectiva (sobre 100) y aprendizajes científicos compartidos. No se generan clasificaciones ni ránkings individuales competitivos.

---

## 2. Roles Canónicos por Tamaño del Grupo

Los roles se distribuyen estrictamente de acuerdo con el contrato educativo canónico de Software 1 (`rolesForPlayerCount(count)`):

| Tamaño | Participante 1 | Participante 2 | Participante 3 | Participante 4 | Participante 5 |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **3 Cadetes** | ⚡ **Energía** | 🫧 **Oxígeno** | 🛡️ **Escudo** | — | — |
| **4 Cadetes** | ⚡ **Energía** | 🫧 **Oxígeno** | 🛡️ **Escudo** | 👩‍🚀 **Comandante** | — |
| **5 Cadetes** | ⚡ **Energía** | 🫧 **Oxígeno** | 🛡️ **Escudo** | 👩‍🚀 **Comandante** | 🌱 **Botánico** |

### Responsabilidades por Rol:
- **⚡ Oficial de Energía:** Monitorea la generación solar (NASA POWER), eficiencia de paneles, reservas de baterías y consumos críticos.
- **🫧 Oficial de Soporte Vital:** Supervisa la concentración de oxígeno (NASA ECLSS), sellado de fugas y balance de la cabina.
- **🛡️ Oficial de Escudo y Radiación:** Rastrea el clima espacial y eyecciones de masa coronal (NASA DONKI), coordinando el refuerzo de blindaje del refugio.
- **👩‍🚀 Comandante:** Facilita el consenso grupal, resuelve empates de criterio y arbitra la confirmación colectiva.
- **🌱 Oficial Botánico:** Administra el invernadero hidropónico y cultivos espaciales (NASA Veggie & APH), habilitando la barra de Alimento como recurso primario cuando juegan 5 cadetes.

---

## 3. Resolución de la Preparación Terrestre y Herramientas

En el modo individual (Despegue), el jugador recorre el mapa terrestre de 5 instalaciones y ejecuta 3 entrenamientos interactivos para obtener su mochila de 3 herramientas con costos RF-69.

Para el **Modo Estación en aula**:
- La tripulación selecciona la sede de entrenamiento terrestre de origen:
  - **Arequipa (Perú):** Análogo solar y aclimatación de altura andina. Paquete canónico derivado:
    1. `SPARE_PARTS_KIT` (Kit de repuestos de paneles - M1)
    2. `EXTRA_BATTERY` (Batería adicional de reserva - M4)
    3. `WATER_RECYCLER` (Reciclador de agua regenerativo - M5 Arequipa)
  - **Tromsø (Noruega):** Análogo ártico de noche polar y auroras boreales. Paquete canónico derivado:
    1. `SPARE_PARTS_KIT` (Kit de repuestos de paneles - M1)
    2. `EXTRA_BATTERY` (Batería adicional de reserva - M4)
    3. `THERMAL_INSULATION` (Aislamiento térmico polar - M5 Tromsø)
- Esto cumple rigurosamente con los contratos canónicos `isValidPreBuildGameSetup` e `isValidGameSetup` sin inventar herramientas arbitrarias ni modificar el motor de simulación.

---

## 4. Estado de Implementación: Qué se Conectó vs. Qué Estaba Implementado

### Previamente Desarrollado por Gaby (Software 1):
- Motor de simulación espacial (`createMission`, `applyAction`, `advanceTurn`, `getMissionResult`).
- Tipos y validaciones cooperativas (`coop.types.ts`, `validateLocalCoopConfig`, `rolesForPlayerCount`, `rotateActivePlayer`).
- Componentes base de cooperación (`CoopSpaceGame`, `CoopMissionView`, `CoopRoleBar`, `GroupDecisionDialog`, `CoopMissionResults`).

### Conectado y Desarrollado en esta Entrega (`antigravity/station-mode`):
1. **Flujo de Entrada y Configuración Real:**
   - Conexión del botón «Modo Estación» desde la portada (`WelcomeScreen`) y desde la pantalla de resultados (`NextAdventureScreen`).
   - Transformación de `StationModeModal` de una maqueta estática a un configurador interactivo accesible con:
     - Código de sala local ficticio (ej. `NASA-2026`).
     - Selector dinámico de 3, 4 y 5 participantes.
     - Alias espaciales ficticios con validación de no duplicidad, no vacío y advertencia de privacidad escolar.
     - Selección de destino (Luna o Marte) y sede terrestre (Arequipa o Tromsø) con visualización de paquete canónico.
2. **Enrutamiento de Partida Cooperativa en `GameRouter` y `App`:**
   - Adición de la fase `COOP_SPACE` en `SessionPhase`.
   - Propagación de callbacks `onStartCoop` a través de `EarthFlow` y `GameRouter`.
   - Inicialización sin módulos pre-cargados para que `CoopSpaceGame` abra primero `BaseBuilderView`.
3. **Construcción de Base Colaborativa:**
   - Integración fluida con `BaseBuilderView` en Luna o Marte: selección de 3 módulos y transición con anuncio de reloj.
4. **Deliberación Grupal y Confirmación:**
   - Conexión del diálogo de consenso (`GroupDecisionDialog`) para todas las intervenciones cooperativas sin límite de tiempo.
5. **Rotación Automática y Final de Partida:**
   - Rotación del líder activo turno por turno con indicador visual en `CoopRoleBar`.
   - Visualización del informe colectivo tras 5 turnos con opción de reintentar como equipo o retornar a la Tierra.
6. **Internacionalización Integral (i18n):**
   - Soporte multilingüe en inglés (`en`) y español (`es`), con fallback para quechua (`qu`) y noruego (`no`).
   - Corrección de textos pendientes en `StationModeModal`, `LearnScreen` y `EarthReturnScreen`.
   - Selector de idioma accesible en el HUD durante toda la partida cooperativa sin reiniciar estado.

---

## 5. Pruebas Ejecutadas

### 1. Pruebas Unitarias y de Integración (`tests/game/station-mode.test.ts`):
- Validación de grupos de 3, 4 y 5 cadetes.
- Asignación de roles educativos canónicos.
- Rechazo de configuraciones con <3 o >5 cadetes, alias duplicados o nombres vacíos.
- Verificación de contratos canónicos de setup para Luna y Marte.
- Construcción de 3 módulos espaciales.
- Confirmación de decisiones grupales sin consumo previo de recursos.
- Rotación cíclica del participante activo.
- Partida completa de 5 turnos con puntuación colectiva.
- Visibilidad condicional de comida como barra primaria solo para 5 cadetes.

### 2. Pruebas End-to-End Automatizadas con Playwright (`tests/e2e/e2e-coop-station.mjs` y `tests/e2e/e2e-all-routes.mjs` - Ruta 6):
- Navegación desde portada -> apertura de Modal de Estación.
- Configuración de sala, equipo `Equipo Cóndor`, Marte, 4 cadetes (`Nova`, `Rayo`, `Luna`, `Astro`).
- Despegue hacia `BaseBuilderView` y elección de 3 módulos.
- Ejecución secuencial de los 5 turnos con deliberación colectiva en diálogo y avance.
- Visualización de informe colectivo con score /100.
- Regreso a la Tierra e inicio de nueva aventura.
- Capturas de pantalla completas en `tests/e2e/screenshots/station_*.png`.
