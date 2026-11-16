/**
 * Catálogo tipado de multimedia. Es la única lista de rutas del juego:
 * ningún componente escribe una URL de audio o video a mano.
 *
 * Los archivos viven en `public/assets/audio/` y `public/assets/videos/`
 * (solo los que se usan; los originales de `media-insumos/` no se copian).
 * Audio: OGG (bucles sin hueco). Video: MP4 H.264, salvo la cortinilla de
 * alarma, que es WebM porque lleva transparencia.
 */

const AUDIO_ROOT = '/assets/audio';
const VIDEO_ROOT = '/assets/videos';

// ── Música ──────────────────────────────────────────────────────────────────
export const MUSIC_FILES = {
  welcome: 'music/01-tema-principal-bienvenida',
  selection: 'music/02-seleccion-ciudad-destino-avatar',
  briefing: 'music/03-briefing-radio',
  mapArequipa: 'music/04-mapa-arequipa',
  mapTromso: 'music/05-mapa-tromso',
  training: 'music/06-minijuego',
  trainingTension: 'music/07-minijuego-tension',
  builder: 'music/08-construccion-base',
  travel: 'music/09-viaje-espacial',
  baseMoon: 'music/10-base-luna',
  baseMars: 'music/11-base-marte',
  guardAlert: 'music/12-guardia-alerta',
  victory: 'music/13-victoria',
  result: 'music/14-resultado-final',
} as const;
export type MusicId = keyof typeof MUSIC_FILES;

// ── Ambientes (nunca más de uno a la vez, siempre bajo la música) ───────────
export const AMBIENT_FILES = {
  cabin: 'ambient/A1-cabina-espacial',
  marsWind: 'ambient/A2-viento-marte',
  lunarSilence: 'ambient/A3-silencio-lunar',
  polarNight: 'ambient/A4-noche-polar',
} as const;
export type AmbientId = keyof typeof AMBIENT_FILES;

