# ASTRONAUTA JUNIOR — Contexto integral para Codex

> **Versión de coordinación para NASA Space Apps Challenge 2026 (14–15 de noviembre de 2026).** Este documento sirve para preparar la arquitectura y dividir tareas; **no implica que las funcionalidades ya estén implementadas**. El nombre de trabajo es **Astronauta Junior: De tu cielo a otros mundos**. Nombres alternativos propuestos (por ejemplo, PachaQuest) **no están aprobados**: no renombrar sin autorización.

## 1. Reto, usuario y problema

- **Challenge:** [Build a Junior Astronaut Mission Trainer](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/?tab=details).
- **Usuario principal:** niños de 7 a 12 años; diseñar principalmente para 9–12 años, sin excluir a menores de ese rango. No asumir conocimientos espaciales previos.
- **Problema:** los niños tienen pocas oportunidades de experimentar cómo decisiones reales de ingeniería condicionan la supervivencia de una misión espacial; los enfoques educativos pueden ser demasiado abstractos, técnicos o simplificados.
- **Propuesta:** videojuego web **2D**, donde se preparan en la Tierra con datos de NASA, eligen equipamiento y después gestionan una base lunar o marciana. Aprenden mediante acciones y consecuencias, no cuestionarios.
- **Lema:** «La Tierra te prepara. La Luna y Marte ponen a prueba tus decisiones. Cada elección tiene consecuencias».
- **Criterios generales de evaluación mencionados en la preparación:** Impacto, Creatividad, Validez, Relevancia y Presentación. Verificar detalles oficiales vigentes antes de afirmar que algo es obligatorio.
- **No se pretende resolver directamente problemas de astronautas reales:** la contribución principal es educativa/STEM.

## 2. Estado de las decisiones y fuentes de verdad

1. **Versión documentada originalmente por el equipo:** cuatro herramientas con mochila de tres; cuatro personajes; modo individual Despegue y modo escolar Estación; preparación terrestre en mapa; campaña lunar; panel en primera persona 2D con alertas simultáneas; NASA POWER, DONKI, EONET y OSDR. Marte inicialmente estaba planteado para futuro.
2. **Dirección mejorada propuesta para implementar (todavía sujeta a validación del equipo):** reducir la preparación terrestre a **dos entrenamientos breves (15–20 s cada uno)**; priorizar la guardia lunar; agregar alimentos y comunicaciones como sistemas secundarios; mantener **tres recursos principales**; permitir selección **Luna/Marte** reutilizando motor, pero entregar **Luna completamente jugable primero**; cinco turnos por campaña; reintentos y evaluación final.
3. **Documentos vigentes del equipo si están disponibles en el entorno:** carpeta Drive `00-PAQUETE-EQUIPO`, archivos `01_Propuesta-y-alcance_v1.0.docx`, `02_Flujo-de-pantallas-y-ejemplo_v1.0.docx`, `03_Narrativa-personajes-y-dialogos_v1.0.docx`, `04_Datos-lugares-y-fuentes_v1.0.docx` y `LEEME.md`. Las notas antiguas `PLAN.md` y `docs/` pueden contradecirlos. **No fingir haber accedido a Drive:** si no se puede consultar, usar este documento, registrar incertidumbres y pedir al equipo que confirme diferencias.
4. **No confundir propuesta, requisito oficial e implementación existente.** Una descripción de funcionalidad no demuestra que esté programada.

## 3. Concepto jugable y direcciones visuales

- **Géneros:** aventura científica, preparación ligera de misión, gestión de recursos, toma de decisiones y minijuegos.
- **Visual:** auténtico videojuego 2D toon moderno, ilustración coherente y personajes de aproximadamente 10–12 años, no estilo preescolar, no collage fotorrealista ni UI genérica de IA, sin saturación de neón. Paleta coherente, controles grandes, pocos indicadores permanentes.
- **Fase terrestre:** mapa/centro espacial 2D ilustrado con edificios interactivos, inspirado en la claridad de juegos ligeros de gestión tipo Ikariam (sin clonar el juego ni crear un city builder masivo); botón/acción principal claramente visible.
- **Fase espacial:** guardia de monitoreo en primera persona **simulada con escenarios 2D y cámaras fijas**, no mundo 3D libre; fondo ocupado mayormente por el escenario, controles discretos y feedback visible.
- **Interacciones reutilizables:** tocar, arrastrar, mantener presionado. Deben funcionar con mouse y touch.
- **Los assets definitivos los hace el equipo de diseño:** nunca bloquear la programación esperando imágenes; usar fallbacks SVG/CSS o placeholders con tamaños y IDs definidos. Assets intercambiables mediante un manifiesto único.

## 4. Flujo de producto (9 vistas lógicas)

