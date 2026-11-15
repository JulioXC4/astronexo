import type { EarthMissionDefinition, MissionType } from '../data/missions';
import './earth-base-scene.css';

export type FacilityState = 'available' | 'selected' | 'completed' | 'locked';

export interface EarthBaseSceneProps {
  readonly cityId: string;
  readonly missions: readonly EarthMissionDefinition[];
  readonly selectedMissionId: MissionType;
  readonly completedMissions: readonly MissionType[];
  readonly missionLimitReached: boolean;
  readonly onSelectMission: (missionId: MissionType) => void;
  readonly onOpenMission: (mission: EarthMissionDefinition) => void;
}

const positions = [
  { x: 205, y: 180 }, { x: 795, y: 180 },
  { x: 200, y: 425 }, { x: 500, y: 430 }, { x: 800, y: 425 },
] as const;

const shortNames: Record<MissionType, readonly [string, string]> = {
  SOLAR_DETECTIVE: ['OBSERVATORIO', 'SOLAR'],
  ALTITUDE_ACCLIMATIZATION: ['CÁMARA DE', 'ALTURA'],
  DARK_MONTHS_RESERVE: ['BANCO DE', 'BATERÍAS'],
  ARCTIC_GREENHOUSE: ['INVERNADERO', 'ÁRTICO'],
  SOLAR_WATCH: ['CLIMA', 'ESPACIAL'],
  ECLSS_TRAINING: ['SOPORTE', 'VITAL'],
  VEGGIE_LAB: ['BIO-DOMO', 'VEGGIE'],
};

function FacilityArtwork({ id }: { id: MissionType }) {
  const base = <><path d="M-75 23 0 48 75 23 0-3Z" fill="#172b3b" /><path d="M-75 23V32L0 57V48ZM75 23V32L0 57V48Z" fill="#365360" /></>;
  if (id === 'SOLAR_DETECTIVE') return <>{base}<path d="M-55 10V-34L0-52 55-34V10L0 29Z" fill="#e8d8ae" stroke="#223d50" strokeWidth="3"/><path d="M-60-35 0-56 60-35 0-16Z" fill="#a76d54"/><path d="M-33-41a33 28 0 0 1 66 0" fill="#76aaba" stroke="#27495c" strokeWidth="4"/><path d="M-34-41h68" stroke="#d9ebdf" strokeWidth="3"/><rect x="-8" y="-62" width="16" height="13" rx="3" fill="#f6c15b"/><path d="M-43-6h21v18h-21zm65 0h21v18H22Z" fill="#2c637d"/></>;
  if (id === 'ALTITUDE_ACCLIMATIZATION') return <>{base}<path d="M-59 12V-32L0-51 59-32V12L0 31Z" fill="#b9d5cb" stroke="#27495c" strokeWidth="3"/><path d="M-62-32 0-54 62-32 0-9Z" fill="#66818a"/><rect x="-25" y="-28" width="50" height="43" rx="21" fill="#355b70" stroke="#e6efdd" strokeWidth="4"/><circle cy="-6" r="10" fill="#7bc7d1"/><path d="M-49-8h15m68 0h15" stroke="#315164" strokeWidth="8"/><path d="M-48 12 0 28 48 12" fill="none" stroke="#688d8c" strokeWidth="3"/></>;
  if (id === 'DARK_MONTHS_RESERVE') return <>{base}<path d="M-61 11V-31L0-48 61-31V11L0 30Z" fill="#9ebbc4" stroke="#284c5e" strokeWidth="3"/><path d="M-66-31 0-52 66-31 0-9Z" fill="#ddf0e6"/><path d="M-42-16h84v29l-42 13-42-13Z" fill="#365b73"/><path d="M-24-8v18m24-18v18m24-18v18" stroke="#a7e0dd" strokeWidth="9"/><path d="M-7-42h14m-7-7v14" stroke="#f6c15b" strokeWidth="4"/></>;
  if (id === 'ARCTIC_GREENHOUSE' || id === 'VEGGIE_LAB') return <>{base}<path d="M-62 17V-16Q-53-56 0-58Q53-56 62-16V17L0 36Z" fill={id === 'ARCTIC_GREENHOUSE' ? '#87c3c0' : '#81c9a9'} stroke="#2d5962" strokeWidth="4"/><path d="M-62-16Q0-9 62-16M0-58V27M-36-45-23 26M36-45 23 26" fill="none" stroke="#dcf1dc" strokeWidth="3"/><path d="M-46 8q8-27 20 0m9 9q8-33 19 0m12-5q8-26 20 0" fill="none" stroke="#477d54" strokeWidth="7" strokeLinecap="round"/><path d="M-61 17 0 36 61 17" fill="none" stroke="#2d5962" strokeWidth="5"/></>;
  if (id === 'SOLAR_WATCH') return <>{base}<path d="M-57 16V-22L0-40 57-22V16L0 34Z" fill="#a5bbc4" stroke="#28495b" strokeWidth="3"/><path d="M-60-22 0-44 60-22 0-3Z" fill="#667e8b"/><path d="M-10-35V-73m-24 15 24 17 24-17M-35-58q25-23 50 0" fill="none" stroke="#e5e9d6" strokeWidth="4"/><circle cx="-10" cy="-73" r="6" fill="#f5bb68"/><rect x="-39" y="-5" width="25" height="19" fill="#4d8492"/><rect x="14" y="-5" width="25" height="19" fill="#4d8492"/></>;
  return <>{base}<path d="M-62 15V-30L0-47 62-30V15L0 34Z" fill="#b1c9c7" stroke="#28495b" strokeWidth="3"/><path d="M-66-30 0-51 66-30 0-9Z" fill="#637c86"/><rect x="-46" y="-10" width="23" height="27" rx="10" fill="#7aa9ab" stroke="#dceee2" strokeWidth="3"/><rect x="23" y="-10" width="23" height="27" rx="10" fill="#7aa9ab" stroke="#dceee2" strokeWidth="3"/><circle cy="-5" r="16" fill="#2c6176" stroke="#dceee2" strokeWidth="4"/><path d="M-8-5h16m-8-8v16" stroke="#b9e5df" strokeWidth="3"/></>;
}

