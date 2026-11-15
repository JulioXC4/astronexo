import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { EarthMissionDefinition, MissionType } from '../data/missions';
import { useI18n } from '../i18n';
import { FACILITY_POSITIONS as positions, LAUNCH_PAD, MAP_HEIGHT, MAP_WIDTH, computeSceneLayout } from './earthMapLayout';
import './earth-base-scene.css';

export { MAP_HEIGHT, MAP_WIDTH, computeSceneLayout } from './earthMapLayout';
export type { SceneLayout } from './earthMapLayout';

export type FacilityState = 'available' | 'selected' | 'completed' | 'locked';

export interface EarthBaseSceneProps {
  readonly cityId: string;
  readonly missions: readonly EarthMissionDefinition[];
  /** Instalación seleccionada; `null` deja el mapa despejado. */
  readonly selectedMissionId: MissionType | null;
  readonly completedMissions: readonly MissionType[];
  readonly missionLimitReached: boolean;
  readonly onSelectMission: (missionId: MissionType) => void;
  readonly onOpenMission: (mission: EarthMissionDefinition) => void;
  /** Clic en el escenario vacío (cierra la ficha de misión). */
  readonly onClearSelection?: () => void;
  /** Instalación recién completada: muestra una confirmación visual breve. */
  readonly justCompletedId?: MissionType | null;
  /** Con 3/3 entrenamientos, la plataforma de lanzamiento recibe un brillo discreto. */
  readonly launchReady?: boolean;
}

const facilitySprites: Partial<Record<MissionType, string>> = {
  SOLAR_DETECTIVE: 'andean-solar-observatory.png',
  ALTITUDE_ACCLIMATIZATION: 'hypobaric-chamber.png',
  DARK_MONTHS_RESERVE: 'polar-energy-storage.png',
  SOLAR_WATCH: 'space-weather-observatory.png',
  ECLSS_TRAINING: 'life-support-lab.png',
  VEGGIE_LAB: 'hydroponic-greenhouse.png',
};

function spriteFor(id: MissionType, arctic: boolean): string | undefined {
  if (arctic) {
    if (id === 'SOLAR_WATCH') return 'arctic-weather-station.png';
    if (id === 'ECLSS_TRAINING') return 'polar-life-support-lab.png';
    if (id === 'ARCTIC_GREENHOUSE') return undefined;
  }
  return facilitySprites[id];
}