### P1. Bienvenida
- «Jugar ahora» (Despegue / Liftoff, modo principal).
- «Modo Estación» (maqueta escolar/familiar, no multijugador real).
- «Fuentes científicas»; sin registro obligatorio.

### P2. Tu lugar en la Tierra
- Ciudad de una lista predefinida; **Lima primero**. NASA POWER contextualiza energía solar histórica de la ciudad.
- Avatar y nombre ficticio. No pedir GPS, dirección, correo ni identidad real.

### P3. Centro de entrenamiento terrestre (2 pruebas cortas)
- **T1 Detective del Sol — NASA POWER:** comparar tres días históricos verificables, elegir día con mayor radiación y orientar panel. Aprender diferencia entre energía solar incidente y electricidad generada.
- **T2 Vigilante del Sol — NASA DONKI:** identificar aviso basado en evento histórico verificable y elegir una medida de preparación. No etiquetar un registro antiguo como alerta actual.
- Otras actividades EONET/OSDR no deben bloquear el acceso al espacio.

### P4. Prepara tu mochila
- **4 opciones, elegir exactamente 3:** paneles plegables, kit de soporte vital, kit de refugio y kit de cultivos.
- Equipos reales/plausibles, no poderes mágicos. El equipamiento seleccionado persiste y cambia opciones de la misión.

### P5. Selecciona tu misión
- **Luna — Primera Luz:** objetivo inicial y MVP prioritario.
- **Marte — Horizonte Rojo:** si existe una campaña implementada y verificada; si no, indicar honesta y claramente «próximamente».
- Configuración opcional de tripulación/duración sin sobredimensionar el MVP.

### P6. Llegada y preparación de estación
- Mostrar diferencias esenciales Tierra vs. destino: atmósfera respirable exterior, energía solar, protección ambiental.
- Dos interacciones breves: desplegar/orientar paneles; preparar refugio con blindaje físico/protocolo apropiado.

### P7. Guardia de monitoreo (núcleo)
- Consola en primera persona 2D, cámaras por módulos y alertas simultáneas.
- **3 indicadores permanentes:** energía, aire y «Escudo» (nombre de UI para **preparación/disponibilidad del refugio**, no campo de fuerza ni blindaje que se desgasta al exponerse a radiación).
- **Variables secundarias internas:** alimento, exposición radiológica, ciencia, fallas, comunicaciones.
- Dos alertas pueden ocurrir juntas; atender una consume recursos/tiempo; ignorar otra puede empeorarla al avanzar turno. Consecuencias acumulativas.
- Explicación breve de Alba, Chispa, Aurora o Nico tras actuar.

### P8. Informe de misión
- Victoria o misión interrumpida, supervivencia de la tripulación, recursos finales, decisiones más importantes, explicaciones científicas y fuentes NASA (fecha, identificador, unidades), opción de reintentar.
- Evaluar comprensión/planificación además de rapidez.

### P9. Próxima aventura
- Reintentar, cambiar mochila/ciudad/destino, ver fuentes y maqueta Estación.
- «¿Qué habría pasado si…?» es extensión, no P0.

## 5. Campañas espaciales

### Luna — Primera Luz (5 turnos)
1. Repartir electricidad durante arranque de base.
2. Fuga de aire y una oportunidad científica simultánea; priorización.
3. Evento espacial histórico contextualizado con NASA DONKI y protocolo de protección.
4. Escasez energética; priorizar soporte vital, cultivos e investigación.
5. Decisión final: sistemas vitales seguros + objetivo de misión, éxito o interrupción.

### Marte — Horizonte Rojo (misma lógica, parámetros distintos)
1. Iniciar base bajo condiciones solares marcianas.
2. Problema de soporte vital y necesidades de oxígeno.
3. Polvo perjudica generación eléctrica.
4. Tomar decisión con mayor demora de respuesta desde Tierra.
5. Equilibrar suministros, seguridad e investigación para completar el objetivo.

**Prioridad absoluta:** completar un vertical slice lunar que funcione aunque no esté Marte. No construir dos motores.

## 6. Intervenciones/minijuegos espaciales (reutilizar gestos)

1. **Reparar paneles:** reconectar cable o limpiar polvo con drag/swipe; recuperar generación con costo de mantenimiento; ignorar reduce producción futura.
2. **Recuperar aire:** cerrar fuga, mantener presionado / soltar o tocar; consume energía; afecta reserva de aire y soporte vital.
3. **Proteger tripulación:** suspender salida al exterior, preparar refugio blindado; reduce exposición potencial pero interrumpe operaciones científicas.
4. **Mantener cultivos:** distribuir energía/luz y priorizar reservas; impacto futuro en alimentación, **sin crecimiento instantáneo mágico**.
5. **Comunicarse con Tierra:** solicitar instrucciones o usar protocolo local; diferencia significativa entre retraso lunar y marciano.