export function EarthBaseScene({ cityId, missions, selectedMissionId, completedMissions, missionLimitReached, onSelectMission, onOpenMission }: EarthBaseSceneProps) {
  const arctic = cityId === 'TROMSO';
  return <div className={`earth-base-scene ${arctic ? 'earth-base-scene--arctic' : 'earth-base-scene--andes'}`}>
    <svg viewBox="0 0 1000 580" preserveAspectRatio="xMidYMid meet" role="group" aria-label={`Mapa de la base de ${arctic ? 'Tromsø' : 'Arequipa'} con cinco instalaciones`}>
      <defs>
        <linearGradient id="base-sky" x2="0" y2="1"><stop stopColor={arctic ? '#254960' : '#497d91'}/><stop offset="1" stopColor={arctic ? '#6a9a9c' : '#e6bd82'}/></linearGradient>
        <linearGradient id="base-ground" x2="0" y2="1"><stop stopColor={arctic ? '#829fa0' : '#ab9d73'}/><stop offset="1" stopColor={arctic ? '#536f76' : '#6b785d'}/></linearGradient>
      </defs>
      <path d="M0 0h1000v580H0Z" fill="url(#base-sky)"/>
      {arctic ? <><path d="M0 188 80 142l60 23 110-80 101 85 102-41 119 54 126-70 106 71 96-36v165H0Z" fill="#c5ddda"/><path d="M0 253 134 196l105 29 142-76 115 79 140-50 151 73 113-30v140H0Z" fill="#83a8ad"/><path d="M50 88q150-38 318-4t320-10 300 1" fill="none" stroke="#91d4bf" strokeOpacity=".5" strokeWidth="30"/></> : <><circle cx="895" cy="86" r="44" fill="#f7d494"/><path d="M0 210 110 154l75 36 140-118 119 127 118-68 129 80 103-105 109 108 97-49v140H0Z" fill="#c9aa83"/><path d="M0 280 142 203l135 45 135-101 125 100 168-56 122 93 173-54v132H0Z" fill="#8d9b87"/></>}
      <path d="M0 280Q245 251 449 296T1000 274V580H0Z" fill="url(#base-ground)"/>
      <path d="M0 318Q225 288 500 317T1000 306" fill="none" stroke={arctic ? '#d5e6dd' : '#c5ad85'} strokeWidth="13" opacity=".6"/>
      <path d="M0 563Q190 470 500 459T1000 562M500 465V292M205 194 500 292 795 194M200 439 500 292 800 439" fill="none" stroke="#405b63" strokeWidth="27" strokeLinecap="round"/>
      <path d="M0 563Q190 470 500 459T1000 562M500 465V292M205 194 500 292 795 194M200 439 500 292 800 439" fill="none" stroke="#a9b5a4" strokeWidth="3" strokeDasharray="13 16" opacity=".75"/>
      <g aria-hidden="true"><path d="M457 279 500 263l43 16v38l-43 16-43-16Z" fill="#d5c9a9" stroke="#3f6170" strokeWidth="4"/><path d="M476 271v-29l24-12 24 12v29" fill="#567d8a" stroke="#d8e9dc" strokeWidth="4"/><path d="M500 228v-26" stroke="#e7e3c7" strokeWidth="4"/><circle cx="500" cy="198" r="6" fill="#f6c15b"/>
        {[74, 386, 633, 924].map((x) => <g key={x} transform={`translate(${x} ${x < 500 ? 344 : 354})`}><path d="M0 8V-24" stroke="#435e58" strokeWidth="5"/><path d="M0-28q-23 0-17-17 13 0 17 12 4-12 17-12 6 17-17 17" fill={arctic ? '#d1e2d6' : '#567d61'}/></g>)}
      </g>
      {missions.map((mission, index) => {
        const { x, y } = positions[index];
        const selected = mission.id === selectedMissionId;
        const completed = completedMissions.includes(mission.id);
        const locked = missionLimitReached && !completed;
        const state: FacilityState = completed ? 'completed' : locked ? 'locked' : selected ? 'selected' : 'available';
        const label = shortNames[mission.id];
        return <g key={mission.id} transform={`translate(${x} ${y})`} className={`earth-base-facility earth-base-facility--${state}`}
          role="button" tabIndex={0} aria-pressed={selected}
          aria-label={`${mission.facilityName}. ${mission.name}. Herramienta: ${mission.toolLabel}. Efecto: ${mission.effectOnSpaceMission} ${completed ? 'Completada' : locked ? 'Bloqueada' : selected ? 'Seleccionada' : 'Disponible'}`}
          onClick={() => onSelectMission(mission.id)} onFocus={() => onSelectMission(mission.id)}
          onDoubleClick={() => { if (!completed && !locked) onOpenMission(mission); }}
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (selected && !completed && !locked) onOpenMission(mission); else onSelectMission(mission.id); } }}>
          <ellipse cy="33" rx="93" ry="34" fill="#1d3340" opacity=".32"/>
          {selected && <ellipse cy="18" rx="94" ry="65" fill="none" stroke="#ffd36b" strokeWidth="4" strokeDasharray="9 5"/>}
          <FacilityArtwork id={mission.id}/>
          <rect x="-75" y="56" width="150" height="47" rx="9" fill="#102b3b" stroke={completed ? '#7adca6' : selected ? '#ffd36b' : '#c3d6cb'} strokeWidth="2"/>
          <text textAnchor="middle" y="74" className="earth-base-facility__name"><tspan x="0">{label[0]}</tspan><tspan x="0" dy="16">{label[1]}</tspan></text>
          <circle cx="63" cy="-52" r="17" fill={completed ? '#2a795b' : locked ? '#455a64' : selected ? '#f6c15b' : '#2d6f8b'} stroke="#eaf4e9" strokeWidth="3"/>
          <text x="63" y="-46" textAnchor="middle" className="earth-base-facility__badge">{completed ? '✓' : locked ? '×' : index + 1}</text>
          <title>{`${mission.facilityName} · ${mission.toolLabel}`}</title>
        </g>;
      })}
    </svg>
  </div>;
}