// ── Efectos ─────────────────────────────────────────────────────────────────
/** Cada efecto apunta a una o varias variantes; con varias, suena una al azar. */
export const SFX_FILES = {
  // núcleo: los siete que ya existían (con síntesis como respaldo)
  click: ['sfx/nucleo/click'],
  success: ['sfx/nucleo/success'],
  error: ['sfx/nucleo/error'],
  reward: ['sfx/nucleo/reward'],
  alarm: ['sfx/nucleo/alarm'],
  radio: ['sfx/nucleo/radio'],
  step: ['sfx/nucleo/step'],

  // interfaz
  screenWhoosh: ['sfx/interfaz/00-general-cambio-pantalla-whoosh'],
  notification: ['sfx/interfaz/00-general-notificacion'],
  panelOpen: ['sfx/interfaz/00-general-panel-abrir'],
  panelClose: ['sfx/interfaz/00-general-panel-cerrar'],
  cardSelect: ['sfx/interfaz/00-general-seleccionar-tarjeta'],
  toggleOn: ['sfx/interfaz/00-general-toggle-on'],
  toggleOff: ['sfx/interfaz/00-general-toggle-off'],
  languageChange: ['sfx/interfaz/01-bienvenida-cambiar-idioma'],
  playStart: ['sfx/interfaz/01-bienvenida-click-jugar'],
  cityConfirm: ['sfx/interfaz/02-ciudad-confirmar'],
  destinationConfirm: ['sfx/interfaz/03-destino-confirmar'],
  avatarConfirm: ['sfx/interfaz/04-avatar-confirmar'],
  dialogueBlip: [
    'sfx/interfaz/05-briefing-dialogo-blip-1',
    'sfx/interfaz/05-briefing-dialogo-blip-2',
    'sfx/interfaz/05-briefing-dialogo-blip-3',
  ],
  dialogueNext: ['sfx/interfaz/05-briefing-dialogo-siguiente'],
  countdownBeep: ['sfx/interfaz/07-entrenamiento-cuenta-atras-beep'],
  countdownGo: ['sfx/interfaz/07-entrenamiento-cuenta-atras-ya'],

  // entrenamientos terrestres
  trainingComplete: ['sfx/minijuegos/07-entrenamiento-mision-completada'],
  trainingFailed: ['sfx/minijuegos/07-entrenamiento-mision-fallida'],
  solarBatteryCharging: ['sfx/minijuegos/08-solar-bateria-cargando'],
  solarBatteryFull: ['sfx/minijuegos/08-solar-bateria-llena'],
  solarSwitchOpen: ['sfx/minijuegos/08-solar-interruptor-abrir'],
  solarSwitchClose: ['sfx/minijuegos/08-solar-interruptor-cerrar'],
  solarPanelTurn: ['sfx/minijuegos/08-solar-panel-girar'],
  altitudePump: ['sfx/minijuegos/09-altitud-bomba-aire'],
  altitudeHatchOpen: ['sfx/minijuegos/09-altitud-escotilla-abrir'],
  altitudeHatchClose: ['sfx/minijuegos/09-altitud-escotilla-cerrar'],
  altitudeSeal: ['sfx/minijuegos/09-altitud-sello-hermetico'],
  donkiStormAlert: ['sfx/minijuegos/10-donki-alarma-tormenta-solar'],
  eclssWaterDrip: ['sfx/minijuegos/11-eclss-agua-goteo'],
  eclssElectrolysis: ['sfx/minijuegos/11-eclss-electrolisis-burbujas'],
  eclssCo2Filter: ['sfx/minijuegos/11-eclss-filtro-co2'],
  eclssWaterRecycler: ['sfx/minijuegos/11-eclss-reciclador-agua'],
  veggieLed: ['sfx/minijuegos/12-veggie-luz-led'],
  veggieGrow: ['sfx/minijuegos/12-veggie-plantas-crecen'],
  darkHeater: ['sfx/minijuegos/13-meses-oscuros-calefactor'],
  arcticSnow: ['sfx/minijuegos/14-artico-nieve-hielo'],
  arcticWind: ['sfx/minijuegos/14-artico-viento'],
  toolEarned: ['sfx/logros/16-herramienta-ganada'],

  // logros generales
  hiddenStar: ['sfx/logros/00-general-estrella-dato-escondido'],
  badgeUnlocked: ['sfx/logros/00-general-insignia-desbloqueada'],
  levelComplete: ['sfx/logros/00-general-nivel-completado'],
  finalFanfare: ['sfx/logros/23-resultado-fanfarria-final'],

  // viaje
  liftoffEngine: ['sfx/viaje/18-despegue-motor-cohete-equipo'],
  landing: ['sfx/viaje/19-llegada-aterrizaje'],
  monitorOn: ['sfx/viaje/19-monitor-pantalla-datos-equipo'],

  // guardia G1–G8
  guardAlertIncoming: ['sfx/guardia/20-guardia-alerta-entrante'],
  guardCellRepaired: ['sfx/guardia/20-guardia-celda-reparada'],
  guardBrushDust: ['sfx/guardia/20-guardia-cepillar-polvo'],
  guardPlaceSupply: ['sfx/guardia/20-guardia-colocar-suministro'],
  guardHatchSealed: ['sfx/guardia/20-guardia-escotilla-sellada'],
  guardOxygenLeak: ['sfx/guardia/20-guardia-fuga-oxigeno'],
  guardSampleAnalyzed: ['sfx/guardia/20-guardia-muestra-analizada'],
  guardPanelDamaged: ['sfx/guardia/20-guardia-panel-danado'],
  guardShelterWall: ['sfx/guardia/20-guardia-pared-refugio-completa'],
  guardBlowDust: ['sfx/guardia/20-guardia-soplar-polvo'],
  guardTurnPassed: ['sfx/guardia/20-guardia-turno-superado'],

  // exploración
  explorationBatteryLow: ['sfx/exploracion/21-exploracion-bateria-baja'],
  explorationBatteryEmpty: ['sfx/exploracion/21-exploracion-bateria-vacia'],
  explorationCuriosity: ['sfx/exploracion/21-exploracion-curiosidad-nasa'],
  explorationLookout: ['sfx/exploracion/21-exploracion-llegar-mirador'],
  explorationPileEmpty: ['sfx/exploracion/21-exploracion-monton-agotado'],
  stepMars: [
    'sfx/exploracion/21-exploracion-paso-arena-marte-1',
    'sfx/exploracion/21-exploracion-paso-arena-marte-2',
    'sfx/exploracion/21-exploracion-paso-arena-marte-3',
  ],
  stepRegolith: [
    'sfx/exploracion/21-exploracion-paso-regolito-1',
    'sfx/exploracion/21-exploracion-paso-regolito-2',
    'sfx/exploracion/21-exploracion-paso-regolito-3',
  ],
  explorationBaseRadio: ['sfx/exploracion/21-exploracion-radio-base'],
  explorationCollect: ['sfx/exploracion/21-exploracion-recoger-muestra'],
  roverStart: ['sfx/exploracion/21-exploracion-rover-arrancar'],
  roverRunning: ['sfx/exploracion/21-exploracion-rover-en-marcha-bucle'],
  roverStop: ['sfx/exploracion/21-exploracion-rover-parar'],
  roverSoftTerrain: ['sfx/exploracion/21-exploracion-terreno-blando'],
} as const satisfies Record<string, readonly string[]>;
export type SoundId = keyof typeof SFX_FILES;