Los minijuegos deben modificar estado real del motor; no ser una decoración ni quiz.

## 7. Motor y contratos base propuestos

- Lógica determinista e independiente de React; usar configuración + semilla cuando corresponda.
- Estado mínimo: planeta, turno, maxTurns, tripulación, energía, aire, `shield` (readiness del refugio), alimentos, exposición, progreso científico, comunicaciones, fallas/alertas, herramientas, historial de decisiones, status `PLAYING | SUCCESS | FAILED`.
- Funciones: `createMission`, `generateTurnEvents`, `applyAction`, `resolveIgnoredEvents`, `advanceTurn`, `checkMissionResult`.
- Cada turno: calcular generación/consumo -> mostrar eventos -> elegir y realizar intervención -> aplicar costo/beneficio -> resolver alertas ignoradas -> avanzar -> verificar victoria/fracaso.
- Las escalas numéricas son **indicadores educativos**, no medidas físicas de NASA. Registrar y documentar conversiones, supuestos y consecuencias; fijar valores en config, no dispersos en UI.
- Contratos entre módulos: `GameSetup` (ciudad, avatar ficticio, destino, exactamente 3 herramientas, entrenamiento), `NasaDataset` (observaciones reales y metadatos), `MissionState`, `MissionResult`; callback `EarthFlow.onReady({setup, nasaData})` y `SpaceGame.onFinish(result)` (firmas exactas se deciden una vez y se congelan).
- El orquestador App es el único dueño de la navegación y transición de fases.

## 8. Ciencia y datos

**Fuentes prioritarias:**
- NASA POWER https://power.larc.nasa.gov/ — radiación solar terrestre histórica por ciudad y fecha, NO energía lunar/marciana. Conservar parámetro, unidades, coordenadas, período y fuente; energía incidente ≠ electricidad del panel.
- NASA DONKI https://ccmc.gsfc.nasa.gov/tools/DONKI/ — registros históricos de clima espacial. Distinguir SEP / llamaradas / CMEs / tormentas geomagnéticas, no inventar dosis radiológica desde eventos DONKI.
- NASA ECLSS https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/ — fundamento técnico de soporte vital.

**Fuentes complementarias (P1/P2 según tiempo):** OSDR https://osdr.nasa.gov/, RadLab https://visualization.osdr.nasa.gov/radlab/gui/data-api/, Mars Trek https://trek.nasa.gov/mars/, CSA Food Production https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/, NASA EONET para otros eventos terrestres.

- Al consumir una API, separar **dato observado** (fuente/fecha/unidad/ID), **modelo educativo** (reglas/supuestos) y **ficción narrativa**.
- Permitir respaldos JSON locales **solo con datos históricos verificados**. Si no se dispone de una muestra real, indicar «pendiente de validación» y no fabricar observaciones atribuidas a NASA.
- No llamar «datos en vivo» a series históricas. No depender de la API durante el pitch.

## 9. Personajes

- **Comandante Alba:** prioridades, decisiones, guía de misión.
- **Chispa:** robot de energía y soporte vital.
- **Dra. Aurora:** radiación, clima espacial y datos NASA.
- **Nico:** alimentos y cultivos.
- Diálogos muy breves, tono de aventura, sin infantilización ni castigos traumáticos.

## 10. Modos y prioridades

- **Despegue / Liftoff (P0):** juego individual, sin cuentas ni datos personales, experiencia cerrada de ~8–12 min, un ciclo completo con informe y reintentos.
- **Estación / Station (P2):** proyección escolar/familiar de juego colaborativo con código; para hackatón **solo maqueta**, no auth/multijugador real; se puede demostrar cooperación en un mismo equipo por turnos.

**P0:** motor, barras, alertas simultáneas, consecuencias acumulativas, objetivo claro de victoria/fracaso, **Luna funcional**, minijuegos espaciales esenciales, NASA verificable, resultado educativo.

**P1:** Marte si realmente completado, ciudad, 2 minijuegos terrestres, mochila 3/4, diálogos/4 personajes, ficha científica, comparación de estrategias.

**P2:** aula real, cuentas, salas, mapas extensos, 3D, multijugador, personalización extensa.

**Orden recomendado:** un vertical slice lunar jugable -> motor y alertas -> minijuegos -> NASA verificable -> conectar Tierra/mochila -> narrativa/assets -> Marte solo si no pone en riesgo la demo.

## 11. División sin conflictos de código (propuesta operativa)

### Julio — Motor y experiencia espacial