function FacilityArtwork({ id }: { id: MissionType }) {
  const base = <><path d="M-75 23 0 48 75 23 0-3Z" fill="#172b3b" /><path d="M-75 23V32L0 57V48ZM75 23V32L0 57V48Z" fill="#365360" /></>;
  if (id === 'SOLAR_DETECTIVE') return <>{base}<path d="M-55 10V-34L0-52 55-34V10L0 29Z" fill="#e8d8ae" stroke="#223d50" strokeWidth="3"/><path d="M-60-35 0-56 60-35 0-16Z" fill="#a76d54"/><path d="M-33-41a33 28 0 0 1 66 0" fill="#76aaba" stroke="#27495c" strokeWidth="4"/><path d="M-34-41h68" stroke="#d9ebdf" strokeWidth="3"/><rect x="-8" y="-62" width="16" height="13" rx="3" fill="#f6c15b"/><path d="M-43-6h21v18h-21zm65 0h21v18H22Z" fill="#2c637d"/></>;
  if (id === 'ALTITUDE_ACCLIMATIZATION') return <>{base}<path d="M-59 12V-32L0-51 59-32V12L0 31Z" fill="#b9d5cb" stroke="#27495c" strokeWidth="3"/><path d="M-62-32 0-54 62-32 0-9Z" fill="#66818a"/><rect x="-25" y="-28" width="50" height="43" rx="21" fill="#355b70" stroke="#e6efdd" strokeWidth="4"/><circle cy="-6" r="10" fill="#7bc7d1"/><path d="M-49-8h15m68 0h15" stroke="#315164" strokeWidth="8"/><path d="M-48 12 0 28 48 12" fill="none" stroke="#688d8c" strokeWidth="3"/></>;
  if (id === 'DARK_MONTHS_RESERVE') return <>{base}<path d="M-61 11V-31L0-48 61-31V11L0 30Z" fill="#9ebbc4" stroke="#284c5e" strokeWidth="3"/><path d="M-66-31 0-52 66-31 0-9Z" fill="#ddf0e6"/><path d="M-42-16h84v29l-42 13-42-13Z" fill="#365b73"/><path d="M-24-8v18m24-18v18m24-18v18" stroke="#a7e0dd" strokeWidth="9"/><path d="M-7-42h14m-7-7v14" stroke="#f6c15b" strokeWidth="4"/></>;
  if (id === 'ARCTIC_GREENHOUSE' || id === 'VEGGIE_LAB') return <>{base}<path d="M-62 17V-16Q-53-56 0-58Q53-56 62-16V17L0 36Z" fill={id === 'ARCTIC_GREENHOUSE' ? '#87c3c0' : '#81c9a9'} stroke="#2d5962" strokeWidth="4"/><path d="M-62-16Q0-9 62-16M0-58V27M-36-45-23 26M36-45 23 26" fill="none" stroke="#dcf1dc" strokeWidth="3"/><path d="M-46 8q8-27 20 0m9 9q8-33 19 0m12-5q8-26 20 0" fill="none" stroke="#477d54" strokeWidth="7" strokeLinecap="round"/><path d="M-61 17 0 36 61 17" fill="none" stroke="#2d5962" strokeWidth="5"/></>;
  if (id === 'SOLAR_WATCH') return <>{base}<path d="M-57 16V-22L0-40 57-22V16L0 34Z" fill="#a5bbc4" stroke="#28495b" strokeWidth="3"/><path d="M-60-22 0-44 60-22 0-3Z" fill="#667e8b"/><path d="M-10-35V-73m-24 15 24 17 24-17M-35-58q25-23 50 0" fill="none" stroke="#e5e9d6" strokeWidth="4"/><circle cx="-10" cy="-73" r="6" fill="#f5bb68"/><rect x="-39" y="-5" width="25" height="19" fill="#4d8492"/><rect x="14" y="-5" width="25" height="19" fill="#4d8492"/></>;
  return <>{base}<path d="M-62 15V-30L0-47 62-30V15L0 34Z" fill="#b1c9c7" stroke="#28495b" strokeWidth="3"/><path d="M-66-30 0-51 66-30 0-9Z" fill="#637c86"/><rect x="-46" y="-10" width="23" height="27" rx="10" fill="#7aa9ab" stroke="#dceee2" strokeWidth="3"/><rect x="23" y="-10" width="23" height="27" rx="10" fill="#7aa9ab" stroke="#dceee2" strokeWidth="3"/><circle cy="-5" r="16" fill="#2c6176" stroke="#dceee2" strokeWidth="4"/><path d="M-8-5h16m-8-8v16" stroke="#b9e5df" strokeWidth="3"/></>;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

/** Indicador pixel art sobre cada edificio: número, candado o marca de completado. */
function PixelPin({ state, label }: { state: FacilityState; label: number }) {
  return <g className="earth-base-pin" transform="translate(0 -80)" shapeRendering="crispEdges" aria-hidden="true">
    <path className="earth-base-pin__shadow" d="M-9-3h18v3h-18z" />
    <path className="earth-base-pin__body" d="M-9-27h18v2h4v2h2v14h-2v2h-4v2h-18v-2h-4v-2h-2v-14h2v-2h4Z" />
    <path className="earth-base-pin__tail" d="M-4-5h8v3h-8zm2 3h4v3h-4z" />
    {state === 'completed' && <path className="earth-base-pin__glyph" d="M-7-15h3v3h-3zm3 3h3v3h-3zm3 3h3v3h-3zm3-3h3v-3h-3zm3-3h3v-3h-3zm3-3h3v-3h-3z" />}
    {state === 'locked' && <>
      <path className="earth-base-pin__glyph" d="M-5-17h10v8h-10z" />
      <path className="earth-base-pin__glyph-line" d="M-3-17v-3h6v3" />
    </>}
    {(state === 'available' || state === 'selected') && <text className="earth-base-pin__digit" x="0" y="-9.5" textAnchor="middle">{label}</text>}
  </g>;
}

const BRACKETS = 'M-84-82V-102H-64M64-102H84V-82M84 22V42H64M-64 42H-84V22';
const SPARKS = [[-52, -62], [-20, -90], [18, -78], [54, -58], [-36, -34], [40, -30]] as const;

export function EarthBaseScene({
  cityId, missions, selectedMissionId, completedMissions, missionLimitReached,
  onSelectMission, onOpenMission, onClearSelection, justCompletedId = null, launchReady = false,
}: EarthBaseSceneProps) {
  const { t } = useI18n();
  const arctic = cityId === 'TROMSO';
  const cityName = arctic ? 'Tromsø' : 'Arequipa';
  const background = `/assets/pixel-art/${arctic ? 'arctic-research-base.png' : 'andean-training-complex.png'}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hoverId, setHoverId] = useState<MissionType | null>(null);
  const [focusId, setFocusId] = useState<MissionType | null>(null);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      setSize((previous) => (previous.width === rect.width && previous.height === rect.height
        ? previous
        : { width: rect.width, height: rect.height }));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => computeSceneLayout(size.width, size.height), [size.width, size.height]);
  const measured = size.width > 0 && size.height > 0;

  const facilityName = (mission: EarthMissionDefinition) => t(`map.facilities.${mission.id}.facilityName`);
  const stateOf = (mission: EarthMissionDefinition): FacilityState => {
    if (completedMissions.includes(mission.id)) return 'completed';
    if (missionLimitReached) return 'locked';
    return mission.id === selectedMissionId ? 'selected' : 'available';
  };
  const stateLabel = (state: FacilityState) => (state === 'completed' ? t('common.completed')
    : state === 'locked' ? t('common.locked') : state === 'selected' ? t('common.selected') : t('common.available'));

  const tipId = hoverId ?? focusId;
  const tipIndex = tipId ? missions.findIndex((mission) => mission.id === tipId) : -1;
  const tipMission = tipIndex >= 0 ? missions[tipIndex] : null;
  const tipStyle: CSSProperties | undefined = tipMission ? {
    left: clamp(layout.x + positions[tipIndex].x * layout.scale, 110, Math.max(110, size.width - 110)),
    top: layout.y + (positions[tipIndex].y + 44) * layout.scale,
  } : undefined;

  const stageStyle: CSSProperties = measured
    ? { left: layout.x, top: layout.y, width: layout.width, height: layout.height }
    : { left: 0, top: 0, width: '100%', height: '100%' };

  return <div
    ref={containerRef}
    className={`earth-base-scene ${arctic ? 'earth-base-scene--arctic' : 'earth-base-scene--andes'}`}
    data-letterbox-y={layout.letterboxY || undefined}
    data-letterbox-x={layout.letterboxX || undefined}
    data-letterbox-large={layout.letterboxLarge || undefined}
  >
    <div className="earth-base-scene__ambient" style={{ backgroundImage: `url(${background})` }} aria-hidden="true" />
    <div className="earth-base-scene__stage" style={stageStyle}>
      <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} preserveAspectRatio="none" role="group"
        aria-label={t('map.mapAriaLabel', { city: cityName })}>
        <image className="earth-base-scene__background" href={background} x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT}
          preserveAspectRatio="none" onClick={() => onClearSelection?.()} />

        {launchReady && <g className="earth-base-launch" transform={`translate(${LAUNCH_PAD.x} ${LAUNCH_PAD.y})`} pointerEvents="none">
          <title>{t('map.launchPadReady')}</title>
          <ellipse rx="96" ry="52" />
          <ellipse className="earth-base-launch__inner" rx="70" ry="37" />
        </g>}

        {missions.map((mission, index) => {
          const { x, y } = positions[index];
          const state = stateOf(mission);
          const chosen = mission.id === selectedMissionId;
          const completed = state === 'completed';
          const locked = state === 'locked';
          const celebrating = justCompletedId === mission.id;
          const sprite = spriteFor(mission.id, arctic);
          return <g
            key={mission.id}
            transform={`translate(${x} ${y})`}
            className={`earth-base-facility earth-base-facility--${state}${chosen ? ' earth-base-facility--chosen' : ''}${celebrating ? ' earth-base-facility--just-completed' : ''}`}
            data-facility-id={mission.id}
            data-state={state}
            role="button"
            tabIndex={0}
            aria-pressed={chosen}
            aria-label={`${facilityName(mission)}. ${t(`map.facilities.${mission.id}.name`)}. ${stateLabel(state)}`}
            onClick={() => onSelectMission(mission.id)}
            onDoubleClick={() => { if (!completed && !locked) onOpenMission(mission); }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectMission(mission.id); }
            }}
            onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHoverId(mission.id); }}
            onPointerLeave={() => setHoverId((current) => (current === mission.id ? null : current))}
            onFocus={() => setFocusId(mission.id)}
            onBlur={() => setFocusId((current) => (current === mission.id ? null : current))}
          >
            <rect className="earth-base-facility__hit" x="-84" y="-104" width="168" height="150" />
            <ellipse className="earth-base-facility__shadow" cy="31" rx="84" ry="27" />
            {completed && <ellipse className="earth-base-facility__glow" cy="22" rx="86" ry="30" />}
            <path className="earth-base-facility__brackets" d={BRACKETS} />
            {celebrating && <g className="earth-base-facility__celebration" pointerEvents="none">
              <ellipse className="earth-base-facility__wave" cy="22" rx="60" ry="22" />
              <ellipse className="earth-base-facility__wave earth-base-facility__wave--late" cy="22" rx="60" ry="22" />
              {SPARKS.map(([sx, sy], sparkIndex) => <rect key={sparkIndex} className="earth-base-facility__spark"
                style={{ animationDelay: `${sparkIndex * 0.12}s` }} x={sx} y={sy} width="5" height="5" />)}
            </g>}
            {sprite
              ? <image className="earth-base-facility__sprite" href={`/assets/pixel-art/${sprite}`} x="-75" y="-100" width="150" height="135" preserveAspectRatio="xMidYMid meet" />
              : <g className="earth-base-facility__sprite" transform={arctic && mission.id === 'ARCTIC_GREENHOUSE' ? 'scale(.68)' : undefined}><FacilityArtwork id={mission.id} /></g>}
            <PixelPin state={state} label={index + 1} />
          </g>;
        })}
      </svg>
      <div className="earth-base-scene__light" aria-hidden="true" />
    </div>

    {tipMission && <div className="earth-base-tooltip" style={tipStyle} aria-hidden="true">
      <strong>{facilityName(tipMission)}</strong>
      <span data-state={stateOf(tipMission)}>{stateLabel(stateOf(tipMission))}</span>
    </div>}
  </div>;
}
