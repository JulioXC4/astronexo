import { useState } from 'react';
import { ArrowLeft, CheckCircle, Compass, Crosshair, Play, RocketLaunch, Sparkle } from '@phosphor-icons/react';
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

// Posiciones en el mapa SVG para las 5 instalaciones
const FACILITY_MAP_COORDS = [
  { x: 190, y: 160 }, // Instalación 1 (Noroeste)
  { x: 790, y: 160 }, // Instalación 2 (Noreste)
  { x: 190, y: 440 }, // Instalación 3 (Suroeste)
  { x: 490, y: 440 }, // Instalación 4 (Sur centro)
  { x: 790, y: 440 }, // Instalación 5 (Sureste)
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

  // Derivar las herramientas correspondientes a las misiones completadas
  const derivedTools = completedMissions.map((id) => {
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

      {/* ESCENARIO 2D DEL MAPA (5 INSTALACIONES SVG SEGÚN V3.0) */}
      <div style={{
        background: 'radial-gradient(ellipse at 50% 50%, #173250 0%, #0d1a29 100%)',
        border: '2px solid #365e8c',
        borderRadius: '1.2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        minHeight: '21rem',
        maxHeight: 'calc(100vh - 18rem)',
      }}>
        <svg
          viewBox="0 0 1000 580"
          style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }}
          role="img"
          aria-label="Mapa 2D con las 5 misiones de la base"
        >
          <defs>
            <linearGradient id="roadPattern" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#224268" />
              <stop offset="100%" stopColor="#18314e" />
            </linearGradient>

            <radialGradient id="missionHighlight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f6c15b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f6c15b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Suelo base */}
          <rect width="1000" height="580" fill="#132438" />

          {/* Red de caminos tecnológicos entre las 5 instalaciones */}
          <path
            d="M 190 160 L 490 280 L 790 160 M 190 440 L 490 280 L 790 440 M 490 280 L 490 440"
            fill="none"
            stroke="url(#roadPattern)"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 190 160 L 490 280 L 790 160 M 190 440 L 490 280 L 790 440 M 490 280 L 490 440"
            fill="none"
            stroke="#3a6b9e"
            strokeWidth="2.5"
            strokeDasharray="8 6"
          />

          {/* Núcleo central de coordinación */}
          <circle cx="490" cy="280" r="32" fill="#1c3756" stroke="#4cc3d9" strokeWidth="2" />
          <text x="490" y="285" textAnchor="middle" fontSize="18">🧭</text>

          {/* RENDERIZADO DE LAS 5 INSTALACIONES */}
          {missions.map((m, idx) => {
            const coord = FACILITY_MAP_COORDS[idx] ?? { x: 500, y: 300 };
            const isSelected = selectedMissionIndex === idx;
            const isDone = completedMissions.includes(m.id);
            const isLocked = isThreeDone && !isDone;

            return (
              <g
                key={m.id}
                transform={`translate(${coord.x}, ${coord.y})`}
                style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
                onClick={() => setSelectedMissionIndex(idx)}
              >
                {/* Foco de reflector si está seleccionado */}
                {isSelected && (
                  <ellipse cx="0" cy="15" rx="85" ry="55" fill="url(#missionHighlight)" />
                )}

                {/* Edificio base */}
                <rect
                  x="-65"
                  y="-35"
                  width="130"
                  height="70"
                  rx="10"
                  fill={isDone ? "#193c31" : (isLocked ? "#202a36" : "#203a5a")}
                  stroke={isDone ? "#5bbd78" : (isSelected ? "#f6c15b" : (isLocked ? "#455a64" : "#4a79ad"))}
                  strokeWidth={isSelected ? 3.5 : 2}
                  opacity={isLocked ? 0.6 : 1}
                />

                {/* Icono de la instalación */}
                <text x="0" y="5" textAnchor="middle" fontSize="28">
                  {m.facilityIcon}
                </text>

                {/* Badge de la herramienta que otorga */}
                <rect x="-60" y="-52" width="120" height="18" rx="4" fill="#0d1b2a" stroke="#f6c15b" strokeWidth="1" />
                <text x="0" y="-39" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#f6c15b">
                  + {m.toolLabel}
                </text>

                {/* Badge de estado (Completado / Disponible / Bloqueado) */}
                <circle cx="0" cy="46" r="13" fill={isDone ? "#2e7d32" : (isLocked ? "#455a64" : "#f6c15b")} stroke="#ffffff" strokeWidth="2" />
                <text x="0" y="51" textAnchor="middle" fontSize="11" fontWeight="bold" fill={isDone ? "#ffffff" : "#102033"}>
                  {isDone ? "✓" : (isLocked ? "🔒" : `${idx + 1}`)}
                </text>

                {/* Nombre de la instalación */}
                <text x="0" y="72" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ffffff">
                  {m.facilityName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* HUD TÁCTICO DE LA MISIÓN SELECCIONADA CON TODOS LOS REQUISITOS V3.0 */}
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
        <div style={{ flex: '1 1 24rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <Crosshair weight="bold" color="#f6c15b" size={20} />
            <h2 style={{ margin: 0, fontFamily: 'Fredoka', fontSize: '1.3rem', color: '#ffffff' }}>
              {activeMission.name}
            </h2>

            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '0.4rem',
              background: isCompleted ? '#2e7d32' : '#f6c15b',
              color: isCompleted ? '#ffffff' : '#102033'
            }}>
              {isCompleted ? '✓ COMPLETADA (HERRAMIENTA ASIGNADA)' : 'DISPONIBLE'}
            </span>

            <span style={{ fontSize: '0.8rem', color: '#4cc3d9', fontWeight: 700 }}>
              [{activeMission.scienceSource}]
            </span>
          </div>

          <p style={{ margin: '0.2rem 0', color: '#e0effe', fontSize: '0.9rem', lineHeight: '1.35' }}>
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
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
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

          {isThreeDone && (
            <button
              type="button"
              className="earth-action-btn"
              style={{ padding: '0.85rem 1.8rem', fontSize: '1.1rem' }}
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