/** Efectos que se pueden mantener en bucle con `startLoop` / `stopLoop`. */
export type LoopSoundId = 'roverRunning';

/** Volumen de cada capa. Música < ambiente de fondo < efectos. */
export const VOLUME = {
  music: 0.38,
  ambient: 0.7,
  sfx: 0.85,
} as const;

export function audioUrl(relative: string): string {
  return `${AUDIO_ROOT}/${relative}.ogg`;
}

// ── Video ───────────────────────────────────────────────────────────────────
export const VIDEO_FILES = {
  recruit: 'reclutamiento-academia-atardecer.mp4',
  departureArequipa: 'despegue-arequipa.mp4',
  departureTromso: 'despegue-tromso.mp4',
  travelMoon: 'viaje-luna.mp4',
  travelMars: 'viaje-marte.mp4',
  arrivalMoon: 'llegada-luna.mp4',
  arrivalMars: 'llegada-marte.mp4',
  returnArequipa: 'regreso-tierra-arequipa.mp4',
  returnTromso: 'regreso-tierra-tromso.mp4',
  /** WebM con canal alfa: solo como overlay. Su MP4 se vería con fondo negro. */
  alarmWipe: 'entrada-minijuego-alarma.webm',
} as const;
export type VideoId = keyof typeof VIDEO_FILES;

export function videoUrl(id: VideoId): string {
  return `${VIDEO_ROOT}/${VIDEO_FILES[id]}`;
}

type CityKey = 'AREQUIPA' | 'TROMSO';
type DestinationKey = 'MOON' | 'MARS';

export const departureVideoFor = (city: CityKey): VideoId => city === 'TROMSO' ? 'departureTromso' : 'departureArequipa';
export const travelVideoFor = (destination: DestinationKey): VideoId => destination === 'MARS' ? 'travelMars' : 'travelMoon';
export const arrivalVideoFor = (destination: DestinationKey): VideoId => destination === 'MARS' ? 'arrivalMars' : 'arrivalMoon';
export const returnVideoFor = (city: CityKey): VideoId => city === 'TROMSO' ? 'returnTromso' : 'returnArequipa';

/** Pixel art ya existente que se muestra mientras carga el video o si falla. */
export const VIDEO_POSTERS: Readonly<Record<VideoId, string>> = {
  recruit: '/assets/scenes/landing/poster.webp',
  departureArequipa: '/assets/scenes/cities/arequipa/poster.webp',
  departureTromso: '/assets/scenes/cities/tromso/poster.webp',
  travelMoon: '/assets/scenes/destinations/moon.webp',
  travelMars: '/assets/scenes/destinations/mars.webp',
  arrivalMoon: '/assets/scenes/destinations/moon.webp',
  arrivalMars: '/assets/scenes/destinations/mars.webp',
  returnArequipa: '/assets/scenes/cities/arequipa/poster.webp',
  returnTromso: '/assets/scenes/cities/tromso/poster.webp',
  alarmWipe: '',
};
