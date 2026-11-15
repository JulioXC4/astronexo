import { useState } from 'react';
import { ArrowLeft, CheckCircle, Compass, Crosshair, Play, RocketLaunch, Sparkle, LockKey } from '@phosphor-icons/react';
import { getMissionsForCity, type EarthMissionDefinition, type MissionType } from '../../../data/missions';
import type { ToolId } from '../../../game/contracts';
import './earth.css';

interface PreparationMapScreenProps {
  readonly cityId: string;
  readonly cityName: string;
  readonly destination: string;
  readonly astronautName: string;
  readonly completedMissions: readonly MissionType[];
  readonly onOpenMission: (mission: EarthMissionDefinition) => void;
  readonly onProceedToLaunch: (derivedTools: readonly ToolId[]) => void;
  readonly onBack: () => void;
}

// Posiciones en el mapa SVG 1000x580 para las 5 instalaciones
// Todas las coordenadas están holgadamente dentro del viewBox (Y entre 90 y 500)
const FACILITY_MAP_COORDS = [
  { x: 250, y: 145 }, // Instalación 1 (Noroeste)
  { x: 750, y: 145 }, // Instalación 2 (Noreste)
  { x: 190, y: 410 }, // Instalación 3 (Suroeste)
  { x: 500, y: 420 }, // Instalación 4 (Sur centro)
  { x: 810, y: 410 }, // Instalación 5 (Sureste)
];

