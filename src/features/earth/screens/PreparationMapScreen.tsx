import { useState } from 'react';
import { ArrowLeft, Play, Compass, Crosshair } from '@phosphor-icons/react';
import type { TrainingId } from '../../../game/contracts';
import './earth.css';

interface PreparationMapScreenProps {
  readonly cityName: string;
  readonly astronautName: string;
  readonly completedTrainings: readonly TrainingId[];
  readonly onOpenTraining: (trainingId: TrainingId) => void;
  readonly onOpenBackpack: () => void;
  readonly onBack: () => void;
}

type FacilityId = 'OBSERVATORY' | 'WEATHER' | 'ECLSS' | 'BIODOME' | 'LAUNCHPAD';

interface FacilityMeta {
  readonly id: FacilityId;
  readonly name: string;
  readonly source: string;
  readonly roleDescription: string;
  readonly actionLabel: string;
  readonly isCoreTraining: boolean;
  readonly trainingId?: TrainingId;
}

const FACILITIES: readonly FacilityMeta[] = [
  {
    id: 'OBSERVATORY',
    name: 'Observatorio Solar',
    source: 'NASA POWER',
    roleDescription: 'Calibra los paneles solares y calcula la captación de energía fotovoltaica con datos históricos de Lima.',
    actionLabel: 'Entrar a Detective del Sol',
    isCoreTraining: true,
    trainingId: 'SOLAR_DETECTIVE',
  },
  {
    id: 'WEATHER',
    name: 'Centro de Clima Espacial',
    source: 'NASA DONKI',
    roleDescription: 'Monitorea eyecciones de masa coronal (CME) y activa los protocolos de blindaje de la estación.',
    actionLabel: 'Entrar a Vigilante del Sol',
    isCoreTraining: true,
    trainingId: 'SOLAR_WATCH',
  },
  {
    id: 'ECLSS',
    name: 'Hangar de Soporte Vital',
    source: 'NASA ECLSS',
    roleDescription: 'Módulo de filtrado y reciclaje continuo de oxígeno y agua para la tripulación.',
    actionLabel: 'Revisar Sistemas ECLSS',
    isCoreTraining: false,
  },
  {
    id: 'BIODOME',
    name: 'Bio-Domo Hidropónico',
    source: 'NASA Veggie',
    roleDescription: 'Invernadero espacial con iluminación LED optimizada para cultivos lunares.',
    actionLabel: 'Inspeccionar Cultivos',
    isCoreTraining: false,
  },
  {
    id: 'LAUNCHPAD',
    name: 'Plataforma de Despegue & Carga',
    source: 'Misión Lunar',
    roleDescription: 'Carga tu bodega con exactamente 3 kits espaciales y activa la secuencia de lanzamiento.',
    actionLabel: 'Empacar Bodega de Herramientas',
    isCoreTraining: false,
  },
];