**Propiedad exclusiva por defecto:**
- `src/game/core/**` motor, recursos, acciones, turnos, alertas, resultados, reglas.
- `src/game/missions/**` configuraciones Luna/Marte.
- `src/features/space/**` consola, alertas, minijuegos, vista espacial e informe final.
- Pruebas del motor en `src/game/**/__tests__/**` y pruebas de Space en carpeta de Space.

### Gaby — Tierra, NASA e introducción

**Propiedad exclusiva por defecto:**
- `src/features/earth/**` bienvenida, ciudad, entrenamientos T1/T2, mochila 3/4, selección de destino, interfaz terrestre.
- `src/features/nasa/**` clientes, normalización y validación POWER/DONKI.
- `src/data/nasa/**` datasets locales verificados con metadatos.
- Sus pruebas en los mismos módulos de su propiedad.

### Equipo de assets/diseño

**Propiedad exclusiva por defecto:**
- `public/assets/**` ilustraciones, fondos, sprites, UI, audio.
- Entregar tamaños, nombres semánticos, versión y licencia/procedencia; no modificar `src/game/core` ni gameplay.

### Integración — un responsable cada vez

**Protegidos / compartidos (Julio propietario inicial hasta acordar integración):**
- `src/app/**`, `src/game/contracts/**`, `src/assets/manifest.ts`, `package.json`, `tsconfig*`, `vite.config.*`, `src/styles/tokens.css` y archivos de entrada.
- Cambios a contratos: proponer primero, acordar versión, evitar que dos personas los modifiquen simultáneamente. Introducir mocks/adaptadores si hay cambios pendientes.

### Flujo Git

- `develop`: base funcional e integración; proteger de commits directos de features cuando sea posible.
- `feat/core-space`: Julio.
- `feat/earth-nasa`: Gaby.
- `feat/assets`: equipo de diseño si usa Git; si entrega ZIP, integrar en carpeta única.
- Cada feature hace PR separado a `develop`; revisar tests/build antes de fusionar. Si trabajan en un mismo computador, usar Git worktrees.
- No crear ramas si ya existen o si el repositorio tiene otra convención: inspeccionar primero.

## 12. Criterios mínimos de aceptación

- Desde navegador sin cuentas, se puede jugar al menos Luna de inicio a fin.
- Aparecen dos alertas a la vez, una se atiende, otra empeora; recursos y estados se modifican realmente.
- La campaña tiene al menos un camino de victoria y uno de misión interrumpida.
- Existe una integración NASA sustantiva con fuentes/fecha/valor/unidades y respaldo verificable.
- La UI no se rompe por falta de assets ni por API caída.
- El resultado explica decisiones clave y distingue ciencia de escala simulada.
- Prueba de que equipamiento distinto cambia outcomes (si mochila implementada).
- Scripts de desarrollo y build funcionan. Sin errores TS; no modificar archivos de otro módulo.
- Solo decir que Marte está «jugable» cuando se prueba campaña completa.

## 13. Instrucciones al asistente/Codex

1. **Inspeccionar el repositorio** y no borrar ni sobrescribir código existente.
2. Crear andamiaje y contratos con archivos mínimos que compilen; no implementar el juego completo por sorpresa.
3. Registrar decisiones, dudas y conflictos con documentos en `docs/`.
4. **No inventar datos NASA**, URLs de assets, resultados de tests o funcionamiento no verificado.
5. Documentar limitaciones y tareas pendientes por responsable.
6. Priorizar funcionalidad de P7 (guardia lunar) y no dedicar el primer día al menú/estilo.
7. No recolectar datos sensibles ni personales de niños.
8. Mantener licencias, créditos y declaración de uso de IA para la entrega oficial.

## 14. Estado de implementación y decisiones pendientes (inspección del 14-11-2026)

- El repositorio remoto `JulioXC4/astronexo` estaba vacío, sin ramas ni archivos. La carpeta local tampoco contenía código ni commits antes de este andamiaje.
- Este andamiaje contiene Vite, React y TypeScript, contratos compartidos y una prueba temporal de transferencia Tierra → App → Espacio → App. No hay campaña lunar, motor, entrenamientos ni observaciones NASA verificadas implementados.
- La mochila temporal tiene cuatro opciones y exige tres distintas. La única misión seleccionable en la prueba es Luna; Marte permanece como tipo admitido en el contrato, sin campaña.
- El paquete de equipo `00-PAQUETE-EQUIPO` no estaba disponible en el repositorio inspeccionado. Confirmar con el equipo si sus decisiones difieren de este documento, especialmente el alcance de Marte, la duración de Tierra y la interfaz final de contratos.
- La dirección mejorada de la sección 2 se usa como objetivo de MVP, pero no consta como aprobación final del equipo. Resolver diferencias explícitamente antes de ampliar el alcance.