export function PreparationMapScreen({
  cityId,
  cityName,
  destination,
  astronautName,
  completedMissions,
  onOpenMission,
  onProceedToLaunch,
  onBack,
}: PreparationMapScreenProps) {
  const missions = getMissionsForCity(cityId);
  const [selectedMissionIndex, setSelectedMissionIndex] = useState<number>(0);

  const activeMission = missions[selectedMissionIndex] ?? missions[0];
  const isCompleted = completedMissions.includes(activeMission.id);
  const countCompleted = completedMissions.length;
  const isThreeDone = countCompleted >= 3;

  // Derivar las herramientas correspondientes a las misiones completadas (exactamente las ganadas)
  const derivedTools: ToolId[] = completedMissions.map((id) => {
    const found = missions.find((m) => m.id === id);
    return found ? found.targetTool : 'FOLDING_PANELS';
  });

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Briefing</span>
        </button>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="earth-screen__progress-pill">
            <Compass weight="fill" color="#f6c15b" />
            <span>Base: {cityName} ➔ {destination === 'MOON' ? 'Luna' : 'Marte'} ({astronautName})</span>
          </div>

          <div style={{
            background: isThreeDone ? '#1b5e20' : '#142539',
            border: `2px solid ${isThreeDone ? '#69f0ae' : '#f6c15b'}`,
            borderRadius: '2rem',
            padding: '0.35rem 1rem',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: isThreeDone ? '#69f0ae' : '#ffd54f',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            {isThreeDone ? <CheckCircle weight="fill" /> : <Sparkle weight="fill" />}
            <span>Misiones: {countCompleted} de 3 Elegidas {isThreeDone ? '(¡Bodega Completa!)' : ''}</span>
          </div>
        </div>
      </header>

      {/* ESCENARIO 2D DEL MAPA (5 INSTALACIONES SVG RESPONSIVE CON ASPECT RATIO ESTABLE) */}
      <div
        className="prep-map-stage"
        style={{
          width: '100%',
          maxWidth: '980px',
          margin: '0 auto',
          position: 'relative',
          background: 'radial-gradient(ellipse at 50% 50%, #173250 0%, #0d1a29 100%)',
          border: '2px solid #365e8c',
          borderRadius: '1.2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          aspectRatio: '1000 / 580',
          maxHeight: 'clamp(260px, 46vh, 480px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg
          viewBox="0 0 1000 580"
          className="prep-map-svg"
          style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }}
          role="img"
          aria-label="Mapa 2D con las 5 instalaciones y misiones de la base"
        >
          <defs>
            <linearGradient id="roadPattern" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#224268" />
              <stop offset="100%" stopColor="#18314e" />
            </linearGradient>

            <radialGradient id="missionHighlight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f6c15b" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#f6c15b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Terreno base */}
          <rect width="1000" height="580" fill="#132438" />

          {/* Red tecnológica de caminos conectando el núcleo central y las 5 instalaciones */}
          <g stroke="url(#roadPattern)" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Rutas radiales desde el hub central */}
            <path d="M 500 265 L 250 145" />
            <path d="M 500 265 L 750 145" />
            <path d="M 500 265 L 190 410" />
            <path d="M 500 265 L 500 420" />
            <path d="M 500 265 L 810 410" />
            {/* Rutas de interconexión perimetral */}
            <path d="M 190 410 L 500 420 L 810 410" />
            <path d="M 250 145 L 750 145" />
            <path d="M 250 145 L 190 410" />
            <path d="M 750 145 L 810 410" />
          </g>

          {/* Líneas guía luminosas de telemetría sobre las vías */}
          <g stroke="#3a6b9e" strokeWidth="2.5" strokeDasharray="8 6" fill="none">
            <path d="M 500 265 L 250 145" />
            <path d="M 500 265 L 750 145" />
            <path d="M 500 265 L 190 410" />
            <path d="M 500 265 L 500 420" />
            <path d="M 500 265 L 810 410" />
            <path d="M 190 410 L 500 420 L 810 410" />
          </g>

          {/* Núcleo central de coordinación de la base */}
          <circle cx="500" cy="265" r="34" fill="#1c3756" stroke="#4cc3d9" strokeWidth="2.5" />
          <text x="500" y="272" textAnchor="middle" fontSize="20">🧭</text>

          {/* RENDERIZADO ACCESIBLE DE LAS 5 INSTALACIONES */}
          {missions.map((m, idx) => {
            const coord = FACILITY_MAP_COORDS[idx] ?? { x: 500, y: 300 };
            const isSelected = selectedMissionIndex === idx;
            const isDone = completedMissions.includes(m.id);
            const isLocked = isThreeDone && !isDone;

            const statusText = isDone ? 'Completada' : isLocked ? 'Bloqueada (3/3 completadas)' : isSelected ? 'Seleccionada' : 'Disponible';

            return (
              <g
                key={m.id}
                role="button"
                tabIndex={0}
                aria-label={`Instalación ${idx + 1}: ${m.facilityName} (${m.name}). Recompensa: ${m.toolLabel}. Costo: ${m.costDescription}. Estado: ${statusText}`}
                aria-pressed={isSelected}
                transform={`translate(${coord.x}, ${coord.y})`}
                style={{ cursor: isLocked ? 'not-allowed' : 'pointer', outline: 'none' }}
                onClick={() => setSelectedMissionIndex(idx)}
                onFocus={() => setSelectedMissionIndex(idx)}
                onDoubleClick={() => {
                  if (!isDone && !isLocked) onOpenMission(m);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isSelected && !isDone && !isLocked) {
                      onOpenMission(m);
                    } else {
                      setSelectedMissionIndex(idx);
                    }
                  }
                }}
              >
                {/* Resplandor / Foco si está seleccionada */}
                {isSelected && (
                  <ellipse cx="0" cy="15" rx="90" ry="60" fill="url(#missionHighlight)" />
                )}

                {/* Anillo de foco accesible si está seleccionada */}
                {isSelected && (
                  <rect
                    x="-74"
                    y="-39"
                    width="148"
                    height="78"
                    rx="14"
                    fill="none"
                    stroke="#f6c15b"
                    strokeWidth="3"
                    strokeDasharray="6 3"
                  />
                )}

                {/* Edificio base */}
                <rect
                  x="-70"
                  y="-35"
                  width="140"
                  height="70"
                  rx="12"
                  fill={isDone ? "#143d2c" : (isLocked ? "#1a2430" : (isSelected ? "#22466e" : "#1c3452"))}
                  stroke={isDone ? "#69f0ae" : (isSelected ? "#f6c15b" : (isLocked ? "#455a64" : "#3d6c9c"))}
                  strokeWidth={isSelected ? 3.5 : 2}
                  opacity={isLocked ? 0.65 : 1}
                />

                {/* Badge de la herramienta que otorga */}
                <rect
                  x="-65"
                  y="-55"
                  width="130"
                  height="20"
                  rx="5"
                  fill="#0d1b2a"
                  stroke={isDone ? "#69f0ae" : "#f6c15b"}
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-41"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={isDone ? "#a5d6a7" : "#ffd54f"}
                >
                  {isDone ? '✓ ' : '+ '}{m.toolLabel}
                </text>

                {/* Icono de la instalación */}
                <text x="0" y="6" textAnchor="middle" fontSize="28">
                  {m.facilityIcon}
                </text>

                {/* Badge de estado (Completado / Disponible / Bloqueado) */}
                <circle
                  cx="0"
                  cy="46"
                  r="14"
                  fill={isDone ? "#2e7d32" : (isLocked ? "#455a64" : (isSelected ? "#f6c15b" : "#1976d2"))}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x="0"
                  y="51"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill={isDone || !isSelected ? "#ffffff" : "#102033"}
                >
                  {isDone ? "✓" : (isLocked ? "🔒" : `${idx + 1}`)}
                </text>

                {/* Fondo legible para el nombre de la instalación */}
                <rect
                  x="-70"
                  y="65"
                  width="140"
                  height="20"
                  rx="4"
                  fill="#0b1724"
                  fillOpacity="0.88"
                  stroke="#254466"
                  strokeWidth="1"
                />
                {/* Nombre de la instalación */}
                <text
                  x="0"
                  y="79"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#ffffff"
                >
                  {m.facilityName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* HUD TÁCTICO DE LA MISIÓN SELECCIONADA CON TODOS LOS REQUISITOS V3.0 */}
      <section style={{
        maxWidth: '980px',
        margin: '0.8rem auto 0 auto',
        width: '100%',
        boxSizing: 'border-box',
        background: '#132438',
        border: '2px solid #325884',
        borderRadius: '1rem',
        padding: '0.9rem 1.2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.9rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      }}>
        <div style={{ flex: '1 1 24rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <Crosshair weight="bold" color="#f6c15b" size={20} />
            <h2 style={{ margin: 0, fontFamily: 'Fredoka', fontSize: '1.25rem', color: '#ffffff' }}>
              {activeMission.name}
            </h2>

            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '0.4rem',
              background: isCompleted ? '#2e7d32' : (isThreeDone ? '#455a64' : '#f6c15b'),
              color: isCompleted || isThreeDone ? '#ffffff' : '#102033'
            }}>
              {isCompleted ? '✓ COMPLETADA (HERRAMIENTA ASIGNADA)' : (isThreeDone ? '🔒 BODEGA LLENA (3/3)' : 'DISPONIBLE')}
            </span>

            <span style={{ fontSize: '0.8rem', color: '#4cc3d9', fontWeight: 700 }}>
              [{activeMission.scienceSource}]
            </span>
          </div>

          <p style={{ margin: '0.2rem 0', color: '#e0effe', fontSize: '0.88rem', lineHeight: '1.35' }}>
            <strong>Objetivo:</strong> {activeMission.objective}
          </p>

          <div style={{ display: 'flex', gap: '1.2rem', marginTop: '0.4rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
            <span style={{ color: '#69f0ae' }}>
              🎁 <strong>Herramienta:</strong> {activeMission.toolLabel}
            </span>
            <span style={{ color: '#ffb74d' }}>
              ⚖️ <strong>Costo:</strong> {activeMission.costDescription}
            </span>
            <span style={{ color: '#b3e5fc' }}>
              🚀 <strong>Efecto espacial:</strong> {activeMission.effectOnSpaceMission}
            </span>
          </div>
        </div>

        {/* BOTÓN DE ACCIÓN */}
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {!isCompleted && !isThreeDone && (
            <button
              type="button"
              className="facility-card__btn facility-card__btn--gold"
              style={{ padding: '0.8rem 1.6rem', fontSize: '1.05rem' }}
              onClick={() => onOpenMission(activeMission)}
            >
              <Play weight="fill" />
              <span>Ejecutar Misión</span>
            </button>
          )}

          {isCompleted && (
            <span style={{ color: '#69f0ae', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle weight="fill" size={20} /> Kit Asegurado
            </span>
          )}

          {isThreeDone && !isCompleted && (
            <span style={{ color: '#b0bec5', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <LockKey weight="bold" size={18} /> Bodega Completa (3/3)
            </span>
          )}

          {isThreeDone && (
            <button
              type="button"
              className="earth-action-btn"
              style={{ padding: '0.85rem 1.8rem', fontSize: '1.05rem' }}
              onClick={() => onProceedToLaunch(derivedTools)}
            >
              <RocketLaunch weight="fill" />
              <span>¡Proceder al Despegue ({countCompleted}/3 Kits)!</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