export function PreparationMapScreen({
  cityName,
  astronautName,
  completedTrainings,
  onOpenTraining,
  onOpenBackpack,
  onBack,
}: PreparationMapScreenProps) {
  const [selectedFacilityId, setSelectedFacilityId] = useState<FacilityId>('OBSERVATORY');

  const hasSolar = completedTrainings.includes('SOLAR_DETECTIVE');
  const hasWatch = completedTrainings.includes('SOLAR_WATCH');
  const allCoreDone = hasSolar && hasWatch;

  const activeFacility = FACILITIES.find((f) => f.id === selectedFacilityId) ?? FACILITIES[0];

  function getFacilityStatus(id: FacilityId): 'COMPLETED' | 'AVAILABLE' | 'LOCKED' {
    if (id === 'OBSERVATORY') return hasSolar ? 'COMPLETED' : 'AVAILABLE';
    if (id === 'WEATHER') return hasWatch ? 'COMPLETED' : 'AVAILABLE';
    if (id === 'ECLSS' || id === 'BIODOME') return 'COMPLETED'; // Acreditados como soporte
    if (id === 'LAUNCHPAD') return allCoreDone ? 'AVAILABLE' : 'AVAILABLE';
    return 'AVAILABLE';
  }

  function handleActionClick() {
    if (activeFacility.id === 'OBSERVATORY') onOpenTraining('SOLAR_DETECTIVE');
    else if (activeFacility.id === 'WEATHER') onOpenTraining('SOLAR_WATCH');
    else if (activeFacility.id === 'LAUNCHPAD') onOpenBackpack();
  }

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Perfil</span>
        </button>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="earth-screen__progress-pill">
            <Compass weight="fill" color="#f6c15b" />
            <span>Centro Espacial · {cityName} ({astronautName})</span>
          </div>
          <div style={{
            background: '#132338',
            border: '1px solid #3d6494',
            borderRadius: '2rem',
            padding: '0.35rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: allCoreDone ? '#69f0ae' : '#ffd54f'
          }}>
            Certificaciones: {completedTrainings.length} / 2 {allCoreDone ? '★ ¡Listo para el Cohete!' : '★'}
          </div>
        </div>
      </header>

      {/* ESCENARIO 2D DEL MAPA (SVG INTERACTIVO TIPO BASE IKARIAM) */}
      <div style={{
        background: 'radial-gradient(ellipse at 50% 50%, #173250 0%, #0d1a29 100%)',
        border: '2px solid #365e8c',
        borderRadius: '1.2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        maxHeight: 'calc(100vh - 17rem)',
        minHeight: '22rem',
      }}>
        <svg
          viewBox="0 0 1000 600"
          style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }}
          role="img"
          aria-label="Mapa 2D interactivo del Centro Espacial"
        >
          <defs>
            {/* Terreno tecnológico: patrón de pistas y losas de hormigón */}
            <linearGradient id="groundGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a3554" />
              <stop offset="100%" stopColor="#102033" />
            </linearGradient>

            <linearGradient id="pavement" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#224268" />
              <stop offset="100%" stopColor="#18314e" />
            </linearGradient>

            {/* Foco de reflector para edificio seleccionado */}
            <radialGradient id="spotlight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f6c15b" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#f6c15b" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#f6c15b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Suelo base */}
          <rect width="1000" height="600" fill="url(#groundGrad)" />

          {/* Caminos y pistas de hormigón que conectan las instalaciones */}
          <path
            d="M 100 320 L 500 320 L 500 160 L 220 160 M 500 320 L 800 320 L 800 180 M 500 320 L 500 480 L 820 480"
            fill="none"
            stroke="url(#pavement)"
            strokeWidth="38"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 100 320 L 500 320 L 500 160 L 220 160 M 500 320 L 800 320 L 800 180 M 500 320 L 500 480 L 820 480"
            fill="none"
            stroke="#3a6b9e"
            strokeWidth="3"
            strokeDasharray="10 8"
          />

          {/* ============================================================== */}
          {/* 1. EDIFICIO: OBSERVATORIO SOLAR (T1)                           */}
          {/* ============================================================== */}
          <g
            transform="translate(200, 150)"
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedFacilityId('OBSERVATORY')}
          >
            {selectedFacilityId === 'OBSERVATORY' && (
              <ellipse cx="0" cy="20" rx="90" ry="60" fill="url(#spotlight)" />
            )}
            {/* Base del edificio */}
            <rect x="-65" y="-30" width="130" height="70" rx="12" fill="#203d61" stroke={hasSolar ? "#5bbd78" : "#f6c15b"} strokeWidth={selectedFacilityId === 'OBSERVATORY' ? 3.5 : 2} />
            {/* Cúpula astronómica */}
            <path d="M -45 -30 A 45 45 0 0 1 45 -30 Z" fill="#2d5584" stroke="#4cc3d9" strokeWidth="2" />
            {/* Telescopio solar */}
            <rect x="-8" y="-70" width="16" height="45" rx="4" transform="rotate(-25)" fill="#ffffff" stroke="#102033" strokeWidth="2" />
            <circle cx="12" cy="-68" r="8" fill="#f6c15b" />
            {/* Paneles solares en el lateral */}
            <g transform="translate(-80, 0) rotate(-15)">
              <rect x="0" y="0" width="30" height="20" fill="#1b4d82" stroke="#4cc3d9" strokeWidth="1.5" />
              <line x1="15" y1="0" x2="15" y2="20" stroke="#4cc3d9" />
            </g>
            {/* Indicador de estado */}
            <circle cx="0" cy="50" r="14" fill={hasSolar ? "#2e7d32" : "#f6c15b"} stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="55" textAnchor="middle" fontSize="12" fontWeight="bold" fill={hasSolar ? "#ffffff" : "#102033"}>
              {hasSolar ? "✓" : "1"}
            </text>
            <text x="0" y="75" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ffffff">
              Observatorio Solar
            </text>
          </g>

          {/* ============================================================== */}
          {/* 2. EDIFICIO: CENTRO DE CLIMA ESPACIAL (T2)                    */}
          {/* ============================================================== */}
          <g
            transform="translate(800, 170)"
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedFacilityId('WEATHER')}
          >
            {selectedFacilityId === 'WEATHER' && (
              <ellipse cx="0" cy="20" rx="90" ry="60" fill="url(#spotlight)" />
            )}
            {/* Base del centro */}
            <rect x="-65" y="-20" width="130" height="65" rx="10" fill="#2b2d56" stroke={hasWatch ? "#5bbd78" : "#ba68c8"} strokeWidth={selectedFacilityId === 'WEATHER' ? 3.5 : 2} />
            {/* Torre y antena parabólica DONKI */}
            <line x1="0" y1="-20" x2="0" y2="-65" stroke="#ffffff" strokeWidth="4" />
            <path d="M -28 -75 Q 0 -55 28 -75" fill="none" stroke="#ba68c8" strokeWidth="5" strokeLinecap="round" />
            <circle cx="0" cy="-65" r="4" fill="#f6c15b" />
            {/* Ondas de radar activas */}
            <path d="M -15 -90 Q 0 -80 15 -90" fill="none" stroke="#f6c15b" strokeWidth="2" opacity="0.8">
              <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" repeatCount="indefinite" />
            </path>
            {/* Indicador de estado */}
            <circle cx="0" cy="54" r="14" fill={hasWatch ? "#2e7d32" : "#ba68c8"} stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="59" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ffffff">
              {hasWatch ? "✓" : "2"}
            </text>
            <text x="0" y="79" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ffffff">
              Clima Espacial
            </text>
          </g>

          {/* ============================================================== */}
          {/* 3. EDIFICIO: HANGAR DE SOPORTE VITAL (ECLSS)                   */}
          {/* ============================================================== */}
          <g
            transform="translate(180, 430)"
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedFacilityId('ECLSS')}
          >
            {selectedFacilityId === 'ECLSS' && (
              <ellipse cx="0" cy="20" rx="90" ry="60" fill="url(#spotlight)" />
            )}
            {/* Hangar industrial */}
            <rect x="-65" y="-30" width="130" height="70" rx="8" fill="#1b394d" stroke="#4cc3d9" strokeWidth={selectedFacilityId === 'ECLSS' ? 3.5 : 2} />
            {/* Dos tanques esféricos de oxígeno/agua */}
            <circle cx="-35" cy="-25" r="22" fill="#2d6484" stroke="#7cb5c8" strokeWidth="2" />
            <circle cx="35" cy="-25" r="22" fill="#2d6484" stroke="#7cb5c8" strokeWidth="2" />
            <text x="-35" y="-20" textAnchor="middle" fontSize="12" fill="#ffffff" fontWeight="bold">O₂</text>
            <text x="35" y="-20" textAnchor="middle" fontSize="12" fill="#ffffff" fontWeight="bold">H₂O</text>
            <line x1="-13" y1="-25" x2="13" y2="-25" stroke="#7cb5c8" strokeWidth="3" />
            {/* Indicador */}
            <circle cx="0" cy="50" r="12" fill="#2e7d32" stroke="#ffffff" strokeWidth="1.5" />
            <text x="0" y="54" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">✓</text>
            <text x="0" y="74" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ffffff">
              Soporte Vital
            </text>
          </g>

          {/* ============================================================== */}
          {/* 4. EDIFICIO: BIO-DOMO DE CULTIVOS                             */}
          {/* ============================================================== */}
          <g
            transform="translate(480, 430)"
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedFacilityId('BIODOME')}
          >
            {selectedFacilityId === 'BIODOME' && (
              <ellipse cx="0" cy="20" rx="85" ry="55" fill="url(#spotlight)" />
            )}
            {/* Cúpula transparente */}
            <ellipse cx="0" cy="-10" rx="55" ry="42" fill="rgba(76, 175, 80, 0.25)" stroke="#66bb6a" strokeWidth={selectedFacilityId === 'BIODOME' ? 3.5 : 2} />
            {/* Líneas geodésicas de la cúpula */}
            <line x1="-50" y1="-10" x2="50" y2="-10" stroke="#81c784" strokeWidth="1" opacity="0.6" />
            <line x1="0" y1="-52" x2="0" y2="32" stroke="#81c784" strokeWidth="1" opacity="0.6" />
            {/* Plantas interiores */}
            <text x="0" y="4" textAnchor="middle" fontSize="24">🌱</text>
            {/* Base */}
            <rect x="-45" y="15" width="90" height="20" rx="4" fill="#213d2f" stroke="#66bb6a" strokeWidth="1.5" />
            {/* Indicador */}
            <circle cx="0" cy="45" r="12" fill="#2e7d32" stroke="#ffffff" strokeWidth="1.5" />
            <text x="0" y="49" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">✓</text>
            <text x="0" y="68" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ffffff">
              Bio-Cultivos
            </text>
          </g>

          {/* ============================================================== */}
          {/* 5. PLATAFORMA DE LANZAMIENTO & CARGA                          */}
          {/* ============================================================== */}
          <g
            transform="translate(800, 430)"
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedFacilityId('LAUNCHPAD')}
          >
            {selectedFacilityId === 'LAUNCHPAD' && (
              <ellipse cx="0" cy="30" rx="100" ry="70" fill="url(#spotlight)" />
            )}
            {/* Plataforma circular de lanzamiento */}
            <ellipse cx="0" cy="30" rx="75" ry="38" fill="#303b47" stroke={allCoreDone ? "#f6c15b" : "#455a64"} strokeWidth={selectedFacilityId === 'LAUNCHPAD' ? 4 : 2} />
            {/* Torre gantry */}
            <line x1="-35" y1="30" x2="-35" y2="-65" stroke="#e53935" strokeWidth="5" />
            <line x1="-35" y1="-50" x2="0" y2="-50" stroke="#e53935" strokeWidth="3" />
            {/* Cohete vertical listo */}
            <g transform="translate(0, 5)">
              {/* Cuerpo del cohete */}
              <path d="M 0 -85 Q 16 -60 16 0 L -16 0 Q -16 -60 0 -85 Z" fill="#ffffff" stroke="#102033" strokeWidth="2" />
              {/* Aletas */}
              <path d="M -16 -15 L -28 5 L -16 0 Z" fill="#d32f2f" />
              <path d="M 16 -15 L 28 5 L 16 0 Z" fill="#d32f2f" />
              <circle cx="0" cy="-35" r="5" fill="#4cc3d9" />
              <rect x="-10" y="-12" width="20" height="8" rx="2" fill="#d32f2f" />
            </g>
            {/* Indicador de estado */}
            <circle cx="0" cy="74" r="14" fill={allCoreDone ? "#f6c15b" : "#37474f"} stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="79" textAnchor="middle" fontSize="12" fontWeight="bold" fill={allCoreDone ? "#102033" : "#ffffff"}>
              {allCoreDone ? "★" : "🔒"}
            </text>
            <text x="0" y="98" textAnchor="middle" fontSize="13" fontWeight="bold" fill={allCoreDone ? "#ffd54f" : "#b0bec5"}>
              Hangar & Despegue
            </text>
          </g>

        </svg>
      </div>

      {/* HUD TÁCTICO FLOTANTE DE LA INSTALACIÓN SELECCIONADA */}
      <section style={{
        marginTop: '0.8rem',
        background: '#132438',
        border: '2px solid #325884',
        borderRadius: '1rem',
        padding: '1rem 1.4rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      }}>
        <div style={{ flex: '1 1 20rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <Crosshair weight="bold" color="#f6c15b" size={20} />
            <h2 style={{ margin: 0, fontFamily: 'Fredoka', fontSize: '1.35rem', color: '#ffffff' }}>
              {activeFacility.name}
            </h2>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '0.4rem',
              background: getFacilityStatus(activeFacility.id) === 'COMPLETED' ? '#2e7d32' : '#f6c15b',
              color: getFacilityStatus(activeFacility.id) === 'COMPLETED' ? '#ffffff' : '#102033'
            }}>
              {getFacilityStatus(activeFacility.id) === 'COMPLETED' ? '✓ CERTIFICADO' : 'MISIÓN DISPONIBLE'}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#7cb5c8', fontWeight: 700 }}>
              [{activeFacility.source}]
            </span>
          </div>
          <p style={{ margin: 0, color: '#bed4ea', fontSize: '0.92rem', lineHeight: '1.35' }}>
            {activeFacility.roleDescription}
          </p>
        </div>

        <div>
          <button
            type="button"
            className="earth-action-btn"
            style={{ padding: '0.85rem 1.8rem', fontSize: '1.1rem' }}
            onClick={handleActionClick}
          >
            <Play weight="fill" />
            <span>{activeFacility.actionLabel}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
